import type {AvatarRuntime}from"@toon2.5d/core";
import {animationSource}from"./source.js";
import type {AnimationPlayer}from"./player.js";
import type {AnimationStateMachine}from"./state-machine.js";
import {stateMachineSource}from"./state-machine.js";
import {multiClipSource}from"./blend-player.js";
import type {MultiClipPlayer}from"./blend-player.js";

export interface AnimationAttachment{detach():void}

export function attachStateMachine(runtime:AvatarRuntime,machine:AnimationStateMachine):AnimationAttachment{const source=stateMachineSource(machine);runtime.expression.addSource(source);return{detach:()=>runtime.expression.removeSource(source.id)}}

export function attachMultiClip(runtime:AvatarRuntime,player:MultiClipPlayer):AnimationAttachment{const source=multiClipSource(player);runtime.expression.addSource(source);return{detach:()=>runtime.expression.removeSource(source.id)}}

export function attachAnimation(runtime:AvatarRuntime,player:AnimationPlayer):AnimationAttachment{
  const source=animationSource(player);
  runtime.expression.addSource(source);
  return{detach:()=>runtime.expression.removeSource(source.id)};
}
