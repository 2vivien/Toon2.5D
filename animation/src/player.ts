import {createNeutralFace}from"@toon2.5d/core";
import {sample}from"./interpolate.js";
import type {Clip,AnimationState}from"./types.js";

export interface AnimationPlayer{
  readonly state:AnimationState;
  play(clip:Clip,loop:boolean):void;
  stop():void;
  update(delta:number):void;
  output():ReturnType<typeof createNeutralFace>;
}

export function createAnimationPlayer():AnimationPlayer{
  let clip:Clip|null=null;
  let loop=false;
  let state:AnimationState={clip:null,time:0,playing:false};
  let values=createNeutralFace();
  return{
    get state(){return state},
    play(next,shouldLoop){clip=next;loop=shouldLoop;state={clip:next.id,time:0,playing:true}},
    stop(){state={...state,playing:false}},
    update(delta){
      if(!state.playing||!clip)return;
      const nextTime=state.time+Math.max(0,delta);
      if(nextTime>=clip.duration&&!loop){state={...state,time:clip.duration,playing:false}}
      else{state={...state,time:clip.duration>0?nextTime%clip.duration:0}}
      values=createNeutralFace();
      for(const track of clip.tracks)values[track.parameter]=sample(track.keys,state.time,track.easing);
    },
    output(){return values}
  };
}