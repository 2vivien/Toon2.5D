import {ToonCoreError}from"./errors.js";
import {createNeutralFace}from"./face-defaults.js";
import {validateDefinition}from"./definition.js";
import {createExpressionController}from"./expression/controller.js";
import {createLookAtController}from"./look-at.js";
import type {Renderer,RendererScene}from"./renderer.js";
import type {AvatarDefinition,FaceWeights,RuntimeAsset,RuntimeStatus,Vec3}from"./types.js";
import type {ExpressionController}from"./expression/controller.js";

export interface AvatarRuntime{
  readonly status:RuntimeStatus;
  readonly face:FaceWeights;
  readonly expression:ExpressionController;
  load(asset:RuntimeAsset):Promise<void>;
  update(deltaSeconds:number):void;
  render():void;
  resize(width:number,height:number):void;
  setLookAt(target:Vec3):void;
  setFaceWeights(weights:Partial<FaceWeights>):void;
  clearFaceWeights():void;
  pause():void;
  resume():void;
  setPerspectiveCamera(camera:import("./camera.js").PerspectiveCameraState):void;
  setLookAtPose(pose:import("./look-at.js").LookAtPose):void;
  applyCustomization(customization:import("./customization.js").CharacterCustomization):Promise<void>;
  setQuality(tier:import("./quality.js").QualityTier):void;
  destroy():void;
}

export function createRuntime(definition:AvatarDefinition,renderer:Renderer):AvatarRuntime{
  validateDefinition(definition);
  const scene:RendererScene=renderer.createScene();
  const expression=createExpressionController();
  const lookAt=createLookAtController();
  let status:RuntimeStatus="ready";
  let face=createNeutralFace();
  let elapsed=0;
  let loadGeneration=0;
  return{
    get status(){return status},
    get face(){return face},
    get expression(){return expression},
    async load(asset){
      if(status==="disposed")throw new ToonCoreError("INVALID_LIFECYCLE","Cannot load a disposed avatar.");
      if(status==="loading")throw new ToonCoreError("INVALID_LIFECYCLE","An avatar asset is already loading.");
      const generation=++loadGeneration;
      status="loading";
      try{await renderer.loadAsset(scene,asset);}
      catch{if(generation===loadGeneration)status="ready";throw new ToonCoreError("INVALID_DEFINITION","Avatar asset loading failed.");}
      if(generation===loadGeneration)status="ready";
    },
    update(deltaSeconds){
      if(!Number.isFinite(deltaSeconds)||deltaSeconds<0)throw new ToonCoreError("INVALID_NUMBER","Delta time must be finite and non-negative.");
      if(status!=="ready")return;
      elapsed+=deltaSeconds;
      renderer.update?.(deltaSeconds);
      face=expression.evaluate({deltaSeconds,elapsedSeconds:elapsed,lookTarget:null});
      if(renderer.setLookAtPose)renderer.setLookAtPose(scene,lookAt.update(deltaSeconds));
    },
    render(){
      if(status!=="ready")return;
      renderer.setFaceWeights(scene,face);
      renderer.render(scene);
    },
    resize(width,height){
      if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new ToonCoreError("INVALID_NUMBER","Renderer dimensions must be positive and finite.");
      renderer.resize(width,height);
    },
    setLookAt(target){expression.setLookTarget(target);lookAt.setTarget(target);},
    setFaceWeights(weights){expression.setExternalWeights(weights);},
    clearFaceWeights(){expression.clearExternalWeights();},
    pause(){if(status==="ready")status="paused";},
    resume(){if(status==="paused")status="ready";},
    setPerspectiveCamera(camera){if(renderer.setPerspectiveCamera)renderer.setPerspectiveCamera(scene,camera);},
    setLookAtPose(pose){if(renderer.setLookAtPose)renderer.setLookAtPose(scene,pose);},
    async applyCustomization(customization){if(renderer.applyCustomization)await renderer.applyCustomization(scene,customization);else throw new ToonCoreError("INVALID_LIFECYCLE","Renderer does not support character customization.");},
    setQuality(tier){if(renderer.setQuality)renderer.setQuality(tier);},
    destroy(){if(status==="disposed")return;loadGeneration++;renderer.dispose(scene);status="disposed";}
  };
}
