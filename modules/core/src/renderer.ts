import type {FaceWeights,Transform} from "./types.js";
export interface RendererScene { readonly id:string; }
export interface Renderer {
  createScene():RendererScene;
  setAvatarTransform(scene:RendererScene,transform:Transform):void;
  setFaceWeights(scene:RendererScene,weights:FaceWeights):void;
  render(scene:RendererScene):void;
  resize(width:number,height:number):void;
  dispose(scene:RendererScene):void;
}