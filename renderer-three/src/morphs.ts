import * as THREE from "three";
import {FACE_PARAMETERS,clamp01}from"@toon2.5d/core";
import type {FaceParameter,FaceWeights,MorphBinding}from"@toon2.5d/core";

export interface MorphTargetBinding{readonly mesh:THREE.Mesh;readonly index:number;readonly scale:number}
export type MorphBindingMap=Map<FaceParameter,readonly MorphTargetBinding[]>;

export function collectMorphBindings(root:THREE.Object3D,mappings:readonly MorphBinding[]=[]):MorphBindingMap{
  const map:MorphBindingMap=new Map();
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh)||!object.morphTargetDictionary)return;
    const requested=mappings.length>0?mappings:FACE_PARAMETERS.map(parameter=>({parameter,targets:[parameter],scale:1}));
    for(const mapping of requested){
      for(const target of mapping.targets){
        const index=object.morphTargetDictionary[target];
        if(index===undefined)continue;
        const current=map.get(mapping.parameter)??[];
        map.set(mapping.parameter,[...current,{mesh:object,index,scale:mapping.scale}]);
      }
    }
  });
  return map;
}

export function findMissingMorphParameters(map:MorphBindingMap,parameters:readonly FaceParameter[]=FACE_PARAMETERS):readonly FaceParameter[]{
  return parameters.filter(parameter=>!map.has(parameter));
}

export function applyMorphWeights(map:MorphBindingMap,weights:FaceWeights):void{
  for(const parameter of FACE_PARAMETERS){
    const bindings=map.get(parameter);
    if(!bindings)continue;
    const value=weights[parameter];
    for(const binding of bindings){
      const influences=binding.mesh.morphTargetInfluences;
      if(influences)influences[binding.index]=clamp01(value*binding.scale);
    }
  }
}
