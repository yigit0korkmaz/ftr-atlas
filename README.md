# FTR Atlas · İnceleme ve onay akışı

**Oyun:** https://yigit0korkmaz.github.io/ftr-atlas/  
**İnceleme atölyesi:** https://yigit0korkmaz.github.io/ftr-atlas/#/review

v5: 1.060 aday vaka, ayrı içerik inceleme ekranı ve yerel IndexedDB veritabanı. Aday vakalar oyuna otomatik alınmaz. İlk v5 yayınında kullanıcı onayı bulunmadığı için yayımlanmış vaka sayısı **0**'dır. Sonraki sayıyı `src/data/published-release.json` belirler.

## Kullanım

- Her vakayı tek tek aç; öykü, profil, hedef, değerlendirme alanı, araç/uygulama sorusu, seçenek ve kaynakları incele/düzenle.
- Girdinin yanına not bırak. Engelleyici düzeltme notu kapanmadan vaka onaylanamaz.
- Taslağı kaydet; değişen içerik önceki onayı kaldırır. Onay yalnız açıkça seçilen içerik sürümüne aittir.
- Geçmiş taslakları ve işlem kayıtlarını gör; eski içerik yeni taslağa getirilebilir.
- `Yedek ve yayın` ile özel inceleme yedeği veya yalnız onaylı içerik paketi indir.
- Onaylı paketi site sahibi doğrulayıp GitHub'a aktardığında herkese açık oyun güncellenir. Tarayıcıdan kendiliğinden GitHub'a yazılmaz.

[Adım adım inceleme kılavuzu](docs/EDITORIAL-GUIDE.md) · [Mimari ve yayın kuralları](docs/EDITORIAL-ARCHITECTURE.md)

## Veritabanı ve kapsam

Dexie üzerinden IndexedDB: taslaklar, küçük liste özetleri, notlar, geçmiş ve sürümler. Veriler cihaz/tarayıcı/site adresine bağlıdır; sunucuya gönderilmez. Otomatik cihaz eşitlemesi, üyelik ve korumalı admin hesabı yoktur. Düzenli dosya yedeği gerekir. İnceleme ekranı ve adayların gizliliği vaat edilmez; kaynak depo public'tir. Başkaları kendi yerel kayıtlarını değiştirebilir, ancak depo erişimi olmadan bu siteyi yayımlayamaz.

İnceleme yedeği özel not içerir; **public depoya veya statik dosyalara konmaz**. Sadece `ftr-approved-release.json` yayın kaynağına alınır. Oyun ilerlemesi/notları ayrı tarayıcı kaydındadır; yayımdan ayrılmış vaka kimliklerinin eski kayıtları korunur.

## Geliştirme

Node.js 24 ve pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm quality
pnpm build
```

`pnpm quality`: 1.060 adayda içerik/puanlama kontrolleri ve editoryal işlem testleri. Testler ayrı geçici veritabanları kullanır; gerçek sahibin onaylarını değiştirmez. `pnpm build`: önce zorunlu yayın doğrulaması, sonra TypeScript ve Vite. `dist/` statik GitHub Pages çıktısıdır; taban yolu `/ftr-atlas/`.

## Yayın paketi

```sh
pnpm publication:import /path/to/ftr-approved-release.json
pnpm quality
pnpm build
```

Dosyadaki vaka, soru, kaynak grafiği ve her vaka için içerikle eşleşen onay kaydı denetlenir. Özel/tanımsız alan, eksik onay veya değişmiş içerikle derleme durur. Geçerli boş paket desteklenir. GitHub'a gönderim ayrıca yapılır; onaylı paketin indirilmesi siteyi değiştirmez.

## Katmanlar

```text
src/data/candidate-bank.ts       Yalnız inceleme ekranında açılan adaylar
src/data/published-release.json  Oyunun tek yayın kaynağı
src/editorial/schema.ts          Şemalar, kurallar, içerik özeti
src/editorial/repository.ts      Veri deposu portu ve IndexedDB adapteri
src/editorial/release.ts         Onaylı yayın grafiği ve doğrulama
src/features/review/             Liste, form, not, geçmiş, dosya aktarımı
scripts/editorial.test.mjs       Ayrı veritabanında işlem testleri
scripts/validate-release.mjs     Derleme yayın kapısı
scripts/import-release.mjs       Sahip tarafından sağlanan paketi alma
```

UI, veri deposunu `EditorialRepository` üzerinden kullanır. Sunuculu sürümde HTTP adapteri, kimlik/rol kontrolü ve ilişkisel veritabanı eklenebilir. React/TypeScript, Vite, Zustand, Lucide, Radix, Motion, Dexie ve Zod kullanılır. İnceleme bağımlılıkları/aday veri ayrı, gerektiğinde yüklenen paketlerdedir. HashRouter tabanlı veri yönlendiricisi kaydedilmemiş değişiklikte geçişi durdurur.

## Klinik içerik

36 temel vaka + 64 ana klinik öykünün dört bulgu ve dört yaşam hedefi birleşimiyle 1.024 ek senaryo. 1.060 bağımsız gerçek hasta raporu değildir. 53 ortak modül ve 134 kaynak kaydı vardır. Eğitim amaçlı kurgudur; tam FTR müfredatı, klinik yetkinlik veya sıfır hata garantisi yoktur. Kullanıcı yayın onayı, bağımsız klinik uzman onayı değildir. Ölçeklerin dil, uygulama ve kullanım koşulları geliştiriciden kontrol edilmelidir.

[Ticari ürün yol haritası](docs/COMMERCIAL-ROADMAP.md) gelecek üyelik/abonelik/admin aşamalarını anlatır. [v4 kalite raporu](docs/QUALITY-REPORT.md) önceki sürümün tarihli incelemesidir; v5 yayın sayısı olarak okunmamalıdır. [İçerik politikası](CONTENT-POLICY.md), [tasarım araştırması](docs/DESIGN-RESEARCH.md), [kaynak araştırması](docs/SOURCE-RESEARCH.json).
