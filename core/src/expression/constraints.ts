import {clamp01}from"../math.js";
import type {FaceWeights}from"../types.js";

export function applyFaceConstraints(face:FaceWeights):FaceWeights{
  const mouthSmile=Math.min(face.mouthSmile,1-face.mouthOpen*.6);
  const mouthFrown=Math.min(face.mouthFrown,1-face.mouthSmile*.5);
  const squintLeft=Math.min(face.eyeSquintLeft,1-face.eyeBlinkLeft);
  const squintRight=Math.min(face.eyeSquintRight,1-face.eyeBlinkRight);
  return {
    ...face,
    mouthSmile:clamp01(mouthSmile),
    mouthFrown:clamp01(mouthFrown),
    eyeSquintLeft:clamp01(squintLeft),
    eyeSquintRight:clamp01(squintRight)
  };
}