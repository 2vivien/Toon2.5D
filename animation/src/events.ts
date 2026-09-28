export interface AnimationMarker{readonly time:number;readonly name:string;readonly payload?:Readonly<Record<string,unknown>>}
export interface AnimationEventTimeline{readonly duration:number;readonly markers:readonly AnimationMarker[];advance(previousTime:number,currentTime:number,loop:boolean,onMarker:(marker:AnimationMarker)=>void):void}
export function createAnimationEventTimeline(duration:number,markers:readonly AnimationMarker[]):AnimationEventTimeline{
 if(!Number.isFinite(duration)||duration<0)throw new RangeError("Animation timeline duration must be finite and non-negative.");
 const sorted=[...markers].sort((a,b)=>a.time-b.time);
 if(sorted.some(marker=>!marker.name||marker.time<0||marker.time>duration))throw new RangeError("Animation marker is outside the clip duration.");
 return{duration,markers:sorted,advance(previous,current,loop,onMarker){
   if(current<previous&&loop){for(const marker of sorted)if(marker.time>=previous||marker.time<=current)onMarker(marker);return}
   for(const marker of sorted)if(marker.time>previous&&marker.time<=current)onMarker(marker);
 }};
}
