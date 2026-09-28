import * as THREE from "three";
import {GLTFLoader,type GLTF}from"three/examples/jsm/loaders/GLTFLoader.js";
import {DRACOLoader}from"three/examples/jsm/loaders/DRACOLoader.js";
import {KTX2Loader}from"three/examples/jsm/loaders/KTX2Loader.js";
import {MeshoptDecoder}from"three/examples/jsm/libs/meshopt_decoder.module.js";

export interface GLTFLoadOptions{
  readonly dracoPath?:string;
  readonly ktx2TranscoderPath?:string;
  readonly renderer?:THREE.WebGLRenderer;
}

export async function loadGLTF(url:string,options:GLTFLoadOptions={}):Promise<GLTF>{
  const protocol=new URL(url).protocol;
  if(protocol!=="https:"&&protocol!=="http:")throw new Error("Unsupported asset URL scheme.");
  const loader=new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const draco=options.dracoPath?new DRACOLoader():null;
  const ktx2=options.ktx2TranscoderPath&&options.renderer?new KTX2Loader():null;
  if(draco){draco.setDecoderPath(options.dracoPath!);loader.setDRACOLoader(draco);}
  if(ktx2){
    ktx2.setTranscoderPath(options.ktx2TranscoderPath!);
    ktx2.detectSupport(options.renderer!);
    loader.setKTX2Loader(ktx2);
  }
  try{
    return await loader.loadAsync(url);
  }finally{
    draco?.dispose();
    ktx2?.dispose();
  }
}