import type {FaceWeights}from"./types.js";

export const FACE_PARAMETERS:readonly string[]=[
  "mouthSmile","mouthOpen","mouthFrown","mouthPucker","mouthStretch","jawOpen",
  "eyeBlinkLeft","eyeBlinkRight","eyeSquintLeft","eyeSquintRight","browRaiseLeft",
  "browRaiseRight","browFurrowLeft","browFurrowRight","cheekRaiseLeft",
  "cheekRaiseRight","cheekPuff","noseWrinkle","eyeLookHorizontal","eyeLookVertical"
];

export function createNeutralFace():FaceWeights{
  return {
    mouthSmile:0,mouthOpen:0,mouthFrown:0,mouthPucker:0,mouthStretch:0,jawOpen:0,
    eyeBlinkLeft:0,eyeBlinkRight:0,eyeSquintLeft:0,eyeSquintRight:0,
    browRaiseLeft:0,browRaiseRight:0,browFurrowLeft:0,browFurrowRight:0,
    cheekRaiseLeft:0,cheekRaiseRight:0,cheekPuff:0,noseWrinkle:0,
    eyeLookHorizontal:0,eyeLookVertical:0
  };
}