import * as THREE from "three";
import {GLTFLoader,type GLTF}from"three/examples/jsm/loaders/GLTFLoader.js";
import {DRACOLoader}from"three/examples/jsm/loaders/DRACOLoader.js";
import {KTX2Loader}from"three/examples/jsm/loaders/KTX2Loader.js";
import {MeshoptDecoder}from"three/examples/jsm/libs/meshopt_decoder.module.js";
import type {AssetLoadLimits}from"@toon2.5d/core";
import {createAssetCache}from"@toon2.5d/assets";

const glbCache=createAssetCache<ArrayBuffer>(async()=>new ArrayBuffer(0),()=>{},128*1024*1024);

export interface GLTFLoadOptions{
  readonly dracoPath?:string;
  readonly ktx2TranscoderPath?:string;
  readonly renderer?:THREE.WebGLRenderer;
  readonly maxBytes?:number;
  readonly maxTexturePixels?:number;
  readonly maxVertices?:number;
  readonly maxAnimations?:number;
  readonly trustedOrigins?:readonly string[];
  readonly integrity?:string;
  readonly fetchImpl?:typeof fetch;
}

function validateOrigin(url:string,trustedOrigins?:readonly string[]):void{
  const protocol=new URL(url).protocol;
  if(protocol!=="https:"&&protocol!=="http:")throw new Error("Unsupported asset URL scheme.");
  if(trustedOrigins&&trustedOrigins.length>0){
    const origin=new URL(url).origin;
    if(!trustedOrigins.includes(origin))throw new Error("Asset origin is not trusted.");
  }
}
function toLimits(options:GLTFLoadOptions):AssetLoadLimits{
  return{maxBytes:options.maxBytes,maxTexturePixels:options.maxTexturePixels,maxVertices:options.maxVertices,maxAnimations:options.maxAnimations};
}
async function verifyIntegrity(data:ArrayBuffer,integrity?:string):Promise<void>{
  if(!integrity)return;
  if(!integrity.startsWith("sha256-"))throw new Error("Only sha256 integrity is supported.");
  const digest=await crypto.subtle.digest("SHA-256",data);
  const encoded=btoa(String.fromCharCode(...new Uint8Array(digest)));
  if("sha256-"+encoded!==integrity)throw new Error("Asset integrity verification failed.");
}
function validateGLB(data:ArrayBuffer):void{
  if(data.byteLength<12)throw new Error("GLB payload is truncated.");
  const view=new DataView(data);
  if(view.getUint32(0,true)!==0x46546c67)throw new Error("Asset is not a valid GLB.");
  if(view.getUint32(4,true)!==2)throw new Error("Unsupported GLB version.");
  if(view.getUint32(8,true)!==data.byteLength)throw new Error("GLB declared length does not match payload.");
}
function validateComplexity(gltf:GLTF,limits:AssetLoadLimits):void{
  let vertices=0;let texturePixels=0;
  gltf.scene.traverse(object=>{
    if(object instanceof THREE.Mesh){
      const position=object.geometry.getAttribute("position");
      if(position)vertices+=position.count;
      const materials=Array.isArray(object.material)?object.material:[object.material];
      for(const material of materials){
        const mapKeys=["map","normalMap","roughnessMap","metalnessMap","emissiveMap","aoMap","alphaMap"] as const;
        for(const key of mapKeys){const texture=material[key];const image=texture?.image as {width?:number;height?:number}|undefined;if(image?.width&&image.height)texturePixels+=image.width*image.height;}
      }
    }
  });
  if(limits.maxVertices!==undefined&&vertices>limits.maxVertices)throw new Error(`Asset vertex limit exceeded: ${vertices} > ${limits.maxVertices}.`);
  if(limits.maxTexturePixels!==undefined&&texturePixels>limits.maxTexturePixels)throw new Error(`Asset texture-pixel limit exceeded: ${texturePixels} > ${limits.maxTexturePixels}.`);
  if(limits.maxAnimations!==undefined&&gltf.animations.length>limits.maxAnimations)throw new Error(`Asset animation limit exceeded: ${gltf.animations.length} > ${limits.maxAnimations}.`);
}
export async function loadGLTF(url:string,options:GLTFLoadOptions={}):Promise<GLTF>{
  validateOrigin(url,options.trustedOrigins);
  const fetcher=options.fetchImpl??fetch;
  const response=await fetcher(url,{credentials:"omit"});
  if(!response.ok)throw new Error(`Asset request failed: ${response.status} ${response.statusText}`);
  const declared=response.headers.get("content-length");
  const maxBytes=options.maxBytes;
  if(maxBytes!==undefined&&declared&&Number(declared)>maxBytes)throw new Error("Asset exceeds configured byte-size limit.");
  const data=await response.arrayBuffer();
  if(maxBytes!==undefined&&data.byteLength>maxBytes)throw new Error("Asset exceeds configured byte-size limit.");
  validateGLB(data);
  await verifyIntegrity(data,options.integrity);
  const loader=new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const draco=options.dracoPath?new DRACOLoader():null;
  const ktx2=options.ktx2TranscoderPath&&options.renderer?new KTX2Loader():null;
  if(draco){draco.setDecoderPath(options.dracoPath!);loader.setDRACOLoader(draco);}
  if(ktx2){ktx2.setTranscoderPath(options.ktx2TranscoderPath!);ktx2.detectSupport(options.renderer!);loader.setKTX2Loader(ktx2);}
  try{
    const gltf=await loader.parseAsync(data,url);
    validateComplexity(gltf,toLimits(options));
    return gltf;
  }finally{draco?.dispose();ktx2?.dispose();}
}
