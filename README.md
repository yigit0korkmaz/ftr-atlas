# FTR Atlas · Klinik öğrenme alanın

**Herkese açık oyun:** https://yigit0korkmaz.github.io/ftr-atlas/

Telefon öncelikli, koyu/açık temalı vaka temelli FTR öğrenme platformu. 1.060 eğitim senaryosu, 12 klinik alan, 53 değerlendirme modülü ve 134 kaynak kaydı. 36 temel vakaya, 64 yeni ana öykünün dört bulgu odağı ve dört yaşam hedefiyle oluşturulan 1.024 senaryosu eklenir. Gerçek hasta kayıtları değildir. Vaka → alan önceliği → araç seçimi → uygulama kararı.

## Geliştirme

Node.js 24 ve pnpm ile:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm quality
pnpm build
```

`pnpm quality` bütün senaryolarda kaynak/modül bütünlüğünü, belirli tanı-araç kurallarını, puanlamayı ve filtre/sayfalamayı denetler. `docs/quality-results.json` makine çıktısıdır. Otomatik denetim bağımsız klinik onay değildir.

`pnpm build` TypeScript denetimi ve üretim derlemesini çalıştırır. `dist/` herkese açık statik site çıktısıdır. Vite taban yolu `/ftr-atlas/`; gezinme HashRouter ile GitHub Pages yenilemelerini destekler.

## Mimari

```text
src/
  app/                 Uygulama kabuğu, gezinme, global arama ve ayarlar
  components/          Ortak kontroller ve vaka bileşenleri
  data/                Yapılandırılmış klinik içerik ve görünüm eşlemeleri
  domain/              Tipler ve bağımsız rota/puanlama fonksiyonları
  state/               Kalıcı ilerleme, tercihler, v2 taşıma ve yedek doğrulama
  features/
    dashboard/         Çalışma alanı
    catalog/           Vakalar, değerlendirmeler ve kaynaklar
    session/           Klinik karar rotası
    progress/          Sonuçlar, ilerleme ve yedekleme
  styles/              Tasarım değişkenleri, bileşenler ve duyarlı düzenler
docs/
  DESIGN-RESEARCH.md    Araştırma kaynakları ve tasarım kararları
```

React, TypeScript, Vite, Zustand, Lucide, Radix Dialog, Motion ve Sonner kullanılır. Fontlar yerel sunulur. Bağımlılıklar kilit dosyasıyla sabitlenir; ekranlar ayrı parçalar halinde yüklenir.

## Kullanıcı özellikleri

- Varsayılan koyu tema, açık/sistem teması; 18/20/22 px okuma tercihi.
- Büyük seçim alanları, telefonda sabit karar düğmesi, dört aşamalı rota ve odak modu.
- Arama, konu/durum filtreleri, kayıtlı vakalar, paylaşılabilir vaka bağlantısı.
- Otomatik kayıt, kişisel vaka notları, önceki kararları inceleme ve tekrar alanı.
- Klinik v2 ilerlemesini taşıma; v2/v3 yedek içe aktarma ve yeni yedek dışa aktarma.
- Sistem hareket azaltma tercihi ve animasyon anahtarı.

## İçerik ve veri

Klinik içerik eğitim içindir; kurgusal vakalar ve kaynak bağlantıları içerir. Tüm FTR müfredatını veya eksiksiz hasta değerlendirmesini kapsama, klinik yeterlik ölçme ya da sıfır hata güvencesi yoktur. Bağımsız öğretim üyesi onayı alınmış değildir. Ölçeklerin tam formu veya doğrulanmış Türkçe sürümü yerine geçmez. [İçerik politikası](CONTENT-POLICY.md).

İlerleme ve notlar yalnız kullanıcının tarayıcısında saklanır; hesap ve otomatik cihaz eşitlemesi yoktur. Kaynak koduna kullanıcı ilerlemesi veya notlar eklenmez. Yeni sürüm eski `ftr-atlas-clinical-v2` kaydını okuyabilir; eski kaydı silmez. Kalıcı yeni alan `ftr-atlas-premium-v3` anahtarını kullanır.

## Yayınlama

Kaynak `main` dalında bulunur. GitHub Pages yayın kaynağı GitHub Actions’tır. `.github/workflows/deploy.yml` kilitli bağımlılıkları kurar, TypeScript denetimi ve derlemeyi çalıştırır, `dist` çıktısını Pages’e yayınlar. Ortak URL değişmeden kalır. Kimlik bilgileri dosyalara yazılmaz; iş akışı GitHub’ın geçici kimliğini kullanır.

Tasarım araştırması ve geliştirme yönü: [Araştırma notları](docs/DESIGN-RESEARCH.md).

## İçerik genişletme ve ticari ürün planı

- `src/data/clinical-bank.json`: önceki 36 vaka ve temel değerlendirme modülleri.
- `src/data/expansion.json`: düzenlenebilir 64 ana öykü, bulgu odakları, yaşam bağlamları ve ek kaynak/modüller.
- `src/data/expand.ts`: deterministik senaryo derleyicisi. Klinik cümle üretmek için AI veya rastgele ağ isteği çalıştırmaz.
- Her ana öykünün dört bulgu odağı dört farklı öncelik örüntüsü oluşturur. Dört yaşam hedefi aynı örüntüyü farklı gerçek yaşam göreviyle ilişkilendirir; her senaryo tamamen yeni bir test seti değildir.
- Yalnız yaş değiştirme veya yeni kimlik verme benzersiz vaka sayılmaz. Sayı, kaynak ve uygunluk denetimini `pnpm quality` ile yeniden çalıştır. Yeni klinik içerikte uzman incelemesi gerekir.
- Banka sürümü değiştiğinde uyumsuz yarım oturum kapanabilir; tamamlanmış vaka kayıtları, notlar ve yer imleri değişmeyen kimliklerle korunur.

[Ticari ürün yol haritası](docs/COMMERCIAL-ROADMAP.md) · [Kalite analizi](docs/QUALITY-REPORT.md) · [Kaynak araştırması kayıtları](docs/SOURCE-RESEARCH.json)
