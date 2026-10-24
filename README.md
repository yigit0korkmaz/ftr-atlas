# FTR Atlas

Türkçe, vaka temelli fizyoterapi sınav hazırlık oyunu.

**Oyna:** https://yigit0korkmaz.github.io/ftr-atlas/

İlk sürüm: **161 soru · 84 vaka · 18 konu alanı · 87 kaynak kaydı**.

## Özellikler

- Tek doğru ve birden fazla doğru seçenek; her seçenek için gerekçe.
- Vaka alt soruları, konu/zorluk filtreleri, 5–50 soruluk turlar.
- Yeni sorulara öncelik veren seçim ve karışan seçenek sırası.
- Her gün değişen 10 soruluk seçki.
- Öğrenme modu ve toplam süreli sınav provası (90 saniye × soru sayısı).
- Yanlışlar, kaydedilen sorular, konu ilerlemesi, yedek dışa/içe aktarma.
- Telefon ve bilgisayara uyum; üyelik gerekmez.

## İçerik yaklaşımı

Kaynak kontrol tarihi **24 Ekim 2026**. Her sorunun `sourceIds` alanı kaynak kaydına bağlanır. Uygulamanın Kaynaklar bölümünde bağlantı, kaynak türü ve notlar görülebilir. Soru ve vakalar özgün eğitim metinleridir; gerçek hasta verisi kullanılmaz. Ölçeklerin tam formları/madde metinleri çoğaltılmaz. Türkçe soru, ilgili ölçeğin doğrulanmış Türkçe sürümü değildir.

İçerik **öğretim üyesi tarafından bağımsız onaylanmış değildir**; hatasızlık veya tüm FTR müfredatını kapsama iddiası yoktur. Mesleki yetkinlik ölçümü veya kişisel tedavi önerisi değildir. Uygulama kılavuzları ve lisans koşulları için asıl geliştiriciye başvurulmalıdır. Çelişki durumunda kaynak ve sürüm kontrolü gerekir. [İçerik politikası](CONTENT-POLICY.md).

## Puanlama ve tekrar

Her soru eşit puanlıdır. Tam doğru için bütün doğru seçenekler seçilmeli, yanlış seçenekler seçilmemelidir. Kısmi puan yoktur; boş sorular yanlış sayılır. Sınav modunda açıklamalar bitişte görünür. Süre, sekme kapalıyken de işler. Sonraki ziyaretinde süresi dolmuş sınav tamamlanır.

İlerleme aynı tarayıcıda `localStorage` ile tutulur. Merkezi veritabanı veya cihazlar arasında otomatik eşitleme yoktur. İçe aktarma soru bazında ilerleme ve kaydedilmiş soruları değiştirir; eski tur geçmişini taşımaz. Tur seçimi son yanlışlardan ve görülmemiş sorulardan başlayıp daha önce görülenlere döner. Banka sonludur; sonsuz yeni soru üretilmez.

## Çalıştırma ve yayınlama

Derleme, paket kurulumu, API anahtarı veya ücretli servis gerekmez. `index.html` yerel açılabilir; bazı tarayıcılarda yerel dosyalarda ilerleme kaydı kısıtlı olabilir. Yerel bir HTTP sunucusu önerilir. GitHub Pages için `main` dalının kök dizini yayınlanır. Dosya yolları görecelidir ve proje alt adresini destekler.

## İçeriği genişletme

`bank.js` şu iki diziyi içerir: `sources` ve `questions`. Her soru; benzersiz kimlik, konu, aynı vakada tutarlı `caseId/caseTitle/caseText`, soru tipi, seçenekler (metin, doğru/yanlış ve gerekçe), açıklama, kaynak kimlikleri ve zorluk içerir. `engine.js` şemayı kontrol eder; tekli soruda bir, çoklu soruda en az iki doğru seçenek gerekir. Yeni içeriğin önce kaynak ve eğitimci incelemesinden geçmesi önerilir.

Bir hata için soru altındaki “İçerik inceleme öner” bağlantısını veya GitHub Issues bölümünü kullanın. Soru kimliğini, gerekçeyi ve kaynağı yazın. Gerçek hasta bilgisi paylaşmayın.

## Doğrulama

161 sorunun yapı/kaynak ilişkileri, vaka tutarlılığı, tam/eksik/fazla/boş seçim puanlaması, günlük seçki kararlılığı, günler arası değişim ve tekrar önceliği otomatik kontrol edilmiştir. Masaüstü ve 390 px telefon görünümü ile soru akışı, yenilemede yanıt taslağının korunması ve sınavdaki açıklama gizleme davranışı tarayıcıda kontrol edilmiştir. Klinik içerik kontrolü, bağımsız uzman onayı anlamına gelmez.
