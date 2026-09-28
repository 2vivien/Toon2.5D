import {createNeutralFace}from"@toon2.5d/core";
import {sample}from"./interpolate.js";
import type {Clip}from"./types.js";
import type {FaceParameter,MutableFaceWeights}from"@toon2.5d/core";

export interface BlendLayer{readonly id:string;readonly clip:Clip;readonly weight:number;readonly time:number;readonly loop:boolean;readonly speed?:number}
export interface MultiClipPlayer{update(deltaSeconds:number):void;setLayers(layers:readonly BlendLayer[]):void;output():Readonly<MutableFaceWeights>;layers():readonly BlendLayer[]}
function clamp(value:number):number{return Math.max(0,Math.min(1,value))}
function timeAt(time:number,duration:number,loop:boolean):number{if(duration<=0)return 0;return loop?time%duration:Math.min(time,duration)}
function validateLayer(layer:BlendLayer):void{if(!layer.id||!Number.isFinite(layer.weight)||!Number.isFinite(layer.time)||layer.time<0||layer.weight<0||layer.weight>1)throw new RangeError("Blend layer has invalid id, weight or time.");if(layer.speed!==undefined&&(!Number.isFinite(layer.speed)||layer.speed<0))throw new RangeError("Blend layer speed must be finite and non-negative.")}
export function createMultiClipPlayer():MultiClipPlayer{const values=createNeutralFace();let layers:BlendLayer[]=[];return{
 update(delta){if(!Number.isFinite(delta)||delta<0)throw new RangeError("Blend delta must be finite and non-negative.");layers=layers.map(layer=>({...layer,time:timeAt(layer.time+delta*(layer.speed??1),layer.clip.duration,layer.loop)}));for(const parameter of Object.keys(values)as FaceParameter[])values[parameter]=0;for(const layer of layers){const time=timeAt(layer.time,layer.clip.duration,layer.loop);for(const track of layer.clip.tracks){const value=sample(track.keys,time,track.easing);values[track.parameter]=clamp(values[track.parameter]+value*clamp(layer.weight));}}},
 setLayers(next){const ids=new Set<string>();for(const layer of next){validateLayer(layer);if(ids.has(layer.id))throw new RangeError("Blend layer ids must be unique.");ids.add(layer.id)}layers=next.map(layer=>({...layer,time:timeAt(layer.time,layer.clip.duration,layer.loop)}));},
 output(){return values},layers(){return layers}}}
