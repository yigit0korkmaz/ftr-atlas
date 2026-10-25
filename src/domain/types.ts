export interface Source { id:string; title:string; url:string; kind:string; note?:string; verification?:string; accessedAt?:string }
export interface Option { id:string; text:string; correct:boolean; why:string }
export interface Question { prompt:string; type:'single'|'multi'; options:Option[]; explanation:string; sourceIds:string[] }
export interface EvaluationModule { id:string; title:string; summary:string; sourceIds:string[]; toolQuestion:Question; applicationQuestion:Question }
export interface Domain { id:string; label:string; moduleId:string; required:boolean; rationale:string; cue:string; sourceIds:string[] }
export interface ClinicalCase { id:string; disease:string; title:string; profile:Record<string,string|number>; story:string; goals:string[]; domains:Domain[]; sourceIds:string[]; provenance?:{kind:'synthetic';blueprintId:string;contextId:string;focusId:string;focusLabel:string;reviewStatus:string} }
export interface Bank { version:string; reviewDate:string; sources:Source[]; modules:EvaluationModule[]; cases:ClinicalCase[] }
export type Part='tool'|'application';
export type Stage='brief'|'domains'|'planFeedback'|'branch';
export interface Answer { selected:string[]; correct:boolean }
export interface RouteEntry { domainId:string; origin:'selected'|'missed' }
export interface Session { id:string; caseId:string; bankVersion:string; stage:Stage; domainOrder:string[]; selected:string[]; queue:RouteEntry[]; queueIndex:number; part:Part; draft:string[]; answers:Record<string,Partial<Record<Part,Answer>>>; started:number; orders:Record<string,Record<Part,string[]>> }
export interface Summary { plan:number; tools:number; applications:number; toolCorrect:number; applicationCorrect:number; required:number; missed:number; extra:number; overall:number }
export interface Result extends Session { finished:number; summary:Summary }
export interface Completed { attempts:number; best:number; last:number; lastAt:number; lastSummary?:Summary }
export interface HistoryEntry { caseId:string; finished:number; summary:Summary }
export interface Progress { completed:Record<string,Completed>; bookmarks:string[]; history:HistoryEntry[]; active:Session|null; lastResult:Result|null; notes:Record<string,string> }
export interface Preferences { theme:'light'|'dark'|'system'; readingSize:18|20|22; motion:boolean; focus:boolean }
