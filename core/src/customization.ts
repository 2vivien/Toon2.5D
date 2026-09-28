import type {AvatarRuntime}from"./runtime.js";
import type {FaceParameter}from"./types.js";
export type CustomizationSlot="body"|"hair"|"top"|"bottom"|"shoes"|"accessory"|"head"|"texture";
export interface CustomizationItem{readonly id:string;readonly slot:CustomizationSlot;readonly assetUri?:string;readonly textureUri?:string;readonly morphs?:Readonly<Partial<Record<FaceParameter,number>>>}
export interface CharacterCustomization{readonly selections:Readonly<Record<CustomizationSlot,string|null>>;readonly items:readonly CustomizationItem[]}
const slots:readonly CustomizationSlot[]=["body","hair","top","bottom","shoes","accessory","head","texture"];
function validateUri(uri:string):void{const parsed=new URL(uri);if(parsed.protocol!=="http:"&&parsed.protocol!=="https:")throw new RangeError("Customization asset URLs must use HTTP(S).")}
export function createCharacterCustomization(items:readonly CustomizationItem[]):CharacterCustomization{const selections:Record<CustomizationSlot,string|null>={body:null,hair:null,top:null,bottom:null,shoes:null,accessory:null,head:null,texture:null};const ids=new Set<string>();for(const item of items){if(!item.id||ids.has(item.id)||!slots.includes(item.slot))throw new RangeError("Customization items require unique ids and valid slots.");ids.add(item.id);if(item.assetUri)validateUri(item.assetUri);if(item.textureUri)validateUri(item.textureUri);selections[item.slot]=item.id;}return{selections,items}}
export function applyCustomization(runtime:AvatarRuntime,customization:CharacterCustomization):Promise<void>{return runtime.applyCustomization(customization)}
