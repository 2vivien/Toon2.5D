import {useEffect,useRef}from"react";
import {createRuntime,DynamicQualityController}from"@toon2.5d/core";
import {ThreeRenderer}from"@toon2.5d/renderer-three";
import type {AvatarDefinition}from"@toon2.5d/core";

export interface ToonAvatarProps{readonly character:AvatarDefinition;readonly width?:number;readonly height?:number}

export function ToonAvatar({character,width=320,height=320}:ToonAvatarProps){
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const renderer=new ThreeRenderer({canvas,pixelRatio:1.5});const runtime=createRuntime(character,renderer);const quality=new DynamicQualityController();
  renderer.resize(width,height);let frame=0;let previous=performance.now();let lastQuality=quality.state.tier;
  const observer=typeof IntersectionObserver==="undefined"?null:new IntersectionObserver(entries=>quality.setVisible(entries[0]?.isIntersecting===true),{threshold:.01});
  observer?.observe(canvas);
  const tick=(now:number)=>{const delta=Math.min((now-previous)/1000,.1);previous=now;quality.sampleFrame(delta);if(quality.state.tier!==lastQuality){lastQuality=quality.state.tier;runtime.setQuality(lastQuality);}if(quality.state.visible){runtime.update(delta);runtime.render();}frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);
  return()=>{observer?.disconnect();cancelAnimationFrame(frame);runtime.destroy();renderer.destroy()};
 },[character,width,height]);
 return <canvas ref={canvasRef} width={width} height={height}/>;
}