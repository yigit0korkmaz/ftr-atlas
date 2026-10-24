import {createContext,useContext} from 'react';
export const UIContext=createContext<{openSettings:()=>void;openSearch:()=>void;openGuide:()=>void;openNotes:(id:string)=>void}>({openSettings:()=>{},openSearch:()=>{},openGuide:()=>{},openNotes:()=>{}});
export const useUI=()=>useContext(UIContext);
