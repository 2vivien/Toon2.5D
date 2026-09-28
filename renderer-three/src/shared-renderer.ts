import type {RendererScene,QualityTier}from"@toon2.5d/core";
import {ThreeRenderer,type ThreeRendererOptions}from"./three-renderer.js";

interface Entry{readonly scene:RendererScene;visible:boolean;priority:number;lastFrame:number;quality:QualityTier}
export interface SharedRenderer extends ThreeRenderer{
 register(scene:RendererScene,options?:{readonly priority?:number;readonly visible?:boolean;readonly quality?:QualityTier}):void;
 unregister(scene:RendererScene):void;
 setSceneVisibility(scene:RendererScene,visible:boolean):void;
 setScenePriority(scene:RendererScene,priority:number):void;
 setSceneQuality(scene:RendererScene,quality:QualityTier):void;
 observeVisibility(scene:RendererScene,element:Element):()=>void;
 renderFrame():void;
}
const qualityRank:Record<QualityTier,number>={low:0,medium:1,high:2,ultra:3};
const lowerQuality=(quality:QualityTier):QualityTier=>qualityRank[quality]<=0?"low":qualityRank[quality]===1?"low":qualityRank[quality]===2?"medium":"high";
export class SharedThreeRenderer extends ThreeRenderer implements SharedRenderer{
 private readonly active=new Map<string,Entry>();private frame=0;private frameWindowStart=performance.now();private renderedFrames=0;private currentQuality:QualityTier="high";
 constructor(options:ThreeRendererOptions){super(options)}
 register(scene:RendererScene,options:{readonly priority?:number;readonly visible?:boolean;readonly quality?:QualityTier}={}):void{this.active.set(scene.id,{scene,visible:options.visible??true,priority:options.priority??0,lastFrame:-1,quality:options.quality??this.currentQuality})}
 unregister(scene:RendererScene):void{this.active.delete(scene.id)}
 setSceneVisibility(scene:RendererScene,visible:boolean):void{const entry=this.active.get(scene.id);if(entry)entry.visible=visible}
 setScenePriority(scene:RendererScene,priority:number):void{const entry=this.active.get(scene.id);if(entry)entry.priority=priority}
 setSceneQuality(scene:RendererScene,quality:QualityTier):void{const entry=this.active.get(scene.id);if(entry)entry.quality=quality}
 observeVisibility(scene:RendererScene,element:Element):()=>void{
  this.register(scene);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)this.setSceneVisibility(scene,entry.isIntersecting)}, {threshold:0.01});
  observer.observe(element);
  return()=>observer.disconnect();
 }
 override render(scene:RendererScene):void{if(!this.active.has(scene.id))this.register(scene);const entry=this.active.get(scene.id)!;if(!entry.visible||!this.isSceneInView(scene))return;entry.lastFrame=this.frame;super.render(scene);this.renderedFrames+=1}
 renderFrame():void{
  this.frame+=1;
  const entries=[...this.active.values()].filter(entry=>entry.visible&&this.isSceneInView(entry.scene)).sort((a,b)=>b.priority-a.priority);
  for(const entry of entries){entry.lastFrame=this.frame;super.render(entry.scene);this.renderedFrames+=1}
  const elapsed=performance.now()-this.frameWindowStart;
  if(elapsed>=1000){
   const average=elapsed/Math.max(1,this.renderedFrames);
   if(average>40){this.currentQuality=lowerQuality(this.currentQuality);for(const entry of this.active.values())entry.quality=lowerQuality(entry.quality);super.setQuality(this.currentQuality)}
   this.frameWindowStart=performance.now();this.renderedFrames=0;
  }
 }
 override dispose(scene:RendererScene):void{this.active.delete(scene.id);super.dispose(scene)}
}
