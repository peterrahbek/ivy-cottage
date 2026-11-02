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
    plant: {
      name: 'Planting', job: 'Planting', icon: 'trowel',
      tiers: [
        { id: 'trowel', name: 'Trowel', shape: 'circle', r: 11, power: 1.0, speed: 160, sprite: 'trowel' },
        { id: 'can', name: 'Watering can', shape: 'circle', r: 17, power: 1.15, speed: 185, sprite: 'wateringcan' },
        { id: 'tray', name: 'Seedling tray', shape: 'rect', w: 44, h: 16, power: 1.35, speed: 215, sprite: 'seedtray' },
        { id: 'cart', name: 'Planting cart', shape: 'rect', w: 66, h: 24, power: 1.7, speed: 240, sprite: 'plantcart' },
      ],
    },
    build: {
      name: 'Building', job: 'Building', icon: 'hammer',
      tiers: [
        { id: 'hammer', name: 'Hammer', shape: 'circle', r: 11, power: 1.0, speed: 160, sprite: 'hammer' },
        { id: 'mallet', name: 'Rubber mallet', shape: 'circle', r: 17, power: 1.15, speed: 185, sprite: 'mallet' },
        { id: 'nailgun', name: 'Nail gun', shape: 'rect', w: 44, h: 16, power: 1.35, speed: 215, sprite: 'nailgun' },
        { id: 'robo', name: 'Robo-builder', shape: 'rect', w: 66, h: 26, power: 1.7, speed: 240, sprite: 'robobuilder' },
      ],
    },
    collect: {
      name: 'Beach tools', job: 'Tidying', icon: 'picker',
      tiers: [
        { id: 'hands', name: 'Bare hands', shape: 'circle', r: 12, power: 1.0, speed: 160, sprite: 'gloves' },
        { id: 'picker', name: 'Litter picker', shape: 'circle', r: 17, power: 1.15, speed: 185, sprite: 'picker' },
        { id: 'bucket', name: 'Beach bucket', shape: 'circle', r: 24, power: 1.35, speed: 210, sprite: 'beachbucket' },
        { id: 'sifter', name: 'Sand sifter', shape: 'rect', w: 58, h: 22, power: 1.7, speed: 240, sprite: 'sifter' },
      ],
    },
    polish: {
      name: 'Polishing kit', job: 'Polishing', icon: 'buffer',
      tiers: [
        { id: 'cloth', name: 'Soft cloth', shape: 'circle', r: 12, power: 1.0, speed: 160, sprite: 'cloth' },
        { id: 'pad', name: 'Wax pad', shape: 'circle', r: 17, power: 1.15, speed: 185, sprite: 'waxpad' },
        { id: 'buffer', name: 'Orbital buffer', shape: 'circle', r: 26, power: 1.4, speed: 215, sprite: 'buffer' },
        { id: 'twin', name: 'Twin polisher', shape: 'rect', w: 62, h: 26, power: 1.75, speed: 240, sprite: 'twinbuffer' },
      ],
    },
    arrange: {
      name: 'Helping hands', job: 'Arranging', icon: 'basket',
      tiers: [
        { id: 'hands', name: 'Your hands', shape: 'circle', r: 12, power: 1.0, speed: 160, sprite: 'gloves' },
        { id: 'basket', name: 'Basket', shape: 'circle', r: 17, power: 1.15, speed: 185, sprite: 'basket' },
        { id: 'trolley', name: 'Trolley', shape: 'rect', w: 46, h: 18, power: 1.35, speed: 215, sprite: 'trolley' },
        { id: 'stockbot', name: 'Stock-bot', shape: 'rect', w: 64, h: 24, power: 1.7, speed: 240, sprite: 'robobuilder' },
      ],
    },
    // the coffee machine and the café tables want kitchen things, not a squeegee
    wipe: {
      name: 'Café cloths', job: 'Wiping', icon: 'spraywipe',
      tiers: [
        { id: 'dishcloth', name: 'Dishcloth', shape: 'circle', r: 11, power: 1.0, speed: 170, sprite: 'dishcloth' },
        { id: 'scourer', name: 'Scrubby sponge', shape: 'circle', r: 16, power: 1.15, speed: 190, sprite: 'sponge' },
        { id: 'spray', name: 'Spray and wipe', shape: 'circle', r: 22, power: 1.35, speed: 215, sprite: 'spraywipe' },
        { id: 'steam', name: 'Steam cleaner', shape: 'circle', r: 30, power: 1.7, speed: 240, sprite: 'steamer' },
      ],
    },
    groom: {
      name: 'Dog bath', job: 'Bathing', icon: 'shower',
      tiers: [
        { id: 'bathsponge', name: 'Bath sponge', shape: 'circle', r: 13, power: 1.0, speed: 165, sprite: 'bathsponge' },
        { id: 'dogbrush', name: 'Dog brush', shape: 'rect', w: 30, h: 12, power: 1.15, speed: 190, sprite: 'dogbrush' },
        { id: 'shower', name: 'Shower hose', shape: 'circle', r: 24, power: 1.4, speed: 215, sprite: 'shower' },
        { id: 'bubbles', name: 'Bubble shower', shape: 'circle', r: 32, power: 1.75, speed: 240, sprite: 'bubbleshower' },
      ],
    },
    // pouring coffee at the café
    brew: {
      name: 'Coffee pots', job: 'Pouring', icon: 'coffeepot',
      tiers: [
        { id: 'pot', name: 'Coffee pot', shape: 'circle', r: 11, power: 1.0, speed: 165, sprite: 'coffeepot' },
        { id: 'press', name: 'Big cafetière', shape: 'circle', r: 16, power: 1.15, speed: 185, sprite: 'cafetiere' },
        { id: 'jugs', name: 'Coffee and milk', shape: 'rect', w: 40, h: 16, power: 1.35, speed: 210, sprite: 'twojugs' },
        { id: 'cart', name: 'Barista trolley', shape: 'rect', w: 58, h: 24, power: 1.7, speed: 235, sprite: 'baristacart' },
      ],
    },
    // the animals' food and water, and fish for the seals
    feed: {
      name: 'Feeding', job: 'Feeding', icon: 'scoop',
      tiers: [
        { id: 'scoop', name: 'Scoop', shape: 'circle', r: 12, power: 1.0, speed: 165, sprite: 'scoop' },
        { id: 'bigscoop', name: 'Big scoop', shape: 'circle', r: 17, power: 1.15, speed: 185, sprite: 'bigscoop' },
        { id: 'bucket', name: 'Feed bucket', shape: 'circle', r: 24, power: 1.35, speed: 210, sprite: 'feedbucket' },
        { id: 'trolley', name: 'Feed trolley', shape: 'rect', w: 58, h: 24, power: 1.7, speed: 235, sprite: 'feedcart' },
      ],
    },
    // the dogs themselves trot along the path; a better lead takes more of them
    walk: {
      name: 'Dog leads', job: 'Walking', icon: 'walk2',
      tiers: [
        { id: 'lead', name: 'A lead', shape: 'circle', r: 12, power: 1.0, speed: 170, sprite: 'walk1' },
        { id: 'double', name: 'A double lead', shape: 'circle', r: 17, power: 1.15, speed: 190, sprite: 'walk2' },
        { id: 'triple', name: 'A triple lead', shape: 'circle', r: 23, power: 1.35, speed: 210, sprite: 'walk3' },
        { id: 'belt', name: 'A walking belt', shape: 'circle', r: 30, power: 1.7, speed: 235, sprite: 'walk4' },
      ],
    },
    brush: {
      name: 'Pet brushes', job: 'Brushing', icon: 'slicker',
      tiers: [
        { id: 'soft', name: 'Soft brush', shape: 'circle', r: 11, power: 1.0, speed: 165, sprite: 'softbrush' },
        { id: 'slicker', name: 'Slicker brush', shape: 'rect', w: 28, h: 12, power: 1.15, speed: 185, sprite: 'slicker' },
        { id: 'mitt', name: 'Grooming mitt', shape: 'circle', r: 20, power: 1.35, speed: 210, sprite: 'mitt' },
        { id: 'double', name: 'Double brush', shape: 'rect', w: 46, h: 16, power: 1.7, speed: 235, sprite: 'doublebrush' },
      ],
    },
    muck: {
      name: 'Mucking out', job: 'Mucking out', icon: 'pitchfork',
      tiers: [
        { id: 'handfork', name: 'Hand fork', shape: 'circle', r: 11, power: 1.0, speed: 160, sprite: 'handfork' },
        { id: 'pitchfork', name: 'Pitchfork', shape: 'rect', w: 30, h: 12, power: 1.15, speed: 185, sprite: 'pitchfork' },
        { id: 'shovel', name: 'Straw shovel', shape: 'rect', w: 44, h: 16, power: 1.35, speed: 210, sprite: 'strawshovel' },
        { id: 'barrow', name: 'Wheelbarrow', shape: 'rect', w: 60, h: 24, power: 1.7, speed: 235, sprite: 'barrow' },
      ],
    },
    // the puzzle room needs no tools and no machines: it is all done by hand
    think: {
      name: 'Your hands', job: 'Thinking', icon: 'hand', hands: true,
      tiers: [
        { id: 'hands', name: 'Your own two hands', shape: 'circle', r: 12, power: 1.0, speed: 200, sprite: 'hand' },
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
    trowel(c, t) {
      const r = t.r;
      handle(c, -r * 0.7, -r * 2.3, 5, '#5f9b4f');
      c.fillStyle = '#9aa3ad'; rr(c, -r * 0.75, -1.5, r * 0.5, 3, 1); c.fill();
      c.fillStyle = '#b9c0c8'; c.beginPath(); c.moveTo(-r * 0.4, -r * 0.55); c.quadraticCurveTo(r * 0.7, -r * 0.6, r * 1.15, 0); c.quadraticCurveTo(r * 0.7, r * 0.6, -r * 0.4, r * 0.55); c.closePath(); c.fill();
      c.fillStyle = '#e1e5ea'; c.beginPath(); c.moveTo(-r * 0.3, -r * 0.35); c.quadraticCurveTo(r * 0.5, -r * 0.4, r * 0.9, -r * 0.05); c.lineTo(-r * 0.3, -r * 0.05); c.closePath(); c.fill();
      c.fillStyle = '#6b4a32'; disc(c, r * 0.65, r * 0.15, 1.6); c.fill();
    },
    wateringcan(c, t) {
      const r = t.r;
      c.fillStyle = U.rgba('#bfe6f5', 0.35); disc(c, r * 0.35, 0, r * 0.75); c.fill();
      c.strokeStyle = '#3f8a6a'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * 0.2, 0); c.lineTo(r * 0.6, 0); c.stroke();
      c.fillStyle = '#4f9d7a'; disc(c, r * 0.75, 0, r * 0.22); c.fill();
      c.fillStyle = '#e8f4ee'; for (let i = 0; i < 5; i++) { disc(c, r * 0.75 + Math.cos(i * 1.26) * r * 0.1, Math.sin(i * 1.26) * r * 0.1, 0.8); c.fill(); }
      c.fillStyle = '#3f8a6a'; rr(c, -r * 1.25, -r * 0.6, r * 1.05, r * 1.2, 5); c.fill();
      c.fillStyle = '#5cb58e'; rr(c, -r * 1.2, -r * 0.55, r * 0.95, r * 1.1, 5); c.fill();
      c.strokeStyle = '#2f6e52'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-r * 1.05, -r * 0.45); c.quadraticCurveTo(-r * 0.7, -r * 0.95, -r * 0.35, -r * 0.45); c.stroke();
      c.fillStyle = '#ffffff55'; rr(c, -r * 1.1, -r * 0.45, r * 0.3, r * 0.9, 3); c.fill();
    },
    seedtray(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.5, -h * 2.4, 3, '#d9a066');
      c.fillStyle = '#2f2b28'; rr(c, -h / 2, -w / 2, h, w, 3); c.fill();
      c.fillStyle = '#3d3834'; rr(c, -h / 2 + 1, -w / 2 + 1, h - 2, w - 2, 2); c.fill();
      const cols = Math.max(4, Math.round(w / 8)), rows = 2;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = -h / 2 + (h * (j + 0.5)) / rows, y = -w / 2 + (w * (i + 0.5)) / cols;
        c.fillStyle = '#5a3d28'; disc(c, x, y, Math.min(h / 4, w / cols / 2) - 0.4); c.fill();
        c.fillStyle = (i + j) % 3 ? '#7bc25a' : '#9ad46e'; disc(c, x - 0.6, y, 1.8); c.fill(); disc(c, x + 0.8, y + 0.6, 1.4); c.fill();
      }
    },
    plantcart(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.55, -h * 1.7, 2.6, '#9aa3ad');
      wheel(c, -h * 0.25, -w / 2 + 1, 9, 5); wheel(c, -h * 0.25, w / 2 - 1, 9, 5);
      c.fillStyle = '#8a5a3c'; rr(c, -h / 2, -w / 2 + 3, h, w - 6, 4); c.fill();
      c.fillStyle = '#a77b56'; rr(c, -h / 2 + 2, -w / 2 + 5, h - 4, w - 10, 3); c.fill();
      const n = Math.round((w - 12) / 9);
      for (let i = 0; i < n; i++) {
        const y = -w / 2 + 8 + i * ((w - 16) / (n - 1 || 1));
        for (const x of [-h * 0.2, h * 0.2]) {
          c.fillStyle = '#5a3d28'; disc(c, x, y, 3.2); c.fill();
          c.fillStyle = ['#ef8aa6', '#f7c548', '#7bc25a', '#bba9df'][(i + (x > 0 ? 1 : 0)) % 4]; disc(c, x, y, 2.2); c.fill();
        }
      }
    },
    hammer(c, t) {
      const r = t.r;
      handle(c, -r * 0.2, -r * 2.4, 4.2, '#c98a55');
      c.fillStyle = '#5b636d'; rr(c, -r * 0.35, -r * 0.95, r * 0.7, r * 1.9, 3); c.fill();
      c.fillStyle = '#8b939d'; rr(c, -r * 0.3, -r * 0.9, r * 0.3, r * 1.8, 2); c.fill();
      c.fillStyle = '#3f464e'; rr(c, -r * 0.4, -r * 1.2, r * 0.8, r * 0.4, 2); c.fill();
      c.fillStyle = '#c62f3a'; rr(c, -r * 2.5, -3, r * 0.9, 6, 3); c.fill();
    },
    mallet(c, t) {
      const r = t.r;
      handle(c, -r * 0.2, -r * 2.2, 4, '#e6c17d');
      c.fillStyle = '#2b2b30'; rr(c, -r * 0.55, -r * 0.95, r * 1.1, r * 1.9, r * 0.35); c.fill();
      c.fillStyle = '#4a4a52'; rr(c, -r * 0.45, -r * 0.85, r * 0.4, r * 1.7, r * 0.2); c.fill();
      c.fillStyle = '#ffffff22'; rr(c, -r * 0.4, -r * 0.6, r * 0.2, r * 1.2, 2); c.fill();
    },
    nailgun(c, t) {
      const w = t.w, h = t.h;
      c.fillStyle = '#2f2b28'; rr(c, -h * 0.5, -w / 2, h * 0.7, w, 3); c.fill();
      c.fillStyle = '#9aa3ad'; rr(c, h * 0.1, -w / 2 + 2, h * 0.35, w - 4, 2); c.fill();
      c.fillStyle = '#f2b531'; rr(c, -h * 1.6, -w * 0.18, h * 1.2, w * 0.36, 5); c.fill();
      c.fillStyle = '#ffd56a'; rr(c, -h * 1.5, -w * 0.14, h * 0.5, w * 0.12, 3); c.fill();
      c.fillStyle = '#2f2b28'; rr(c, -h * 2.6, -4, h * 1.1, 8, 3); c.fill();
    },
    robobuilder(c, t) {
      const w = t.w, h = t.h;
      wheel(c, -h * 0.3, -w / 2 + 2, 12, 6); wheel(c, -h * 0.3, w / 2 - 2, 12, 6);
      c.fillStyle = '#c99a5a'; rr(c, h * 0.05, -w / 2, h * 0.5, w, 3); c.fill();
      c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(h * 0.3, -w / 2 + 2); c.lineTo(h * 0.3, w / 2 - 2); c.stroke();
      c.fillStyle = '#3f9b8b'; rr(c, -h * 0.75, -w * 0.3, h * 0.9, w * 0.6, 8); c.fill();
      c.fillStyle = '#6fd0bf'; rr(c, -h * 0.65, -w * 0.24, h * 0.5, w * 0.48, 6); c.fill();
      c.fillStyle = '#f2c230'; disc(c, -h * 0.35, 0, h * 0.32); c.fill();
      c.fillStyle = '#ffde6e'; disc(c, -h * 0.42, -h * 0.08, h * 0.16); c.fill();
      c.fillStyle = '#2b3a3f'; disc(c, -h * 0.05, -w * 0.08, 1.6); c.fill(); disc(c, -h * 0.05, w * 0.08, 1.6); c.fill();
    },
    picker(c, t) {
      const r = t.r;
      handle(c, -r * 0.3, -r * 2.6, 2.6, '#9aa3ad');
      c.fillStyle = '#f2b531'; rr(c, -r * 2.75, -3.5, r * 0.6, 7, 3); c.fill();
      c.strokeStyle = '#5b636d'; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * 0.3, -1.5); c.quadraticCurveTo(r * 0.5, -r * 0.55, r * 0.95, -r * 0.18); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.3, 1.5); c.quadraticCurveTo(r * 0.5, r * 0.55, r * 0.95, r * 0.18); c.stroke();
      c.fillStyle = '#e2574c'; disc(c, r * 0.95, -r * 0.18, 1.8); c.fill(); disc(c, r * 0.95, r * 0.18, 1.8); c.fill();
    },
    beachbucket(c, t) {
      const r = t.r;
      c.fillStyle = '#b8382f'; disc(c, 0, 0, r * 0.8); c.fill();
      c.fillStyle = '#e2574c'; disc(c, 0, 0, r * 0.7); c.fill();
      c.fillStyle = '#e8d3a4'; disc(c, 0, 0, r * 0.52); c.fill();
      c.fillStyle = '#d6bd85'; disc(c, r * 0.12, r * 0.1, r * 0.3); c.fill();
      c.strokeStyle = '#f2c230'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r * 0.95, -1.2, 1.2); c.stroke();
      handle(c, -r * 0.9, -r * 1.9, 3, '#f2c230');
      c.fillStyle = '#f2c230'; rr(c, -r * 0.95, -r * 0.3, r * 0.5, r * 0.6, 3); c.fill();
    },
    sifter(c, t) {
      const w = t.w, h = t.h;
      c.fillStyle = '#a2734a'; rr(c, -h / 2, -w / 2, h, w, 3); c.fill();
      c.fillStyle = 'rgba(232,211,164,0.6)'; rr(c, -h / 2 + 3, -w / 2 + 3, h - 6, w - 6, 2); c.fill();
      c.strokeStyle = 'rgba(70,60,50,0.55)'; c.lineWidth = 0.6;
      for (let y = -w / 2 + 5; y < w / 2 - 3; y += 3) { c.beginPath(); c.moveTo(-h / 2 + 3, y); c.lineTo(h / 2 - 3, y); c.stroke(); }
      for (let x = -h / 2 + 5; x < h / 2 - 3; x += 3) { c.beginPath(); c.moveTo(x, -w / 2 + 3); c.lineTo(x, w / 2 - 3); c.stroke(); }
      handle(c, -h * 0.5, -h * 1.8, 3, '#c98a55');
    },
    cloth(c, t) {
      const r = t.r;
      c.fillStyle = '#3d86c6'; rr(c, -r * 0.85, -r * 0.85, r * 1.7, r * 1.7, 4); c.fill();
      c.fillStyle = '#5fa3dc'; rr(c, -r * 0.85, -r * 0.85, r * 1.7, r * 0.9, 4); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.8;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-r * 0.7, i * r * 0.3); c.lineTo(r * 0.7, i * r * 0.3 + 1); c.stroke(); }
    },
    waxpad(c, t) {
      const r = t.r;
      c.fillStyle = '#f2c230'; disc(c, 0, 0, r * 0.95); c.fill();
      c.fillStyle = '#f7d966'; disc(c, -r * 0.1, -r * 0.1, r * 0.75); c.fill();
      c.fillStyle = '#3a3633'; rr(c, -r * 0.55, -r * 0.18, r * 1.1, r * 0.36, 3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.4)'; disc(c, -r * 0.4, -r * 0.45, r * 0.18); c.fill();
    },
    buffer(c, t) {
      const r = t.r;
      c.fillStyle = 'rgba(255,255,255,0.25)'; disc(c, 0, 0, r); c.fill();
      c.fillStyle = '#d9534f'; disc(c, 0, 0, r * 0.82); c.fill();
      c.fillStyle = '#f4ecdc'; disc(c, 0, 0, r * 0.62); c.fill();
      c.fillStyle = '#3a3633'; disc(c, 0, 0, r * 0.36); c.fill();
      c.fillStyle = '#6d6a66'; disc(c, -r * 0.08, -r * 0.08, r * 0.18); c.fill();
      handle(c, -r * 0.4, -r * 1.7, 5, '#3a3633');
    },
    twinbuffer(c, t) {
      const w = t.w, h = t.h, r = h * 0.5;
      handle(c, 0, -h * 1.6, 4, '#3a3633');
      c.fillStyle = '#5b636d'; rr(c, -3, -w * 0.3, 6, w * 0.6, 3); c.fill();
      for (const y of [-w * 0.27, w * 0.27]) {
        c.fillStyle = '#d9534f'; disc(c, 0, y, r); c.fill();
        c.fillStyle = '#f4ecdc'; disc(c, 0, y, r * 0.72); c.fill();
        c.fillStyle = '#3a3633'; disc(c, 0, y, r * 0.3); c.fill();
      }
    },
    basket(c, t) {
      const r = t.r;
      c.fillStyle = '#a2734a'; rr(c, -r * 0.9, -r * 0.8, r * 1.8, r * 1.6, r * 0.35); c.fill();
      c.strokeStyle = '#7d5434'; c.lineWidth = 1;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-r * 0.8, i * r * 0.28); c.lineTo(r * 0.8, i * r * 0.28); c.stroke(); }
      c.fillStyle = '#e2574c'; disc(c, -r * 0.3, -r * 0.2, r * 0.25); c.fill();
      c.fillStyle = '#7bc25a'; disc(c, r * 0.25, r * 0.15, r * 0.22); c.fill();
      c.strokeStyle = '#7d5434'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, -r * 0.8); c.quadraticCurveTo(-r * 0.2, 0, 0, r * 0.8); c.stroke();
    },
    trolley(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.55, -h * 1.5, 2.4, '#9aa3ad');
      wheel(c, -h * 0.3, -w / 2 + 1, 8, 4); wheel(c, -h * 0.3, w / 2 - 1, 8, 4); wheel(c, h * 0.35, -w / 2 + 1, 8, 4); wheel(c, h * 0.35, w / 2 - 1, 8, 4);
      c.fillStyle = '#5b636d'; rr(c, -h / 2, -w / 2 + 2, h, w - 4, 3); c.fill();
      const cols = ['#d9534f', '#f2c230', '#4f9d7a', '#3d86c6'];
      for (let i = 0; i < 4; i++) { c.fillStyle = cols[i]; rr(c, -h / 2 + 2, -w / 2 + 4 + i * (w - 8) / 4, h - 4, (w - 8) / 4 - 1.5, 2); c.fill(); }
    },
    dishcloth(c, t) {
      const r = t.r;
      c.save(); c.rotate(0.35);
      c.fillStyle = '#f6f1e6'; rr(c, -r * 0.9, -r * 0.9, r * 1.8, r * 1.8, 4); c.fill();
      c.fillStyle = 'rgba(214,84,79,0.5)';
      for (let i = -1; i <= 1; i++) { c.fillRect(-r * 0.9, i * r * 0.55 - r * 0.11, r * 1.8, r * 0.22); c.fillRect(i * r * 0.55 - r * 0.11, -r * 0.9, r * 0.22, r * 1.8); }
      c.strokeStyle = 'rgba(120,90,70,0.35)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-r * 0.6, r * 0.3); c.quadraticCurveTo(0, -r * 0.1, r * 0.6, r * 0.5); c.stroke();
      c.restore();
    },
    spraywipe(c, t) {
      const r = t.r;
      c.fillStyle = '#f2c230'; rr(c, -r * 0.8, -r * 0.8, r * 1.6, r * 1.6, 5); c.fill();
      c.fillStyle = '#f7d966'; rr(c, -r * 0.8, -r * 0.8, r * 1.6, r * 0.8, 5); c.fill();
      // the spray bottle beside the cloth, and a puff of spray ahead
      c.save(); c.translate(-r * 0.15, -r * 1.05);
      c.fillStyle = '#4fb3c9'; rr(c, -r * 0.4, -r * 0.3, r * 0.85, r * 0.6, r * 0.22); c.fill();
      c.fillStyle = '#ffffff'; rr(c, r * 0.42, -r * 0.15, r * 0.32, r * 0.3, 2); c.fill();
      c.fillStyle = '#e2574c'; rr(c, r * 0.28, r * 0.08, r * 0.18, r * 0.34, 2); c.fill();
      c.restore();
      c.fillStyle = 'rgba(160,220,240,0.85)';
      for (const [dx, dy] of [[0.95, -0.95], [1.12, -1.12], [1.08, -0.78]]) { disc(c, r * dx, r * dy, 1.7); c.fill(); }
    },
    steamer(c, t) {
      const r = t.r;
      c.fillStyle = 'rgba(255,255,255,0.4)';
      for (const [dx, dy, s] of [[0.55, -0.5, 0.34], [0.75, 0.3, 0.28], [0.25, 0.62, 0.26]]) { disc(c, r * dx, r * dy, r * s); c.fill(); }
      handle(c, -r * 0.45, -r * 1.6, 5, '#e9edf1');
      c.fillStyle = '#5b636d'; disc(c, 0, 0, r * 0.62); c.fill();
      c.fillStyle = '#e9edf1'; disc(c, 0, 0, r * 0.5); c.fill();
      c.fillStyle = '#c94a4a'; disc(c, 0, 0, r * 0.2); c.fill();
    },
    bathsponge(c, t) {
      const r = t.r;
      c.fillStyle = 'rgba(255,255,255,0.75)';
      for (const [dx, dy, s] of [[0.95, -0.6, 0.22], [1.05, 0.5, 0.16], [0.6, 0.98, 0.12]]) { disc(c, r * dx, r * dy, r * s); c.fill(); }
      c.fillStyle = '#e9b46a'; c.beginPath();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, k = r * (0.82 + (i % 3) * 0.08); c.lineTo(Math.cos(a) * k, Math.sin(a) * k); }
      c.closePath(); c.fill();
      c.fillStyle = '#c98d48';
      for (const [dx, dy] of [[-0.3, -0.3], [0.25, -0.1], [-0.1, 0.35], [0.4, 0.4], [-0.5, 0.2]]) { disc(c, r * dx, r * dy, r * 0.11); c.fill(); }
    },
    dogbrush(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.5, -h * 2.4, 4, '#c98a55');
      c.fillStyle = '#9b6a42'; rr(c, -h * 0.5, -w / 2, h * 0.7, w, 3); c.fill();
      bristles(c, h * 0.2, 0, h * 0.45, w - 4, '#f4ecdc', 10);
    },
    shower(c, t) {
      const r = t.r;
      c.fillStyle = 'rgba(150,210,235,0.35)'; disc(c, 0, 0, r); c.fill();
      handle(c, -r * 0.45, -r * 1.5, 4, '#9aa3ad');
      c.fillStyle = '#c7cdd4'; disc(c, 0, 0, r * 0.5); c.fill();
      c.fillStyle = '#e9edf1'; disc(c, 0, 0, r * 0.4); c.fill();
      c.fillStyle = '#7d8590';
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; disc(c, Math.cos(a) * r * 0.24, Math.sin(a) * r * 0.24, 1.2); c.fill(); }
      disc(c, 0, 0, 1.2); c.fill();
    },
    bubbleshower(c, t) {
      SPR.shower(c, t);
      const r = t.r;
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.2; c.fillStyle = 'rgba(255,255,255,0.25)';
      for (const [dx, dy, s] of [[0.7, -0.5, 0.16], [0.85, 0.35, 0.12], [0.45, 0.75, 0.1], [0.2, -0.85, 0.12]]) { disc(c, r * dx, r * dy, r * s); c.fill(); c.stroke(); }
    },

    // ---- coffee: the pot pours straight down where the tool is
    coffeepot(c, t, p, s = t.r, y = 0) {
      c.save(); c.translate(0, y);
      handle(c, -s * 0.7, -s * 1.55, 3.4, '#3a3633');
      const g = c.createLinearGradient(-s, -s, s, s);
      g.addColorStop(0, '#eef1f4'); g.addColorStop(1, '#9aa3ad');
      c.fillStyle = g; disc(c, 0, 0, s * 0.82); c.fill();
      c.fillStyle = '#c7cdd4'; disc(c, -s * 0.06, -s * 0.06, s * 0.52); c.fill();
      c.fillStyle = '#3a3633'; disc(c, -s * 0.06, -s * 0.06, s * 0.17); c.fill();
      c.fillStyle = '#b7bec6'; c.beginPath(); c.moveTo(s * 0.62, -s * 0.2); c.lineTo(s * 1.18, -s * 0.07); c.lineTo(s * 1.18, s * 0.07); c.lineTo(s * 0.62, s * 0.2); c.closePath(); c.fill();
      c.fillStyle = '#6b4226'; disc(c, s * 1.26, 0, s * 0.13); c.fill();
      c.restore();
    },
    cafetiere(c, t) {
      const r = t.r;
      handle(c, -r * 0.75, -r * 1.5, 4, '#3a3633');
      c.fillStyle = '#9aa3ad'; disc(c, 0, 0, r * 0.86); c.fill();
      c.fillStyle = 'rgba(220,235,245,0.9)'; disc(c, 0, 0, r * 0.76); c.fill();
      c.fillStyle = '#5a3520'; disc(c, 0, 0, r * 0.62); c.fill();
      c.fillStyle = '#c8955a'; c.beginPath(); c.arc(0, 0, r * 0.62, 0, 7); c.arc(0, 0, r * 0.5, 0, 7, true); c.fill();
      c.fillStyle = '#c7cdd4'; disc(c, 0, 0, r * 0.22); c.fill();
      c.fillStyle = '#3a3633'; disc(c, 0, 0, r * 0.12); c.fill();
      c.fillStyle = '#9aa3ad'; c.beginPath(); c.moveTo(r * 0.7, -r * 0.16); c.lineTo(r * 1.08, 0); c.lineTo(r * 0.7, r * 0.16); c.closePath(); c.fill();
    },
    twojugs(c, t) {
      const w = t.w, s = Math.min(t.h * 0.62, w * 0.24);
      SPR.coffeepot(c, t, null, s, -w * 0.25);
      // a white enamel milk jug with a blue rim
      c.save(); c.translate(0, w * 0.25);
      handle(c, -s * 0.7, -s * 1.5, 3.2, '#e9edf1');
      c.fillStyle = '#3d86c6'; disc(c, 0, 0, s * 0.84); c.fill();
      c.fillStyle = '#f7f5ef'; disc(c, 0, 0, s * 0.72); c.fill();
      c.fillStyle = '#ffffff'; disc(c, -s * 0.05, -s * 0.05, s * 0.5); c.fill();
      c.fillStyle = '#3d86c6'; c.beginPath(); c.moveTo(s * 0.64, -s * 0.2); c.lineTo(s * 1.12, 0); c.lineTo(s * 0.64, s * 0.2); c.closePath(); c.fill();
      c.restore();
    },
    baristacart(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.55, -h * 1.4, 2.4, '#9aa3ad');
      for (const [x, y] of [[-0.3, -1], [-0.3, 1], [0.35, -1], [0.35, 1]]) wheel(c, h * x, y * (w / 2 - 1), 8, 4);
      c.fillStyle = '#8a5a3c'; rr(c, -h / 2, -w / 2 + 2, h, w - 4, 4); c.fill();
      c.fillStyle = '#a8734f'; rr(c, -h / 2 + 2, -w / 2 + 4, h - 4, w - 8, 3); c.fill();
      // the urn and a row of cups
      const g = c.createRadialGradient(-2, -w * 0.2 - 2, 1, 0, -w * 0.2, h * 0.42);
      g.addColorStop(0, '#f4f6f8'); g.addColorStop(1, '#8f99a3');
      c.fillStyle = g; disc(c, 0, -w * 0.2, h * 0.38); c.fill();
      c.fillStyle = '#3a3633'; disc(c, 0, -w * 0.2, h * 0.1); c.fill();
      for (let i = 0; i < 3; i++) { const y = w * 0.06 + i * w * 0.13; c.fillStyle = '#ffffff'; disc(c, 0, y, h * 0.2); c.fill(); c.fillStyle = '#7a4a2a'; disc(c, 0, y, h * 0.13); c.fill(); }
    },

    // ---- feeding
    scoop(c, t, p, col = '#e2574c') {
      const r = t.r;
      handle(c, -r * 0.6, -r * 1.5, 3.4, U.shade(col, -0.1));
      c.fillStyle = U.shade(col, -0.25); rr(c, -r * 0.75, -r * 0.62, r * 1.65, r * 1.24, r * 0.5); c.fill();
      c.fillStyle = col; rr(c, -r * 0.65, -r * 0.52, r * 1.5, r * 1.04, r * 0.42); c.fill();
      const k = U.rng(7);
      for (let i = 0; i < 9; i++) { c.fillStyle = k() < 0.5 ? '#9c6a3a' : '#b98450'; disc(c, -r * 0.35 + k() * r * 1.05, (k() - 0.5) * r * 0.75, r * 0.13); c.fill(); }
    },
    bigscoop(c, t) { SPR.scoop(c, t, null, '#3d86c6'); },
    feedbucket(c, t) {
      const r = t.r;
      c.fillStyle = '#4f9d7a'; disc(c, 0, 0, r * 0.9); c.fill();
      c.fillStyle = '#3f8466'; disc(c, 0, 0, r * 0.76); c.fill();
      const k = U.rng(11);
      for (let i = 0; i < 22; i++) { const a = k() * 6.28, d = Math.sqrt(k()) * r * 0.62; c.fillStyle = k() < 0.5 ? '#9c6a3a' : '#b98450'; disc(c, Math.cos(a) * d, Math.sin(a) * d, r * 0.09); c.fill(); }
      c.strokeStyle = '#9aa3ad'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r * 0.98, -1.2, 1.2); c.stroke();
    },
    feedcart(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.55, -h * 1.4, 2.4, '#9aa3ad');
      for (const [x, y] of [[-0.3, -1], [-0.3, 1], [0.35, -1], [0.35, 1]]) wheel(c, h * x, y * (w / 2 - 1), 8, 4);
      c.fillStyle = '#5b636d'; rr(c, -h / 2, -w / 2 + 2, h, w - 4, 3); c.fill();
      // two sacks of food with a paw on, and a churn of water
      for (const y of [-w * 0.27, 0]) {
        c.fillStyle = '#e6d3ad'; rr(c, -h * 0.42, y - w * 0.12, h * 0.84, w * 0.24, 4); c.fill();
        c.fillStyle = '#b98450'; disc(c, 0, y, h * 0.1); c.fill();
        for (const [dx, dy] of [[-0.18, -0.1], [-0.18, 0.1], [0.04, -0.17], [0.04, 0.17]]) { disc(c, h * dx + h * 0.16, y + w * dy * 0.5, h * 0.045); c.fill(); }
      }
      c.fillStyle = '#c7cdd4'; disc(c, 0, w * 0.28, h * 0.36); c.fill();
      c.fillStyle = '#8fc6e0'; disc(c, 0, w * 0.28, h * 0.25); c.fill();
    },

    // ---- dogs on leads, seen from above, trotting along +x
    walk1(c, t) { walkers(c, t.r, [[0, 0, 0.92]]); },
    walk2(c, t) { walkers(c, t.r, [[0.08, -0.46, 0.62], [-0.08, 0.46, 0.62]]); },
    walk3(c, t) { walkers(c, t.r, [[0, -0.62, 0.48], [0.18, 0, 0.5], [-0.05, 0.62, 0.48]]); },
    walk4(c, t) { walkers(c, t.r, [[0.05, -0.7, 0.38], [0.24, -0.24, 0.4], [0.2, 0.24, 0.38], [0.02, 0.7, 0.38], [-0.32, 0, 0.34]]); },

    // ---- pet brushes
    // an open hand, fingers forward, with a sage cuff
    hand(c, t) {
      const r = t.r;
      const limb = (x0, y0, x1, y1, w) => { c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
      for (const [col, k] of [['#d39a6e', 0.1], ['#f4cba6', 0]]) {
        c.strokeStyle = col; c.fillStyle = col;
        for (const [fy, len] of [[-0.4, 0.62], [-0.13, 0.8], [0.14, 0.76], [0.41, 0.58]]) limb(r * 0.2, r * fy, r * (0.2 + len), r * fy * 1.1, r * (0.26 + k));
        limb(-r * 0.15, -r * 0.42, r * 0.28, -r * 0.94, r * (0.28 + k));
        rr(c, -r * (0.75 + k / 2), -r * (0.58 + k / 2), r * (1.15 + k), r * (1.16 + k), r * 0.4); c.fill();
      }
      c.fillStyle = '#9cc5a1'; rr(c, -r * 1.15, -r * 0.52, r * 0.44, r * 1.04, r * 0.16); c.fill();
    },
    softbrush(c, t) {
      const r = t.r;
      handle(c, -r * 0.7, -r * 1.6, 4, '#ef8aa6');
      c.fillStyle = '#c98a55'; c.beginPath(); c.ellipse(0, 0, r * 0.95, r * 0.75, 0, 0, 7); c.fill();
      c.fillStyle = '#f6d6df';
      for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) { if (i * i / 12 + j * j / 5 > 1) continue; disc(c, i * r * 0.22, j * r * 0.24, r * 0.1); c.fill(); }
    },
    slicker(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.4, -h * 2.2, 4, '#3d86c6');
      c.fillStyle = '#2f6ea6'; rr(c, -h * 0.5, -w / 2, h, w, 3); c.fill();
      c.fillStyle = '#e9edf1';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 9; j++) { disc(c, -h * 0.3 + i * h * 0.3, -w / 2 + 2.5 + j * (w - 5) / 8, 0.9); c.fill(); }
    },
    mitt(c, t) {
      const r = t.r;
      c.fillStyle = '#4fb3c9'; c.beginPath(); c.ellipse(0, 0, r * 0.95, r * 0.72, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(-r * 0.2, -r * 0.72, r * 0.32, r * 0.2, -0.5, 0, 7); c.fill();
      c.fillStyle = '#2f8ea6';
      for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) { if (i * i / 11 + j * j / 5.5 > 1) continue; disc(c, i * r * 0.24, j * r * 0.24, r * 0.07); c.fill(); }
      c.fillStyle = '#f2c230'; rr(c, -r * 1.05, -r * 0.55, r * 0.2, r * 1.1, 3); c.fill();
    },
    doublebrush(c, t) {
      const w = t.w, h = t.h;
      handle(c, 0, -h * 1.7, 4, '#c98a55');
      c.fillStyle = '#9b6a42'; rr(c, -3, -w * 0.32, 6, w * 0.64, 3); c.fill();
      for (const y of [-w * 0.26, w * 0.26]) {
        c.fillStyle = '#c98a55'; c.beginPath(); c.ellipse(0, y, h * 0.6, w * 0.22, 0, 0, 7); c.fill();
        c.fillStyle = '#f6d6df'; for (let i = -1; i <= 1; i++) for (let j = -2; j <= 2; j++) { disc(c, i * h * 0.3, y + j * w * 0.07, 1.2); c.fill(); }
      }
    },

    // ---- mucking out
    pitchfork(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.4, -h * 2.8, 3.4, '#c98a55');
      c.strokeStyle = '#7d8590'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-h * 0.4, -w * 0.4); c.quadraticCurveTo(-h * 0.7, 0, -h * 0.4, w * 0.4); c.stroke();
      c.strokeStyle = '#c7cdd4'; c.lineWidth = 1.8;
      for (const y of [-0.38, -0.13, 0.13, 0.38]) { c.beginPath(); c.moveTo(-h * 0.45, w * y); c.lineTo(h * 0.75, w * y * 1.05); c.stroke(); }
      c.strokeStyle = '#e8c35a'; c.lineWidth = 1;
      for (const [y0, y1] of [[-0.3, 0.05], [0.2, -0.1], [0.4, 0.15]]) { c.beginPath(); c.moveTo(-h * 0.1, w * y0); c.lineTo(h * 0.5, w * y1); c.stroke(); }
    },
    strawshovel(c, t) {
      const w = t.w, h = t.h;
      handle(c, -h * 0.5, -h * 2.4, 3.6, '#c98a55');
      c.fillStyle = '#7d8590'; rr(c, -h * 0.55, -w / 2, h * 1.1, w, 4); c.fill();
      c.fillStyle = '#9aa3ad'; rr(c, -h * 0.45, -w / 2 + 2, h * 0.9, w - 4, 3); c.fill();
      c.strokeStyle = '#e8c35a'; c.lineWidth = 1.3; c.lineCap = 'round';
      const k = U.rng(5);
      for (let i = 0; i < 14; i++) { const y = (k() - 0.5) * (w - 8), x = (k() - 0.5) * h * 0.6; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y + (k() - 0.5) * 4); c.stroke(); }
    },
    barrow(c, t) {
      const w = t.w, h = t.h;
      c.strokeStyle = '#5b636d'; c.lineWidth = 3; c.lineCap = 'round';
      for (const y of [-w * 0.3, w * 0.3]) { c.beginPath(); c.moveTo(-h * 0.3, y); c.lineTo(-h * 1.25, y * 1.05); c.stroke(); }
      c.fillStyle = '#2f2b28'; rr(c, h * 0.5, -3, 9, 6, 2.5); c.fill();
      c.fillStyle = '#3f8466'; c.beginPath(); c.moveTo(-h * 0.55, -w * 0.45); c.lineTo(h * 0.45, -w * 0.32); c.lineTo(h * 0.45, w * 0.32); c.lineTo(-h * 0.55, w * 0.45); c.closePath(); c.fill();
      c.fillStyle = '#4f9d7a'; c.beginPath(); c.moveTo(-h * 0.45, -w * 0.38); c.lineTo(h * 0.36, -w * 0.27); c.lineTo(h * 0.36, w * 0.27); c.lineTo(-h * 0.45, w * 0.38); c.closePath(); c.fill();
      c.strokeStyle = '#e8c35a'; c.lineWidth = 1.4;
      const k = U.rng(9);
      for (let i = 0; i < 18; i++) { const y = (k() - 0.5) * w * 0.6, x = -h * 0.4 + k() * h * 0.7; c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y + (k() - 0.5) * 6); c.stroke(); }
    },
  };

  // a few dogs (x, y, size as parts of the tool radius) on leads that meet
  // in the walker's hand behind them; tails wag as they go
  const COATS = [['#e2b36a', '#c48c48'], ['#f4efe6', '#3b3533'], ['#a8754a', '#6e4a2c'], ['#8f8a86', '#5b5753'], ['#2f2b28', '#f4efe6']];
  function walkers(c, r, dogs) {
    const now = typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
    c.strokeStyle = '#c9474f'; c.lineWidth = 1.4; c.lineCap = 'round';
    for (const [x, y, s] of dogs) { c.beginPath(); c.moveTo(r * (x + s * 0.2), r * y); c.quadraticCurveTo(r * (x - 0.9), r * y * 0.6, -r * 1.55, 0); c.stroke(); }
    c.fillStyle = '#e9b46a'; disc(c, -r * 1.6, 0, 3); c.fill();
    dogs.forEach(([x, y, s], i) => {
      const [fur, ear] = COATS[i % COATS.length], k = r * s, cx = r * x, cy = r * y, wag = Math.sin(now * 13 + i * 1.7) * 0.6, trot = Math.sin(now * 16 + i * 2.1);
      c.save(); c.translate(cx, cy);
      c.strokeStyle = fur; c.lineWidth = k * 0.22;
      c.beginPath(); c.moveTo(-k * 0.8, 0); c.quadraticCurveTo(-k * 1.15, wag * k * 0.3, -k * 1.35, wag * k * 0.55); c.stroke();
      c.fillStyle = U.shade(fur, -0.2);
      for (const [px, py, ph] of [[0.45, -0.42, 1], [0.45, 0.42, -1], [-0.55, -0.4, -1], [-0.55, 0.4, 1]]) { disc(c, k * (px + trot * ph * 0.08), k * py, k * 0.13); c.fill(); }
      c.fillStyle = fur; c.beginPath(); c.ellipse(-k * 0.12, 0, k * 0.8, k * 0.44, 0, 0, 7); c.fill();
      c.fillStyle = '#c9474f'; c.fillRect(k * 0.42, -k * 0.24, k * 0.08, k * 0.48);
      c.fillStyle = fur; disc(c, k * 0.72, 0, k * 0.38); c.fill();
      c.fillStyle = ear; c.beginPath(); c.ellipse(k * 0.62, -k * 0.34, k * 0.2, k * 0.12, -0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(k * 0.62, k * 0.34, k * 0.2, k * 0.12, 0.4, 0, 7); c.fill();
      c.fillStyle = U.shade(fur, 0.25); c.beginPath(); c.ellipse(k * 1.02, 0, k * 0.2, k * 0.15, 0, 0, 7); c.fill();
      c.fillStyle = '#2b2422'; disc(c, k * 1.18, 0, k * 0.07); c.fill();
      c.restore();
    });
  }

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
