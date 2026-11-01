# Ivy Cottage

A calm little browser game: a forgotten cottage needs some love. Mow the lawn,
scrub the path, paint the fence and the door in your own colours, wash the
windows. Every finished job restores a piece of the cottage, earns coins, and
coins buy better tools in the shed.

No timers, no losing, no ads, no accounts. Works offline once opened.

## Play on iPhone

Open the Pages link in Safari, tap Share, then **Add to Home Screen**.

## Run locally

    node serve.js 8790

then open http://localhost:8790.

## Files

- `index.html` markup and styles
- `js/engine.js` the cleaning engine (dirt grid, tool, particles, coins)
- `js/scenes.js`, `js/scenes2.js` procedural art for each kind of chore
- `js/house.js` the cottage overview (SVG)
- `js/tools.js` tool families, tiers and their drawings
- `js/data.js` the chore list, prices and paint colours
- `js/audio.js` synthesised sound and music
- `js/main.js` screens, saving and the shed
- `sw.js` + `manifest.webmanifest` offline support and home screen install

Bump `CACHE` in `sw.js` whenever a file changes.
