import fs from "node:fs";
import { validateRelease } from "../src/editorial/release.ts";
import { canonical } from "../src/editorial/schema.ts";
const path = new URL("../src/data/published-release.json", import.meta.url),
  raw = JSON.parse(fs.readFileSync(path, "utf8"));
const release = await validateRelease(raw);
if (canonical(raw) !== canonical(release))
  throw Error(
    "Yayın dosyasında tanımsız/özel alanlar var. Yalnız panelin onaylı yayın paketini kullan.",
  );
console.log(
  `Yayın kapısı geçti: ${release.bank.cases.length} vaka, ${release.approvals.length} geçerli sürüm onayı. Taslak veya özel inceleme notu yayımlanmaz.`,
);
