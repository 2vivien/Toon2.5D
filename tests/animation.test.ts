import {describe,expect,it}from"vitest";
import {createAnimationPlayer}from"../animation/src/player.js";

describe("animation player",()=>{
  it("samples a face track deterministically",()=>{
    const player=createAnimationPlayer();
    player.play({
      id:"smile",
      duration:1,
      tracks:[{
        parameter:"mouthSmileLeft",
        easing:"linear",
        keys:[{time:0,value:0},{time:1,value:1}]
      }]
    },false);
    player.update(.5);
    expect(player.output().mouthSmileLeft).toBe(.5);
  });

  it("rejects invalid timing and unordered keyframes",()=>{
    const player=createAnimationPlayer();
    expect(()=>player.update(Number.NaN)).toThrow(RangeError);
    expect(()=>player.play({
      id:"invalid",
      duration:1,
      tracks:[{
        parameter:"mouthSmileLeft",
        easing:"linear",
        keys:[{time:.5,value:0},{time:.2,value:1}]
      }]
    },false)).toThrow(RangeError);
  });
});
