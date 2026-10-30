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
| `index.html` | All copy as real HTML: hero, the three character beats, details, schedule, FAQ, sponsors, finale. |
| `hillside.js` | Draws the world as one SVG and places each copy block in its own clearing. Layouts (`wide` desktop, `tall` phone) are plain data in `LAYOUTS`, in world units (1440 across on desktop, 600 on phone). |
| `hillside.css` | Type, copy, clearings, ambient motion, interaction states, no-JS fallback. |
| `event.js` | Reads `event-config.json` and fills in facts, registration links, schedule, contact and sponsors. |
| `crests.js` | Generated crest outline of each terrain strip, so props stand on the hill edges. |
| `event-config.json` | **The only file to edit for event details.** |
| `assets/` | Self-hosted fonts (with OFL licenses), logo, and web-sized artwork. |

## Updating event details

Edit `event-config.json`. Any field left `null` shows "To be announced".

- `dates`, `venue`, `eligibility`, `cost` — strings.
- `registrationUrl` — turns on the Register buttons.
- `updatesUrl` or `updatesEndpoint` — a Get updates link, or an inline email form that POSTs to the endpoint.
- `schedule` — list of `{ "time", "title" }`.
- `contactEmail`, `sponsorEmail` — `sponsorEmail` (falling back to `contactEmail`) adds a Become a sponsor link.
- `sponsors` — list of `{ "name", "tier", "url", "logo" }`; only `name` is required. Tiers show in the order they first appear. Put logo files in `assets/sponsors/` and reference them with a relative path, e.g. `"assets/sponsors/acme.svg"`.

## Deploy (GitHub Pages)

The site is static and uses only relative paths, so it works at `https://<user>.github.io/<repo>/` or on a custom domain.

1. Push to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

`.nojekyll` skips the Jekyll build so files are served as-is.

## Accessibility and fallbacks

All content is real DOM text. `prefers-reduced-motion` starts with motion paused, and a visible Pause motion control is always available. Without JavaScript, or if drawing fails, the copy renders as a plain stacked page.

Asset sources and credits: [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md).
