import Dexie, { type Table } from "dexie";
import {
  backupSchema,
  normalizeBundle,
  fingerprint,
  canonical,
  assertPublishable,
  noteSchema,
} from "./schema.ts";
import type {
  CaseBundle,
  ReviewRecord,
  ReviewSummary,
  ReviewNote,
  ReviewEvent,
  StoredRevision,
  Backup,
} from "./schema.ts";
import { compileRelease } from "./release.ts";
export interface EditorialRepository {
  listRecords(): Promise<ReviewRecord[]>;
  listSummaries(): Promise<ReviewSummary[]>;
  load(caseId: string): Promise<ReviewRecord>;
  save(
    caseId: string,
    bundle: CaseBundle,
    expectedRevision: number,
  ): Promise<ReviewRecord>;
  approve(caseId: string, expectedRevision: number): Promise<ReviewRecord>;
  withdraw(caseId: string, expectedRevision: number): Promise<void>;
  listNotes(caseId?: string): Promise<ReviewNote[]>;
  addNote(
    caseId: string,
    scope: string,
    body: string,
    blocking: boolean,
  ): Promise<void>;
  resolveNote(id: string, resolution: string): Promise<void>;
  listEvents(caseId: string): Promise<ReviewEvent[]>;
  getRevisions(caseId: string): Promise<StoredRevision[]>;
  backup(): Promise<Backup>;
  importBackup(
    raw: unknown,
    restoreApprovals: boolean,
  ): Promise<{ imported: number; skipped: number }>;
  release(): ReturnType<typeof compileRelease>;
}
const recordSummary = (r: ReviewRecord): ReviewSummary => ({
  caseId: r.caseId,
  revision: r.revision,
  updatedAt: r.updatedAt,
  status: r.status,
  title: r.draft.case.title,
  disease: r.draft.case.disease,
  goal: r.draft.case.goals[0] || "",
  searchText: [
    r.caseId,
    r.draft.case.title,
    r.draft.case.disease,
    r.draft.case.story,
    ...r.draft.case.goals,
  ]
    .join(" ")
    .toLocaleLowerCase("tr"),
  approved:
    r.status === "approved" &&
    !!r.approval &&
    r.approval.revision === r.revision,
});
export class EditorialDatabase extends Dexie {
  records!: Table<ReviewRecord, string>;
  summaries!: Table<ReviewSummary, string>;
  notes!: Table<ReviewNote, string>;
  events!: Table<ReviewEvent, string>;
  revisions!: Table<StoredRevision, string>;
  constructor(name = "ftr-atlas-editorial-v1") {
    super(name);
    this.version(1).stores({
      records: "caseId,status,updatedAt",
      notes: "id,caseId,state,[caseId+state]",
      events: "id,caseId,at",
      revisions: "id,caseId,[caseId+revision]",
    });
    this.version(2)
      .stores({ summaries: "caseId,status,disease,updatedAt" })
      .upgrade(async (tx) => {
        const rows = await tx.table<ReviewRecord>("records").toArray();
        await tx.table("summaries").bulkPut(rows.map(recordSummary));
      });
  }
}
export function createEditorialRepository(
  seed: (id: string) => CaseBundle,
  db = new EditorialDatabase(),
): EditorialRepository {
  const event = (
    caseId: string,
    revision: number,
    action: ReviewEvent["action"],
    message: string,
  ): ReviewEvent => ({
    id: crypto.randomUUID(),
    caseId,
    revision,
    action,
    at: Date.now(),
    message,
  });
  const load = async (caseId: string): Promise<ReviewRecord> =>
    (await db.records.get(caseId)) || {
      caseId,
      revision: 0,
      draft: normalizeBundle(seed(caseId)),
      updatedAt: 0,
      status: "draft",
      approval: null,
    };
  const putRecord = async (r: ReviewRecord) => {
    await db.records.put(r);
    await db.summaries.put(recordSummary(r));
  };
  const check = (r: ReviewRecord | undefined, expected: number) => {
    if ((r?.revision || 0) !== expected)
      throw Error(
        "Bu vaka başka bir sekmede değişti. Önce güncel sürümü yükle; değişikliklerini kopyalayarak koruyabilirsin.",
      );
  };
  const api: EditorialRepository = {
    listRecords: () => db.records.toArray(),
    listSummaries: () => db.summaries.toArray(),
    load,
    save: async (caseId, raw, expected) => {
      const draft = normalizeBundle(raw);
      if (draft.case.id !== caseId) throw Error("Vaka kimliği değiştirilemez.");
      seed(caseId);
      return db.transaction(
        "rw",
        db.summaries,
        db.records,
        db.revisions,
        db.events,
        db.notes,
        async () => {
          const current = await db.records.get(caseId);
          check(current, expected);
          if (current && canonical(current.draft) === canonical(draft))
            return current;
          const revision = expected + 1,
            status = (
              await db.notes.where({ caseId, state: "open" }).toArray()
            ).some((n) => n.blocking)
              ? "changes_requested"
              : "draft";
          const r: ReviewRecord = {
            caseId,
            revision,
            draft,
            updatedAt: Date.now(),
            status,
            approval: null,
          };
          await putRecord(r);
          await db.revisions.add({
            id: crypto.randomUUID(),
            caseId,
            revision,
            bundle: draft,
            at: r.updatedAt,
          });
          await db.events.add(
            event(
              caseId,
              revision,
              "save",
              "Taslak kaydedildi. Önceki onay varsa kaldırıldı.",
            ),
          );
          return r;
        },
      );
    },
    approve: async (caseId, expected) => {
      const before = await load(caseId);
      check(before, expected);
      assertPublishable(before.draft);
      const hash = await fingerprint(before.draft);
      return db.transaction(
        "rw",
        db.summaries,
        db.records,
        db.notes,
        db.events,
        async () => {
          const current = await db.records.get(caseId);
          check(current, expected);
          if (current && canonical(current.draft) !== canonical(before.draft))
            throw Error("Taslak değişti; yeniden yükle.");
          if (
            (await db.notes.where({ caseId, state: "open" }).toArray()).some(
              (n) => n.blocking,
            )
          )
            throw Error(
              "Önce onayı engelleyen açık düzeltme notlarını ele al.",
            );
          const r: ReviewRecord = {
            ...before,
            updatedAt: Date.now(),
            status: "approved",
            approval: {
              revision: expected,
              fingerprint: hash,
              approvedAt: Date.now(),
            },
          };
          await putRecord(r);
          await db.events.add(
            event(
              caseId,
              expected,
              "approve",
              "Bu sürüm kullanıcı tarafından açıkça onaylandı.",
            ),
          );
          return r;
        },
      );
    },
    withdraw: async (caseId, expected) => {
      const before = await load(caseId);
      return db.transaction(
        "rw",
        db.summaries,
        db.records,
        db.events,
        async () => {
          const r = await db.records.get(caseId);
          check(r, expected);
          await putRecord({
            ...(r || before),
            status: "draft",
            approval: null,
            updatedAt: Date.now(),
          });
          await db.events.add(
            event(
              caseId,
              expected,
              "withdraw",
              "Onay geri alındı; sonraki yayın paketinden çıkarılır.",
            ),
          );
        },
      );
    },
    listNotes: (caseId) =>
      caseId
        ? db.notes.where("caseId").equals(caseId).sortBy("createdAt")
        : db.notes.toArray(),
    addNote: async (caseId, scope, body, blocking) => {
      seed(caseId);
      const note = noteSchema.parse({
        id: crypto.randomUUID(),
        caseId,
        scope,
        body: body.trim(),
        blocking,
        state: "open",
        createdAt: Date.now(),
      });
      const before = await load(caseId);
      await db.transaction(
        "rw",
        db.summaries,
        db.notes,
        db.records,
        db.events,
        async () => {
          await db.notes.add(note);
          const r = (await db.records.get(caseId)) || before;
          await putRecord({
            ...r,
            ...(blocking
              ? { status: "changes_requested" as const, approval: null }
              : {}),
            updatedAt: Date.now(),
          });
          await db.events.add(
            event(
              caseId,
              r.revision,
              "note",
              `${scope}: ${blocking ? "Düzeltme gerekli" : "Bilgi notu"} eklendi.`,
            ),
          );
        },
      );
    },
    resolveNote: async (id, resolution) => {
      if (!resolution.trim())
        throw Error("Ne değiştiğini veya notun neden kapatıldığını yaz.");
      await db.transaction(
        "rw",
        db.summaries,
        db.notes,
        db.records,
        db.events,
        async () => {
          const n = await db.notes.get(id);
          if (!n) throw Error("Not bulunamadı.");
          await db.notes.put({
            ...n,
            state: "resolved",
            resolution: resolution.trim(),
            resolvedAt: Date.now(),
          });
          const r = await db.records.get(n.caseId);
          if (
            r?.status === "changes_requested" &&
            !(
              await db.notes
                .where({ caseId: n.caseId, state: "open" })
                .toArray()
            ).some((x) => x.blocking)
          )
            await putRecord({
              ...r,
              status: "draft",
              approval: null,
              updatedAt: Date.now(),
            });
          await db.events.add(
            event(
              n.caseId,
              r?.revision || 0,
              "resolve",
              "Düzeltme notu gerekçesiyle kapatıldı. Onay kendiliğinden verilmedi.",
            ),
          );
        },
      );
    },
    listEvents: (caseId) =>
      db.events.where("caseId").equals(caseId).reverse().sortBy("at"),
    getRevisions: (caseId) =>
      db.revisions.where("caseId").equals(caseId).sortBy("revision"),
    backup: () =>
      db.transaction(
        "r",
        db.records,
        db.notes,
        db.events,
        db.revisions,
        async () => ({
          schema: 1,
          kind: "ftr-editorial-backup",
          exportedAt: new Date().toISOString(),
          records: await db.records.toArray(),
          notes: await db.notes.toArray(),
          events: await db.events.toArray(),
          revisions: await db.revisions.toArray(),
        }),
      ),
    importBackup: async (raw, restoreApprovals) => {
      const b = backupSchema.parse(raw),
        unique = (xs: string[]) => new Set(xs).size === xs.length;
      if (
        !unique(b.records.map((r) => r.caseId)) ||
        !unique(b.notes.map((n) => n.id)) ||
        !unique(b.events.map((e) => e.id)) ||
        !unique(b.revisions.map((r) => r.id))
      )
        throw Error("Yedekte yinelenen kayıt kimliği var.");
      for (const r of b.records) {
        seed(r.caseId);
        if (r.caseId !== r.draft.case.id)
          throw Error("Yedekte vaka kimliği eşleşmiyor.");
        r.draft = normalizeBundle(r.draft);
        if (
          r.approval &&
          (r.approval.revision !== r.revision ||
            (await fingerprint(r.draft)) !== r.approval.fingerprint)
        )
          throw Error(r.caseId + ": yedekte onay içeriği uyuşmuyor.");
        if (r.status === "approved" && !r.approval)
          throw Error("Yedekte eksik onay var.");
        if (!restoreApprovals) {
          r.approval = null;
          r.status = "draft";
        }
        if (r.approval) assertPublishable(r.draft);
      }
      for (const n of b.notes) seed(n.caseId);
      for (const v of b.revisions) {
        seed(v.caseId);
        if (v.caseId !== v.bundle.case.id)
          throw Error("Sürüm kimliği eşleşmiyor.");
      }
      for (const e of b.events) seed(e.caseId);
      return db.transaction(
        "rw",
        db.summaries,
        db.records,
        db.notes,
        db.events,
        db.revisions,
        async () => {
          let imported = 0,
            skipped = 0;
          for (const r of b.records) {
            const old = await db.records.get(r.caseId);
            if (old && old.updatedAt > r.updatedAt) {
              skipped++;
              continue;
            }
            await putRecord(r);
            imported++;
            await db.events.add(
              event(
                r.caseId,
                r.revision,
                "import",
                "İnceleme yedeği birleştirildi.",
              ),
            );
          }
          for (const n of b.notes) {
            const old = await db.notes.get(n.id);
            if (
              !old ||
              (n.resolvedAt || n.createdAt) > (old.resolvedAt || old.createdAt)
            )
              await db.notes.put(n);
          }
          for (const e of b.events)
            if (!(await db.events.get(e.id))) await db.events.add(e);
          for (const v of b.revisions)
            if (!(await db.revisions.get(v.id))) await db.revisions.add(v);
          for (const caseId of new Set(b.notes.map((n) => n.caseId))) {
            const r = await db.records.get(caseId);
            if (
              r &&
              (await db.notes.where({ caseId, state: "open" }).toArray()).some(
                (n) => n.blocking,
              )
            )
              await putRecord({
                ...r,
                status: "changes_requested",
                approval: null,
              });
          }
          return { imported, skipped };
        },
      );
    },
    release: async () => {
      const b = await api.backup();
      return compileRelease(b.records, b.notes);
    },
  };
  return api;
}
