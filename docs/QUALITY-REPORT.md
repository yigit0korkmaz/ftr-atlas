# FTR Atlas v4 — Son kalite analizi

İnceleme tarihi: 24 Ekim 2026. Amaç: vaka kütüphanesinin genişletilmesi, değerlendirme dallarının tutarlılığı, açılır menüler ve ticari ürüne hazırlığın değerlendirilmesi.

## Sonuç ve kullanım sınırı

Ücretsiz eğitim sürümü için kaynakla ilişkilendirilmiş, kullanılabilir bir genişletme hazırlandı. Teknik içerik denetimi ve üretim derlemesi geçti. Bu rapor klinik onay, eksiksiz müfredat kapsamı, resmî erişilebilirlik uygunluğu veya sıfır hata güvencesi değildir. Ücretli ürün için gereken kimlik/ödeme/yönetim sistemleri bu sürümde uygulanmış değildir.

## İçerik envanteri

| Ölçü | Sonuç |
|---|---:|
| Toplam oynanabilir eğitim senaryosu | 1.060 |
| Önceki temel vaka | 36 |
| Yeni klinik ana öykü | 64 |
| Yeni ana öykülerden oluşan senaryo | 1.024 |
| Her ana öyküde bulgu odağı × yaşam hedefi | 4 × 4 |
| Klinik alan | 12 |
| Ortak değerlendirme modülü | 53 |
| Araç / uygulama sorusu | 106 |
| Vaka değerlendirme alanı kaydı | 9.996 |
| Kaynak kaydı | 134 |

1.060 sayısı, 1.060 bağımsız yayımlanmış hasta raporu anlamına gelmez. 64 yeni ana öykünün dört bulgu odağı dört farklı öncelik örüntüsü üretir; dört yaşam hedefi bu örüntüleri farklı günlük görevlerle ilişkilendirir. Her varyant tamamen yeni bir test seti değildir. Ortak modüller farklı senaryolarda tekrar kullanılır. Kaynaklı kurgu ve bağımsız klinik onay durumu vaka ekranında ve kütüphanede belirtilir.

## Otomatik kontroller

`pnpm quality` aynı senaryo derleyicisini uygulamayla paylaşır. Yedi denetim grubu bütün banka üzerinde geçmiştir; makine çıktısı [quality-results.json](quality-results.json) dosyasındadır.

1. **Benzersizlik:** 1.000 üzeri kayıt, benzersiz vaka kimliği ve normalize edilmiş öykü; aynı girdiden aynı banka.
2. **Referans bütünlüğü:** Vaka, alan, modül ve soru kaynaklarının bulunması; modül/seçenek kimliklerinde tekrar olmaması; doğru ve yanlış seçeneklerin varlığı; tek seçimli soruda tek doğru.
3. **Öncelik çeşitliliği:** Her yeni ana öyküde 16 birleşim ve dört farklı gerekli alan örüntüsü. Yalnız yaş veya kimlik değiştirme sayımı yapılmaz.
4. **Rota ve puanlama:** Tam doğru planın %100 olması, ek öncelik dışı seçimin plan puanını düşürmesi, boş planda gerekli alanların telafiye gelmesi, seçilen tüm dalların tekil olması, doğru araç/uygulamayla %100 ve sonlu sonuçlar.
5. **Belirli klinik uygunluk kuralları:** ISNCSCI/SCIM’in omurilik yaralanmasıyla sınırlı olması; inme motor/ihmal modüllerinin tanıya uygunluğu; GMFM ve ambulatuvar DMD bağlamı; spina bifidada deri ve diyabetik nöropatide duyu/deri alanları; kalça ve ayak vakalarına diz özgü uygulama sorusu taşınmaması.
6. **Kütüphane:** Türkçe arama, boş sonuç, konu/kayıt durumu, 24 kartlık sayfalama, sınır dışı/geçersiz sayfa numarasını sınırlama ve sayfalar arasında kayıt kaybı/tekrar olmaması.
7. **Kodlama:** İçerikte bozuk Unicode değiştirme karakteri bulunmaması.

Bu kurallar klinik uygunluğun yalnız belirli, açıkça tanımlanmış durumlarını kapsar; tıbbi doğruluğun tümünü otomatik ispatlamaz. Örneğin her çeldiricinin her olası hasta bağlamında tartışmasız yanlış olduğunu göstermez.

`pnpm build` ile TypeScript ve üretim derlemesi geçti. React, Motion, Radix ve klinik içerik ayrı paketlere ayrıldı; önceki 500 kB paket uyarısı giderildi. Paket boyutu tarayıcı yükleme hızı veya gerçek cihaz performans ölçümünün yerine geçmez.

## Kaynak kalitesi ve gözden geçirme

Yeni araştırma; resmî kılavuz/geliştirici sayfaları ve beş açık erişimli yayımlanmış olgu raporunu içerir. Ayrıntılı erişim/sürüm kayıtları [SOURCE-RESEARCH.json](SOURCE-RESEARCH.json) içinde tutulur. Buna ek olarak kalça kırığı, distal radius rehabilitasyonu, kalp yetersizliği ve diyabetik ayak için birincil kılavuz referansları eklendi.

Eski bankadaki 34 PubMed kaynak kaydına karşılık gelen 32 farklı makalenin özgün başlığı NCBI E-utilities ile alındı; içerikle ilişkilendirilmiş başlıklar gözden geçirildi. Sonuç [PUBMED-METADATA.json](PUBMED-METADATA.json) içindedir. Bu, bütün 134 dış bağlantının tam metninin okunduğu veya sürekli erişilebilir olduğu iddiası değildir.

ASIA’nın güncel kaynak sayfasında 2026 ISNCSCI kaynağı bulunması nedeniyle 2019 özgün yayınının “en güncel sürüm” olarak sunulmaması sağlandı. Bazı yayınlar bot engeli/403 nedeniyle yalnız resmî indekslenmiş metin üzerinden doğrulanabildi; bu erişim sınırları araştırma kaydında işaretlidir. Olgu raporlarından kişiye ait sayısal ölçüm, fotoğraf, kimlik veya tedavi dozu kopyalanmadı. Tek olgudan tedavi üstünlüğü sonucu çıkarılmadı.

## Arayüz incelemesi

- Açılır menüler Radix Select ile yeniden kuruldu. Ekranın sınırlarına göre konumlanma, kaydırılabilir seçenekler, koyu/açık tema renkleri, seçili işareti ve erişilebilir etiketler eklendi.
- Klinik alan seçimiyle inme listesinin 100 senaryoya süzülmesi görüldü. Boş kayıt listesinde anlaşılır boş durum, klavyeyle durum seçimi ve filtrelerin adreste korunması kontrol edildi.
- Sayfa başına en fazla 24 kart gösterilir; 1.060 kart aynı anda ekrana basılmaz. Varsayılan karışık sıra benzer ana öykülerin arka arkaya kümelenmesini azaltır.
- Dar telefon görünümünde iki alt filtre yan yana, klinik alan filtresi tam genişlikte düzenlendi. Görünümde yatay taşma saptanmadı. Bu kontrol bütün gerçek telefon/tarayıcı kombinasyonlarını kapsamaz.
- Yeni bir inme senaryosunda öncelik seçimi → geri bildirim → değerlendirme rotası → araç sorusu bağlantısı görüldü. İki gerekli, dört atlanan ve bir öncelik dışı seçim doğru kategorilerde gösterildi.
- Tablet yan menüsünde yazılar gizlendiğinde ikon bağlantılarının erişilebilir adı kayboluyordu; gezinme, kaynak ve ayar kontrollerine açık etiketler eklendi.
- Uzun üretilmiş başlıklar kısaltılıp bulgu odağı kartta ayrı etiket yapıldı. Vaka öyküsü paragraflara ayrıldı. Varsayılan okuma metni 20 px; kullanıcı 18/20/22 px seçebilir.

Menü ve bir örnek rota tarayıcıda incelendi; 1.060 senaryonun her biri ayrı ayrı elle baştan sona oynanmadı. Ekran okuyucu uzman denetimi, kapsamlı cihaz laboratuvarı, yük testi ve güvenlik sızma testi yapılmadı.

## Açık kalite işleri ve öncelikler

| Öncelik | İş | Kapanış ölçütü |
|---|---|---|
| Ticari yayın öncesi zorunlu | Alan uzmanlarıyla klinik içerik incelemesi | Ana öykü, bulgu örüntüsü, soru/gerekçe ve kaynak sürümüne kayıtlı bağımsız onay |
| Ticari yayın öncesi zorunlu | Sunucu, kimlik, ödeme ve yetki sistemi | Hesaplar arası erişim engeli ve ödeme olumsuz senaryoları testlerle geçer |
| Yüksek | Klinik çeldirici ve öncelik dili incelemesi | Makul alternatif klinik kararlar yanlış diye cezalandırılmaz; görüşme kapsamı açık |
| Yüksek | Ölçek dil sürümü ve ticari kullanım hakları | Geliştirici izinleri/koşulları kaydedilir; tam formlar izinsiz çoğaltılmaz |
| Orta | Daha fazla bağımsız ana öykü ve soru örüntüsü | Senaryo sayısını artırmanın yanında yeni klinik kararlar ve uzman incelemesi eklenir |
| Orta | Gerçek cihaz ve erişilebilirlik denetimi | Hedef telefonlar, klavye, büyütme ve ekran okuyucuda ana yollar tamamlanır |
| Orta | Kaynak sürekliliği | Kaynak/sürüm değişikliği takip edilir; engelli bağlantı kırık sayılmadan incelenir |

**Karar:** Eğitim amaçlı ücretsiz sürüm olarak kullanılabilir. “Hatasız klinik kaynak”, “tam FTR müfredatı” veya “ticari SaaS hazır” şeklinde sunulmamalıdır. Üyelik, ücretli abonelik, yönetim paneli ve işletme hazırlığı için [ticari ürün yol haritası](COMMERCIAL-ROADMAP.md) izlenmelidir.
