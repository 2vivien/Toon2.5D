export function clamp01(value:number):number {
  if(!Number.isFinite(value)) return 0;
  return Math.min(1,Math.max(0,value));
}
export function clamp(value:number,min:number,max:number):number {
  if(!Number.isFinite(value)) return min;
  return Math.min(max,Math.max(min,value));
}
export function lerp(start:number,end:number,amount:number):number {
  return start+(end-start)*clamp01(amount);
}
export function smoothstep(start:number,end:number,value:number):number {
  if(start===end) return value<start?0:1;
  const t=clamp01((value-start)/(end-start));
  return t*t*(3-2*t);
}