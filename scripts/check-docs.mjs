import {readdir,readFile} from "node:fs/promises";
import {join} from "node:path";

const root=join(process.cwd(),"docs");
const forbidden=[/\bV0(?:\.[0-9]+)?\b/gi];
const files=[];
async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory()){if(entry.name==="archive")continue;await walk(path);}
    else if(entry.name.endsWith(".md"))files.push(path);
  }
}
await walk(root);
const violations=[];
for(const file of files){
  const text=await readFile(file,"utf8");
  for(const pattern of forbidden){
    const matches=text.match(pattern);
    if(matches)violations.push(file+":"+pattern+" ("+matches.length+")");
  }
}
if(violations.length){
  console.error("Documentation contains stale V0 references:");
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("Documentation consistency: PASS");
