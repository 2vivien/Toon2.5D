import {clamp01}from"../math.js";
import type {ExpressionContribution,ExpressionContext,ExpressionSource}from"./types.js";

export type EmotionId="neutral"|"happy"|"sad"|"angry"|"surprised"|"fearful"|"disgusted"|"relaxed";
export interface EmotionState{readonly id:EmotionId;readonly intensity:number}

type Pair=readonly [ExpressionContribution["parameter"],number];
const PRESETS:Readonly<Record<EmotionId,readonly Pair[]>>={
  neutral:[],
  happy:[["mouthSmile",.82],["cheekRaiseLeft",.55],["cheekRaiseRight",.55],["eyeSquintLeft",.18],["eyeSquintRight",.18]],
  sad:[["mouthFrown",.7],["browFurrowLeft",.35],["browFurrowRight",.35]],
  angry:[["browFurrowLeft",.8],["browFurrowRight",.8],["mouthFrown",.25],["noseWrinkle",.3]],
  surprised:[["browRaiseLeft",.8],["browRaiseRight",.8],["mouthOpen",.65]],
  fearful:[["browRaiseLeft",.6],["browRaiseRight",.6],["mouthOpen",.35],["eyeSquintLeft",.15],["eyeSquintRight",.15]],
  disgusted:[["noseWrinkle",.75],["mouthFrown",.3],["cheekRaiseLeft",.2],["cheekRaiseRight",.2]],
  relaxed:[["mouthSmile",.1],["eyeSquintLeft",.05],["eyeSquintRight",.05]]
};

export function emotionSource(state:EmotionState):ExpressionSource{
  return {
    id:"emotion",
    evaluate(_context:ExpressionContext):readonly ExpressionContribution[]{
      const weight=clamp01(state.intensity);
      return PRESETS[state.id].map(([parameter,value])=>({
        source:"emotion",parameter,value,weight,priority:20,mode:"add"
      }));
    }
  };
}

export function emotionPreset(id:EmotionId):readonly Pair[]{return PRESETS[id];}
