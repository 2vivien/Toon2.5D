import {createNeutralFace} from "@toon2.5d/core";
import {sample} from "./interpolate.js";
import type {Clip} from "./types.js";
import type {FaceParameter,MutableFaceWeights} from "@toon2.5d/core";
export interface BlendLayer{readonly clip:Clip;readonly weight:number;readonly time:number;readonly loop:boolean}
export interface MultiClipPlayer{update(deltaSeconds:number):void;setLayers(layers:readonly BlendLayer[]):void;output():Readonly<MutableFaceWeights>;layers():readonly BlendLayer[]}
function timeAt(time:number,duration:number,loop:boolean):number{if(duration<=0)return 0;if(loop)return time%duration;return Math.min(time,duration);}
export function createMultiClipPlayer():MultiClipPlayer{const values=createNeutralFace();let layers:BlendLayer[]=[];return{
 update(delta){if(!Number.isFinite(delta)||delta<0)throw new RangeError("Blend delta must be finite and non-negative.");layers=layers.map(layer=>({...layer,time:timeAt(layer.time+delta,layer.clip.duration,layer.loop)}));for(const parameter of Object.keys(values) as FaceParameter[])values[parameter]=0;for(const layer of layers){const weight=Math.max(0,Math.min(1,layer.weight));for(const track of layer.clip.tracks){const value=sample(track.keys,timeAt(layer.time,layer.clip.duration,layer.loop),track.easing);values[track.parameter]=Math.max(0,Math.min(1,values[track.parameter]+value*weight));}}},
 setLayers(next){layers=next.map(layer=>({...layer,time:timeAt(layer.time,layer.clip.duration,layer.loop)}));},output(){return values},layers(){return layers}}}