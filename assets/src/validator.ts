import type {AssetManifest}from"./types.js";

export function validateManifest(manifest:AssetManifest):AssetManifest{
  if(manifest.schemaVersion!==1)throw new Error("Unsupported asset schema.");
  if(!manifest.id||!manifest.version||!manifest.uri)throw new Error("Asset identity is incomplete.");
  const isModel=manifest.mime==="model/gltf-binary";
  if(!isModel&&!manifest.mime.startsWith("image/"))throw new Error("Unsupported asset MIME type.");
  const protocol=new URL(manifest.uri).protocol;
  if(protocol!=="https:"&&protocol!=="http:")throw new Error("Unsupported asset URL scheme.");
  if(isModel&&!manifest.expressionProfile?.id)throw new Error("Expression profile is required for model assets.");
  if(manifest.expressionProfile?.morphBindings.some(binding=>binding.targets.length===0)){
    throw new Error("Every morph binding needs at least one target alias.");
  }
  if(isModel&&(!manifest.anchors||manifest.anchors.length===0))throw new Error("At least one asset anchor is required for model assets.");
  if(manifest.integrity&&!/^sha256-[A-Za-z0-9+/=]+$/.test(manifest.integrity))throw new Error("Asset integrity must use sha256-<base64>.");
  if(manifest.trustedOrigins?.some(origin=>{try{const parsed=new URL(origin);return parsed.protocol!=="https:"}catch{return true}}))throw new Error("Trusted asset origins must be valid HTTPS origins.");
  const limits=manifest.limits;
  if(limits&&Object.values(limits).some(value=>value!==undefined&&(!Number.isFinite(value)||value<=0)))throw new Error("Asset limits must be finite positive numbers.");
  if(manifest.rig&&(!manifest.rig.headBone||!manifest.rig.leftEyeBone||!manifest.rig.rightEyeBone))throw new Error("Asset rig mapping must define head and both eye bones.");
  return manifest;
}