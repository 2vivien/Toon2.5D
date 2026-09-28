export interface CacheEntry<T>{readonly value:T;readonly expiresAt:number;readonly references:number}
export interface ResourceCacheOptions{readonly maxEntries?:number;readonly ttlMs?:number}
export interface ResourceCache<K,T>{get(key:K):T|undefined;acquire(key:K,loader:()=>Promise<T>):Promise<T>;release(key:K):void;invalidate(key:K):void;clear():void;preload(keys:readonly K[],loader:(key:K)=>Promise<T>):Promise<readonly T[]>;size():number}
interface Stored<T>{value:T;expiresAt:number;references:number}
export function createResourceCache<K,T>(options:ResourceCacheOptions={},now:()=>number=Date.now,dispose?:(value:T)=>void):ResourceCache<K,T>{
 const maxEntries=Math.max(1,Math.floor(options.maxEntries??64));const ttl=Math.max(0,options.ttlMs??300000);const entries=new Map<K,Stored<T>>();const pending=new Map<K,Promise<T>>();
 const cleanup=()=>{const time=now();for(const [key,entry]of entries){if(entry.references===0&&entry.expiresAt<=time){entries.delete(key);dispose?.(entry.value)}}while(entries.size>maxEntries){const first=entries.entries().next().value as [K,Stored<T>]|undefined;if(!first)break;const [key,entry]=first;if(entry.references>0)break;entries.delete(key);dispose?.(entry.value)}};
 const get=(key:K)=>{cleanup();const entry=entries.get(key);if(!entry)return undefined;return entry.value};
 return{
  get,
  async acquire(key,loader){cleanup();const existing=get(key);if(existing!==undefined){const entry=entries.get(key)!;entry.references+=1;entry.expiresAt=now()+ttl;return existing}const running=pending.get(key);if(running){const value=await running;const entry=entries.get(key);if(entry)entry.references+=1;return value}const promise=loader();pending.set(key,promise);try{const value=await promise;entries.set(key,{value,expiresAt:now()+ttl,references:1});cleanup();return value}finally{pending.delete(key)}},
  release(key){const entry=entries.get(key);if(!entry)return;entry.references=Math.max(0,entry.references-1);entry.expiresAt=now()+ttl;cleanup()},
  invalidate(key){const entry=entries.get(key);if(!entry)return;entries.delete(key);if(entry.references===0)dispose?.(entry.value)},
  clear(){for(const entry of entries.values())if(entry.references===0)dispose?.(entry.value);entries.clear()},
  preload:async(keys,loader)=>Promise.all(keys.map(key=>{const value=entries.get(key);if(value){value.references+=1;return Promise.resolve(value.value)}return entries.has(key)?Promise.resolve(entries.get(key)!.value):entries.size>=maxEntries?Promise.reject(new RangeError("Resource cache capacity exceeded.")): (async()=>{const loaded=await loader(key);entries.set(key,{value:loaded,expiresAt:now()+ttl,references:1});return loaded})()})),
  size(){cleanup();return entries.size}
 };
}
