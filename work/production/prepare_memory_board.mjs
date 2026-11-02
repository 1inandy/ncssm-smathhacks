import sharp from '/Users/alin08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Keep the supplied originals untouched. Export the complete photographs, with EXIF stripped.
const output = fileURLToPath(new URL('../../assets/gallery/', import.meta.url));
const photos = [
  ['DSC04661.JPG', 'closing-ceremony-2026.webp'],
  ['IMG_2181.JPG', 'smathhacks-staircase.webp'],
];
await mkdir(output, { recursive: true });
for (const [original, filename] of photos) {
  const result = await sharp(`/Users/alin08/Downloads/${original}`)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 })
    .toFile(`${output}${filename}`);
  console.log(`${filename}: ${result.width}×${result.height}, ${result.size} bytes`);
}
