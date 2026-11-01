'use strict';
// Tool families and their tiers, plus the little drawings of each tool.
// Sizes are in board units (the board is 360 wide). A circle tool cleans a
// disc of radius r; a rect tool cleans a band w wide across the direction of
// travel and h deep along it. power = how much of one layer of dirt a single
// pass removes (1 = all of it), speed = how fast the tool can follow a finger.

const TOOLS = (() => {
  const FAM = {
    mow: {
      name: 'Mowers', job: 'Mowing', icon: 'pushmower',
      tiers: [
        { id: 'shears', name: 'Garden shears', shape: 'circle', r: 11, power: 1.0, speed: 170, sprite: 'shears' },
        { id: 'push', name: 'Push mower', shape: 'rect', w: 34, h: 16, power: 1.15, speed: 215, sprite: 'pushmower' },
        { id: 'petrol', name: 'Petrol mower', shape: 'rect', w: 50, h: 22, power: 1.45, speed: 240, sprite: 'petrolmower' },
        { id: 'rideon', name: 'Ride-on mower', shape: 'rect', w: 74, h: 30, power: 1.8, speed: 270, sprite: 'rideon' },
        { id: 'tractor', name: 'Garden tractor', shape: 'rect', w: 100, h: 36, power: 2.2, speed: 290, sprite: 'tractor' },
      ],
    },
    scrub: {
      name: 'Scrubbers', job: 'Scrubbing', icon: 'scrubbrush',
      tiers: [
        { id: 'scrubbrush', name: 'Scrubbing brush', shape: 'circle', r: 10, power: 1.0, speed: 160, sprite: 'scrubbrush' },
        { id: 'wirebrush', name: 'Wire brush', shape: 'circle', r: 15, power: 1.15, speed: 180, sprite: 'wirebrush' },
        { id: 'deck', name: 'Deck scrubber', shape: 'rect', w: 42, h: 18, power: 1.3, speed: 205, sprite: 'deckscrubber' },
        { id: 'washer', name: 'Pressure washer', shape: 'circle', r: 26, power: 1.6, speed: 240, sprite: 'washer' },
        { id: 'turbo', name: 'Turbo washer', shape: 'circle', r: 38, power: 2.0, speed: 265, sprite: 'turbo' },
      ],
    },
    paint: {
      name: 'Paint kit', job: 'Painting', icon: 'roller',
      tiers: [
        { id: 'brush', name: 'Small brush', shape: 'circle', r: 9, power: 1.0, speed: 160, sprite: 'brush' },
        { id: 'widebrush', name: 'Wide brush', shape: 'rect', w: 24, h: 10, power: 1.1, speed: 180, sprite: 'widebrush' },
        { id: 'roller', name: 'Paint roller', shape: 'rect', w: 40, h: 14, power: 1.2, speed: 210, sprite: 'roller' },
        { id: 'bigroller', name: 'Big roller', shape: 'rect', w: 60, h: 18, power: 1.5, speed: 230, sprite: 'bigroller' },
        { id: 'sprayer', name: 'Paint sprayer', shape: 'circle', r: 38, power: 1.7, speed: 260, sprite: 'sprayer' },
      ],
    },
    wash: {
      name: 'Window kit', job: 'Washing', icon: 'squeegee',
      tiers: [
        { id: 'rag', name: 'Old rag', shape: 'circle', r: 11, power: 1.0, speed: 170, sprite: 'rag' },
        { id: 'sponge', name: 'Sponge', shape: 'circle', r: 17, power: 1.15, speed: 190, sprite: 'sponge' },
        { id: 'squeegee', name: 'Squeegee', shape: 'rect', w: 44, h: 10, power: 1.3, speed: 220, sprite: 'squeegee' },
        { id: 'widesqueegee', name: 'Wide squeegee', shape: 'rect', w: 68, h: 12, power: 1.65, speed: 245, sprite: 'widesqueegee' },
      ],
    },
    weed: {
      name: 'Weeding', job: 'Weeding', icon: 'handfork',
      tiers: [
        { id: 'gloves', name: 'Gardening gloves', shape: 'circle', r: 10, power: 1.0, speed: 150, sprite: 'gloves' },
        { id: 'handfork', name: 'Hand fork', shape: 'circle', r: 15, power: 1.15, speed: 170, sprite: 'handfork' },
        { id: 'hoe', name: 'Hoe', shape: 'rect', w: 34, h: 14, power: 1.15, speed: 200, sprite: 'hoe' },
        { id: 'wheelhoe', name: 'Wheel hoe', shape: 'rect', w: 54, h: 18, power: 1.5, speed: 230, sprite: 'wheelhoe' },
      ],
    },
    skim: {
      name: 'Pond nets', job: 'Skimming', icon: 'net',
      tiers: [
        { id: 'net', name: 'Hand net', shape: 'circle', r: 13, power: 1.0, speed: 160, sprite: 'net' },
        { id: 'longnet', name: 'Long net', shape: 'circle', r: 20, power: 1.15, speed: 180, sprite: 'longnet' },
        { id: 'skimmer', name: 'Pond skimmer', shape: 'rect', w: 48, h: 16, power: 1.3, speed: 210, sprite: 'skimmer' },
        { id: 'pondvac', name: 'Pond vacuum', shape: 'circle', r: 34, power: 1.7, speed: 240, sprite: 'pondvac' },
      ],
    },
    dust: {
      name: 'Dusters', job: 'Dusting', icon: 'broom',
      tiers: [
        { id: 'feather', name: 'Feather duster', shape: 'circle', r: 13, power: 1.0, speed: 170, sprite: 'feather' },
        { id: 'broom', name: 'Broom', shape: 'rect', w: 30, h: 12, power: 1.15, speed: 190, sprite: 'broom' },
        { id: 'pushbroom', name: 'Push broom', shape: 'rect', w: 52, h: 14, power: 1.25, speed: 215, sprite: 'pushbroom' },
        { id: 'vacuum', name: 'Vacuum cleaner', shape: 'circle', r: 32, power: 1.7, speed: 245, sprite: 'vacuum' },
      ],
    },
    rake: {
      name: 'Leaf tools', job: 'Raking', icon: 'rake',
      tiers: [
        { id: 'hands', name: 'Bare hands', shape: 'circle', r: 11, power: 1.0, speed: 160, sprite: 'gloves' },
        { id: 'rake', name: 'Rake', shape: 'rect', w: 36, h: 14, power: 1.05, speed: 195, sprite: 'rake' },
        { id: 'blower', name: 'Leaf blower', shape: 'circle', r: 30, power: 1.4, speed: 230, sprite: 'blower' },
        { id: 'leafvac', name: 'Leaf vacuum', shape: 'circle', r: 44, power: 1.8, speed: 255, sprite: 'leafvac' },
      ],
    },
    snow: {
      name: 'Snow tools', job: 'Shovelling', icon: 'shovel',
      tiers: [
        { id: 'mittens', name: 'Warm mittens', shape: 'circle', r: 11, power: 1.0, speed: 160, sprite: 'mittens' },
        { id: 'shovel', name: 'Snow shovel', shape: 'rect', w: 34, h: 14, power: 1.15, speed: 195, sprite: 'shovel' },
        { id: 'wideshovel', name: 'Wide pusher', shape: 'rect', w: 54, h: 16, power: 1.45, speed: 225, sprite: 'wideshovel' },
        { id: 'blower', name: 'Snow blower', shape: 'rect', w: 76, h: 28, power: 1.9, speed: 255, sprite: 'snowblower' },
      ],
    },
  };

  // Price of each tier relative to what the first chore of that family pays.
  const COST_MULT = [0, 0.85, 2.4, 6, 14];

  // ---------------------------------------------------------------- drawing
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h);
  }
  function disc(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function handle(c, x0, x1, wdt, col) {
    c.strokeStyle = U.shade(col, -0.35); c.lineWidth = wdt + 2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, 0); c.lineTo(x1, 0); c.stroke();
    c.strokeStyle = col; c.lineWidth = wdt;
    c.beginPath(); c.moveTo(x0, 0); c.lineTo(x1, 0); c.stroke();
  }
  function wheel(c, x, y, w, h) { c.fillStyle = '#2f2b28'; rr(c, x - w / 2, y - h / 2, w, h, h / 2.5); c.fill(); c.fillStyle = '#58524c'; rr(c, x - w / 2 + 1, y - h / 2 + 1, w - 2, h * 0.35, 1.5); c.fill(); }
  function bristles(c, x, y, w, h, col, n) {
    c.strokeStyle = col; c.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const yy = y - h / 2 + (h * (i + 0.5)) / n;
      c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy + (i % 2 ? 0.6 : -0.6)); c.stroke();
    }
  }

  // Each sprite is drawn with the direction of travel along +x and the tool
  // centred on 0,0. t = the tier object, paint = current paint colour.
  const SPR = {
    shears(c, t) {
      const r = t.r;
      c.fillStyle = '#c8ced6'; c.strokeStyle = '#7d8590'; c.lineWidth = 1;
      c.save(); c.rotate(-0.22); c.beginPath(); c.moveTo(r * 1.1, 0); c.lineTo(-r * 0.3, -2.4); c.lineTo(-r * 0.3, 2); c.closePath(); c.fill(); c.stroke(); c.restore();
      c.save(); c.rotate(0.22); c.beginPath(); c.moveTo(r * 1.1, 0); c.lineTo(-r * 0.3, -2); c.lineTo(-r * 0.3, 2.4); c.closePath(); c.fill(); c.stroke(); c.restore();
      c.fillStyle = '#e8644a'; disc(c, -r * 0.9, -4.5, 3.6); c.fill(); disc(c, -r * 0.9, 4.5, 3.6); c.fill();
      c.fillStyle = '#fbe9e3'; disc(c, -r * 0.9, -4.5, 1.5); c.fill(); disc(c, -r * 0.9, 4.5, 1.5); c.fill();
      c.fillStyle = '#5b636d'; disc(c, -r * 0.2, 0, 1.6); c.fill();
    },
    pushmower(c, t, p, col = '#e2574c') {
      const w = t.w, h = t.h + 6;
      handle(c, -h * 0.4, -h * 1.9, 2.2, '#9aa3ad');
      c.fillStyle = '#9aa3ad'; rr(c, -h * 1.95, -w * 0.32, 3, w * 0.64, 1.5); c.fill();
      c.fillStyle = '#3a3633'; rr(c, -h * 2.05, -w * 0.26, 4, w * 0.52, 2); c.fill();
      wheel(c, h * 0.32, -w / 2 + 1, 7, 4); wheel(c, h * 0.32, w / 2 - 1, 7, 4);
      wheel(c, -h * 0.32, -w / 2 + 1, 7, 4); wheel(c, -h * 0.32, w / 2 - 1, 7, 4);
      c.fillStyle = U.shade(col, -0.3); rr(c, -h / 2, -w / 2 + 2, h, w - 4, 6); c.fill();
      c.fillStyle = col; rr(c, -h / 2 + 1, -w / 2 + 3, h - 2, w - 7, 5); c.fill();
      c.fillStyle = U.shade(col, 0.35); rr(c, -h / 2 + 3, -w / 2 + 5, h * 0.35, w - 12, 3); c.fill();
    },
    petrolmower(c, t) {
      SPR.pushmower(c, t, null, '#f0913a');
      const h = t.h;
      c.fillStyle = '#3c3c42'; disc(c, -h * 0.05, 0, h * 0.38); c.fill();
      c.fillStyle = '#6d6d78'; disc(c, -h * 0.05, 0, h * 0.25); c.fill();
      c.fillStyle = '#fff3'; disc(c, -h * 0.12, -h * 0.08, h * 0.1); c.fill();
    },
    rideon(c, t, p, col = '#3f9b5a') {
      const w = t.w, h = t.h;
      c.fillStyle = '#56606a'; rr(c, -h * 0.25, -w / 2, h * 0.9, w, 6); c.fill();
      c.fillStyle = '#6f7a84'; rr(c, -h * 0.2, -w / 2 + 2, h * 0.8, w - 4, 5); c.fill();
      wheel(c, -h * 0.9, -w * 0.3, 14, 8); wheel(c, -h * 0.9, w * 0.3, 14, 8);
      wheel(c, h * 0.55, -w * 0.22, 10, 6); wheel(c, h * 0.55, w * 0.22, 10, 6);
      c.fillStyle = U.shade(col, -0.3); rr(c, -h * 1.15, -w * 0.24, h * 2.0, w * 0.48, 8); c.fill();
      c.fillStyle = col; rr(c, -h * 1.1, -w * 0.22, h * 1.9, w * 0.44, 7); c.fill();
      c.fillStyle = '#fbd85c'; rr(c, h * 0.35, -w * 0.18, h * 0.4, w * 0.36, 4); c.fill();
      c.fillStyle = '#2d2a28'; rr(c, -h * 0.85, -w * 0.15, h * 0.55, w * 0.3, 5); c.fill();
      c.strokeStyle = '#2d2a28'; c.lineWidth = 2.2; disc(c, -h * 0.05, 0, w * 0.07); c.stroke();
    },
    tractor(c, t) { SPR.rideon(c, t, null, '#d94c3d'); },
    scrubbrush(c, t) {
      const r = t.r;
      c.fillStyle = '#efe1bf'; c.beginPath(); c.ellipse(0, 0, r * 1.05, r * 0.8, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#c98a55'; c.beginPath(); c.ellipse(0, 0, r * 0.85, r * 0.6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e0a876'; c.beginPath(); c.ellipse(-r * 0.15, -r * 0.15, r * 0.5, r * 0.3, 0, 0, Math.PI * 2); c.fill();
    },
    wirebrush(c, t) {
      const r = t.r;
      handle(c, -r * 0.6, -r * 2.2, 4, '#c98a55');
      c.fillStyle = '#b8bec6'; rr(c, -r * 0.7, -r * 0.95, r * 1.6, r * 1.9, 4); c.fill();
      c.fillStyle = '#8b5a33'; rr(c, -r * 0.55, -r * 0.8, r * 1.3, r * 1.6, 3); c.fill();
      c.fillStyle = '#a8703f'; rr(c, -r * 0.45, -r * 0.7, r * 0.5, r * 1.4, 2); c.fill();
    },
    deckscrubber(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.3, -h * 3.2, 3, '#e6c17d');
      c.fillStyle = '#d9d2c3'; rr(c, -h / 2, -w / 2, h, w, 4); c.fill();
      c.fillStyle = '#3d86c6'; rr(c, -h / 2 + 2, -w / 2 + 2, h - 6, w - 4, 4); c.fill();
      c.fillStyle = '#6aa8de'; rr(c, -h / 2 + 3, -w / 2 + 3, h * 0.3, w - 6, 2); c.fill();
    },
    washer(c, t, p, mist = '#d8efff') {
      const r = t.r;
      c.fillStyle = U.rgba(mist, 0.35); disc(c, 0, 0, r); c.fill();
      c.fillStyle = U.rgba('#ffffff', 0.35); disc(c, r * 0.1, 0, r * 0.6); c.fill();
      c.strokeStyle = '#343a42'; c.lineWidth = 3.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * 0.3, 0); c.lineTo(-r * 1.8, 0); c.stroke();
      c.fillStyle = '#f2c230'; rr(c, -r * 2.1, -5, 12, 10, 3); c.fill();
      c.fillStyle = '#343a42'; rr(c, -r * 0.38, -2.5, 6, 5, 2); c.fill();
    },
    turbo(c, t) { SPR.washer(c, t, null, '#ffe9a8'); },
    brush(c, t, paint) {
      const r = t.r;
      handle(c, -r * 0.8, -r * 3.2, 3.5, '#d9a066');
      c.fillStyle = '#c6ccd3'; rr(c, -r * 1.05, -r * 0.62, r * 0.7, r * 1.24, 2); c.fill();
      c.fillStyle = '#4a3b2f'; rr(c, -r * 0.45, -r * 0.6, r * 1.1, r * 1.2, 3); c.fill();
      c.fillStyle = paint || '#ccc'; rr(c, r * 0.15, -r * 0.6, r * 0.75, r * 1.2, 3); c.fill();
    },
    widebrush(c, t, paint) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.6, -h * 3.4, 4.5, '#d9a066');
      c.fillStyle = '#c6ccd3'; rr(c, -h * 0.9, -w / 2 + 1, h * 0.55, w - 2, 2); c.fill();
      c.fillStyle = '#4a3b2f'; rr(c, -h * 0.4, -w / 2, h * 0.9, w, 3); c.fill();
      c.fillStyle = paint || '#ccc'; rr(c, h * 0.1, -w / 2, h * 0.45, w, 3); c.fill();
    },
    roller(c, t, paint) {
      const w = t.w, h = t.h;
      c.strokeStyle = '#8f99a3'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-h * 0.1, -w / 2 - 2); c.lineTo(-h * 0.8, -w / 2 - 2); c.lineTo(-h * 0.8, 0); c.lineTo(-h * 2.6, 0); c.stroke();
      c.fillStyle = '#e8b04a'; rr(c, -h * 3.6, -3, h * 1.2, 6, 3); c.fill();
      c.fillStyle = U.shade(paint || '#ccc', -0.25); rr(c, -h / 2, -w / 2, h, w, h / 2.2); c.fill();
      c.fillStyle = paint || '#ccc'; rr(c, -h / 2 + 1, -w / 2 + 1, h - 3, w - 2, h / 2.4); c.fill();
      c.fillStyle = '#fff4'; rr(c, -h / 2 + 2, -w / 2 + 3, h * 0.25, w - 6, 2); c.fill();
    },
    bigroller(c, t, paint) { SPR.roller(c, t, paint); },
    sprayer(c, t, paint) {
      const r = t.r;
      c.fillStyle = U.rgba(paint || '#ccc', 0.3); disc(c, 0, 0, r); c.fill();
      c.fillStyle = U.rgba(paint || '#ccc', 0.35); disc(c, 0, 0, r * 0.6); c.fill();
      c.fillStyle = '#38404a'; rr(c, -r * 0.55, -4, r * 0.45, 8, 3); c.fill();
      c.fillStyle = '#e4e8ec'; rr(c, -r * 1.3, -6, r * 0.8, 12, 4); c.fill();
      c.fillStyle = '#4b88c9'; rr(c, -r * 1.25, -4, r * 0.3, 8, 2); c.fill();
    },
    rag(c, t) {
      const r = t.r;
      c.fillStyle = '#6fa3d6'; c.beginPath();
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr2 = r * (0.85 + (i % 2) * 0.25); c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
      c.closePath(); c.fill();
      c.strokeStyle = '#4c80b5'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-r * 0.5, -r * 0.3); c.quadraticCurveTo(0, 0, r * 0.4, -r * 0.4); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.4, r * 0.4); c.quadraticCurveTo(r * 0.1, r * 0.1, r * 0.5, r * 0.3); c.stroke();
    },
    sponge(c, t) {
      const r = t.r;
      c.fillStyle = '#5cae5a'; rr(c, -r * 0.95, -r * 0.75, r * 1.9, r * 1.5, 5); c.fill();
      c.fillStyle = '#f7d54a'; rr(c, -r * 0.95, -r * 0.75, r * 1.9, r * 1.05, 5); c.fill();
      c.fillStyle = '#d9b42e';
      for (let i = 0; i < 7; i++) { disc(c, -r * 0.6 + (i % 4) * r * 0.4, -r * 0.45 + ((i / 4) | 0) * r * 0.45, 1.3); c.fill(); }
    },
    squeegee(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.3, -h * 3.4, 4, '#3b82c4');
      c.fillStyle = '#c7cdd4'; rr(c, -h * 0.55, -w / 2, h * 0.6, w, 2); c.fill();
      c.fillStyle = '#2b2b30'; rr(c, 0, -w / 2, h * 0.35, w, 1.5); c.fill();
    },
    widesqueegee(c, t) { SPR.squeegee(c, t); },
    gloves(c, t) {
      const r = t.r;
      c.fillStyle = '#7cb36a';
      rr(c, -r * 0.9, -r * 0.6, r * 1.3, r * 1.2, r * 0.45); c.fill();
      for (let i = 0; i < 4; i++) { rr(c, r * 0.2, -r * 0.6 + i * r * 0.32, r * 0.75, r * 0.26, r * 0.13); c.fill(); }
      rr(c, -r * 0.4, -r * 0.95, r * 0.6, r * 0.3, r * 0.15); c.fill();
      c.fillStyle = '#f3ead6'; rr(c, -r * 1.2, -r * 0.55, r * 0.4, r * 1.1, 3); c.fill();
    },
    handfork(c, t) {
      const r = t.r;
      handle(c, -r * 0.6, -r * 2.2, 5, '#d38b4f');
      c.strokeStyle = '#a9b0b8'; c.lineWidth = 2.5; c.lineCap = 'round';
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-r * 0.55, i * r * 0.2); c.lineTo(r * 0.9, i * r * 0.55); c.stroke(); }
    },
    hoe(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.2, -h * 4, 3.5, '#d9a066');
      c.fillStyle = '#9aa3ad'; rr(c, -h * 0.25, -w / 2, h * 0.7, w, 2); c.fill();
      c.fillStyle = '#c6ccd3'; rr(c, h * 0.2, -w / 2, h * 0.2, w, 1); c.fill();
    },
    wheelhoe(c, t) { SPR.hoe(c, t); const h = t.h; wheel(c, -h * 1.2, 0, 12, 5); },
    net(c, t) {
      const r = t.r;
      handle(c, -r * 0.95, -r * 2.8, 3, '#d9a066');
      c.fillStyle = 'rgba(240,240,230,0.25)'; disc(c, 0, 0, r); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
      for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * r / 3.5, -r); c.lineTo(i * r / 3.5, r); c.stroke(); c.beginPath(); c.moveTo(-r, i * r / 3.5); c.lineTo(r, i * r / 3.5); c.stroke(); }
      c.strokeStyle = '#5a6570'; c.lineWidth = 2.2; disc(c, 0, 0, r); c.stroke();
    },
    longnet(c, t) { SPR.net(c, t); },
    skimmer(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.5, -h * 4, 3, '#d9a066');
      c.fillStyle = 'rgba(240,240,230,0.25)'; rr(c, -h / 2, -w / 2, h, w, 3); c.fill();
      c.strokeStyle = '#5a6570'; c.lineWidth = 2; rr(c, -h / 2, -w / 2, h, w, 3); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.6;
      for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(-h / 2, -w / 2 + (w * i) / 8); c.lineTo(h / 2, -w / 2 + (w * i) / 8); c.stroke(); }
    },
    pondvac(c, t) {
      const r = t.r;
      c.strokeStyle = '#4f5a66'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * 0.6, 0); c.quadraticCurveTo(-r * 1.4, r * 0.4, -r * 2, 0); c.stroke();
      c.fillStyle = 'rgba(200,235,255,0.25)'; disc(c, 0, 0, r); c.fill();
      c.fillStyle = '#3c9d8e'; disc(c, 0, 0, r * 0.55); c.fill();
      c.fillStyle = '#5cc4b3'; disc(c, -r * 0.1, -r * 0.1, r * 0.35); c.fill();
    },
    feather(c, t) {
      const r = t.r;
      handle(c, -r * 0.7, -r * 2.6, 3, '#8a5a3c');
      const cols = ['#f2a7b8', '#e98aa2', '#f7c6d1'];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        c.fillStyle = cols[i % 3];
        c.beginPath(); c.ellipse(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.55, r * 0.28, a, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = '#fbe0e6'; disc(c, 0, 0, r * 0.35); c.fill();
    },
    broom(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.4, -h * 4.2, 3.5, '#c98a55');
      c.fillStyle = '#d8b25e'; c.beginPath();
      c.moveTo(-h * 0.5, -w * 0.2); c.lineTo(h * 0.6, -w / 2); c.lineTo(h * 0.6, w / 2); c.lineTo(-h * 0.5, w * 0.2); c.closePath(); c.fill();
      bristles(c, -h * 0.3, 0, h * 0.9, w * 0.9, '#b88f3c', 9);
      c.fillStyle = '#c0453b'; rr(c, -h * 0.55, -w * 0.22, 4, w * 0.44, 2); c.fill();
    },
    pushbroom(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.2, -h * 4.4, 3.5, '#c98a55');
      c.fillStyle = '#7b5536'; rr(c, -h * 0.5, -w / 2, h * 0.6, w, 3); c.fill();
      c.fillStyle = '#2f2b28'; rr(c, h * 0.1, -w / 2, h * 0.45, w, 2); c.fill();
    },
    vacuum(c, t) {
      const r = t.r;
      c.strokeStyle = '#5b6470'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * 0.7, 0); c.quadraticCurveTo(-r * 1.4, -r * 0.5, -r * 2.1, -r * 0.1); c.stroke();
      c.fillStyle = '#d64f6c'; disc(c, 0, 0, r * 0.75); c.fill();
      c.fillStyle = '#ef7c94'; disc(c, -r * 0.1, -r * 0.12, r * 0.5); c.fill();
      c.fillStyle = '#3a3438'; disc(c, 0, 0, r * 0.2); c.fill();
    },
    rake(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.1, -h * 4, 3.5, '#d9a066');
      c.strokeStyle = '#7e8790'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -w / 2); c.lineTo(0, w / 2); c.stroke();
      c.lineWidth = 1.5;
      for (let i = 0; i <= 8; i++) { const y = -w / 2 + (w * i) / 8; c.beginPath(); c.moveTo(0, y); c.lineTo(h * 0.55, y); c.stroke(); }
    },
    blower(c, t) {
      const r = t.r;
      c.fillStyle = 'rgba(255,255,255,0.22)'; disc(c, 0, 0, r); c.fill();
      c.strokeStyle = '#e56e2f'; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * 0.4, 0); c.lineTo(-r * 1.7, 0); c.stroke();
      c.fillStyle = '#3c3c42'; rr(c, -r * 2.2, -7, 14, 14, 4); c.fill();
    },
    leafvac(c, t) { SPR.blower(c, t); },
    mittens(c, t) {
      const r = t.r;
      c.fillStyle = '#d9534f'; rr(c, -r * 0.9, -r * 0.65, r * 1.7, r * 1.3, r * 0.6); c.fill();
      rr(c, -r * 0.2, -r * 1.0, r * 0.55, r * 0.5, r * 0.25); c.fill();
      c.fillStyle = '#fff'; rr(c, -r * 1.25, -r * 0.6, r * 0.45, r * 1.2, 3); c.fill();
      c.fillStyle = '#f2a39f'; for (let i = 0; i < 3; i++) { disc(c, -r * 0.3 + i * r * 0.35, r * 0.1, 1.4); c.fill(); }
    },
    shovel(c, t, p, col = '#3d86c6') {
      const w = t.w, h = t.h;
      handle(c, -h * 0.4, -h * 3.6, 3.5, '#d9a066');
      c.fillStyle = '#2f2b28'; rr(c, -h * 3.9, -w * 0.18, 5, w * 0.36, 2); c.fill();
      c.fillStyle = U.shade(col, -0.25); rr(c, -h * 0.5, -w / 2, h, w, 3); c.fill();
      c.fillStyle = col; rr(c, -h * 0.45, -w / 2 + 1.5, h * 0.8, w - 3, 3); c.fill();
      c.fillStyle = '#c6ccd3'; rr(c, h * 0.35, -w / 2, h * 0.18, w, 1); c.fill();
    },
    wideshovel(c, t) { SPR.shovel(c, t, null, '#e2574c'); },
    snowblower(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.4, -h * 1.8, 2.2, '#9aa3ad');
      c.fillStyle = '#3a3633'; rr(c, -h * 1.9, -w * 0.28, 4, w * 0.56, 2); c.fill();
      wheel(c, -h * 0.35, -w * 0.32, 10, 6); wheel(c, -h * 0.35, w * 0.32, 10, 6);
      c.fillStyle = '#c94a3d'; rr(c, -h * 0.55, -w * 0.3, h * 0.8, w * 0.6, 6); c.fill();
      c.fillStyle = '#2f2b28'; rr(c, h * 0.15, -w / 2, h * 0.45, w, 4); c.fill();
      c.fillStyle = '#e0e4e8'; rr(c, h * 0.2, -w / 2 + 3, h * 0.3, w - 6, 3); c.fill();
      c.strokeStyle = '#2f2b28'; c.lineWidth = 3; c.beginPath(); c.moveTo(-h * 0.2, w * 0.15); c.quadraticCurveTo(-h * 0.2, w * 0.5, -h * 0.9, w * 0.55); c.stroke();
    },
  };

  function drawSprite(c, tier, paint) {
    const f = SPR[tier.sprite];
    if (f) f(c, tier, paint);
  }

  // Shed icon: draw the tool pointing up, scaled to fit a square.
  function icon(tier, size, paint) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cv = U.canvas(size * dpr, size * dpr);
    const c = cv.getContext('2d');
    const ext = tier.shape === 'rect' ? Math.max(tier.w, tier.h * 4.5) : tier.r * 3.6;
    const s = (size * 0.86) / ext;
    c.setTransform(dpr * s, 0, 0, dpr * s, (cv.width) / 2, (cv.height) / 2 + (tier.shape === 'rect' ? size * 0.12 : size * 0.1) * dpr);
    c.rotate(-Math.PI / 2);
    drawSprite(c, tier, paint || '#9cc5a1');
    cv.style.width = cv.style.height = size + 'px';
    return cv;
  }

  function reach(tier) { return tier.shape === 'rect' ? tier.w / 2 : tier.r; }

  return { FAM, COST_MULT, drawSprite, icon, reach };
})();
