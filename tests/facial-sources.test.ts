import {describe,expect,it}from"vitest";
import {blinkSource}from"../core/src/expression/blink.js";
import {lipSyncSource}from"../core/src/expression/lipsync.js";
import {lookAtSource}from"../core/src/expression/look-at.js";

describe("facial sources",()=>{
  it("blinks deterministically",()=>{
    const source=blinkSource({intervalSeconds:1});
    const frame={deltaSeconds:0,elapsedSeconds:1.05,lookTarget:null};
    expect(source.evaluate(frame)[0]?.value).toBeGreaterThan(0);
  });
  it("maps visemes",()=>{
    const source=lipSyncSource(()=>({viseme:"ou",weight:.8}));
    expect(source.evaluate({deltaSeconds:0,elapsedSeconds:0,lookTarget:null})[0]?.parameter).toBe("mouthPucker");
  });
  it("smooths look-at",()=>{
    const source=lookAtSource({horizontalLimit:1,verticalLimit:1,smoothing:.5});
    const output=source.evaluate({deltaSeconds:.016,elapsedSeconds:0,lookTarget:{x:1,y:0,z:1}});
    expect(output[0]?.value).toBe(.75);
  });
});
