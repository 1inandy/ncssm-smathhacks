# Asset provenance

> Paths below (`work/`, `Logo/`, `.removed-generated/`, `assets/mvp/manifests/`, master PNGs, etc.) refer to production sources that are kept outside this repository. Only the web-ready runtime assets are committed.

- **Event identity:** original `Logo/` SVG and PNG artwork supplied in this project; unchanged. The page uses the supplied full-color SVG, including its original lettering and colors.
- **Characters:** original `BITSandBITES_H2_FINALLINEUP_V03.png`, credited on the supplied sheet to Joyce Chan; source unchanged. Character identities and descriptions come from `characters.md`.
- **Cleanup:** `work/production/prepare_characters.py` records measured lineup-space masks, exterior-white removal, protected eye/teeth highlights, ankle/cable separation, exterior antialias unmatting, separated arm masks, repair patches, blink overlays, and normalized joints. Transparent original-resolution PNGs are retained. WebP delivery copies are lossless, with no downsampling.
- **Environment and props:** individually drawn in native SVG with editable paths and approved fills. Construction source is `work/production/draw_assets.py`; exports live under `assets/mvp/environment/` and `assets/mvp/props/`. There are no generated full-scene production backgrounds, baked-in mascots, logos, or UI text.
- **Original MVP / landmark revision 1:** no generative image model was used for those assets; revision 2 generation is documented below. The SVG authoring and measured extraction scripts are the editable production sources.
- **Palette:** verified from the supplied Word document: forest `#386641`, leaf `#6A994E`, lime `#A7C957`, pale leaf `#CDD993`, cream `#F8F4EA`, peach `#E5C0AE`, dusty pink `#D7988C`. New linework uses the original artwork's warm brown family, `#652713`.
- **Fonts:** Fraunces, Nunito, and Caveat (variable weights) are self-hosted Latin-subset WOFF2 files retrieved from Google Fonts. Their SIL Open Font Licenses are included in `assets/fonts/`. No remote font connection is needed by the page.
- **Design references:** principles in the supplied specification guided composition. No artwork, text, or event facts were copied from the reference sites.
- **Prior work:** original rejected scene posters and earlier character attempts remain under `.removed-generated/`; they are excluded from all runtime asset bindings.

## NCSSM landmark extension — October 29, 2026

- **Original derivative drawings:** `work/production/draw_landmarks.py` authors 23 registered SVG landmark pieces, four assembled gallery previews, and three separately exported terrain surfaces. No image generation or photographic pixels are used in production artwork. Master canvases, structural registration, effect ownership, ground presets, and terrain sources are in `assets/mvp/manifests/landmarks.json`. Original supplied brand artwork remains unchanged.
- **Sphere:** supplied `ncssm/ncssm school thing.jpg`, inspected before drawing. The curved support, exposed right-hand orb, diagonal bands, and plinth informed NC01–NC05. NC05s is the independently exported contact shadow.
- **Watts:** the specified [Wikimedia facade photograph](https://upload.wikimedia.org/wikipedia/commons/1/1b/2008-07-04_NCSSM_Watts.jpg), inspected before drawing. Local reference copies: `work/references/watts.jpg` and `watts-study.jpg`. The supplied Durham-campus/Bryan view was not substituted. NC10–NC15 retain the roof, cupola, facade rhythm, and three-arch portico; repetitive details are simplified.
- **Barn reference gate resolved:** the [linked opening article](https://burkedevinc.com/2023/06/14/congratulations-ncssm-morganton-campus-on-the-opening-of-the-barn/) embeds [BHHSBR-NCSSM — The Barn](https://www.youtube.com/watch?v=CRZS-Hfqa_4). Inspected its exterior at **00:12–00:16** for the curved roof, pale upper front, brick base, high single window, and glazed doorway, plus **03:36–03:42** for the side windows and glazed porch. Evidence: `barn-storyboard-0.jpg`, `barn-storyboard-12.jpg`, and `barn-storyboard-13.jpg` in `work/references/`. These are reference-only thumbnails from the tour, never production backgrounds. NC20–NC25 are an original simplified drawing from these views.
- **Tetragranny:** [Warren LeMay’s requested Flickr photograph, 48954440778](https://www.flickr.com/photos/warrenlemay/48954440778), inspected at its original linked image URL. Reference-only copy: `work/references/tetragranny.jpg`. NC30–NC34 preserve open tubular geometry and the visible overlapping center. No Gnomon substitution or pending-identification note applies.
- **Optional water tower:** deliberately omitted to keep the four requested anchors readable.
- **References remain private/local:** photographs are displayed only beside the derivative drawings in the local production workbench. No external runtime image requests or public deployment were introduced.

## Landmark revision 2 — illustrated masters

The user rejected revision 1 for both style and landmark resemblance. Revision 2 supersedes its visible production art. The previous SVGs and `work/asset-gallery/landmarks-v1.html` remain available for comparison.

- Four new transparent PNG illustrations were made with the **built-in imagegen tool**, using the same inspected landmark photographs and the original supplied mascot lineup as geometry/style references. Original generated PNGs are saved unchanged under `assets/mvp/environment/landmarks/revision-2/`: `sphere-master.png`, `watts-master.png`, `barn-master.png`, and `tetragranny-master.png`.
- The exact shared prompts, subject suffixes, reference inputs, source output filenames, and Watts extraction follow-up are retained in `revision-2/PROMPTS.md`. The unselected initial Watts variant is preserved as `watts-with-halo.png`. Actual browser rendering and PNG alpha measurements establish transparency; the tool's black-background preview can show RGB values belonging to transparent pixels.
- `work/production/prepare_landmark_layers_v2.py` does **not** paint, resample, or edit the raster masters. It authors editable registered SVG region masks for each structural component and aligns new vector window fills, orb reflection, and tube trace to the new artwork. The scene assembles these independent components; it does not consume a flattened event scene or a backdrop containing mascots.
- The revised masters are raster illustrations, not fully editable native vector drawings. Editable geometry lives in the SVG region masks, registration matrices, and vector effects. `revision-2/registration.json` records source pixel sizes, measured opaque bounds, source-to-canvas transforms, and contact baselines.
- Supplied brand originals remain unchanged. No public publishing or deployment was performed.


## Bits & Bites props — section 16

Fourteen new original prop illustrations were created with the **built-in imagegen tool**, one object per output, using the supplied `BITSandBITES_H2_FINALLINEUP_V03.png` only as the style reference. Its original bytes and the supplied logo assets remain untouched. The new objects are the harvest crate, leaf solar charger, drip irrigation pump, compost monitor, toast breadboard, vine cable spool, component drawers, waffle keyboard, cookie controller, snack rover, pixel pinwheel, bubble-tea battery, recipe-card printer, and fruit-circuit gate.

- Original transparent raster PNGs are retained unchanged in `assets/mvp/props/bits-and-bites/masters/`. Exact generation prompts, output filenames, the five-row toast correction, and the 4-by-6 keyboard correction are recorded in `work/production/bb-generation-record.json`. These objects do not use remote photos or stock illustrations.
- `prepare_bb_objects.py` authors SVG region masks, source-to-canvas registration, measured pivots, separate vector shadows/state fills, and seven repair patches behind moving artwork. It does not repaint the raster masters. The resulting 93 pieces are independently exported; the scene assembles appropriately sized cropped WebPs rather than loading full-resolution masters.
- The masters are raster illustrations, not native editable vectors. Editable construction is the SVG mask geometry, repair/effect paths, registration metadata, and `bb-props.js` motion assembly. PNG exports are saved both cropped and on the full registration canvas.
- `exports/bits-and-bites/` and its ZIP contain fourteen whole images, 93 cropped pieces, 93 registered pieces, per-object contact sheets, motion-state demonstrations, and assembled captures. Crop origins are verified by byte-for-byte reconstruction against registered PNGs; whole exports match master checksums.
- Four existing NCSSM landmarks remain in their separate library. Total completed object designs: 18. No optional water tower was produced. No public deployment or external service was introduced.


### User-supplied breadboard replacement

The current BB05 toast breadboard uses the user's `/Users/alin08/Downloads/toast-breadboard.png` in place of the generated version. The supplied 720 × 480 RGBA PNG is copied byte-for-byte to `assets/mvp/props/bits-and-bites/masters/toast-breadboard.png` and to its whole-object export. No image generation or repainting was applied. Its six registered pieces, source-to-canvas matrix, indicator position, gallery/delivery image, and export bundle are rebuilt from that exact file. `work/production/bb05-user-revision.json` records the source checksum. The former generated master remains in `assets/mvp/props/bits-and-bites/revisions/toast-breadboard-generated.png` for provenance. Other approved object and landmark artwork is unchanged.
