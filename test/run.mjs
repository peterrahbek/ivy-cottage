#!/usr/bin/env node
// Plays a puzzle scene (or draws a place picture) in headless Chrome and
// prints a JSON report; screenshots go to --out (default: a new temp folder).
//
//   node test/run.mjs puzzle js/pz-cups.js cups [--seeds 12] [--opts '{"where":"pottery"}'] [--out dir]
//   node test/run.mjs place js/beta.js BETA cups,feed,hose,beds [--out dir]
//   node test/run.mjs scene stones '{"shape":"yard"}' [--seed 5] [--out dir]
//
// The puzzle run checks the contract in js/puzzles.js: seed 1 is played with
// real touches through Chrome's input (half, then saved, loaded into a fresh
// page and finished), with pictures along the way; seeds 2..n are played
// with synthetic pointer events, and every one must start unsolved and end
// solved with exactly `steps` payments.

import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch, js, shot as shotTo, sleep, swipe, phone } from './cdp.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [mode, file, name, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : d; };
const out = resolve(opt('out', '') || mkdtempSync(join(tmpdir(), 'ivy-bench-')));
mkdirSync(out, { recursive: true });

const shot = (b, label) => shotTo(b, join(out, label + '.png'));
function savePng(dataUrl, label) {
  const p = join(out, label + '.png');
  writeFileSync(p, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return p;
}
async function open(b, url) {
  await b.send('Page.navigate', { url });
  for (let i = 0; i < 120; i++) {
    await sleep(50);
    const ok = await js(b, 'window.H && (H.ready || H.errors.length > 0) && document.readyState === "complete"').catch(() => false);
    if (ok) return;
  }
  throw new Error('the bench did not get ready: ' + url);
}
// one gesture from a plan, as real touches
async function gesture(b, g) {
  const a = g.tap || [g.drag[0], g.drag[1]], z = g.tap || [g.drag[2], g.drag[3]];
  const [p, q] = await js(b, `[H.toClient(${a[0]}, ${a[1]}), H.toClient(${z[0]}, ${z[1]})]`);
  await swipe(b, p, q);
}

async function puzzle() {
  const seeds = +opt('seeds', 12);
  const report = { file, kind: name, opts: opt('opts', '') || undefined, out, problems: [], seed1: {}, seeds: [], shots: [] };
  const problem = (s) => { if (!report.problems.includes(s)) report.problems.push(s); };
  const b = await launch();
  try {
    await phone(b);
    const url = (seed, state) => pathToFileURL(join(root, 'test/puzzle.html')).href +
      `?file=${encodeURIComponent('../' + file)}&kind=${encodeURIComponent(name)}&seed=${seed}` + (opt('opts', '') ? '&opts=' + encodeURIComponent(opt('opts', '')) : '') +
      (state ? '&state=' + encodeURIComponent(JSON.stringify(state)) : '');

    // seed 1 with real touches
    await open(b, url(1)); await sleep(500);
    const c0 = await js(b, `H.errors.length ? { errors: H.errors } : (() => { const s = H.scene; return {
      puzzle: s.puzzle, indoor: s.indoor, steps: s.steps, progress: s.progress(), solved: s.solved(), plan: s.debugPlan(), crop: s.crop || null,
      api: ['decor', 'draw', 'down', 'move', 'up', 'cancel', 'progress', 'solved', 'hint', 'save', 'load', 'solveAll', 'debugPlan'].filter((k) => typeof s[k] !== 'function') }; })()`);
    if (c0.errors) { report.problems.push(...c0.errors); return report; }
    if (c0.puzzle !== true) problem('puzzle is not true');
    if (!(Number.isInteger(c0.steps) && c0.steps >= 1)) problem('steps is not a whole number above 0');
    if (c0.api.length) problem('missing functions: ' + c0.api.join(', '));
    if (c0.solved || c0.progress >= 1) problem('seed 1 starts solved');
    if (!Array.isArray(c0.plan) || !c0.plan.length) problem('debugPlan() gave no gestures');
    Object.assign(report.seed1, { steps: c0.steps, planLength: c0.plan.length, indoor: c0.indoor, crop: c0.crop });
    report.shots.push(await shot(b, 'seed1-1-start'));
    report.shots.push(savePng(await js(b, 'H.picture()'), 'seed1-picture-before'));
    await js(b, 'H.scene.hint()'); await sleep(700);
    report.shots.push(await shot(b, 'seed1-2-hint'));
    await sleep(3500); // let the hint fade before playing
    const half = Math.max(1, Math.floor(c0.plan.length / 2));
    for (const g of c0.plan.slice(0, half)) await gesture(b, g);
    await sleep(700);
    report.shots.push(await shot(b, 'seed1-3-half'));
    const mid = await js(b, '({ progress: H.scene.progress(), goods: H.goods.length, state: H.scene.save(), errors: H.errors })');
    report.seed1.half = { progress: mid.progress, goods: mid.goods, stateBytes: JSON.stringify(mid.state).length };
    if (mid.errors.length) report.problems.push(...mid.errors);
    if (!(mid.progress > 0)) problem('progress did not move after half of the plan was played with real touches');
    // leave halfway and come back: a fresh page with the saved state
    await open(b, url(1, mid.state)); await sleep(600);
    const re = await js(b, '({ progress: H.scene.progress(), solved: H.scene.solved(), plan: H.scene.debugPlan(), errors: H.errors })');
    if (re.errors.length) report.problems.push(...re.errors);
    if (Math.abs(re.progress - mid.progress) > 1e-9) problem(`load() gave progress ${re.progress}, save() had ${mid.progress}`);
    report.shots.push(await shot(b, 'seed1-4-reloaded'));
    for (const g of re.plan) await gesture(b, g);
    await sleep(1200);
    const fin = await js(b, `({ progress: H.scene.progress(), solved: H.scene.solved(), goods: H.goods.length, sounds: [...new Set(H.sounds)], errors: H.errors,
      p90: (() => { const a = H.drawMs.slice().sort((x, y) => x - y); return +(a[Math.floor(a.length * 0.9)] || 0).toFixed(2); })() })`);
    if (fin.errors.length) report.problems.push(...fin.errors);
    if (!fin.solved || Math.abs(fin.progress - 1) > 1e-9) problem(`seed 1 with real touches did not end solved (progress ${fin.progress})`);
    if (mid.goods + fin.goods !== c0.steps) problem(`seed 1 paid ${mid.goods} + ${fin.goods} times, steps is ${c0.steps}`);
    Object.assign(report.seed1, { solved: fin.solved, sounds: fin.sounds, drawMsP90: fin.p90 });
    report.shots.push(await shot(b, 'seed1-5-solved'));
    report.shots.push(savePng(await js(b, 'H.picture()'), 'seed1-picture-after'));

    // more seeds with synthetic pointer events
    for (let s = 2; s <= seeds; s++) {
      await open(b, url(s));
      const r = await js(b, `(async () => {
        const sc = H.scene, f = (ms) => new Promise((ok) => setTimeout(ok, ms));
        if (H.errors.length) return { errors: H.errors };
        const start = { solved: sc.solved(), progress: sc.progress() };
        const plan = sc.debugPlan();
        for (const g of plan) {
          const [x0, y0, x1, y1] = g.tap ? [g.tap[0], g.tap[1], g.tap[0], g.tap[1]] : g.drag;
          H.fire('pointerdown', x0, y0); await f(20);
          if (g.drag) for (let k = 1; k <= 5; k++) { H.fire('pointermove', x0 + ((x1 - x0) * k) / 5, y0 + ((y1 - y0) * k) / 5); await f(16); }
          H.fire('pointerup', x1, y1); await f(40);
        }
        await f(400);
        return { startSolved: start.solved, startProgress: start.progress, plan: plan.length, solved: sc.solved(), progress: sc.progress(), goods: H.goods.length, steps: sc.steps, errors: H.errors };
      })()`);
      report.seeds.push(Object.assign({ seed: s }, r));
      if (r.errors && r.errors.length) problem(`seed ${s}: ${r.errors.join('; ')}`);
      if (r.startSolved || r.startProgress >= 1) problem(`seed ${s} starts solved`);
      if (!r.solved) problem(`seed ${s} did not end solved by its plan (progress ${r.progress})`);
      if (r.goods !== r.steps) problem(`seed ${s} paid ${r.goods} times, steps is ${r.steps}`);
    }
    if (seeds >= 2) report.shots.push(await shot(b, `seed${seeds}-solved`));
  } catch (e) { problem('bench: ' + e.message); }
  finally { b.close(); }
  return report;
}

async function place() {
  const parts = rest[0] && !rest[0].startsWith('--') ? rest[0] : '';
  const report = { file, obj: name, out, problems: [], shots: [] };
  const b = await launch();
  try {
    await b.send('Page.enable'); await b.send('Runtime.enable');
    await b.send('Emulation.setDeviceMetricsOverride', { width: 1270, height: 1160, deviceScaleFactor: 1, mobile: false });
    await open(b, pathToFileURL(join(root, 'test/place.html')).href + `?file=${encodeURIComponent('../' + file)}&obj=${encodeURIComponent(name)}&parts=${encodeURIComponent(parts)}`);
    await sleep(600);
    const r = await js(b, '({ errors: H.errors, parts: H.parts })');
    report.problems.push(...r.errors);
    report.dataParts = r.parts;
    for (const p of parts.split(',').filter(Boolean)) if (!r.parts.includes(p)) report.problems.push(`no data-part="${p}" in the picture`);
    report.shots.push(await shot(b, 'place-states'));
  } catch (e) { report.problems.push('bench: ' + e.message); }
  finally { b.close(); }
  return report;
}

// a tool job (not a puzzle) drawn the way the engine layers it: dirty, then clean
async function scene() {
  const kind = file, opts = name && !name.startsWith('--') ? name : '{}', seed = +opt('seed', 5);
  const report = { kind, opts: JSON.parse(opts), seed, out, problems: [], shots: [] };
  const b = await launch();
  try {
    await b.send('Page.enable'); await b.send('Runtime.enable');
    await b.send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 680, deviceScaleFactor: 1, mobile: false });
    await open(b, pathToFileURL(join(root, 'test/scene.html')).href + `?kind=${encodeURIComponent(kind)}&opts=${encodeURIComponent(opts)}&seed=${seed}&paint=${encodeURIComponent(opt('paint', ''))}`);
    await sleep(500);
    const r = await js(b, '({ errors: H.errors, info: H.info })');
    report.problems.push(...r.errors);
    report.info = r.info;
    report.shots.push(await shotTo(b, join(out, `scene-${kind}-${seed}.png`)));
  } catch (e) { report.problems.push('bench: ' + e.message); }
  finally { b.close(); }
  return report;
}

const report = mode === 'place' ? await place() : mode === 'puzzle' ? await puzzle() : mode === 'scene' ? await scene() : { problems: ['usage: run.mjs puzzle <file> <kind> | place <file> <obj> <parts> | scene <kind> <opts json>'] };
console.log(JSON.stringify(report, null, 1));
process.exit(report.problems.length ? 1 : 0);
