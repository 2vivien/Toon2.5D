import {clamp01}from"../math.js";
import type {FaceParameter}from"../types.js";
import type {ExpressionContribution,ExpressionContext,ExpressionSource}from"./types.js";

export type EmotionId="neutral"|"happy"|"sad"|"angry"|"surprised"|"fearful"|"disgusted"|"relaxed";
type EmotionPreset=Readonly<Partial<Record<FaceParameter,number>>>;

const PRESETS:Readonly<Record<EmotionId,EmotionPreset>>={
  neutral:{},
  happy:{mouthSmile:.82,cheekRaiseLeft:.55,cheekRaiseRight:.55,eyeSquintLeft:.18,eyeSquintRight:.18},
  sad:{mouthFrown:.7,browFurrowLeft:.35,browFurrowRight:.35},
  angry:{browFurrowLeft:.8,browFurrowRight:.8,mouthFrown:.25,noseWrinkle:.3},
  surprised:{browRaiseLeft:.8,browRaiseRight:.8,mouthOpen:.65,eyeSquintLeft:0,eyeSquintRight:0},
  fearful:{browRaiseLeft:.6,browRaiseRight:.6,mouthOpen:.35,eyeSquintLeft:.15,eyeSquintRight:.15},
  disgusted:{noseWrinkle:.75,mouthFrown:.3,cheekRaiseLeft:.2,cheekRaiseRight:.2},
  relaxed:{mouthSmile:.1,eyeSquintLeft:.05,eyeSquintRight:.05}
};

export interface EmotionState{readonly id:EmotionId;readonly intensity:number}

export function emotionSource(state:EmotionState):ExpressionSource{
  return {
    id:"emotion",
    evaluate(_context:ExpressionContext):readonly ExpressionContribution[]{
      const preset=PRESETS[state.id];
      return Object.entries(preset).map(([parameter,value])=>({
        source:"emotion",
        parameter:parameter as FaceParameter,
        value:value??0,
        weight:clamp01(state.intensity),
        priority:20,
        mode:"add"
      }));
    }
  };
}

export function emotionPreset(id:EmotionId):EmotionPreset{return PRESETS[id];}