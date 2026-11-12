import { useCallback,useEffect,useRef,useState } from 'react';
type RecognitionResult={isFinal:boolean;0:{transcript:string}};
type RecognitionEvent={resultIndex:number;results:ArrayLike<RecognitionResult>};
interface RecognitionInstance {lang:string;continuous:boolean;interimResults:boolean;onresult:((event:RecognitionEvent)=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start():void;stop():void;abort():void}
type SpeechWindow=Window&{SpeechRecognition?:new()=>RecognitionInstance;webkitSpeechRecognition?:new()=>RecognitionInstance};
export function useVoice(onCommand:(text:string)=>void) {
  const [supported,setSupported]=useState(false);const [listening,setListening]=useState(false);const [speaking,setSpeaking]=useState(false);const [error,setError]=useState('');
  const recognition=useRef<RecognitionInstance|null>(null);const callback=useRef(onCommand);const manual=useRef(false);
  useEffect(()=>{callback.current=onCommand},[onCommand]);
  useEffect(()=>{
    const ctor=(window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition;setSupported(Boolean(ctor));if(!ctor)return;
    const instance=new ctor();instance.lang='pt-BR';instance.continuous=true;instance.interimResults=false;
    instance.onresult=(event)=>{for(let i=event.resultIndex;i<event.results.length;i++){const result=event.results[i];if(!result?.isFinal)continue;const transcript=result[0]?.transcript?.trim();if(!transcript)continue;if(/\b(?:e aí,?\s*)?(?:hey\s+)?jarvis\b/i.test(transcript)||manual.current)callback.current(transcript);manual.current=false;}};
    instance.onerror=(event)=>{setError(event.error==='not-allowed'?'Permissão do microfone negada.':`Reconhecimento de voz: ${event.error}`);setListening(false)};
    instance.onend=()=>setListening(false);recognition.current=instance;return()=>{instance.abort();recognition.current=null};
  },[]);
  const startListening=useCallback((continuous=false)=>{if(!recognition.current){setError('Este navegador não oferece reconhecimento de voz.');return}try{manual.current=!continuous;recognition.current.continuous=continuous;recognition.current.start();setListening(true);setError('')}catch{setError('O microfone já está em uso ou não pôde ser iniciado.')}},[]);
  const stopListening=useCallback(()=>{manual.current=false;recognition.current?.stop();setListening(false)},[]);
  const speak=useCallback((text:string,rate=1,volume=1)=>{if(!('speechSynthesis'in window)){setError('Síntese de voz indisponível.');return}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text.replace(/[*_#`]/g,''));utterance.lang='pt-BR';utterance.rate=rate;utterance.volume=volume;utterance.onstart=()=>setSpeaking(true);utterance.onend=()=>setSpeaking(false);utterance.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(utterance)},[]);
  const stopSpeaking=useCallback(()=>{window.speechSynthesis?.cancel();setSpeaking(false)},[]);
  return {supported,listening,speaking,error,startListening,stopListening,speak,stopSpeaking};
}