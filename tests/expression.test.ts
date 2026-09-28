import {describe,expect,it}from"vitest";
import {createExpressionController}from"../core/src/expression/controller.js";

describe("expression controller",()=>{
  it("composes emotion and blink",()=>{
    const controller=createExpressionController();
    controller.setEmotion("happy",1);
    const face=controller.evaluate({deltaSeconds:0,elapsedSeconds:0,lookTarget:null});
    expect(face.mouthSmileLeftLeft).toBeGreaterThan(.5);
    expect(face.eyeBlinkLeft).toBe(0);
  });
  it("keeps look-at independent from mouth",()=>{
    const controller=createExpressionController();
    controller.setEmotion("happy",1);
    controller.setLookTarget({x:1,y:0,z:1});
    const face=controller.evaluate({deltaSeconds:.016,elapsedSeconds:0,lookTarget:null});
    expect(face.eyeLookHorizontal).toBeGreaterThan(.5);
    expect(face.mouthSmile).toBeGreaterThan(.5);
  });
});
