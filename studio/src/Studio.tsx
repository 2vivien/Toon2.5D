import {useEffect,useMemo,useRef,useState}from"react";
import {createAnimationPlayer,attachAnimation,createAnimationEventTimeline}from"@toon2.5d/animation";
import {createRuntime}from"@toon2.5d/core";
import {ThreeRenderer}from"@toon2.5d/renderer-three";
import type{AvatarDefinition,CharacterDefinition,QualityTier}from"@toon2.5d/core";

export interface StudioProps{readonly character:AvatarDefinition;readonly width?:number;readonly height?:number}
type Panel="character"|"expressions"|"animation"|"camera"|"quality";
const slots=["body","face","skin","hair","eyes","brows","nose","mouth","top","bottom","shoes","accessory"] as const;

export function Studio({character,width=640,height=640}:StudioProps){
 const canvasRef=useRef<HTMLCanvasElement|null>(null);const runtimeRef=useRef<ReturnType<typeof createRuntime>|null>(null);
 const[panel,setPanel]=useState<Panel>("character");const[smile,setSmile]=useState(0);const[blink,setBlink]=useState(0);const[playing,setPlaying]=useState(false);
 const[quality,setQuality]=useState<QualityTier>("high");const[fov,setFov]=useState(35);const[project,setProject]=useState<Record<string,string|null>>(()=>Object.fromEntries(slots.map(slot=>[slot,null])));
 const characterDefinition=useMemo<CharacterDefinition|undefined>(()=>character.character,[character.character]);

 useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const renderer=new ThreeRenderer({canvas,pixelRatio:1.5});const runtime=createRuntime(character,renderer);runtimeRef.current=runtime;renderer.resize(width,height);runtime.setQuality(quality);let frame=0;let previous=performance.now();const tick=(now:number)=>{const delta=Math.min((now-previous)/1000,.1);previous=now;runtime.update(delta);runtime.render();frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);runtime.destroy();renderer.destroy();runtimeRef.current=null}},[character,width,height]);
 useEffect(()=>{const runtime=runtimeRef.current;runtime?.setFaceWeights({mouthSmileLeft:smile,mouthSmileRight:smile,eyeBlinkLeft:blink,eyeBlinkRight:blink});runtime?.setQuality(quality);runtime?.setPerspectiveCamera({fov,aspect:width/Math.max(height,1),near:.01,far:100})},[smile,blink,quality,fov,width,height]);
 useEffect(()=>{const runtime=runtimeRef.current;if(!runtime||!playing)return;const player=createAnimationPlayer();player.play({id:"studio-preview",duration:1,tracks:[{parameter:"mouthSmileLeft",easing:"smoothstep",keys:[{time:0,value:0},{time:1,value:1}]},{parameter:"mouthSmileRight",easing:"smoothstep",keys:[{time:0,value:0},{time:1,value:1}]}]},true);const timeline=createAnimationEventTimeline(1,[{time:1,name:"preview-loop"}]);void timeline;const attachment=attachAnimation(runtime,player);return()=>{attachment.detach();player.stop()}},[playing]);
 const exportProject=()=>{const payload={version:1,character,characterDefinition,slots:project,expression:{smile,blink},camera:{fov},quality};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download="toon2.5d-project.json";anchor.click();URL.revokeObjectURL(url)};
 return <section aria-label="Toon2.5D Studio" style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:16}}>
  <aside>
   <strong>Avatar Studio</strong>
   <nav aria-label="Studio panels">{(["character","expressions","animation","camera","quality"] as Panel[]).map(item=><button key={item} type="button" onClick={()=>setPanel(item)} aria-pressed={panel===item}>{item}</button>)}</nav>
   {panel==="character"&&<div><h3>Character</h3>{slots.map(slot=><label key={slot}>{slot}<input value={project[slot]??""} placeholder="asset id" onChange={e=>setProject(value=>({...value,[slot]:e.target.value||null}))}/></label>)}</div>}
   {panel==="expressions"&&<div><h3>Expressions</h3><label>Smile <input aria-label="Smile" type="range" min="0" max="1" step=".01" value={smile} onChange={e=>setSmile(Number(e.target.value))}/></label><label>Blink <input aria-label="Blink" type="range" min="0" max="1" step=".01" value={blink} onChange={e=>setBlink(Number(e.target.value))}/></label></div>}
   {panel==="animation"&&<div><h3>Animation timeline</h3><button type="button" onClick={()=>setPlaying(value=>!value)}>{playing?"Stop":"Play preview"}</button><p>Marker: preview-loop @ 1.0s</p></div>}
   {panel==="camera"&&<div><h3>Camera</h3><label>FOV <input type="range" min="10" max="90" step="1" value={fov} onChange={e=>setFov(Number(e.target.value))}/></label></div>}
   {panel==="quality"&&<div><h3>Quality</h3><select value={quality} onChange={e=>setQuality(e.target.value as QualityTier)}>{["low","medium","high","ultra"].map(item=><option key={item}>{item}</option>)}</select></div>}
   <button type="button" onClick={exportProject}>Export project</button>
  </aside>
  <canvas ref={canvasRef} width={width} height={height} style={{width:"100%",maxWidth:width,height:"auto",display:"block"}}/>
 </section>
}
