export type Equipment = {
  id: string;
  name: string;
  group: "Egzersiz" | "Yürüme desteği" | "Değerlendirme";
  description: string;
  features: string[];
  fact: string;
  source?: string;
};
export const detectiveSources = {
  walking: {
    title: "NHS · Yürüme yardımcıları",
    url: "https://www.nhs.uk/social-care-and-support/care-services-equipment-and-care-homes/walking-aids-wheelchairs-and-mobility-scooters/",
  },
  goniometer: {
    title: "NCBI Bookshelf · Goniometer",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK558985/",
  },
  oximeter: {
    title: "NIST · Pulse oximeters",
    url: "https://www.nist.gov/how-do-you-measure-it/how-do-you-measure-blood-oxygen-levels",
  },
};
export const equipmentCards: Equipment[] = [
  {
    id: "dumbbells",
    name: "Dambıl",
    group: "Egzersiz",
    description: "Elde tutulan serbest ağırlık.",
    features: ["exercise", "grip", "pair", "weights"],
    fact: "Bu destede bir çift dambıl çizilmiştir. Aynı alet tek olarak da kullanılabilir.",
  },
  {
    id: "band",
    name: "Direnç bandı",
    group: "Egzersiz",
    description: "Esneyebilen egzersiz şeridi.",
    features: ["exercise", "strip"],
    fact: "Direnç bantları şerit veya halka biçiminde olabilir. Bu oyunda açık bir şerit olarak gösterilir.",
  },
  {
    id: "ball",
    name: "Egzersiz topu",
    group: "Egzersiz",
    description: "Büyük, hava ile şişirilen top.",
    features: ["exercise", "sphere"],
    fact: "Bu destedeki model büyük bir egzersiz topudur; küçük el toplarından farklı bir çizimle temsil edilir.",
  },
  {
    id: "balance",
    name: "Denge tahtası",
    group: "Egzersiz",
    description: "Altında destek bulunan dairesel platform.",
    features: ["exercise", "platform", "roundPlatform"],
    fact: "Denge tahtalarının farklı biçimleri vardır. Buradaki model yuvarlak bir platformdur.",
  },
  {
    id: "roller",
    name: "Köpük rulo",
    group: "Egzersiz",
    description: "Silindir biçimli köpük ekipman.",
    features: ["exercise", "cylinder"],
    fact: "Köpük ruloların yüzeyi düz veya dokulu olabilir. Bu destede dokulu bir silindir çizilmiştir.",
  },
  {
    id: "mat",
    name: "Egzersiz matı",
    group: "Egzersiz",
    description: "Zemine serilen düz çalışma yüzeyi.",
    features: ["exercise", "platform", "mat"],
    fact: "Bu destede mat, açılmış ve zemine serilmiş biçimde gösterilir.",
  },
  {
    id: "treadmill",
    name: "Koşu bandı",
    group: "Egzersiz",
    description: "Hareketli bant yüzeyi olan egzersiz cihazı.",
    features: ["exercise", "screen", "grip", "platform", "frame", "movingBelt"],
    fact: "Bu oyundaki çizimde ekran ve tutacaklar bulunur. Bunlar her model için zorunlu özellikler değildir.",
  },
  {
    id: "bike",
    name: "Sabit bisiklet",
    group: "Egzersiz",
    description: "Yer değiştirmeden pedal çevrilen ekipman.",
    features: ["exercise", "screen", "grip", "frame", "pedals", "seat"],
    fact: "Bu destedeki modelde sele, pedal, gidon ve ekran bulunur.",
  },
  {
    id: "parallel",
    name: "Paralel bar",
    group: "Yürüme desteği",
    description: "Yan yana iki sabit tutunma barı.",
    features: ["walking", "grip", "frame", "fixedRails"],
    fact: "Bu oyunda tek ekipman olarak çizilen paralel bar, yan yana iki uzun bar içerir.",
  },
  {
    id: "walker",
    name: "Yürüteç",
    group: "Yürüme desteği",
    description: "Birden çok ayağı ve iki tutacağı olan destek.",
    features: ["walking", "grip", "frame", "portableAid"],
    fact: "Yürüteçlerin tekerlekli ve tekerleksiz modelleri vardır. Bu destede tekerleksiz model kullanılmıştır.",
    source: "walking",
  },
  {
    id: "crutches",
    name: "Koltuk değneği",
    group: "Yürüme desteği",
    description: "Bu destede çift olarak çizilen koltuk altı destekli değnek.",
    features: ["walking", "grip", "pair", "longStem", "portableAid"],
    fact: "Bu destede koltuk altı destekli bir çift değnek gösterilir. Dirsek destekli modeller de vardır.",
    source: "walking",
  },
  {
    id: "cane",
    name: "Baston",
    group: "Yürüme desteği",
    description: "Tutma sapı olan tek gövdeli destek.",
    features: ["walking", "grip", "longStem", "portableAid"],
    fact: "Bu destede tek ayaklı baston çizilmiştir. Üç veya dört ayaklı modeller de bulunur.",
    source: "walking",
  },
  {
    id: "goniometer",
    name: "Gonyometre",
    group: "Değerlendirme",
    description: "Açı ölçümü için ölçekli, hareketli kollu araç.",
    features: ["assessment", "printedScale", "hinge"],
    fact: "Gonyometre eklem hareket açıklığını açı cinsinden değerlendirmede kullanılır. Bu çizimde iki kollu model yer alır.",
    source: "goniometer",
  },
  {
    id: "hammer",
    name: "Refleks çekici",
    group: "Değerlendirme",
    description: "Sapı ve başlığı olan refleks değerlendirme aracı.",
    features: ["assessment", "grip", "hammerHead"],
    fact: "Refleks çekiçleri farklı başlık şekillerine sahiptir. Burada üçgen başlıklı model çizilmiştir.",
  },
  {
    id: "tape",
    name: "Mezura",
    group: "Değerlendirme",
    description: "Üzerinde ölçü çizgileri bulunan esnek şerit.",
    features: ["assessment", "printedScale", "strip"],
    fact: "Mezura uzunluk ve çevre ölçümlerinde kullanılan esnek bir ölçüm aracıdır.",
  },
  {
    id: "oximeter",
    name: "Parmak tipi oksimetre",
    group: "Değerlendirme",
    description: "Parmak ucuna yerleştirilen ekranlı cihaz.",
    features: ["assessment", "screen", "hinge", "fingerClip"],
    fact: "Parmak tipi oksimetre, oksijen satürasyonunu tahmin etmek için kullanılır; genellikle nabız hızını da gösterir. Görseldeki ekran yalnızca örnektir.",
    source: "oximeter",
  },
];
export type DetectiveQuestion = {
  id: string;
  text: string;
  section: "Grup" | "Görünüm" | "Ayırt edici";
  explanation: string;
};
export const detectiveQuestions: DetectiveQuestion[] = [
  {
    id: "assessment",
    text: "Bu destede değerlendirme araçları grubunda mıyım?",
    section: "Grup",
    explanation:
      "Bu grubun kartları gonyometre, refleks çekici, mezura ve parmak tipi oksimetredir.",
  },
  {
    id: "walking",
    text: "Bu destede yürüme desteği grubunda mıyım?",
    section: "Grup",
    explanation:
      "Paralel bar, yürüteç, koltuk değneği ve baston bu oyun grubundadır.",
  },
  {
    id: "exercise",
    text: "Bu destede egzersiz ekipmanları grubunda mıyım?",
    section: "Grup",
    explanation:
      "Gruplama, oyundaki temel tanıtım amacına göredir; klinik kullanım alanları birbirini dışlamaz.",
  },
  {
    id: "screen",
    text: "Çizimde dijital ekranım var mı?",
    section: "Görünüm",
    explanation: "Yalnızca bu destede gösterilen ekranlı modeller esas alınır.",
  },
  {
    id: "printedScale",
    text: "Üzerimde basılı ölçü çizgileri var mı?",
    section: "Görünüm",
    explanation: "Dijital ekrandaki sayılar, basılı ölçü çizgisi sayılmaz.",
  },
  {
    id: "grip",
    text: "Çizimde belirgin bir tutma sapım veya tutacağım var mı?",
    section: "Görünüm",
    explanation:
      "Özel tutma sapı veya barı aranır; elle kavranabilen her nesne bu özelliğe sahip sayılmaz.",
  },
  {
    id: "strip",
    text: "Esnek bir şerit biçiminde miyim?",
    section: "Görünüm",
    explanation:
      "Şerit olarak çizilen direnç bandı ve mezura bu özelliği taşır.",
  },
  {
    id: "pair",
    text: "Çizimde iki eş alet olarak mı gösteriliyorum?",
    section: "Görünüm",
    explanation:
      "Bir çift dambıl ve bir çift koltuk değneği esas alınır. İki barı olan tek bir paralel bar bu grupta değildir.",
  },
  {
    id: "platform",
    text: "Geniş, düz bir çalışma yüzeyim var mı?",
    section: "Görünüm",
    explanation:
      "Mat, denge tahtası ve koşu bandının platform yüzeyi esas alınır.",
  },
  {
    id: "frame",
    text: "Çizimde birden çok ayaklı destek gövdem var mı?",
    section: "Görünüm",
    explanation:
      "Koşu bandı, sabit bisiklet, paralel bar ve yürütecin gövde ayakları esas alınır.",
  },
  {
    id: "longStem",
    text: "Tek veya çift uzun değnek gövdem var mı?",
    section: "Görünüm",
    explanation: "Baston ve koltuk değneği çizimleri bu özelliği taşır.",
  },
  {
    id: "hinge",
    text: "Açılıp kapanan veya dönen bağlantım var mı?",
    section: "Görünüm",
    explanation:
      "Gonyometrenin dönen kol bağlantısı ile oksimetrenin klips bağlantısı esas alınır.",
  },
  {
    id: "portableAid",
    text: "Taşınabilen bir yürüme yardımcısı mıyım?",
    section: "Grup",
    explanation:
      "Bu destede baston, koltuk değneği ve yürüteç; zeminde sabit duran paralel bardan ayrılır.",
  },
  {
    id: "sphere",
    text: "Ana gövdem büyük bir küre biçiminde mi?",
    section: "Ayırt edici",
    explanation: "Büyük, küresel egzersiz topu çizimi esas alınır.",
  },
  {
    id: "cylinder",
    text: "Ana gövdem köpük bir silindir mi?",
    section: "Ayırt edici",
    explanation: "Köpük rulo çizimi esas alınır.",
  },
  {
    id: "roundPlatform",
    text: "Yuvarlak bir platform ve altında merkezî destek var mı?",
    section: "Ayırt edici",
    explanation: "Bu destedeki denge tahtası modelinin biçimidir.",
  },
  {
    id: "mat",
    text: "Zemine serilmiş bir minder yüzeyi miyim?",
    section: "Ayırt edici",
    explanation: "Açılmış egzersiz matı çizimi esas alınır.",
  },
  {
    id: "movingBelt",
    text: "Üzerinde yürünebilen hareketli bant yüzeyim var mı?",
    section: "Ayırt edici",
    explanation: "Koşu bandının karakteristik yüzeyidir.",
  },
  {
    id: "pedals",
    text: "Pedallarım var mı?",
    section: "Ayırt edici",
    explanation: "Sabit bisiklet çizimindeki pedallar esas alınır.",
  },
  {
    id: "seat",
    text: "Çizimde bir selem var mı?",
    section: "Ayırt edici",
    explanation: "Bu destedeki sabit bisikletin selesi esas alınır.",
  },
  {
    id: "fixedRails",
    text: "Yan yana iki uzun sabit tutunma barım var mı?",
    section: "Ayırt edici",
    explanation:
      "Tek bir paralel bar ekipmanı, iki yandaki uzun barlarıyla çizilmiştir.",
  },
  {
    id: "hammerHead",
    text: "Bir sapın ucunda üçgen başlığım var mı?",
    section: "Ayırt edici",
    explanation: "Bu destedeki refleks çekici modelidir.",
  },
  {
    id: "weights",
    text: "Tutma saplarımın iki ucunda ağırlık blokları var mı?",
    section: "Ayırt edici",
    explanation: "Dambıl çiftinin ağırlık blokları esas alınır.",
  },
  {
    id: "fingerClip",
    text: "Parmak ucuna takılan bir klips biçiminde miyim?",
    section: "Ayırt edici",
    explanation: "Parmak tipi oksimetre çizimi esas alınır.",
  },
];
export const equipmentById = new Map(equipmentCards.map((c) => [c.id, c]));
export const questionById = new Map(detectiveQuestions.map((q) => [q.id, q]));
export const answerFor = (cardId: string, questionId: string): boolean =>
  equipmentById.get(cardId)?.features.includes(questionId) ?? false;
export function bestQuestion(candidates: string[], asked: string[]) {
  return (
    detectiveQuestions
      .filter((q) => !asked.includes(q.id))
      .map((q) => ({
        q,
        split: Math.min(
          candidates.filter((id) => answerFor(id, q.id)).length,
          candidates.filter((id) => !answerFor(id, q.id)).length,
        ),
      }))
      .filter((x) => x.split > 0)
      .sort((a, b) => b.split - a.split)[0]?.q ?? null
  );
}
