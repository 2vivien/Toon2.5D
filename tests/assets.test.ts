import {describe,expect,it}from"vitest";
import type {AssetManifest}from"../assets/src/types.js";
import {createAssetRegistry}from"../assets/src/registry.js";
import {validateManifest}from"../assets/src/validator.js";

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
    expect(registry.resolve("head.reference")?.uri).toContain("head.glb");
  });
  it("resolves hardened asset metadata",()=>{
    const registry=createAssetRegistry();
    const hardened={...manifest,integrity:"sha256-YWJjZA==",trustedOrigins:["https://cdn.example.test"],limits:{maxBytes:1024*1024,maxVertices:100000,maxTexturePixels:4096*4096,maxAnimations:8},rig:{headBone:"Head",leftEyeBone:"Eye.L",rightEyeBone:"Eye.R"}};
    registry.register(hardened);
    expect(registry.resolve("head.reference")).toMatchObject({integrity:"sha256-YWJjZA==",trustedOrigins:["https://cdn.example.test"],limits:{maxBytes:1048576},rig:{headBone:"Head"}});
  });
  it("resolves first-class texture assets",()=>{const registry=createAssetRegistry();const texture={schemaVersion:1,id:"hair.texture",version:"1.0.0",uri:"https://cdn.example.test/hair.webp",mime:"image/webp",anchors:[],expressionProfile:undefined,limits:{maxBytes:1024,maxTexturePixels:4096}} as unknown as AssetManifest;registry.register(texture);expect(registry.resolveTexture("hair.texture")).toMatchObject({id:"hair.texture",uri:"https://cdn.example.test/hair.webp",limits:{maxBytes:1024,maxTexturePixels:4096}})});
  it("rejects invalid integrity and insecure trusted origins",()=>{
    expect(()=>validateManifest({...manifest,integrity:"md5-nope"})).toThrow();
    expect(()=>validateManifest({...manifest,trustedOrigins:["http://evil.example"]})).toThrow();
  });

});
