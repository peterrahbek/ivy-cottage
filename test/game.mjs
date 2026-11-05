#!/usr/bin/env node
// Plays the real game in headless Chrome on an iPhone-sized screen, from a
// fresh save and offline: every puzzle in the puzzle room with real touches
// (half, leave, come back, finish; then once more from the jobs list for a
// new layout), the puzzle room's screens, the puzzles out in the places
// (started from the next-job card, as she would), an older save meeting the
// new jobs, the glasshouse in every season, the newer puzzles at the older
// places, how new places open (an older save, a new game, a year of waiting
// for the canal), the canal and the bookshop in every season, and every
// other job in the game straight through. Since v22 also: the pottery and the
// station bought by the opening rule and seen in every season, their puzzles
// (and the one made by hand) played in place, the newer puzzles at the older
// places, older saves planted for a page load, the season budget (no season
// past 37 jobs, places taking turns), the walk round the village, the evening
// (thinking jobs last, Goodnight, Just one job) and the money a year brings in
// with 7, 9, 10 and 17 places. Since v23 also: the bead shop and the
// curiosity shop bought by the opening rule and seen in every season, their
// puzzles (beads, buttons, the locked box, the jigsaw, what's missing) played in
// place, the new puzzles at the older places (a jigsaw at every place in autumn
// and winter), a save from v22 meeting the new places, and the Finds shelf
// folded by place. Since v24 also: the stables and the painter's loft bought by
// the opening rule and seen in every season, the canvas and the mural staying in
// the loft's picture, the new puzzles out in the places, the two boards in the
// puzzle room turned with a real tap, the little life of a place with nothing
// to do, a save from v23 meeting the new places, and the opening money for both.
// Since v25 also: the observatory and the lido bought by the opening rule and seen
// in every season, the pool following the year, the stars, the night-sky jigsaw
// and the ice creams played in place, the mosaic laid tile by tile, deck chairs
// on their marks, a halter on the tool button at the pony's walk, a save from v24
// meeting the new places, the opening money for both, and the observatory's tune
// the slowest and deepest of them all.
// Prints a JSON report; pictures go to --out.
//
//   node test/game.mjs [--out dir] [--economy]     --economy prints the money only, in seconds

import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch, js, shot, sleep, swipe, phone } from './cdp.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = resolve(opt('out', '') || mkdtempSync(join(tmpdir(), 'ivy-game-')));
mkdirSync(out, { recursive: true });

const economyOnly = args.includes('--economy');
const report = { out, problems: [], puzzles: [], screens: {}, regression: null };
const problem = (s) => report.problems.push(s);
const pic = (b, name) => shot(b, join(out, name + '.png'));

// one gesture from a puzzle's plan, in board units, as real touches
async function gesture(b, g) {
  const a = g.tap || [g.drag[0], g.drag[1]], z = g.tap || [g.drag[2], g.drag[3]];
  const [p, q] = await js(b, `[__ivy.ENGINE.toScreen(${a[0]}, ${a[1]}), __ivy.ENGINE.toScreen(${z[0]}, ${z[1]})]`);
  await swipe(b, p, q);
}
const state = (b) => js(b, `({ coins: __ivy.S.coins, progress: __ivy.ENGINE.progress(), done: document.querySelector('#doneOverlay').classList.contains('on'),
  title: document.querySelector('#doneTitle').textContent, find: document.querySelector('#doneFind').textContent, back: document.querySelector('#doneBtn').textContent,
  earn: document.querySelector('#doneEarn').textContent, bonus: document.querySelector('#doneBonus').textContent })`);

const b = await launch();
try {
  await phone(b);
  await b.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.fetch = () => Promise.reject(new Error("offline in tests")); window.__errs = []; addEventListener("error", (e) => __errs.push(String(e.message)));' });
  // a save planted for the next page load (the page saves its own game on the way out)
  await b.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try { const t = sessionStorage.getItem("ivy-test-save"); if (t) { localStorage.setItem("ivycottage.v1", t); sessionStorage.removeItem("ivy-test-save"); } } catch (_) {}' });
  await b.send('Page.navigate', { url: pathToFileURL(join(root, 'index.html')).href });
  for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
  await js(b, `document.querySelector('#title').click()`); await sleep(800);
  if (!economyOnly) {
  // the cottage's next-job card still gets its little picture of the mess
  const thumb = await js(b, `(document.querySelector('#nextCard .nextPic img') || {}).src || ''`);
  if (!thumb.startsWith('data:image/jpeg')) problem('no picture on the cottage next-job card');
  await js(b, `__ivy.S.pauses = false; __ivy.goPlace('beta')`); await sleep(1500);
  const bthumb = await js(b, `(document.querySelector('#nextCard .nextPic img') || {}).src || ''`);
  if (!bthumb.startsWith('data:image/jpeg')) problem('no picture on the puzzle room next-job card');
  report.screens.homeBefore = await js(b, `({ brand: document.querySelector('#brandName').textContent, bar: document.querySelector('#restoredTxt').textContent, next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ') })`);
  await pic(b, 'home-beta-before');
  if (!/0 of 18 puzzles solved/.test(report.screens.homeBefore.bar)) problem('puzzle room: ' + report.screens.homeBefore.bar);

  // two boards, turned with a real tap on the tab with the arrow
  {
    const onBoard = () => js(b, `({ tab: document.querySelector('#scene [data-board]').dataset.board, parts: [...new Set([...document.querySelectorAll('#scene [data-part]')].map((e) => e.dataset.part))] })`);
    const tapTab = async () => {
      const q = await js(b, `(() => { const r = document.querySelector('#scene [data-board]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; })()`);
      if (q.h < 40 || q.w < 60) problem(`puzzle room: the tab is only ${q.w} by ${q.h}`);
      await b.send('Input.synthesizeTapGesture', { x: q.x, y: q.y }); await sleep(700);
    };
    const think = await onBoard();
    await tapTab();
    const make = await onBoard();
    await pic(b, 'home-beta-making');
    await tapTab();
    const again = await onBoard();
    report.screens.boards = { think: think.parts, make: make.parts, back: again.parts.length };
    if (think.tab !== 'make' || make.tab !== 'think') problem('puzzle room: the tab does not turn the board ' + JSON.stringify([think.tab, make.tab]));
    if (think.parts.length + make.parts.length !== 18) problem(`puzzle room: ${think.parts.length} + ${make.parts.length} cards on the two boards`);
    if (again.parts.join() !== think.parts.join()) problem('puzzle room: turning back did not show the first board');
  }

  const chores = await js(b, 'DATA.BETA_CHORES.map((c) => ({ id: c.id, name: c.name, value: c.value }))');
  for (let i = 0; i < chores.length; i++) {
    const c = chores[i], row = { id: c.id };
    const coins0 = await js(b, '__ivy.S.coins');
    await js(b, `__ivy.startBeta(${i})`); await sleep(900);
    await pic(b, `${c.id}-1-start`);
    const hud = await js(b, `({ chip: document.querySelector('#toolChip').textContent, bots: document.querySelector('#btnBots').hidden, up: document.querySelector('#upPill').classList.contains('on'), hint: document.querySelector('#hint span').textContent })`);
    if (!hud.chip.includes('Hint') || !hud.bots || hud.up) problem(`${c.id}: the bottom bar is not a lone Hint button (${JSON.stringify(hud)})`);
    const plan = await js(b, '__ivy.ENGINE.scene.debugPlan()');
    const half = Math.ceil(plan.length / 2);
    for (const g of plan.slice(0, half)) await gesture(b, g);
    await sleep(600);
    await pic(b, `${c.id}-2-half`);
    const h = await state(b);
    // leave halfway and come back
    await js(b, `document.querySelector('#btnBack').click()`); await sleep(500);
    const wip = await js(b, `__ivy.S.wips['${c.id}'] || null`);
    if (!wip || wip[0] !== 'P') problem(`${c.id}: nothing kept when leaving halfway`);
    await js(b, `__ivy.startBeta(${i})`); await sleep(900);
    const back = await js(b, '__ivy.ENGINE.progress()');
    if (Math.abs(back - h.progress) > 1e-9) problem(`${c.id}: came back at ${back}, left at ${h.progress}`);
    for (const g of await js(b, '__ivy.ENGINE.scene.debugPlan()')) await gesture(b, g);
    await sleep(3000);
    await pic(b, `${c.id}-3-done`);
    const d = await state(b);
    if (!d.done) problem(`${c.id}: no finish card after the last move`);
    if (!d.find) problem(`${c.id}: no keepsake on the first finish`);
    const find = Math.round(c.value * 0.15), bonus = Math.round(c.value * 0.25), want = c.value + find + bonus;
    if (Math.abs(d.coins - coins0 - want) > 1) problem(`${c.id}: paid ${d.coins - coins0}, expected ${want}`);
    Object.assign(row, { steps: plan.length, halfProgress: +h.progress.toFixed(3), cameBack: +back.toFixed(3), paid: d.coins - coins0, expected: want, title: d.title, find: d.find, back: d.back });
    await js(b, `document.querySelector('#doneBtn').click()`); await sleep(600);

    // again, from the jobs list: a new layout at 60%
    const coins1 = await js(b, '__ivy.S.coins');
    await js(b, `__ivy.openJobs(); document.querySelector('.jGo[data-id="${c.id}"]').click()`); await sleep(900);
    const plan2 = await js(b, '__ivy.ENGINE.scene.debugPlan()');
    if (JSON.stringify(plan2) === JSON.stringify(plan)) problem(`${c.id}: playing again gave the same layout`);
    for (const g of plan2) await gesture(b, g);
    await sleep(3000);
    const d2 = await state(b);
    const v2 = Math.round(c.value * 0.6), want2 = v2 + Math.round(v2 * 0.25);
    if (!d2.done) problem(`${c.id}: no finish card on playing again`);
    if (Math.abs(d2.coins - coins1 - want2) > 1) problem(`${c.id}: playing again paid ${d2.coins - coins1}, expected ${want2}`);
    row.again = { paid: d2.coins - coins1, expected: want2, newLayout: JSON.stringify(plan2) !== JSON.stringify(plan) };
    await js(b, `document.querySelector('#doneBtn').click()`); await sleep(600);
    report.puzzles.push(row);
  }

  await sleep(1500);
  report.screens.homeAfter = await js(b, `({ bar: document.querySelector('#restoredTxt').textContent, next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ') })`);
  await pic(b, 'home-beta-after');
  await js(b, `__ivy.openPlaces()`); await sleep(800);
  await pic(b, 'places');
  report.screens.places = await js(b, `[...document.querySelectorAll('.placeCard')].map((c) => c.querySelector('.pName').textContent + ' | ' + (c.querySelector('button, .maxed, .lock') || {}).textContent)`);
  await js(b, `document.querySelector('#sheet').classList.remove('on'); document.querySelector('#btnFinds').click()`); await sleep(600);
  report.screens.finds = await js(b, `[...document.querySelectorAll('.findsHead')].map((h) => h.textContent)`);
  await js(b, `document.querySelector('#sheet').classList.remove('on'); document.querySelector('#btnShed').click()`); await sleep(500);
  report.screens.shed = await js(b, `document.querySelector('#sheetBody').innerText.replace(/\\s+/g, ' ')`);
  await js(b, `document.querySelector('#sheet').classList.remove('on')`);

  // leaving in the second between the last move and the finish card still
  // counts the solve (and pays once)
  {
    const i = 0, id = await js(b, `DATA.BETA_CHORES[${i}].id`);
    const before = await js(b, `({ coins: __ivy.S.coins, done: __ivy.S.done['${id}'] || 0, value: Math.round(DATA.BETA_CHORES[${i}].value * 0.6) })`);
    await js(b, `__ivy.openJobs(); document.querySelector('.jGo[data-id="${id}"]').click()`); await sleep(900);
    for (const g of await js(b, '__ivy.ENGINE.scene.debugPlan()')) await gesture(b, g);
    await js(b, `document.querySelector('#btnBack').click()`); await sleep(600);
    const after = await js(b, `({ coins: __ivy.S.coins, done: __ivy.S.done['${id}'] || 0, wip: __ivy.S.wips['${id}'] || null, home: document.querySelector('#home').classList.contains('on') })`);
    const want = before.value + Math.round(before.value * 0.25);
    report.edges = { backInFinish: { doneBefore: before.done, doneAfter: after.done, paid: after.coins - before.coins, expected: want, wip: after.wip, home: after.home } };
    if (after.done !== before.done + 1) problem(`back in the finishing second: the solve was not counted (${before.done} -> ${after.done})`);
    if (after.wip) problem('back in the finishing second: a wip was kept for a solved puzzle');
    if (Math.abs(after.coins - before.coins - want) > 1) problem(`back in the finishing second: paid ${after.coins - before.coins}, expected ${want}`);
  }
  // opening a puzzle and leaving without a move keeps nothing
  {
    const i = await js(b, `DATA.BETA_CHORES.findIndex((c) => c.scene === 'hose')`), id = await js(b, `DATA.BETA_CHORES[${i}].id`);
    await js(b, `__ivy.startBeta(${i})`); await sleep(800);
    await js(b, `document.querySelector('#btnBack').click()`); await sleep(400);
    report.edges.untouched = await js(b, `__ivy.S.wips['${id}'] || null`);
    if (report.edges.untouched) problem('leaving an untouched puzzle kept a wip');
  }
  // a half-done state from another layout is not loaded onto this one
  {
    const id = await js(b, `DATA.BETA_CHORES[0].id`);
    await js(b, `__ivy.S.wips['${id}'] = 'P' + JSON.stringify({ seed: 12345, s: { placed: [true, true, true, true, true, true, true, true, false] }, paid: 30 })`);
    await js(b, `__ivy.startBeta(0)`); await sleep(800);
    report.edges.otherLayout = await js(b, '__ivy.ENGINE.progress()');
    if (report.edges.otherLayout !== 0) problem(`a state from another layout was loaded (progress ${report.edges.otherLayout})`);
    await js(b, `document.querySelector('#btnBack').click()`); await sleep(400);
  }

  // the puzzles out in the places: each is the next job once the jobs before
  // it are done, started from the next-job card and played with real touches
  report.placed = [];
  for (const id of ['cafe-cups', 'rescue-feed', 'rescue-beds', 'gh-water', 'gh-cutting', 'canal-hold', 'books-shelves', 'pot-throw', 'pot-glaze', 'pot-firing', 'halt-lost', 'halt-parcels', 'halt-shelves',
    'bb-necklace', 'bb-buttons', 'bb-bracelet', 'cu-box', 'cu-jigsaw', 'cu-seek', 'st-mane', 'st-saddles', 'lo-canvas', 'lo-mural', 'lo-mix', 'ob-stars', 'ob-jigsaw', 'li-ices']) {
    const c = await js(b, `(() => { const c = DATA.PLACES.flatMap((p) => p.chores).find((x) => x.id === '${id}'); return c && { place: c.place, index: c.index, value: c.value, puzzle: !!c.puzzle, family: c.family }; })()`);
    if (!c) { problem(`${id}: not in any place`); continue; }
    if (!c.puzzle || !['think', 'craft'].includes(c.family)) problem(`${id}: not a puzzle in its place`);
    await js(b, `(() => { const S = __ivy.S, p = DATA.placeOf('${c.place}'); S.owned['${c.place}'] = 1; for (const x of p.chores) { if (x.index < ${c.index}) S.done[x.id] = 1; else delete S.done[x.id]; delete S.wips[x.id]; } __ivy.save(); __ivy.goPlace('${c.place}'); })()`);
    await sleep(1200);
    const card = await js(b, `({ job: document.querySelector('#nextCard').dataset.job, text: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' '), pic: !!(document.querySelector('#nextCard .nextPic img') || {}).src })`);
    if (card.job !== id) problem(`${id}: the next-job card shows ${card.job}`);
    await pic(b, `placed-${id}-home`);
    const coins0 = await js(b, '__ivy.S.coins');
    await js(b, `document.querySelector('#goBtn').click()`); await sleep(900);
    const hud = await js(b, `({ chip: document.querySelector('#toolChip').textContent, bots: document.querySelector('#btnBots').hidden, hint: document.querySelector('#hint span').textContent, puzzle: !!__ivy.ENGINE.scene.puzzle })`);
    if (!hud.puzzle || !hud.chip.includes('Hint') || !hud.bots) problem(`${id}: does not play as a puzzle (${JSON.stringify(hud)})`);
    await pic(b, `placed-${id}-start`);
    for (const g of await js(b, '__ivy.ENGINE.scene.debugPlan()')) await gesture(b, g);
    await sleep(3000);
    await pic(b, `placed-${id}-done`);
    const d = await state(b);
    const want = c.value + Math.round(c.value * 0.15) + Math.round(c.value * 0.25);
    if (!d.done) problem(`${id}: no finish card`);
    if (!d.find) problem(`${id}: no keepsake on the first finish`);
    if (Math.abs(d.coins - coins0 - want) > 1) problem(`${id}: paid ${d.coins - coins0}, expected ${want}`);
    await js(b, `document.querySelector('#doneBtn').click()`); await sleep(800);
    const part = await js(b, `(() => { const ch = DATA.PLACES.flatMap((p) => p.chores).find((x) => x.id === '${id}'); return document.querySelectorAll('#scene [data-part="' + ch.part + '"]').length; })()`);
    if (!part) problem(`${id}: no part of the picture for it`);
    report.placed.push({ id, place: c.place, card: card.text, chip: hud.chip, paid: d.coins - coins0, expected: want, find: d.find, partInPicture: part });
  }

  // what was painted stays in the loft's picture, in the colours it was painted
  {
    const paint = report.painted = await js(b, `(() => { const P = __ivy.S.painted || {}; __ivy.goPlace('loft');
      const n = (part) => document.querySelectorAll('#scene [data-part="' + part + '"] polygon').length;
      return { canvas: P.canvas, mural: P.mural, polysCanvas: n('canvas'), polysMural: n('mural') }; })()`);
    if (!paint.canvas || !paint.mural) problem('painted: nothing kept from the canvas or the mural ' + JSON.stringify(paint));
    if (paint.polysCanvas < 8 || paint.polysMural < 12) problem('painted: the picture does not show them ' + JSON.stringify(paint));
    await sleep(600); await pic(b, 'loft-painted');
  }

  // an older save with the café restored and the year turning: the new job
  // turns up at the café and the other places point there
  {
    await js(b, `(() => { const S = __ivy.S;
      for (const p of DATA.PLACES) if (!p.beta && !['glasshouse', 'canal', 'books', 'observatory', 'lido'].includes(p.id)) { S.owned[p.id] = 1; for (const c of p.chores) S.done[c.id] = 1; }
      delete S.done['cafe-cups']; S.seasonNo = 3; S.sdone = {};
      for (const j of __ivy.seasonJobs()) if (j.place === 'cottage') S.sdone[j.id] = 1;
      __ivy.save(); __ivy.goPlace('cottage'); })()`);
    await sleep(1000);
    const home = await js(b, `({ next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ') })`);
    report.olderSave = { cottage: home.next };
    if (!/Marigold Café/.test(home.next)) problem('older save: the cottage does not point to the new job at the café');
    await js(b, `__ivy.goPlace('cafe')`); await sleep(1000);
    report.olderSave.cafe = await js(b, `({ job: document.querySelector('#nextCard').dataset.job, bar: document.querySelector('#restoredTxt').textContent })`);
    if (report.olderSave.cafe.job !== 'cafe-cups') problem('older save: the café does not offer the cups');
    await js(b, `__ivy.openPlaces()`); await sleep(800);
    report.olderSave.places = await js(b, `[...document.querySelectorAll('.placeCard')].map((c) => c.querySelector('.pName').textContent + ' | ' + c.querySelector('.pSub').textContent.slice(0, 60))`);
    await pic(b, 'places-older-save');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
  }

  // the glasshouse: for sale, then owned in every season, by day and night
  {
    await js(b, `(() => { const S = __ivy.S; for (const p of DATA.PLACES) if (!p.beta) for (const c of p.chores) S.done[c.id] = 1; for (const c of DATA.GLASS_CHORES) delete S.done[c.id]; delete S.owned.glasshouse; S.coins = 50000; S.seasonNo = 0; S.sdone = {}; S.restoredAt = { cottage: 0, cafe: 0, cove: 0, rescue: -3 }; __ivy.save(); __ivy.openPlaces(); })()`);
    await sleep(900);
    await pic(b, 'places-glasshouse-for-sale');
    const buy = await js(b, `(() => { const card = [...document.querySelectorAll('.placeCard')].find((c) => /Primrose/.test(c.textContent)); const btn = card && card.querySelector('button'); return { text: card && card.innerText.replace(/\\s+/g, ' '), btn: btn && btn.textContent }; })()`);
    report.glasshouse = { forSale: buy };
    if (!buy.btn) problem('glasshouse: no buy button in the places list');
    await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => /Primrose/.test(c.textContent)).querySelector('button').click()`); await sleep(1500);
    report.glasshouse.afterBuy = await js(b, `({ place: __ivy.S.place, owned: !!__ivy.S.owned.glasshouse, coins: __ivy.S.coins, brand: document.querySelector('#brandName').textContent, next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ') })`);
    if (report.glasshouse.afterBuy.place !== 'glasshouse') problem('glasshouse: buying did not take her there');
    await sleep(2500);
    await pic(b, 'glasshouse-new');
    for (const [n, season] of [[1, 'summer'], [2, 'autumn'], [3, 'winter'], [4, 'spring']]) {
      await js(b, `(() => { const S = __ivy.S; for (const c of DATA.GLASS_CHORES) S.done[c.id] = 1; S.seasonNo = ${n}; S.sdone = {}; __ivy.save(); __ivy.render(); })()`);
      await sleep(700);
      await pic(b, `glasshouse-${season}`);
    }
    report.glasshouse.seasonJobs = await js(b, `__ivy.seasonJobs().filter((j) => j.place === 'glasshouse').map((j) => j.name + ' (' + j.family + ')')`);
  }

  // the newer puzzles turn up in the seasons at the older places too
  report.extraPuzzles = [];
  for (const [id, place] of [['x-cove-pack', 'cove'], ['x-cottage-books', 'cottage'], ['x-cafe-owners', 'cafe'], ['x-rescue-owners', 'rescue'], ['x-books-post', 'books'],
    ['x-cottage-seek', 'cottage'], ['x-cafe-seek', 'cafe'], ['x-books-seek', 'books'], ['x-rescue-seek', 'rescue'],
    ['x-rescue-collar', 'rescue'], ['x-cottage-buttons', 'cottage'], ['x-cottage-lock', 'cottage'], ['x-books-lock', 'books'], ['x-halt-lock', 'halt'],
    ['x-cottage-jigsaw', 'cottage'], ['x-cafe-jigsaw', 'cafe'], ['x-cove-jigsaw', 'cove'], ['x-rescue-jigsaw', 'rescue'], ['x-glass-jigsaw', 'glasshouse'],
    ['x-canal-jigsaw', 'canal'], ['x-books-jigsaw', 'books'], ['x-pottery-jigsaw', 'pottery'], ['x-halt-jigsaw', 'halt'], ['x-beads-jigsaw', 'beads'],
    ['x-stables-jigsaw', 'stables'], ['x-loft-jigsaw', 'loft'], ['x-lido-jigsaw', 'lido'],
    ['x-cottage-numbers', 'cottage'], ['x-cafe-numbers', 'cafe'], ['x-cove-stars', 'cove'], ['x-canal-stars', 'canal'], ['x-beads-stitch', 'beads'], ['x-rescue-stitch', 'rescue']]) {
    const pls = JSON.stringify(place === 'cottage' ? ['cottage', 'cove'] : ['cottage', place]);
    const j = await js(b, `(() => { for (let n = 1; n <= 24; n++) { const j = DATA.seasonJobs(n, ${pls}).find((x) => x.base === '${id}'); if (j) return { n, id: j.id, puzzle: !!j.puzzle, family: j.family, opts: j.opts }; } return null; })()`);
    if (!j) { problem(`${id}: never in a season`); continue; }
    const fam = await js(b, `DATA.EXTRAS.find((x) => x.id === '${id}').family`);
    if (!j.puzzle || j.family !== fam || !['think', 'craft'].includes(fam)) problem(`${id}: not a puzzle in the seasons`);
    if (/jigsaw$/.test(id) && !['autumn', 'winter'].includes(j.opts.season)) problem(`${id}: a jigsaw outside autumn and winter (${JSON.stringify(j.opts)})`);
    await js(b, `(() => { const S = __ivy.S; S.owned.${place} = 1; S.seasonNo = ${j.n}; S.sdone = {}; __ivy.save(); __ivy.startJob(DATA.seasonJobs(${j.n}, ${pls}).find((x) => x.base === '${id}')); })()`);
    await sleep(900);
    await pic(b, `${id}-start`);
    const hud = await js(b, `({ chip: document.querySelector('#toolChip').textContent, puzzle: !!__ivy.ENGINE.scene.puzzle })`);
    if (!hud.puzzle || !hud.chip.includes('Hint')) problem(`${id}: does not play as a puzzle (${JSON.stringify(hud)})`);
    for (const g of await js(b, '__ivy.ENGINE.scene.debugPlan()')) await gesture(b, g);
    await sleep(3000);
    const d = await state(b);
    if (!d.done) problem(`${id}: no finish card`);
    await pic(b, `${id}-done`);
    await js(b, `document.querySelector('#doneBtn').click()`); await sleep(600);
    report.extraPuzzles.push({ id, season: j.n, opts: j.opts, done: d.done, title: d.title });
  }

  // how new places open: one Places card, its list of what has to be true
  const card = (name) => js(b, `(() => { const c = [...document.querySelectorAll('.placeCard')].find((x) => x.querySelector('.pName').textContent.includes('${name}'));
    return c && { opens: [...c.querySelectorAll('.opens li')].map((l) => (l.className === 'ok' ? 'ok ' : 'no ') + l.textContent), buy: !!c.querySelector('[data-buy]'), lock: (c.querySelector('.lock') || {}).textContent || '' }; })()`);
  const o = report.opening = {};
  // a new game: the café right after the cottage, the cove a season after the café
  {
    await js(b, `(() => { __ivy.reset(); const S = __ivy.S; S.pauses = false; for (const c of DATA.CHORES) S.done[c.id] = 1; S.coins = 9500; __ivy.save(); __ivy.render(); __ivy.openPlaces(); })()`);
    await sleep(800);
    o.newGame = { cafe: await card('Marigold'), cove: await card('Seashell'), canal: await card('Kingfisher') };
    if (!o.newGame.cafe || !o.newGame.cafe.buy) problem('opening: a new game cannot buy the café once the cottage is restored');
    if (!o.newGame.cove || o.newGame.cove.buy || !o.newGame.cove.opens.some((t) => t.includes('One season after that'))) problem('opening: the cove card in a new game ' + JSON.stringify(o.newGame.cove));
    await pic(b, 'opening-new-game');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
  }
  // an older save (from before the rule): it keeps the glasshouse it could
  // already buy, and the canal waits a year after the glasshouse is restored
  {
    for (const e of await js(b, 'window.__errs')) problem('page error: ' + e);
    await js(b, `(() => { const S = JSON.parse(JSON.stringify(__ivy.S));
      delete S.restoredAt; delete S.oldWaits;
      S.owned = { cottage: 1, beta: 1, cafe: 1, cove: 1, rescue: 1 }; S.done = {};
      for (const p of DATA.PLACES) if (['cottage', 'cafe', 'cove', 'rescue'].includes(p.id)) for (const c of p.chores) S.done[c.id] = 1;
      S.seasonNo = 9; S.sdone = {}; S.coins = 120000; S.place = 'cottage'; S.wips = {}; S.pauses = false;
      sessionStorage.setItem('ivy-test-save', JSON.stringify(S)); location.reload(); })()`);
    await sleep(600);
    for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
    await js(b, `document.querySelector('#title').click()`); await sleep(800);
    o.migrated = await js(b, `({ oldWaits: __ivy.S.oldWaits, restoredAt: __ivy.S.restoredAt })`);
    if (!o.migrated.oldWaits || o.migrated.restoredAt.rescue !== 9) problem('opening: an older save was not moved over ' + JSON.stringify(o.migrated));
    await js(b, `__ivy.openPlaces()`); await sleep(800);
    await pic(b, 'opening-older-save');
    o.glassOld = await card('Primrose'); o.canalOld = await card('Kingfisher'); o.booksOld = await card('Hollyhock');
    if (!o.glassOld || !o.glassOld.buy) problem('opening: an older save lost the glasshouse it could buy');
    if (!o.canalOld || o.canalOld.buy || !o.canalOld.opens.some((t) => t.includes('A year after that'))) problem('opening: the canal card before the glasshouse ' + JSON.stringify(o.canalOld));
    await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => /Primrose/.test(c.textContent)).querySelector('[data-buy]').click()`); await sleep(1500);
    await js(b, `(() => { const S = __ivy.S; for (const c of DATA.GLASS_CHORES) S.done[c.id] = 1; __ivy.save(); __ivy.render(); __ivy.openPlaces(); })()`); await sleep(800);
    o.canalWaiting = await card('Kingfisher');
    if (!o.canalWaiting || o.canalWaiting.buy || !o.canalWaiting.opens.some((t) => t.includes('Summer, year 4 · 4 seasons to go'))) problem('opening: the canal does not wait a year ' + JSON.stringify(o.canalWaiting));
    await sleep(2600); await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => /Kingfisher/.test(c.textContent)).scrollIntoView({ block: 'center' })`); await sleep(400);
    await pic(b, 'opening-canal-waiting');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
    // three seasons on with every season job done: turning the season opens the canal
    await js(b, `(() => { const S = __ivy.S; S.seasonNo = 12; S.sdone = {}; for (const j of __ivy.seasonJobs()) S.sdone[j.id] = 1; __ivy.save(); __ivy.goPlace('cottage'); })()`); await sleep(1000);
    o.seasonDone = await js(b, `document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ')`);
    await js(b, `document.querySelector('#goBtn').click()`); await sleep(3400);
    o.toast = await js(b, `document.querySelector('#toast').textContent`);
    if (!/Kingfisher Lock is for sale now/.test(o.toast)) problem('opening: no word when the canal opened (' + o.toast + ')');
    await pic(b, 'opening-toast');
    await js(b, `__ivy.openPlaces()`); await sleep(800);
    o.canalOpen = await card('Kingfisher'); o.booksWaiting = await card('Hollyhock');
    if (!o.canalOpen || !o.canalOpen.buy) problem('opening: no buy button once the canal is open ' + JSON.stringify(o.canalOpen));
    await pic(b, 'opening-canal-open');
    await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => /Kingfisher/.test(c.textContent)).querySelector('[data-buy]').click()`); await sleep(1500);
    o.afterBuy = await js(b, `({ place: __ivy.S.place, coins: __ivy.S.coins, brand: document.querySelector('#brandName').textContent, next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ') })`);
    if (o.afterBuy.place !== 'canal') problem('opening: buying the canal did not take her there');
    await sleep(2500);
    await pic(b, 'canal-new');
  }
  // the canal and the bookshop, restored, in every season and at night
  {
    for (const [pl, list] of [['canal', 'CANAL_CHORES'], ['books', 'BOOK_CHORES']]) {
      for (const [n, season] of [[13, 'summer'], [14, 'autumn'], [15, 'winter'], [16, 'spring']]) {
        await js(b, `(() => { const S = __ivy.S; S.owned.${pl} = 1; for (const c of DATA.${list}) S.done[c.id] = 1; S.seasonNo = ${n}; S.sdone = {}; __ivy.save(); __ivy.goPlace('${pl}'); })()`);
        await sleep(800);
        await pic(b, `${pl}-${season}`);
      }
      o[pl + 'Jobs'] = await js(b, `__ivy.seasonJobs().filter((j) => j.place === '${pl}').map((j) => j.name + ' (' + j.family + ')')`);
      const parts = await js(b, `[...new Set([...document.querySelectorAll('#scene [data-part]')].map((e) => e.dataset.part))]`);
      const want = await js(b, `DATA.${list}.map((c) => c.part)`);
      for (const p of want) if (!parts.includes(p)) problem(`${pl}: no part "${p}" in the picture`);
    }
  }
  // the pottery and the station open by the same rule: a year after the place
  // before is restored, with the coins; turning the season that opens one says so
  {
    const open = async (id, name, prev) => {
      const r = {};
      await js(b, `(() => { const S = __ivy.S; S.coins = 250000; for (const c of DATA.placeOf('${prev}').chores) S.done[c.id] = 1; S.owned['${prev}'] = S.owned['${prev}'] || 1; delete S.restoredAt['${prev}']; __ivy.save(); __ivy.goPlace('${prev}'); __ivy.openPlaces(); })()`);
      await sleep(800);
      r.at = await js(b, `({ season: __ivy.S.seasonNo, restoredAt: __ivy.S.restoredAt['${prev}'] })`);
      r.waiting = await card(name);
      if (!r.waiting || r.waiting.buy || !r.waiting.opens.some((t) => /4 seasons to go/.test(t))) problem(`${id}: does not wait a year after ${prev} ` + JSON.stringify(r.waiting));
      await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => c.textContent.includes('${name}')).scrollIntoView({ block: 'center' })`); await sleep(300);
      await pic(b, `opening-${id}-waiting`);
      await js(b, `document.querySelector('#sheet').classList.remove('on')`);
      // three more seasons done, then the fourth turns from the season-done card
      await js(b, `(() => { const S = __ivy.S; S.seasonNo = S.restoredAt['${prev}'] + 3; S.sdone = {}; for (const j of __ivy.seasonJobs()) S.sdone[j.id] = 1; __ivy.save(); __ivy.goPlace('${prev}'); })()`); await sleep(900);
      r.seasonDone = await js(b, `document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ')`);
      await js(b, `document.querySelector('#goBtn').click()`); await sleep(3400);
      r.toast = await js(b, `document.querySelector('#toast').textContent`);
      if (!new RegExp(name + ' is for sale now').test(r.toast)) problem(`${id}: no word when it opened (${r.toast})`);
      await js(b, `__ivy.openPlaces()`); await sleep(800);
      r.open = await card(name);
      if (!r.open || !r.open.buy) problem(`${id}: no buy button once open ` + JSON.stringify(r.open));
      const coins0 = await js(b, '__ivy.S.coins');
      await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => c.textContent.includes('${name}')).querySelector('[data-buy]').click()`); await sleep(1500);
      r.afterBuy = await js(b, `({ place: __ivy.S.place, paid: ${coins0} - __ivy.S.coins, price: DATA.placeOf('${id}').price, brand: document.querySelector('#brandName').textContent, next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ') })`);
      if (r.afterBuy.place !== id) problem(`${id}: buying did not take her there`);
      if (r.afterBuy.paid !== r.afterBuy.price) problem(`${id}: bought for ${r.afterBuy.paid}, the price is ${r.afterBuy.price}`);
      await sleep(2500);
      await pic(b, `${id}-new`);
      return r;
    };
    o.pottery = await open('pottery', 'Kiln Lane Pottery', 'books');
    o.halt = await open('halt', 'Halfpenny Halt', 'pottery');
    o.beads = await open('beads', 'Button & Bead', 'halt');
    o.curio = await open('curio', 'Curiosities', 'beads');
    o.stables = await open('stables', 'Foxglove Stables', 'curio');
    o.loft = await open('loft', 'Loft', 'stables');
    o.observatory = await open('observatory', 'Owl Hill Observatory', 'loft');
    o.lido = await open('lido', 'Lido', 'observatory');
    // all eight restored, in every season, by day and at night; every job part in the picture
    for (const [pl, list] of [['pottery', 'POTTERY_CHORES'], ['halt', 'HALT_CHORES'], ['beads', 'BEAD_CHORES'], ['curio', 'CURIO_CHORES'], ['stables', 'STABLE_CHORES'], ['loft', 'LOFT_CHORES'], ['observatory', 'OBSERVATORY_CHORES'], ['lido', 'LIDO_CHORES']]) {
      const n0 = await js(b, `4 * Math.ceil((__ivy.S.seasonNo + 1) / 4)`);
      for (const [k, season] of [[1, 'summer'], [2, 'autumn'], [3, 'winter'], [4, 'spring']]) {
        await js(b, `(() => { const S = __ivy.S; S.owned.${pl} = 1; for (const c of DATA.${list}) S.done[c.id] = 1; S.seasonNo = ${n0} + ${k}; S.sdone = {}; __ivy.save(); __ivy.goPlace('${pl}'); })()`);
        await sleep(800);
        await pic(b, `${pl}-${season}`);
        const parts = await js(b, `[...new Set([...document.querySelectorAll('#scene [data-part]')].map((e) => e.dataset.part))]`);
        const want = await js(b, `DATA.${list}.map((c) => c.part)`);
        for (const p of want) if (!parts.includes(p)) problem(`${pl} (${season}): no part "${p}" in the picture`);
        // the season's mess shows on the picture where a season job waits
        const pend = await js(b, `Object.keys(Object.fromEntries(__ivy.seasonJobs().filter((j) => j.place === '${pl}' && j.part).map((j) => [j.part, 1])))`);
        o[pl + '-' + season] = { jobs: await js(b, `__ivy.seasonJobs().filter((j) => j.place === '${pl}').map((j) => j.name + ' (' + j.family + ')')`), pendingParts: pend, bar: await js(b, `document.querySelector('#restoredTxt').textContent`) };
      }
      await js(b, `(() => { const S = __ivy.S; S.evening = true; __ivy.setHour(21); __ivy.render(); })()`); await sleep(700);
      await pic(b, `${pl}-evening`);
      await js(b, `(() => { __ivy.setHour(null); __ivy.render(); })()`);
      // every decoration on, in winter with the lights up
      await js(b, `(() => { const S = __ivy.S; for (const d of DATA.placeOf('${pl}').decor) S.decor[d.id] = 1; S.seasonNo = ${n0} + 3; S.sdone = {}; for (const j of __ivy.seasonJobs()) S.sdone[j.id] = 1; __ivy.save(); __ivy.render(); })()`); await sleep(700);
      await pic(b, `${pl}-decorated-winter`);
      for (const e of await js(b, 'window.__errs')) problem(`${pl}: page error: ` + e);
    }
    // the pool follows the year, and the restored picture says how
    o.pool = {};
    {
      const n0 = await js(b, `4 * Math.ceil((__ivy.S.seasonNo + 1) / 4)`);
      for (const [k, season, want] of [[1, 'summer', 'full'], [2, 'autumn', 'low'], [3, 'winter', 'rimed'], [4, 'spring', 'scrubbed']]) {
        await js(b, `(() => { const S = __ivy.S; for (const c of DATA.LIDO_CHORES) S.done[c.id] = 1; S.seasonNo = ${n0} + ${k}; S.sdone = {}; __ivy.save(); __ivy.goPlace('lido'); })()`); await sleep(500);
        o.pool[season] = await js(b, `(document.querySelector('#scene [data-part="tiles"]') || { dataset: {} }).dataset.water`);
        if (o.pool[season] !== want) problem(`lido (${season}): the pool is ${o.pool[season]}, not ${want}`);
      }
    }
    // the mosaic is a build job like the others: tiles click in where they are
    // drawn; it is no puzzle and has no card in the puzzle room
    {
      const m = report.mosaic = await js(b, `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        __ivy.goPlace('lido'); __ivy.startLido(DATA.LIDO_CHORES.findIndex((c) => c.id === 'li-mosaic')); await wait(500);
        const sc = __ivy.ENGINE.scene, units = sc.units || [], before = __ivy.ENGINE.progress();
        for (let y = 60; y < 330; y += 14) __ivy.ENGINE.debugStroke(0, y, 360, y);
        await wait(700);
        return { units: units.length, puzzle: !!sc.puzzle, chip: document.querySelector('#toolChip').textContent, before, half: __ivy.ENGINE.progress(), inBeta: DATA.BETA_CHORES.some((c) => c.part === 'mosaic'), minSide: Math.min(...units.map((u) => (u.shape === 'circle' ? u.r * 2 : Math.min(u.w, u.h)))) };
      })()`);
      await pic(b, 'li-mosaic-half');
      if (m.puzzle || m.inBeta) problem('mosaic: it should be a build job, not a puzzle ' + JSON.stringify(m));
      if (m.units < 40 || m.units > 70) problem('mosaic: ' + m.units + ' tiles');
      if (m.minSide < 24) problem('mosaic: a tile only ' + m.minSide + ' across');
      if (!(m.half > m.before)) problem('mosaic: the strokes laid no tiles ' + JSON.stringify(m));
      await js(b, `__ivy.ENGINE.debugFinish()`); await sleep(900);
      const d = await state(b);
      if (!d.done) problem('mosaic: no finish card');
      await pic(b, 'li-mosaic-done');
      await js(b, `document.querySelector('#doneBtn').click()`); await sleep(600);
      await js(b, `__ivy.startLido(DATA.LIDO_CHORES.findIndex((c) => c.id === 'li-chairs'))`); await sleep(700);
      await pic(b, 'li-chairs-start');
      await js(b, `__ivy.ENGINE.debugFinish()`); await sleep(900);
      await pic(b, 'li-chairs-done');
      await js(b, `document.querySelector('#doneBtn').click()`); await sleep(600);
    }
    // the pony's walk has a halter and a lead on the tool button, not a dog
    {
      const lead = report.ponyLead = await js(b, `(async () => {
        const j = (() => { for (let n = 1; n <= 24; n++) { const x = DATA.seasonJobs(n, ['cottage', 'stables']).find((y) => y.base === 'x-st-walk'); if (x) return x; } })();
        __ivy.S.owned.stables = 1; __ivy.goPlace('stables'); __ivy.startJob(j);
        await new Promise((r) => setTimeout(r, 500));
        const chip = document.querySelector('#toolChip canvas').toDataURL();
        return { job: j.name, halter: TOOLS.FAM.walk.tiers.some((t) => TOOLS.icon(t, 38, null, 'halter').toDataURL() === chip) };
      })()`);
      await pic(b, 'pony-lead');
      if (!lead.halter) problem('pony: no halter on the tool button ' + JSON.stringify(lead));
      await js(b, `__ivy.ENGINE.debugFinish()`); await sleep(900);
      await js(b, `document.querySelector('#doneBtn').click()`); await sleep(600);
    }
  }

  // the season budget: with every place restored no season grows past 37
  // jobs, the cottage and the newest place are always awake, the others take
  // turns and never rest three seasons running (two running only from thirteen
  // places on, there is not room for less); with seven places nothing changes
  {
    const bud = report.budget = await js(b, `(() => {
      const all = DATA.PLACES.filter((p) => !p.beta).map((p) => p.id), out = { seasons: [], bad: [] };
      const restRun = {};
      let twoRunning = 0, placeSeasons = 0;
      for (let n = 1; n <= 88; n++) {
        const aw = DATA.awakePlaces(n, all), jobs = DATA.seasonJobs(n, all);
        if (n <= 16) out.seasons.push(n + ': ' + jobs.length + ' jobs, resting ' + all.filter((p) => !aw.includes(p)).join(' '));
        placeSeasons += all.length; twoRunning += all.filter((p) => !aw.includes(p) && restRun[p] === 1).length;
        if (jobs.length > DATA.SEASON_BUDGET) out.bad.push('season ' + n + ' has ' + jobs.length + ' jobs');
        if (!aw.includes('cottage') || !aw.includes(all[all.length - 1])) out.bad.push('season ' + n + ': the cottage or the newest place is resting');
        for (const p of all) { restRun[p] = aw.includes(p) ? 0 : (restRun[p] || 0) + 1; if (restRun[p] > 2) out.bad.push(p + ' rests three seasons running (' + n + ')'); }
        for (const p of aw) if (!jobs.some((j) => j.place === p)) out.bad.push('season ' + n + ': ' + p + ' is awake with no jobs');
        const per = {}; for (const j of jobs) per[j.place] = per[j.place] || { think: 0, craft: 0 }, j.family in per[j.place] && per[j.place][j.family]++;
        for (const [p, c] of Object.entries(per)) if (c.think > 1 || c.craft > 1) out.bad.push('season ' + n + ': ' + p + ' has ' + JSON.stringify(c));
      }
      out.restTwoRunning = twoRunning + ' of ' + placeSeasons + ' place-seasons over 88 seasons';
      const twelve = all.slice(0, 12), run12 = {};
      for (let n = 1; n <= 48; n++) { const aw = DATA.awakePlaces(n, twelve); for (const p of twelve) { run12[p] = aw.includes(p) ? 0 : (run12[p] || 0) + 1; if (run12[p] > 1) out.bad.push('twelve places: ' + p + ' rests two seasons running (' + n + ')'); } }
      const seven = all.slice(0, 7);
      for (let n = 1; n <= 8; n++) if (DATA.awakePlaces(n, seven).length !== 7) out.bad.push('seven places: season ' + n + ' rests a place');
      return out;
    })()`);
    for (const x of bud.bad) problem('budget: ' + x);
    // a resting place says so and points round the village
    await js(b, `(() => { const S = __ivy.S; const all = DATA.PLACES.filter((p) => !p.beta); for (const p of all) { S.owned[p.id] = 1; for (const c of p.chores) S.done[c.id] = 1; } S.seasonNo = 3; S.sdone = {}; __ivy.save(); })()`);
    const quiet = await js(b, `DATA.PLACES.filter((p) => !p.beta).map((p) => p.id).find((p) => __ivy.resting(p))`);
    if (!quiet) problem('budget: no place rests in season 3 with every place restored');
    else {
      await js(b, `__ivy.goPlace('${quiet}')`); await sleep(800);
      bud.resting = await js(b, `({ place: '${quiet}', bar: document.querySelector('#restoredTxt').textContent, next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' '), again: (__ivy.openJobs(), [...document.querySelectorAll('.jGo')].filter((x) => /Again/.test(x.textContent)).length) })`);
      await js(b, `document.querySelector('#sheet').classList.remove('on')`);
      if (!/^All quiet at .* this winter$/.test(bud.resting.bar)) problem('budget: a resting place does not say so: ' + bud.resting.bar);
      if (!bud.resting.again) problem('budget: the jobs of a resting place cannot be played again');
      await pic(b, 'resting-place');
    }
    await js(b, `__ivy.openPlaces()`); await sleep(800);
    bud.places = await js(b, `[...document.querySelectorAll('.placeCard')].map((c) => (c.querySelector('.jobDot') ? '• ' : '  ') + c.querySelector('.pName').textContent.trim() + ' | ' + c.querySelector('.pSub').textContent.slice(0, 44))`);
    const dots = bud.places.filter((t) => t.startsWith('•')).length;
    if (dots < 2 || dots > 7) problem('budget: the places list has ' + dots + ' places with a dot');
    await pic(b, 'places-budget');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
  }

  // a place with nothing left to do this season has a little life of its own;
  // with jobs waiting it has none
  {
    const life = report.rest = {};
    for (const pl of ['cottage', 'canal', 'rescue', 'stables', 'loft', 'observatory', 'lido']) {
      await js(b, `(() => { const S = __ivy.S; S.seasonNo = 9; S.sdone = {}; __ivy.save(); __ivy.goPlace('${pl}'); })()`); await sleep(400);
      const busy = await js(b, `__ivy.seasonJobs().some((j) => j.place === '${pl}') ? document.querySelectorAll('#scene .rest').length : null`);
      await js(b, `(() => { const S = __ivy.S; for (const j of __ivy.seasonJobs()) if (j.place === '${pl}') S.sdone[j.id] = 1; __ivy.save(); __ivy.render(); })()`); await sleep(400);
      const idle = await js(b, `document.querySelectorAll('#scene .rest').length`);
      life[pl] = { busy, idle };
      if (busy) problem(`rest: ${pl} shows its little life with jobs waiting`);
      if (!idle) problem(`rest: ${pl} has no little life with nothing to do`);
      await pic(b, `rest-${pl}`);
    }
  }

  // the walk round the village: "jobs are waiting at" names the next place
  // after the one you are at, not the first in the list
  {
    const w = report.walk = {};
    await js(b, `(() => { const S = __ivy.S; S.seasonNo = 8; S.sdone = {}; for (const j of __ivy.seasonJobs()) if (['cottage', 'cafe', 'glasshouse'].includes(j.place)) S.sdone[j.id] = 1; __ivy.save(); __ivy.goPlace('glasshouse'); })()`); await sleep(700);
    w.fromGlasshouse = await js(b, `({ next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' '), want: __ivy.nextPlaceWithJobs('glasshouse').name })`);
    const wantGlass = await js(b, `(() => { const ids = DATA.PLACES.filter((p) => !p.beta).map((p) => p.id); const aw = DATA.awakePlaces(8, ids); return DATA.placeOf(ids.slice(ids.indexOf('glasshouse') + 1).concat(ids).find((p) => aw.includes(p) && !['cottage', 'cafe', 'glasshouse'].includes(p))).name; })()`);
    if (!w.fromGlasshouse.next.includes(wantGlass)) problem(`walk: from the glasshouse it should point to ${wantGlass}: ${w.fromGlasshouse.next}`);
    // jobs left only at the first two awake places before the station: the way
    // on goes past the end of the list and round to the first of them
    const left = await js(b, `(() => { const S = __ivy.S, ids = DATA.PLACES.filter((p) => !p.beta).map((p) => p.id), aw = DATA.awakePlaces(8, ids);
      const left = ids.slice(0, ids.indexOf('halt')).filter((p) => aw.includes(p)).slice(0, 2);
      S.sdone = {}; for (const j of __ivy.seasonJobs()) if (!left.includes(j.place)) S.sdone[j.id] = 1;
      __ivy.save(); __ivy.goPlace('halt'); return left.map((p) => DATA.placeOf(p).name); })()`); await sleep(700);
    w.fromHalt = await js(b, `document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ')`);
    if (!w.fromHalt.includes(left[0])) problem(`walk: from the station it should go round to ${left[0]}: ${w.fromHalt}`);
  }

  // the evening: after nine the thinking jobs come last; "Done for now" ends
  // with Goodnight; the title offers "Just one job", which ends on a green Done for now
  {
    const ev = report.evening = {};
    ev.order = await js(b, `(() => { const S = __ivy.S; S.sdone = {};
      for (let n = 1; n <= 24; n++) { S.seasonNo = n; const js = __ivy.seasonJobs().filter((j) => j.place === 'halt'); if (js.some((j) => j.family === 'think') && js[0].family === 'think') {
        __ivy.setHour(15); const day = __ivy.nextChore('halt').family; __ivy.setHour(21); const late = __ivy.nextChore('halt').family;
        const lateList = []; for (const j of js) { const k = __ivy.nextChore('halt'); lateList.push(k.family); S.sdone[k.id] = 1; } S.sdone = {}; __ivy.setHour(null);
        return { season: n, day, late, lateList }; } } return null; })()`);
    if (!ev.order) problem('evening: no season starts the station with a thinking job');
    else {
      if (ev.order.day !== 'think' || ev.order.late === 'think') problem('evening: the thinking job does not move last after nine ' + JSON.stringify(ev.order));
      const t = ev.order.lateList.indexOf('think');
      if (t < 0 || ev.order.lateList.slice(t).some((f) => f !== 'think')) problem('evening: a thinking job was skipped or not last ' + JSON.stringify(ev.order.lateList));
    }
    // Goodnight
    await js(b, `(() => { const S = __ivy.S; S.goodnight = true; S.seasonNo = 9; S.sdone = {}; __ivy.save(); __ivy.setHour(21); __ivy.goPlace('pottery'); })()`); await sleep(700);
    await js(b, `__ivy.openPause(); document.querySelector('#pauseStop').click()`); await sleep(1600);
    ev.goodnight = await js(b, `({ on: document.querySelector('#goodnight').classList.contains('on'), lights: +document.querySelector('#goodnight').dataset.lights, next: document.querySelector('#goodnight .gnNext').textContent })`);
    await pic(b, 'goodnight-1');
    await sleep(2400);
    ev.goodnight.dark = await js(b, `document.querySelectorAll('#goodnight .gnOff').length`);
    await pic(b, 'goodnight-2');
    await sleep(3200);
    ev.goodnight.title = await js(b, `document.querySelector('#title').classList.contains('on') && !document.querySelector('#goodnight').classList.contains('on')`);
    if (!ev.goodnight.on || !ev.goodnight.lights || !ev.goodnight.dark || !ev.goodnight.title || !/^Next time: /.test(ev.goodnight.next)) problem('evening: Goodnight ' + JSON.stringify(ev.goodnight));
    // switched off in Settings: the old goodbye line instead
    await js(b, `(() => { __ivy.S.goodnight = false; document.querySelector('#title').click(); })()`); await sleep(700);
    await js(b, `__ivy.openPause(); document.querySelector('#pauseStop').click()`); await sleep(900);
    ev.off = await js(b, `({ goodnight: document.querySelector('#goodnight').classList.contains('on'), bye: document.querySelector('.pauseBye').textContent })`);
    if (ev.off.goodnight || !/Sleep well/.test(ev.off.bye)) problem('evening: Goodnight switched off still shows ' + JSON.stringify(ev.off));
    await sleep(5400);
    // Just one job: a fresh page in the evening
    await js(b, `(() => { const S = JSON.parse(JSON.stringify(__ivy.S)); S.goodnight = true; S.place = 'halt'; sessionStorage.setItem('ivy-test-save', JSON.stringify(S)); location.reload(); })()`);
    await sleep(600);
    for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
    await js(b, `__ivy.setHour(20); __ivy.renderTitle()`); await sleep(300);
    ev.justOne = { shown: await js(b, `!document.querySelector('#justOne').hidden`), want: await js(b, `(__ivy.oneJob() || {}).n && __ivy.oneJob().n.id`) };
    await pic(b, 'title-just-one-job');
    await js(b, `document.querySelector('#justOne').click()`); await sleep(1000);
    ev.justOne.started = await js(b, `({ play: document.querySelector('#play').classList.contains('on'), title: document.querySelector('#playTitle').textContent })`);
    await js(b, `__ivy.finish()`); await sleep(1600);
    ev.justOne.finish = await js(b, `({ stop: document.querySelector('#doneStop').className, back: document.querySelector('#doneBtn').className })`);
    if (!ev.justOne.shown || !ev.justOne.started.play || ev.justOne.finish.stop !== 'go' || ev.justOne.finish.back !== 'go soft') problem('evening: Just one job ' + JSON.stringify(ev.justOne));
    await pic(b, 'just-one-job-done');
    await js(b, `document.querySelector('#doneBtn').click()`); await sleep(600);
    await js(b, `__ivy.setHour(null)`);
  }

  // an older save meets v22: a save from v21 (restoredAt kept, no goodnight
  // setting) keeps its waits; a save from before v21 waits a year for the pottery
  {
    const old = report.olderV22 = {};
    await js(b, `(() => { const S = JSON.parse(JSON.stringify(__ivy.S));
      delete S.goodnight; S.owned = { cottage: 1, beta: 1 }; S.done = {}; S.decor = {};
      for (const p of DATA.PLACES) if (['cottage', 'cafe', 'cove', 'rescue', 'glasshouse', 'canal', 'books'].includes(p.id)) { S.owned[p.id] = 1; for (const c of p.chores) S.done[c.id] = 1; }
      S.seasonNo = 30; S.sdone = {}; S.coins = 95000; S.place = 'books'; S.wips = {}; S.pauses = false; S.restoredAt = { cottage: 0, cafe: 1, cove: 3, rescue: 6, glasshouse: 12, canal: 18, books: 28 };
      sessionStorage.setItem('ivy-test-save', JSON.stringify(S)); location.reload(); })()`);
    await sleep(600);
    for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
    await js(b, `document.querySelector('#title').click()`); await sleep(800);
    old.v21 = await js(b, `({ goodnight: __ivy.S.goodnight, place: __ivy.S.place, bar: document.querySelector('#restoredTxt').textContent })`);
    await js(b, `__ivy.openPlaces()`); await sleep(800);
    old.v21.pottery = await card('Kiln Lane'); old.v21.halt = await card('Halfpenny');
    if (old.v21.goodnight !== true) problem('older save: goodnight is not on by default');
    if (!old.v21.pottery || old.v21.pottery.buy || !old.v21.pottery.opens.some((t) => /2 seasons to go/.test(t))) problem('older save (v21): the pottery should wait two more seasons ' + JSON.stringify(old.v21.pottery));
    await pic(b, 'older-save-v21');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
    await js(b, `(() => { const S = JSON.parse(JSON.stringify(__ivy.S)); delete S.restoredAt; delete S.oldWaits; delete S.goodnight; S.seasonNo = 30; S.coins = 95000;
      sessionStorage.setItem('ivy-test-save', JSON.stringify(S)); location.reload(); })()`);
    await sleep(600);
    for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
    await js(b, `document.querySelector('#title').click()`); await sleep(800);
    await js(b, `__ivy.openPlaces()`); await sleep(800);
    old.v20 = { oldWaits: await js(b, '__ivy.S.oldWaits'), pottery: await card('Kiln Lane') };
    if (!old.v20.oldWaits || !old.v20.pottery || old.v20.pottery.buy || !old.v20.pottery.opens.some((t) => /4 seasons to go/.test(t))) problem('older save (before v21): the pottery should wait a year from now ' + JSON.stringify(old.v20));
    await pic(b, 'older-save-v20');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
  }

  // an older save meets v23: a save from v22 (the station restored three seasons
  // ago) waits one more season for the bead shop; the curiosity shop waits for it
  {
    const old = report.olderV23 = {};
    await js(b, `(() => { const S = JSON.parse(JSON.stringify(__ivy.S));
      S.owned = { cottage: 1, beta: 1 }; S.done = {}; S.decor = {}; S.finds = {};
      for (const p of DATA.PLACES) if (!p.beta && !['beads', 'curio', 'stables', 'loft', 'observatory', 'lido'].includes(p.id)) { S.owned[p.id] = 1; for (const c of p.chores) S.done[c.id] = 1; }
      S.seasonNo = 40; S.sdone = {}; S.coins = 105000; S.place = 'halt'; S.wips = {}; S.pauses = false;
      S.restoredAt = { cottage: 0, cafe: 1, cove: 3, rescue: 6, glasshouse: 12, canal: 18, books: 28, pottery: 32, halt: 37 }; delete S.oldWaits;
      sessionStorage.setItem('ivy-test-save', JSON.stringify(S)); location.reload(); })()`);
    await sleep(600);
    for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
    await js(b, `document.querySelector('#title').click()`); await sleep(800);
    await js(b, `__ivy.openPlaces()`); await sleep(800);
    old.v22 = { beads: await card('Button & Bead'), curio: await card('Curiosities'), oldWaits: await js(b, '!!__ivy.S.oldWaits') };
    if (!old.v22.beads || old.v22.beads.buy || !old.v22.beads.opens.some((t) => /1 season to go/.test(t))) problem('older save (v22): the bead shop should wait one more season ' + JSON.stringify(old.v22.beads));
    if (!old.v22.curio || old.v22.curio.buy || !old.v22.curio.opens.some((t) => /A year after that/.test(t))) problem('older save (v22): the curiosity shop should wait a year after the bead shop ' + JSON.stringify(old.v22.curio));
    await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => c.textContent.includes('Button & Bead')).scrollIntoView({ block: 'center' })`); await sleep(300);
    await pic(b, 'older-save-v22');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
    // the Finds shelf, folded by place: only the place she is at is open
    await js(b, `(() => { const S = __ivy.S; for (const c of DATA.HALT_CHORES.slice(0, 5)) S.finds[c.id] = 1; S.finds['lawn-patch'] = 1; __ivy.save(); __ivy.openFinds(); })()`); await sleep(600);
    const f = report.finds = await js(b, `({ folds: [...document.querySelectorAll('.findsFold')].map((x) => ({ key: x.dataset.fold, open: x.classList.contains('open'), line: x.querySelector('.findsHead').innerText.replace(/\\s+/g, ' ') })) })`);
    const openNow = f.folds.filter((x) => x.open).map((x) => x.key);
    if (openNow.length !== 1 || openNow[0] !== 'halt') problem('finds: only the station should be open, open: ' + openNow.join(' '));
    const haltLine = (f.folds.find((x) => x.key === 'halt') || {}).line || '';
    if (!/5 of 15/.test(haltLine)) problem('finds: the station line does not count 5 of 15: ' + haltLine);
    if (f.folds.some((x) => !/\d+ of \d+/.test(x.line))) problem('finds: a place without its count line');
    await pic(b, 'finds-folded');
    await js(b, `[...document.querySelectorAll('.findsFold')].find((x) => x.dataset.fold === 'cottage').querySelector('.findsHead').click()`); await sleep(300);
    f.afterTap = await js(b, `[...document.querySelectorAll('.findsFold.open')].map((x) => x.dataset.fold)`);
    if (!f.afterTap.includes('cottage') || !f.afterTap.includes('halt')) problem('finds: tapping the cottage did not open it ' + f.afterTap.join(' '));
    f.cottageCells = await js(b, `document.querySelectorAll('.findsFold[data-fold="cottage"] .find').length`);
    if (f.cottageCells !== 20) problem('finds: the cottage shelf has ' + f.cottageCells + ' keepsakes, not 20');
    await pic(b, 'finds-two-open');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
  }

  // an older save meets v24: a save from v23 (the curiosity shop restored three
  // seasons ago) keeps its numbers, waits one more season for the stables, and the
  // loft waits a year after them; a save from before the rule waits as well
  {
    const old = report.olderV24 = {};
    const plant = (more) => js(b, `(() => { const S = JSON.parse(JSON.stringify(__ivy.S));
      S.owned = { cottage: 1, beta: 1 }; S.done = {}; S.decor = {}; S.finds = {};
      for (const p of DATA.PLACES) if (!p.beta && !['stables', 'loft', 'observatory', 'lido'].includes(p.id)) { S.owned[p.id] = 1; for (const c of p.chores) S.done[c.id] = 1; }
      S.seasonNo = 50; S.sdone = {}; S.coins = 125000; S.place = 'curio'; S.wips = {}; S.pauses = false; delete S.board; delete S.painted;
      S.restoredAt = { cottage: 0, cafe: 1, cove: 3, rescue: 6, glasshouse: 12, canal: 18, books: 28, pottery: 32, halt: 37, beads: 42, curio: 47 }; delete S.oldWaits; ${more}
      sessionStorage.setItem('ivy-test-save', JSON.stringify(S)); location.reload(); })()`);
    const land = async () => {
      await sleep(600);
      for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
      await js(b, `document.querySelector('#title').click()`); await sleep(800);
      await js(b, `__ivy.openPlaces()`); await sleep(800);
    };
    await plant(''); await land();
    old.v23 = { coins: await js(b, '__ivy.S.coins'), board: await js(b, '__ivy.S.board'), painted: await js(b, '__ivy.S.painted'), stables: await card('Foxglove'), loft: await card('Loft'), jobs: await js(b, `__ivy.seasonJobs().length`) };
    if (old.v23.coins !== 125000) problem('older save (v23): the coins changed to ' + old.v23.coins);
    if (old.v23.board !== 'think' || !old.v23.painted) problem('older save (v23): no board or painted field ' + JSON.stringify([old.v23.board, old.v23.painted]));
    if (!old.v23.stables || old.v23.stables.buy || !old.v23.stables.opens.some((t) => /1 season to go/.test(t))) problem('older save (v23): the stables should wait one more season ' + JSON.stringify(old.v23.stables));
    if (!old.v23.loft || old.v23.loft.buy || !old.v23.loft.opens.some((t) => /A year after that/.test(t))) problem('older save (v23): the loft should wait a year after the stables ' + JSON.stringify(old.v23.loft));
    await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => c.textContent.includes('Foxglove')).scrollIntoView({ block: 'center' })`); await sleep(300);
    await pic(b, 'older-save-v23');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
    await plant('S.oldWaits = true;'); await land();
    old.oldWaits = { stables: await card('Foxglove') };
    if (!old.oldWaits.stables || old.oldWaits.stables.buy) problem('older save (before the rule): the stables should wait too ' + JSON.stringify(old.oldWaits));
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
  }

  // an older save meets v25: a save from v24 (the loft restored three seasons
  // ago) keeps its numbers, waits one more season for the observatory, and the
  // lido waits a year after it; a save from before the rule waits as well
  {
    const old = report.olderV25 = {};
    const plant = (more) => js(b, `(() => { const S = JSON.parse(JSON.stringify(__ivy.S));
      S.owned = { cottage: 1, beta: 1 }; S.done = {}; S.decor = {}; S.finds = {};
      for (const p of DATA.PLACES) if (!p.beta && !['observatory', 'lido'].includes(p.id)) { S.owned[p.id] = 1; for (const c of p.chores) S.done[c.id] = 1; }
      S.seasonNo = 60; S.sdone = {}; S.coins = 135000; S.place = 'loft'; S.wips = {}; S.pauses = false;
      S.restoredAt = { cottage: 0, cafe: 1, cove: 3, rescue: 6, glasshouse: 12, canal: 18, books: 28, pottery: 32, halt: 37, beads: 42, curio: 47, stables: 52, loft: 57 }; delete S.oldWaits; ${more}
      sessionStorage.setItem('ivy-test-save', JSON.stringify(S)); location.reload(); })()`);
    const land = async () => {
      await sleep(600);
      for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
      await js(b, `document.querySelector('#title').click()`); await sleep(800);
      await js(b, `__ivy.openPlaces()`); await sleep(800);
    };
    await plant(''); await land();
    old.v24 = { coins: await js(b, '__ivy.S.coins'), done: await js(b, 'Object.keys(__ivy.S.done).length'), observatory: await card('Owl Hill'), lido: await card('Lido'), jobs: await js(b, `__ivy.seasonJobs().length`) };
    if (old.v24.coins !== 135000) problem('older save (v24): the coins changed to ' + old.v24.coins);
    if (!old.v24.observatory || old.v24.observatory.buy || !old.v24.observatory.opens.some((t) => /1 season to go/.test(t))) problem('older save (v24): the observatory should wait one more season ' + JSON.stringify(old.v24.observatory));
    if (!old.v24.lido || old.v24.lido.buy || !old.v24.lido.opens.some((t) => /A year after that/.test(t))) problem('older save (v24): the lido should wait a year after the observatory ' + JSON.stringify(old.v24.lido));
    await js(b, `[...document.querySelectorAll('.placeCard')].find((c) => c.textContent.includes('Owl Hill')).scrollIntoView({ block: 'center' })`); await sleep(300);
    await pic(b, 'older-save-v24');
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
    await plant('S.oldWaits = true;'); await land();
    old.oldWaits = { observatory: await card('Owl Hill') };
    if (!old.oldWaits.observatory || old.oldWaits.observatory.buy) problem('older save (before the rule): the observatory should wait too ' + JSON.stringify(old.oldWaits));
    await js(b, `document.querySelector('#sheet').classList.remove('on')`);
  }
  } // everything but the money

  // the money: jobs a season and coins a year with 7, 9, 11, 13, 15 and 17 places,
  // and whether the coins are there for each new place when its wait is over
  {
    report.economy = await js(b, `(() => {
      const pay = (j) => j.value * (j.puzzle ? 1.25 : 1.4); // + finishing bonus, + coin stashes on tool jobs
      const ids = DATA.PLACES.filter((p) => !p.beta).map((p) => p.id), out = { note: 'a year from season 17, every job done once; tool jobs pay value x1.4 (bonus and stashes), puzzles x1.25' };
      // the real seasons of the places that exist
      const year = (pl) => { let coins = 0; for (let n = 17; n < 21; n++) coins += DATA.seasonJobs(n, pl).reduce((a, j) => a + pay(j), 0); return Math.round(coins); };
      // and the same for places still to come, counted by the budget: every awake
      // place's jobs at the season's pay (x1.37, a mix of tool jobs and puzzles)
      const extra = (k) => ids.concat(Array.from({ length: Math.max(0, k - ids.length) }, (_, i) => 'place' + (ids.length + i + 1))).slice(0, k);
      const estimate = (pl) => { let coins = 0; const jobs = [], awake = [];
        for (let n = 17; n < 21; n++) { const aw = DATA.awakePlaces(n, pl); let c = 0;
          for (const p of aw) for (let i = 0; i < (DATA.PER_SEASON[p] || 5); i++) c += DATA.seasonValue(n, i, pl.length) * 1.37;
          coins += c; awake.push(aw.length); jobs.push(aw.reduce((a, p) => a + (DATA.PER_SEASON[p] || 5), 0)); }
        return { jobsPerSeason: jobs, awakePlaces: awake, coinsPerYear: Math.round(coins) }; };
      out.places = Object.fromEntries([7, 9, 11, 13, 15, 17].map((k) => [k, estimate(extra(k))]));
      out.places['9'].coinsPerYearPlayed = year(ids.slice(0, 9));
      out.places['11'].coinsPerYearPlayed = year(ids.slice(0, 11));
      out.places['13'].coinsPerYearPlayed = year(ids.slice(0, 13));
      out.places['15'].coinsPerYearPlayed = year(ids);
      out.opening = {};
      for (const id of ['pottery', 'halt', 'beads', 'curio', 'stables', 'loft', 'observatory', 'lido']) {
        const p = DATA.placeOf(id), prev = DATA.placeOf(p.needs), before = ids.slice(0, ids.indexOf(prev.id) + 1);
        const restore = Math.round(prev.chores.reduce((a, c) => a + pay(c), 0)), y = year(before);
        const fams = [...new Set(prev.chores.map((c) => c.family))].filter((f) => !TOOLS.FAM[f].hands);
        const tools = (pl, fs, tiers) => fs.reduce((a, f) => a + tiers.reduce((b, t) => b + (TOOLS.FAM[f].tiers[t] ? DATA.toolCost(f, t, pl) : 0), 0), 0);
        const decorHalf = prev.decor.filter((_, i) => i % 2 === 0).reduce((a, d) => a + d.cost, 0);
        const typical = decorHalf + tools(prev.id, fams, [1]);
        const noSpend = restore + y;
        const famsNew = [...new Set(p.chores.map((c) => c.family))].filter((f) => !TOOLS.FAM[f].hands);
        out.opening[id] = { price: p.price, toolPrice: p.toolPrice, restoreBefore: restore, yearOfSeasons: y, coinsWhenOpen: noSpend, priceShareOfYear: +(p.price / y).toFixed(2),
          typicalSpend: typical, typicalSpendIs: 'every other decoration at ' + prev.short + ' and the second tool of each kind there',
          shortWithSpend: Math.max(0, p.price - (noSpend - typical)), oneSeason: Math.round(y / 4),
          fullToolsetHere: tools(id, famsNew, [1, 2, 3, 4]), halfYear: Math.round(y / 2) };
      }
      return out;
    })()`);
    for (const [id, e] of Object.entries(report.economy.opening)) {
      if (e.coinsWhenOpen < e.price) problem(`economy: ${id} costs ${e.price}, only ${e.coinsWhenOpen} by the time it opens`);
      if (e.shortWithSpend > e.oneSeason) problem(`economy: ${id} is more than a season out of reach with typical spending (${e.shortWithSpend} short)`);
    }
    for (const [k, v] of Object.entries(report.economy.places)) if (v.jobsPerSeason.some((n) => n > 37)) problem(`economy: ${k} places have a season over 37 jobs`);
    // the music for the new places renders
    report.music = await js(b, `(async () => ({ pottery: await AUDIO.debugRender({ place: 'pottery', season: 'summer' }, 12), halt: await AUDIO.debugRender({ place: 'halt', season: 'winter', night: true }, 12),
      beads: await AUDIO.debugRender({ place: 'beads', season: 'spring' }, 12), curio: await AUDIO.debugRender({ place: 'curio', season: 'autumn' }, 12),
      curioIntro: await AUDIO.debugRender({ place: 'curio', season: 'winter', cycle: 0 }, 8),
      stables: await AUDIO.debugRender({ place: 'stables', season: 'summer' }, 12), stablesIntro: await AUDIO.debugRender({ place: 'stables', season: 'autumn', cycle: 0 }, 8),
      loft: await AUDIO.debugRender({ place: 'loft', season: 'spring' }, 12), loftNight: await AUDIO.debugRender({ place: 'loft', season: 'winter', night: true }, 12),
      observatory: await AUDIO.debugRender({ place: 'observatory', season: 'winter' }, 16), observatoryNight: await AUDIO.debugRender({ place: 'observatory', season: 'autumn', night: true }, 16),
      lido: await AUDIO.debugRender({ place: 'lido', season: 'summer' }, 12), lidoIntro: await AUDIO.debugRender({ place: 'lido', season: 'spring', cycle: 0 }, 8) }))()`);
    for (const [k, v] of Object.entries(report.music)) if (!(v.peak > 0.005)) problem(`music: ${k} is silent (${JSON.stringify(v)})`);
    // the observatory's tune is the slowest and the deepest of them all
    const tunes = report.tunes = await js(b, 'AUDIO.debugTunes()');
    for (const [k, t] of Object.entries(tunes)) if (k !== 'observatory' && (t.bpm <= tunes.observatory.bpm || t.depth > tunes.observatory.depth)) problem(`music: ${k} is as slow or as deep as the observatory ${JSON.stringify(t)}`);
  }

  // every other job, straight through
  if (!economyOnly) report.regression = await js(b, `(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const jobs = [...DATA.CHORES, ...DATA.CAFE_CHORES, ...DATA.COVE_CHORES, ...DATA.RESCUE_CHORES, ...DATA.GLASS_CHORES, ...DATA.CANAL_CHORES, ...DATA.BOOK_CHORES, ...DATA.POTTERY_CHORES, ...DATA.HALT_CHORES, ...DATA.BEAD_CHORES, ...DATA.CURIO_CHORES, ...DATA.STABLE_CHORES, ...DATA.LOFT_CHORES, ...DATA.OBSERVATORY_CHORES, ...DATA.LIDO_CHORES];
    for (let n = 1; n <= 8; n++) jobs.push(...DATA.seasonJobs(n, ['cottage', 'cafe', 'cove', 'rescue', 'glasshouse', 'canal', 'books']));
    for (let n = 1; n <= 12; n++) jobs.push(...DATA.seasonJobs(n, ['cottage', 'cafe', 'cove', 'rescue', 'glasshouse', 'canal', 'books', 'pottery', 'halt']));
    for (let n = 1; n <= 12; n++) jobs.push(...DATA.seasonJobs(n, DATA.PLACES.filter((p) => !p.beta).map((p) => p.id)));
    // every seasonal job of the eight newest places at least once
    for (const pl of ['pottery', 'halt', 'beads', 'curio', 'stables', 'loft', 'observatory', 'lido']) for (let n = 1; n <= 16; n++) jobs.push(...DATA.seasonJobs(n, ['cottage', pl]).filter((j) => j.place === pl));
    const bad = [];
    for (const j of jobs) {
      try {
        __ivy.startJob(j); await wait(20);
        if (!(__ivy.ENGINE.progress() < 1)) bad.push(j.id + ' starts done');
        __ivy.ENGINE.debugFinish();
        if (!Number.isFinite(__ivy.S.coins)) bad.push(j.id + ' coins ' + __ivy.S.coins);
        if (!document.querySelector('#doneOverlay').classList.contains('on')) bad.push(j.id + ' no finish card');
        document.querySelector('#doneBtn').click();
      } catch (e) { bad.push(j.id + ': ' + e.message); }
    }
    return { jobs: jobs.length, bad };
  })()`, 30 * 60000);
  for (const s of (report.regression || { bad: [] }).bad) problem('regression: ' + s);
  const errs = await js(b, 'window.__errs');
  for (const e of errs) problem('page error: ' + e);
} catch (e) { problem('game test: ' + e.message); }
finally { b.close(); }

console.log(JSON.stringify(report, null, 1));
process.exit(report.problems.length ? 1 : 0);
