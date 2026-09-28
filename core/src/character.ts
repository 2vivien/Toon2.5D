import type {FaceParameter} from "./types.js";

export type CharacterSlot="body"|"face"|"skin"|"hair"|"eyes"|"brows"|"nose"|"mouth"|"top"|"bottom"|"shoes"|"accessory";
export interface CharacterPart{
  readonly assetId:string;
  readonly textureId?:string;
  readonly morphs?:Readonly<Partial<Record<FaceParameter,number>>>;
}
export interface CharacterColors{
  readonly skin?:string;
  readonly hair?:string;
  readonly eyes?:string;
  readonly top?:string;
  readonly bottom?:string;
  readonly shoes?:string;
  readonly accessory?:string;
}
export interface CharacterDefinition{
  readonly version:1;
  readonly model:string;
  readonly face?:CharacterPart;
  readonly body?:CharacterPart;
  readonly skin?:CharacterPart;
  readonly hair?:CharacterPart;
  readonly eyes?:CharacterPart;
  readonly brows?:CharacterPart;
  readonly nose?:CharacterPart;
  readonly mouth?:CharacterPart;
  readonly top?:CharacterPart;
  readonly bottom?:CharacterPart;
  readonly shoes?:CharacterPart;
  readonly accessories?:readonly CharacterPart[];
  readonly colors?:CharacterColors;
  readonly expression?:string;
}
const partIds=(definition:CharacterDefinition):string[]=>{
 const parts=[definition.body,definition.face,definition.skin,definition.hair,definition.eyes,definition.brows,definition.nose,definition.mouth,definition.top,definition.bottom,definition.shoes,...(definition.accessories??[])];
 return parts.filter((part):part is CharacterPart=>Boolean(part)).map(part=>part.assetId);
};
export function validateCharacterDefinition(definition:CharacterDefinition):CharacterDefinition{
 if(definition.version!==1||!definition.model)throw new RangeError("Character definition version and model are required.");
 const ids=partIds(definition);if(ids.some(id=>!id))throw new RangeError("Character parts require stable asset IDs.");
 return definition;
}
export function characterAssetIds(definition:CharacterDefinition):readonly string[]{validateCharacterDefinition(definition);return partIds(definition)}
