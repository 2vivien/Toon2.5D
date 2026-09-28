import {describe,expect,it}from"vitest";
import {createAnimationEventTimeline}from"../animation/src/events.js";
import {createAnimationPlayer}from"../animation/src/player.js";
describe("animation event timeline",()=>{
 it("emits crossed markers deterministically",()=>{const timeline=createAnimationEventTimeline(1,[{time:.25,name:"blink"},{time:.75,name:"smile"}]);const events:string[]=[];timeline.advance(0,.8,false,marker=>events.push(marker.name));expect(events).toEqual(["blink","smile"])});
  it("dispatches clip markers through AnimationPlayer",()=>{const player=createAnimationPlayer();const events:string[]=[];player.play({id:"marker-test",duration:1,tracks:[],markers:[{time:.5,name:"blink"}]},false);const off=player.onMarker("blink",marker=>events.push(marker.name));player.update(.6);off();expect(events).toEqual(["blink"]);});
 it("emits wrapped markers on looping playback",()=>{const timeline=createAnimationEventTimeline(1,[{time:.1,name:"start"},{time:.9,name:"end"}]);const events:string[]=[];timeline.advance(.8,.2,true,marker=>events.push(marker.name));expect(events).toEqual(["start","end"])});
});
