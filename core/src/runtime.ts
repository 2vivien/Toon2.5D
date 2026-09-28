import {ToonCoreError}from"./errors.js";
import {createNeutralFace}from"./face-defaults.js";
import {validateDefinition}from"./definition.js";
import {createExpressionController}from"./expression/controller.js";
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
  setLookAt(target:Vec3):void;
  setFaceWeights(weights:Partial<FaceWeights>):void;
  pause():void;
  resume():void;
  destroy():void;
}

export function createRuntime(definition:AvatarDefinition,renderer:Renderer):AvatarRuntime{
  validateDefinition(definition);
  const scene:RendererScene=renderer.createScene();
  const expression=createExpressionController();
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
      const generation=++loadGeneration;
      status="loading";
      try{await renderer.loadAsset(scene,asset);}
      catch{if(generation===loadGeneration)status="ready";throw new ToonCoreError("INVALID_DEFINITION","Avatar asset loading failed.");}
      if(generation===loadGeneration&&status!=="disposed")status="ready";
    },
    update(deltaSeconds){
      if(!Number.isFinite(deltaSeconds)||deltaSeconds<0)throw new ToonCoreError("INVALID_NUMBER","Delta time must be finite and non-negative.");
      if(status!=="ready")return;
      elapsed+=deltaSeconds;
      face=expression.evaluate({deltaSeconds,elapsedSeconds:elapsed,lookTarget:null});
    },
    render(){
      if(status!=="ready")return;
      renderer.setFaceWeights(scene,face);
      renderer.render(scene);
    },
    setLookAt(target){expression.setLookTarget(target);},
    setFaceWeights(weights){face={...face,...weights};},
    pause(){if(status==="ready")status="paused";},
    resume(){if(status==="paused")status="ready";},
    destroy(){if(status==="disposed")return;loadGeneration++;renderer.dispose(scene);status="disposed";}
  };
}