import type {ExpressionProfile}from"@toon2.5d/core";
export type {MorphBinding}from"@toon2.5d/core";
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