import {clamp01,lerp,smoothstep}from"@toon2.5d/core";
import type {Easing,Keyframe}from"./types.js";

export function sample(keys:readonly Keyframe[],time:number,easing:Easing):number{
  const first=keys[0];
  if(!first)return 0;
  const last=keys[keys.length-1];
  if(!last)return first.value;
  if(time<=first.time)return first.value;
  if(time>=last.time)return last.value;
  for(let index=1;index<keys.length;index++){
    const current=keys[index];
    if(!current)continue;
    if(time<=current.time){
      const previous=keys[index-1];
      if(!previous)return current.value;
      const raw=(time-previous.time)/(current.time-previous.time);
      const t=easing==="smoothstep"?smoothstep(0,1,raw):clamp01(raw);
      return lerp(previous.value,current.value,t);
    }
  }
  return last.value;
}