import {Component,Suspense,lazy,type ReactNode} from 'react';
import {HashRouter,Route,Routes} from 'react-router-dom';
import {Shell} from './Shell';
const Dashboard=lazy(()=>import('../features/dashboard/Dashboard').then(m=>({default:m.Dashboard})));
const Catalog=lazy(()=>import('../features/catalog/Catalog').then(m=>({default:m.Catalog})));
const CaseDetails=lazy(()=>import('../features/catalog/Catalog').then(m=>({default:m.CaseDetails})));
const Methods=lazy(()=>import('../features/catalog/Catalog').then(m=>({default:m.Methods})));
const SourcePage=lazy(()=>import('../features/catalog/Catalog').then(m=>({default:m.SourcePage})));
const Session=lazy(()=>import('../features/session/Session').then(m=>({default:m.Session})));
const Progress=lazy(()=>import('../features/progress/Progress').then(m=>({default:m.Progress})));
const Results=lazy(()=>import('../features/progress/Progress').then(m=>({default:m.Results})));
class ErrorBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<div className="startup-error"><h1>Bu ekran yüklenemedi.</h1><p>İlerleme kaydını silmeden sayfayı yeniden yükleyebilirsin.</p><button onClick={()=>location.reload()}>Sayfayı yenile</button></div>:this.props.children;}}
export function App(){return <ErrorBoundary><HashRouter><Suspense fallback={<div className="loading-screen" role="status"><span/><strong>Öğrenme alanın hazırlanıyor…</strong></div>}><Routes><Route element={<Shell/>}><Route index element={<Dashboard/>}/><Route path="cases" element={<Catalog/>}/><Route path="cases/:id" element={<CaseDetails/>}/><Route path="methods" element={<Methods/>}/><Route path="play" element={<Session/>}/><Route path="results" element={<Results/>}/><Route path="progress" element={<Progress/>}/><Route path="sources" element={<SourcePage/>}/><Route path="*" element={<Dashboard/>}/></Route></Routes></Suspense></HashRouter></ErrorBoundary>;}
