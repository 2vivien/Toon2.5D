import {clamp}from"../math.js";
import type {ExpressionContext,ExpressionContribution,ExpressionSource}from"./types.js";

export interface LookAtConfig{readonly horizontalLimit:number;readonly verticalLimit:number;readonly smoothing:number}
type LookParameter="eyeLookInLeft"|"eyeLookOutLeft"|"eyeLookUpLeft"|"eyeLookDownLeft"|"eyeLookInRight"|"eyeLookOutRight"|"eyeLookUpRight"|"eyeLookDownRight";

interface MutableContribution{
  source:"lookAt";parameter:LookParameter;value:number;weight:1;priority:60;mode:"override"
}

export function lookAtSource(config:LookAtConfig={horizontalLimit:1,verticalLimit:1,smoothing:.2}):ExpressionSource{
  const horizontalLimit=Math.max(.001,Math.abs(config.horizontalLimit));
  const verticalLimit=Math.max(.001,Math.abs(config.verticalLimit));
  const smoothing=clamp(config.smoothing,0,1);
  let horizontal=0;
  let vertical=0;
  const contributions:MutableContribution[]=[
    ["eyeLookInLeft"],["eyeLookOutLeft"],["eyeLookUpLeft"],["eyeLookDownLeft"],
    ["eyeLookInRight"],["eyeLookOutRight"],["eyeLookUpRight"],["eyeLookDownRight"]
  ].map(([parameter])=>({source:"lookAt",parameter,value:0,weight:1,priority:60,mode:"override"} as MutableContribution));

  return{
    id:"lookAt",
    evaluate(context:ExpressionContext):readonly ExpressionContribution[]{
      const target=context.lookTarget;
      const desiredHorizontal=target?clamp(target.x,-horizontalLimit,horizontalLimit):0;
      const desiredVertical=target?clamp(target.y,-verticalLimit,verticalLimit):0;
      horizontal+=(desiredHorizontal-horizontal)*smoothing;
      vertical+=(desiredVertical-vertical)*smoothing;
      const h=Math.max(0,Math.abs(horizontal)/horizontalLimit);
      const v=Math.max(0,Math.abs(vertical)/verticalLimit);
      contributions[0].value=horizontal>0?h:0;
      contributions[1].value=horizontal<0?h:0;
      contributions[4].value=horizontal<0?h:0;
      contributions[5].value=horizontal>0?h:0;
      contributions[2].value=vertical>0?v:0;
      contributions[3].value=vertical<0?v:0;
      contributions[6].value=vertical>0?v:0;
      contributions[7].value=vertical<0?v:0;
      return contributions;
    }
  };
}
