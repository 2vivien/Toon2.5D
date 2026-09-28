import {ToonCoreError}from"./errors.js";
import {createNeutralFace}from"./face-defaults.js";
import {validateDefinition}from"./definition.js";
import {createExpressionController}from"./expression/controller.js";
import {createLookAtController}from"./look-at.js";
import type {Renderer,RendererScene}from"./renderer.js";
import type {AvatarDefinition,FaceWeights,RuntimeAsset,RuntimeStatus,Vec3}from"./types.js";
import type {CharacterDefinition,CharacterPart}from"./character.js";
import type {CharacterCustomization}from"./customization.js";
import type {ExpressionController}from"./expression/controller.js";

export interface AssetResolver{resolve(id:string):RuntimeAsset|undefined;resolveTexture?(id:string):import("./types.js").RuntimeTextureAsset|undefined}
export interface AvatarRuntime{
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
      const partMap:[import("./customization.js").CustomizationSlot,CharacterPart|undefined][]=[["body",character.body],["face",character.face],["skin",character.skin],["hair",character.hair],["eyes",character.eyes],["brows",character.brows],["nose",character.nose],["mouth",character.mouth],["top",character.top],["bottom",character.bottom],["shoes",character.shoes]];
      const items:CharacterCustomization["items"][number][]=[];let index=0;
      for(const [slot,part] of partMap){if(!part)continue;const asset=options.assetResolver.resolve(part.assetId);if(!asset)throw new ToonCoreError("INVALID_DEFINITION","Unknown character asset ID: "+part.assetId);const texture=part.textureId?options.assetResolver.resolveTexture?.(part.textureId):undefined;
      if(part.textureId&&!texture)throw new ToonCoreError("INVALID_DEFINITION","Unknown character texture asset ID: "+part.textureId);
      items.push({id:slot+"-"+index++,slot,assetId:part.assetId,assetUri:asset.uri,...(texture?{textureId:part.textureId,textureUri:texture.uri,...(texture.integrity?{integrity:texture.integrity}:{}),...(texture.trustedOrigins?{trustedOrigins:texture.trustedOrigins}:{}),...(texture.limits?{limits:texture.limits}:{})}:{}),...(asset.integrity?{integrity:asset.integrity}:{}),...(asset.trustedOrigins?{trustedOrigins:asset.trustedOrigins}:{}),...(asset.limits?{limits:asset.limits}:{}),...(part.morphs?{morphs:part.morphs}:{})});}
      for(const part of character.accessories??[]){const asset=options.assetResolver.resolve(part.assetId);if(!asset)throw new ToonCoreError("INVALID_DEFINITION","Unknown accessory asset ID: "+part.assetId);const texture=part.textureId?options.assetResolver.resolveTexture?.(part.textureId):undefined;
        if(part.textureId&&!texture)throw new ToonCoreError("INVALID_DEFINITION","Unknown accessory texture asset ID: "+part.textureId);
        items.push({id:"accessory-"+index++,slot:"accessory",assetId:part.assetId,assetUri:asset.uri,...(texture?{textureId:part.textureId,textureUri:texture.uri,...(texture.integrity?{integrity:texture.integrity}:{}),...(texture.trustedOrigins?{trustedOrigins:texture.trustedOrigins}:{}),...(texture.limits?{limits:texture.limits}:{})}:{}),...(asset.integrity?{integrity:asset.integrity}:{}),...(asset.trustedOrigins?{trustedOrigins:asset.trustedOrigins}:{}),...(asset.limits?{limits:asset.limits}:{}),...(part.morphs?{morphs:part.morphs}:{})});}
      await this.applyCustomization({selections:{body:null,face:null,skin:null,hair:null,eyes:null,brows:null,nose:null,mouth:null,top:null,bottom:null,shoes:null,accessory:null},items,colors:character.colors});
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
    async applyCustomization(customization){if(!renderer.applyCustomization)throw new ToonCoreError("INVALID_LIFECYCLE","Renderer does not support character customization.");if(customization.items.some(item=>!item.assetId&&item.assetUri))throw new ToonCoreError("INVALID_DEFINITION","Customization assets must be resolved from stable Asset IDs.");if(options.assetResolver){const resolvedItems=customization.items.map(item=>{
          const asset=item.assetId?options.assetResolver!.resolve(item.assetId):undefined;
          if(item.assetId&&!asset)throw new ToonCoreError("INVALID_DEFINITION","Unknown customization asset ID: "+item.assetId);
          const texture=item.textureId?options.assetResolver!.resolveTexture?.(item.textureId):undefined;
          if(item.textureId&&!texture)throw new ToonCoreError("INVALID_DEFINITION","Unknown customization texture asset ID: "+item.textureId);
          return {...item,...(asset?{assetUri:asset.uri,...(asset.integrity?{integrity:asset.integrity}:{}),...(asset.trustedOrigins?{trustedOrigins:asset.trustedOrigins}:{}),...(asset.limits?{limits:asset.limits}:{})}:{}),...(texture?{textureUri:texture.uri,...(texture.integrity?{integrity:texture.integrity}:{}),...(texture.trustedOrigins?{trustedOrigins:texture.trustedOrigins}:{}),...(texture.limits?{limits:texture.limits}:{})}:{})};
        });await renderer.applyCustomization(scene,{...customization,items:resolvedItems});return;}if(customization.items.some(item=>item.assetId))throw new ToonCoreError("INVALID_LIFECYCLE","An asset resolver is required for Asset ID customization.");await renderer.applyCustomization(scene,customization);},
    setQuality(tier){if(renderer.setQuality)renderer.setQuality(tier);},
    destroy(){if(status==="disposed")return;loadGeneration++;renderer.dispose(scene);status="disposed";}
  };
}
