import type {FaceWeights,RuntimeAsset,Transform}from"./types.js";
import type {CharacterCustomization}from"./customization.js";
import type {PerspectiveCameraState}from"./camera.js";
import type {QualityTier}from"./quality.js";
export interface RendererScene{readonly id:string}
export interface Renderer{
  createScene():RendererScene;
  loadAsset(scene:RendererScene,asset:RuntimeAsset):Promise<void>;
  setAvatarTransform(scene:RendererScene,transform:Transform):void;
  setFaceWeights(scene:RendererScene,weights:FaceWeights):void;
  render(scene:RendererScene):void;
  update?(deltaSeconds:number):void;
  resize(width:number,height:number):void;
  dispose(scene:RendererScene):void;
  setPerspectiveCamera?(scene:RendererScene,camera:PerspectiveCameraState):void;
  setLookAtPose?(scene:RendererScene,pose:import("./look-at.js").LookAtPose):void;
  applyCustomization?(scene:RendererScene,customization:CharacterCustomization):Promise<void>|void;
  setQuality?(tier:QualityTier):void;
}