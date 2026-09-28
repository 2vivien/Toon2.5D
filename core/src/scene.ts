import type {Transform,Vec3} from "./types.js";

export interface SceneNode{
  readonly id:string;
  readonly children:readonly SceneNode[];
  readonly transform:Transform;
}

export function identityTransform():Transform{
  return {
    position:{x:0,y:0,z:0},
    rotation:{x:0,y:0,z:0,w:1},
    scale:{x:1,y:1,z:1}
  };
}

export function createNode(id:string,position:Vec3={x:0,y:0,z:0}):SceneNode{
  return {id,children:[],transform:{...identityTransform(),position}};
}