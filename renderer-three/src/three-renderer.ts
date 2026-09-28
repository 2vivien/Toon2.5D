import * as THREE from "three";
import {loadGLTF}from"./gltf-loader.js";
import {createFallbackAvatar}from"./fallback.js";
import {applyMorphWeights,collectMorphBindings,findMissingMorphParameters,type MorphBindingMap}from"./morphs.js";
import type {FaceWeights,Renderer,RendererScene,Transform,CharacterCustomization,PerspectiveCameraState,LookAtPose,QualityTier,RuntimeAsset}from"@toon2.5d/core";

interface AvatarScene extends RendererScene{
  readonly root:THREE.Group;
  readonly scene:THREE.Scene;
  readonly head:THREE.Mesh;
  readonly leftEye:THREE.Mesh;
  readonly rightEye:THREE.Mesh;
  readonly mouth:THREE.Mesh;
  morphBindings:MorphBindingMap;
  loadedRoot?:THREE.Object3D;
  readonly slots:Map<string,THREE.Group>;
  customizationMorphs:Partial<FaceWeights>;
  readonly camera:THREE.OrthographicCamera;
  readonly perspectiveCamera:THREE.PerspectiveCamera;
  rig?:{headBone:string;leftEyeBone:string;rightEyeBone:string};
  mixer?:THREE.AnimationMixer;
  animations:THREE.AnimationClip[];
}

export interface RendererMorphBinding{readonly parameter:keyof FaceWeights;readonly targets:readonly string[];readonly scale:number}

export interface ThreeRendererOptions{
  readonly canvas:HTMLCanvasElement;
  readonly background?:number;
  readonly pixelRatio?:number;
}


async function loadTextureSecure(uri:string,options:{readonly integrity?:string;readonly trustedOrigins?:readonly string[];readonly maxBytes?:number;readonly maxTexturePixels?:number}={}):Promise<THREE.Texture>{
 const parsed=new URL(uri);const dev=(globalThis as {process?:{env?:Record<string,string|undefined>}}).process?.env?.NODE_ENV==="development";const localhost=parsed.hostname==="localhost"||parsed.hostname==="127.0.0.1"||parsed.hostname==="::1";if(parsed.protocol!=="https:"&&!(dev&&parsed.protocol==="http:"&&localhost))throw new Error("Remote textures must use HTTPS.");if(options.trustedOrigins?.length&&!options.trustedOrigins.includes(parsed.origin))throw new Error("Texture origin is not trusted.");
 const response=await fetch(uri,{credentials:"omit"});if(!response.ok)throw new Error(`Texture request failed: ${response.status} ${response.statusText}`);const declared=response.headers.get("content-length");if(options.maxBytes!==undefined&&declared&&Number(declared)>options.maxBytes)throw new Error("Texture exceeds configured byte-size limit.");const data=await response.arrayBuffer();if(options.maxBytes!==undefined&&data.byteLength>options.maxBytes)throw new Error("Texture exceeds configured byte-size limit.");
 if(options.integrity){if(!options.integrity.startsWith("sha256-"))throw new Error("Only sha256 texture integrity is supported.");const digest=await crypto.subtle.digest("SHA-256",data);const encoded=btoa(String.fromCharCode(...new Uint8Array(digest)));if("sha256-"+encoded!==options.integrity)throw new Error("Texture integrity verification failed.");}
 const blob=new Blob([data]);const objectUrl=URL.createObjectURL(blob);try{const texture=await new THREE.TextureLoader().loadAsync(objectUrl);const image=texture.image as {width?:number;height?:number}|undefined;if(options.maxTexturePixels!==undefined&&image?.width&&image.height&&image.width*image.height>options.maxTexturePixels){texture.dispose();throw new Error("Texture pixel limit exceeded.");}return texture}finally{URL.revokeObjectURL(objectUrl)}
}
function applyTextureToRoot(root:THREE.Object3D,texture:THREE.Texture):void{root.traverse(object=>{if(!(object instanceof THREE.Mesh))return;const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){if("map"in material){material.map=texture;material.needsUpdate=true}}})}
function applyColorToRoot(root:THREE.Object3D,color:string):void{const parsed=new THREE.Color(color);root.traverse(object=>{if(!(object instanceof THREE.Mesh))return;const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){if("color"in material){(material as THREE.MeshStandardMaterial).color.copy(parsed);material.needsUpdate=true}}})}

function disposeObject(root:THREE.Object3D):void{
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    object.geometry.dispose();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials){for(const key of ["map","normalMap","roughnessMap","metalnessMap","emissiveMap","aoMap","alphaMap"]){const texture=material[key as keyof THREE.Material] as THREE.Texture|undefined;if(texture instanceof THREE.Texture)texture.dispose();}material.dispose();}
  });
}

export class ThreeRenderer implements Renderer{
  private readonly renderer:THREE.WebGLRenderer;
  private readonly scenes=new Map<string,AvatarScene>();
  private contextLost=false;
  private readonly onContextLost=(event:Event)=>{event.preventDefault();this.contextLost=true;};
  private readonly onContextRestored=()=>{this.contextLost=false;this.renderer.resetState();for(const avatar of this.scenes.values())this.markResourcesDirty(avatar.root);};

  constructor(options:ThreeRendererOptions){
    this.renderer=new THREE.WebGLRenderer({canvas:options.canvas,antialias:true,alpha:true});
    this.renderer.setPixelRatio(Math.min(options.pixelRatio??1.5,2));
    options.canvas.addEventListener("webglcontextlost",this.onContextLost,false);
    options.canvas.addEventListener("webglcontextrestored",this.onContextRestored,false);
  }

  createScene():RendererScene{
    const fallback=createFallbackAvatar();const {root,head,leftEye,rightEye,mouth}=fallback;
    const scene=new THREE.Scene();
    scene.background=null;
    const fill=new THREE.HemisphereLight(0xffffff,0x555555,1.4);
    const key=new THREE.DirectionalLight(0xffffff,1.8); key.position.set(2,3,4);
    scene.add(fill,key,root);
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,100);camera.position.z=5;
    const perspectiveCamera=new THREE.PerspectiveCamera(35,1,.01,100);perspectiveCamera.position.z=5;
    const slots=new Map<string,THREE.Group>();for(const slot of ["body","face","skin","hair","eyes","brows","nose","mouth","top","bottom","shoes","accessory"])slots.set(slot,new THREE.Group());slots.forEach(group=>root.add(group));
    const avatar:AvatarScene={id:crypto.randomUUID(),scene,root,head,leftEye,rightEye,mouth,morphBindings:new Map(),slots,customizationMorphs:{},camera,perspectiveCamera,animations:[]};
    this.scenes.set(avatar.id,avatar);return avatar;
  }

  private eye(material:THREE.Material,pupilMaterial:THREE.Material):THREE.Mesh{
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.22,20,16),material);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),pupilMaterial);
    pupil.position.z=.19;
    eye.add(pupil);
    return eye;
  }

  async loadAsset(scene:RendererScene,asset:RuntimeAsset):Promise<void>{
    await this.loadModel(scene,asset.uri,asset.morphBindings,asset);
  }

  async loadModel(scene:RendererScene,url:string,mappings:readonly RendererMorphBinding[]=[],asset?:RuntimeAsset):Promise<void>{
    const avatar=this.requireScene(scene);
    const gltf=await loadGLTF(url,{renderer:this.renderer,...(asset?.limits?.maxBytes!==undefined?{maxBytes:asset.limits.maxBytes}:{}),...(asset?.limits?.maxTexturePixels!==undefined?{maxTexturePixels:asset.limits.maxTexturePixels}:{}),...(asset?.limits?.maxVertices!==undefined?{maxVertices:asset.limits.maxVertices}:{}),...(asset?.limits?.maxAnimations!==undefined?{maxAnimations:asset.limits.maxAnimations}:{}),...(asset?.trustedOrigins?{trustedOrigins:asset.trustedOrigins}:{}),...(asset?.integrity?{integrity:asset.integrity}:{})});
    if(this.scenes.get(scene.id)!==avatar){
      disposeObject(gltf.scene);
      throw new Error("Renderer scene was disposed while the asset was loading.");
    }
    const morphBindings=collectMorphBindings(gltf.scene,mappings);
    const missing=findMissingMorphParameters(morphBindings,mappings.map(mapping=>mapping.parameter));
    if(missing.length>0){
      disposeObject(gltf.scene);
      throw new Error(`Missing required facial morphs: ${missing.join(",")}`);
    }
    if(avatar.loadedRoot){
      disposeObject(avatar.loadedRoot);
      avatar.loadedRoot.removeFromParent();
    }
    avatar.head.visible=false;
    avatar.leftEye.visible=false;
    avatar.rightEye.visible=false;
    avatar.mouth.visible=false;
    avatar.root.add(gltf.scene);
    avatar.loadedRoot=gltf.scene;
    avatar.mixer=new THREE.AnimationMixer(gltf.scene);
    avatar.animations=[...gltf.animations];
    avatar.morphBindings=morphBindings;
    if(asset?.rig)avatar.rig=asset.rig;else delete avatar.rig;
  }

  update(deltaSeconds:number):void{if(!Number.isFinite(deltaSeconds)||deltaSeconds<0)return;for(const avatar of this.scenes.values())avatar.mixer?.update(deltaSeconds)}

  getAnimationMixer(scene:RendererScene):THREE.AnimationMixer|undefined{return this.requireScene(scene).mixer}
  getScenes():readonly RendererScene[]{return [...this.scenes.values()]}
  getAnimationNames(scene:RendererScene):readonly string[]{return this.requireScene(scene).animations.map(clip=>clip.name).filter(Boolean)}
  getBoneNames(scene:RendererScene):readonly string[]{const names:string[]=[];this.requireScene(scene).loadedRoot?.traverse(object=>{if(object instanceof THREE.Bone)names.push(object.name)});return names}


  playAnimation(scene:RendererScene,name:string,options:{readonly loop?:THREE.AnimationActionLoopStyles;readonly repetitions?:number}={}):THREE.AnimationAction{
    const avatar=this.requireScene(scene);if(!avatar.mixer||!avatar.loadedRoot)throw new Error("Scene has no native animation mixer.");const clip=THREE.AnimationClip.findByName(avatar.animations,name);if(!clip)throw new Error("Animation clip not found: "+name);const action=avatar.mixer.clipAction(clip);if(options.loop!==undefined)action.setLoop(options.loop,options.repetitions??Infinity);action.play();return action;
  }

  setAvatarTransform(scene:RendererScene,transform:Transform):void{
    const avatar=this.requireScene(scene);
    avatar.root.position.set(transform.position.x,transform.position.y,transform.position.z);
    avatar.root.scale.set(transform.scale.x,transform.scale.y,transform.scale.z);
    avatar.root.quaternion.set(transform.rotation.x,transform.rotation.y,transform.rotation.z,transform.rotation.w);
  }

  setFaceWeights(scene:RendererScene,weights:FaceWeights):void{
    const avatar=this.requireScene(scene);
    const merged={...weights,...avatar.customizationMorphs};if(avatar.morphBindings.size>0)applyMorphWeights(avatar.morphBindings,merged);
    const blinkLeft=1-weights.eyeBlinkLeft;
    const blinkRight=1-weights.eyeBlinkRight;
    avatar.leftEye.scale.y=.15+.85*(1-merged.eyeBlinkLeft);
    avatar.rightEye.scale.y=.15+.85*(1-merged.eyeBlinkRight);
    avatar.mouth.scale.y=.2+.6*merged.jawOpen;
    avatar.mouth.scale.x=.8+.35*((merged.mouthSmileLeft+merged.mouthSmileRight)/2);
    avatar.mouth.position.y=-.28+.08*merged.jawOpen;
    avatar.root.rotation.y=(merged.eyeLookOutLeft-merged.eyeLookInLeft)*.2;
    avatar.root.rotation.x=(merged.eyeLookDownLeft-merged.eyeLookUpLeft)*.2;
  }

  render(scene:RendererScene):void{if(this.contextLost)return;const avatar=this.requireScene(scene);this.renderScene(avatar)}
  protected renderScene(avatar:AvatarScene):void{const camera=avatar.root.userData.cameraMode==="perspective"?avatar.perspectiveCamera:avatar.camera;this.renderer.render(avatar.scene,camera)}
  protected renderAll():void{for(const id of this.scenes.keys()){const avatar=this.scenes.get(id);if(avatar)this.renderScene(avatar)}}

  setCharacterColors(scene:RendererScene,colors:import("@toon2.5d/core").CharacterColors):void{const avatar=this.requireScene(scene);for(const [slotName,color] of Object.entries(colors)){if(!color)continue;const slot=avatar.slots.get(slotName);if(slot)applyColorToRoot(slot,color)}}
  setBoneTransform(scene:RendererScene,boneName:string,transform:Transform):void{const avatar=this.requireScene(scene);const bone=avatar.loadedRoot?.getObjectByName(boneName);if(!(bone instanceof THREE.Bone))throw new Error("Bone not found: "+boneName);bone.position.set(transform.position.x,transform.position.y,transform.position.z);bone.quaternion.set(transform.rotation.x,transform.rotation.y,transform.rotation.z,transform.rotation.w).normalize();bone.scale.set(transform.scale.x,transform.scale.y,transform.scale.z)}

  setQuality(tier:QualityTier):void{const ratios:Record<QualityTier,number>={low:.75,medium:1,high:1.5,ultra:2};this.renderer.setPixelRatio(ratios[tier]);}

  setPerspectiveCamera(scene:RendererScene,camera:PerspectiveCameraState):void{const avatar=this.requireScene(scene);avatar.perspectiveCamera.fov=camera.fov;avatar.perspectiveCamera.aspect=camera.aspect;avatar.perspectiveCamera.near=camera.near;avatar.perspectiveCamera.far=camera.far;avatar.perspectiveCamera.updateProjectionMatrix();avatar.root.userData.cameraMode="perspective";}

  setLookAtPose(scene:RendererScene,pose:LookAtPose):void{const avatar=this.requireScene(scene);const bones:THREE.Object3D[]=[];if(!avatar.rig)return;avatar.loadedRoot?.traverse(object=>{if(object.name===avatar.rig!.headBone||object.name===avatar.rig!.leftEyeBone||object.name===avatar.rig!.rightEyeBone)bones.push(object);});for(const bone of bones){if(bone.name===avatar.rig!.headBone)bone.quaternion.set(pose.head.x,pose.head.y,pose.head.z,pose.head.w);else if(bone.name===avatar.rig!.leftEyeBone)bone.quaternion.set(pose.leftEye.x,pose.leftEye.y,pose.leftEye.z,pose.leftEye.w);else if(bone.name===avatar.rig!.rightEyeBone)bone.quaternion.set(pose.rightEye.x,pose.rightEye.y,pose.rightEye.z,pose.rightEye.w);}}

  async applyCustomization(scene:RendererScene,customization:CharacterCustomization):Promise<void>{
    const avatar=this.requireScene(scene);
    for(const item of customization.items){
      const slot=avatar.slots.get(item.slot); if(!slot)continue;
      if(item.slot==="accessory"){for(const child of slot.children.slice())if(child.userData.customizationItemId===item.id){slot.remove(child);disposeObject(child)}}
      else for(const child of slot.children.slice()){slot.remove(child);disposeObject(child)}
      if(item.morphs)avatar.customizationMorphs={...avatar.customizationMorphs,...item.morphs};
      if(item.assetUri){
        const gltf=await loadGLTF(item.assetUri,{renderer:this.renderer});
        if(this.scenes.get(scene.id)!==avatar){disposeObject(gltf.scene);throw new Error("Renderer scene was disposed during customization loading.")}
        gltf.scene.userData.customizationItemId=item.id;
        if(item.textureUri){const texture=await loadTextureSecure(item.textureUri,{...(item.textureIntegrity?{integrity:item.textureIntegrity}:{}),...(item.textureTrustedOrigins?{trustedOrigins:item.textureTrustedOrigins}:{}),...(item.textureLimits?.maxBytes!==undefined?{maxBytes:item.textureLimits.maxBytes}:{}),...(item.textureLimits?.maxTexturePixels!==undefined?{maxTexturePixels:item.textureLimits.maxTexturePixels}:{})});applyTextureToRoot(gltf.scene,texture);}
        slot.add(gltf.scene);
      }
    }
    if(customization.colors){for(const [slotName,color] of Object.entries(customization.colors)){if(!color)continue;const slot=avatar.slots.get(slotName);if(slot)applyColorToRoot(slot,color)}}
  }

  resize(width:number,height:number):void{
    const aspect=Math.max(width,1)/Math.max(height,1);
    for(const avatar of this.scenes.values()){avatar.camera.left=-aspect;avatar.camera.right=aspect;avatar.camera.top=1;avatar.camera.bottom=-1;avatar.camera.updateProjectionMatrix();avatar.perspectiveCamera.aspect=aspect;avatar.perspectiveCamera.updateProjectionMatrix();}this.renderer.setSize(width,height,false);
  }

  dispose(scene:RendererScene):void{
    const avatar=this.requireScene(scene);
    disposeObject(avatar.root);
    avatar.scene.remove(avatar.root);this.scenes.delete(avatar.id);
  }

  destroy():void{
    this.renderer.domElement.removeEventListener("webglcontextlost",this.onContextLost);
    this.renderer.domElement.removeEventListener("webglcontextrestored",this.onContextRestored);
    for(const scene of [...this.scenes.values()])this.dispose(scene);
    this.renderer.dispose();
  }

  get isContextLost():boolean{return this.contextLost;}

  private markResourcesDirty(root:THREE.Object3D):void{
    root.traverse(object=>{
      if(!(object instanceof THREE.Mesh))return;
      const materials=Array.isArray(object.material)?object.material:[object.material];
      for(const material of materials){material.needsUpdate=true;for(const key of ["map","normalMap","roughnessMap","metalnessMap","emissiveMap","aoMap","alphaMap"]){const texture=material[key as keyof THREE.Material] as THREE.Texture|undefined;if(texture instanceof THREE.Texture)texture.needsUpdate=true;}}
    });
  }

  protected isSceneInView(scene:RendererScene):boolean{
    const avatar=this.requireScene(scene);
    const camera=avatar.root.userData.cameraMode==="perspective"?avatar.perspectiveCamera:avatar.camera;
    const box=new THREE.Box3().setFromObject(avatar.root);
    if(box.isEmpty())return true;
    const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    return frustum.intersectsBox(box);
  }

  protected getSceneRoot(scene:RendererScene):THREE.Object3D{return this.requireScene(scene).root}

  private requireScene(scene:RendererScene):AvatarScene{
    const avatar=this.scenes.get(scene.id);
    if(!avatar)throw new Error("Renderer scene is not owned by this renderer.");
    return avatar;
  }
}
