import fs from "node:fs";
import { validateRelease } from "../src/editorial/release.ts";
import { canonical } from "../src/editorial/schema.ts";
const filename = process.argv[2];
if (!filename)
  throw Error("Kullanım: pnpm publication:import <ftr-approved-release.json>");
if (fs.statSync(filename).size > 100 * 1024 * 1024)
  throw Error("Yayın dosyası 100 MB sınırını aşıyor.");
const raw = JSON.parse(fs.readFileSync(filename, "utf8")),
  release = await validateRelease(raw);
if (canonical(raw) !== canonical(release))
  throw Error(
    "Dosyada yayın şemasına ait olmayan alanlar var. İnceleme yedeği yayın paketi değildir.",
  );
const target = new URL("../src/data/published-release.json", import.meta.url);
fs.writeFileSync(target, JSON.stringify(release, null, 2) + "\n");
console.log(
  `${release.bank.cases.length} onaylı vaka yayın kaynağına alındı. Henüz GitHub'a gönderilmedi. Kontrolleri çalıştırıp doğrulanan sürümü yayımla.`,
);
