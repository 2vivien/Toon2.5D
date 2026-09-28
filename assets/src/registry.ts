import type {RuntimeAsset}from"@toon2.5d/core";
import {validateManifest}from"./validator.js";
import type {AssetManifest}from"./types.js";

export interface AssetRegistry{
  register(manifest:AssetManifest):void;
  get(id:string):AssetManifest|undefined;
  resolve(id:string):RuntimeAsset|undefined;
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
      return {uri:manifest.uri,morphBindings:manifest.expressionProfile.morphBindings};
    },
    clear(){entries.clear();}
  };
}