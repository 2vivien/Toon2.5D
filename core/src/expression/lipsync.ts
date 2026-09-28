import {clamp01}from"../math.js";
import type {ExpressionContribution,ExpressionContext,ExpressionSource}from"./types.js";

export type VisemeId="aa"|"ee"|"ih"|"oh"|"ou";
export interface LipSyncState{readonly viseme:VisemeId|null;readonly weight:number}

const PARAMETER:Readonly<Record<VisemeId,"mouthOpen"|"mouthPucker"|"mouthStretch">>={
  aa:"mouthOpen",ee:"mouthStretch",ih:"mouthStretch",oh:"mouthOpen",ou:"mouthPucker"
};

export function lipSyncSource(read:()=>LipSyncState):ExpressionSource{
  return {
    id:"lipSync",
    evaluate(_context:ExpressionContext):readonly ExpressionContribution[]{
      const state=read();
      const parameter=state.viseme?PARAMETER[state.viseme]:"mouthOpen";
      return [{source:"lipSync",parameter,value:clamp01(state.weight),weight:1,priority:40,mode:"add"}];
    }
  };
}