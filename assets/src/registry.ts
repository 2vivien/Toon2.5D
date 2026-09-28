import {validateManifest}from"./validator.js";
import type {AssetManifest}from"./types.js";

export interface AssetRegistry{
  register(manifest:AssetManifest):void;
  get(id:string):AssetManifest|undefined;
  clear():void;
}

export function createAssetRegistry():AssetRegistry{
  const entries=new Map<string,AssetManifest>();
  return{
    register(manifest){const valid=validateManifest(manifest);entries.set(valid.id,valid);},
    get(id){return entries.get(id);},
    clear(){entries.clear();}
  };
}