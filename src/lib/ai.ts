import type { ChatMessage, Provider } from '../types';
export async function askAssistant(input: { provider:Provider;model:string;apiKey:string;messages:ChatMessage[];signal?:AbortSignal }): Promise<string> {
  const response = await fetch('/api/chat', { method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',signal:input.signal,body:JSON.stringify({ provider:input.provider,model:input.model,apiKey:input.apiKey,messages:input.messages.slice(-24).map(({role,content})=>({role,content})) }) });
  const data = await response.json() as { answer?:string;error?:string };
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a solicitação.');
  if (!data.answer) throw new Error('O provedor retornou uma resposta vazia.');
  return data.answer;
}