import raw from './clinical-bank.json';
import expansion from './expansion.json';
import {expandBank} from './expand';
import type {Expansion} from './expand';
import type { Bank } from '../domain/types';
export const bank=expandBank(raw as Bank,expansion as Expansion);
export const blueprintCount=expansion.blueprints.length;
export const cases=bank.cases;
export const modules=bank.modules;
export const caseMap=Object.fromEntries(cases.map(c=>[c.id,c]));
export const moduleMap=Object.fromEntries(modules.map(m=>[m.id,m]));
export const sourceMap=Object.fromEntries(bank.sources.map(s=>[s.id,s]));
export const diseases=[...new Set(cases.map(c=>c.disease))];
export const diseaseInfo:Record<string,{icon:string;description:string;tag:string}>= {
 'İnme':{icon:'brain',description:'Motor kontrol, günlük yaşam ve topluma dönüş.',tag:'Nörolojik rehabilitasyon'},
 'Parkinson':{icon:'activity',description:'Hareket, donma, denge ve bağımsızlık.',tag:'Nörolojik rehabilitasyon'},
 'Omurilik yaralanması':{icon:'accessibility',description:'Nörolojik muayeneden işlevsel bağımsızlığa.',tag:'Nörolojik rehabilitasyon'},
 'Multipl skleroz':{icon:'network',description:'Yorgunluk, hareket performansı ve katılım.',tag:'Nörolojik rehabilitasyon'},
 'Kas-iskelet':{icon:'bone',description:'Bel, boyun, omuz ve dizde hedefe uygun kararlar.',tag:'Ortopedik rehabilitasyon'},
 'Ağrı':{icon:'zap',description:'Ağrı deneyimini işlev ve yaşamla birlikte anla.',tag:'Ağrı bilimi'},
 'İş ve ergonomi':{icon:'briefcase',description:'İşin gereksinimleriyle kişinin kapasitesini eşleştir.',tag:'İş ve yaşam'},
 'Vestibüler ve geriatri':{icon:'compass',description:'Denge, düşmeler ve güvenli günlük mobilite.',tag:'Denge ve mobilite'},
 'Pediatri':{icon:'baby',description:'Çocuk, aile ve çevre için birlikte düşün.',tag:'Pediatrik rehabilitasyon'},
 'Protez ve ortez':{icon:'footprints',description:'Cihaz uyumu, deri güvenliği ve hareket.',tag:'Protez ve ortez'},
 'Ödem':{icon:'droplets',description:'Doku, şişlik ve işlevin bütüncül değerlendirmesi.',tag:'Lenfatik rehabilitasyon'},
 'Kardiyopulmoner':{icon:'heart',description:'Efor, belirtiler ve güvenli işlevsel kapasite.',tag:'Kardiyopulmoner rehabilitasyon'}
};
export const profile=(c:typeof cases[number])=>Object.entries(c.profile).map(([k,v])=>k==='age'&&typeof v==='number'?`${v} yaş`:String(v));
