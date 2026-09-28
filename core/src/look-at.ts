import type {Vec3,Quaternion}from"./types.js";
export interface LookAtConstraint{readonly yaw:number;readonly pitch:number}
export interface LookAtPose{readonly head:Quaternion;readonly leftEye:Quaternion;readonly rightEye:Quaternion}
export interface LookAtState{readonly yaw:number;readonly pitch:number;readonly pose:LookAtPose;readonly eyeWeights:{readonly left:{readonly horizontal:number;readonly vertical:number};readonly right:{readonly horizontal:number;readonly vertical:number}}}
function clamp(value:number,limit:number):number{return Math.max(-limit,Math.min(limit,value))}
function quaternionFromYawPitch(yaw:number,pitch:number):Quaternion{const sy=Math.sin(yaw/2),cy=Math.cos(yaw/2),sx=Math.sin(pitch/2),cx=Math.cos(pitch/2);return{x:cy*sx,y:sy*cx,z:-sy*sx,w:cy*cx}}
export function solveLookAtState(origin:Vec3,target:Vec3,limits:LookAtConstraint={yaw:Math.PI/3,pitch:Math.PI/4}):LookAtState{
 const dx=target.x-origin.x,dy=target.y-origin.y,dz=target.z-origin.z;const yaw=clamp(Math.atan2(dx,dz),Math.max(0,limits.yaw));const pitch=clamp(Math.atan2(dy,Math.hypot(dx,dz)),Math.max(0,limits.pitch));const eyeYaw=yaw*1.35,eyePitch=pitch*1.35;
 const h=Math.min(1,Math.abs(eyeYaw)/Math.max(.001,Math.max(0,limits.yaw)));const v=Math.min(1,Math.abs(eyePitch)/Math.max(.001,Math.max(0,limits.pitch)));
 return{yaw,pitch,pose:{head:quaternionFromYawPitch(yaw,pitch),leftEye:quaternionFromYawPitch(eyeYaw,eyePitch),rightEye:quaternionFromYawPitch(eyeYaw,eyePitch)},eyeWeights:{left:{horizontal:eyeYaw<0?h:0,vertical:eyePitch>0?v:-v},right:{horizontal:eyeYaw>0?h:0,vertical:eyePitch>0?v:-v}}};
}
export function solveLookAt(origin:Vec3,target:Vec3,limits:LookAtConstraint={yaw:Math.PI/3,pitch:Math.PI/4}):LookAtPose{return solveLookAtState(origin,target,limits).pose}
export interface LookAtController{setTarget(target:Vec3|null):void;update(deltaSeconds:number):LookAtPose}
export function createLookAtController(limits:LookAtConstraint={yaw:Math.PI/3,pitch:Math.PI/4},smoothness=12):LookAtController{
 let target:Vec3|null=null;let current:Vec3={x:0,y:0,z:1};
 return{setTarget(next){target=next},update(delta){if(!Number.isFinite(delta)||delta<0)throw new RangeError("LookAt delta must be finite and non-negative.");const alpha=1-Math.exp(-Math.max(0,smoothness)*delta);const desired=target??{x:0,y:0,z:1};current={x:current.x+(desired.x-current.x)*alpha,y:current.y+(desired.y-current.y)*alpha,z:current.z+(desired.z-current.z)*alpha};return solveLookAt({x:0,y:0,z:0},current,limits)}}
}
