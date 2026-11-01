import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryPhotos, galleryPage } from '../../gallery-model.js';
test('only actual configured images render, with safe URLs', () => {
  assert.deepEqual(galleryPhotos(null, 'http://127.0.0.1:5173/'), []);
  const result = galleryPhotos([{src:'assets/gallery/photo.webp',caption:'A project'},{src:'javascript:alert(1)'},{src:'data:image/png;base64,test'},null,{src:''}], 'http://127.0.0.1:5173/');
  assert.deepEqual(result, [{src:'http://127.0.0.1:5173/assets/gallery/photo.webp',caption:'A project',alt:'A project'}]);
});
test('pagination clamps bounds and preserves the final partial page', () => {
  const photos = [1,2,3,4,5,6];
  assert.deepEqual(galleryPage(photos,99), {current:1,pages:2,start:4,photos:[5,6]});
  assert.deepEqual(galleryPage(photos,-1).photos, [1,2,3,4]);
  assert.deepEqual(galleryPage([],0), {current:0,pages:1,start:0,photos:[]});
});
