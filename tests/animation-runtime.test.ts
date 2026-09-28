import {describe,expect,it}from"vitest";
import {createRuntime}from"../core/src/runtime.js";
import type {Renderer}from"../core/src/renderer.js";
import {createAnimationPlayer,attachAnimation}from"../animation/src/index.js";

function renderer():Renderer{
  return{
    createScene:()=>({id:"animation-test"}),
    loadAsset:async()=>undefined,
    setAvatarTransform:()=>undefined,
    setFaceWeights:()=>undefined,
    render:()=>undefined,
    resize:()=>undefined,
    dispose:()=>undefined
  };
}

describe("animation runtime integration",()=>{
  it("feeds deterministic animation output into the core expression pipeline",()=>{
    const runtime=createRuntime({schemaVersion:1,assetId:"head.reference",expressionProfileId:"toon.face.v1"},renderer());
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
    player.update(.5);
    runtime.update(.016);
    expect(runtime.face.mouthSmileLeft).toBe(.5);
    attachment.detach();
    runtime.update(.016);
    expect(runtime.face.mouthSmileLeft).toBe(0);
  });
});
