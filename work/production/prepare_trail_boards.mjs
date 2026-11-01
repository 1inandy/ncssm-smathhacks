// Export generated paintings without semantic image edits: alpha trim, resize, WebP encode.
import fs from 'node:fs/promises';
import sharp from '/Users/alin08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
const folder = '/Users/alin08/Downloads/smathhacks2027/assets/mvp/props/trail-boards';
const spec = JSON.parse(await fs.readFile(`${folder}/generation.json`, 'utf8'));
const registration = {};
for (const asset of spec.assets) {
  await fs.copyFile(asset.source, `${folder}/${asset.name}-master.png`);
  const {data,info} = await sharp(asset.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=0,bottom=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>16){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  left=Math.max(0,left-3);top=Math.max(0,top-3);right=Math.min(info.width-1,right+3);bottom=Math.min(info.height-1,bottom+3);
  const crop={left,top,width:right-left+1,height:bottom-top+1};
  await sharp(asset.source).extract(crop).resize({width:asset.width}).webp({quality:93,alphaQuality:100}).toFile(`${folder}/${asset.name}.webp`);
  const {width,height}=await sharp(`${folder}/${asset.name}.webp`).metadata();
  registration[asset.name]={width,height,crop};
}
await fs.writeFile(`${folder}/registration.json`,JSON.stringify(registration,null,2)+'\n');
console.log(registration);
