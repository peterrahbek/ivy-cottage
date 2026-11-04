'use strict';
// The chore engine: one full-screen canvas, a grid of dirt cells, a tool that
// follows the finger and wipes cells, particles, helper robots, coins.
// Thinking jobs (js/puzzles.js) skip the grid, the tool and the robots: the
// scene draws itself every frame and takes the finger directly.
//
// Layers (all full-screen canvases at device resolution, same transform):
//   decor -> clean -> cleanOver -> live (per frame) -> dirt masked by grid
//   -> finished pieces (planks, plants) -> top -> helpers/particles/tool
//   (per frame) -> flying coins (screen space)

const ENGINE = (() => {
  const W = SCENES.W, H = SCENES.H, CELL = 3;
  const GW = W / CELL, GH = H / CELL;
  const OFFSET = 30; // tool sits this far above the finger so it stays visible

  let cv, ctx, cb = {};
  let dpr = 1, vw = 0, vh = 0, scale = 1, ox = 0, oy = 0;
  let L = null; // layers
  let scene = null, def = null, tier = null, paint = '#9cc5a1';
  let hp, tough, inReg, total = 0, cleaned = 0, valuePerCell = 0, coinUnit = 1, coinAcc = 0, earnAcc = 0;
  let maskCv, maskCx, maskImg, maskDirty = false;
  const tool = { x: 180, y: 480, a: -Math.PI / 2, tx: 180, ty: 480, down: false, pid: null, vib: 0 };
  let parts = [], coins = [], helpers = [];
  let running = false, raf = 0, last = 0, clock = 0, finishing = null, done = false;
  let activity = 0, smoothAct = 0, insets = { top: 70, bottom: 110 }, stuckT = 0;
  let speedMult = 1, stamped = false;
  // a thinking job (js/puzzles.js) in progress: what it pays, how much of
  // that is paid, where the last right move was and the keepsake it holds
  let puz = null;

  function init(canvas, callbacks) {
    cv = canvas; ctx = cv.getContext('2d');
    cb = callbacks;
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('lostpointercapture', onUp);
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (running) relayout(); }, 150); });
  }

  // -------------------------------------------------------------- geometry
  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight;
    const availH = vh - insets.top - insets.bottom;
    scale = Math.min(vw / W, availH / H);
    ox = (vw - W * scale) / 2;
    oy = insets.top + (availH - H * scale) / 2;
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
  }
  const bleed = () => ({ x0: -ox / scale - 4, y0: -oy / scale - 4, x1: (vw - ox) / scale + 4, y1: (vh - oy) / scale + 4 });
  function layer() {
    const c = U.canvas(cv.width, cv.height);
    const x = c.getContext('2d');
    x.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
    return { c, x };
  }
  const toScreen = (x, y) => ({ x: ox + x * scale, y: oy + y * scale });

  // iOS Safari caps total canvas memory and frees it lazily, so give the
  // backing stores of layers we are done with back straight away
  function release(layers) {
    if (!layers) return;
    for (const k of Object.keys(layers)) { const l = layers[k]; if (l && l.c) { l.c.width = 1; l.c.height = 1; } }
  }

  function paintLayers(keepClean) {
    const old = L;
    if (puz) {
      // a puzzle paints its background once and draws the rest every frame
      L = { decor: layer() };
      scene.decor(L.decor.x);
      paintWeather();
      L.k = scale * dpr; L.ox = ox * dpr; L.oy = oy * dpr;
      release(old);
      return;
    }
    L = { decor: layer(), clean: layer(), dirt: layer(), comp: layer() };
    scene.decor(L.decor.x);
    if (keepClean && old) {
      // carry stripes and paint across a resize
      const k = (scale * dpr) / old.k;
      L.clean.x.save(); L.clean.x.setTransform(1, 0, 0, 1, 0, 0);
      L.clean.x.drawImage(old.clean.c, ox * dpr - old.ox * k, oy * dpr - old.oy * k, old.clean.c.width * k, old.clean.c.height * k);
      L.clean.x.restore();
    }
    L.clean.x.save(); L.clean.x.clip(scene.region, scene.fillRule || 'evenodd'); // clean layer and stamps stay inside the region
    if (!(keepClean && old)) scene.clean(L.clean.x, paint);
    if (scene.cleanOver) { L.over = layer(); L.over.x.save(); L.over.x.clip(scene.region, scene.fillRule || 'evenodd'); scene.cleanOver(L.over.x); L.over.x.restore(); }
    L.dirt.x.save(); L.dirt.x.clip(scene.region, scene.fillRule || 'evenodd'); scene.dirt(L.dirt.x); L.dirt.x.restore();
    if (scene.top) { L.top = layer(); scene.top(L.top.x); }
    if (scene.depth) L.shadow = layer();
    if (units.length) { L.units = layer(); bakeUnits(); }
    paintWeather();
    L.k = scale * dpr; L.ox = ox * dpr; L.oy = oy * dpr;
    release(old);
    maskDirty = true;
  }

  const SIDEWAYS = '(orientation: landscape) and (max-height: 520px)';
  let sideways = false;
  if (window.matchMedia) {
    const mq = window.matchMedia(SIDEWAYS);
    sideways = mq.matches;
    const onChange = () => { sideways = mq.matches; if (sideways) { tool.down = false; tool.pid = null; if (puz && running) scene.cancel(); } };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  function relayout() {
    // a phone held sideways gets a 'turn it upright' notice instead; keeping
    // the layers as they are means nothing turns blurry on the way back
    if (window.matchMedia && window.matchMedia(SIDEWAYS).matches) return;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    if (L && Math.round(window.innerWidth * d) === cv.width && Math.round(window.innerHeight * d) === cv.height) return;
    if (cb.insets) insets = cb.insets();
    measure();
    paintLayers(stamped);
  }

  // ------------------------------------------------------------------- grid
  function buildGrid() {
    const g = U.canvas(GW, GH), gx = g.getContext('2d');
    gx.setTransform(1 / CELL, 0, 0, 1 / CELL, 0, 0);
    gx.fillStyle = '#000'; gx.fill(scene.region, scene.fillRule || 'evenodd');
    const a = gx.getImageData(0, 0, GW, GH).data;
    hp = new Float32Array(GW * GH); tough = new Float32Array(GW * GH); inReg = new Uint8Array(GW * GH);
    total = 0;
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const k = j * GW + i;
      if (a[k * 4 + 3] > 127) {
        inReg[k] = 1; hp[k] = 1; total++;
        tough[k] = scene.tough ? scene.tough((i + 0.5) * CELL, (j + 0.5) * CELL) : 1;
      }
    }
    cleaned = 0;
    maskCv = U.canvas(GW, GH); maskCx = maskCv.getContext('2d');
    maskImg = maskCx.createImageData(GW, GH);
    const d = maskImg.data;
    for (let k = 0; k < GW * GH; k++) { d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = 255; d[k * 4 + 3] = 255; }
    maskDirty = true;
  }

  function setCell(k, v) {
    if (cellUnit && cellUnit[k] >= 0) unitHp[cellUnit[k]] += v - hp[k];
    hp[k] = v;
    maskImg.data[k * 4 + 3] = Math.round(v * 255);
    maskDirty = true;
  }

  // coins are handed over whole; the fractions per cell collect here
  function earn(v) {
    earnAcc += v;
    const whole = Math.floor(earnAcc + 1e-6);
    if (whole > 0) { earnAcc -= whole; cb.onEarn && cb.onEarn(whole); }
  }
  function flushEarn() {
    if (earnAcc >= 0.5) cb.onEarn && cb.onEarn(1);
    earnAcc = 0;
  }

  function clearCell(k) {
    setCell(k, 0);
    cleaned++;
    const x = ((k % GW) + 0.5) * CELL, y = (((k / GW) | 0) + 0.5) * CELL;
    earn(valuePerCell);
    coinAcc += valuePerCell;
    if (coinAcc >= coinUnit) {
      coinAcc -= coinUnit;
      const s = toScreen(x, y);
      const tgt = cb.coinTarget ? cb.coinTarget() : { x: vw - 40, y: 30 };
      coins.push({ x: s.x, y: s.y, sx: s.x, sy: s.y, tx: tgt.x, ty: tgt.y, t: 0, dur: 0.55 + Math.random() * 0.25, lift: 40 + Math.random() * 50, v: coinUnit });
    }
  }

  // ---------------------------------------------------------------- stamps
  function stamp(x, y, a, t, dist, isHelper) {
    const rect = t.shape === 'rect';
    const reach = rect ? Math.hypot(t.w / 2, t.h / 2) : t.r;
    const depth = rect ? t.h : t.r * 2;
    const k = (t.power * dist) / depth;
    const i0 = Math.max(0, Math.floor((x - reach) / CELL)), i1 = Math.min(GW - 1, Math.floor((x + reach) / CELL));
    const j0 = Math.max(0, Math.floor((y - reach) / CELL)), j1 = Math.min(GH - 1, Math.floor((y + reach) / CELL));
    const ca = Math.cos(a), sa = Math.sin(a);
    let removed = 0;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const idx = j * GW + i;
        if (!inReg[idx] || hp[idx] <= 0) continue;
        const dx = (i + 0.5) * CELL - x, dy = (j + 0.5) * CELL - y;
        let f;
        if (rect) {
          const along = dx * ca + dy * sa, across = -dx * sa + dy * ca;
          if (Math.abs(along) > t.h / 2 + CELL * 0.5 || Math.abs(across) > t.w / 2) continue;
          f = Math.abs(across) < t.w / 2 - 2 ? 1 : 0.55;
        } else {
          const d = Math.hypot(dx, dy);
          if (d > t.r) continue;
          // every cell under the disc gets the full power over one pass:
          // scale by the chord the disc sweeps over this cell
          const chord = 2 * Math.sqrt(Math.max(t.r * t.r - d * d, t.r * t.r * 0.12));
          f = (d < t.r * 0.8 ? 1 : 1 - (d - t.r * 0.8) / (t.r * 0.2) * 0.5) * (t.r * 2) / chord;
        }
        const dec = (k * f) / tough[idx];
        const before = hp[idx];
        const after = before - dec;
        removed += Math.min(before, dec);
        if (after <= 0.06) clearCell(idx);
        else setCell(idx, after);
        if (cellUnit) { const u = cellUnit[idx]; if (u >= 0 && !touchedMark[u]) { touchedMark[u] = 1; touched.push(u); } }
      }
    }
    if (touched.length) checkUnits();
    if (scene.stamp) { scene.stamp(L.clean.x, x, y, a, t, paint, isHelper); stamped = true; }
    return removed;
  }

  // ------------------------------------------------------------------ units
  // Some jobs are made of pieces: planks, bricks and tiles that click into
  // place, plants that spring up. Each piece owns the cells under it; once
  // enough of them are worked it completes itself and pops in.
  let units = [], growing = [], cellUnit = null, unitHp = null, unitN = null;
  let touched = [], touchedMark = new Uint8Array(0);
  const unitDur = () => scene.unitDur || 0.45;
  // 'collect' jobs work the other way round: the pieces lie there to begin
  // with and fly off to the scene's bucket once picked up
  const collecting = () => scene.unitMode === 'collect';
  function bakeUnits() {
    const x = L.units.x;
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, L.units.c.width, L.units.c.height); x.restore();
    for (const u of units) if (collecting() ? !u.done : u.done && !growing.includes(u)) scene.drawUnit(x, u, 1);
  }
  function drawLeaving(c, u, k) {
    const t = scene.unitTarget || { x: u.cx, y: u.cy - 140 };
    let x = u.cx, y = u.cy, s = 1, rot = 0;
    if (k < 0.2) { const e = U.easeOut(k / 0.2); s = 1 + 0.25 * e; y -= 8 * e; }
    else {
      const q = (k - 0.2) / 0.8, e = q * q * (3 - 2 * q);
      x = U.lerp(u.cx, t.x, e); y = U.lerp(u.cy - 8, t.y, e) - Math.sin(e * Math.PI) * 70;
      s = 1.25 - 0.85 * e; rot = e * (u.spin || 2.5);
    }
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.translate(-u.cx, -u.cy);
    scene.drawUnit(c, u, 1);
    c.restore();
  }
  function setupUnits() {
    units = scene.units || [];
    growing = []; touched = [];
    cellUnit = null;
    if (!units.length) return;
    cellUnit = new Int16Array(GW * GH).fill(-1);
    unitHp = new Float32Array(units.length); unitN = new Uint16Array(units.length);
    touchedMark = new Uint8Array(units.length);
    units.forEach((u, ui) => {
      const circle = u.shape === 'circle';
      const bx0 = circle ? u.x - u.r : u.x, by0 = circle ? u.y - u.r : u.y;
      const bx1 = circle ? u.x + u.r : u.x + u.w, by1 = circle ? u.y + u.r : u.y + u.h;
      u.cx = (bx0 + bx1) / 2; u.cy = (by0 + by1) / 2; u.sw = bx1 - bx0; u.sh = by1 - by0;
      u.cells = [];
      for (let j = Math.max(0, Math.floor(by0 / CELL)); j <= Math.min(GH - 1, Math.floor(by1 / CELL)); j++) {
        for (let i = Math.max(0, Math.floor(bx0 / CELL)); i <= Math.min(GW - 1, Math.floor(bx1 / CELL)); i++) {
          const k = j * GW + i;
          if (!inReg[k] || cellUnit[k] >= 0) continue;
          const x = (i + 0.5) * CELL, y = (j + 0.5) * CELL;
          if (circle ? Math.hypot(x - u.x, y - u.y) > u.r : x < bx0 || x > bx1 || y < by0 || y > by1) continue;
          cellUnit[k] = ui; u.cells.push(k); unitHp[ui] += hp[k];
        }
      }
      unitN[ui] = u.cells.length;
      // nothing left to do here (or a half-done job being picked up again)
      u.done = !u.cells.length || unitHp[ui] <= 0.001;
      u.t = 0;
    });
  }
  function checkUnits() {
    const need = scene.unitThreshold || 0.45;
    for (const ui of touched) {
      touchedMark[ui] = 0;
      if (!units[ui].done && 1 - unitHp[ui] / unitN[ui] >= need) completeUnit(ui, false);
    }
    touched.length = 0;
  }
  function completeUnit(ui, quiet) {
    const u = units[ui];
    if (u.done) return;
    u.done = true;
    for (const k of u.cells) if (hp[k] > 0) clearCell(k);
    if (collecting()) { if (L && L.units) bakeUnits(); }
    if (quiet) { if (L && L.units && !collecting()) scene.drawUnit(L.units.x, u, 1); return; }
    u.t = 0; growing.push(u);
    cb.onUnit && cb.onUnit(scene.unitKind || 'build');
    const kind = scene.unitParticle || 'dust', cols = PCOL[kind] || PCOL.dust;
    for (let i = 0; i < 7; i++) {
      if (parts.length > 300) parts.shift();
      parts.push({ x: u.cx + (Math.random() - 0.5) * u.sw * 0.8, y: u.cy + (Math.random() - 0.5) * u.sh * 0.8, vx: (Math.random() - 0.5) * 70, vy: -25 - Math.random() * 45, life: 0, max: 0.45 + Math.random() * 0.4, kind, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 10, s: kind === 'dust' ? 3 + Math.random() * 4 : 1 + Math.random() * 1.4, col: cols[(Math.random() * cols.length) | 0] });
    }
    if (scene.unitKind === 'plant') for (let i = 0; i < 4; i++) sparkle(u.cx + (Math.random() - 0.5) * u.sw, u.cy + (Math.random() - 0.5) * u.sh);
  }
  function stepUnits(dt) {
    for (let i = growing.length - 1; i >= 0; i--) {
      const u = growing[i];
      u.t += dt;
      if (u.t < unitDur()) continue;
      growing.splice(i, 1);
      if (collecting()) { const t = scene.unitTarget; if (t) for (let k = 0; k < 5; k++) sparkle(t.x + (Math.random() - 0.5) * 24, t.y + (Math.random() - 0.5) * 16); }
      else if (L && L.units) scene.drawUnit(L.units.x, u, 1);
    }
  }

  function sweep(x0, y0, x1, y1, a, t, isHelper) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    if (dist < 0.01) return 0;
    const depth = t.shape === 'rect' ? t.h : t.r * 2;
    const step = Math.max(0.8, Math.min(CELL, depth * 0.3));
    const n = Math.ceil(dist / step);
    let removed = 0;
    for (let s = 1; s <= n; s++) {
      const u = s / n;
      removed += stamp(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, a, t, dist / n, isHelper);
    }
    return removed;
  }

  // --------------------------------------------------------------- pointer
  function toBoard(e) { return { x: (e.clientX - ox) / scale, y: (e.clientY - oy) / scale }; }
  // a puzzle gets the finger itself, exactly where it is; once it is solved
  // nothing more can be moved
  function onDown(e) {
    if (!running || done || tool.pid !== null || (puz && finishing)) return;
    tool.pid = e.pointerId;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    const p = toBoard(e);
    cb.onTouch && cb.onTouch();
    e.preventDefault();
    if (puz) { if (!sideways) scene.down(p.x, p.y); return; }
    tool.tx = U.clamp(p.x, -10, W + 10); tool.ty = U.clamp(p.y - OFFSET, -10, H + 10);
    tool.x = tool.tx; tool.y = tool.ty;
    tool.down = true;
  }
  function onMove(e) {
    if (e.pointerId !== tool.pid) return;
    const p = toBoard(e);
    e.preventDefault();
    if (puz) { if (!finishing) scene.move(p.x, p.y); return; }
    tool.tx = U.clamp(p.x, -10, W + 10); tool.ty = U.clamp(p.y - OFFSET, -10, H + 10);
  }
  function onUp(e) {
    if (e.pointerId !== tool.pid) return;
    tool.pid = null; tool.down = false;
    if (!puz || done) return;
    if (e.type === 'pointerup') { const p = toBoard(e); scene.up(p.x, p.y); } else scene.cancel();
  }

  // ------------------------------------------------------------- particles
  const PCOL = {
    grass: ['#5f9e43', '#7bb553', '#94c562', '#a8c463', '#4d8a34'],
    moss: ['#5c7a2e', '#6f9037', '#86a646', '#7a6a4a'],
    dust: ['#cfc8bd', '#bdb5a8', '#e2ddd4'],
    leaf: ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a', '#e06c3c'],
    weed: ['#4f8a3a', '#62a042', '#6b4f36', '#7bb553'],
    suds: ['#ffffff'],
    water: ['#bfe6f5'],
    snow: ['#ffffff', '#eef6fb', '#dfeaf3'],
    soil: ['#6b4a32', '#5a3d28', '#7d5a3e', '#8a6a4a'],
    chips: ['#e3c99a', '#d4b483', '#c9a56e', '#b98f5a'],
    sand: ['#e8d3a4', '#dcc28c', '#f1e2bd', '#cdb27a'],
    seaweed: ['#5d7a3a', '#6e6a2e', '#4f6b3a', '#8a7a3a', '#3f5a2f'],
    shine: ['#fffbe8', '#ffffff', '#fff3c4'],
  };
  function spawn(kind, x, y, a, amount, t) {
    const n = Math.min(5, amount * 0.9 + (Math.random() < amount * 0.9 % 1 ? 1 : 0));
    const back = a + Math.PI;
    const rch = TOOLS.reach(t);
    for (let i = 0; i < n; i++) {
      if (parts.length > 260) parts.shift();
      const spread = (Math.random() - 0.5) * 1.8;
      const off = (Math.random() - 0.5) * rch * 1.6;
      const px = x + Math.cos(a + Math.PI / 2) * off, py = y + Math.sin(a + Math.PI / 2) * off;
      const sp = 30 + Math.random() * 70;
      const p = { x: px, y: py, vx: Math.cos(back + spread) * sp, vy: Math.sin(back + spread) * sp - 20, life: 0, max: 0.5 + Math.random() * 0.5, kind, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 12, s: 1 + Math.random() * 1.6 };
      if (kind === 'paint') { p.col = paint; p.vx *= 0.3; p.vy = 20 + Math.random() * 30; p.s = 1 + Math.random() * 1.5; }
      else if (kind === 'suds') { p.vx *= 0.25; p.vy = -10 - Math.random() * 20; p.s = 2 + Math.random() * 4; p.max = 0.9 + Math.random() * 0.7; }
      else if (kind === 'dust') { p.vx *= 0.35; p.vy = -8 - Math.random() * 15; p.s = 4 + Math.random() * 6; p.max = 0.9 + Math.random() * 0.6; }
      else if (kind === 'snow') { p.vx *= 0.8; p.vy -= 30; p.s = 1.5 + Math.random() * 2.5; p.max = 0.6 + Math.random() * 0.5; }
      else if (kind === 'water') { p.vx *= 0.1; p.vy = 0; p.s = 2; p.max = 0.8; }
      else if (kind === 'shine') { p.vx *= 0.2; p.vy = -6 - Math.random() * 10; p.s = 1.5 + Math.random() * 2.5; p.max = 0.5 + Math.random() * 0.4; }
      if (!p.col) { const cols = PCOL[kind] || PCOL.grass; p.col = cols[(Math.random() * cols.length) | 0]; }
      parts.push(p);
    }
  }
  function sparkle(x, y) {
    if (parts.length > 300) return;
    parts.push({ x, y, vx: (Math.random() - 0.5) * 20, vy: -10 - Math.random() * 20, life: 0, max: 0.6 + Math.random() * 0.5, kind: 'spark', rot: 0, vr: 0, s: 2 + Math.random() * 3, col: '#fff8d6' });
  }
  function stepParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      if (p.life > p.max) { parts.splice(i, 1); continue; }
      const g = p.kind === 'suds' || p.kind === 'dust' || p.kind === 'spark' || p.kind === 'shine' ? -10 : p.kind === 'water' ? 0 : 160;
      p.vy += g * dt;
      const drag = p.kind === 'dust' || p.kind === 'suds' ? 1.5 : 3.2;
      p.vx -= p.vx * drag * dt; p.vy -= p.vy * (drag * 0.4) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.kind === 'suds') p.x += Math.sin(p.life * 6 + p.s) * 0.3;
    }
  }
  function drawParts(c) {
    for (const p of parts) {
      const t = p.life / p.max, a = 1 - t;
      if (p.kind === 'suds') {
        c.globalAlpha = a * 0.9;
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.8;
        c.fillStyle = 'rgba(220,240,255,0.25)';
        c.beginPath(); c.arc(p.x, p.y, p.s, 0, 7); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(p.x - p.s * 0.35, p.y - p.s * 0.35, p.s * 0.25, 0, 7); c.fill();
      } else if (p.kind === 'dust') {
        c.globalAlpha = a * 0.35;
        c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s * (0.6 + t), 0, 7); c.fill();
      } else if (p.kind === 'water') {
        c.globalAlpha = a * 0.7; c.strokeStyle = '#e6f6ff'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(p.x, p.y, 3 + t * 14, (3 + t * 14) * 0.5, 0, 0, 7); c.stroke();
      } else if (p.kind === 'spark' || p.kind === 'shine') {
        c.globalAlpha = Math.sin(t * Math.PI);
        c.fillStyle = p.col;
        const s = p.s * (1 - t * 0.5);
        c.beginPath(); c.moveTo(p.x, p.y - s * 2); c.lineTo(p.x + s * 0.5, p.y - s * 0.5); c.lineTo(p.x + s * 2, p.y); c.lineTo(p.x + s * 0.5, p.y + s * 0.5);
        c.lineTo(p.x, p.y + s * 2); c.lineTo(p.x - s * 0.5, p.y + s * 0.5); c.lineTo(p.x - s * 2, p.y); c.lineTo(p.x - s * 0.5, p.y - s * 0.5); c.closePath(); c.fill();
      } else if (p.kind === 'leaf') {
        c.globalAlpha = Math.min(1, a * 2);
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
        c.beginPath(); c.ellipse(0, 0, p.s * 2.4, p.s * 1.3, 0, 0, 7); c.fill(); c.restore();
      } else if (p.kind === 'snow') {
        c.globalAlpha = Math.min(1, a * 1.6);
        c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s, 0, 7); c.fill();
      } else if (p.kind === 'paint') {
        c.globalAlpha = Math.min(1, a * 2);
        c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s, 0, 7); c.fill();
      } else {
        c.globalAlpha = Math.min(1, a * 2);
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
        c.fillRect(-p.s * 1.6, -p.s * 0.4, p.s * 3.2, p.s * 0.8); c.restore();
      }
    }
    c.globalAlpha = 1;
  }

  // --------------------------------------------------------------- helpers
  const HELPER = { shape: 'circle', r: 9, power: 1, speed: 42 };
  function makeHelpers(n) {
    helpers = [];
    for (let i = 0; i < n; i++) helpers.push({ x: 40 + Math.random() * 280, y: 80 + Math.random() * 440, a: 0, tx: 0, ty: 0, timer: 0, bob: Math.random() * 6 });
  }
  function findDirty(h) {
    let best = -1, bd = 1e9;
    for (let s = 0; s < 40; s++) {
      const k = (Math.random() * GW * GH) | 0;
      if (!inReg[k] || hp[k] <= 0) continue;
      const x = ((k % GW) + 0.5) * CELL, y = (((k / GW) | 0) + 0.5) * CELL;
      const d = Math.hypot(x - h.x, y - h.y);
      if (d < bd) { bd = d; best = k; }
    }
    if (best < 0) return false;
    h.tx = ((best % GW) + 0.5) * CELL; h.ty = (((best / GW) | 0) + 0.5) * CELL;
    return true;
  }
  function stepHelpers(dt) {
    for (const h of helpers) {
      h.bob += dt * 4;
      h.timer -= dt;
      const d = Math.hypot(h.tx - h.x, h.ty - h.y);
      if (h.timer <= 0 || d < 3) { if (!findDirty(h)) { h.tx = h.x; h.ty = h.y; } h.timer = 2 + Math.random() * 2; }
      if (d > 1) {
        const ta = Math.atan2(h.ty - h.y, h.tx - h.x);
        let da = ta - h.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        h.a += da * Math.min(1, dt * 5);
        const step = Math.min(d, HELPER.speed * dt);
        const nx = h.x + Math.cos(h.a) * step, ny = h.y + Math.sin(h.a) * step;
        const rem = sweep(h.x, h.y, nx, ny, h.a, HELPER, true);
        if (rem > 0 && Math.random() < 0.3) spawn(scene.particle, nx, ny, h.a, 0.6, HELPER);
        h.x = nx; h.y = ny;
      }
    }
  }
  function drawHelper(c, h) {
    const y = h.y - 5 + Math.sin(h.bob) * 1.5;
    c.fillStyle = 'rgba(30,25,20,0.22)'; c.beginPath(); c.ellipse(h.x, h.y + 6, 9, 3.5, 0, 0, 7); c.fill();
    c.fillStyle = '#5fb8a8'; c.beginPath(); c.arc(h.x, y, 8.5, 0, 7); c.fill();
    c.fillStyle = '#8fdccd'; c.beginPath(); c.arc(h.x - 2, y - 2.5, 5.5, 0, 7); c.fill();
    c.fillStyle = '#2b3a3f'; c.beginPath(); c.roundRect(h.x - 5, y - 3, 10, 5, 2.5); c.fill();
    const blink = (Math.sin(h.bob * 0.7) > 0.97) ? 0.3 : 1;
    c.fillStyle = '#c6fff4'; c.beginPath(); c.ellipse(h.x - 2, y - 0.5, 1.3, 1.4 * blink, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(h.x + 2, y - 0.5, 1.3, 1.4 * blink, 0, 0, 7); c.fill();
    c.strokeStyle = '#2b3a3f'; c.lineWidth = 1; c.beginPath(); c.moveTo(h.x, y - 8.5); c.lineTo(h.x, y - 12); c.stroke();
    c.fillStyle = Math.sin(h.bob * 2) > 0 ? '#ffcf5a' : '#ff8f6b'; c.beginPath(); c.arc(h.x, y - 12.5, 1.6, 0, 7); c.fill();
  }

  // ------------------------------------------------------------------ tool
  function stepTool(dt) {
    const dx = tool.tx - tool.x, dy = tool.ty - tool.y, d = Math.hypot(dx, dy);
    tool.vib = Math.max(0, tool.vib - dt * 3);
    if (!tool.down || d < 0.05) return 0;
    // ease towards the finger, but never faster than the tool can go
    const maxStep = tier.speed * speedMult * 2.2 * dt;
    const want = d < 0.6 ? d : d * Math.min(1, dt * 18);
    const mv = Math.min(want, maxStep);
    const nx = tool.x + (dx / d) * mv, ny = tool.y + (dy / d) * mv;
    if (Math.hypot(nx - tool.x, ny - tool.y) > 0.3) {
      const ta = Math.atan2(ny - tool.y, nx - tool.x);
      let da = ta - tool.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      tool.a += da * Math.min(1, dt * 14);
    }
    const rem = sweep(tool.x, tool.y, nx, ny, tool.a, tier, false);
    tool.x = nx; tool.y = ny;
    if (rem > 0) { spawn(scene.particle, nx, ny, tool.a, rem * 0.25, tier); tool.vib = 1; }
    return rem;
  }
  function drawTool(c) {
    const jig = tool.down && tool.vib > 0 ? (Math.random() - 0.5) * 0.8 : 0;
    const lift = tool.down ? 0 : 3;
    c.save();
    c.translate(tool.x + 3 + lift, tool.y + 4 + lift * 1.5);
    c.rotate(tool.a);
    c.globalAlpha = 0.18; c.filter = 'none';
    c.fillStyle = '#1e140c';
    const rch = TOOLS.reach(tier);
    c.beginPath(); c.ellipse(0, 0, tier.shape === 'rect' ? tier.h * 0.7 : rch * 0.9, rch * 0.9, 0, 0, 7); c.fill();
    c.restore();
    c.save();
    c.translate(tool.x + jig, tool.y + jig - lift);
    c.rotate(tool.a);
    c.globalAlpha = tool.down ? 1 : 0.92;
    if (scene.toolSprite) scene.toolSprite(c, tier, paint); else TOOLS.drawSprite(c, tier, paint);
    c.restore();
  }

  // ----------------------------------------------------------------- coins
  function stepCoins(dt) {
    for (let i = coins.length - 1; i >= 0; i--) {
      const k = coins[i];
      k.t += dt / k.dur;
      if (k.t >= 1) { coins.splice(i, 1); cb.onCoinArrive && cb.onCoinArrive(k.v); continue; }
      if (k.t < 0) continue;
      const e = k.t * k.t * (3 - 2 * k.t);
      k.x = U.lerp(k.sx, k.tx, e);
      k.y = U.lerp(k.sy, k.ty, e) - Math.sin(k.t * Math.PI) * k.lift;
    }
  }
  function drawCoins(c) {
    for (const k of coins) {
      if (k.t < 0) continue;
      const s = 7 + Math.sin(k.t * Math.PI) * 3;
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.beginPath(); c.arc(k.x + 1, k.y + 2, s, 0, 7); c.fill();
      c.fillStyle = '#e0a526'; c.beginPath(); c.arc(k.x, k.y, s, 0, 7); c.fill();
      c.fillStyle = '#f7cf4a'; c.beginPath(); c.arc(k.x, k.y, s * 0.78, 0, 7); c.fill();
      c.fillStyle = '#fff3b8'; c.beginPath(); c.arc(k.x - s * 0.3, k.y - s * 0.3, s * 0.28, 0, 7); c.fill();
    }
  }

  // ------------------------------------------------------------- treasures
  // Things hidden under the dirt: little stashes of coins and sometimes a
  // keepsake for the finds shelf. They show through as the dirt thins.
  let gems = [];
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  function placeTreasures(list) {
    gems = [];
    const used = [];
    for (const g of list || []) {
      for (let tries = 0; tries < 300; tries++) {
        const i = 5 + ((Math.random() * (GW - 10)) | 0), j = 5 + ((Math.random() * (GH - 10)) | 0);
        let ok = hp[j * GW + i] > 0.5;
        for (let dj = -4; dj <= 4 && ok; dj++) for (let di = -4; di <= 4; di++) if (!inReg[(j + dj) * GW + i + di]) { ok = false; break; }
        if (!ok) continue;
        const x = (i + 0.5) * CELL, y = (j + 0.5) * CELL;
        if (used.some((u) => Math.hypot(u[0] - x, u[1] - y) < 60)) continue;
        used.push([x, y]);
        gems.push(Object.assign({ x, y, i, j, state: 0, t: 0, rot: (Math.random() - 0.5) * 0.6 }, g));
        break;
      }
    }
  }
  function uncovered(g) {
    let sum = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) sum += hp[(g.j + dj) * GW + g.i + di];
    return sum < 1.2;
  }
  function stepGems(dt) {
    for (const g of gems) {
      if (g.state === 0 && uncovered(g)) {
        g.state = 1; g.t = 0;
        for (let k = 0; k < 16; k++) sparkle(g.x + (Math.random() - 0.5) * 26, g.y + (Math.random() - 0.5) * 26);
        cb.onEarn && cb.onEarn(g.value);
        const s = toScreen(g.x, g.y), tgt = cb.coinTarget ? cb.coinTarget() : { x: vw - 40, y: 30 };
        const n = g.kind === 'coin' ? 4 : 3;
        for (let k = 0; k < n; k++) coins.push({ x: s.x, y: s.y, sx: s.x + (Math.random() - 0.5) * 30, sy: s.y + (Math.random() - 0.5) * 20, tx: tgt.x, ty: tgt.y, t: -k * 0.08, dur: 0.7 + Math.random() * 0.2, lift: 60 + Math.random() * 40, v: g.value / n });
        cb.onFind && cb.onFind(g);
      } else if (g.state === 1) {
        g.t += dt;
        if (g.t > 1.6) g.state = 2;
      }
    }
  }
  function drawGem(c, g, popped) {
    let sc = 1, alpha = 1, lift = 0;
    if (popped) {
      const t = g.t;
      sc = t < 0.25 ? 1 + U.easeBack(t / 0.25) * 0.9 : 1.9 - Math.min(1, (t - 0.25) / 1.3) * 0.4;
      lift = Math.min(1, t / 0.4) * 22 + Math.max(0, t - 0.9) * 40;
      alpha = t < 1.1 ? 1 : Math.max(0, 1 - (t - 1.1) / 0.5);
    }
    c.save(); c.globalAlpha = alpha; c.translate(g.x, g.y - lift); c.scale(sc, sc); c.rotate(popped ? 0 : g.rot);
    if (popped) {
      const gl = c.createRadialGradient(0, 0, 0, 0, 0, 26);
      gl.addColorStop(0, 'rgba(255,248,210,0.9)'); gl.addColorStop(1, 'rgba(255,248,210,0)');
      c.fillStyle = gl; c.beginPath(); c.arc(0, 0, 26, 0, 7); c.fill();
    }
    if (g.kind === 'coin') {
      for (const [dx, dy] of [[-5, 3], [5, 3], [0, -3]]) {
        c.fillStyle = '#b8841a'; c.beginPath(); c.ellipse(dx, dy + 1.5, 6.5, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#f2c230'; c.beginPath(); c.ellipse(dx, dy, 6.5, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#fff3b8'; c.beginPath(); c.ellipse(dx - 2, dy - 1.5, 2, 1.2, 0, 0, 7); c.fill();
      }
    } else {
      c.font = `22px ${EMOJI_FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(g.emoji, 0, 1);
    }
    c.restore();
  }

  // -------------------------------------------------------------- finishing
  function beginFinish() {
    const left = [];
    for (let k = 0; k < GW * GH; k++) if (inReg[k] && hp[k] > 0) left.push(k);
    for (let i = left.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [left[i], left[j]] = [left[j], left[i]]; }
    finishing = { t: 0, dur: 0.6, cells: left, idx: 0, hold: 0 };
    cb.onAutoFinish && cb.onAutoFinish();
  }
  function stepFinish(dt) {
    const f = finishing;
    f.t += dt;
    const target = Math.floor(Math.min(1, f.t / f.dur) * f.cells.length);
    const dot = { shape: 'circle', r: CELL * 0.9, power: 1, speed: 1 };
    while (f.idx < target) {
      const k = f.cells[f.idx++];
      if (hp[k] <= 0) continue;
      const x = ((k % GW) + 0.5) * CELL, y = (((k / GW) | 0) + 0.5) * CELL;
      clearCell(k);
      if (cellUnit && cellUnit[k] >= 0 && !touchedMark[cellUnit[k]]) { touchedMark[cellUnit[k]] = 1; touched.push(cellUnit[k]); }
      if (scene.stamp) scene.stamp(L.clean.x, x, y, -Math.PI / 2, dot, paint, true);
      if (Math.random() < 0.25) sparkle(x, y);
    }
    if (touched.length) checkUnits();
    // the last pieces drop in as the final cells go
    if (f.t >= f.dur) for (let i = 0; i < units.length; i++) if (!units[i].done) completeUnit(i, false);
    if (f.t >= f.dur) {
      f.hold += dt;
      if (f.hold > Math.max(0.45, growing.length ? unitDur() : 0) && !done) { done = true; tool.down = false; tool.pid = null; flushEarn(); cb.onDone && cb.onDone(); }
    }
  }

  // near the end, make the last dirty spots twinkle so nobody has to hunt,
  // faster the fewer there are
  let hintT = 0, scanT = 0, leftCells = [];
  function hintLeftovers(dt) {
    hintT -= dt; scanT -= dt;
    if (scanT <= 0) { scanT = 0.5; leftCells = []; for (let k = 0; k < GW * GH; k++) if (inReg[k] && hp[k] > 0) leftCells.push(k); }
    if (hintT > 0 || !leftCells.length) return;
    hintT = cleaned / total > 0.97 ? 0.05 : 0.12;
    const k = leftCells[(Math.random() * leftCells.length) | 0];
    if (hp[k] > 0) sparkle(((k % GW) + 0.5) * CELL, (((k / GW) | 0) + 0.5) * CELL);
  }

  // ---------------------------------------------------------------- weather
  // The season outside carries on into every outdoor job, so a snowy cove is
  // still snowy once a job starts: falling snow, leaves or petals, and in
  // winter a cold light. Indoor jobs stay as they are.
  const WEATHER = {
    winter: { n: 70, wash: 'rgba(218,231,246,0.2)', edge: 'rgba(255,255,255,0.5)' },
    autumn: { n: 14, wash: 'rgba(226,150,70,0.07)' },
    spring: { n: 16 },
    summer: { n: 6 },
  };
  const PETALS = ['#f7c6d3', '#fbe3ea', '#ffffff', '#f2a7b8'];
  let weather = null;
  function makeWeather(season, indoor) {
    const w = !indoor && WEATHER[season];
    if (!w) return null;
    const b = bleed(), flakes = [];
    for (let i = 0; i < w.n; i++) {
      const f = { x: b.x0 + Math.random() * (b.x1 - b.x0), y: b.y0 + Math.random() * (b.y1 - b.y0), ph: Math.random() * 6.28, rot: Math.random() * 6.28 };
      if (season === 'winter') Object.assign(f, { s: 1 + Math.random() * 1.8, v: 16 + Math.random() * 22 });
      else if (season === 'autumn') Object.assign(f, { s: 3.5 + Math.random() * 2.5, v: 22 + Math.random() * 16, col: PCOL.leaf[(Math.random() * PCOL.leaf.length) | 0] });
      else if (season === 'spring') Object.assign(f, { s: 2 + Math.random() * 1.6, v: 12 + Math.random() * 12, col: PETALS[(Math.random() * PETALS.length) | 0] });
      else Object.assign(f, { s: 1.2 + Math.random(), v: -4 - Math.random() * 6 }); // summer: seeds drifting up
      flakes.push(f);
    }
    return Object.assign({ season, flakes }, w);
  }
  function stepWeather(dt) {
    const b = bleed();
    for (const f of weather.flakes) {
      f.ph += dt; f.rot += dt * (weather.season === 'winter' ? 0 : 1.6);
      f.y += f.v * dt;
      f.x += (Math.sin(f.ph * 0.9) * (weather.season === 'summer' ? 6 : 10) + (weather.season === 'autumn' ? 12 : 3)) * dt;
      if (f.y > b.y1 + 8) { f.y = b.y0 - 8; f.x = b.x0 + Math.random() * (b.x1 - b.x0); }
      else if (f.y < b.y0 - 8) { f.y = b.y1 + 8; f.x = b.x0 + Math.random() * (b.x1 - b.x0); }
      if (f.x > b.x1 + 8) f.x = b.x0 - 8;
    }
  }
  // the cold light and frosty edges are drawn once per layout
  function paintWeather() {
    if (!weather || !weather.wash) return;
    L.wx = layer();
    const x = L.wx.x, b = bleed();
    x.fillStyle = weather.wash; x.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    if (weather.edge) {
      const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.hypot(b.x1 - b.x0, b.y1 - b.y0) * 0.56);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, weather.edge);
      x.fillStyle = g; x.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    }
  }
  function drawWeather(c) {
    const s = weather.season;
    if (s === 'winter' || s === 'summer') {
      c.fillStyle = s === 'winter' ? 'rgba(255,255,255,0.88)' : 'rgba(255,253,235,0.75)';
      c.beginPath();
      for (const f of weather.flakes) { c.moveTo(f.x + f.s, f.y); c.arc(f.x, f.y, f.s, 0, 7); }
      c.fill();
      return;
    }
    for (const f of weather.flakes) {
      c.save(); c.translate(f.x, f.y); c.rotate(f.rot); c.fillStyle = f.col;
      c.beginPath(); c.ellipse(0, 0, f.s * (s === 'autumn' ? 1.3 : 1), f.s * 0.55 * (0.6 + 0.4 * Math.abs(Math.sin(f.ph * 2))), 0, 0, 7); c.fill();
      c.restore();
    }
  }

  // ---------------------------------------------------------------- puzzles
  // Thinking jobs (js/puzzles.js): the scene draws itself and takes the
  // finger. Each right move pays its share of the job; whatever is left is
  // paid when it is solved, and the keepsake pops up where the last move was.
  function pay(x, y, v, n = 3) {
    if (!(v > 0)) return;
    earn(v);
    const s = toScreen(x, y), tgt = cb.coinTarget ? cb.coinTarget() : { x: vw - 40, y: 30 };
    for (let k = 0; k < n; k++) coins.push({ x: s.x, y: s.y, sx: s.x + (Math.random() - 0.5) * 26, sy: s.y + (Math.random() - 0.5) * 18, tx: tgt.x, ty: tgt.y, t: -k * 0.07, dur: 0.6 + Math.random() * 0.2, lift: 40 + Math.random() * 45, v: v / n });
  }
  function good(x, y) {
    if (!puz || done) return;
    const v = Math.min(puz.value / scene.steps, puz.value - puz.paid);
    puz.x = x; puz.y = y;
    for (let k = 0; k < 8; k++) sparkle(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 24);
    if (v < 0.01) return;
    puz.paid += v;
    pay(x, y, v);
  }
  function startPuzzle(o) {
    puz = { value: o.value || 0, paid: 0, x: W / 2, y: H / 2, find: (o.treasures || []).find((g) => g.kind === 'find') || null };
    hp = null; units = []; growing = []; cellUnit = null; total = 0; cleaned = 0; gems = []; helpers = [];
    scene.fx = { good, sound: (k) => cb.onSound && cb.onSound(k), sparkle };
    // a half-done puzzle only comes back onto the layout it was left on (one
    // played again is a new layout, and so is one solved on another phone)
    let resumed = false;
    if (typeof o.resume === 'string' && o.resume[0] === 'P') {
      try {
        const d = JSON.parse(o.resume.slice(1));
        if (d.seed === def.seed) { scene.load(d.s); puz.paid = U.clamp(+d.paid || 0, 0, puz.value); resumed = true; }
      } catch (_) {}
    }
    // how it looks untouched: leaving without a move keeps nothing
    puz.fresh = resumed ? null : JSON.stringify(scene.save());
    weather = makeWeather(o.season, o.indoor || scene.indoor);
    paintLayers(false);
    parts = []; coins = []; earnAcc = 0; coinAcc = 0; stamped = false;
    tool.down = false; tool.pid = null;
    finishing = null; done = false; clock = 0;
    running = true; last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }
  function stepPuzzle(dt) {
    if (scene.step) scene.step(dt);
    if (!finishing && scene.solved()) {
      finishing = { t: 0 };
      const rest = puz.value - puz.paid;
      if (rest >= 0.5) { puz.paid = puz.value; pay(puz.x, puz.y, rest); }
      const f = puz.find;
      if (f) {
        const g = Object.assign({ x: U.clamp(puz.x, 40, W - 40), y: U.clamp(puz.y - 36, 50, H - 40), state: 1, t: 0, rot: 0 }, f);
        gems.push(g);
        for (let k = 0; k < 16; k++) sparkle(g.x + (Math.random() - 0.5) * 26, g.y + (Math.random() - 0.5) * 26);
        pay(g.x, g.y, g.value);
        cb.onFind && cb.onFind(g);
      }
      cb.onAutoFinish && cb.onAutoFinish();
    } else if (finishing) {
      finishing.t += dt;
      if (finishing.t > (puz.find ? 1.8 : 1.1) && !done) { done = true; tool.pid = null; flushEarn(); cb.onDone && cb.onDone(); }
    }
    stepGems(dt); stepParts(dt); stepCoins(dt);
    if (weather) stepWeather(dt);
    cb.onProgress && cb.onProgress(scene.progress());
  }
  function renderPuzzle() {
    const S = scale * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(L.decor.c, 0, 0);
    ctx.setTransform(S, 0, 0, S, ox * dpr, oy * dpr);
    scene.draw(ctx, clock, false);
    if (weather) {
      if (L.wx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(L.wx.c, 0, 0); ctx.setTransform(S, 0, 0, S, ox * dpr, oy * dpr); }
      drawWeather(ctx);
    }
    for (const g of gems) if (g.state === 1) drawGem(ctx, g, true);
    drawParts(ctx);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCoins(ctx);
  }

  // ------------------------------------------------------------------- loop
  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (sideways) return; // paused while the phone is on its side
    clock += dt;
    if (puz) { stepPuzzle(dt); renderPuzzle(); return; }
    activity = 0;
    if (!finishing) {
      const before = cleaned;
      activity += stepTool(dt);
      if (helpers.length) stepHelpers(dt);
      // she finishes a job herself: only the last specks are swept up for her,
      // or the last bit once she has hunted for it for a few seconds
      if (cleaned > before) stuckT = 0; else if (tool.down) stuckT += dt;
      const p = cleaned / total;
      if (p >= 0.995 || (p >= 0.985 && stuckT > 5)) beginFinish();
      else if (p > 0.9) hintLeftovers(dt);
    } else stepFinish(dt);
    stepGems(dt);
    if (growing.length) stepUnits(dt);
    stepParts(dt); stepCoins(dt);
    if (weather) stepWeather(dt);
    smoothAct += (Math.min(1, activity / 6) - smoothAct) * Math.min(1, dt * 10);
    cb.onActivity && cb.onActivity(tool.down ? smoothAct : 0, tool.down);
    cb.onProgress && cb.onProgress(cleaned / total);
    render();
  }

  // the dirt layer masked by the grid (and its soft shadow), redrawn when cells change
  function updateComp() {
    const S = scale * dpr;
    maskCx.putImageData(maskImg, 0, 0);
    const cx = L.comp.x;
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.clearRect(0, 0, L.comp.c.width, L.comp.c.height);
    cx.globalCompositeOperation = 'source-over';
    cx.drawImage(L.dirt.c, 0, 0);
    cx.globalCompositeOperation = 'destination-in';
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    cx.drawImage(maskCv, 0, 0, GW, GH, ox * dpr, oy * dpr, W * S, H * S);
    cx.restore();
    if (L.shadow) {
      // thick mess (tall grass, moss, leaves, snow) casts a soft shadow
      const sx = L.shadow.x;
      sx.save(); sx.setTransform(1, 0, 0, 1, 0, 0);
      sx.clearRect(0, 0, L.shadow.c.width, L.shadow.c.height);
      sx.drawImage(L.comp.c, 0, 0);
      sx.globalCompositeOperation = 'source-in';
      sx.fillStyle = 'rgba(25,30,15,0.4)'; sx.fillRect(0, 0, L.shadow.c.width, L.shadow.c.height);
      sx.restore();
    }
    maskDirty = false;
  }

  // a small picture of the board without the tool, for the before and after
  // on the finish card; crop in board units (a puzzle may pick its own)
  function picture(w, crop) {
    if (!L) return null;
    if (puz) {
      crop = crop || scene.crop || { x: 0, y: 120, w: W, h: 360 };
      const h = Math.round((w * crop.h) / crop.w), c = U.canvas(w * 2, h * 2), x = c.getContext('2d'), k = c.width / crop.w;
      x.setTransform(k, 0, 0, k, -crop.x * k, -crop.y * k);
      scene.decor(x); scene.draw(x, clock, true);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      return c;
    }
    crop = crop || { x: 0, y: 120, w: W, h: 360 };
    if (maskDirty) updateComp();
    const h = Math.round((w * crop.h) / crop.w), c = U.canvas(w * 2, h * 2), x = c.getContext('2d');
    const k = scale * dpr, sx = ox * dpr + crop.x * k, sy = oy * dpr + crop.y * k;
    for (const key of ['decor', 'clean', 'over', 'comp', 'units', 'top']) if (L[key]) x.drawImage(L[key].c, sx, sy, crop.w * k, crop.h * k, 0, 0, c.width, c.height);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    return c;
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(L.decor.c, 0, 0);
    ctx.drawImage(L.clean.c, 0, 0);
    if (L.over) ctx.drawImage(L.over.c, 0, 0);
    const S = scale * dpr;
    ctx.setTransform(S, 0, 0, S, ox * dpr, oy * dpr);
    if (scene.live) scene.live(ctx, clock, hp, GW, CELL);
    for (const g of gems) if (g.state === 0) drawGem(ctx, g, false);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (maskDirty) updateComp();
    if (L.shadow) ctx.drawImage(L.shadow.c, 1.2 * S, 2.4 * S);
    ctx.drawImage(L.comp.c, 0, 0);
    if (L.units) {
      ctx.drawImage(L.units.c, 0, 0);
      if (growing.length) {
        ctx.setTransform(S, 0, 0, S, ox * dpr, oy * dpr);
        for (const u of growing) (collecting() ? drawLeaving : scene.drawUnit)(ctx, u, Math.min(1, u.t / unitDur()));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
    if (L.top) ctx.drawImage(L.top.c, 0, 0);
    ctx.setTransform(S, 0, 0, S, ox * dpr, oy * dpr);
    if (scene.liveTop) scene.liveTop(ctx, clock);
    if (weather) {
      if (L.wx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(L.wx.c, 0, 0); ctx.setTransform(S, 0, 0, S, ox * dpr, oy * dpr); }
      drawWeather(ctx);
    }
    for (const g of gems) if (g.state === 1) drawGem(ctx, g, true);
    for (const h of helpers) drawHelper(ctx, h);
    drawParts(ctx);
    if (!done) drawTool(ctx);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCoins(ctx);
  }

  // ------------------------------------------------------------------- api
  function start(choreDef, o) {
    def = choreDef; tier = o.tier; paint = o.paint || paint; speedMult = o.speedMult || 1;
    insets = o.insets || insets;
    measure();
    scene = SCENES.build(def.scene, def.opts, def.seed, bleed());
    puz = null;
    if (scene.puzzle) return startPuzzle(o);
    buildGrid();
    if (o.resume) restoreGrid(o.resume);
    setupUnits();
    weather = makeWeather(o.season, o.indoor || scene.indoor);
    paintLayers(false);
    valuePerCell = o.value / total;
    coinUnit = Math.max(1, o.value / 36);
    coinAcc = 0; earnAcc = 0; stamped = false;
    parts = []; coins = [];
    makeHelpers(o.helpers || 0);
    placeTreasures(o.treasures);
    tool.x = tool.tx = 180; tool.y = tool.ty = Math.min(500, H - 60); tool.a = -Math.PI / 2; tool.down = false; tool.pid = null;
    finishing = null; done = false; clock = 0; stuckT = 0; scanT = 0; leftCells = [];
    running = true; last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false; cancelAnimationFrame(raf);
    release(L); L = null;
    // pay out coins still in flight
    for (const k of coins) cb.onCoinArrive && cb.onCoinArrive(k.v);
    coins = [];
  }
  function setTier(t) { tier = t; for (let i = 0; i < 14; i++) sparkle(tool.x + (Math.random() - 0.5) * 40, tool.y + (Math.random() - 0.5) * 40); }
  // a new colour covers what is painted already too, the way the door will
  // look on the house; otherwise the robots' first strokes stay the old colour
  function setPaint(c) {
    paint = c;
    if (L && def && def.color) scene.clean(L.clean.x, paint);
  }
  // robots come along, or go home in a puff of sparkles
  function setHelpers(n) {
    while (helpers.length > n) { const h = helpers.pop(); for (let i = 0; i < 8; i++) sparkle(h.x + (Math.random() - 0.5) * 22, h.y - 5 + (Math.random() - 0.5) * 22); }
    while (helpers.length < n) helpers.push({ x: tool.x, y: tool.y, a: 0, tx: tool.x, ty: tool.y, timer: 0, bob: Math.random() * 6 });
  }
  const progress = () => (puz ? scene.progress() : total ? cleaned / total : 0);
  // the hint button on a puzzle: one right move glows for a moment
  function hint() { if (puz && running && !finishing) scene.hint(); }
  // a solved puzzle counts at once if play stops before its finish card
  // comes up (Back, or the phone putting the game away in that second)
  function finishNow() {
    if (!puz || done || !running || !scene.solved()) return false;
    if (!finishing) stepPuzzle(0);
    done = true; tool.pid = null; flushEarn(); cb.onDone && cb.onDone();
    return true;
  }

  // test hook: sweep the board in rows with the current tool
  function debugSweep(mode) {
    const rch = TOOLS.reach(tier);
    if (mode === 'stripes') {
      // up and down in columns, like a real mower
      let dir = -1;
      for (let x = rch * 0.9; x <= W; x += rch * 1.8) { sweep(x, dir < 0 ? H : 0, x, dir < 0 ? 0 : H, dir * Math.PI / 2, tier, false); dir = -dir; }
      return;
    }
    for (let pass = 0; pass < 3; pass++) for (let y = 0; y <= H; y += Math.max(4, rch)) sweep(0, y, W, y, 0, tier, false);
  }

  // test hook: one straight stroke with the current tool, in board units
  function debugStroke(x0, y0, x1, y1) { sweep(x0, y0, x1, y1, Math.atan2(y1 - y0, x1 - x0), tier, false); }

  // ------------------------------------------------------- half-done jobs
  // The dirt grid packed as one hex digit per cell, so a job left halfway can
  // pick up where it was; a puzzle keeps its own small state, its layout and
  // what it has paid so far, behind a 'P'.
  function snapshot() {
    if (puz) {
      if (done) return null;
      const s = scene.save();
      return JSON.stringify(s) === puz.fresh ? null : 'P' + JSON.stringify({ seed: def.seed, s, paid: Math.round(puz.paid * 100) / 100 });
    }
    if (!hp || done) return null;
    let out = '';
    for (let k = 0; k < GW * GH; k++) out += inReg[k] ? Math.min(15, Math.ceil(hp[k] * 15)).toString(16) : '-';
    return out;
  }
  function restoreGrid(str) {
    if (!str || str.length !== GW * GH) return;
    cleaned = 0;
    for (let k = 0; k < GW * GH; k++) {
      if (!inReg[k]) continue;
      const v = parseInt(str[k], 16);
      if (Number.isNaN(v)) continue;
      const h = v / 15;
      hp[k] = h; maskImg.data[k * 4 + 3] = Math.round(h * 255);
      if (h <= 0) cleaned++;
    }
    maskDirty = true;
  }

  // test hook: finish at once without waiting for animation frames
  function debugFinish() {
    if (puz) {
      if (!scene.solved()) scene.solveAll();
      finishNow();
      return;
    }
    for (let k = 0; k < GW * GH; k++) if (inReg[k] && hp[k] > 0) clearCell(k);
    for (let i = 0; i < units.length; i++) if (!units[i].done) completeUnit(i, true);
    stepGems(0);
    if (!done) { done = true; flushEarn(); cb.onDone && cb.onDone(); }
  }

  return { init, start, stop, setTier, setPaint, setHelpers, progress, hint, finishNow, toScreen, debugSweep, debugStroke, debugFinish, snapshot, picture, get scale() { return scale; }, get total() { return total; }, get scene() { return scene; } };
})();
