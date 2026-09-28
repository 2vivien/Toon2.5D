import * as THREE from "three";
import {FACE_PARAMETERS,clamp01}from"@toon2.5d/core";
import type {FaceParameter,FaceWeights,MorphBinding}from"@toon2.5d/core";

export interface MorphTargetBinding{readonly mesh:THREE.Mesh;readonly index:number;readonly scale:number}
export type MorphBindingMap=Map<FaceParameter,readonly MorphTargetBinding[]>;

export function collectMorphBindings(root:THREE.Object3D,mappings:readonly MorphBinding[]=[]):MorphBindingMap{
  const map:MorphBindingMap=new Map();
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh)||!object.morphTargetDictionary)return;
    for(const mapping of mappings){
      for(const target of mapping.targets){
        const index=object.morphTargetDictionary[target];
        if(index===undefined)continue;
        const current=map.get(mapping.parameter)??[];
        map.set(mapping.parameter,[...current,{mesh:object,index,scale:mapping.scale}]);
      }
    }
    if(mappings.length===0)for(const parameter of FACE_PARAMETERS){
      const index=object.morphTargetDictionary[parameter];
      if(index===undefined)continue;
      const current=map.get(parameter)??[];
      map.set(parameter,[...current,{mesh:object,index,scale:1}]);
    }
  });
  return map;
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