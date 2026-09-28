import {describe,expect,it}from"vitest";
import {createAnimationEventTimeline}from"../animation/src/events.js";
describe("animation event timeline",()=>{
 it("emits crossed markers deterministically",()=>{const timeline=createAnimationEventTimeline(1,[{time:.25,name:"blink"},{time:.75,name:"smile"}]);const events:string[]=[];timeline.advance(0,.8,false,marker=>events.push(marker.name));expect(events).toEqual(["blink","smile"])});
 it("emits wrapped markers on looping playback",()=>{const timeline=createAnimationEventTimeline(1,[{time:.1,name:"start"},{time:.9,name:"end"}]);const events:string[]=[];timeline.advance(.8,.2,true,marker=>events.push(marker.name));expect(events).toEqual(["start","end"])});
});
