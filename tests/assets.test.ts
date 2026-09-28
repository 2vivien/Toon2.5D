import {describe,expect,it}from"vitest";
import type {AssetManifest}from"../assets/src/types.js";
import {createAssetRegistry}from"../assets/src/registry.js";

const manifest={
  schemaVersion:1,
  id:"head.reference",
  version:"0.1.0",
  uri:"https://cdn.example.test/head.glb",
  mime:"model/gltf-binary",
  expressionProfile:{id:"toon.face.v1",version:1,morphBindings:[]},
  anchors:["AvatarRoot","Head","Eye.L","Eye.R","Mouth"]
} satisfies AssetManifest;

describe("asset registry",()=>{
  it("stores validated manifests",()=>{
    const registry=createAssetRegistry();
    registry.register(manifest);
    expect(registry.get("head.reference")?.version).toBe("0.1.0");
    expect(registry.resolve("head.reference")?.uri).toContain("head.reference.glb");
  });
});
