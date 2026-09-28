import type {AssetManifest}from"./types.js";

export function validateManifest(manifest:AssetManifest):AssetManifest{
  if(manifest.schemaVersion!==1)throw new Error("Unsupported asset schema.");
  if(!manifest.id||!manifest.version||!manifest.uri)throw new Error("Asset identity is incomplete.");
  return manifest;
}