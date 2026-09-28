import type {RendererScene,QualityTier}from"@toon2.5d/core";
import {ThreeRenderer,type ThreeRendererOptions}from"./three-renderer.js";

interface Entry{readonly scene:RendererScene;visible:boolean;priority:number;lastFrame:number}
export interface SharedRenderer extends ThreeRenderer{register(scene:RendererScene,options?:{readonly priority?:number;readonly visible?:boolean}):void;unregister(scene:RendererScene):void;setSceneVisibility(scene:RendererScene,visible:boolean):void;setScenePriority(scene:RendererScene,priority:number):void;renderFrame():void}
export class SharedThreeRenderer extends ThreeRenderer implements SharedRenderer{
 private readonly active=new Map<string,Entry>();private frame=0;
 constructor(options:ThreeRendererOptions){super(options)}
 register(scene:RendererScene,options:{readonly priority?:number;readonly visible?:boolean}={}):void{this.active.set(scene.id,{scene,visible:options.visible??true,priority:options.priority??0,lastFrame:-1})}
 unregister(scene:RendererScene):void{this.active.delete(scene.id)}
 setSceneVisibility(scene:RendererScene,visible:boolean):void{const entry=this.active.get(scene.id);if(entry)entry.visible=visible}
 setScenePriority(scene:RendererScene,priority:number):void{const entry=this.active.get(scene.id);if(entry)entry.priority=priority}
 override render(scene:RendererScene):void{if(!this.active.has(scene.id))this.register(scene);const entry=this.active.get(scene.id)!;entry.lastFrame=this.frame;super.render(scene)}
 renderFrame():void{
  this.frame+=1;const entries=[...this.active.values()].filter(entry=>entry.visible).sort((a,b)=>b.priority-a.priority);
  for(const entry of entries){entry.lastFrame=this.frame;super.render(entry.scene)}
 }
 override dispose(scene:RendererScene):void{this.active.delete(scene.id);super.dispose(scene)}
}
