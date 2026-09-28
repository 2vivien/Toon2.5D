import {useEffect,useState}from"react";
import {createAnimationPlayer}from"@toon2.5d/animation";
import type {AvatarRuntime}from"@toon2.5d/core";
import {ToonAvatar}from"@toon2.5d/react";
import type {AvatarDefinition}from"@toon2.5d/core";

export interface StudioProps{readonly character:AvatarDefinition;readonly runtime?:AvatarRuntime}
export function Studio({character,runtime}:StudioProps){
 const [smile,setSmile]=useState(0);const [blink,setBlink]=useState(0);const [playing,setPlaying]=useState(false);
 useEffect(()=>{if(!runtime)return;runtime.setFaceWeights({mouthSmileLeft:smile,mouthSmileRight:smile,eyeBlinkLeft:blink,eyeBlinkRight:blink});},[runtime,smile,blink]);
 useEffect(()=>{if(!runtime||!playing)return;const player=createAnimationPlayer();player.play({id:"studio-preview",duration:1,tracks:[{parameter:"mouthSmileLeft",easing:"smoothstep",keys:[{time:0,value:0},{time:1,value:1}]},{parameter:"mouthSmileRight",easing:"smoothstep",keys:[{time:0,value:0},{time:1,value:1}]}]},true);import("@toon2.5d/animation").then(({attachAnimation})=>attachAnimation(runtime,player));return()=>player.stop();},[runtime,playing]);
 return <section aria-label="Toon2.5D Studio"><div><label>Smile <input type="range" min="0" max="1" step=".01" value={smile} onChange={event=>setSmile(Number(event.target.value))}/></label><label>Blink <input type="range" min="0" max="1" step=".01" value={blink} onChange={event=>setBlink(Number(event.target.value))}/></label><button type="button" onClick={()=>setPlaying(value=>!value)}>{playing?"Stop":"Play preview"}</button></div><ToonAvatar character={character}/></section>
}