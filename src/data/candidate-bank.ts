// Imported only by the separate, lazy-loaded editorial workspace.
import raw from './clinical-bank.json';
import expansion from './expansion.json';
import {expandBank} from './expand';
import type {Expansion} from './expand';
import type {Bank} from '../domain/types';
import {bundleFromBank} from '../editorial/release';
export const candidateBank=expandBank(raw as Bank,expansion as Expansion);
export const candidateCases=candidateBank.cases;
export const candidateMap=Object.fromEntries(candidateCases.map(c=>[c.id,c]));
export const candidateDiseases=[...new Set(candidateCases.map(c=>c.disease))];
export const candidateBundle=(id:string)=>bundleFromBank(candidateBank,id);
