import { z } from "zod";
import type { Bank } from "../domain/types.ts";
import {
  caseSchema,
  moduleSchema,
  sourceSchema,
  normalizeBundle,
  assertPublishable,
  fingerprint,
  digest,
  validationIssues,
  canonical,
} from "./schema.ts";
import type { CaseBundle, ReviewRecord, ReviewNote } from "./schema.ts";
export const releaseSchema = z.object({
  schema: z.literal(1),
  kind: z.literal("ftr-approved-release"),
  exportedAt: z.string().datetime(),
  bank: z.object({
    version: z.string(),
    reviewDate: z.string(),
    cases: z.array(caseSchema).max(5000),
    modules: z.array(moduleSchema).max(50000),
    sources: z.array(sourceSchema).max(100000),
  }),
  approvals: z
    .array(
      z.object({
        caseId: z.string(),
        revision: z.number().int().nonnegative(),
        approvedAt: z.number().finite().nonnegative(),
        fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
      }),
    )
    .max(5000),
});
export type PublishedRelease = z.infer<typeof releaseSchema>;
export function bundleFromBank(bank: Bank, caseId: string): CaseBundle {
  const c = bank.cases.find((c) => c.id === caseId);
  if (!c) throw Error("Vaka bulunamadı.");
  const moduleIds = new Set(c.domains.map((d) => d.moduleId)),
    modules = bank.modules.filter((m) => moduleIds.has(m.id));
  const sourceIds = new Set([
    ...c.sourceIds,
    ...c.domains.flatMap((d) => d.sourceIds),
    ...modules.flatMap((m) => [
      ...m.sourceIds,
      ...m.toolQuestion.sourceIds,
      ...m.applicationQuestion.sourceIds,
    ]),
  ]);
  return normalizeBundle({
    case: c,
    modules,
    sources: bank.sources.filter((s) => sourceIds.has(s.id)),
  });
}
export async function compileRelease(
  records: ReviewRecord[],
  notes: ReviewNote[],
  now = new Date(),
): Promise<PublishedRelease> {
  const cases: Bank["cases"] = [],
    modules = new Map<string, Bank["modules"][number]>(),
    sources = new Map<string, Bank["sources"][number]>(),
    approved: ReviewRecord[] = [];
  for (const r of [...records].sort((a, b) =>
    a.caseId.localeCompare(b.caseId),
  )) {
    if (r.status !== "approved" || !r.approval) continue;
    if (r.caseId !== r.draft.case.id || r.approval.revision !== r.revision)
      throw Error(`${r.caseId}: onay güncel taslakla eşleşmiyor.`);
    if (
      notes.some(
        (n) => n.caseId === r.caseId && n.blocking && n.state === "open",
      )
    )
      throw Error(`${r.caseId}: açık düzeltme notu var.`);
    const draft = normalizeBundle(r.draft);
    assertPublishable(draft);
    if ((await fingerprint(draft)) !== r.approval.fingerprint)
      throw Error(`${r.caseId}: onaydan sonra içerik değişmiş.`);
    const b = bundleFromBank(
      {
        version: "draft",
        reviewDate: "",
        cases: [draft.case],
        modules: draft.modules,
        sources: draft.sources,
      },
      r.caseId,
    );
    const sourceIds = new Map<string, string>();
    for (const s of b.sources) {
      const key = "s-" + (await digest({ ...s, id: "" })).slice(0, 32);
      sourceIds.set(s.id, key);
      sources.set(key, { ...s, id: key });
    }
    const mapSources = (ids: string[]) =>
      ids.map((id) => {
        const key = sourceIds.get(id);
        if (!key) throw Error("Kaynak bulunamadı: " + id);
        return key;
      });
    const moduleIds = new Map<string, string>();
    for (const m of b.modules) {
      const content = {
        ...m,
        id: "",
        sourceIds: mapSources(m.sourceIds),
        toolQuestion: {
          ...m.toolQuestion,
          sourceIds: mapSources(m.toolQuestion.sourceIds),
        },
        applicationQuestion: {
          ...m.applicationQuestion,
          sourceIds: mapSources(m.applicationQuestion.sourceIds),
        },
      };
      const key = "m-" + (await digest(content)).slice(0, 32);
      moduleIds.set(m.id, key);
      modules.set(key, { ...content, id: key });
    }
    const c = structuredClone(b.case);
    c.sourceIds = mapSources(c.sourceIds);
    c.domains = c.domains.map((d) => ({
      ...d,
      moduleId: moduleIds.get(d.moduleId)!,
      sourceIds: mapSources(d.sourceIds),
    }));
    if (c.provenance)
      c.provenance.reviewStatus =
        "Kullanıcı tarafından onaylandı. Bağımsız klinik uzman onayı anlamına gelmez.";
    cases.push(c);
    approved.push(r);
  }
  const bank: Bank = {
    version: "pending",
    reviewDate: new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      dateStyle: "long",
    }).format(now),
    cases,
    modules: [...modules.values()].sort((a, b) => a.id.localeCompare(b.id)),
    sources: [...sources.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
  const hash = await digest({
    cases: bank.cases,
    modules: bank.modules,
    sources: bank.sources,
  });
  bank.version = "5.0.0-" + hash.slice(0, 16);
  const approvals = [];
  for (const r of approved)
    approvals.push({
      caseId: r.caseId,
      revision: r.revision,
      approvedAt: r.approval!.approvedAt,
      fingerprint: await fingerprint(bundleFromBank(bank, r.caseId)),
    });
  return {
    schema: 1,
    kind: "ftr-approved-release",
    exportedAt: now.toISOString(),
    bank,
    approvals,
  };
}
export async function validateRelease(raw: unknown): Promise<PublishedRelease> {
  const r = releaseSchema.parse(raw);
  if (canonical(raw) !== canonical(r))
    throw Error("Yayın dosyasında tanımsız veya özel alan var.");
  const unique = (xs: string[]) => new Set(xs).size === xs.length;
  if (
    !unique(r.bank.cases.map((c) => c.id)) ||
    !unique(r.bank.modules.map((m) => m.id)) ||
    !unique(r.bank.sources.map((s) => s.id)) ||
    !unique(r.approvals.map((a) => a.caseId))
  )
    throw Error("Yayın paketinde yinelenen kimlik var.");
  if (r.approvals.length !== r.bank.cases.length)
    throw Error("Her yayımlanan vaka için bir onay kaydı gerekli.");
  for (const c of r.bank.cases) {
    const a = r.approvals.find((a) => a.caseId === c.id);
    if (!a) throw Error(c.id + ": onay yok.");
    const b = bundleFromBank(r.bank, c.id);
    if (validationIssues(b).length)
      throw Error(c.id + ": içerik denetimi geçmedi.");
    if ((await fingerprint(b)) !== a.fingerprint)
      throw Error(c.id + ": içerik onayla eşleşmiyor.");
  }
  const usedModules = new Set(
    r.bank.cases.flatMap((c) => c.domains.map((d) => d.moduleId)),
  );
  if (r.bank.modules.some((m) => !usedModules.has(m.id)))
    throw Error("Yayın paketinde vakaya bağlı olmayan modül var.");
  const usedSources = new Set(
    r.bank.cases.flatMap((c) => {
      const b = bundleFromBank(r.bank, c.id);
      return b.sources.map((s) => s.id);
    }),
  );
  if (r.bank.sources.some((s) => !usedSources.has(s.id)))
    throw Error("Yayın paketinde vakaya bağlı olmayan kaynak var.");
  const hash = await digest({
    cases: r.bank.cases,
    modules: r.bank.modules,
    sources: r.bank.sources,
  });
  if (r.bank.version !== "5.0.0-" + hash.slice(0, 16))
    throw Error("Yayın sürümü içerikle eşleşmiyor.");
  return r;
}
