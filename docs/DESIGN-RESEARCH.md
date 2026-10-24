# FTR Atlas tasarım araştırması

24 Ekim 2026. Kullanıcı yönü: profesyonel eğitim platformu, varsayılan koyu tema, açık tema seçeneği ve öncelikle telefon kullanımı.

## İncelenen ürünler ve uygulamaya yansıması

| Kaynak | Doğrulanan yaklaşım | Atlas kararı |
|---|---|---|
| [AMBOSS özellikleri](https://support.amboss.com/hc/en-us/categories/360004593212-AMBOSS-Features-Functions) | Bilgi kütüphanesi ve soru çalışması arasında bağlantı; metin boyutu ve kayıtlı sorular | Vaka sırasında dosyaya, notlara ve kaynaklara erişim; 18/20/22 px okuma seçimi |
| [UWorld örnek soruları](https://medical.uworld.com/usmle/features/sample-questions/) | Vaka, yanıt, gönderim ve gerekçeli açıklama sırası | Karar öncesi yanıtı saklama; gönderimden sonra her seçeneğin gerekçesi |
| [Osmosis](https://www.osmosis.org/) | Kısa açıklamalar, çalışma öncelikleri ve aktif hatırlama | Tek karara odaklanan ekranlar; bilgi kaynaklarını ikinci katmanda açma |
| [Brilliant](https://brilliant.org/) | Yönlendiren sorular ve sıralı etkileşimli çalışma | Vaka → öncelik → araç → uygulama rotasının görünür olması |
| [Duolingo öğrenme yolu](https://blog.duolingo.com/new-duolingo-home-screen-design/) | Yol üzerinde öğrenme ve tekrarın sıralanması | Kaldığın yerden devam ve tekrar çalışılacak vaka filtresi |
| [Duolingo tekrar rehberi](https://blog.duolingo.com/how-to-review-lessons-on-duolingo/) | Önceki öğrenme adımlarına hedefli dönüş | Tamamlanan kararları geri görüntüleme; ilk seçim puanını koruma |
| [Linear](https://linear.app/) | Ürün sayfasında odaklı çalışma alanı ve bağlamsal düzen | Tutarlı yan gezinme, arama ve sık kullanılan araçlar; marka görünümü kopyalanmadı |
| [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Birincil görevleri açık, ikincil ayrıntıları isteğe bağlı sunma | Kaynak, kapsam ve ayrıntı açıklamaları açılır bölümlerde; tek belirgin ana işlem |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Kontrast, metin büyütme, yeniden akış, odak ve etkileşim hedefleri | Yüksek kontrastlı renkler, klavye odağı, geniş dokunma alanları, mobil tek sütun ve hareket azaltma |

Bu tablo tasarım çıkarımlarını içerir; ürünlerin kapalı/ücretli arayüzlerinin incelendiği iddiası değildir. Resmî bir WCAG uygunluk denetimi yapılmış sayılmaz.

## Görsel sistem

- Koyu petrol zemin, sıcak beyaz metin ve soluk yeşil vurgu. Açık temada aynı anlamsal renk sistemi.
- Yerel sunulan Manrope değişken font; vaka ve yanıt metinleri varsayılan 20 px. Okuma tercihi değiştirilebilir.
- Lucide ikonları: tek aile, tutarlı çizgi kalınlığı; kontrol ikonları erişilebilir ad taşır.
- Motion ile kısa ekran geçişleri. `prefers-reduced-motion` ve uygulama tercihi dikkate alınır. Sürekli dikkat dağıtan hareket kullanılmaz.
- Telefonda alt gezinme ve başparmak erişimindeki sabit karar düğmesi. Odak modunda gezinme gizlenir; geri dönüş kontrolü görünür kalır.
- Kaydetme, not alma, bağlamsal vaka dosyası, arama, filtre, paylaşım, otomatik kayıt ve yedekleme aynı öğrenme akışını destekler.

## Teknik seçimlerin birincil kaynakları

- [Vite statik dağıtım](https://vite.dev/guide/static-deploy): proje adresi için `/ftr-atlas/` taban yolu ve derlenmiş statik çıktı.
- [React](https://react.dev/learn): bileşen bazında ekranlar; veri ve arayüz ayrımı.
- [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog): modal odak yönetimi ve klavye davranışı.
- [Motion AnimatePresence](https://motion.dev/docs/react-animate-presence): kısa, anlamlı ekran geçişleri.
- [Lucide paketleri](https://lucide.dev/packages): tutarlı SVG ikon ailesi.
- [Zustand kalıcı kayıt](https://zustand.docs.pmnd.rs/integrations/persisting-store-data): uygulama durumu ve tarayıcı kaydı için ayrı katman.

## Sonraki geliştirmeler

Vaka içeriği JSON, puanlama saf fonksiyonlar, kayıt katmanı Zustand ve ekranlar özellik klasörlerinde tutulur. Sunucu eşitlemesi, içerik editörü, yeni soru türleri veya yeni klinik alanlar bu katmanlar üzerinden eklenebilir. Mevcut sürümde hesap, merkezi veri tabanı ve cihazlar arası otomatik eşitleme yoktur.
