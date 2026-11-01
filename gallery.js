import { galleryPhotos, galleryPage } from './gallery-model.js';

// Real photos only. Empty configuration leaves the explicitly labeled pinned placeholders intact.
export function configureGallery(config) {
  const root = document.querySelector('[data-trail-board="gallery"]');
  const dialog = document.querySelector('[data-gallery-dialog]');
  if (!root || !dialog || root.dataset.galleryReady) return;
  const photos = galleryPhotos(config.gallery, location.href);
  if (!photos.length) return;
  root.dataset.galleryReady = 'true';
  root.classList.toggle('has-gallery-pages', photos.length > 4);
  const grid = root.querySelector('[data-gallery-grid]'), pagination = root.querySelector('[data-gallery-pagination]');
  const image = dialog.querySelector('[data-gallery-large-image]'), error = dialog.querySelector('[data-gallery-error]');
  let page = 0, selected = 0, opener;
  root.querySelector('[data-gallery-note]').textContent = 'Pinned moments. Select a photo to take a closer look.';
  if (photos.length > 4) root.querySelector('[data-gallery-note]').hidden = true;

  function showPhoto(index) {
    selected = (index + photos.length) % photos.length;
    const photo = photos[selected];
    image.hidden = false; error.hidden = true;
    image.src = photo.src; image.alt = photo.alt;
    dialog.querySelector('[data-gallery-large-caption]').textContent = photo.caption || photo.alt;
    dialog.querySelector('[data-gallery-photo-label]').textContent = `${selected + 1} / ${photos.length}`;
    for (const button of dialog.querySelectorAll('[data-gallery-photo]')) button.disabled = photos.length < 2;
  }
  image.addEventListener('error', () => { image.hidden = true; error.hidden = false; });
  dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-gallery-photo="previous"]').addEventListener('click', () => showPhoto(selected - 1));
  dialog.querySelector('[data-gallery-photo="next"]').addEventListener('click', () => showPhoto(selected + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showPhoto(selected + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  dialog.addEventListener('close', () => opener?.focus());

  function renderPage() {
    const result = galleryPage(photos, page); page = result.current;
    grid.replaceChildren();
    for (const [offset, photo] of result.photos.entries()) {
      const li = document.createElement('li'), button = document.createElement('button');
      const thumbnail = document.createElement('img'), caption = document.createElement('span');
      li.className = 'gallery-card'; button.className = 'gallery-photo'; button.type = 'button';
      button.setAttribute('aria-label', `Open photo ${result.start + offset + 1}: ${photo.caption || photo.alt}`);
      thumbnail.className = 'gallery-image'; thumbnail.src = photo.src; thumbnail.alt = photo.alt;
      thumbnail.loading = 'lazy'; thumbnail.width = 600; thumbnail.height = 400;
      thumbnail.addEventListener('error', () => { thumbnail.hidden = true; caption.textContent = 'Photo unavailable'; });
      caption.className = 'gallery-caption'; caption.textContent = photo.caption || `Photo ${result.start + offset + 1}`;
      button.append(thumbnail, caption); li.append(button); grid.append(li);
      button.addEventListener('click', () => { opener = button; showPhoto(result.start + offset); dialog.showModal(); });
    }
    pagination.hidden = result.pages < 2;
    root.querySelector('[data-gallery-page-label]').textContent = `${page + 1} / ${result.pages}`;
    root.querySelector('[data-gallery-page="previous"]').disabled = page === 0;
    root.querySelector('[data-gallery-page="next"]').disabled = page === result.pages - 1;
    document.dispatchEvent(new Event('trail-board-content-change'));
  }
  root.querySelector('[data-gallery-page="previous"]').addEventListener('click', event => {
    page--; renderPage();
    if (event.currentTarget.disabled) root.querySelector('[data-gallery-page="next"]').focus();
  });
  root.querySelector('[data-gallery-page="next"]').addEventListener('click', event => {
    page++; renderPage();
    if (event.currentTarget.disabled) root.querySelector('[data-gallery-page="previous"]').focus();
  });
  renderPage();
}
