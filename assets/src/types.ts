import type {FaceParameter}from"@toon2.5d/core";

export interface MorphBinding{
  readonly parameter:FaceParameter;
  readonly targets:readonly string[];
  readonly scale:number;
}

export interface ExpressionProfile{
  readonly id:string;
  readonly version:1;
  readonly morphBindings:readonly MorphBinding[];
}

export interface AssetManifest{
  readonly schemaVersion:1;
  readonly id:string;
  readonly version:string;
  readonly uri:string;
  readonly mime:"model/gltf-binary";
  readonly integrity?:string;
  readonly expressionProfile:ExpressionProfile;
  readonly anchors:readonly string[];
}