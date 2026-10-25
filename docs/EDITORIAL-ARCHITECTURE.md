# Editoryal mimari ve doğrulama

25 Ekim 2026 · v5

## Katmanlar

- `src/data/candidate-bank.ts`: 1.060 adayın derlenmesi. Yalnız ayrı, gerektiğinde yüklenen inceleme ekranı kullanır.
- `src/data/published-release.json`: oyunun tek vaka kaynağı. Onay paketi yoksa geçerli boş yayın kullanılır; adaylara geri düşülmez.
- `src/editorial/schema.ts`: taşınabilir şemalar, içerik kuralları ve deterministik SHA-256 içerik özeti.
- `src/editorial/release.ts`: onaylı sürümlerin yayın grafiğine derlenmesi ve doğrulanması. Kaynak/modüller içerik kimliğiyle tekilleştirilir; vaka özelinde farklılaşan modüller birbirini değiştirmez.
- `src/editorial/repository.ts`: veri deposu arayüzü ve Dexie/IndexedDB adapteri. UI, doğrudan `localStorage` kayıtlarına veya SQL'e bağlı değildir.
- `src/features/review/`: liste, form, alan notları, geçmiş ve dosya aktarımı. Formlar bütün vaka girdilerini düzenler; yayın kararını depolama ve alan kuralları belirler.
- `scripts/validate-release.mjs`: üretim derlemesinin zorunlu yayın kapısı.

## Yerel veritabanı

| Tablo | Amaç |
|---|---|
| `records` | Vakanın güncel taslağı, sürüm sayısı ve o sürüme ait varsa onay |
| `summaries` | Listeler için küçük, indeksli görünüm; bütün soru gövdeleri listeye yüklenmez |
| `notes` | Vaka/bölüm, açık/kapalı durumu, engelleyicilik ve çözüm açıklaması |
| `events` | Kaydetme, not, onay, geri alma ve içe aktarma geçmişi |
| `revisions` | Önceki taslak içerikleri; geri alma yeni bir taslak değişikliğidir |

Şema v1 temel tabloları, v2 küçük liste görünümünü tanımlar. V1 verileri v2'ye geçerken korunur ve özetleri yeniden kurulur. Notlar vaka ve durum; sürümler vaka/sürüm; listeler durum, klinik alan ve zaman üzerinden indekslenir. Kayıt ve özet değişiklikleri aynı işlemde yazılır.

Kayıtlar yalnız bir vaka üzerinde işlem yapıldığında oluşur; adayların tamamı başlangıçta onaylanmış veya düzenlenmiş sayılmaz. Liste 24 satır gösterir. Her yazmada bütün veritabanı dışa aktarılmaz. Yedek ve yayın derlemesi kullanıcı istediğinde çalışır.

## Onay kuralları

1. Onay, normalize edilmiş vaka + bu vakaya bağlı modüller + kaynakların içerik özetine bağlanır.
2. Her kayıt artan bir sürüm taşır. Eski sürümden yazma girişimi reddedilir; çoklu sekme sessizce veri ezemez.
3. Taslak değişikliği veya engelleyici not onayı kaldırır. Bir notu kapatmak onay vermez.
4. Eksik kaynak, geçersiz yanıt anahtarı, yinelenen kimlik veya boş zorunlu girdilerle onay verilemez.
5. Yayın derleyicisi yalnız onaylı güncel sürümleri kabul eder. Onay zamanı ve içerik özeti her yayımlanan vakayla eşleşir.
6. Yayına özel inceleme notu, çözüm metni veya taslak geçmişi alınmaz. Yalnız onaylı vaka grafiğinin kullandığı modüller/kaynaklar taşınır.

SHA-256 burada değişiklik tespitidir; kimlik doğrulanmış dijital imza değildir. Yerel kullanıcı arayüzündeki onayla GitHub deposuna yazma yetkisi farklıdır. Yayın yetkisi GitHub erişimindedir. Gerçek sunuculu sürümde onaylayan kullanıcı sunucuda doğrulanmalıdır.

## Doğrulama

`pnpm quality`: bütün adaylarda mevcut yedi içerik/puanlama kontrol grubu; ayrıca editoryal işlem testleri.

`pnpm build`: önce `validate-release.mjs`, sonra TypeScript ve Vite. Onay kaydı eksik, içerik özeti uyuşmayan, değişmiş sürüm kimliği olan veya tanımsız alan taşıyan paketle üretim derlemesi devam etmez. Geçerli boş yayın desteklenir.

Editoryal testler ayrı, geçici IndexedDB veritabanlarıyla çalışır; test sonunda silinir. Gerçek inceleme veritabanını veya sahibinin onaylarını değiştirmez. İlk yükleme, yalnız onaylı yayın, özel notların dışlanması, düzenleme sonrası onay kaldırma, engelleyici notlar, çoklu sekme, bozuk içerik, değiştirilmiş yayın paketi, vaka özel modül değişimi, yedek taşıma ve onayı geri alma kontrol edilir. Otomatik içerik denetimi klinik uzman incelemesinin yerine geçmez.

## Yayınlama

```sh
pnpm publication:import /path/to/ftr-approved-release.json
pnpm quality
pnpm build
```

İçe aktarma dosyayı doğrular ve tek yayın kaynağını günceller; otomatik GitHub gönderimi yapmaz. Kullanıcıdan gelen inceleme yedeği özel notlar içerebilir; repo, `public/`, `dist/` veya GitHub artifact'ına konmamalıdır. İşleme dosyaları repo dışında tutulur. Onaylı yayın dosyasıyla inceleme yedeği birbirine dönüştürülmüş gibi kabul edilmez.

## Sunucuya ölçekleme yolu

Yerel yaklaşım binlerce adayın tek kullanıcı tarafından incelenmesi ve mevcut sunucusuz yayın için uygundur. Sınırsız cihaz eşitlemesi veya ekip çalışması çözümü değildir.

Bir sonraki aşamada `EditorialRepository` için HTTP adapteri ve kimlik/rol doğrulayan API eklenir. `records/revisions/notes/events` ilişkileri PostgreSQL veya SQLite/D1 tablolarına taşınabilir. Liste tarafına sunucu sayfalaması/arama eklenir. Onay ve yayın derleyicisi alan katmanında kalır; sunucuda aynı kurallar uygulanır. İçerik yazarı, inceleyen ve yayıncı rolleri ayrı yetkilendirilir. Veritabanı migrasyonu ve kontrollü içe aktarma yoluyla mevcut yerel yedekler taşınabilir.

Birinci parti referanslar: [Dexie React](https://dexie.org/docs/Tutorial/React), [Dexie transaction](https://dexie.org/docs/Dexie/Dexie.transaction()), [Zod](https://zod.dev/basics), [MDN kalıcı saklama](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
