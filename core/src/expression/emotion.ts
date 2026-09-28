import {clamp01}from"../math.js";
import type {ExpressionContribution,ExpressionContext,ExpressionSource}from"./types.js";

export type EmotionId="neutral"|"happy"|"sad"|"angry"|"surprised"|"fearful"|"disgusted"|"relaxed";
export interface EmotionState{readonly id:EmotionId;readonly intensity:number}
type Pair=readonly [ExpressionContribution["parameter"],number];

const PRESETS:Readonly<Record<EmotionId,readonly Pair[]>>={
  neutral:[],
  happy:[
    ["mouthSmileLeft",.82],["mouthSmileRight",.82],["cheekSquintLeft",.55],
    ["cheekSquintRight",.55],["eyeSquintLeft",.18],["eyeSquintRight",.18]
  ],
  sad:[
    ["mouthFrownLeft",.7],["mouthFrownRight",.7],["browInnerUp",.55],
    ["eyeLookDownLeft",.15],["eyeLookDownRight",.15]
  ],
  angry:[
    ["browDownLeft",.8],["browDownRight",.8],["browInnerUp",.25],
    ["mouthFrownLeft",.25],["mouthFrownRight",.25],["noseSneerLeft",.3],["noseSneerRight",.3]
  ],
  surprised:[
    ["browInnerUp",.8],["browOuterUpLeft",.8],["browOuterUpRight",.8],
    ["eyeWideLeft",.8],["eyeWideRight",.8],["jawOpen",.65]
  ],
  fearful:[
    ["browInnerUp",.6],["browOuterUpLeft",.45],["browOuterUpRight",.45],
    ["eyeWideLeft",.7],["eyeWideRight",.7],["mouthStretchLeft",.35],["mouthStretchRight",.35]
  ],
  disgusted:[
    ["noseSneerLeft",.75],["noseSneerRight",.75],["cheekSquintLeft",.45],
    ["cheekSquintRight",.45],["mouthFrownLeft",.3],["mouthFrownRight",.3]
  ],
  relaxed:[["eyeSquintLeft",.05],["eyeSquintRight",.05],["mouthSmileLeft",.1],["mouthSmileRight",.1]]
};

export function emotionSource(state:EmotionState):ExpressionSource{
  return {
    id:"emotion",
    evaluate(_context:ExpressionContext):readonly ExpressionContribution[]{
      const weight=clamp01(state.intensity);
      return PRESETS[state.id].map(([parameter,value])=>({source:"emotion",parameter,value,weight,priority:20,mode:"add"}));
    }
  };
}
export function emotionPreset(id:EmotionId):readonly Pair[]{return PRESETS[id];}