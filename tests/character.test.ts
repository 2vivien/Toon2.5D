import {describe,expect,it}from"vitest";
import {characterAssetIds,validateCharacterDefinition}from"../core/src/character.js";
describe("CharacterDefinition",()=>{
 const definition={version:1,model:"avatar.base",hair:{assetId:"hair.curly"},top:{assetId:"top.blue"},accessories:[{assetId:"glasses.round"}]} as const;
 it("validates and enumerates stable asset IDs",()=>{expect(validateCharacterDefinition(definition)).toEqual(definition);expect(characterAssetIds(definition)).toEqual(["hair.curly","top.blue","glasses.round"])});
});
