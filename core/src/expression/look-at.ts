import {clamp}from"../math.js";
import {solveLookAtState}from"../look-at.js";
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
    {source:"lookAt",parameter:"eyeLookInLeft",value:0,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookOutLeft",value:0,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookUpLeft",value:0,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookDownLeft",value:0,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookInRight",value:0,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookOutRight",value:0,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookUpRight",value:0,weight:1,priority:60,mode:"override"},
    {source:"lookAt",parameter:"eyeLookDownRight",value:0,weight:1,priority:60,mode:"override"}
  ];
  return{
    id:"lookAt",
    evaluate(context:ExpressionContext):readonly ExpressionContribution[]{
      const target=context.lookTarget;
      const solved=target?solveLookAtState({x:0,y:0,z:0},target,{yaw:horizontalLimit,pitch:verticalLimit}):null;
      const desiredHorizontal=solved?.yaw??0;
      const desiredVertical=solved?.pitch??0;
      horizontal+=(desiredHorizontal-horizontal)*smoothing;
      vertical+=(desiredVertical-vertical)*smoothing;
      const values=[horizontal>0?horizontal/horizontalLimit:0,horizontal<0?-horizontal/horizontalLimit:0,
        vertical>0?vertical/verticalLimit:0,vertical<0?-vertical/verticalLimit:0,
        horizontal<0?-horizontal/horizontalLimit:0,horizontal>0?horizontal/horizontalLimit:0,
        vertical>0?vertical/verticalLimit:0,vertical<0?-vertical/verticalLimit:0];
      for(let index=0;index<contributions.length;index++){
        const contribution=contributions[index];
        const value=values[index];
        if(contribution&&value!==undefined)contribution.value=clamp(value,0,1);
      }
      return contributions;
    }
  };
}
