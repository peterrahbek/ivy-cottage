# Ivy Cottage

A calm little browser game: a forgotten cottage needs some love. Mow the lawn,
scrub the path, pull weeds, paint the fence, the door and the walls in your own
colours, wash the windows, skim the pond, scrub moss off the roof and dust the
attic. Every finished job restores a piece of the cottage and earns coins;
coins buy better tools, little helper robots and decorations.

No timers, no losing, no ads, no accounts. Works offline once opened.

Play: https://peterrahbek.github.io/ivy-cottage/

## How it plays

- **Jobs.** Drag a finger over the mess. The tool sits just above your finger
  so you can see what you are doing. Coins fly to the counter as you clean.
  At 97% the rest tidies itself up, so nobody hunts for the last speck; past
  85% the leftover spots twinkle.
- **Tools.** Each kind of job has its own tool line (shears to garden tractor,
  scrubbing brush to turbo washer, small brush to paint sprayer ...). The next
  tool can be bought mid-job from the button at the bottom, or in the shed.
- **Finds.** Every job hides a keepsake under the mess (a ladybird, an old
  brass key, a friendly frog ...) plus a few coin stashes. The Finds shelf
  collects them.
- **The cottage.** 20 jobs restore the whole house. Painted colours carry over
  to the cottage picture.
- **Seasons.** After the restoration the year turns: summer regrowth, autumn
  leaves to rake, winter snow to shovel and frost on the windows, spring
  repainting (pick new colours). It loops forever, paying a little more each
  season.
- **Decorate.** Sixteen things to buy for the cottage, from a garden gnome to a
  hot-air balloon.
- **Small touches.** Evening light after 8 pm (glowing windows, stars), name
  your cottage, save or share a picture of it (camera button).

## Play on iPhone

Open the link in Safari, tap Share, then **Add to Home Screen**. It then runs
full screen and offline. Progress is saved on the phone (localStorage).

Safari and the Home Screen app keep separate saves, and iOS may clear a Safari
tab's save after a week without a visit. Play from the Home Screen icon. To
move a cottage (Safari to Home Screen, or to another phone), use Settings >
Copy save code, then Paste save code on the other side.

Works on iOS 15 and later (a small stand-in covers the canvas `roundRect` that
iOS 15 lacks). Held sideways, the game pauses and asks to be turned upright.

## Run locally

    node serve.js 8790

then open http://localhost:8790.

## Files

- `index.html` markup and styles
- `js/engine.js` the cleaning engine: layered canvases, a 120x200 dirt grid,
  the tool, stamping, particles, flying coins, hidden treasures, auto-finish
- `js/scenes.js` lawn and stone path scenes plus shared painters
- `js/scenes2.js` fence, windows (rooms behind the glass), door, wall
- `js/scenes3.js` flower beds, pond with koi, roof, shutters, attic, round window
- `js/scenes4.js` seasonal mess laid over any scene: leaves, snow, frost
- `js/house.js` the cottage overview (SVG), seasons, evening, decorations
- `js/tools.js` tool families, tiers and their drawings
- `js/data.js` jobs, seasons, finds, decorations, prices
- `js/audio.js` synthesised sound and generative music (no audio files)
- `js/main.js` screens, saving, shed, jobs, finds, photo
- `sw.js` + `manifest.webmanifest` offline support and home screen install

Bump `CACHE` in `sw.js` whenever a file changes.

Test hooks in the browser console: `__ivy.startChore(i)`,
`__ivy.ENGINE.debugFinish()`, `__ivy.reset()`.
