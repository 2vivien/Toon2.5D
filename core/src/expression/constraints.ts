import {clamp01}from"../math.js";
import type {MutableFaceWeights,FaceWeights}from"../types.js";

export function applyFaceConstraints(face:MutableFaceWeights):FaceWeights{
  const smileLeft=Math.min(face.mouthSmileLeft,1-face.jawOpen*.45);
  const smileRight=Math.min(face.mouthSmileRight,1-face.jawOpen*.45);
  const frownLeft=Math.min(face.mouthFrownLeft,1-face.mouthSmileLeft*.5);
  const frownRight=Math.min(face.mouthFrownRight,1-face.mouthSmileRight*.5);
  const blinkLeft=clamp01(face.eyeBlinkLeft);
  const blinkRight=clamp01(face.eyeBlinkRight);
  face.mouthSmileLeft=clamp01(smileLeft);
  face.mouthSmileRight=clamp01(smileRight);
  face.mouthFrownLeft=clamp01(frownLeft);
  face.mouthFrownRight=clamp01(frownRight);
  face.mouthClose=clamp01(Math.min(face.mouthClose,1-face.jawOpen));
  face.eyeSquintLeft=clamp01(Math.min(face.eyeSquintLeft,1-blinkLeft));
  face.eyeSquintRight=clamp01(Math.min(face.eyeSquintRight,1-blinkRight));
  face.eyeWideLeft=clamp01(Math.min(face.eyeWideLeft,1-blinkLeft));
  face.eyeWideRight=clamp01(Math.min(face.eyeWideRight,1-blinkRight));
  face.tongueOut=clamp01(face.tongueOut);
  return face;
}