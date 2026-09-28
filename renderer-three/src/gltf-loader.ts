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

export function loadGLTF(url:string,options:GLTFLoadOptions={}):Promise<GLTF>{
  const protocol=new URL(url).protocol;
  if(protocol!=="https:"&&protocol!=="http:")return Promise.reject(new Error("Unsupported asset URL scheme."));
  const loader=new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  if(options.dracoPath){
    const draco=new DRACOLoader();
    draco.setDecoderPath(options.dracoPath);
    loader.setDRACOLoader(draco);
  }
  if(options.ktx2TranscoderPath&&options.renderer){
    const ktx2=new KTX2Loader();
    ktx2.setTranscoderPath(options.ktx2TranscoderPath);
    ktx2.detectSupport(options.renderer);
    loader.setKTX2Loader(ktx2);
  }
  return loader.loadAsync(url);
}