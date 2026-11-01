'use strict';
// The chore engine: one full-screen canvas, a grid of dirt cells, a tool that
// follows the finger and wipes cells, particles, helper robots, coins.
//
// Layers (all full-screen canvases at device resolution, same transform):
//   decor -> clean -> cleanOver -> live (per frame) -> dirt masked by grid
//   -> top -> helpers/particles/tool (per frame) -> flying coins (screen space)

const ENGINE = (() => {
  const W = SCENES.W, H = SCENES.H, CELL = 3;
  const GW = W / CELL, GH = H / CELL;
  const OFFSET = 30; // tool sits this far above the finger so it stays visible

  let cv, ctx, cb = {};
  let dpr = 1, vw = 0, vh = 0, scale = 1, ox = 0, oy = 0;
  let L = null; // layers
  let scene = null, def = null, tier = null, paint = '#9cc5a1';
  let hp, tough, inReg, total = 0, cleaned = 0, valuePerCell = 0, coinUnit = 1, coinAcc = 0;
  let maskCv, maskCx, maskImg, maskDirty = false;
  const tool = { x: 180, y: 480, a: -Math.PI / 2, tx: 180, ty: 480, down: false, pid: null, vib: 0 };
  let parts = [], coins = [], helpers = [];
  let running = false, raf = 0, last = 0, clock = 0, finishing = null, done = false;
  let activity = 0, smoothAct = 0, insets = { top: 70, bottom: 110 };
  let speedMult = 1;

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

  function paintLayers(keepClean) {
    const old = L;
    L = { decor: layer(), clean: layer(), dirt: layer(), comp: layer() };
    scene.decor(L.decor.x);
    if (keepClean && old) {
      // carry stripes and paint across a resize
      const k = (scale * dpr) / old.k;
      L.clean.x.save(); L.clean.x.setTransform(1, 0, 0, 1, 0, 0);
      L.clean.x.drawImage(old.clean.c, ox * dpr - old.ox * k, oy * dpr - old.oy * k, old.clean.c.width * k, old.clean.c.height * k);
      L.clean.x.restore();
    }
    L.clean.x.save(); L.clean.x.clip(scene.region, 'evenodd'); // clean layer and stamps stay inside the region
    if (!(keepClean && old)) scene.clean(L.clean.x, paint);
    if (scene.cleanOver) { L.over = layer(); L.over.x.save(); L.over.x.clip(scene.region, 'evenodd'); scene.cleanOver(L.over.x); L.over.x.restore(); }
    L.dirt.x.save(); L.dirt.x.clip(scene.region, 'evenodd'); scene.dirt(L.dirt.x); L.dirt.x.restore();
    if (scene.top) { L.top = layer(); scene.top(L.top.x); }
    if (scene.depth) L.shadow = layer();
    L.k = scale * dpr; L.ox = ox * dpr; L.oy = oy * dpr;
    maskDirty = true;
  }

  function relayout() {
    measure();
    paintLayers(true);
  }

  // ------------------------------------------------------------------- grid
  function buildGrid() {
    const g = U.canvas(GW, GH), gx = g.getContext('2d');
    gx.setTransform(1 / CELL, 0, 0, 1 / CELL, 0, 0);
    gx.fillStyle = '#000'; gx.fill(scene.region, 'evenodd');
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
    hp[k] = v;
    maskImg.data[k * 4 + 3] = Math.round(v * 255);
    maskDirty = true;
  }

  function clearCell(k) {
    setCell(k, 0);
    cleaned++;
    const x = ((k % GW) + 0.5) * CELL, y = (((k / GW) | 0) + 0.5) * CELL;
    cb.onEarn && cb.onEarn(valuePerCell);
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
      }
    }
    if (scene.stamp && !isHelper) scene.stamp(L.clean.x, x, y, a, t, paint);
    else if (scene.stamp && isHelper) scene.stamp(L.clean.x, x, y, a, t, paint, true);
    return removed;
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
  function onDown(e) {
    if (!running || done || tool.pid !== null) return;
    tool.pid = e.pointerId;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    const p = toBoard(e);
    tool.tx = U.clamp(p.x, -10, W + 10); tool.ty = U.clamp(p.y - OFFSET, -10, H + 10);
    tool.x = tool.tx; tool.y = tool.ty;
    tool.down = true;
    cb.onTouch && cb.onTouch();
    e.preventDefault();
  }
  function onMove(e) {
    if (e.pointerId !== tool.pid) return;
    const p = toBoard(e);
    tool.tx = U.clamp(p.x, -10, W + 10); tool.ty = U.clamp(p.y - OFFSET, -10, H + 10);
    e.preventDefault();
  }
  function onUp(e) {
    if (e.pointerId !== tool.pid) return;
    tool.pid = null; tool.down = false;
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
      const g = p.kind === 'suds' || p.kind === 'dust' || p.kind === 'spark' ? -10 : p.kind === 'water' ? 0 : 160;
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
      } else if (p.kind === 'spark') {
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
    TOOLS.drawSprite(c, tier, paint);
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
        let ok = true;
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
    finishing = { t: 0, dur: 1.1, cells: left, idx: 0, hold: 0 };
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
      if (scene.stamp) scene.stamp(L.clean.x, x, y, -Math.PI / 2, dot, paint, true);
      if (Math.random() < 0.25) sparkle(x, y);
    }
    if (f.t >= f.dur) {
      f.hold += dt;
      if (f.hold > 0.45 && !done) { done = true; tool.down = false; tool.pid = null; cb.onDone && cb.onDone(); }
    }
  }

  // near the end, make the last dirty spots twinkle so nobody has to hunt
  let hintT = 0;
  function hintLeftovers(dt) {
    hintT -= dt;
    if (hintT > 0) return;
    hintT = 0.12;
    for (let s = 0; s < 400; s++) {
      const k = (Math.random() * GW * GH) | 0;
      if (inReg[k] && hp[k] > 0) { sparkle(((k % GW) + 0.5) * CELL, (((k / GW) | 0) + 0.5) * CELL); return; }
    }
  }

  // ------------------------------------------------------------------- loop
  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now; clock += dt;
    activity = 0;
    if (!finishing) {
      activity += stepTool(dt);
      if (helpers.length) stepHelpers(dt);
      if (cleaned / total >= 0.97) beginFinish();
      else if (cleaned / total > 0.85) hintLeftovers(dt);
    } else stepFinish(dt);
    stepGems(dt);
    stepParts(dt); stepCoins(dt);
    smoothAct += (Math.min(1, activity / 6) - smoothAct) * Math.min(1, dt * 10);
    cb.onActivity && cb.onActivity(tool.down ? smoothAct : 0, tool.down);
    cb.onProgress && cb.onProgress(cleaned / total);
    render();
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
    if (maskDirty) {
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
    if (L.shadow) ctx.drawImage(L.shadow.c, 1.2 * S, 2.4 * S);
    ctx.drawImage(L.comp.c, 0, 0);
    if (L.top) ctx.drawImage(L.top.c, 0, 0);
    ctx.setTransform(S, 0, 0, S, ox * dpr, oy * dpr);
    if (scene.liveTop) scene.liveTop(ctx, clock);
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
    buildGrid();
    paintLayers(false);
    valuePerCell = o.value / total;
    coinUnit = Math.max(1, o.value / 36);
    coinAcc = 0;
    parts = []; coins = [];
    makeHelpers(o.helpers || 0);
    placeTreasures(o.treasures);
    tool.x = tool.tx = 180; tool.y = tool.ty = Math.min(500, H - 60); tool.a = -Math.PI / 2; tool.down = false; tool.pid = null;
    finishing = null; done = false; clock = 0;
    running = true; last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false; cancelAnimationFrame(raf);
    // pay out coins still in flight
    for (const k of coins) cb.onCoinArrive && cb.onCoinArrive(k.v);
    coins = [];
  }
  function setTier(t) { tier = t; for (let i = 0; i < 14; i++) sparkle(tool.x + (Math.random() - 0.5) * 40, tool.y + (Math.random() - 0.5) * 40); }
  function setPaint(c) { paint = c; }
  function setHelpers(n) { while (helpers.length < n) helpers.push({ x: tool.x, y: tool.y, a: 0, tx: tool.x, ty: tool.y, timer: 0, bob: Math.random() * 6 }); }
  const progress = () => (total ? cleaned / total : 0);

  // test hook: sweep the board in rows with the current tool
  function debugSweep(rows = 40) {
    const rch = TOOLS.reach(tier);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y <= H; y += Math.max(4, rch)) {
        sweep(0, y, W, y, 0, tier, false);
        if (y > rows * 1000) break;
      }
    }
  }

  // test hook: finish at once without waiting for animation frames
  function debugFinish() {
    for (let k = 0; k < GW * GH; k++) if (inReg[k] && hp[k] > 0) clearCell(k);
    stepGems(0);
    if (!done) { done = true; cb.onDone && cb.onDone(); }
  }

  return { init, start, stop, setTier, setPaint, setHelpers, progress, toScreen, debugSweep, debugFinish, get scale() { return scale; }, get total() { return total; } };
})();
