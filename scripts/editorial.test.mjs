import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import fs from "node:fs";
import Dexie from "dexie";
import { test, after } from "node:test";
import {
  EditorialDatabase,
  createEditorialRepository,
} from "../src/editorial/repository.ts";
import {
  bundleFromBank,
  validateRelease,
  compileRelease,
} from "../src/editorial/release.ts";
import { validationIssues, fingerprint } from "../src/editorial/schema.ts";
import { expandBank } from "../src/data/expand.ts";
const base = JSON.parse(
  fs.readFileSync(
    new URL("../src/data/clinical-bank.json", import.meta.url),
    "utf8",
  ),
);
const extra = JSON.parse(
  fs.readFileSync(
    new URL("../src/data/expansion.json", import.meta.url),
    "utf8",
  ),
);
base.sources.push(...extra.sources);
base.modules.push(...extra.modules);
const databases = [];
function setup() {
  const db = new EditorialDatabase("ftr-editorial-test-" + crypto.randomUUID());
  databases.push(db);
  const seed = (id) => bundleFromBank(base, id);
  return { db, repo: createEditorialRepository(seed, db), seed };
}
after(async () => {
  for (const db of databases) await db.delete();
});
test("İlk yüklemede hiçbir vaka onaylanmaz; yayın paketi boştur", async () => {
  const { repo } = setup();
  const r = await repo.load("cn01");
  assert.equal(r.approval, null);
  assert.equal((await repo.listRecords()).length, 0);
  const release = await repo.release();
  assert.equal(release.bank.cases.length, 0);
  await validateRelease(release);
});
test("Yalnız tam olarak onaylanan sürüm çıkar; özel notlar pakete girmez", async () => {
  const { repo } = setup();
  await repo.addNote("cn01", "Öykü", "PRIVATE_EDITORIAL_MARKER_123", false);
  const r = await repo.approve("cn01", 0);
  assert.equal(r.approval.fingerprint, await fingerprint(r.draft));
  const out = await repo.release();
  assert.deepEqual(
    out.bank.cases.map((c) => c.id),
    ["cn01"],
  );
  assert.equal(out.approvals.length, 1);
  assert.ok(!JSON.stringify(out).includes("PRIVATE_EDITORIAL_MARKER_123"));
  await validateRelease(out);
});
test("Düzenleme onayı kaldırır; eski onay yeni metne taşınmaz", async () => {
  const { repo } = setup();
  const approved = await repo.approve("cn01", 0);
  const next = structuredClone(approved.draft);
  next.case.title += " — düzeltildi";
  const changed = await repo.save("cn01", next, 0);
  assert.equal(changed.revision, 1);
  assert.equal(changed.approval, null);
  assert.equal((await repo.release()).bank.cases.length, 0);
  await repo.approve("cn01", 1);
  assert.equal((await repo.release()).bank.cases[0].title, next.case.title);
});
test("Açık engelleyici not onayı engeller; notu kapatma otomatik onaylamaz", async () => {
  const { repo } = setup();
  await repo.approve("cn01", 0);
  await repo.addNote("cn01", "Denge", "Gerekçeyi kontrol et", true);
  assert.equal((await repo.release()).bank.cases.length, 0);
  await assert.rejects(() => repo.approve("cn01", 0), /açık/);
  const note = (await repo.listNotes("cn01"))[0];
  await assert.rejects(() => repo.resolveNote(note.id, ""), /yaz/);
  await repo.resolveNote(note.id, "Gerekçe kontrol edilerek açıklama eklendi.");
  assert.equal((await repo.load("cn01")).approval, null);
  await repo.approve("cn01", 0);
  assert.equal((await repo.release()).bank.cases.length, 1);
});
test("Çoklu sekme kaydı sessizce ezilmez; eski sürüm reddedilir", async () => {
  const { repo, seed } = setup();
  const a = seed("cn01"),
    b = seed("cn01");
  a.case.title = "Birinci taslak";
  b.case.title = "İkinci taslak";
  await repo.save("cn01", a, 0);
  await assert.rejects(() => repo.save("cn01", b, 0), /başka bir sekmede/);
  assert.equal((await repo.load("cn01")).draft.case.title, "Birinci taslak");
  await assert.rejects(() => repo.approve("cn01", 0), /başka bir sekmede/);
});
test("Geçersiz yanıt anahtarı veya eksik kaynak onaylanamaz", async () => {
  const { repo, seed } = setup();
  const b = seed("cn01");
  b.modules[0].toolQuestion.options.forEach((o) => {
    o.correct = false;
  });
  b.sources = [];
  assert.ok(validationIssues(b).length > 0);
  await repo.save("cn01", b, 0);
  await assert.rejects(() => repo.approve("cn01", 1));
  assert.equal((await repo.release()).bank.cases.length, 0);
});
test("Yayın içeriği değiştirilirse onay parmak izi ve sürüm kapısı reddeder", async () => {
  const { repo } = setup();
  await repo.approve("cn01", 0);
  const good = await repo.release();
  await validateRelease(good);
  const changed = structuredClone(good);
  changed.bank.cases[0].story += " Yetkisiz değişiklik.";
  await assert.rejects(() => validateRelease(changed), /eşleşmiyor/);
  const unapproved = structuredClone(good);
  unapproved.approvals = [];
  await assert.rejects(() => validateRelease(unapproved), /onay kaydı/);
  const fakeVersion = structuredClone(good);
  fakeVersion.bank.version = "old-cache";
  await assert.rejects(() => validateRelease(fakeVersion), /sürümü/);
  const privateData = structuredClone(good);
  privateData.notes = ["Yayımlanmaması gereken not"];
  await assert.rejects(() => validateRelease(privateData), /özel alan/);
});
test("Paylaşılan modül bu vakada değişebilir; diğer vaka etkilenmez ve veriler tekilleşir", async () => {
  const { repo } = setup();
  await repo.approve("cn01", 0);
  const second = await repo.load("cn02");
  const original = second.draft.modules.find((m) => m.id === "ne-motor").title;
  second.draft.modules.find((m) => m.id === "ne-motor").title =
    "İkinci vakaya özgü motor başlığı";
  await repo.save("cn02", second.draft, 0);
  await repo.approve("cn02", 1);
  const out = await repo.release();
  await validateRelease(out);
  const a = bundleFromBank(out.bank, "cn01"),
    b = bundleFromBank(out.bank, "cn02");
  assert.ok(a.modules.some((m) => m.title === original));
  assert.ok(
    b.modules.some((m) => m.title === "İkinci vakaya özgü motor başlığı"),
  );
  assert.ok(out.bank.modules.length < a.modules.length + b.modules.length);
});
test("Yedek veri tabanları arasında taşınır; onay geri yükleme açıkça seçilir", async () => {
  const { repo } = setup();
  let b = await repo.load("cn01");
  b.draft.case.title = "Taşınabilir taslak";
  await repo.save("cn01", b.draft, 0);
  await repo.addNote("cn01", "Hedef", "Taşınan not", false);
  await repo.approve("cn01", 1);
  const backup = await repo.backup();
  assert.equal(backup.revisions.length, 1);
  const other = setup();
  await other.repo.importBackup(backup, false);
  assert.equal((await other.repo.load("cn01")).approval, null);
  assert.equal((await other.repo.listNotes("cn01"))[0].body, "Taşınan not");
  const third = setup();
  await third.repo.importBackup(backup, true);
  assert.equal((await third.repo.release()).bank.cases.length, 1);
  const corrupted = structuredClone(backup);
  corrupted.records[0].draft.case.title = "Onaydan sonra değişti";
  await assert.rejects(
    () => other.repo.importBackup(corrupted, true),
    /uyuşmuyor/,
  );
});
test("Onayı geri çekmek sonraki paketten çıkarır ve geçmiş kalır", async () => {
  const { repo } = setup();
  await repo.approve("cn01", 0);
  await repo.withdraw("cn01", 0);
  assert.equal((await repo.release()).bank.cases.length, 0);
  assert.ok(
    (await repo.listEvents("cn01")).some((e) => e.action === "withdraw"),
  );
  const empty = await compileRelease([], []);
  await validateRelease(empty);
});
test("Veritabanı v1 → v2 geçişinde kayıt korunur ve küçük liste görünümü kurulur", async () => {
  const name = "ftr-editorial-migration-" + crypto.randomUUID(),
    old = new Dexie(name);
  old
    .version(1)
    .stores({
      records: "caseId,status,updatedAt",
      notes: "id,caseId,state,[caseId+state]",
      events: "id,caseId,at",
      revisions: "id,caseId,[caseId+revision]",
    });
  const draft = bundleFromBank(base, "cn01");
  await old
    .table("records")
    .put({
      caseId: "cn01",
      revision: 3,
      draft,
      updatedAt: Date.now(),
      status: "draft",
      approval: null,
    });
  old.close();
  const db = new EditorialDatabase(name);
  databases.push(db);
  const repo = createEditorialRepository((id) => bundleFromBank(base, id), db);
  assert.equal((await repo.load("cn01")).revision, 3);
  const summaries = await repo.listSummaries();
  assert.equal(summaries.length, 1);
  assert.equal(summaries[0].title, draft.case.title);
  assert.ok(!("draft" in summaries[0]));
});
test("1.060 adayın tamamı inceleme şemasında açılır ve kaynak/yanıt kurallarıyla uyumludur", () => {
  const raw = JSON.parse(
    fs.readFileSync(
      new URL("../src/data/clinical-bank.json", import.meta.url),
      "utf8",
    ),
  );
  const all = expandBank(raw, extra);
  assert.equal(all.cases.length, 1060);
  for (const c of all.cases)
    assert.deepEqual(validationIssues(bundleFromBank(all, c.id)), [], c.id);
});
