# FTR Atlas — Ticari ürün yol haritası

Tarih: 24 Ekim 2026. Bu belge önerilen geliştirme planıdır; üyelik, ücretli abonelik ve yönetim paneli mevcut ücretsiz sürüme eklenmiş değildir.

## 1. Başlangıç durumu ve ürün sınırı

Mevcut ürün: React/TypeScript tabanlı, GitHub Pages üzerinde ücretsiz ve herkese açık bir eğitim uygulaması. İlerleme ve notlar tarayıcıda saklanır. 36 temel vaka + 64 ana klinik öykünün bulgu/hedef birleşimleriyle üretilen 1.024 senaryo = 1.060 eğitim senaryosu. Bunlar 1.060 bağımsız gerçek hasta raporu değildir. 53 ortak değerlendirme modülünde 106 araç/uygulama sorusu yeniden kullanılır. 134 kaynak kaydı, kaynak dosyalarının 134 ayrı klinik onayı anlamına gelmez.

Ürünün amacı FTR öğrencilerinin klinik değerlendirme düşüncesini çalıştırmasıdır. Tanı, kişiye özel tedavi reçetesi veya klinik yetkinlik sertifikası sunulmaz. Ücretli sürümün değer önerisi vaka sayısından çok uzman onaylı içerik, tutarlı gerekçe, hedefli tekrar, cihazlar arası ilerleme ve eğitimci araçları olmalıdır.

**İlk karar:** GitHub Pages ticari SaaS ve hassas işlem barındırmak için uygun yayın yeri değildir. Üyelik/ödeme sürümü ayrı sunucu destekli bir dağıtıma taşınmalı; mevcut ücretsiz eğitim adresi geçiş bağlantısıyla korunmalıdır. Bu, yalnız teknik tercih değildir; [GitHub Pages kullanım sınırlarında](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) ticari SaaS kullanımına kısıtlama vardır.

## 2. Önerilen mimari

Mevcut React arayüzü korunur. İçerik derleyicisi ve puanlama fonksiyonları bağımsız paketlere ayrılarak hem sunucuda hem testlerde kullanılabilir. İlk sürüm için mikroservisler yerine tek uygulama ve sınırları belirgin modüller önerilir.

| Katman | Öneri | Karar gerekçesi |
|---|---|---|
| Arayüz | Mevcut React + TypeScript; genel sayfalara gerektiğinde sunucu üretimi | Çalışan öğrenme akışını yeniden yazmadan ilerlemek |
| API | TypeScript sunucu/işlevler; kimlik ve yetki kontrolü her istekte | Puan, içerik erişimi ve abonelik kararı tarayıcıya bırakılmaz |
| Veri | PostgreSQL; başlangıç adayı Supabase | İlerleme, içerik sürümleri ve ödeme ilişkileri; [satır düzeyi yetki](https://supabase.com/docs/guides/database/postgres/row-level-security) |
| Kimlik | Yönetilen kimlik sağlayıcısı; e-posta doğrulama ve güvenli kurtarma | Parola sistemini kendimiz icat etmemek |
| Dosyalar | Yetkili nesne depolama, özel dosyalarda kısa ömürlü erişim | Kullanım hakkı bulunan medyayı ve yedekleri ayırmak |
| Ödeme | Ülke/şirket uygunluğu doğrulanmış sağlayıcı; Türkiye için iyzico abonelik değerlendirmesi | [iyzico abonelik API’si](https://docs.iyzico.com/en/products/subscription) tekrarlayan planları destekler; ticari onay ve güncel koşullar ayrıca doğrulanır |
| Yayın | Ücretli hizmete uygun yönetilen barındırma; özel alan adı, TLS, geliştirme/deneme/üretim ortamları | GitHub kaynak yönetimi sürer, ticari hizmet Pages üzerinde çalıştırılmaz |
| İzleme | Hata izleme, yapılandırılmış sunucu günlükleri, çalışma süresi ve maliyet uyarıları | Sorunu kullanıcı bildirmeden görebilmek; kişisel veriyi günlükten uzak tutmak |

Supabase ve ödeme sağlayıcısı kesin satın alma seçimi değildir. Veri bölgesi, şirket ülkesi, ödeme kabulü, destek, çıkış/migrasyon olanağı ve güncel ücretler sözleşmeden önce karşılaştırılır. Maliyetler kullanıcı/işlem sayısına göre hesaplanır; bu belgede doğrulanmamış sabit fiyat verilmez.

## 3. Üyelik ve kişisel öğrenme alanı

- Misafir olarak ücretsiz örnek vakaları oynama; hesap açınca açık izinle tarayıcı ilerlemesini taşıma. Taşıma yinelenirse aynı girişler tekrar oluşmamalı.
- E-posta doğrulama, oturum açma/kapama, parola kurtarma veya uygun parolasız giriş; hız sınırı ve kötüye kullanım koruması.
- Cihazlar arasında ilerleme, not, kayıtlı vaka ve tekrar listesi eşitleme. Çakışma davranışı açık: denemeler eklenir, not sürümleri korunur; sessiz veri kaybı olmaz.
- Kişisel veri dışa aktarma, hesap silme isteği ve destek akışı. Silme, yedek ve mali kayıtların farklı saklama gereksinimleriyle birlikte tasarlanır.
- Kullanıcıya sunulan notlar eğitim notları içindir; gerçek hastanın kimlik/sağlık kaydı ürüne alınmaz. Sıralama tabloları varsayılan olarak özel; kamuya açıklık ayrıca seçilir.

**Kabul ölçütü:** İki farklı hesap API üzerinden birbirinin notunu, sonucunu veya yedeğini okuyamaz/değiştiremez. Oturumu kapanmış hesap korumalı API’ye erişemez. Kimlik ve yetki olumsuz senaryoları otomatik test edilir.

## 4. Abonelik ve ödeme akışı

İlk paketler: ücretsiz deneme alanı ve bireysel tam erişim. Kurumsal sınıf lisansı daha sonra eklenir. Fiyat ve ücretsiz limit, öğrenci görüşmeleri ile pilot kullanım sonrasında belirlenir; mevcut ücretsiz içeriğe erişim politikası önceden duyurulur.

1. Sunucu kullanıcının seçtiği planı ve fiyat kimliğini doğrular; tarayıcıdan gelen tutarı kabul etmez.
2. Kart bilgisi uygulama sunucusunda tutulmaz. Sağlayıcının güvenli ödeme/abonelik akışı kullanılır.
3. Ödeme dönüş sayfası tek başına erişim açmaz. Doğrulanmış sağlayıcı bildirimi sunucudaki abonelik durumunu günceller.
4. Bildirim imzası sağlayıcının güncel dokümanına göre doğrulanır; olay kimliğiyle tekrar işleme önlenir. Gecikmiş ve sıra dışı gelen olaylar ele alınır. [Stripe webhook dokümanı](https://docs.stripe.com/webhooks) bu olay işleme modelinin birincil referansıdır; seçilen sağlayıcının kendi kuralları uygulanmalıdır.
5. Etkin, deneme, ödeme bekliyor, gecikmiş, iptal, dönem sonunda kapanacak ve iade durumları ayrı modellenir. Başarısız tahsilatta erişim ve varsa ek süre politikası açık olur.
6. Kullanıcı yenileme tarihi, plan, makbuz/fatura bağlantısı ve iptal yolunu kendi panelinde görür. İptal davranışı, iade ve mesafeli satış metinleri işletme ülkesi için uzmanla doğrulanır.

**Kabul ölçütü:** Başarılı, reddedilen, gecikmiş, yinelenen bildirim, iptal, yeniden etkinleşme ve iade senaryoları sağlayıcının deneme ortamında geçer. Sahte dönüş URL’si veya tarayıcıdaki `isPremium` değişikliği erişim açmaz. Gerçek tahsilat ancak işletme ve sözleşme hazırlığı tamamlanınca başlatılır.

## 5. Yönetim paneli ve içerik yayın süreci

| Rol | İzin |
|---|---|
| Öğrenci | Kendi öğrenme kayıtları ve hak kazandığı içerik |
| İçerik yazarı | Taslak vaka, kaynak ve soru hazırlama |
| Klinik değerlendirici | Uygun alandaki içeriği kontrol etme; gerekçeli düzeltme isteme |
| Yayın sorumlusu | Onaylı sürümü yayımlama/geri çekme |
| Destek/faturalama | İhtiyaç kadar hesap/ödeme durumu; kişisel notlara varsayılan erişim yok |
| Yönetici | Rol ve işletme ayarları; çok faktörlü doğrulama ve denetim kaydı |

Yönetim ekranı bir URL’yi gizlemekle korunmaz. Rol kontrolleri sunucuda uygulanır. Kendi içeriğini tek başına onaylayarak yayımlamaya izin verilmez. Her değişiklikte eski sürüm, düzenleyen, zaman, değişiklik gerekçesi ve onay saklanır.

Panel modülleri: içerik arama ve önizleme; vaka/modül/kaynak editörü; kaynak sürümü ve ölçek lisansı kaydı; taslak → klinik inceleme → dil/UX incelemesi → onay → yayın; hata bildirimi kuyruğu; geri çekme/geri alma; hesap ve abonelik destek ekranları; içerik ve öğrenme özetleri.

**Klinik yayın kapısı:** Her ana öykü ve dört bulgu örüntüsü, o klinik alanda yetkin bir FTR uzmanı tarafından değerlendirilir. Onay, kapsadığı senaryo/araç/sürümle ilişkilidir. Çelişen bulgu, yaş dışı araç, belirsiz yanlış seçenek, uygunluk koşulu ve “öncelikli değil” gerekçesi özellikle incelenir. Otomatik üretim ya da kaynak bağlantısı uzman onayı yerine geçmez. Yeni klinik iddialar incelemeden canlıya çıkmaz.

## 6. Veri modeli ve sürümleme

Başlangıç tabloları:

- `profiles`, `user_roles`: kimlik sağlayıcısının kullanıcı kimliği; kişiye kendi rolünü yükseltme izni yok.
- `case_blueprints`, `case_versions`, `scenario_variants`: klinik ana öykü, değişmez sürüm, bağlam ve bulgu birleşimi.
- `evaluation_modules`, `question_versions`, `options`, `case_domains`: yapılandırılmış değerlendirme dalları ve gerekçeler.
- `sources`, `source_links`, `content_reviews`, `content_licenses`: dayanak, erişim/sürüm bilgisi, inceleyen ve kullanım hakkı.
- `attempts`, `answers`, `bookmarks`, `notes`: kullanıcıya ait öğrenme kayıtları. Deneme, çözüldüğü vaka/soru sürümüne bağlanır.
- `plans`, `subscriptions`, `entitlements`, `payment_events`: sağlayıcı kimlikleri ve sunucuda hesaplanan erişim.
- `audit_events`, `content_reports`: kritik işlem ve hata bildirimi; günlüklerde parola, kart bilgisi veya not metni yok.

Mevcut vaka kimlikleri korunur. Soru cevabı değişirse geçmiş sonuç eski anahtarla açıklanabilir kalır; sessizce yeniden yorumlanmaz. Veritabanı değişiklikleri sürümlü migrasyonla yapılır. Yedek almak kadar geri yükleme denemesi de zorunludur.

Ücretli/korumalı soru anahtarları herkese açık JavaScript paketine gömülmez. Yetkili API gerekli soruyu verir, yanıtı sunucu değerlendirir ve açıklamayı uygun aşamada döndürür. Mevcut açık kaynak içerik için mutlak kopyalama engeli vaat edilmez.

## 7. Kalite, güvenlik ve işletme hazırlığı

Teknik kapılar: TypeScript/üretim derlemesi, tüm içerikte yapısal ve anlamsal kurallar, puanlama sınırları, hesaplar arası erişim engeli, ödeme olumsuz senaryoları, gerçek telefonlarda başlıca kullanıcı yolları. Klavye, ekran okuyucu, büyütme, kontrast ve hareket azaltma denetimi WCAG 2.2 AA hedefiyle yürütülür; uygunluk ölçmeden ilan edilmez.

[OWASP ASVS](https://asvs.owasp.org/) üzerinden kimlik, yetki, girdi, oturum ve günlükleme kontrolleri seçilir. Gizli anahtarlar yalnız sunucuda tutulur. Yönetici için MFA; en az yetki; bağımlılık ve gizli bilgi taraması; kötüye kullanım sınırları; güvenlik başlığı ve geri alma planı uygulanır. İade veya hesap silme gibi kritik işlemler denetim kaydına alınır.

Türkiye’de hizmet verilecekse veri sorumlusu, aydınlatma, saklama, ilgili kişi başvurusu ve yurt dışı aktarım düzeni işletme bağlamında değerlendirilir. Güncel başlangıç referansı [KVKK Kurumu](https://www.kvkk.gov.tr/) ve kurumun yönlendirdiği mevzuattır. Bu yol haritası hukuki uygunluk onayı değildir. Gerçek hasta verisi toplamama tercihi veri riskini azaltır; üyelik verisine ilişkin yükümlülükleri ortadan kaldırmaz.

İşletme kapıları: şirket/ödeme sağlayıcısı onayı, alan adı ve kurumsal iletişim, kullanım/gizlilik/abonelik metinleri, ölçek ve medya kullanım hakları, destek/şikâyet kanalı, hata ve klinik içerik düzeltme politikası, olay müdahalesi, yedek geri yükleme denemesi ve maliyet uyarıları.

## 8. Uygulama sırası ve teslim kapıları

Süreler ön tahmindir; bir geliştirici, erişilebilir bir tasarımcı desteği ve düzenli klinik değerlendirici katkısı varsayar. Klinik inceleme hızı toplam takvimi belirleyebilir.

| Aşama | Yaklaşık süre | Çıktı | Sonraki aşamaya geçiş |
|---|---|---|---|
| 0 — İçerik ve pilot | 1–2 hafta başlangıç; inceleme sürekli | 15–30 öğrenci görüşmesi, klinik inceleme listesi, örnek onaylı alt küme, paket hipotezi | Kritik klinik belirsizlikler ve kullanıcı görevi netleşir |
| 1 — Sunucu ve kimlik | 2–3 hafta | Ticari barındırma, üyelik, veri modeli, RLS, tarayıcı kaydı taşıma | Hesaplar arası erişim testleri ve geri yükleme geçer |
| 2 — İçerik yönetimi | 2–3 hafta | Editör, klinik onay, sürümleme, hata bildirimi | Onaysız içerik yayımlanamaz; geçmiş sonuç açıklanabilir |
| 3 — Abonelik | 1–2 hafta | Deneme ödeme akışı, erişim hakları, iptal/destek ekranları | Olumsuz ödeme senaryoları ve işletme hazırlığı tamam |
| 4 — Kapalı beta | 2 hafta | Gerçek cihazlarla kullanım, erişilebilirlik ve güvenlik düzeltmeleri | Kritik hata yok, destek/geri alma işletilebilir |
| 5 — Kontrollü yayın | Kademeli | Sınırlı ücretli açılış, izleme, müşteri desteği | Klinik ve teknik geri bildirimle büyütme |

İlk yayında kapsam dışında: canlı hasta yükleme, otomatik tıbbi öneri, klinik yeterlik sertifikası, sosyal ağ, karmaşık kurum yönetimi ve denetimsiz AI vaka yayını. Daha sonra kurum/sınıf paneli, eğitimci ödevleri, aralıklı tekrar, içerik editöründe tutarlılık asistanı, lisanslı medya ve çevrimdışı kullanım değerlendirilebilir.

## 9. Başarı ölçümü ve harcama kontrolü

İzlenecekler: ilk vaka tamamlama, yedi gün içinde dönüş, aynı ana öykünün tekrarında karar değişimi, hata bildirimi oranı, klinik incelemede geri dönen içerik oranı, mobil görev tamamlama, ödeme dönüşümü ve iptal nedenleri. Yalnız kullanıcı sayısı veya senaryo adedi kalite ölçüsü sayılmaz. Ayrıntılı notlar analitik olaylarına gönderilmez.

Aylık gider tablosu barındırma, veritabanı, e-posta, depolama/aktarımı, izleme, ödeme komisyonu, klinik içerik incelemesi ve destek kalemlerini ayrı tutmalıdır. Ücretsiz paket sınırları kalıcı iş modeli varsayılmaz; bütçe uyarısı ve kullanım üst sınırı konur. Sağlayıcı hesabı, ücretli plan veya gerçek ödeme bu planın teslimiyle otomatik açılmaz.

**Önerilen ilk somut iş:** Uzman tarafından onaylanmış küçük bir içerik alt kümesi + güvenli üyelik/ilerleme eşitlemesi. Abonelik, bu temel ve işletme hazırlığı tamamlandıktan sonra açılır.
