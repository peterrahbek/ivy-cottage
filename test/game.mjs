#!/usr/bin/env node
// Plays the real game in headless Chrome on an iPhone-sized screen, from a
// fresh save and offline: every puzzle in the puzzle room with real touches
// (half, leave, come back, finish; then once more from the jobs list for a
// new layout), the puzzle room's screens, the puzzles out in the places
// (started from the next-job card, as she would), an older save meeting the
// new jobs, the glasshouse in every season, and every other job in the game
// straight through. Prints a JSON report; pictures go to --out.
//
//   node test/game.mjs [--out dir]

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
  await b.send('Page.navigate', { url: pathToFileURL(join(root, 'index.html')).href });
  for (let i = 0; i < 100 && !(await js(b, '!!(window.__ivy && document.readyState === "complete")').catch(() => false)); i++) await sleep(100);
  await js(b, `document.querySelector('#title').click()`); await sleep(800);
  // the cottage's next-job card still gets its little picture of the mess
  const thumb = await js(b, `(document.querySelector('#nextCard .nextPic img') || {}).src || ''`);
  if (!thumb.startsWith('data:image/jpeg')) problem('no picture on the cottage next-job card');
  await js(b, `__ivy.S.pauses = false; __ivy.goPlace('beta')`); await sleep(1500);
  const bthumb = await js(b, `(document.querySelector('#nextCard .nextPic img') || {}).src || ''`);
  if (!bthumb.startsWith('data:image/jpeg')) problem('no picture on the puzzle room next-job card');
  report.screens.homeBefore = await js(b, `({ brand: document.querySelector('#brandName').textContent, bar: document.querySelector('#restoredTxt').textContent, next: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' ') })`);
  await pic(b, 'home-beta-before');

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
  for (const id of ['cafe-cups', 'rescue-feed', 'rescue-beds', 'gh-water', 'gh-cutting']) {
    const c = await js(b, `(() => { const c = DATA.PLACES.flatMap((p) => p.chores).find((x) => x.id === '${id}'); return c && { place: c.place, index: c.index, value: c.value, puzzle: !!c.puzzle, family: c.family }; })()`);
    if (!c) { problem(`${id}: not in any place`); continue; }
    if (!c.puzzle || c.family !== 'think') problem(`${id}: not a puzzle in its place`);
    await js(b, `(() => { const S = __ivy.S, p = DATA.placeOf('${c.place}'); S.owned['${c.place}'] = 1; for (const x of p.chores) { if (x.index < ${c.index}) S.done[x.id] = 1; else delete S.done[x.id]; delete S.wips[x.id]; } __ivy.save(); __ivy.goPlace('${c.place}'); })()`);
    await sleep(1200);
    const card = await js(b, `({ job: document.querySelector('#nextCard').dataset.job, text: document.querySelector('#nextCard').innerText.replace(/\\s+/g, ' '), pic: !!(document.querySelector('#nextCard .nextPic img') || {}).src })`);
    if (card.job !== id) problem(`${id}: the next-job card shows ${card.job}`);
    await pic(b, `placed-${id}-home`);
    const coins0 = await js(b, '__ivy.S.coins');
    await js(b, `document.querySelector('#goBtn').click()`); await sleep(900);
    const hud = await js(b, `({ chip: document.querySelector('#toolChip').textContent, bots: document.querySelector('#btnBots').hidden, hint: document.querySelector('#hint span').textContent, puzzle: !!__ivy.ENGINE.scene.puzzle })`);
    if (!hud.puzzle || !hud.chip.includes('Hint') || !hud.bots) problem(`${id}: does not play as a puzzle (${JSON.stringify(hud)})`);
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

  // an older save with the café restored and the year turning: the new job
  // turns up at the café and the other places point there
  {
    await js(b, `(() => { const S = __ivy.S;
      for (const p of DATA.PLACES) if (!p.beta && p.id !== 'glasshouse') { S.owned[p.id] = 1; for (const c of p.chores) S.done[c.id] = 1; }
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
    await js(b, `(() => { const S = __ivy.S; for (const p of DATA.PLACES) if (!p.beta) for (const c of p.chores) S.done[c.id] = 1; for (const c of DATA.GLASS_CHORES) delete S.done[c.id]; delete S.owned.glasshouse; S.coins = 50000; S.seasonNo = 0; S.sdone = {}; __ivy.save(); __ivy.openPlaces(); })()`);
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

  // every other job, straight through
  report.regression = await js(b, `(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const jobs = [...DATA.CHORES, ...DATA.CAFE_CHORES, ...DATA.COVE_CHORES, ...DATA.RESCUE_CHORES, ...DATA.GLASS_CHORES];
    for (let n = 1; n <= 8; n++) jobs.push(...DATA.seasonJobs(n, ['cottage', 'cafe', 'cove', 'rescue', 'glasshouse']));
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
  })()`);
  for (const s of report.regression.bad) problem('regression: ' + s);
  const errs = await js(b, 'window.__errs');
  for (const e of errs) problem('page error: ' + e);
} catch (e) { problem('game test: ' + e.message); }
finally { b.close(); }

console.log(JSON.stringify(report, null, 1));
process.exit(report.problems.length ? 1 : 0);
