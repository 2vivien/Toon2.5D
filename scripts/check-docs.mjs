import {readdir,readFile} from "node:fs/promises";
import {join} from "node:path";

const root=join(process.cwd(),"docs");
const forbidden=[
  /(?:current|currently|model|runtime) V0(?:\.[0-9]+)?/gi,
  /V0 (?:contract|capability|requirement|implementation)/gi
];
const files=[];
async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory())await walk(path);
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
  console.error("Documentation contains stale V1 contradictions:");
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("Documentation consistency: PASS");
