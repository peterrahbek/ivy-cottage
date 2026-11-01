# Ivy Cottage

A calm little browser game: a forgotten cottage needs some love. Mow the lawn,
scrub the path, pull weeds, paint the fence, the door and the walls in your own
colours, wash the windows, skim the pond, scrub moss off the roof and dust the
attic. Every finished job restores a piece of the cottage and earns coins;
coins buy better tools, little helper robots, decorations and new places:
a little corner café to bring back to life with some light building and
planting, and a seaside cove with a beach hut, a rowing boat, an old camper
van and a lighthouse.

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
  Tap the tool at the bottom to switch to any tool you already own (the shears
  are sometimes nicer than the tractor).
- **Finds.** Every job hides a keepsake under the mess (a ladybird, an old
  brass key, a friendly frog ...) plus a few coin stashes. The Finds shelf
  collects them.
- **The cottage.** 20 jobs restore the whole house. Painted colours carry over
  to the cottage picture.
- **Places.** Once the cottage is restored, Marigold Café is for sale (9,000
  coins). Its 14 jobs: sweep the floor, wash the shop window, scrub the
  terrace, wipe the tables, polish the coffee machine, clean the awning, paint
  the sign and the door, and new kinds of job: lay a deck, rebuild a brick
  wall, tile behind the counter (pieces click into place as you work), and
  plant planter boxes, a herb box and flower pots (plants spring up).
- **Seashell Cove.** Once the café is restored the cove is for sale (20,000
  coins). Its 18 jobs include picking up litter and collecting shells (things
  fly into a bin or a bucket), raking seaweed, a sandcastle, planting the
  dunes, a boardwalk and a jetty, the beach hut, the boat, the rock pool, the
  lighthouse, and a camper van in four steps: vacuum, wash, wax, polish.
- **Music.** Three quiet tunes of the game's own, one per place, in a key that
  follows the season and slower in the evening; volume in Settings.
- **Cloud save and friends (optional).** Settings > Save in the cloud gives a
  12-character cloud code; on another phone, I have a code picks the game up
  again, and a phone that finds more progress in the cloud carries on from it.
  The trophy button opens friends lists: pick a nickname, start a list and
  share its 6-character code, or join a friend's list. Friends see only
  nicknames and numbers (coins earned, keepsakes, places restored).
- **Café extra.** Stock the drinks fridge: every shelf has its own drink and
  every slot a coloured tag, so each bottle goes back in its place.
- **Christmas lights.** Every winter there is a job at each place to hang the
  lights, bulb by bulb; once they are up they shine in the place's picture.
- **Seasons.** After the restoration the year turns. Each season picks a few
  jobs per restored place from a bigger pool (autumn leaves, snow, frost,
  regrowth, plus seasonal planting and building: sunflowers, tulip bulbs, a
  vegetable patch, window boxes, firewood, a jetty, a brick path). Never more
  than one mowing job a season, and last year's picks are pushed to the back.
- **Decorate.** Sixteen things to buy for the cottage, from a garden gnome to a
  hot-air balloon, and twelve for the café.
- **Coins.** Jobs pay modestly on purpose, so tools, helpers, decorations and
  new places take a while to save up for.
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

## Cloud service

`cloud/` is a small Cloudflare Worker with one KV namespace, at
https://ivy-cottage.rahbek.workers.dev. No accounts:
a random cloud code (sent in the `X-Ivy-Code` header) is the key to a save;
a friends list has its own short code and only shows nicknames and numbers.
Uploads happen at most every two minutes while playing and when the app is
put away; half-done jobs stay on the phone. Deploy from `cloud/` with
`wrangler deploy` (an API token for the account in `CLOUDFLARE_API_TOKEN`).

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
- `js/scenes5.js` café scenes: floor, awning, sign, tables, coffee machine
- `js/scenes6.js` planting and building: jobs made of pieces (plants, planks,
  bricks, tiles, logs) that pop into place once the ground under them is worked
- `js/scenes7.js` cove scenes: seaweed, beach hut, boat, rock pool, lighthouse,
  lantern, camper van (vacuum, wash, wax, polish)
- `js/scenes8.js` beach litter and shells (picked up, they fly to a bucket), the
  sandcastle, Christmas lights, the drinks fridge
- `js/house.js` the cottage overview (SVG), seasons, evening, decorations
- `js/cafe.js` the café overview (SVG), same conventions
- `js/cove.js` the cove overview (SVG), same conventions
- `js/tools.js` tool families, tiers and their drawings
- `js/data.js` places, jobs, season pools, finds, decorations, prices
- `js/audio.js` synthesised sound and three composed tunes (no audio files)
- `js/main.js` screens, saving, shed, jobs, finds, photo
- `sw.js` + `manifest.webmanifest` offline support and home screen install

Bump `CACHE` in `sw.js` whenever a file changes.

Test hooks in the browser console: `__ivy.startChore(i)`, `__ivy.startCafe(i)`, `__ivy.startCove(i)`,
`__ivy.ENGINE.debugStroke(x0, y0, x1, y1)`, `__ivy.ENGINE.debugFinish()`,
`__ivy.goPlace('cafe')`, `__ivy.reset()`.
