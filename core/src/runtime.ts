import {ToonCoreError}from"./errors.js";
import {createNeutralFace}from"./face-defaults.js";
import {validateDefinition}from"./definition.js";
import type {Renderer,RendererScene}from"./renderer.js";
import type {AvatarDefinition,FaceWeights,RuntimeStatus,Vec3}from"./types.js";

export interface AvatarRuntime{
  readonly status:RuntimeStatus;
  readonly face:FaceWeights;
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
  let status:RuntimeStatus="ready";
  let face=createNeutralFace();
  return {
    get status(){return status},
    get face(){return face},
    update(deltaSeconds){
      if(!Number.isFinite(deltaSeconds)||deltaSeconds<0){
        throw new ToonCoreError("INVALID_NUMBER","Delta time must be finite and non-negative.");
      }
    },
    render(){
      if(status!=="ready")return;
      renderer.setFaceWeights(scene,face);
      renderer.render(scene);
    },
    setLookAt(target){
      const x=Math.max(-1,Math.min(1,target.x));
      const y=Math.max(-1,Math.min(1,target.y));
      face={...face,eyeLookHorizontal:(x+1)/2,eyeLookVertical:(y+1)/2};
    },
    setFaceWeights(weights){face={...face,...weights}},
    pause(){if(status==="ready")status="paused"},
    resume(){if(status==="paused")status="ready"},
    destroy(){
      if(status==="disposed")return;
      renderer.dispose(scene);
      status="disposed";
    }
  };
}