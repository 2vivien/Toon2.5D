import {compose}from"./composer.js";
import {applyFaceConstraints}from"./constraints.js";
import {emotionSource,type EmotionId}from"./emotion.js";
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
  let emotionId:EmotionId="neutral";
  let intensity=1;
  let target:Vec3|null=null;
  let lipState:LipSyncState={viseme:null,weight:0};
  const custom=new Map<ExpressionSource["id"],ExpressionSource>();
  const blink=blinkSource();
  const look=lookAtSource();
  return{
    setEmotion(id,nextIntensity){emotionId=id;intensity=nextIntensity;},
    setLookTarget(nextTarget){target=nextTarget;},
    setLipSync(state){lipState=state;},
    addSource(source){custom.set(source.id,source);},
    removeSource(id){custom.delete(id);},
    evaluate(context){
      const frame={...context,lookTarget:target};
      const contributions:ExpressionContribution[]=[];
      const builtins:readonly ExpressionSource[]=[
        emotionSource({id:emotionId,intensity}),lipSyncSource(()=>lipState),blink,look
      ];
      for(const source of builtins)for(const contribution of source.evaluate(frame))contributions.push(contribution);
      for(const source of custom.values())for(const contribution of source.evaluate(frame))contributions.push(contribution);
      return applyFaceConstraints(compose(contributions));
    }
  };
}