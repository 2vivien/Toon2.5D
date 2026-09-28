import {clamp01}from"../math.js";
import {FACE_PARAMETERS,createNeutralFace}from"../face-defaults.js";
import type {FaceParameter,FaceWeights}from"../types.js";
import type {ExpressionContribution}from"./types.js";

function applyValue(current:number,next:number,mode:ExpressionContribution["mode"],weight:number):number{
  const value=clamp01(next)*clamp01(weight);
  if(mode==="override")return value;
  if(mode==="add")return clamp01(current+value);
  if(mode==="multiply")return clamp01(current*value);
  if(mode==="max")return Math.max(current,value);
  return Math.min(current,value);
}

export function compose(contributions:readonly ExpressionContribution[]):FaceWeights{
  const values=createNeutralFace();
  const ordered=[...contributions].sort((a,b)=>a.priority-b.priority);
  for(const contribution of ordered){
    const parameter=contribution.parameter;
    values[parameter]=applyValue(values[parameter],contribution.value,contribution.mode,contribution.weight);
  }
  return values;
}

export function emptyContributions():ExpressionContribution[]{
  return FACE_PARAMETERS.map(parameter=>({
    source:"base",parameter,value:0,weight:1,priority:0,mode:"override"
  }));
}