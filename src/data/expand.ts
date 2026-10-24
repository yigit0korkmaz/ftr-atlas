import type {Bank,ClinicalCase,Domain} from '../domain/types';

export interface Focus {moduleId:string;label:string;positive:string;negative:string;rationale:string;sourceIds:string[]}
export interface Context {title:string;story:string;goal:string}
export interface Blueprint {id:string;disease:string;title:string;age:number|string;setting:string;phase:string;story:string;modules:string[];focusGroup:string;contextGroup:string;sourceIds:string[]}
export interface Expansion {version:string;reviewDate:string;blueprints:Blueprint[];focusGroups:Record<string,Focus[]>;contexts:Record<string,Context[]>;sources:Bank['sources'];modules:Bank['modules']}

const clinicalReason:Record<string,string>={
 'rh-goals':'Güncel güvenlik durumu, önceki işlev ve kişinin hedefi test yükünü ve değerlendirme sırasını belirler.',
 'ne-motor':'İnme sonrası seçici hareket üretimi ile görevi telafi ederek başarma aynı sonuç değildir; motor katkı ayrıca açıklanmalıdır.',
 'ne-trunk':'Oturma ve uzanmada gövde katkısı, gereken destek ve güvenli erişim sınırını belirlemeye yardım eder.',
 'ne-transfer':'Kalkış ve yeniden oturuşta yüzey, kol desteği, deneme sayısı ve fiziksel yardım görev başarısını değiştirir.',
 'ne-balance':'Yük aktarımı ve yön değişimindeki kontrol, güvenli hareket için gereken gözetim ve destekle birlikte değerlendirilmelidir.',
 'ne-gait':'Kısa görev hızı, daha uzun mesafe kapasitesi ve yardımcı cihaz koşulları farklı yürüyüş gereksinimlerini açıklar.',
 'ne-arm':'Uzanma, tutma, bırakma ve iki elin katkısı yalnız kas kuvvetinden anlaşılamaz; hedef nesne görevi gözlenmelidir.',
 'ne-adl':'Klinik kapasite, günlük kullanım ve gereken yardım farklı olabilir; kişinin hedefindeki gerçek görev ayrıca kaydedilmelidir.',
 'ne-neglect':'Öyküdeki bir tarafı kaçırma, uzaysal dikkatin gerçek nesne görevine etkisini ve farkındalığı incelemeyi gerektirir.',
 'ne-freezing':'Donmanın dar alan, dönüş ve ilaç zamanı ilişkisi tek bir düz koridor ölçümüyle açıklanamaz.',
 'ne-sci-neuro':'Omurilik yaralanmasında motor ve duyu bulguları standart, eğitimli nörolojik muayene ile sınıflandırılmalıdır; işlev puanı bunun yerine geçmez.',
 'ne-sci-independence':'Transfer, öz bakım ve mobilitede hazırlık desteği ile fiziksel yardım ayrı kaydedilerek günlük bağımsızlık açıklanmalıdır.',
 'mk-pain':'Ağrının şiddeti, yeri, zaman örüntüsü ve aktivite etkisi birlikte kaydedilmeden görev yüküne yanıt açıklanamaz.',
 'rh-pain':'Ağrı ve rahatsızlık, kişinin iletişimine uygun bildirim veya gözlemle ve günlük görev bağlamıyla birlikte kaydedilmelidir.',
 'mk-back':'Bel yakınmasına bağlı günlük yetersizlik, ağrı şiddeti ve görüntüleme bulgusundan farklı bir ölçüm alanıdır.',
 'mk-neck':'Boyunla ilişkili günlük güçlük için uygun kişi bildirimli ölçüm, hareket muayenesini tamamlar.',
 'mk-upper':'Üst ekstremiteyle günlük nesne kullanımı ve algılanan güçlük, yalnız hareket açısı veya kuvvetle açıklanamaz.',
 'mk-lower':'Dizle ilişkili belirtiler ve alt ekstremite aktivite güçlüğü, hedef yapıya uygun kişi bildirimli ölçümle belgelenmelidir.',
 'ex-lower-general':'Kalça veya ayak hedefinde genel alt ekstremite işlevi ölçülmelidir; diz özgü bir uygulama her bölgeye aktarılmaz.',
 'mk-rom':'Eklem hareket sınırı ve telafi stratejisi görevin mekanik gereksinimini etkiler; aktif/pasif koşullar standart kaydedilmelidir.',
 'rh-rom':'Eklem ve kas uzunluğu sınırı, aktif hareket katkısından ayrılarak yaşa ve klinik kısıtlara uygun ölçülmelidir.',
 'mk-strength':'Kas katkısı izin verilen yük içinde ve ağrı/yardım koşullarıyla ölçülerek görev güçlüğüyle ilişkilendirilmelidir.',
 'rh-strength':'Yaşa, iletişime ve klinik duruma uygun aktif kas katkısı, hareketin ne kadarının destekle başarıldığını ayırmaya yardım eder.',
 'mk-activity':'Kişinin seçtiği günlük aktivitelerin başlangıç güçlüğü kaydedilirse izlem, kişinin önceliği üzerinden açıklanabilir.',
 'mk-ergo':'İşin süresi, tekrarı, çalışma yüksekliği ve çevre yükü gerçek görev örüntüsüyle incelenmeden kişi kapasitesiyle eşleştirilemez.',
 'mk-lift':'Tanımlı iki elle kaldırma işinde yük, yatay/dikey konum, mesafe, sıklık ve kavrama koşulları analiz yönteminin uygunluğunu belirler.',
 'mk-falls':'Düşme çok etkenlidir; öykü, ilaç/ortostatik yakınma, görme, çevre ve hareket katkısı ekip içinde birlikte araştırılır.',
 'mk-balance':'Dönüş ve günlük mobilitede gereken yardım ve güvenlik koşulları, seçilen standart görevle birlikte belgelenmelidir.',
 'mk-chair':'Günlük kalkış güçlüğü için sandalye yüksekliği ve kol desteği açık bir işlevsel kalkış ölçümü gerekir.',
 'mk-vest':'Baş hareketiyle görsel kararsızlık ve yürüme güçlüğü, algılanan günlük etki ile güvenli dinamik görevde birlikte değerlendirilir.',
 'mk-sensation':'Koruyucu duyu ve duyusal örüntü, günlük yükleme ve deri güvenliğini etkileyebilir; dağılım ve test koşulları kaydedilmelidir.',
 'rh-development':'Kesin tanısı olmayan bebekte yaşa uygun gelişim gözlemi ve aile öyküsü gerekir; tek tarama sonucu tanı değildir.',
 'rh-infant-tone':'Bebekte postür, spontan hareket, tonus ve davranış durumu yaşla birlikte değerlendirilir; yetişkin ölçeği doğrudan aktarılmaz.',
 'rh-grossmotor':'Serebral palside kaba motor becerinin standart izlenmesi, yardım koşullarıyla birlikte gerçek değişimi açıklamaya yardım eder.',
 'rh-gait':'Adım, cihaz, destek ve görev koşulları kaydedilerek hareketin günlük ortamdaki karşılığı açıklanmalıdır.',
 'rh-tone':'Pasif harekette hıza bağlı yanıt ile sabit mekanik sınır farklı katkılardır; pozisyon ve hız belgelenmelidir.',
 'rh-dmd':'Yürüyebilen DMD’li çocukta hastalığa uygun motor işlev izlemi, yük ve dinlenme koşullarıyla birlikte yapılmalıdır.',
 'rh-skin':'Deri bütünlüğü, koruyucu duyu ve destek/cihaz teması yükleme ve günlük kullanım güvenliğini doğrudan etkiler.',
 'rh-seating':'Destekli oturma, ayak desteği ve donanım uyumu konforu, erişimi ve kişinin aktif katkısını etkiler.',
 'rh-respiratory':'Hastalık ve belirtilerle ilişkili solunum/öksürük güvenliği, görev yükü ve ilgili ekip planıyla birlikte değerlendirilmelidir.',
 'rh-prosthesis':'Alt ekstremite proteziyle mobilite, rezidüel uzuv ve cihaz koşulları belirtilerek uygun performans/kişi bildirimiyle ölçülmelidir.',
 'rh-edema':'Şişliğin standart nicel kaydı, deri ve klinik güvenlik bulgularıyla birlikte değişimi izlemeye yardım eder.',
 'rh-vitals':'Eski uygunluk onayı güncel güvenliği garanti etmez; semptomlar, ilaçlar ve fizyolojik yanıt test öncesi/sırasında yeniden değerlendirilir.',
 'rh-capacity':'Günlük efor hedefi için standart kapasite görevi, tıbbi uygunluk ve sonlandırma kuralları sağlanarak uygulanmalıdır.',
 'rh-symptoms':'Algılanan efor, dispne ve yorgunluk fizyolojik yanıttan farklı bilgi verir; görev ve zamanla eşleştirilmelidir.',
 'rh-participation':'Klinikte yapabilme ile ev/okul/toplumda gerçekleştirme farklıdır; çevre, yardım ve kişinin tercihleri birlikte araştırılmalıdır.'
};

// The same deterministic compiler is consumed by the browser and quality audit.
// No patient data, live AI generation, random clinical statements or network dependency.
export function expandBank(base:Bank,expansion:Expansion):Bank{
 const modules=[...base.modules,...expansion.modules],moduleMap=Object.fromEntries(modules.map(m=>[m.id,m]));
 const generated:ClinicalCase[]=[];
 for(const p of expansion.blueprints){
  const focuses=expansion.focusGroups[p.focusGroup],contexts=expansion.contexts[p.contextGroup];
  for(let f=0;f<focuses.length;f++)for(let t=0;t<contexts.length;t++){
   const focus=focuses[f],context=contexts[t],id=`ex-${p.id}-${f+1}${t+1}`;
   const domains:Domain[]=p.modules.map((moduleId,i)=>({id:`${id}-d${i+1}`,moduleId,label:moduleMap[moduleId].title,required:true,rationale:`${clinicalReason[moduleId]||moduleMap[moduleId].summary} Bu görüşmedeki hedef: ${context.goal}.`,cue:p.story.split('. ')[0]+'.',sourceIds:[...new Set([...p.sourceIds,...moduleMap[moduleId].sourceIds])]}));
   for(let i=0;i<focuses.length;i++){
    const item=focuses[i],required=i===f;
    domains.push({id:`${id}-f${i+1}`,moduleId:item.moduleId,label:item.label,required,rationale:required?`${item.rationale} ${context.goal} hedefine ilişkin bir başlangıç kaydı oluşturulur.`:`${item.negative} Rutin tarama sürer; bu sınırlı görüşmede ayrıntılı, ayrı bir ölçüm dizisi öncelikli değildir. Yeni bulgu veya hedef oluşursa plan değişir.`,cue:required?item.positive:item.negative,sourceIds:[...new Set([...p.sourceIds,...item.sourceIds])]});
   }
   const sourceIds=[...new Set([...p.sourceIds,...focus.sourceIds])];
   generated.push({id,disease:p.disease,title:`${p.title} · ${context.title}`,profile:{age:p.age,setting:p.setting,phase:p.phase},story:`${p.story}\n\n${context.story}\n\n${focus.positive} ${focuses.filter((_,i)=>i!==f).map(x=>x.negative).join(' ')}\n\nBu dosya, belirtilen hedef için planlanan başlangıç görüşmesini anlatır. Tıbbi stabilite ve test uygunluğu her görüşmede yeniden doğrulanır; kapasiteyi aşan görev zorlanmaz. Tanı tek başına bütün testlerin uygulanmasını gerektirmez.`,goals:[context.goal,focus.rationale,'Bulguları güvenli, tekrarlanabilir ve kişinin yaşam hedefiyle ilişkili biçimde kaydetmek'],domains,sourceIds,provenance:{kind:'synthetic',blueprintId:p.id,contextId:`${p.contextGroup}-${t+1}`,focusId:`${p.focusGroup}-${f+1}`,focusLabel:focus.label,reviewStatus:'Kaynak eşleştirmesi ve otomatik tutarlılık denetimi; bağımsız klinik onay bekliyor'}});
  }
 }
 return {...base,version:expansion.version,reviewDate:expansion.reviewDate,modules,sources:[...base.sources,...expansion.sources],cases:[...base.cases,...generated]};
}
