# SMathHacks 2027 — Bits & Bites

The event site for SMathHacks 2027: one continuous illustrated hillside where native scroll walks down a path past Bit, Amp and Bite to the event details. Plain HTML, CSS and ES modules — no framework, no build step, no dependencies.

## Run locally

ES modules and `fetch` need a server (opening `index.html` from disk won't work):

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123.

## Files

| Path | Role |
| --- | --- |
| `index.html` | All copy as real HTML: hero, introduction, the four tracks, participation details, schedule, FAQ, finale. |
| `hillside.js` | Draws the world as one SVG and places each copy block in its own clearing. Layouts (`wide` desktop, `tall` phone) are plain data in `LAYOUTS`, in world units (1440 across on desktop, 600 on phone). |
| `hillside.css` | Type, copy, clearings, ambient motion, interaction states, no-JS fallback. |
| `event.js` | Reads `event-config.json` and fills in facts, registration links, schedule, contact and sponsors. |
| `crests.js` | Generated crest outline of each terrain strip, so props stand on the hill edges. |
| `event-config.json` | **The only file to edit for event details.** |
| `resources.html`, `entrepreneurship-in-nc.html`, `past-events.html` | Supporting pages for learning links, the Colopy program, and the 2020–2026 archive. |
| `navigation.css`, `navigation.js` | Shared Explore dropdown and mobile navigation. |
| `support.css` | Reading layouts for the supporting pages, using the existing palette and artwork. |
| `assets/` | Self-hosted fonts (with OFL licenses), logo, and web-sized artwork. |

## Updating event details

Edit `event-config.json`. Any field left `null` shows "To be announced".

- `dates`, `venue`, `eligibility`, `cost` — strings.
- `registrationUrl` — turns on the Interest form buttons.
- `updatesUrl` or `updatesEndpoint` — a Get updates link, or an inline email form that POSTs to the endpoint.
- `schedule` — list of `{ "time", "title" }`.
- `contactEmail`, `sponsorEmail` — `sponsorEmail` (falling back to `contactEmail`) adds a Become a sponsor link.
- `resources.meetingUrl`, `resources.submissionUrl`, `resources.submissionGuidelinesUrl` — confirmed **2027** event links on the Resources page. Keep these `null` until available; the page shows coming-soon text. The 2026 meeting link is deliberately not carried forward.
- `sponsors` — list of `{ "name", "tier", "url", "logo" }`; only `name` is required. Tiers show in the order they first appear. Put logo files in `assets/sponsors/` and reference them with a relative path, e.g. `"assets/sponsors/acme.svg"`.

## Supporting-page copy

The site remains buildless: serve the checked-in HTML directly. To revise supporting-page copy or the shared navigation, edit `work/production/build_support_pages.py` and run `python3 work/production/build_support_pages.py` from the repository root. It renders the three pages and synchronizes the homepage header; it leaves all other homepage content intact. Page styles and behavior live in the CSS/JS files above.

Each of the four homepage tracks has its own **Grand Prize** and **Runner-up Prize** placeholders. Prize items and judging details remain unconfirmed; there is no overall award section. The 2026 prize table and special awards live in an expandable section of Past Events; there is no separate prize page. Learning documents and hardware inventory carried over from the old site are labeled as previous-event references. The Past Events page includes all original website and Devpost links, plus 2026 winners; 90 original photos from 2022–2025 are stored locally and grouped into expandable albums. `archive-photos.json` records their years, campus labels, source URLs, and dimensions. The optional importer `work/production/import_archive_photos.py` uses Pillow only for importing and optimizing photos; serving or regenerating the HTML requires no packages.

## Deploy (GitHub Pages)

The site is static and uses only relative paths, so it works at `https://<user>.github.io/<repo>/` or on a custom domain.

1. Push to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

`.nojekyll` skips the Jekyll build so files are served as-is.

## Accessibility and fallbacks

All content is real DOM text. `prefers-reduced-motion` starts with motion paused, and a visible Pause motion control is always available. Without JavaScript, or if drawing fails, the copy renders as a plain stacked page.

Asset sources and credits: [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md).
