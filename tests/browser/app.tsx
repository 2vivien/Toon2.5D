import React from "react";import{createRoot,type Root}from"react-dom/client";import{Studio}from"../../studio/dist/index.js";import type{AvatarDefinition}from"@toon2.5d/core";
const character:AvatarDefinition={schemaVersion:1,assetId:"head.reference",expressionProfileId:"toon.face.v1"};const container=document.getElementById("root")!;let root:Root|null=null;
function mount(){root?.unmount();root=createRoot(container);root.render(<Studio character={character} width={320} height={320}/>)}function unmount(){root?.unmount();root=null;container.replaceChildren()}
(window as typeof window&{__TOON_STUDIO__?:{mount:()=>void;unmount:()=>void}}).__TOON_STUDIO__={mount,unmount};mount();
