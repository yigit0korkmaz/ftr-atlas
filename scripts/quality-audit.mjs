import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {expandBank} from '../src/data/expand.ts';
import {assessPlan,route,summarize,isCorrect} from '../src/domain/engine.ts';
import {filterCases,pageSlice} from '../src/features/catalog/filter.ts';

const root=new URL('../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const start=performance.now(),raw=read('src/data/clinical-bank.json'),expansion=read('src/data/expansion.json'),bank=expandBank(raw,expansion);
const checks=[],check=(name,fn)=>{fn();checks.push(name);};
const unique=(items,name)=>assert.equal(new Set(items).size,items.length,`${name}: repeated ID/content`);
const sources=new Set(bank.sources.map(s=>s.id)),modules=Object.fromEntries(bank.modules.map(m=>[m.id,m]));
const refs=(ids,where)=>{assert.ok(ids?.length,`${where}: no source`);for(const id of ids)assert.ok(sources.has(id),`${where}: missing ${id}`);};
check('1.000 üzerinde deterministik, benzersiz senaryo',()=>{
 assert.ok(bank.cases.length>1000);assert.equal(bank.cases.length,raw.cases.length+expansion.blueprints.length*16);
 unique(bank.cases.map(c=>c.id),'cases');unique(bank.cases.map(c=>c.story.replace(/\s+/g,' ').trim()),'stories');
 assert.deepEqual(expandBank(raw,expansion),bank);
});
check('Kaynak ve modül referans bütünlüğü',()=>{
 unique(bank.sources.map(s=>s.id),'sources');unique(bank.modules.map(m=>m.id),'modules');
 for(const s of bank.sources)assert.equal(new URL(s.url).protocol,'https:');
 for(const m of bank.modules){refs(m.sourceIds,m.id);for(const q of [m.toolQuestion,m.applicationQuestion]){refs(q.sourceIds,m.id);unique(q.options.map(o=>o.id),m.id);assert.ok(q.options.length>=3);const correct=q.options.filter(o=>o.correct);assert.ok(correct.length>0&&correct.length<q.options.length);if(q.type==='single')assert.equal(correct.length,1);else assert.ok(correct.length>=2);assert.ok(q.options.every(o=>o.text.trim().length>0&&o.why.length>10));assert.ok(isCorrect(q,correct.map(o=>o.id)));assert.ok(!isCorrect(q,[]));assert.ok(!isCorrect(q,q.options.map(o=>o.id)));}}
 for(const c of bank.cases){refs(c.sourceIds,c.id);unique(c.domains.map(d=>d.id),c.id);unique(c.domains.map(d=>d.moduleId),c.id);for(const d of c.domains){assert.ok(modules[d.moduleId],`${c.id} missing module ${d.moduleId}`);refs(d.sourceIds,d.id);assert.ok(d.cue&&d.rationale.length>15);}}
});
check('Her senaryoda dört farklı klinik öncelik örüntüsü',()=>{
 for(const b of expansion.blueprints){const group=bank.cases.filter(c=>c.provenance?.blueprintId===b.id);assert.equal(group.length,16);assert.equal(new Set(group.map(c=>c.domains.filter(d=>d.required).map(d=>d.moduleId).sort().join(','))).size,4);assert.equal(new Set(group.map(c=>c.provenance.contextId)).size,4);for(const c of group)assert.ok(c.provenance.kind==='synthetic'&&c.provenance.reviewStatus.includes('onay bekliyor'));}
});
check('Doğru plan %100; boş plan telafi; fazladan seçim cezası; tüm dallar erişilebilir',()=>{
 for(const c of bank.cases){const needed=c.domains.filter(d=>d.required),extra=c.domains.filter(d=>!d.required);assert.ok(needed.length>=2&&extra.length>=2);const ids=needed.map(d=>d.id);assert.equal(assessPlan(c,ids).score,100);assert.ok(assessPlan(c,[...ids,extra[0].id]).score<100);assert.equal(route(c,[]).length,needed.length);assert.ok(route(c,[]).every(r=>r.origin==='missed'));const r=route(c,c.domains.map(d=>d.id));unique(r.map(x=>x.domainId),c.id);assert.equal(r.length,c.domains.length);const answers=Object.fromEntries(needed.map(d=>[d.id,{tool:{selected:[],correct:true},application:{selected:[],correct:true}}]));const summary=summarize(c,{selected:ids,answers});assert.equal(summary.overall,100);assert.equal(summary.tools,100);assert.equal(summary.applications,100);assert.ok(Object.values(summary).every(Number.isFinite));assert.equal(summarize(c,{selected:[],answers:{}}).toolCorrect,0);}
});
check('Tanıya ve yaşa özgü araçların uygunsuz aktarımını engelleyen kurallar',()=>{
 for(const c of bank.cases){const ids=c.domains.filter(d=>d.required).map(d=>d.moduleId);if(ids.includes('ne-sci-neuro')||ids.includes('ne-sci-independence'))assert.equal(c.disease,'Omurilik yaralanması');if(ids.includes('rh-prosthesis'))assert.equal(c.disease,'Protez ve ortez');if(ids.includes('ne-motor')||ids.includes('ne-neglect'))assert.equal(c.disease,'İnme');if(c.provenance){if(ids.includes('rh-grossmotor'))assert.ok(c.story.includes('serebral palsi'));if(ids.includes('rh-dmd'))assert.ok(c.story.includes('yürüyebiliyor'));if(c.title.includes('Spina bifida'))assert.ok(ids.includes('rh-skin'));if(c.title.includes('Diyabetik'))assert.ok(ids.includes('mk-sensation')&&ids.includes('rh-skin'));if(/Kalça|Ayak bileği/.test(c.title))assert.ok(!ids.includes('mk-lower'),'knee-specific application branch in non-knee case');}}
});
check('Arama, filtre, kayıt durumu ve 24 kartlık sayfalama',()=>{
 const all=filterCases(bank.cases,{});assert.equal(all.length,bank.cases.length);const pages=Math.ceil(all.length/24);assert.equal(pageSlice(all,NaN).page,1);assert.equal(pageSlice(all,-4).page,1);assert.equal(pageSlice(all,1e8).page,pages);const paged=[];for(let p=1;p<=pages;p++){const slice=pageSlice(all,p);assert.ok(slice.items.length<=24);paged.push(...slice.items.map(c=>c.id));}assert.deepEqual(paged,all.map(c=>c.id));assert.equal(filterCases(all,{query:'  İNME  '}).some(c=>c.disease==='İnme'),true);assert.equal(filterCases(all,{query:'no-match-zzzz9876'}).length,0);const id=all[0].id;assert.equal(filterCases(all,{bookmarks:[id],status:'saved'})[0].id,id);assert.equal(filterCases(all,{status:'done'}).length,0);for(const disease of new Set(all.map(c=>c.disease)))assert.ok(filterCases(all,{disease}).every(c=>c.disease===disease));
});
check('Türkçe içerikte bozuk kodlama işareti yok',()=>{assert.ok(!JSON.stringify(bank).includes('\uFFFD'));});

const report={scope:'candidate-bank',publishedCases:read('src/data/published-release.json').bank.cases.length,checkedAt:new Date().toISOString(),version:bank.version,passed:checks.length,checks,counts:{cases:bank.cases.length,legacyCases:raw.cases.length,blueprints:expansion.blueprints.length,generatedCases:bank.cases.length-raw.cases.length,clinicalAreas:new Set(bank.cases.map(c=>c.disease)).size,modules:bank.modules.length,questions:bank.modules.length*2,sources:bank.sources.length,domains:bank.cases.reduce((n,c)=>n+c.domains.length,0)},compileAndAuditMs:Math.round(performance.now()-start),limitations:['Otomatik testler klinik doğruluğu kanıtlamaz.','Her bir senaryo bağımsız klinisyen tarafından onaylanmış değildir.','Kaynak URL biçimi denetlenir; her dış bağlantının erişimi/başlığı bu komutla doğrulanmaz.','Üyelik, ödeme ve sunucu tarafı yetkilendirme bu sürümde yoktur.']};
fs.mkdirSync(new URL('docs/',root),{recursive:true});fs.writeFileSync(new URL('docs/quality-results.json',root),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
