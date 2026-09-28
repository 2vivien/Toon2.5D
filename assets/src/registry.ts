import type {RuntimeAsset}from"@toon2.5d/core";
import {validateManifest}from"./validator.js";
import type {AssetManifest}from"./types.js";

export interface AssetRegistry{
  register(manifest:AssetManifest):void;
  get(id:string):AssetManifest|undefined;
  resolve(id:string):RuntimeAsset|undefined;
  resolveTexture(id:string):import("@toon2.5d/core").RuntimeTextureAsset|undefined;
  clear():void;
}

export function createAssetRegistry():AssetRegistry{
  const entries=new Map<string,AssetManifest>();
  return{
    register(manifest){const valid=validateManifest(manifest);entries.set(valid.id,valid);},
    get(id){return entries.get(id);},
    resolve(id){
      const manifest=entries.get(id);
      if(!manifest)return undefined;
      return {id:manifest.id,version:manifest.version,uri:manifest.uri,morphBindings:manifest.expressionProfile.morphBindings,...(manifest.integrity?{integrity:manifest.integrity}:{}),...(manifest.trustedOrigins?{trustedOrigins:manifest.trustedOrigins}:{}),...(manifest.limits?{limits:manifest.limits}:{}),...(manifest.rig?{rig:manifest.rig}:{})};
    },
    resolveTexture(id){
      const manifest=entries.get(id);
      if(!manifest||manifest.mime==="model/gltf-binary")return undefined;
      return {id:manifest.id,version:manifest.version,uri:manifest.uri,...(manifest.integrity?{integrity:manifest.integrity}:{}),...(manifest.trustedOrigins?{trustedOrigins:manifest.trustedOrigins}:{}),...(manifest.limits?{limits:{maxBytes:manifest.limits.maxBytes,maxTexturePixels:manifest.limits.maxTexturePixels}}:{})};
    },
    clear(){entries.clear();}
  };
}