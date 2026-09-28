import * as THREE from "three";
import {FACE_PARAMETERS,clamp01}from"@toon2.5d/core";
import type {FaceParameter,FaceWeights,MorphBinding}from"@toon2.5d/core";

export interface MorphTargetBinding{readonly mesh:THREE.Mesh;readonly index:number;readonly scale:number;readonly curve?:"linear"|"smoothstep"|"easeIn"|"easeOut";readonly bones:readonly THREE.Bone[];readonly materials:readonly THREE.Material[];readonly boneRotationAxis?:"x"|"y"|"z";readonly boneRotationScale?:number;readonly materialChannel?:"opacity"|"metalness"|"roughness"|"emissiveIntensity";readonly materialScale?:number}
export type MorphBindingMap=Map<FaceParameter,readonly MorphTargetBinding[]>;

export function collectMorphBindings(root:THREE.Object3D,mappings:readonly MorphBinding[]=[]):MorphBindingMap{
  const map:MorphBindingMap=new Map();const bones=new Map<string,THREE.Bone>();const materials=new Map<string,THREE.Material>();
  root.traverse(object=>{
    if(object instanceof THREE.Bone&&object.name)bones.set(object.name,object);
    if(object instanceof THREE.Mesh){const materialList=Array.isArray(object.material)?object.material:[object.material];for(const material of materialList)if(material.name)materials.set(material.name,material)}
    if(!(object instanceof THREE.Mesh)||!object.morphTargetDictionary)return;
    const requested:readonly MorphBinding[]=mappings.length>0?mappings:FACE_PARAMETERS.map(parameter=>({parameter,targets:[parameter],scale:1}));
    for(const mapping of requested){
      for(const target of mapping.targets){
        const index=object.morphTargetDictionary[target];
        if(index===undefined)continue;
        const current=map.get(mapping.parameter)??[];
        map.set(mapping.parameter,[...current,{mesh:object,index,scale:mapping.scale,bones:(mapping.bones??[]).map(name=>bones.get(name)).filter((bone):bone is THREE.Bone=>Boolean(bone)),materials:(mapping.materials??[]).map(name=>materials.get(name)).filter((material):material is THREE.Material=>Boolean(material)),...(mapping.curve?{curve:mapping.curve}:{}),...(mapping.boneRotationAxis?{boneRotationAxis:mapping.boneRotationAxis}:{}),...(mapping.boneRotationScale!==undefined?{boneRotationScale:mapping.boneRotationScale}:{}),...(mapping.materialChannel?{materialChannel:mapping.materialChannel}:{}),...(mapping.materialScale!==undefined?{materialScale:mapping.materialScale}:{})}]);
      }
    }
  });
  return map;
}

export function findMissingMorphParameters(map:MorphBindingMap,parameters:readonly FaceParameter[]=FACE_PARAMETERS):readonly FaceParameter[]{
  return parameters.filter(parameter=>!map.has(parameter));
}

function curveValue(value:number,curve:NonNullable<MorphTargetBinding["curve"]>|undefined):number{switch(curve){case"smoothstep":return value*value*(3-2*value);case"easeIn":return value*value;case"easeOut":return 1-(1-value)*(1-value);default:return value}}
export function applyMorphWeights(map:MorphBindingMap,weights:FaceWeights):void{
  for(const parameter of FACE_PARAMETERS){
    const bindings=map.get(parameter);
    if(!bindings)continue;
    const value=weights[parameter];
    for(const binding of bindings){
      const influences=binding.mesh.morphTargetInfluences;
      const driven=clamp01(curveValue(clamp01(value)*binding.scale,binding.curve));if(influences)influences[binding.index]=driven;if(binding.bones.length&&binding.boneRotationAxis){const amount=driven*(binding.boneRotationScale??.15);for(const bone of binding.bones){if(binding.boneRotationAxis==="x")bone.rotateX(amount);else if(binding.boneRotationAxis==="y")bone.rotateY(amount);else bone.rotateZ(amount)}}if(binding.materials.length&&binding.materialChannel){const amount=driven*(binding.materialScale??1);for(const material of binding.materials){const target=material as THREE.Material&{opacity?:number;metalness?:number;roughness?:number;emissiveIntensity?:number};if(binding.materialChannel==="opacity"&&target.opacity!==undefined){target.opacity=Math.max(0,Math.min(1,amount));material.transparent=true;material.needsUpdate=true}else if(binding.materialChannel==="metalness"&&target.metalness!==undefined){target.metalness=Math.max(0,Math.min(1,amount));material.needsUpdate=true}else if(binding.materialChannel==="roughness"&&target.roughness!==undefined){target.roughness=Math.max(0,Math.min(1,amount));material.needsUpdate=true}else if(binding.materialChannel==="emissiveIntensity"&&target.emissiveIntensity!==undefined){target.emissiveIntensity=Math.max(0,amount);material.needsUpdate=true}}}
    }
  }
}
