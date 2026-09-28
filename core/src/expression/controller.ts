import {composeInto}from"./composer.js";
import {applyFaceConstraints}from"./constraints.js";
import {createNeutralFace}from"../face-defaults.js";
import {createEmotionSource,type EmotionId}from"./emotion.js";
import {blinkSource}from"./blink.js";
import {lookAtSource}from"./look-at.js";
import {lipSyncSource,type LipSyncState}from"./lipsync.js";
import type {ExpressionContext,ExpressionContribution,ExpressionSource}from"./types.js";
import type {FaceWeights,Vec3}from"../types.js";

export interface ExpressionController{
  setEmotion(id:EmotionId,intensity:number):void;
  setLookTarget(target:Vec3|null):void;
  setLipSync(state:LipSyncState):void;
  addSource(source:ExpressionSource):void;
  removeSource(id:ExpressionSource["id"]):void;
  evaluate(context:ExpressionContext):FaceWeights;
}

export function createExpressionController():ExpressionController{
  let target:Vec3|null=null;
  let lipState:LipSyncState={viseme:null,weight:0};
  const custom=new Map<ExpressionSource["id"],ExpressionSource>();
  const emotion=createEmotionSource();
  const blink=blinkSource();
  const look=lookAtSource();
  const lip=lipSyncSource(()=>lipState);
  const frame:{deltaSeconds:number;elapsedSeconds:number;lookTarget:Vec3|null}={deltaSeconds:0,elapsedSeconds:0,lookTarget:null};
  const contributions:ExpressionContribution[]=[];
  const output=createNeutralFace();
  return{
    setEmotion(id,intensity){emotion.setEmotion(id,intensity);},
    setLookTarget(nextTarget){target=nextTarget;},
    setLipSync(state){lipState=state;},
    addSource(source){custom.set(source.id,source);},
    removeSource(id){custom.delete(id);},
    evaluate(context){
      frame.deltaSeconds=context.deltaSeconds;
      frame.elapsedSeconds=context.elapsedSeconds;
      frame.lookTarget=target;
      contributions.length=0;
      for(const contribution of emotion.evaluate(frame))contributions.push(contribution);
      for(const contribution of lip.evaluate(frame))contributions.push(contribution);
      for(const contribution of blink.evaluate(frame))contributions.push(contribution);
      for(const contribution of look.evaluate(frame))contributions.push(contribution);
      for(const source of custom.values())for(const contribution of source.evaluate(frame))contributions.push(contribution);
      return applyFaceConstraints(composeInto(contributions,output));
    }
  };
}