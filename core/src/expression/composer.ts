import {clamp01}from"../math.js";
import {createNeutralFace}from"../face-defaults.js";
import type {FaceWeights}from"../types.js";
import type {ExpressionContribution}from"./types.js";

function applyValue(current:number,next:number,mode:ExpressionContribution["mode"],weight:number):number{
  const value=clamp01(next)*clamp01(weight);
  if(mode==="override")return value;
  if(mode==="add")return clamp01(current+value);
  if(mode==="multiply")return clamp01(current*value);
  if(mode==="max")return Math.max(current,value);
  return Math.min(current,value);
}

export function compose(contributions:ExpressionContribution[]):FaceWeights{
  const values=createNeutralFace();
  contributions.sort((a,b)=>a.priority-b.priority);
  for(const contribution of contributions){
    values[contribution.parameter]=applyValue(
      values[contribution.parameter],contribution.value,contribution.mode,contribution.weight
    );
  }
  return values;
}