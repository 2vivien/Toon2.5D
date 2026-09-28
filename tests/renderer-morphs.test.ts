import {describe,expect,it}from"vitest";
import * as THREE from"three";
import {applyMorphWeights,collectMorphBindings}from"../renderer-three/src/morphs.js";
import {createNeutralFace}from"../core/src/face-defaults.js";

describe("renderer morph bindings",()=>{
  it("maps semantic face weights to GLB morph influences",()=>{
    const geometry=new THREE.BufferGeometry();
    geometry.morphAttributes.position=[
      new THREE.Float32BufferAttribute(new Float32Array([0,0,0]),3),
      new THREE.Float32BufferAttribute(new Float32Array([0,0,0]),3)
    ];
    const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());
    mesh.updateMorphTargets();
    mesh.morphTargetDictionary={smile:0,smileMirror:1};
    const bindings=collectMorphBindings(new THREE.Group().add(mesh),[{
      parameter:"mouthSmileLeft",
      targets:["smile"],
      scale:.8
    },{
      parameter:"mouthSmileRight",
      targets:["smileMirror"],
      scale:1
    }]);
    const face=createNeutralFace();
    face.mouthSmileLeft=.75;
    face.mouthSmileRight=.5;
    applyMorphWeights(bindings,face);
    expect(mesh.morphTargetInfluences?.[0]).toBe(.6);
    expect(mesh.morphTargetInfluences?.[1]).toBe(.5);
    geometry.dispose();
    mesh.material.dispose();
  });
});
