# FTR Atlas — Vaka inceleme ve onay kılavuzu

25 Ekim 2026 · v5

İnceleme alanı: https://yigit0korkmaz.github.io/ftr-atlas/#/review

## Neler yapabilirsin?

1. Klinik alan, vaka kodu veya inceleme durumuyla arama yap. 1.060 aday vaka ayrı listelenir; 24 kayıtlık sayfalama vardır.
2. Bir vaka aç. **Öykü ve hedefler** bölümünde başlık, profil, klinik dönem, öykü ve görüşme hedeflerini düzenle.
3. **Alanlar ve testler** bölümünde her değerlendirme dalını aç. Öncelik kararını, gerekçeyi, vaka dayanağını, modül özetini, araç sorusunu, bütün seçenekleri/doğru yanıtları ve uygulama sorusunu incele. Alan ve seçenek ekleyip kaldırabilirsin. Modül düzenlemesi bu vaka taslağına aittir; diğer vakayı sessizce değiştirmez.
4. **Kaynaklar** bölümünden bağlantıları aç; başlık, URL, tür ve kaynak notunu düzenle. Kaynak ve soru ilişkileri ilgili bölümlerde seçilir. **Tüm girdiler** sekmesinde yapılandırılmış JSON görünür; ileri düzenlemeler önce taslağa uygulanır.
5. Bir alanın yanındaki **not simgesine** bas. İlgili bölüm adı not kutusuna gelir. Notu yazıp kaydet. **Bu not ele alınmadan onay verilmesin** seçiliyse vaka, açık düzeltme notu varken onaylanamaz.
6. İçeriği değiştirdiğinde **Taslağı kaydet**. Yapısal bir sorun varsa listelenir. Eksik kaynak veya hatalı yanıt anahtarıyla onay verilemez; taslak üzerinde çalışmaya devam edebilirsin.
7. Notu ele alınca **Nasıl ele alındığını yaz** üzerinden ne değiştiğini açıkla. Bu işlem notu kapatır; vakayı otomatik onaylamaz.
8. Hazır bulduğun kaydedilmiş sürüm için **Bu vakayı onayla** düğmesini kullan. Açılan pencerede bütün girdileri incelediğini işaretleyip o sürümü açıkça onayla.

Hiçbir vaka başlangıçta senin adına onaylanmadı. Onay sayısı bu nedenle sıfırdan başlar. İnceleme alanındaki onay bir **kullanıcı yayın onayıdır**; bağımsız klinik uzman onayı veya hatasızlık garantisi değildir.

## Kaydetme, geçmiş ve onay

- Notlar ve taslaklar ayrı tutulur. Yazı kutusunda duran, henüz kaydedilmemiş içerik yedeğe veya yayına girmez.
- Kaydedilmemiş taslak/JSON/not ile başka sayfaya geçerken uyarı çıkar. Sekmeyi kapatırken tarayıcı da uyarabilir.
- Her kayıtta yeni taslak sürümü ve işlem kaydı oluşur. Önceki taslak içeriği yeniden çalışma alanına getirilebilir; tekrar kaydedilip onaylanmalıdır.
- Düzenleme, ilgili vakanın önceki onayını kaldırır. Yeni engelleyici not da onayı kaldırır. Notu kapatmak eski onayı geri vermez.
- İki sekme aynı vakayı değiştirirse eski sürüm yeni kaydı sessizce ezemez. Önce güncel sürümü yükle.
- **Onayı geri al**, vakayı sonraki yayın paketinden çıkarır. Hâlihazırdaki herkese açık site ancak yeni paket yayımlandığında değişir.

## İki farklı dosya var

| Dosya | İçeriği | Kullanımı |
|---|---|---|
| `ftr-inceleme-yedegi.json` | Taslaklar, özel inceleme notları, kapatma gerekçeleri, önceki sürümler ve onaylar | Cihaz değiştirme, yedekleme ve notlarına göre düzenleme isteme |
| `ftr-approved-release.json` | Yalnız güncel içeriği onaylanan vakalar ve bu vakaların gerekli modül/kaynakları | Herkese açık oyuna aktarım |

**Yedek ve yayın** düğmesi ikisini de oluşturur. İnceleme yedeği, yayın dosyası yerine kullanılmaz. Özel notlar yayın paketine katılmaz.

Yedeği geri yüklerken kayıtlar birleştirilir; daha yeni yerel taslaklar korunur. Geçerli onayları da geri yüklemek için ayrıca seçim yapman gerekir. Değiştirilmiş içerikle uyuşmayan onay kaydı reddedilir.

## Notlarına göre düzenlememi nasıl istersin?

Önce notlarını ve taslaklarını kaydet. **Not ve taslak yedeğini indir** ile çıkan dosyayı bu konuşmaya ekleyip düzeltmemi iste. Notları, hangi vakaya ve hangi girdiye ait olduklarıyla birlikte okuyabilirim. Düzeltilmiş içerik yeni bir taslak olur; senin adına onaylanmaz. Geri verilen yedeği birleştirip değişiklikleri inceleyerek yeniden onaylayabilirsin.

## Yayın nasıl güncellenir?

Bu sürüm, isteğin doğrultusunda ek hosting veya sunucu kullanmaz. GitHub Pages, tarayıcındaki veritabanını okuyamaz ve kendiliğinden GitHub'a yazamaz.

**Onaylı yayın paketini indir**, sonra dosyayı bu konuşmaya ekleyip yayımlamamı iste. Dosyadaki vaka ve onay ilişkileri kontrol edilir; yalnız onaylı içerik GitHub yayınına alınır. Boş paket, oyunda hiçbir vaka yayımlanmaması anlamına gelir. Bir paketin indirilmesi veya tarayıcıda onay verilmesi tek başına herkese açık siteyi değiştirmez.

## Veriler nerede saklanır?

Veritabanı, Dexie aracılığıyla kullanılan **IndexedDB**'dir. Gerçek, kalıcı tarayıcı veritabanıdır; yalnız açık sayfanın belleği değildir. Ancak **bu tarayıcıya, cihaza ve site adresine** aittir. Başka telefon veya tarayıcı aynı kayıtları otomatik görmez. Cihazlar arasında inceleme yedeğini taşıyabilirsin.

Tarayıcı verilerini silmek, gizli pencere kullanmak veya tarayıcının depolama yönetimi kayıtları etkileyebilir. Düzenli dosya yedeği al. **Kalıcı saklama iste** tarayıcıdan daha kalıcı saklama talep eder; bütün cihazlarda garanti vermez. Oyun ilerlemesiyle inceleme kayıtları ayrı saklanır; yayından ayrılan vakaların eski oyun notları/sonuçları sessizce silinmez.

İnceleme arayüzü yönetici hesabıyla korunmaz. Başkaları kendi tarayıcılarında aynı aday vakaları açabilir; senin cihazındaki özel notları göremez ve GitHub depona yazma yetkileri olmadan senin siteni yayımlayamaz. Kaynak deposu zaten herkese açıktır; taslak içeriğinin gizliliği vaat edilmez. Gerçek hasta kimliği veya özel sağlık kaydı eklemek için tasarlanmamıştır.

## İleride sunucuya geçildiğinde

Arayüz, veri deposuna bir `EditorialRepository` arayüzü üzerinden bağlanır. Yerel veritabanı yerine giriş/rol kontrolü olan bir API adapteri eklenebilir. Aynı taslak, sürüm, not, onay ve yayın doğrulama kuralları korunur. Sunucuya geçişte kimlik, erişim yetkileri ve cihaz eşitlemesi ayrıca uygulanmalıdır; bunlar bu yerel sürümde varmış gibi gösterilmez.
