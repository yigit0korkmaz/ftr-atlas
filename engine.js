(function(root){
  'use strict';
  function shuffled(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function seeded(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function correct(q,ids){const expected=q.options.filter(o=>o.correct).map(o=>o.id);return ids.length===expected.length&&expected.every(id=>ids.includes(id));}
  function pick(questions,progress,count,rng=Math.random){return shuffled(questions,rng).sort((a,b)=>{const pa=progress[a.id],pb=progress[b.id];const rank=p=>!p?0:!p.lastCorrect?1:2;return rank(pa)-rank(pb)||(pa?.lastSeen||0)-(pb?.lastSeen||0);}).slice(0,count);}
  function validate(bank){const errors=[],ids=new Set(),sources=new Set(bank.sources.map(s=>s.id));for(const q of bank.questions){if(ids.has(q.id))errors.push('Tekrar kimlik: '+q.id);ids.add(q.id);const n=q.options.filter(o=>o.correct).length;if(n<1||(q.type==='single'&&n!==1)||(q.type==='multi'&&n<2))errors.push('Yanıt yapısı: '+q.id);if(new Set(q.options.map(o=>o.id)).size!==q.options.length)errors.push('Seçenek kimliği: '+q.id);if(!q.sourceIds?.length||q.sourceIds.some(s=>!sources.has(s)))errors.push('Kaynak: '+q.id);for(const key of ['caseId','caseTitle','caseText','prompt','explanation','category','difficulty'])if(!q[key])errors.push(key+': '+q.id);if(q.options.some(o=>!o.text||!o.why))errors.push('Eksik seçenek: '+q.id);}return errors;}
  const api={shuffled,seeded,correct,pick,validate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FTR=api;
})(typeof window!=='undefined'?window:globalThis);
