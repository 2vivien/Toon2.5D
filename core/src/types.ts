export type FaceParameter =
  | "eyeBlinkLeft" | "eyeLookDownLeft" | "eyeLookInLeft" | "eyeLookOutLeft" | "eyeLookUpLeft" | "eyeSquintLeft" | "eyeWideLeft"
  | "eyeBlinkRight" | "eyeLookDownRight" | "eyeLookInRight" | "eyeLookOutRight" | "eyeLookUpRight" | "eyeSquintRight" | "eyeWideRight"
  | "jawForward" | "jawLeft" | "jawRight" | "jawOpen"
  | "mouthClose" | "mouthFunnel" | "mouthPucker" | "mouthLeft" | "mouthRight"
  | "mouthSmileLeft" | "mouthSmileRight" | "mouthFrownLeft" | "mouthFrownRight"
  | "mouthDimpleLeft" | "mouthDimpleRight" | "mouthStretchLeft" | "mouthStretchRight"
  | "mouthRollLower" | "mouthRollUpper" | "mouthShrugLower" | "mouthShrugUpper"
  | "mouthPressLeft" | "mouthPressRight" | "mouthLowerDownLeft" | "mouthLowerDownRight"
  | "mouthUpperUpLeft" | "mouthUpperUpRight"
  | "browDownLeft" | "browDownRight" | "browInnerUp" | "browOuterUpLeft" | "browOuterUpRight"
  | "cheekPuff" | "cheekSquintLeft" | "cheekSquintRight"
  | "noseSneerLeft" | "noseSneerRight" | "tongueOut";

export type MutableFaceWeights=Record<FaceParameter,number>;
export type FaceWeights=Readonly<MutableFaceWeights>;
export type Vec3=Readonly<{x:number;y:number;z:number}>;
export type Quaternion=Readonly<{x:number;y:number;z:number;w:number}>;
export type Transform=Readonly<{position:Vec3;rotation:Quaternion;scale:Vec3}>;
export type RuntimeStatus="created"|"ready"|"paused"|"disposed";
export interface MorphBinding{readonly parameter:FaceParameter;readonly targets:readonly string[];readonly scale:number}
export interface ExpressionProfile{readonly id:string;readonly version:1;readonly morphBindings:readonly MorphBinding[]}
export type AvatarDefinition=Readonly<{schemaVersion:1;assetId:string;expressionProfileId:string}>;