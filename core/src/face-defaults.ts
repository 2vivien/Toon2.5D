import type {FaceParameter,FaceWeights} from "./types.js";

export const FACE_PARAMETERS:readonly FaceParameter[]=[
  "mouthSmile","mouthOpen","mouthFrown","mouthPucker","mouthStretch",
  "jawOpen","eyeBlinkLeft","eyeBlinkRight","eyeSquintLeft","eyeSquintRight",
  "browRaiseLeft","browRaiseRight","browFurrowLeft","browFurrowRight",
  "cheekRaiseLeft","cheekRaiseRight","cheekPuff","noseWrinkle",
  "eyeLookHorizontal","eyeLookVertical"
];

export function createNeutralFace():FaceWeights{
  const face={} as Record<FaceParameter,number>;
  for(const parameter of FACE_PARAMETERS) face[parameter]=0;
  return face;
}