import {clamp}from"../math.js";
import type {ExpressionContext,ExpressionContribution,ExpressionSource}from"./types.js";

export interface LookAtConfig{readonly horizontalLimit:number;readonly verticalLimit:number;readonly smoothing:number}
interface MutableContribution{source:"lookAt";parameter:"eyeLookHorizontal"|"eyeLookVertical";value:number;weight:1;priority:60;mode:"override"}

export function lookAtSource(config:LookAtConfig={horizontalLimit:1,verticalLimit:1,smoothing:.2}):ExpressionSource{
  let horizontal=0;
  let vertical=0;
  const contributions:MutableContribution[]=[
    {source:"lookAt",parameter:"eyeLookHorizontal",value:.5,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookVertical",value:.5,weight:1,priority:60,mode:"override"}
  ];
  return{
    id:"lookAt",
    evaluate(context:ExpressionContext):readonly ExpressionContribution[]{
      const target=context.lookTarget;
      const desiredHorizontal=target?clamp(target.x,-config.horizontalLimit,config.horizontalLimit):0;
      const desiredVertical=target?clamp(target.y,-config.verticalLimit,config.verticalLimit):0;
      const alpha=clamp(config.smoothing,0,1);
      horizontal+=(desiredHorizontal-horizontal)*alpha;
      vertical+=(desiredVertical-vertical)*alpha;
      contributions[0].value=(horizontal/config.horizontalLimit+1)/2;
      contributions[1].value=(vertical/config.verticalLimit+1)/2;
      return contributions;
    }
  };
}