import type { WeatherSummary } from '../types';
const descriptions: Record<number, string> = { 0:'Céu limpo',1:'Predominantemente limpo',2:'Parcialmente nublado',3:'Nublado',45:'Nevoeiro',48:'Nevoeiro com geada',51:'Garoa fraca',53:'Garoa moderada',55:'Garoa intensa',61:'Chuva fraca',63:'Chuva moderada',65:'Chuva forte',71:'Neve fraca',73:'Neve moderada',75:'Neve forte',80:'Pancadas fracas',81:'Pancadas moderadas',82:'Pancadas fortes',95:'Trovoadas' };
export async function getCurrentWeather(latitude: number, longitude: number): Promise<WeatherSummary> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({ latitude:String(latitude),longitude:String(longitude),current:'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',hourly:'precipitation_probability',forecast_days:'1',timezone:'auto' }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Não foi possível consultar a previsão do tempo agora.');
  const data = await response.json() as { current?: { temperature_2m:number;apparent_temperature:number;precipitation:number;weather_code:number;wind_speed_10m:number }; hourly?: { precipitation_probability?:number[] } };
  if (!data.current) throw new Error('A fonte meteorológica não retornou condições atuais.');
  const c = data.current;
  return { temperature:c.temperature_2m,apparent:c.apparent_temperature,code:c.weather_code,wind:c.wind_speed_10m,precipitation:data.hourly?.precipitation_probability?.[0] ?? 0,description:descriptions[c.weather_code] ?? 'Condição não especificada' };
}