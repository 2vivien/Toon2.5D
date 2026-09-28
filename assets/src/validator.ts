import type {AssetManifest}from"./types.js";

export function validateManifest(manifest:AssetManifest):AssetManifest{
  if(manifest.schemaVersion!==1)throw new Error("Unsupported asset schema.");
  if(!manifest.id||!manifest.version||!manifest.uri)throw new Error("Asset identity is incomplete.");
  if(manifest.mime!=="model/gltf-binary")throw new Error("Only GLB assets are accepted by V0.1.");
  const protocol=new URL(manifest.uri).protocol;
  if(protocol!=="https:"&&protocol!=="http:")throw new Error("Unsupported asset URL scheme.");
  if(!manifest.expressionProfile.id)throw new Error("Expression profile is required.");
  if(manifest.expressionProfile.morphBindings.some(binding=>binding.targets.length===0)){
    throw new Error("Every morph binding needs at least one target alias.");
  }
  if(manifest.anchors.length===0)throw new Error("At least one asset anchor is required.");
  return manifest;
}