import {describe,expect,it}from"vitest";
import {createExpressionController}from"../core/src/expression/controller.js";
import {composeInto}from"../core/src/expression/composer.js";
import {createNeutralFace}from"../core/src/face-defaults.js";

describe("expression controller",()=>{
  it("composes emotion and blink",()=>{
    const controller=createExpressionController();
    controller.setEmotion("happy",1);
    const face=controller.evaluate({deltaSeconds:.2,elapsedSeconds:.2,lookTarget:null});
    expect(face.mouthSmileLeft).toBeGreaterThan(0);
    expect(face.mouthSmileRight).toBeGreaterThan(0);
    expect(face.eyeBlinkLeft).toBe(0);
  });

  it("keeps look-at independent from mouth",()=>{
    const controller=createExpressionController();
    controller.setEmotion("happy",1);
    controller.setLookTarget({x:1,y:0,z:1});
    const face=controller.evaluate({deltaSeconds:.016,elapsedSeconds:0,lookTarget:null});
    expect(face.eyeLookInLeft).toBeGreaterThan(0);
    expect(face.mouthSmileLeft).toBeGreaterThan(0);
  });

  it("blends weighted overrides instead of snapping",()=>{
    const face=createNeutralFace();
    const output=composeInto([{
      source:"external",parameter:"mouthSmileLeft",value:1,weight:.5,priority:10,mode:"override"
    }],face);
    expect(output.mouthSmileLeft).toBeCloseTo(.5);
  });

  it("keeps explicit overrides across evaluations",()=>{
    const controller=createExpressionController();
    controller.setFaceWeights?.({mouthSmileLeft:1});
    const face=controller.evaluate({deltaSeconds:.016,elapsedSeconds:.016,lookTarget:null});
    expect(face.mouthSmileLeft).toBe(1);
  });

  it("blends multiplication around a base contribution",()=>{
    const face=createNeutralFace();
    const output=composeInto([
      {source:"base",parameter:"mouthSmileLeft",value:.8,weight:1,priority:0,mode:"override"},
      {source:"external",parameter:"mouthSmileLeft",value:0,weight:.5,priority:10,mode:"multiply"}
    ],face);
    expect(output.mouthSmileLeft).toBeCloseTo(.4);
  });
});
