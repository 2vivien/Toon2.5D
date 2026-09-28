import type {FaceParameter}from"@toon2.5d/core";
export type Easing="linear"|"smoothstep";
export interface Keyframe{readonly time:number;readonly value:number}
export interface Track{readonly parameter:FaceParameter;readonly keys:readonly Keyframe[];readonly easing:Easing}

export interface Clip{
  readonly id:string;
  readonly duration:number;
  readonly tracks:readonly Track[];
}

export interface AnimationState{
  readonly clip:string|null;
  readonly time:number;
  readonly playing:boolean;
}
