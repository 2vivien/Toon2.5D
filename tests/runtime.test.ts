import {describe,expect,it,vi}from"vitest";
import {createRuntime}from"../core/src/runtime.js";
import type {Renderer}from"../core/src/renderer.js";

function renderer():Renderer{
  return{
    createScene:()=>({id:"test"}),
    loadAsset:vi.fn(async()=>undefined),
    setAvatarTransform:()=>undefined,
    setFaceWeights:vi.fn(),
    render:vi.fn(),
    resize:vi.fn(),
    dispose:vi.fn()
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

  it("keeps explicit face overrides across updates",()=>{
    const target=renderer();
    const runtime=createRuntime({schemaVersion:1,assetId:"head.reference",expressionProfileId:"toon.face.v1"},target);
    runtime.setFaceWeights({mouthSmileLeft:1});
    runtime.update(.016);
    runtime.render();
    expect(target.setFaceWeights).toHaveBeenCalledWith({id:"test"},expect.objectContaining({mouthSmileLeft:1}));
    runtime.clearFaceWeights();
    runtime.update(.016);
    runtime.render();
    expect(target.setFaceWeights).toHaveBeenLastCalledWith({id:"test"},expect.objectContaining({mouthSmileLeft:0}));
  });

  it("validates resize dimensions",()=>{
    const runtime=createRuntime({schemaVersion:1,assetId:"head.reference",expressionProfileId:"toon.face.v1"},renderer());
    expect(()=>runtime.resize(0,320)).toThrow();
    expect(()=>runtime.resize(320,320)).not.toThrow();
  });
  it("loads assets through the stable asset resolver",async()=>{
    const target=renderer();
    const runtime=createRuntime({schemaVersion:1,assetId:"head.reference",expressionProfileId:"toon.face.v1"},target,{assetResolver:{resolve:id=>id==="head.reference"?{id,version:"1",uri:"https://cdn.example.test/head.glb",morphBindings:[]}:undefined}});
    await runtime.loadById("head.reference");
    expect(target.loadAsset).toHaveBeenCalledWith({id:"test"},{id:"head.reference",version:"1",uri:"https://cdn.example.test/head.glb",morphBindings:[]});
  });

});
