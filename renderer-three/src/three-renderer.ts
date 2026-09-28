import * as THREE from "three";
import {loadGLTF}from"./gltf-loader.js";
import {applyMorphWeights,collectMorphBindings,findMissingMorphParameters,type MorphBindingMap}from"./morphs.js";
import type {FaceWeights,Renderer,RendererScene,Transform,CharacterCustomization,PerspectiveCameraState,LookAtPose}from"@toon2.5d/core";

interface AvatarScene extends RendererScene{
  readonly root:THREE.Group;
  readonly head:THREE.Mesh;
  readonly leftEye:THREE.Mesh;
  readonly rightEye:THREE.Mesh;
  readonly mouth:THREE.Mesh;
  morphBindings:MorphBindingMap;
  loadedRoot?:THREE.Object3D;
  readonly slots:Map<string,THREE.Group>;
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
  private readonly camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,100);
  private readonly perspectiveCamera=new THREE.PerspectiveCamera(35,1,.01,100);
  private readonly scenes=new Map<string,AvatarScene>();

  constructor(options:ThreeRendererOptions){
    this.renderer=new THREE.WebGLRenderer({canvas:options.canvas,antialias:true,alpha:true});
    this.scene.background=options.background===undefined?null:new THREE.Color(options.background);
    const fill=new THREE.HemisphereLight(0xffffff,0x555555,1.4);
    const key=new THREE.DirectionalLight(0xffffff,1.8);
    key.position.set(2,3,4);
    this.scene.add(fill,key);
    this.camera.position.z=5;
    this.renderer.setPixelRatio(Math.min(options.pixelRatio??1.5,2));
  }

  createScene():RendererScene{
    const root=new THREE.Group();
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
    const slots=new Map<string,THREE.Group>();for(const slot of ["body","hair","top","bottom","shoes","accessory","head","texture"])slots.set(slot,new THREE.Group());slots.forEach(group=>root.add(group));const avatar:AvatarScene={id:crypto.randomUUID(),root,head,leftEye,rightEye,mouth,morphBindings:new Map(),slots};
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
    await this.loadModel(scene,asset.uri,asset.morphBindings);
  }

  async loadModel(scene:RendererScene,url:string,mappings:readonly RendererMorphBinding[]=[]):Promise<void>{
    const avatar=this.requireScene(scene);
    const gltf=await loadGLTF(url,{renderer:this.renderer});
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
  }

  setAvatarTransform(scene:RendererScene,transform:Transform):void{
    const avatar=this.requireScene(scene);
    avatar.root.position.set(transform.position.x,transform.position.y,transform.position.z);
    avatar.root.scale.set(transform.scale.x,transform.scale.y,transform.scale.z);
    avatar.root.quaternion.set(transform.rotation.x,transform.rotation.y,transform.rotation.z,transform.rotation.w);
  }

  setFaceWeights(scene:RendererScene,weights:FaceWeights):void{
    const avatar=this.requireScene(scene);
    if(avatar.morphBindings.size>0)applyMorphWeights(avatar.morphBindings,weights);
    const blinkLeft=1-weights.eyeBlinkLeft;
    const blinkRight=1-weights.eyeBlinkRight;
    avatar.leftEye.scale.y=.15+.85*blinkLeft;
    avatar.rightEye.scale.y=.15+.85*blinkRight;
    avatar.mouth.scale.y=.2+.6*weights.jawOpen;
    avatar.mouth.scale.x=.8+.35*((weights.mouthSmileLeft+weights.mouthSmileRight)/2);
    avatar.mouth.position.y=-.28+.08*weights.jawOpen;
    avatar.root.rotation.y=(weights.eyeLookOutLeft-weights.eyeLookInLeft)*.2;
    avatar.root.rotation.x=(weights.eyeLookDownLeft-weights.eyeLookUpLeft)*.2;
  }

  render(scene:RendererScene):void{const avatar=this.requireScene(scene);const camera=avatar.root.userData.cameraMode==="perspective"?this.perspectiveCamera:this.camera;this.renderer.render(this.scene,camera);}

  setPerspectiveCamera(scene:RendererScene,camera:PerspectiveCameraState):void{const avatar=this.requireScene(scene);this.perspectiveCamera.fov=camera.fov;this.perspectiveCamera.aspect=camera.aspect;this.perspectiveCamera.near=camera.near;this.perspectiveCamera.far=camera.far;this.perspectiveCamera.updateProjectionMatrix();avatar.root.userData.cameraMode="perspective";}

  setLookAtPose(scene:RendererScene,pose:LookAtPose):void{const avatar=this.requireScene(scene);const bones:THREE.Object3D[]=[];avatar.loadedRoot?.traverse(object=>{if(object.name==="Head"||object.name==="head"||object.name==="Eye.L"||object.name==="Eye.R")bones.push(object);});for(const bone of bones){if(bone.name==="Head"||bone.name==="head")bone.quaternion.set(pose.head.x,pose.head.y,pose.head.z,pose.head.w);else if(bone.name==="Eye.L")bone.quaternion.set(pose.leftEye.x,pose.leftEye.y,pose.leftEye.z,pose.leftEye.w);else if(bone.name==="Eye.R")bone.quaternion.set(pose.rightEye.x,pose.rightEye.y,pose.rightEye.z,pose.rightEye.w);}}

  async applyCustomization(scene:RendererScene,customization:CharacterCustomization):Promise<void>{const avatar=this.requireScene(scene);for(const item of customization.items){const slot=avatar.slots.get(item.slot);if(!slot)continue;slot.children.slice().forEach(child=>{slot.remove(child);disposeObject(child);});if(item.assetUri){const gltf=await loadGLTF(item.assetUri,{renderer:this.renderer});slot.add(gltf.scene);}if(item.textureUri){const texture=await new THREE.TextureLoader().loadAsync(item.textureUri);slot.userData.texture=texture;slot.traverse(object=>{if(!(object instanceof THREE.Mesh))return;const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){if("map" in material){material.map=texture;material.needsUpdate=true;}}});}}}


  resize(width:number,height:number):void{
    const aspect=Math.max(width,1)/Math.max(height,1);
    this.camera.left=-aspect;this.camera.right=aspect;this.camera.top=1;this.camera.bottom=-1;
    this.camera.updateProjectionMatrix();this.perspectiveCamera.aspect=aspect;this.perspectiveCamera.updateProjectionMatrix();this.renderer.setSize(width,height,false);
  }

  dispose(scene:RendererScene):void{
    const avatar=this.requireScene(scene);
    disposeObject(avatar.root);
    this.scene.remove(avatar.root);this.scenes.delete(avatar.id);
  }

  destroy():void{
    for(const scene of this.scenes.values())this.dispose(scene);
    this.renderer.dispose();
  }

  private requireScene(scene:RendererScene):AvatarScene{
    const avatar=this.scenes.get(scene.id);
    if(!avatar)throw new Error("Renderer scene is not owned by this renderer.");
    return avatar;
  }
}
