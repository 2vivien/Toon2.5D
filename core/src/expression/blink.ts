import {clamp01}from"../math.js";
import type {ExpressionContext,ExpressionContribution,ExpressionSource}from"./types.js";

export interface BlinkConfig{readonly closeSeconds:number;readonly holdSeconds:number;readonly openSeconds:number;readonly intervalSeconds:number}
interface MutableContribution{source:"blink";parameter:"eyeBlinkLeft"|"eyeBlinkRight";value:number;weight:1;priority:50;mode:"override"}

const DEFAULTS:BlinkConfig={closeSeconds:.07,holdSeconds:.04,openSeconds:.1,intervalSeconds:4};

export function blinkSource(config:Partial<BlinkConfig>={},phaseOffset=0):ExpressionSource{
  const settings={
    closeSeconds:Math.max(.001,config.closeSeconds??DEFAULTS.closeSeconds),
    holdSeconds:Math.max(0,config.holdSeconds??DEFAULTS.holdSeconds),
    openSeconds:Math.max(.001,config.openSeconds??DEFAULTS.openSeconds),
    intervalSeconds:Math.max(.05,config.intervalSeconds??DEFAULTS.intervalSeconds)
  };
  const contributions:MutableContribution[]=[
    {source:"blink",parameter:"eyeBlinkLeft",value:0,weight:1,priority:50,mode:"override"},
    {source:"blink",parameter:"eyeBlinkRight",value:0,weight:1,priority:50,mode:"override"}
  ];
  return{
    id:"blink",
    evaluate(context:ExpressionContext):readonly ExpressionContribution[]{
      const cycle=settings.intervalSeconds+settings.closeSeconds+settings.holdSeconds+settings.openSeconds;
      const time=(context.elapsedSeconds+phaseOffset)%cycle;
      const start=settings.intervalSeconds;
      const closeEnd=start+settings.closeSeconds;
      const holdEnd=closeEnd+settings.holdSeconds;
      const openEnd=holdEnd+settings.openSeconds;
      let value=0;
      if(time>=start&&time<closeEnd)value=(time-start)/settings.closeSeconds;
      else if(time>=closeEnd&&time<holdEnd)value=1;
      else if(time>=holdEnd&&time<openEnd)value=1-(time-holdEnd)/settings.openSeconds;
      contributions[0].value=clamp01(value);
      contributions[1].value=clamp01(value);
      return contributions;
    }
  };
}