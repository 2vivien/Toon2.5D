import {bench,describe}from"vitest";
import {createExpressionController}from"../core/src/expression/controller.js";

describe("expression runtime",()=>{
  const controller=createExpressionController();
  controller.setEmotion("happy",.9);
  controller.setLookTarget({x:.3,y:.1,z:1});
  controller.setLipSync({viseme:"aa",weight:.7});
  bench("compose facial state",()=>{
    controller.evaluate({deltaSeconds:.016,elapsedSeconds:1,lookTarget:null});
  });
});
