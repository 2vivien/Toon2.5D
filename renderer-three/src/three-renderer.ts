import * as THREE from "three";
import type {FaceWeights,Renderer,RendererScene,Transform} from "@toon2.5d/core";

interface AvatarScene extends RendererScene{
  readonly root:THREE.Group;
  readonly head:THREE.Mesh;
  readonly leftEye:THREE.Mesh;
  readonly rightEye:THREE.Mesh;
  readonly mouth:THREE.Mesh;
}

export interface ThreeRendererOptions{
  readonly canvas:HTMLCanvasElement;
  readonly background?:number;
}

export class ThreeRenderer implements Renderer{
  private readonly renderer:THREE.WebGLRenderer;
  private readonly scene=new THREE.Scene();
  private readonly camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,100);
  private readonly scenes=new Map<string,AvatarScene>();

  constructor(options:ThreeRendererOptions){
    this.renderer=new THREE.WebGLRenderer({canvas:options.canvas,antialias:true,alpha:true});
    this.scene.background=options.background===undefined?null:new THREE.Color(options.background);
    this.camera.position.z=5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
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
    const avatar:AvatarScene={id:crypto.randomUUID(),root,head,leftEye,rightEye,mouth};
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

  setAvatarTransform(scene:RendererScene,transform:Transform):void{
    const avatar=this.requireScene(scene);
    avatar.root.position.set(transform.position.x,transform.position.y,transform.position.z);
    avatar.root.scale.set(transform.scale.x,transform.scale.y,transform.scale.z);
    avatar.root.quaternion.set(transform.rotation.x,transform.rotation.y,transform.rotation.z,transform.rotation.w);
  }

  setFaceWeights(scene:RendererScene,weights:FaceWeights):void{
    const avatar=this.requireScene(scene);
    const blinkLeft=1-weights.eyeBlinkLeft;
    const blinkRight=1-weights.eyeBlinkRight;
    avatar.leftEye.scale.y=.15+.85*blinkLeft;
    avatar.rightEye.scale.y=.15+.85*blinkRight;
    avatar.mouth.scale.y=.2+.8*weights.mouthOpen;
    avatar.mouth.scale.x=.8+.35*weights.mouthSmile;
    avatar.mouth.position.y=-.28+.08*weights.mouthOpen;
    avatar.root.rotation.y=(weights.eyeLookHorizontal-.5)*.35;
    avatar.root.rotation.x=(.5-weights.eyeLookVertical)*.25;
  }

  render(_scene:RendererScene):void{this.renderer.render(this.scene,this.camera);}
  resize(width:number,height:number):void{
    const aspect=Math.max(width,1)/Math.max(height,1);
    this.camera.left=-aspect;this.camera.right=aspect;this.camera.top=1;this.camera.bottom=-1;
    this.camera.updateProjectionMatrix();this.renderer.setSize(width,height,false);
  }
  dispose(scene:RendererScene):void{
    const avatar=this.requireScene(scene);
    avatar.root.traverse(object=>{
      const mesh=object as THREE.Mesh;
      if(mesh.geometry)mesh.geometry.dispose();
      if(mesh.material) {
        const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
        for(const material of materials)material.dispose();
      }
    });
    this.scene.remove(avatar.root);this.scenes.delete(avatar.id);
  }
  private requireScene(scene:RendererScene):AvatarScene{
    const avatar=this.scenes.get(scene.id);
    if(!avatar)throw new Error("Renderer scene is not owned by this renderer.");
    return avatar;
  }
}