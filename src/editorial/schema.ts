import { z } from "zod";
const text = z.string().max(50000),
  id = z
    .string()
    .min(1)
    .max(180)
    .regex(/^[A-Za-z0-9_.:-]+$/),
  ids = z.array(id).max(500);
export const sourceSchema = z.object({
  id,
  title: text,
  url: text,
  kind: text,
  note: text.optional(),
  verification: text.optional(),
  accessedAt: text.optional(),
});
const optionSchema = z.object({ id, text, correct: z.boolean(), why: text });
const questionSchema = z.object({
  prompt: text,
  type: z.enum(["single", "multi"]),
  options: z.array(optionSchema).min(2).max(24),
  explanation: text,
  sourceIds: ids,
});
export const moduleSchema = z.object({
  id,
  title: text,
  summary: text,
  sourceIds: ids,
  toolQuestion: questionSchema,
  applicationQuestion: questionSchema,
});
const domainSchema = z.object({
  id,
  label: text,
  moduleId: id,
  required: z.boolean(),
  rationale: text,
  cue: text,
  sourceIds: ids,
});
const provenanceSchema = z.object({
  kind: z.literal("synthetic"),
  blueprintId: id,
  contextId: id,
  focusId: id,
  focusLabel: text,
  reviewStatus: text,
});
export const caseSchema = z.object({
  id,
  disease: text,
  title: text,
  profile: z.record(z.string().max(120), z.union([text, z.number().finite()])),
  story: text,
  goals: z.array(text).max(40),
  domains: z.array(domainSchema).max(50),
  sourceIds: ids,
  provenance: provenanceSchema.optional(),
});
export const bundleSchema = z.object({
  case: caseSchema,
  modules: z.array(moduleSchema).max(100),
  sources: z.array(sourceSchema).max(500),
});
export type CaseBundle = z.infer<typeof bundleSchema>;
export interface ReviewNote {
  id: string;
  caseId: string;
  scope: string;
  body: string;
  blocking: boolean;
  state: "open" | "resolved";
  createdAt: number;
  resolvedAt?: number;
  resolution?: string;
}
export interface Approval {
  revision: number;
  fingerprint: string;
  approvedAt: number;
}
export interface ReviewRecord {
  caseId: string;
  revision: number;
  draft: CaseBundle;
  updatedAt: number;
  status: "draft" | "changes_requested" | "approved";
  approval: Approval | null;
}
export interface ReviewSummary {
  caseId: string;
  revision: number;
  updatedAt: number;
  status: ReviewRecord["status"];
  title: string;
  disease: string;
  goal: string;
  searchText: string;
  approved: boolean;
}
export interface ReviewEvent {
  id: string;
  caseId: string;
  revision: number;
  action: "save" | "approve" | "withdraw" | "note" | "resolve" | "import";
  at: number;
  message: string;
}
export interface StoredRevision {
  id: string;
  caseId: string;
  revision: number;
  bundle: CaseBundle;
  at: number;
}
export interface Backup {
  schema: 1;
  kind: "ftr-editorial-backup";
  exportedAt: string;
  records: ReviewRecord[];
  notes: ReviewNote[];
  events: ReviewEvent[];
  revisions: StoredRevision[];
}
export const noteSchema = z.object({
  id,
  caseId: id,
  scope: z.string().min(1).max(400),
  body: z.string().min(1).max(20000),
  blocking: z.boolean(),
  state: z.enum(["open", "resolved"]),
  createdAt: z.number().finite().nonnegative(),
  resolvedAt: z.number().finite().nonnegative().optional(),
  resolution: z.string().max(20000).optional(),
});
const approvalSchema = z.object({
  revision: z.number().int().nonnegative(),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  approvedAt: z.number().finite().nonnegative(),
});
export const recordSchema = z.object({
  caseId: id,
  revision: z.number().int().nonnegative(),
  draft: bundleSchema,
  updatedAt: z.number().finite().nonnegative(),
  status: z.enum(["draft", "changes_requested", "approved"]),
  approval: approvalSchema.nullable(),
});
const eventSchema = z.object({
  id,
  caseId: id,
  revision: z.number().int().nonnegative(),
  action: z.enum(["save", "approve", "withdraw", "note", "resolve", "import"]),
  at: z.number().finite().nonnegative(),
  message: z.string().max(10000),
});
export const backupSchema = z.object({
  schema: z.literal(1),
  kind: z.literal("ftr-editorial-backup"),
  exportedAt: z.string().datetime(),
  records: z.array(recordSchema).max(5000),
  notes: z.array(noteSchema).max(50000),
  events: z.array(eventSchema).max(100000),
  revisions: z
    .array(
      z.object({
        id,
        caseId: id,
        revision: z.number().int().nonnegative(),
        bundle: bundleSchema,
        at: z.number().finite().nonnegative(),
      }),
    )
    .max(50000),
});

export function validationIssues(bundle: CaseBundle): string[] {
  const errors: string[] = [],
    add = (v: boolean, msg: string) => {
      if (!v) errors.push(msg);
    },
    unique = (values: string[]) => new Set(values).size === values.length;
  const c = bundle.case,
    modules = new Map(bundle.modules.map((m) => [m.id, m])),
    sources = new Map(bundle.sources.map((s) => [s.id, s]));
  add(!!c.title.trim(), "Vaka başlığı boş bırakılamaz.");
  add(!!c.disease.trim(), "Klinik alan boş bırakılamaz.");
  add(c.story.trim().length >= 40, "Vaka öyküsü en az 40 karakter olmalı.");
  add(
    c.goals.length > 0 && c.goals.every((g) => g.trim().length > 0),
    "En az bir dolu görüşme hedefi gerekli.",
  );
  add(
    c.domains.filter((d) => d.required).length > 0,
    "En az bir öncelikli değerlendirme alanı gerekli.",
  );
  add(
    c.domains.some((d) => !d.required),
    "En az bir öncelik dışı değerlendirme alanı gerekli.",
  );
  add(
    unique(c.domains.map((d) => d.id)),
    "Değerlendirme alanı kimlikleri tekrarlanamaz.",
  );
  add(
    unique(c.domains.map((d) => d.moduleId)),
    "Aynı modül tek vakada iki alana bağlanamaz.",
  );
  add(
    unique(bundle.modules.map((m) => m.id)),
    "Modül kimlikleri tekrarlanamaz.",
  );
  add(
    unique(bundle.sources.map((s) => s.id)),
    "Kaynak kimlikleri tekrarlanamaz.",
  );
  const refs = (list: string[], where: string) => {
    add(list.length > 0, `${where}: kaynak seçilmeli.`);
    for (const key of list)
      add(sources.has(key), `${where}: ${key} kaynağı bulunamadı.`);
  };
  refs(c.sourceIds, "Vaka");
  for (const s of bundle.sources) {
    add(!!s.title.trim(), `${s.id}: kaynak başlığı boş.`);
    try {
      add(
        new URL(s.url).protocol === "https:",
        `${s.id}: kaynak bağlantısı HTTPS olmalı.`,
      );
    } catch {
      errors.push(`${s.id}: kaynak bağlantısı geçersiz.`);
    }
  }
  for (const d of c.domains) {
    add(!!d.label.trim(), `${d.id}: alan adı boş.`);
    add(!!d.rationale.trim(), `${d.id}: gerekçe boş.`);
    add(!!d.cue.trim(), `${d.id}: vaka dayanağı boş.`);
    add(modules.has(d.moduleId), `${d.label}: modül bulunamadı.`);
    refs(d.sourceIds, d.label);
  }
  for (const m of bundle.modules) {
    add(!!m.title.trim(), `${m.id}: modül başlığı boş.`);
    refs(m.sourceIds, m.title);
    for (const [part, q] of [
      ["Araç", m.toolQuestion],
      ["Uygulama", m.applicationQuestion],
    ] as const) {
      const name = `${m.title} / ${part}`;
      add(!!q.prompt.trim(), `${name}: soru boş.`);
      add(!!q.explanation.trim(), `${name}: açıklama boş.`);
      add(
        unique(q.options.map((o) => o.id)),
        `${name}: seçenek kimlikleri tekrarlanıyor.`,
      );
      const n = q.options.filter((o) => o.correct).length;
      add(
        q.type === "single" ? n === 1 : n >= 2,
        `${name}: ${q.type === "single" ? "tam bir" : "en az iki"} doğru seçenek gerekli.`,
      );
      add(n < q.options.length, `${name}: en az bir yanlış seçenek gerekli.`);
      add(
        q.options.every((o) => o.text.trim() && o.why.trim()),
        `${name}: her seçeneğin metni ve gerekçesi dolu olmalı.`,
      );
      refs(q.sourceIds, name);
    }
  }
  return [...new Set(errors)];
}
export function assertPublishable(bundle: CaseBundle) {
  const errors = validationIssues(bundle);
  if (errors.length) throw Error(errors.slice(0, 5).join("\n"));
}
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
        .map(
          (k) =>
            JSON.stringify(k) +
            ":" +
            canonical((value as Record<string, unknown>)[k]),
        )
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
export async function digest(value: unknown) {
  const bytes = new TextEncoder().encode(canonical(value));
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export function normalizeBundle(raw: unknown): CaseBundle {
  const b = bundleSchema.parse(raw);
  b.modules.sort((a, c) => a.id.localeCompare(c.id));
  b.sources.sort((a, c) => a.id.localeCompare(c.id));
  return b;
}
export async function fingerprint(bundle: CaseBundle) {
  return digest(normalizeBundle(bundle));
}
