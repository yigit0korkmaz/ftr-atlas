import type {ClinicalCase,Completed} from '../../domain/types';
export const PAGE_SIZE=24;
export const statusOptions=[{value:'all',label:'Tüm vakalar'},{value:'new',label:'Henüz başlamadıklarım'},{value:'saved',label:'Kaydettiklerim'},{value:'done',label:'Tamamladıklarım'},{value:'review',label:'Tekrar çalışacaklarım'}];
export function filterCases(items:ClinicalCase[],{disease='',query='',status='all',completed={},bookmarks=[]}:{disease?:string;query?:string;status?:string;completed?:Record<string,Completed>;bookmarks?:string[]}){
 const term=query.trim().toLocaleLowerCase('tr');
 return items.filter(c=>(!disease||c.disease===disease)&&(!term||[c.id,c.title,c.story,c.disease,...c.goals,...Object.values(c.profile)].join(' ').toLocaleLowerCase('tr').includes(term))&&(status==='all'||status==='saved'&&bookmarks.includes(c.id)||status==='new'&&!completed[c.id]||status==='done'&&!!completed[c.id]||status==='review'&&completed[c.id]?.last<100));
}
export function pageSlice<T>(items:T[],requested:number,size=PAGE_SIZE){const pages=Math.max(1,Math.ceil(items.length/size)),page=Math.min(pages,Math.max(1,Number.isFinite(requested)?Math.floor(requested):1));return {items:items.slice((page-1)*size,page*size),page,pages,start:items.length?(page-1)*size+1:0,end:Math.min(page*size,items.length),total:items.length};}
