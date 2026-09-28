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
export type RuntimeStatus="created"|"loading"|"ready"|"paused"|"disposed";
export type MorphCurve="linear"|"smoothstep"|"easeIn"|"easeOut";
export type MorphSide="left"|"right"|"center"|"both";
export interface MorphBinding{
  readonly parameter:FaceParameter;
  readonly targets:readonly string[];
  readonly scale:number;
  readonly curve?:MorphCurve;
  readonly side?:MorphSide;
  readonly bones?:readonly string[];
  readonly materials?:readonly string[];
}
export interface ExpressionProfile{readonly id:string;readonly version:1;readonly morphBindings:readonly MorphBinding[]}
export interface AssetLoadLimits{
  readonly maxBytes?:number;
  readonly maxTexturePixels?:number;
  readonly maxVertices?:number;
  readonly maxAnimations?:number;
}
export interface RuntimeAsset{
  readonly id?:string;
  readonly version?:string;
  readonly uri:string;
  readonly morphBindings:readonly MorphBinding[];
  readonly integrity?:string;
  readonly trustedOrigins?:readonly string[];
  readonly limits?:AssetLoadLimits;
}
export type AvatarDefinition=Readonly<{schemaVersion:1;assetId:string;expressionProfileId:string}>;