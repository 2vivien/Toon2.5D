import * as THREE from "three";
import {loadGLTF}from"./gltf-loader.js";
import {applyMorphWeights,collectMorphBindings,findMissingMorphParameters,type MorphBindingMap}from"./morphs.js";
import type {FaceWeights,Renderer,RendererScene,Transform,CharacterCustomization,PerspectiveCameraState,LookAtPose,QualityTier}from"@toon2.5d/core";

interface AvatarScene extends RendererScene{
  readonly root:THREE.Group;
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
}

export interface RendererMorphBinding{readonly parameter:keyof FaceWeights;readonly targets:readonly string[];readonly scale:number}

export interface ThreeRendererOptions{
  readonly canvas:HTMLCanvasElement;
  readonly background?:number;
  readonly pixelRatio?:number;
}

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
  private readonly scene=new THREE.Scene();
  private readonly scenes=new Map<string,AvatarScene>();
  private contextLost=false;
  private readonly onContextLost=(event:Event)=>{event.preventDefault();this.contextLost=true;};
  private readonly onContextRestored=()=>{this.contextLost=false;this.renderer.resetState();for(const avatar of this.scenes.values())this.markResourcesDirty(avatar.root);};

  constructor(options:ThreeRendererOptions){
    this.renderer=new THREE.WebGLRenderer({canvas:options.canvas,antialias:true,alpha:true});
    this.scene.background=options.background===undefined?null:new THREE.Color(options.background);
    const fill=new THREE.HemisphereLight(0xffffff,0x555555,1.4);
    const key=new THREE.DirectionalLight(0xffffff,1.8);
    key.position.set(2,3,4);
    this.scene.add(fill,key);
    this.renderer.setPixelRatio(Math.min(options.pixelRatio??1.5,2));
    options.canvas.addEventListener("webglcontextlost",this.onContextLost,false);
    options.canvas.addEventListener("webglcontextrestored",this.onContextRestored,false);
  }

  createScene():RendererScene{
    const root=new THREE.Group();
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,100);camera.position.z=5;
    const perspectiveCamera=new THREE.PerspectiveCamera(35,1,.01,100);perspectiveCamera.position.z=5;
    const head=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),new THREE.MeshStandardMaterial({color:0xf0b28f,roughness:.8}));
    const eyeMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5});
    const pupilMaterial=new THREE.MeshStandardMaterial({color:0x222222,roughness:.4});
    const leftEye=this.eye(eyeMaterial,pupilMaterial);
    const rightEye=this.eye(eyeMaterial,pupilMaterial);
    const mouth=new THREE.Mesh(new THREE.SphereGeometry(.28,20,12),new THREE.MeshStandardMaterial({color:0x5b2530,roughness:.7}));
    head.scale.set(1,.92,.9);
    leftEye.position.set(-.34,.18,.86);
    rightEye.position.set(.34,.18,.86);
    mouth.position.set(0,-.28,.88);
    mouth.scale.set(1,.35,.3);
    root.add(head,leftEye,rightEye,mouth);
    this.scene.add(root);
    const slots=new Map<string,THREE.Group>();for(const slot of ["body","hair","top","bottom","shoes","accessory","head","texture"])slots.set(slot,new THREE.Group());slots.forEach(group=>root.add(group));const avatar:AvatarScene={id:crypto.randomUUID(),root,head,leftEye,rightEye,mouth,morphBindings:new Map(),slots,customizationMorphs:{},camera,perspectiveCamera};
    this.scenes.set(avatar.id,avatar);
    return avatar;
  }

  private eye(material:THREE.Material,pupilMaterial:THREE.Material):THREE.Mesh{
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.22,20,16),material);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),pupilMaterial);
    pupil.position.z=.19;
    eye.add(pupil);
    return eye;
  }

  async loadAsset(scene:RendererScene,asset:{readonly uri:string;readonly morphBindings:readonly RendererMorphBinding[]}):Promise<void>{
    await this.loadModel(scene,asset.uri,asset.morphBindings,asset);
  }

  async loadModel(scene:RendererScene,url:string,mappings:readonly RendererMorphBinding[]=[],asset?:{readonly maxBytes?:number;readonly maxTexturePixels?:number;readonly maxVertices?:number;readonly maxAnimations?:number;readonly limits?:{readonly maxBytes?:number;readonly maxTexturePixels?:number;readonly maxVertices?:number;readonly maxAnimations?:number};readonly trustedOrigins?:readonly string[];readonly integrity?:string;readonly rig?:{readonly headBone:string;readonly leftEyeBone:string;readonly rightEyeBone:string}}):Promise<void>{
    const avatar=this.requireScene(scene);
    const gltf=await loadGLTF(url,{renderer:this.renderer,maxBytes:asset?.limits?.maxBytes??asset?.maxBytes,maxTexturePixels:asset?.limits?.maxTexturePixels??asset?.maxTexturePixels,maxVertices:asset?.limits?.maxVertices??asset?.maxVertices,maxAnimations:asset?.limits?.maxAnimations??asset?.maxAnimations,trustedOrigins:asset?.trustedOrigins,integrity:asset?.integrity});
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
    avatar.morphBindings=morphBindings;
    avatar.rig=asset?.rig;
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
  protected renderScene(avatar:AvatarScene):void{const camera=avatar.root.userData.cameraMode==="perspective"?avatar.perspectiveCamera:avatar.camera;this.renderer.render(this.scene,camera)}
  protected renderAll():void{for(const id of this.scenes.keys()){const avatar=this.scenes.get(id);if(avatar)this.renderScene(avatar)}}

  setQuality(tier:QualityTier):void{const ratios:Record<QualityTier,number>={low:.75,medium:1,high:1.5,ultra:2};this.renderer.setPixelRatio(ratios[tier]);}

  setPerspectiveCamera(scene:RendererScene,camera:PerspectiveCameraState):void{const avatar=this.requireScene(scene);avatar.perspectiveCamera.fov=camera.fov;avatar.perspectiveCamera.aspect=camera.aspect;avatar.perspectiveCamera.near=camera.near;avatar.perspectiveCamera.far=camera.far;avatar.perspectiveCamera.updateProjectionMatrix();avatar.root.userData.cameraMode="perspective";}

  setLookAtPose(scene:RendererScene,pose:LookAtPose):void{const avatar=this.requireScene(scene);const bones:THREE.Object3D[]=[];avatar.loadedRoot?.traverse(object=>{if(avatar.rig){if(object.name===avatar.rig.headBone||object.name===avatar.rig.leftEyeBone||object.name===avatar.rig.rightEyeBone)bones.push(object)}else if(object.name==="Head"||object.name==="head"||object.name==="Eye.L"||object.name==="Eye.R")bones.push(object);});for(const bone of bones){if(bone.name===(avatar.rig?.headBone??"Head")||(!avatar.rig&&(bone.name==="Head"||bone.name==="head")) )bone.quaternion.set(pose.head.x,pose.head.y,pose.head.z,pose.head.w);else if(bone.name===(avatar.rig?.leftEyeBone??"Eye.L"))bone.quaternion.set(pose.leftEye.x,pose.leftEye.y,pose.leftEye.z,pose.leftEye.w);else if(bone.name===(avatar.rig?.rightEyeBone??"Eye.R"))bone.quaternion.set(pose.rightEye.x,pose.rightEye.y,pose.rightEye.z,pose.rightEye.w);}}

  async applyCustomization(scene:RendererScene,customization:CharacterCustomization):Promise<void>{
    const avatar=this.requireScene(scene);
    for(const item of customization.items){
      const slot=avatar.slots.get(item.slot);
      if(!slot)continue;
      for(const child of slot.children.slice()){slot.remove(child);disposeObject(child)}
      if(item.morphs)avatar.customizationMorphs={...avatar.customizationMorphs,...item.morphs};
      if(item.assetUri){
        const gltf=await loadGLTF(item.assetUri,{renderer:this.renderer});
        if(this.scenes.get(scene.id)!==avatar){disposeObject(gltf.scene);throw new Error("Renderer scene was disposed during customization loading.")}
        slot.add(gltf.scene);
      }
      if(item.textureUri){
        const texture=await new THREE.TextureLoader().loadAsync(item.textureUri);
        if(this.scenes.get(scene.id)!==avatar){texture.dispose();throw new Error("Renderer scene was disposed during texture loading.")}
        const previous=slot.userData.texture as THREE.Texture|undefined;
        previous?.dispose();slot.userData.texture=texture;
        slot.traverse(object=>{
          if(!(object instanceof THREE.Mesh))return;
          const materials=Array.isArray(object.material)?object.material:[object.material];
          for(const material of materials)if("map"in material){material.map=texture;material.needsUpdate=true}
        });
      }
    }
  }

  resize(width:number,height:number):void{
    const aspect=Math.max(width,1)/Math.max(height,1);
    for(const avatar of this.scenes.values()){avatar.camera.left=-aspect;avatar.camera.right=aspect;avatar.camera.top=1;avatar.camera.bottom=-1;avatar.camera.updateProjectionMatrix();avatar.perspectiveCamera.aspect=aspect;avatar.perspectiveCamera.updateProjectionMatrix();}this.renderer.setSize(width,height,false);
  }

  dispose(scene:RendererScene):void{
    const avatar=this.requireScene(scene);
    disposeObject(avatar.root);
    this.scene.remove(avatar.root);this.scenes.delete(avatar.id);
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

  private requireScene(scene:RendererScene):AvatarScene{
    const avatar=this.scenes.get(scene.id);
    if(!avatar)throw new Error("Renderer scene is not owned by this renderer.");
    return avatar;
  }
}
