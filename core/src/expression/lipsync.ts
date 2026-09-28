import {clamp01}from"../math.js";
import type {FaceParameter}from"../types.js";
import type {ExpressionContribution,ExpressionContext,ExpressionSource}from"./types.js";

export type VisemeId="aa"|"ee"|"ih"|"oh"|"ou";
export interface LipSyncState{readonly viseme:VisemeId|null;readonly weight:number}
type Pair=readonly[FaceParameter,number];
interface MutableContribution{source:"lipSync";parameter:FaceParameter;value:number;weight:number;priority:40;mode:"add"}

const VISemes:Readonly<Record<VisemeId,readonly Pair[]>>={
  aa:[["jawOpen",1]],
  ee:[["mouthStretchLeft",.8],["mouthStretchRight",.8]],
  ih:[["mouthStretchLeft",.55],["mouthStretchRight",.55]],
  oh:[["jawOpen",.75],["mouthFunnel",.65]],
  ou:[["mouthPucker",.9]]
};

export function lipSyncSource(read:()=>LipSyncState):ExpressionSource{
  const contributions:MutableContribution[]=[];
  return{
    id:"lipSync",
    evaluate(_context:ExpressionContext):readonly ExpressionContribution[]{
      contributions.length=0;
      const state=read();
      if(!state.viseme)return contributions;
      const weight=clamp01(state.weight);
      for(const [parameter,value]of VISemes[state.viseme])contributions.push({source:"lipSync",parameter,value,weight,priority:40,mode:"add"});
      return contributions;
    }
  };
}