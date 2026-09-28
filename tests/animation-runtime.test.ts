import {describe,expect,it}from"vitest";
import {createRuntime}from"../core/src/runtime.js";
import type {FaceWeights}from"../core/src/types.js";
import type {Renderer}from"../core/src/renderer.js";
import {createAnimationPlayer,attachAnimation}from"../animation/src/index.js";

function renderer(onFace:(face:FaceWeights)=>void,onRender:()=>void):Renderer{
  return{
    createScene:()=>({id:"animation-test"}),
    loadAsset:async()=>undefined,
    setAvatarTransform:()=>undefined,
    setFaceWeights:(_scene,face)=>onFace(face),
    render:()=>onRender(),
    resize:()=>undefined,
    dispose:()=>undefined
  };
}

describe("animation runtime integration",()=>{
  it("feeds animation through expression evaluation into renderer render",()=>{
    let rendered=0;
    let applied:FaceWeights|null=null;
    const runtime=createRuntime({schemaVersion:1,assetId:"head.reference",expressionProfileId:"toon.face.v1"},
      renderer(face=>{applied=face;},()=>{rendered+=1;}));
    const player=createAnimationPlayer();
    player.play({
      id:"smile",
      duration:1,
      tracks:[{
        parameter:"mouthSmileLeft",
        easing:"linear",
        keys:[{time:0,value:0},{time:1,value:1}]
      }]
    },false);
    const attachment=attachAnimation(runtime,player);
    runtime.update(.5);
    runtime.render();
    expect(runtime.face.mouthSmileLeft).toBe(.5);
    expect(applied?.mouthSmileLeft).toBe(.5);
    expect(rendered).toBe(1);
    attachment.detach();
    runtime.update(.016);
    expect(runtime.face.mouthSmileLeft).toBe(0);
  });
});
