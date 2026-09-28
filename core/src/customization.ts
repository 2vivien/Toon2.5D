import type {AvatarRuntime} from "./runtime.js";
import type {FaceParameter} from "./types.js";
export type CustomizationSlot="body"|"hair"|"top"|"bottom"|"shoes"|"accessory"|"head"|"texture";
export interface CustomizationItem{readonly id:string;readonly slot:CustomizationSlot;readonly assetUri?:string;readonly textureUri?:string;readonly morphs?:Readonly<Partial<Record<FaceParameter,number>>>}
export interface CharacterCustomization{readonly selections:Readonly<Record<CustomizationSlot,string|null>>;readonly items:readonly CustomizationItem[]}
export function createCharacterCustomization(items:readonly CustomizationItem[]):CharacterCustomization{const slots:Record<CustomizationSlot,string|null>={body:null,hair:null,top:null,bottom:null,shoes:null,accessory:null,head:null,texture:null};for(const item of items){if(!item.id)throw new RangeError("Customization item id is required.");slots[item.slot]=item.id;}return{selections:slots,items};}
export function applyCustomization(runtime:AvatarRuntime,customization:CharacterCustomization):void{for(const item of customization.items){if(item.morphs)runtime.setFaceWeights(item.morphs);}}