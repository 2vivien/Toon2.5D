import {clamp01}from"../math.js";
import type {ExpressionContext,ExpressionContribution,ExpressionSource}from"./types.js";

export interface BlinkConfig{
  readonly closeSeconds:number;readonly holdSeconds:number;readonly openSeconds:number;
  readonly minIntervalSeconds:number;readonly maxIntervalSeconds:number;readonly seed?:number;
}
interface MutableContribution{source:"blink";parameter:"eyeBlinkLeft"|"eyeBlinkRight";value:number;weight:1;priority:50;mode:"override"}

const DEFAULTS:BlinkConfig={closeSeconds:.07,holdSeconds:.04,openSeconds:.1,minIntervalSeconds:2.5,maxIntervalSeconds:5.5};

function nextRandom(seed:{value:number}):number{
  let value=seed.value|0;
  value^=value<<13;value^=value>>>17;value^=value<<5;
  seed.value=value|0;
  return ((value>>>0)%100000)/100000;
}

export function blinkSource(config:Partial<BlinkConfig>={}):ExpressionSource{
  const close=Math.max(.001,config.closeSeconds??DEFAULTS.closeSeconds);
  const hold=Math.max(0,config.holdSeconds??DEFAULTS.holdSeconds);
  const open=Math.max(.001,config.openSeconds??DEFAULTS.openSeconds);
  const minInterval=Math.max(.05,config.minIntervalSeconds??DEFAULTS.minIntervalSeconds);
  const maxInterval=Math.max(minInterval,config.maxIntervalSeconds??DEFAULTS.maxIntervalSeconds);
  const seed={value:config.seed??123456789};
  let nextStart=minInterval+(maxInterval-minInterval)*nextRandom(seed);
  const contributions:MutableContribution[]=[
    {source:"blink",parameter:"eyeBlinkLeft",value:0,weight:1,priority:50,mode:"override"},
    {source:"blink",parameter:"eyeBlinkRight",value:0,weight:1,priority:50,mode:"override"}
  ];
  return{
    id:"blink",
    evaluate(context:ExpressionContext):readonly ExpressionContribution[]{
      const duration=close+hold+open;
      while(context.elapsedSeconds>=nextStart+duration){
        nextStart+=duration+minInterval+(maxInterval-minInterval)*nextRandom(seed);
      }
      const time=context.elapsedSeconds-nextStart;
      let value=0;
      if(time>=0&&time<close)value=time/close;
      else if(time>=close&&time<close+hold)value=1;
      else if(time>=close+hold&&time<duration)value=1-(time-close-hold)/open;
      contributions[0].value=clamp01(value);
      contributions[1].value=clamp01(value);
      return contributions;
    }
  };
}