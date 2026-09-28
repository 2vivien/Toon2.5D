import {createRuntime}from"@toon2.5d/core";
import {ThreeRenderer}from"@toon2.5d/renderer-three";

const canvas=document.querySelector<HTMLCanvasElement>("#avatar");
if(!canvas)throw new Error("Avatar canvas is missing.");

const renderer=new ThreeRenderer({canvas,pixelRatio:1.5});
const runtime=createRuntime({
  schemaVersion:1,
  assetId:"head.reference",
  expressionProfileId:"toon.face.v1"
},renderer);

renderer.resize(320,320);
runtime.expression.setEmotion("happy",.85);
runtime.setLookAt({x:.4,y:.1,z:1});

let previous=performance.now();
function frame(now:number):void{
  const delta=Math.min((now-previous)/1000,.1);
  previous=now;
  runtime.update(delta);
  runtime.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
