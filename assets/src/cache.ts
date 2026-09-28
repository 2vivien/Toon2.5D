import type {RuntimeAsset}from"@toon2.5d/core";
export interface AssetCacheEntry<T>{readonly key:string;readonly value:T;readonly size:number;readonly references:number;readonly lastUsed:number}
export interface AssetCache<T>{get(key:string):T|undefined;set(key:string,value:T,size?:number):void;acquire(key:string):T|undefined;release(key:string):void;invalidate(key:string):void;clear():void;preload(entries:readonly RuntimeAsset[]):Promise<void>;stats():Readonly<{entries:number;bytes:number}>}
export function createAssetCache<T>(loader:(asset:RuntimeAsset)=>Promise<T>,disposer:(value:T)=>void,maxBytes=64*1024*1024):AssetCache<T>{
 const entries=new Map<string,{value:T,size:number,references:number,lastUsed:number}>();const pending=new Map<string,Promise<T>>();let bytes=0;
 const keyOf=(asset:RuntimeAsset)=>asset.id??asset.uri;
 const evict=()=>{while(bytes>maxBytes){const candidate=[...entries.entries()].filter(([,e])=>e.references===0).sort((a,b)=>a[1].lastUsed-b[1].lastUsed)[0];if(!candidate)break;bytes-=candidate[1].size;disposer(candidate[1].value);entries.delete(candidate[0])}};
 const set=(key:string,value:T,size=0)=>{const normalized=Math.max(0,size);const old=entries.get(key);if(old){bytes-=old.size;if(old.references===0)disposer(old.value);else throw new Error("Cannot replace an acquired asset.")}entries.set(key,{value,size:normalized,references:0,lastUsed:Date.now()});bytes+=normalized;evict()};
 return{get(key){const entry=entries.get(key);if(!entry)return undefined;entry.lastUsed=Date.now();return entry.value},
 set,
 acquire(key){const entry=entries.get(key);if(!entry)return undefined;entry.references+=1;entry.lastUsed=Date.now();return entry.value},
 release(key){const entry=entries.get(key);if(!entry)return;entry.references=Math.max(0,entry.references-1);entry.lastUsed=Date.now();evict()},
 invalidate(key){const entry=entries.get(key);if(!entry)return;if(entry.references>0)throw new Error("Cannot invalidate an acquired asset.");bytes-=entry.size;disposer(entry.value);entries.delete(key)},
 clear(){for(const entry of entries.values())if(entry.references===0)disposer(entry.value);entries.clear();bytes=0},
 async preload(assets){for(const asset of assets){const key=keyOf(asset);if(entries.has(key))continue;const running=pending.get(key);if(running){await running;continue}const promise=loader(asset);pending.set(key,promise);try{const value=await promise;set(key,value)}finally{pending.delete(key)}}
 },
 stats(){return{entries:entries.size,bytes}}
 }}
