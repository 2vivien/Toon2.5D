import type {RendererScene}from"@toon2.5d/core";
import {ThreeRenderer,type ThreeRendererOptions}from"./three-renderer.js";
export interface SharedRenderer extends ThreeRenderer{register(scene:RendererScene):void;unregister(scene:RendererScene):void;renderFrame():void}
export class SharedThreeRenderer extends ThreeRenderer implements SharedRenderer{
 private readonly active=new Set<string>();
 constructor(options:ThreeRendererOptions){super(options)}
 register(scene:RendererScene):void{this.active.add(scene.id)}
 unregister(scene:RendererScene):void{this.active.delete(scene.id)}
 override render(scene:RendererScene):void{this.active.add(scene.id)}
 renderFrame():void{if(this.active.size>0)this.renderAll()}
 override dispose(scene:RendererScene):void{this.active.delete(scene.id);super.dispose(scene)}
}
