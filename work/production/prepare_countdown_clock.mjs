// Alpha-margin trim and proportional WebP export only; the painting is generated, not synthesized here.
import fs from 'node:fs/promises';
import sharp from '/Users/alin08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
const folder = '/Users/alin08/Downloads/smathhacks2027/assets/mvp/props/countdown-clock';
const spec = JSON.parse(await fs.readFile(`${folder}/generation.json`, 'utf8'));
await fs.copyFile(spec.source, `${folder}/clock-master.png`);
const {data,info} = await sharp(spec.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
let left=info.width,top=info.height,right=0,bottom=0;
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>16){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
left=Math.max(0,left-3);top=Math.max(0,top-3);right=Math.min(info.width-1,right+3);bottom=Math.min(info.height-1,bottom+3);
const crop={left,top,width:right-left+1,height:bottom-top+1};
await sharp(spec.source).extract(crop).resize({width:800}).webp({quality:93,alphaQuality:100}).toFile(`${folder}/clock.webp`);
const {width,height}=await sharp(`${folder}/clock.webp`).metadata();
await fs.writeFile(`${folder}/registration.json`,JSON.stringify({width,height,crop},null,2)+'\n');
console.log({width,height,crop});
