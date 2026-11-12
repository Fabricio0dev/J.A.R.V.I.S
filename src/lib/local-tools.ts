import { calculateNaturalLanguage } from './calculator';
import { getCurrentWeather } from './weather';
import { storage } from './storage';
import type { LocalTask, UserProfile } from '../types';
export type LocalResult = { handled:true;answer:string;actionUrl?:string } | { handled:false };
const clean = (input:string) => input.replace(/^(?:e\s*a[ií],?\s*)?(?:hey\s+)?jarvis[,.!\s]*/i,'').trim();
export async function runLocalCommand(raw:string,user:UserProfile):Promise<LocalResult> {
  const input=clean(raw); const normalized=input.toLowerCase();
  if (/\b(que horas|hora atual|horas são)\b/.test(normalized)) return {handled:true,answer:`Agora são ${new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(new Date())}.`};
  if (/\b(data de hoje|que dia é hoje|data atual)\b/.test(normalized)) return {handled:true,answer:`Hoje é ${new Intl.DateTimeFormat('pt-BR',{dateStyle:'full'}).format(new Date())}.`};
  if (/\b(quanto é|calcule|calculadora)\b/.test(normalized) || /\d\s*[+*/^%-]\s*\d/.test(normalized)) {
    try { return {handled:true,answer:`O resultado é **${new Intl.NumberFormat('pt-BR',{maximumFractionDigits:8}).format(calculateNaturalLanguage(input))}**.`}; }
    catch(error) { return {handled:true,answer:error instanceof Error?error.message:'Não consegui interpretar essa conta.'}; }
  }
  const add=input.match(/^(?:adicione|adicionar|crie|criar|anote)\s+(.+?)\s+(?:à|a)\s+(?:minha\s+)?(?:lista|tarefas?)\.?$/i);
  if (add?.[1]) { const tasks=storage.getTasks(user); tasks.push({id:crypto.randomUUID(),text:add[1].trim(),done:false,createdAt:Date.now()}); storage.saveTasks(user,tasks); return {handled:true,answer:`Tarefa adicionada: **${add[1].trim()}**.`}; }
  if (/\b(minhas tarefas|tarefas pendentes|lista de tarefas)\b/.test(normalized)) {
    const pending=storage.getTasks(user).filter((task:LocalTask)=>!task.done);
    return {handled:true,answer:pending.length?pending.map((task,index)=>`${index+1}. ${task.text}`).join('\n'):'Sua lista está vazia. Um raro momento de organização.'};
  }
  if (/\b(pesquise|pesquisar|procure|buscar|busque)\b/.test(normalized)) {
    const query=input.replace(/^(?:por favor,?\s*)?(?:pesquise|pesquisar|procure|buscar|busque)\s*/i,'').trim();
    if(!query)return {handled:true,answer:'Qual assunto devo pesquisar?'};
    const video=/\b(youtube|vídeos?|videos|tutoriais)\b/i.test(query);
    const target=query.replace(/\b(no youtube|youtube|vídeos?|videos|tutoriais)\b/gi,'').trim()||query;
    return {handled:true,answer:`Preparei a pesquisa por **${target}**. Abra o resultado pelo botão abaixo.`,actionUrl:video?`https://www.youtube.com/results?search_query=${encodeURIComponent(target)}`:`https://www.google.com/search?q=${encodeURIComponent(target)}`};
  }
  if (/\b(clima|temperatura|vai chover|previsão do tempo)\b/.test(normalized)) {
    if(!navigator.geolocation)return {handled:true,answer:'Este navegador não disponibiliza geolocalização. Informe uma cidade para consultar manualmente.'};
    try {
      const position=await new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:10000,maximumAge:300000}));
      const weather=await getCurrentWeather(position.coords.latitude,position.coords.longitude);
      return {handled:true,answer:`Agora: **${weather.temperature.toFixed(1)} °C** — ${weather.description}. Sensação térmica: ${weather.apparent.toFixed(1)} °C. Vento: ${weather.wind.toFixed(0)} km/h. Probabilidade de chuva na primeira hora prevista: ${weather.precipitation}%.`};
    } catch { return {handled:true,answer:'Não consegui acessar sua localização ou consultar o serviço meteorológico. Verifique a permissão ou informe uma cidade.'}; }
  }
  return {handled:false};
}