import {bench,describe}from"vitest";
import {createRuntime}from"../core/src/runtime.js";
import type{Renderer,RendererScene}from"../core/src/renderer.js";
import type{AvatarDefinition,FaceWeights,RuntimeAsset,Transform}from"../core/src/types.js";
import {DynamicQualityController}from"../core/src/quality.js";

const definition:AvatarDefinition={schemaVersion:1,assetId:"reference.head",expressionProfileId:"reference.face"};
const renderer:Renderer={
 createScene:()=>({id:crypto.randomUUID()} as RendererScene),
 loadAsset:async()=>{},
 setAvatarTransform:(_:RendererScene,__:Transform)=>{},
 setFaceWeights:(_:RendererScene,__:FaceWeights)=>{},
 render:(_:RendererScene)=>{},
 resize:()=>{},
 dispose:()=>{}
};
const asset:RuntimeAsset={uri:"https://example.invalid/reference.glb",morphBindings:[]};

describe("engine startup and runtime",()=>{
 bench("create and destroy runtime",()=>{const runtime=createRuntime(definition,renderer);runtime.destroy()});
 bench("single avatar update/render",()=>{const runtime=createRuntime(definition,renderer);runtime.update(.016);runtime.render();runtime.destroy()});
 bench("100-avatar update/render",()=>{const runtimes=Array.from({length:100},()=>createRuntime(definition,renderer));for(const runtime of runtimes){runtime.update(.016);runtime.render();runtime.destroy()}});
 bench("dynamic quality adaptation",()=>{const quality=new DynamicQualityController();for(let i=0;i<120;i++)quality.sampleFrame(.016);quality.setVisible(false);void quality.state});
 void asset;
});
