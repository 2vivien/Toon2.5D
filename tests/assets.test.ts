import {describe,expect,it}from"vitest";
import {createAssetRegistry}from"../assets/src/registry.js";

const manifest={
  schemaVersion:1 as const,
  id:"head.reference",
  version:"0.1.0",
  uri:"https://cdn.example.test/head.glb",
  mime:"model/gltf-binary" as const,
  expressionProfile:{id:"toon.face.v1",version:1 as const,morphBindings:[]},
  anchors:["AvatarRoot","Head","Eye.L","Eye.R","Mouth"]
};

describe("asset registry",()=>{
  it("stores validated manifests",()=>{
    const registry=createAssetRegistry();
    registry.register(manifest);
    expect(registry.get("head.reference")?.version).toBe("0.1.0");
  });
});
