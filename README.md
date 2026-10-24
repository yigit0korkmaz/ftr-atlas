# FTR Atlas · Klinik Rota 2

**Oyna:** https://yigit0korkmaz.github.io/ftr-atlas/

36 ayrıntılı vaka · 12 klinik alan · 50 değerlendirme modülü · 100 araç/uygulama kararı · 103 kaynak kaydı.

## Oyun akışı

1. Hastalık/klinik alan seçilir. Aynı alanda farklı yaş, evre, işlev ve hedeflere sahip vaka dosyaları bulunur.
2. Öykü ve görüşme hedefleri okunur; öncelikli değerlendirme alanları, uygun olmayan seçeneklerden ayrılır.
3. Her alan için gerekçe, vakadaki dayanak ve kaynak gösterilir.
4. Önce seçilen alanların araç ve uygulama dallarına ilerlenir. Öncelik dışı seçilen alanlar yalnız yöntem öğrenimi için açılır. Atlanan gerekli alanlar sonradan açıkça işaretlenmiş telafi durağına eklenir.
5. İlk önceliklendirme, gerekli alanlardaki araç seçimi ve gerekli alanlardaki uygulama kararı ayrı raporlanır. Telafi ilk alan seçimini değiştirmez. Ek öğrenme dalları puanı yükseltmez.

Alan puanı doğru seçme ve doğru eleme kararlarının tüm alanlara oranıdır. Araç/uygulama kararlarında tüm doğru seçenekler seçilmeli, yanlış seçenekler boş bırakılmalıdır. Seçenekler ve alanların sırası yeni rotada karışır. Aynı değerlendirme gözlemi birden fazla alanı bilgilendirebilir; bütün uygun alternatif araçları aynı hastada uygulama zorunluluğu yoktur.

## Kapsam

İnme, Parkinson, omurilik yaralanması, MS, pediatri, kas-iskelet, ağrı, iş/ergonomi, vestibüler/geriatri, protez-ortez, ödem ve kardiyopulmoner vakalar. Pediatride serebral palsi, motor gecikme, spina bifida ve DMD örnekleri bulunur.

Vaka öncelikleri yalnız açıklanan görüşme/hedefler için eğitimsel anahtardır; hastanın eksiksiz klinik değerlendirmesi veya tüm FTR müfredatı değildir. Vakalar kurgusaldır. İçerik bağımsız öğretim üyesi onayı almış değildir; sıfır hata garantisi yoktur. Kaynak kontrol tarihi 24 Ekim 2026. Tam ölçek formları çoğaltılmaz. Türkçe eğitim metni ölçeklerin doğrulanmış Türkçe sürümü veya uygulama yetkisi yerine geçmez.

## İlerleme ve dosyalar

Üyelik gerekmez; ilerleme tarayıcıda saklanır. Klinik v2 kaydı eski v1 bilgi sorusu kaydından ayrı tutulur ve onu silmez. Yedek dışa/içe aktarma tamamlanan vaka puanlarını, kaydedilen vakaları ve uyumlu yarım rotayı taşır; tur geçmişini ve son özet ekranını taşımaz.

Ana uygulama: `clinical-app.js`, içerik: `clinical-bank.js`, rota/puanlama: `clinical-engine.js`, ek stil: `clinical.css`. Eski v1 dosyaları ana oyun akışına yüklenmez. Derleme, API anahtarı veya paket kurulumu gerekmez. GitHub Pages main dalının kök dizininden yayınlanır.

İçerik önerileri GitHub Issues üzerinden vaka/alan kimliği ve kaynakla iletilebilir. Gerçek hasta bilgisi paylaşılmamalıdır. Son sürümün ayrıntılı kullanıcı denemeleri kullanıcıya bırakılmıştır.
