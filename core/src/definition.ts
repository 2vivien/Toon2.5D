import {ToonCoreError} from "./errors.js";
import type {AvatarDefinition} from "./types.js";

export function validateDefinition(input:AvatarDefinition):AvatarDefinition{
  if(input.schemaVersion!==1){
    throw new ToonCoreError("INVALID_DEFINITION","Unsupported avatar schema version.");
  }
  if(!input.assetId||!input.expressionProfileId){
    throw new ToonCoreError("INVALID_DEFINITION","Asset and expression profile are required.");
  }
  return input;
}