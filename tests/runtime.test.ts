import {describe,expect,it}from"vitest";
import {createRuntime}from"../core/src/runtime.js";
import type {Renderer}from"../core/src/renderer.js";

function renderer():Renderer{
  let disposed=false;
  return{
    createScene:()=>({id:"test"}),
    loadAsset:async()=>undefined,
    setAvatarTransform:()=>undefined,
    setFaceWeights:()=>undefined,
    render:()=>undefined,
    resize:()=>undefined,
    dispose:()=>{disposed=true;}
  };
}

describe("runtime",()=>{
  it("owns disposal and pause state",()=>{
    const runtime=createRuntime({schemaVersion:1,assetId:"head.reference",expressionProfileId:"toon.face.v1"},renderer());
    expect(runtime.status).toBe("ready");
    runtime.pause();
    expect(runtime.status).toBe("paused");
    runtime.resume();
    runtime.destroy();
    expect(runtime.status).toBe("disposed");
  });
});
