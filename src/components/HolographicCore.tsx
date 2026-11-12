import {useEffect,useRef} from 'react';
import type {AssistantState} from '../types';
export default function HolographicCore({state}:{state:AssistantState}){
 const canvas=useRef<HTMLCanvasElement>(null);const mode=useRef(state);useEffect(()=>{mode.current=state},[state]);
 useEffect(()=>{const el=canvas.current;const ctx=el?.getContext('2d');if(!el||!ctx)return;let raf=0,time=0,w=0,h=0,dpr=1;
 const particles=Array.from({length:280},(_,i)=>({angle:i/280*Math.PI*2,radius:80+Math.random()*100,speed:.08+Math.random()*.22,size:.5+Math.random()*1.7,phase:Math.random()*6.28}));
 const resize=()=>{const rect=el.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=rect.width;h=rect.height;el.width=Math.max(1,w*dpr);el.height=Math.max(1,h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
 const observer=new ResizeObserver(resize);observer.observe(el);resize();
 const draw=()=>{time+=mode.current==='thinking'?.045:.012;ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,color=mode.current==='error'?'#ff677d':mode.current==='offline'?'#718096':'#56e9ff',pulse=1+Math.sin(time*2.6)*(mode.current==='listening'?.12:.035),radius=Math.min(w,h)*.24*pulse;
 const glow=ctx.createRadialGradient(cx,cy,2,cx,cy,radius*2.1);glow.addColorStop(0,'rgba(35,190,230,.14)');glow.addColorStop(1,'rgba(35,190,230,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(cx,cy);
 for(let ring=0;ring<4;ring++){ctx.beginPath();ctx.arc(0,0,radius*(.65+ring*.27),0,Math.PI*2);ctx.strokeStyle=ring===0?'rgba(96,234,255,.55)':'rgba(65,177,210,.16)';ctx.lineWidth=ring===0?1.4:.8;ctx.setLineDash(ring===2?[2,7]:[5+ring,9]);ctx.lineDashOffset=-time*18*(ring%2?-1:1);ctx.stroke()}ctx.setLineDash([]);
 particles.forEach((p,i)=>{p.angle+=(mode.current==='thinking'?1.9:mode.current==='speaking'?1.2:.45)*.0012*p.speed;const r=p.radius*(w<360?.72:1)*(1+Math.sin(time*1.4+p.phase)*.035);ctx.beginPath();ctx.arc(Math.cos(p.angle)*r,Math.sin(p.angle)*r*.72,p.size,0,Math.PI*2);ctx.fillStyle=color;ctx.globalAlpha=.3+(Math.sin(time*2+i)+1)*.32;ctx.fill()});ctx.globalAlpha=1;
 for(let i=0;i<36;i++){const a=i/36*Math.PI*2+time*.12;ctx.fillStyle='#a8f4ff';ctx.globalAlpha=.35+(i%3)*.15;ctx.fillRect(Math.cos(a)*radius*.48-1,Math.sin(a)*radius*.48-1,2,2)}ctx.restore();ctx.globalAlpha=1;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)raf=requestAnimationFrame(draw)};
 draw();return()=>{cancelAnimationFrame(raf);observer.disconnect()}},[]);
 return <canvas ref={canvas} className={`core-canvas state-${state}`} aria-label={`Núcleo JARVIS: ${state}`}/>;
}