import {createNeutralFace}from"@toon2.5d/core";
import {sample}from"./interpolate.js";
import type {Clip,AnimationState}from"./types.js";
import type {MutableFaceWeights}from"@toon2.5d/core";

export interface AnimationPlayer{
  readonly state:AnimationState;
  play(clip:Clip,loop:boolean):void;
  stop():void;
  update(delta:number):void;
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
  const values=createNeutralFace();
  return{
    get state(){return state},
    play(next,shouldLoop){validateClip(next);clip=next;loop=shouldLoop;state={clip:next.id,time:0,playing:true};},
    stop(){state={...state,playing:false};},
    update(delta){
      if(!Number.isFinite(delta)||delta<0)throw new RangeError("Animation delta must be finite and non-negative.");
      if(!state.playing||!clip)return;
      const nextTime=state.time+delta;
      if(nextTime>=clip.duration&&!loop)state={...state,time:clip.duration,playing:false};
      else state={...state,time:clip.duration>0?nextTime%clip.duration:0};
      for(const parameter of Object.keys(values)as Array<keyof MutableFaceWeights>)values[parameter]=0;
      for(const track of clip.tracks)values[track.parameter]=sample(track.keys,state.time,track.easing);
    },
    output(){return values;}
  };
}
