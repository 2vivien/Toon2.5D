import {describe,expect,it}from"vitest";
import {clamp01,lerp,smoothstep}from"../core/src/math.js";

describe("core math",()=>{
  it("clamps normalized values",()=>{
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });
  it("interpolates deterministically",()=>{
    expect(lerp(0,10,.5)).toBe(5);
    expect(smoothstep(0,1,.5)).toBe(.5);
  });
});
