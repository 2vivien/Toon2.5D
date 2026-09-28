import type {AvatarRuntime}from"./runtime.js";
import type {FaceParameter,AssetLoadLimits}from"./types.js";
import type {CharacterColors}from"./character.js";
export type CustomizationSlot="body"|"face"|"skin"|"hair"|"eyes"|"brows"|"nose"|"mouth"|"top"|"bottom"|"shoes"|"accessory";
export interface CustomizationItem{readonly id:string;readonly slot:CustomizationSlot;readonly assetUri?:string;readonly textureUri?:string;readonly assetId?:string;readonly textureId?:string;readonly integrity?:string;readonly trustedOrigins?:readonly string[];readonly limits?:AssetLoadLimits;readonly morphs?:Readonly<Partial<Record<FaceParameter,number>>>}
export interface CharacterCustomization{readonly selections:Readonly<Record<CustomizationSlot,string|null>>;readonly items:readonly CustomizationItem[];readonly colors?:CharacterColors}
const slots:readonly CustomizationSlot[]=["body","face","skin","hair","eyes","brows","nose","mouth","top","bottom","shoes","accessory"];
function validateUri(uri:string):void{const parsed=new URL(uri);if(parsed.protocol!=="http:"&&parsed.protocol!=="https:")throw new RangeError("Customization asset URLs must use HTTP(S).")}
export function createCharacterCustomization(items:readonly CustomizationItem[]):CharacterCustomization{const selections:Record<CustomizationSlot,string|null>={body:null,face:null,skin:null,hair:null,eyes:null,brows:null,nose:null,mouth:null,top:null,bottom:null,shoes:null,accessory:null};const ids=new Set<string>();for(const item of items){if(!item.id||ids.has(item.id)||!slots.includes(item.slot))throw new RangeError("Customization items require unique ids and valid slots.");ids.add(item.id);if(item.assetUri)validateUri(item.assetUri);if(item.textureUri)validateUri(item.textureUri);selections[item.slot]=item.id;}return{selections,items}}
export function applyCustomization(runtime:AvatarRuntime,customization:CharacterCustomization):Promise<void>{return runtime.applyCustomization(customization)}
