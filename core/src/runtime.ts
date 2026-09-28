import {ToonCoreError}from"./errors.js";
import {createNeutralFace}from"./face-defaults.js";
import {validateDefinition}from"./definition.js";
import {createExpressionController}from"./expression/controller.js";
import {createLookAtController}from"./look-at.js";
import type {Renderer,RendererScene}from"./renderer.js";
import type {AvatarDefinition,FaceWeights,RuntimeAsset,RuntimeStatus,Vec3}from"./types.js";
import type {CharacterDefinition}from"./character.js";
import type {CharacterCustomization}from"./customization.js";
import type {ExpressionController}from"./expression/controller.js";

export interface AssetResolver{resolve(id:string):RuntimeAsset|undefined}\nexport interface AvatarRuntime{
  readonly status:RuntimeStatus;
  readonly face:FaceWeights;
  readonly expression:ExpressionController;
  load(asset:RuntimeAsset):Promise<void>;
  loadById(assetId:string):Promise<void>;
  applyCharacter(character:CharacterDefinition):Promise<void>;
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

export function createRuntime(definition:AvatarDefinition,renderer:Renderer,options:{readonly assetResolver?:AssetResolver}={}):AvatarRuntime{
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
    async loadById(assetId){const asset=options.assetResolver?.resolve(assetId);if(!asset)throw new ToonCoreError("INVALID_DEFINITION","Unknown asset ID: "+assetId);await this.load(asset)},
    async applyCharacter(character){
      if(!options.assetResolver)throw new ToonCoreError("INVALID_LIFECYCLE","An asset resolver is required for CharacterDefinition loading.");
      const partMap:[string,CharacterDefinition[keyof CharacterDefinition]|undefined][]=[["body",character.body],["head",character.face],["texture",character.skin],["hair",character.hair],["eyes",character.eyes],["brows",character.brows],["nose",character.nose],["mouth",character.mouth],["top",character.top],["bottom",character.bottom],["shoes",character.shoes]];
      const items:CharacterCustomization["items"][number][]=[];let index=0;
      for(const [slot,part] of partMap){if(!part||typeof part!=="object"||!("assetId"in part))continue;const asset=options.assetResolver.resolve(part.assetId);if(!asset)throw new ToonCoreError("INVALID_DEFINITION","Unknown character asset ID: "+part.assetId);items.push({id:slot+"-"+index++,slot:slot==="head"?"head":slot as never,assetUri:asset.uri,morphs:part.morphs});}
      for(const part of character.accessories??[]){const asset=options.assetResolver.resolve(part.assetId);if(!asset)throw new ToonCoreError("INVALID_DEFINITION","Unknown accessory asset ID: "+part.assetId);items.push({id:"accessory-"+index++,slot:"accessory",assetUri:asset.uri,morphs:part.morphs});}
      await this.applyCustomization({selections:{body:null,hair:null,top:null,bottom:null,shoes:null,accessory:null,head:null,texture:null},items});
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
