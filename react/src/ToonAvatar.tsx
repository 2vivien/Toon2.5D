import {useEffect,useRef}from"react";
import {createRuntime}from"@toon2.5d/core";
import {ThreeRenderer}from"@toon2.5d/renderer-three";
import type {AvatarDefinition}from"@toon2.5d/core";

export interface ToonAvatarProps{
  readonly character:AvatarDefinition;
  readonly width?:number;
  readonly height?:number;
}

export function ToonAvatar({character,width=320,height=320}:ToonAvatarProps){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const renderer=new ThreeRenderer({canvas,pixelRatio:1.5});
    const runtime=createRuntime(character,renderer);
    renderer.resize(width,height);
    let frame=0;
    let previous=performance.now();
    const tick=(now:number)=>{
      const delta=Math.min((now-previous)/1000,.1);
      previous=now;
      runtime.update(delta);
      runtime.render();
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);runtime.destroy();renderer.destroy();};
  },[character,width,height]);
  return <canvas ref={canvasRef} width={width} height={height}/>;
}