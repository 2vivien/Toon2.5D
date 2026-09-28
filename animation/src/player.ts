import {createNeutralFace}from"@toon2.5d/core";
import {sample}from"./interpolate.js";
import {createAnimationEventTimeline,type AnimationMarker}from"./events.js";
import type {Clip,AnimationState}from"./types.js";
import type {MutableFaceWeights}from"@toon2.5d/core";

export interface AnimationPlayer{
  readonly state:AnimationState;
  play(clip:Clip,loop:boolean):void;
  stop():void;
  update(delta:number):void;
  onMarker(name:string,callback:(marker:AnimationMarker)=>void):()=>void;
  output():Readonly<MutableFaceWeights>;
}

function validateClip(clip:Clip):void{
  if(!clip.id||!Number.isFinite(clip.duration)||clip.duration<0)throw new RangeError("Animation clip duration must be finite and non-negative.");
  for(const track of clip.tracks){
    let previous=-Infinity;
    for(const key of track.keys){
      if(!Number.isFinite(key.time)||!Number.isFinite(key.value)||key.time<previous)throw new RangeError("Animation keyframes must use finite, ordered values.");
      previous=key.time;
    }
  }
}

export function createAnimationPlayer():AnimationPlayer{
  let clip:Clip|null=null;
  let loop=false;
  let state:AnimationState={clip:null,time:0,playing:false};
  let timeline=createAnimationEventTimeline(0,[]);
  const listeners=new Map<string,Set<(marker:AnimationMarker)=>void>>();
  const values=createNeutralFace();
  return{
    get state(){return state},
    play(next,shouldLoop){validateClip(next);clip=next;loop=shouldLoop;timeline=createAnimationEventTimeline(next.duration,next.markers??[]);state={clip:next.id,time:0,playing:true};},
    stop(){state={...state,playing:false};},
    update(delta){
      if(!Number.isFinite(delta)||delta<0)throw new RangeError("Animation delta must be finite and non-negative.");
      if(!state.playing||!clip)return;
      const previous=state.time;
      const raw=previous+delta;
      const ended=!loop&&raw>=clip.duration;
      const next=loop&&clip.duration>0?raw%clip.duration:Math.min(raw,clip.duration);
      state={...state,time:next,playing:!ended};
      timeline.advance(previous,next,loop,marker=>listeners.get(marker.name)?.forEach(callback=>callback(marker)));
      for(const parameter of Object.keys(values)as Array<keyof MutableFaceWeights>)values[parameter]=0;
      for(const track of clip.tracks)values[track.parameter]=sample(track.keys,state.time,track.easing);
    },
    onMarker(name,callback){if(!name)throw new RangeError("Marker name is required.");const set=listeners.get(name)??new Set<(marker:AnimationMarker)=>void>();set.add(callback);listeners.set(name,set);return()=>{set.delete(callback);if(set.size===0)listeners.delete(name)};},
    output(){return values;}
  };
}
