import {describe,expect,it} from "vitest";
import {createPerspectiveCameraController,solveLookAt} from "../core/src/index.js";
import {createAssetCache} from "../assets/src/index.js";
describe("studio-grade core",()=>{
 it("validates and applies perspective camera state",()=>{let applied:{fov:number;aspect:number}|undefined;const controller=createPerspectiveCameraController((_,state)=>{applied=state});controller.setFov(50);controller.setAspect(2);controller.apply({id:"scene"});expect(applied.fov).toBe(50);expect(applied.aspect).toBe(2);expect(()=>controller.setFov(180)).toThrow(RangeError);});
 it("solves constrained head and eye rotations",()=>{const pose=solveLookAt({x:0,y:0,z:0},{x:100,y:100,z:1});expect(Math.abs(pose.head.y)).toBeLessThanOrEqual(1);expect(pose.head.w).toBeGreaterThan(0);});
 it("evicts unused cache entries and protects acquired entries",async()=>{const disposed:string[]=[];const cache=createAssetCache(async asset=>asset.uri, value=>disposed.push(value),3);cache.set("a","a",2);cache.acquire("a");cache.set("b","b",2);expect(cache.get("a")).toBe("a");expect(cache.get("b")).toBeUndefined();cache.release("a");cache.set("c","c",2);expect(cache.get("a")).toBeUndefined();expect(disposed).toContain("a");});
})