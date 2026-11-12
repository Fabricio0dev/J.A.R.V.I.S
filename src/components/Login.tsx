import {useEffect,useRef,useState} from 'react';
import {ShieldCheck,Waves} from 'lucide-react';
import type {UserProfile} from '../types';
declare global {
 interface Window {
  google?: {
   accounts: {
    id: {
     initialize(options:{client_id:string;callback:(response:{credential:string})=>void}):void;
     renderButton(target:HTMLElement,options:Record<string,string|number>):void;
    }
   }
  }
 }
}
export default function Login({onAuthenticated}:{onAuthenticated:(user:UserProfile)=>void}){
 const button=useRef<HTMLDivElement>(null);const[csrf,setCsrf]=useState('');const[error,setError]=useState('');const[busy,setBusy]=useState(false);const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID;
 useEffect(()=>{let alive=true;fetch('/api/auth/csrf',{credentials:'same-origin'}).then(r=>r.json()).then((d:{csrfToken?:string})=>{if(alive)setCsrf(d.csrfToken||'')}).catch(()=>{if(alive)setError('Não foi possível preparar a autenticação segura.')});return()=>{alive=false}},[]);
 useEffect(()=>{if(!csrf||!clientId||!button.current)return;let attempts=0;const init=()=>{if(!window.google?.accounts?.id){if(attempts++<30)window.setTimeout(init,150);else setError('O serviço de login Google não carregou.');return}
 window.google.accounts.id.initialize({client_id:clientId,callback:async({credential})=>{setBusy(true);setError('');try{const r=await fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Jarvis-CSRF':csrf},body:JSON.stringify({credential,csrfToken:csrf})});const d=await r.json() as{user?:UserProfile;error?:string};if(!r.ok||!d.user)throw new Error(d.error||'Falha na autenticação.');onAuthenticated(d.user)}catch(e){setError(e instanceof Error?e.message:'Não foi possível autenticar.')}finally{setBusy(false)}}});
 button.current&&window.google.accounts.id.renderButton(button.current,{theme:'filled_black',size:'large',shape:'pill',text:'continue_with',width:280,logo_alignment:'left'})};init()},[csrf,clientId,onAuthenticated]);
 return <main className="login-shell"><div className="login-stars"/><div className="login-card"><div className="brand-mark"><Waves size={31}/><span>J.A.R.V.I.S.</span></div><div className="login-orbit"><div className="login-orbit-core"/><span/><span/><span/></div><p className="eyebrow">PERSONAL INTELLIGENCE SYSTEM</p><h1>Inteligência à<br/><em>sua disposição.</em></h1><p className="login-copy">Um novo centro de comando para suas ideias, tarefas e decisões.</p>{!clientId&&<p className="error-note">Configure VITE_GOOGLE_CLIENT_ID na hospedagem para habilitar o login.</p>}<div className="google-button-area"><div ref={button}/>{busy&&<span className="muted">Validando identidade…</span>}</div>{error&&<p className="error-note">{error}</p>}<div className="login-security"><ShieldCheck size={15}/> Autenticação Google com validação no servidor</div></div><p className="login-footer">J.A.R.V.I.S. <span>•</span> BUILD 0.1.0</p></main>;
}