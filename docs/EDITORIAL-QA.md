# v5 inceleme alanı — kalite kaydı

25 Ekim 2026.

## Doğrulanan durum

- 1.060 aday vaka inceleme alanında tutulur. Hiçbiri kullanıcı adına otomatik onaylanmaz.
- Mevcut v5 yayın kaynağı **0 vaka / 0 onay** içerir. Önceki adayların tamamına geri dönen bir oyun verisi fallback'i yoktur.
- Aday içerik ile yayın içeriği ayrı dosya/katmanlardadır. Adaylar yalnız inceleme ekranı açıldığında yüklenen pakettedir.
- Tarayıcı veritabanı Dexie/IndexedDB'dir. Sunucu, yeni hosting hesabı veya ücretli hizmet eklenmedi.

## Otomatik kontroller

Mevcut yedi aday içerik/puanlama kontrol grubu ve **12 editoryal test** geçti. Bunlar ilk yüklemede sıfır onay; yalnız tam onaylı sürümün yayına alınması; özel notların dışarıda kalması; düzenleme sonrası onayın kaldırılması; engelleyici notlar; çoklu sekme çakışması; geçersiz yanıt/kaynak; paket içeriği/kimliği değişikliği; vaka özel modül düzenleme ve ortak içerik tekilleştirmesi; yedek taşıma; onayı geri alma; v1→v2 veritabanı migrasyonu ve 1.060 adayın düzenleyici şemasıyla uyumunu kapsar.

Testler geçici veritabanları kullanır ve sonunda siler. Gerçek site sahibinin inceleme kayıtlarında test onayı oluşturulmaz. Hiçbir gerçek adayın üretim onayı, kalite kontrolü için verilmedi.

`pnpm build`, zorunlu onaylı yayın doğrulaması ile TypeScript ve üretim derlemesini çalıştırır. Büyük tek vendor paketi yerine inceleme bağımlılıkları ayrı pakete bölündü; aday içerik, yerel veritabanı araçları ve doğrulama kütüphanesi ana oyunun ilk yüklemesine eklenmez.

## Tarayıcıda kontrol edilenler

- Aday liste, durum sayıları, arama ve ayrı vaka dosyası açılışı.
- Vaka başlığının düzenlenip veritabanına kaydedilmesi ve sayfa yenilenince korunması.
- Kaydedilmemiş girdilerle sayfadan ayrılma uyarısı; sayfada kalıp düzenlemeye devam edebilme.
- Bir öykü girdisinin yanından not ekleme; notun bölümünün otomatik seçilmesi; engelleyici notla onay düğmesinin kapanması; yenileme sonrası notun korunması.
- Bir değerlendirme dalında araç ve uygulama sorularının, sekiz doğru/yanlış seçim kontrolünün ve gerekçe alanlarının açılması.
- Gerçek dosya indirmesi: inceleme yedeğinde bir test taslağı, bir not ve bir sürüm bulundu. Ayrı yayın paketinde 0 vaka ve 0 onay bulundu; özel inceleme notu yoktu. Test dosyaları yayın kaynaklarına alınmadı.
- 1.440 CSS px genişliğinde iki sütunlu editör + not alanı; belge genişliği 1.425 px ve yatay taşma yok.
- 390 CSS px telefon görünümünde belge ve başlık genişliği 375 px; yatay taşma yok. Alt kaydet/onay alanı görünür, notlar dar görünümde aynı dosyanın altında açılır.

## Sınırlar

Klinik doğruluğun bütünü, her senaryonun bağımsız uzman tarafından onayı, bütün gerçek cihazlar, resmî WCAG uygunluğu veya sunucu güvenliği bu kontrollerle kanıtlanmaz. İnceleme adresi bir kimlik doğrulama sistemi değildir; kayıtlar cihaz/tarayıcı/site adresine bağlıdır. Onayı tarayıcıda vermek veya paket indirmek GitHub yayınına otomatik yazmaz. Kullanıcı yayın paketi ayrıca aktarılır.

Önceki v4 kalite raporu, önceki tarihli sürümün kaydı olarak korunmuştur. Güncel yayın sayısı `src/data/published-release.json` ve yayın kapısı çıktısı üzerinden okunmalıdır.
