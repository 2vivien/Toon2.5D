export type FaceParameter =
  | "mouthSmile" | "mouthOpen" | "mouthFrown" | "mouthPucker" | "mouthStretch"
  | "jawOpen" | "eyeBlinkLeft" | "eyeBlinkRight" | "eyeSquintLeft" | "eyeSquintRight"
  | "browRaiseLeft" | "browRaiseRight" | "browFurrowLeft" | "browFurrowRight"
  | "cheekRaiseLeft" | "cheekRaiseRight" | "cheekPuff" | "noseWrinkle"
  | "eyeLookHorizontal" | "eyeLookVertical";

export type FaceWeights=Readonly<Record<FaceParameter,number>>;
export type Vec3=Readonly<{x:number;y:number;z:number}>;
export type Quaternion=Readonly<{x:number;y:number;z:number;w:number}>;
export type Transform=Readonly<{position:Vec3;rotation:Quaternion;scale:Vec3}>;
export type RuntimeStatus="created"|"ready"|"paused"|"disposed";
export type AvatarDefinition=Readonly<{schemaVersion:1;assetId:string;expressionProfileId:string}>;