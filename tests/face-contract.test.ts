import {describe,expect,it}from"vitest";
import {FACE_PARAMETERS,createNeutralFace}from"../core/src/face-defaults.js";

describe("facial contract",()=>{
  it("contains exactly 52 unique semantic parameters",()=>{
    expect(FACE_PARAMETERS).toHaveLength(52);
    expect(new Set(FACE_PARAMETERS).size).toBe(52);
  });

  it("provides a neutral value for every parameter",()=>{
    const face=createNeutralFace();
    for(const parameter of FACE_PARAMETERS)expect(face[parameter]).toBe(0);
  });
});
