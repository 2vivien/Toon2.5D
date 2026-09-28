import type {AvatarRuntime}from"@toon2.5d/core";
import {animationSource}from"./source.js";
import type {AnimationPlayer}from"./player.js";

export interface AnimationAttachment{detach():void}

export function attachAnimation(runtime:AvatarRuntime,player:AnimationPlayer):AnimationAttachment{
  const source=animationSource(player);
  runtime.expression.addSource(source);
  return{detach:()=>runtime.expression.removeSource(source.id)};
}
