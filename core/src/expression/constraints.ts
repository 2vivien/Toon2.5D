import {clamp01}from"../math.js";
import type {FaceWeights}from"../types.js";

export function applyFaceConstraints(face:FaceWeights):FaceWeights{
  const smileLeft=Math.min(face.mouthSmileLeft,1-face.jawOpen*.45);
  const smileRight=Math.min(face.mouthSmileRight,1-face.jawOpen*.45);
  const frownLeft=Math.min(face.mouthFrownLeft,1-face.mouthSmileLeft*.5);
  const frownRight=Math.min(face.mouthFrownRight,1-face.mouthSmileRight*.5);
  const blinkLeft=clamp01(face.eyeBlinkLeft);
  const blinkRight=clamp01(face.eyeBlinkRight);
  return {
    ...face,
    mouthSmileLeft:clamp01(smileLeft),
    mouthSmileRight:clamp01(smileRight),
    mouthFrownLeft:clamp01(frownLeft),
    mouthFrownRight:clamp01(frownRight),
    eyeSquintLeft:clamp01(Math.min(face.eyeSquintLeft,1-blinkLeft)),
    eyeSquintRight:clamp01(Math.min(face.eyeSquintRight,1-blinkRight)),
    eyeWideLeft:clamp01(Math.min(face.eyeWideLeft,1-blinkLeft)),
    eyeWideRight:clamp01(Math.min(face.eyeWideRight,1-blinkRight))
  };
}