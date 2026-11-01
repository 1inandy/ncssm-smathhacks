export function galleryPhotos(entries, base) {
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry, index) => {
    if (!entry || typeof entry.src !== 'string' || !entry.src.trim()) return [];
    try {
      const url = new URL(entry.src, base);
      if (!['http:', 'https:'].includes(url.protocol)) return [];
      const caption = typeof entry.caption === 'string' ? entry.caption.trim() : '';
      const alt = typeof entry.alt === 'string' && entry.alt.trim() ? entry.alt.trim() : caption || `Gallery photo ${index + 1}`;
      return [{ src: url.href, caption, alt }];
    } catch { return []; }
  });
}

export function galleryPage(photos, page, size = 4) {
  const pages = Math.max(1, Math.ceil(photos.length / size));
  const current = Math.max(0, Math.min(pages - 1, Number.isFinite(page) ? Math.floor(page) : 0));
  return { current, pages, start: current * size, photos: photos.slice(current * size, current * size + size) };
}
