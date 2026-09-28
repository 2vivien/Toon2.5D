import {clamp01,clamp}from"../math.js";
import {FACE_PARAMETERS}from"../face-defaults.js";
import type {FaceParameter,FaceWeights}from"../types.js";
import type {ExpressionContribution,ExpressionContext,ExpressionSource}from"./types.js";

export interface ExternalFaceInput{readonly weights:Partial<FaceWeights>;readonly priority?:number}

export function externalSource(read:()=>ExternalFaceInput):ExpressionSource{
  const contributions:ExpressionContribution[]=[];
  return{
    id:"external",
    evaluate(_context:ExpressionContext):readonly ExpressionContribution[]{
      contributions.length=0;
      const input=read();
      const priority=clamp(input.priority??100,0,1000);
      for(const parameter of FACE_PARAMETERS){
        const value=input.weights[parameter];
        if(value===undefined)continue;
        contributions.push({source:"external",parameter,value:clamp01(value),weight:1,priority,mode:"override"});
      }
      return contributions;
    }
  };
}