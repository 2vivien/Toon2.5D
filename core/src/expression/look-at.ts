import {clamp}from"../math.js";
import type {ExpressionContext,ExpressionContribution,ExpressionSource}from"./types.js";

export interface LookAtConfig{readonly horizontalLimit:number;readonly verticalLimit:number;readonly smoothing:number}
interface MutableContribution{source:"lookAt";parameter:"eyeLookHorizontal"|"eyeLookVertical";value:number;weight:1;priority:60;mode:"override"}

export function lookAtSource(config:LookAtConfig={horizontalLimit:1,verticalLimit:1,smoothing:.2}):ExpressionSource{
  const horizontalLimit=Math.max(.001,Math.abs(config.horizontalLimit));
  const verticalLimit=Math.max(.001,Math.abs(config.verticalLimit));
  const smoothing=clamp(config.smoothing,0,1);
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
      const desiredHorizontal=target?clamp(target.x,-horizontalLimit,horizontalLimit):0;
      const desiredVertical=target?clamp(target.y,-verticalLimit,verticalLimit):0;
      horizontal+=(desiredHorizontal-horizontal)*smoothing;
      vertical+=(desiredVertical-vertical)*smoothing;
      contributions[0].value=(horizontal/horizontalLimit+1)/2;
      contributions[1].value=(vertical/verticalLimit+1)/2;
      return contributions;
    }
  };
}