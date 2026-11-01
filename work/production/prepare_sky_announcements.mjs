// Export only: alpha-margin trim + proportional resize. No painting or synthetic compositing.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/alin08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
const root = '/Users/alin08/Downloads/smathhacks2027';
const folder = path.join(root, 'assets/mvp/environment/sky-announcements');
const specs = JSON.parse(await fs.readFile(path.join(folder, 'generation.json'), 'utf8'));
const registration = {};
for (const asset of specs.assets) {
  const master = path.join(folder, `${asset.name}-master.png`);
  await fs.copyFile(asset.source, master);
  const { data, info } = await sharp(master).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left=info.width, top=info.height, right=0, bottom=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
    if(data[(y*info.width+x)*4+3]>16){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  }
  left=Math.max(0,left-3);top=Math.max(0,top-3);right=Math.min(info.width-1,right+3);bottom=Math.min(info.height-1,bottom+3);
  const crop={left,top,width:right-left+1,height:bottom-top+1};
  const output=path.join(folder,`${asset.name}.webp`);
  await sharp(master).extract(crop).resize({width:asset.width,withoutEnlargement:true}).webp({quality:92,alphaQuality:100}).toFile(output);
  const meta=await sharp(output).metadata();
  registration[asset.name]={src:path.relative(root,output),width:meta.width,height:meta.height,crop};
}
await fs.writeFile(path.join(folder,'registration.json'),JSON.stringify(registration,null,2)+'\n');
console.log(registration);
