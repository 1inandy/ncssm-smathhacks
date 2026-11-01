import sharp from '/Users/alin08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Originals downloaded through the owner's signed-in Drive UI. Keep them untouched.
// Sharp strips embedded EXIF/GPS metadata from the exported runtime images.
const output = fileURLToPath(new URL('../../assets/gallery/', import.meta.url));
const photos = [
  ['IMG_9783.jpg', 'durham-community.webp'],
  ['Ideation.JPG', 'morganton-ideation.webp'],
  ['IMG_9809.JPG', 'durham-hardware.webp'],
  ['IMG_9876.JPG', 'durham-crew.webp'],
];
await mkdir(output, { recursive: true });
for (const [original, filename] of photos) {
  const result = await sharp(`/Users/alin08/Downloads/${original}`)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, effort: 6 })
    .toFile(`${output}${filename}`);
  console.log(`${filename}: ${result.width}×${result.height}, ${result.size} bytes`);
}
