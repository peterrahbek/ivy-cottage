'use strict';
// The places, their chores in order, what they pay and what tools cost.

const DATA = (() => {
  const AREAS = {
    lawn: 'Front garden', path: 'Garden path', fence: 'Picket fence', windows: 'Windows',
    door: 'Front door', wall: 'Cottage walls', beds: 'Flower beds', pond: 'Garden pond',
    roof: 'Roof', attic: 'Attic', autumn: 'Autumn',
    inside: 'Inside the café', front: 'The café front', terrace: 'The terrace',
  };

  // part = which piece of the place's picture this chore restores
  const CHORES = [
    { id: 'lawn-patch', area: 'lawn', part: 'lawnFront', name: 'A patch by the gate', scene: 'lawn', opts: { shape: 'patch' }, seed: 11 },
    { id: 'lawn-tree', area: 'lawn', part: 'lawnLeft', name: 'The lawn under the old tree', scene: 'lawn', opts: { shape: 'tree' }, seed: 12 },
    { id: 'lawn-stones', area: 'lawn', part: 'lawnRight', name: 'The lawn by the stepping stones', scene: 'lawn', opts: { shape: 'stones' }, seed: 13 },
    { id: 'path-steps', area: 'path', part: 'steps', name: 'Mossy stepping stones', scene: 'stones', opts: { shape: 'stepping' }, seed: 21 },
    { id: 'path-front', area: 'path', part: 'path', name: 'The front path', scene: 'stones', opts: { shape: 'path' }, seed: 22 },
    { id: 'bed-roses', area: 'beds', part: 'bedLeft', name: 'The rose bed', scene: 'bed', opts: { flower: 'rose' }, seed: 71 },
    { id: 'fence-left', area: 'fence', part: 'fenceLeft', name: 'Fence, left side', scene: 'fence', opts: { side: 'left' }, seed: 31, color: 'fence' },
    { id: 'fence-right', area: 'fence', part: 'fenceRight', name: 'Fence, right side', scene: 'fence', opts: { side: 'right' }, seed: 32, color: 'fence' },
    { id: 'bed-tulips', area: 'beds', part: 'bedRight', name: 'The tulip bed', scene: 'bed', opts: { flower: 'tulip' }, seed: 72 },
    { id: 'win-kitchen', area: 'windows', part: 'winKitchen', name: 'The kitchen window', scene: 'window', opts: { room: 'kitchen' }, seed: 41 },
    { id: 'win-living', area: 'windows', part: 'winLiving', name: 'The living room window', scene: 'window', opts: { room: 'living' }, seed: 42 },
    { id: 'door', area: 'door', part: 'door', name: 'The front door', scene: 'door', opts: {}, seed: 51, color: 'door' },
    { id: 'pond', area: 'pond', part: 'pond', name: 'The green pond', scene: 'pond', opts: {}, seed: 81 },
    { id: 'shutters', area: 'wall', part: 'shutters', name: 'The shutters', scene: 'shutters', opts: {}, seed: 62, color: 'shutters' },
    { id: 'win-bedroom', area: 'windows', part: 'winBedroom', name: 'The bedroom windows', scene: 'window', opts: { room: 'bedroom' }, seed: 43 },
    { id: 'wall', area: 'wall', part: 'wall', name: 'The front wall', scene: 'wall', opts: {}, seed: 61, color: 'wall' },
    { id: 'roof-left', area: 'roof', part: 'roofLeft', name: 'Moss on the roof', scene: 'roof', opts: { side: 'left' }, seed: 91 },
    { id: 'roof-right', area: 'roof', part: 'roofRight', name: 'The roof by the chimney', scene: 'roof', opts: { side: 'right' }, seed: 92 },
    { id: 'attic-floor', area: 'attic', part: 'attic', name: 'The dusty attic', scene: 'attic', opts: {}, seed: 101 },
    { id: 'attic-window', area: 'attic', part: 'atticWin', name: 'The round attic window', scene: 'roundWindow', opts: {}, seed: 102 },
  ];

  // The second place: a little corner café, closed for years. Bought once
  // the cottage is restored; light building and planting jobs live here.
  const CAFE_CHORES = [
    { id: 'cafe-floor', area: 'inside', part: 'floor', name: 'The dusty café floor', scene: 'cafeFloor', opts: {}, seed: 201 },
    { id: 'cafe-window', area: 'front', part: 'window', name: 'The big shop window', scene: 'window', opts: { room: 'cafe' }, seed: 202 },
    { id: 'cafe-terrace', area: 'terrace', part: 'terrace', name: 'Moss on the terrace', scene: 'stones', opts: { shape: 'terrace' }, seed: 203 },
    { id: 'cafe-planters', area: 'terrace', part: 'planters', name: 'Plant the planter boxes', scene: 'plant', opts: { box: 'planters' }, seed: 204 },
    { id: 'cafe-tables', area: 'inside', part: 'tables', name: 'Sticky café tables', scene: 'tables', opts: {}, seed: 205 },
    { id: 'cafe-deck', area: 'terrace', part: 'deck', name: 'Lay a new deck', scene: 'build', opts: { material: 'planks' }, seed: 206 },
    { id: 'cafe-awning', area: 'front', part: 'awning', name: 'The faded awning', scene: 'awning', opts: {}, seed: 207 },
    { id: 'cafe-counter', area: 'inside', part: 'counter', name: 'The old coffee machine', scene: 'counter', opts: {}, seed: 208 },
    { id: 'cafe-wall', area: 'terrace', part: 'brickwall', name: 'Rebuild the little brick wall', scene: 'build', opts: { material: 'bricks' }, seed: 209 },
    { id: 'cafe-herbs', area: 'front', part: 'herbs', name: 'A herb box by the window', scene: 'plant', opts: { box: 'windowbox' }, seed: 210 },
    { id: 'cafe-sign', area: 'front', part: 'sign', name: 'Paint the café sign', scene: 'sign', opts: {}, seed: 211, color: 'sign' },
    { id: 'cafe-door', area: 'front', part: 'door', name: 'The café door', scene: 'door', opts: { cafe: true }, seed: 212, color: 'cafeDoor' },
    { id: 'cafe-tiles', area: 'inside', part: 'tiles', name: 'Tiles behind the counter', scene: 'build', opts: { material: 'tiles' }, seed: 213 },
    { id: 'cafe-pots', area: 'terrace', part: 'pots', name: 'Flower pots on the steps', scene: 'plant', opts: { box: 'pots' }, seed: 214 },
  ];

  // Jobs that only turn up in the seasons, for variety: planting and
  // building around the cottage. They have no part in the picture.
  const EXTRAS = [
    { id: 'x-sunflowers', area: 'beds', name: 'Sunflowers', scene: 'plant', opts: { box: 'bed', plants: 'sunflowers' }, seed: 301 },
    { id: 'x-veg', area: 'beds', name: 'The vegetable patch', scene: 'plant', opts: { box: 'veg' }, seed: 302 },
    { id: 'x-bulbs', area: 'beds', name: 'Tulip bulbs', scene: 'plant', opts: { box: 'bed', plants: 'bulbs' }, seed: 303 },
    { id: 'x-windowboxes', area: 'windows', name: 'Window boxes', scene: 'plant', opts: { box: 'windowbox', plants: 'flowers' }, seed: 304 },
    { id: 'x-firewood', area: 'wall', name: 'The woodpile', scene: 'build', opts: { material: 'logs' }, seed: 305 },
    { id: 'x-jetty', area: 'pond', name: 'A jetty by the pond', scene: 'build', opts: { material: 'planks', jetty: true }, seed: 306 },
    { id: 'x-brickpath', area: 'path', name: 'A brick path', scene: 'build', opts: { material: 'bricks', path: true }, seed: 307 },
  ];

  const FAMILY_OF = {
    lawn: 'mow', stones: 'scrub', roof: 'scrub', fence: 'paint', door: 'paint', wall: 'paint', shutters: 'paint', window: 'wash', roundWindow: 'wash',
    bed: 'weed', pond: 'skim', attic: 'dust', leaves: 'rake', plant: 'plant', build: 'build',
    cafeFloor: 'dust', awning: 'wash', sign: 'paint', tables: 'wash', counter: 'scrub',
  };
  const familyOf = (scene) => FAMILY_OF[scene];

  // What jobs pay. Kept modest: tools, helpers, decorations and new places
  // should take a while to save up for.
  function choreValue(i) { return Math.round(24 * Math.pow(1.2, i)); }
  function cafeValue(i) { return Math.round(150 * Math.pow(1.1, i)); }

  CHORES.forEach((c, i) => { c.index = i; c.place = 'cottage'; c.family = familyOf(c.scene); c.value = choreValue(i); });
  CAFE_CHORES.forEach((c, i) => { c.index = i; c.place = 'cafe'; c.family = familyOf(c.scene); c.value = cafeValue(i); });
  EXTRAS.forEach((c) => { c.place = 'cottage'; c.family = familyOf(c.scene); c.extra = true; });

  // first cottage chore that uses each family sets the price level of its tools
  const intro = {};
  CHORES.forEach((c) => { if (!(c.family in intro)) intro[c.family] = c.index; });

  // ---------------------------------------------------------------- seasons
  // Once the cottage is restored the year turns. Every season picks a few
  // jobs per restored place from a bigger pool, never the same kind of job
  // too often, so mowing does not come round again and again.
  const SEASON_ORDER = ['summer', 'autumn', 'winter', 'spring'];
  const SEASON_NAMES = { summer: 'Summer', autumn: 'Autumn', winter: 'Winter', spring: 'Spring' };
  const SEASON_POOL = {
    cottage: {
      summer: [
        ['lawn-tree', 'The lawn has grown back'], ['pond', 'Algae is back in the pond'], ['win-kitchen', 'Summer dust on the kitchen window'],
        ['lawn-stones', 'Long grass by the stones'], ['bed-roses', 'Weeds among the roses'], ['win-living', 'Pollen on the living room window'],
        ['lawn-patch', 'The patch by the gate'], ['path-steps', 'Moss on the stepping stones'], ['x-sunflowers', 'Sow sunflowers by the fence'],
        ['x-jetty', 'Build a little jetty by the pond'], ['fence-right', 'Touch up the fence'], ['x-veg', 'Plant the vegetable patch'],
      ],
      autumn: [
        ['lawn-tree', 'Leaves under the old tree', 'leaves'], ['path-front', 'Leaves on the path', 'leaves'], ['lawn-stones', 'Leaves all over the lawn', 'leaves'],
        ['pond', 'Leaves in the pond', 'leaves'], ['win-bedroom', 'Rain spots on the bedroom windows'], ['lawn-patch', 'Leaves by the gate', 'leaves'],
        ['roof-left', 'Moss creeping back on the roof'], ['path-steps', 'Leaves on the stepping stones', 'leaves'], ['x-bulbs', 'Plant tulip bulbs for spring'],
        ['x-firewood', 'Stack the firewood'], ['shutters', 'Paint the shutters before winter'], ['bed-tulips', 'Tidy the tulip bed'],
      ],
      winter: [
        ['path-front', 'Snow on the path', 'snow'], ['win-kitchen', 'Frost on the kitchen window', 'frost'], ['path-steps', 'Snowy stepping stones', 'snow'],
        ['win-living', 'Frost on the living room window', 'frost'], ['lawn-patch', 'A clear spot for the birds', 'snow'], ['win-bedroom', 'Frosty bedroom windows', 'frost'],
        ['attic-window', 'Frost on the round window', 'frost'], ['attic-floor', 'Winter dusting in the attic'], ['x-firewood', 'More wood for the stove'],
        ['x-jetty', 'Snow on the jetty', 'snow'],
      ],
      spring: [
        ['bed-roses', 'Spring weeds in the roses'], ['fence-left', 'Fresh paint for the fence'], ['bed-tulips', 'Spring weeds in the tulips'],
        ['fence-right', 'More fresh paint for the fence'], ['shutters', 'A new colour for the shutters'], ['door', 'A new colour for the door'],
        ['lawn-tree', 'The first mow of the year'], ['roof-right', 'Moss by the chimney'], ['x-windowboxes', 'Plant the window boxes'],
        ['x-veg', 'Sow the vegetable patch'], ['x-brickpath', 'Lay a brick path to the shed'], ['pond', 'Spring clean in the pond'],
      ],
    },
    cafe: {
      summer: [
        ['cafe-tables', 'Sticky summer tables'], ['cafe-awning', 'Dust on the awning'], ['cafe-terrace', 'Weeds between the flagstones'],
        ['cafe-planters', 'Replant the planter boxes'], ['cafe-floor', 'Sand on the café floor'], ['cafe-pots', 'New flowers for the pots'],
        ['cafe-window', 'Fingerprints on the shop window'], ['cafe-counter', 'Polish the coffee machine'],
      ],
      autumn: [
        ['cafe-terrace', 'Leaves on the terrace', 'leaves'], ['cafe-deck', 'Leaves on the deck', 'leaves'], ['cafe-window', 'Rain spots on the shop window'],
        ['cafe-floor', 'Muddy footprints on the floor'], ['cafe-herbs', 'Fresh herbs for the kitchen'], ['cafe-tables', 'Coffee rings on the tables'],
        ['cafe-counter', 'Pumpkin spice everywhere'],
      ],
      winter: [
        ['cafe-terrace', 'Snow on the terrace', 'snow'], ['cafe-deck', 'Snow on the deck', 'snow'], ['cafe-window', 'Frost on the shop window', 'frost'],
        ['cafe-floor', 'Slushy footprints'], ['cafe-counter', 'Hot chocolate splashes'], ['cafe-tables', 'Cocoa rings on the tables'],
      ],
      spring: [
        ['cafe-sign', 'Repaint the sign'], ['cafe-door', 'A new colour for the door'], ['cafe-planters', 'Spring planting'],
        ['cafe-pots', 'Pots for the steps'], ['cafe-herbs', 'Sow new herbs'], ['cafe-terrace', 'Moss on the terrace'],
        ['cafe-awning', 'Spring clean for the awning'],
      ],
    },
  };
  const PER_SEASON = { cottage: 6, cafe: 5 };
  // at most this many jobs of one kind in a season (default 2)
  const FAMILY_CAP = { mow: 1, paint: 2, rake: 2, snow: 2, plant: 2, build: 1 };

  const seasonOf = (n) => SEASON_ORDER[(n - 1) % 4];
  function seasonValue(n, i) { return Math.round(choreValue(CHORES.length - 1) * 0.4 * Math.min(1.6, Math.pow(1.05, n - 1)) * (1 + i * 0.04)); }
  const byId = (id) => CHORES.find((c) => c.id === id) || CAFE_CHORES.find((c) => c.id === id) || EXTRAS.find((c) => c.id === id);
  const famFor = (b, dirt) => (dirt === 'leaves' ? (b.scene === 'pond' ? 'skim' : 'rake') : dirt === 'snow' ? 'snow' : dirt === 'frost' ? 'wash' : b.family);

  // Pick a varied handful from the pool: seeded by the season number, never
  // more than the cap of one kind, at least one planting or building job,
  // and jobs from the same season last year pushed to the back.
  function pickSeason(n, place, history = true) {
    const pool = SEASON_POOL[place][seasonOf(n)];
    const r = U.rng(n * 7919 + (place === 'cafe' ? 104729 : 0));
    const last = history && n > 4 ? new Set(pickSeason(n - 4, place, false)) : new Set();
    const scored = pool.map((p) => ({ p, s: r() + (last.has(p[0]) ? 0.6 : 0) })).sort((a, b) => a.s - b.s).map((x) => x.p);
    const want = PER_SEASON[place], picked = [], count = {};
    for (const p of scored) {
      if (picked.length >= want) break;
      const fam = famFor(byId(p[0]), p[2]);
      if ((count[fam] || 0) >= (FAMILY_CAP[fam] || 2)) continue;
      count[fam] = (count[fam] || 0) + 1;
      picked.push(p);
    }
    const isNew = (p) => { const f = famFor(byId(p[0]), p[2]); return f === 'plant' || f === 'build'; };
    if (!picked.some(isNew)) {
      const swap = scored.find((p) => isNew(p) && !picked.includes(p));
      if (swap) picked[picked.length - 1] = swap;
    }
    return history ? picked : picked.map((p) => p[0]);
  }

  // places: list of restored place ids, the cottage first
  function seasonJobs(n, places) {
    if (n < 1) return [];
    const season = seasonOf(n);
    const out = [];
    for (const place of places) {
      pickSeason(n, place).forEach(([baseId, name, dirt], i) => {
        const b = byId(baseId);
        const find = place === 'cottage' ? SEASON_FINDS[season][i] : null;
        out.push(Object.assign({}, b, {
          id: `s${n}-${baseId}`, base: b.id, name, season, seasonNo: n, place, pending: dirt || 'grow',
          find, findId: find ? `${season}-${i}` : null,
          opts: Object.assign({}, b.opts, dirt ? { dirt } : {}), seed: (b.seed || 1) + n * 131 + i, family: famFor(b, dirt), value: seasonValue(n, i),
        }));
      });
    }
    return out;
  }
  // one keepsake per seasonal job at the cottage; each is found once, whichever year
  const SEASON_FINDS = {
    summer: [['🍓', 'A wild strawberry'], ['🐢', 'A tiny tortoise'], ['🕶️', 'Someone\'s sunglasses'], ['🦗', 'A grasshopper'], ['🌻', 'A sunflower seed'], ['🐚', 'A seashell from a holiday'], ['🧃', 'A forgotten juice box'], ['🦋', 'A sleepy butterfly']],
    autumn: [['🦔', 'A hedgehog asleep in the leaves'], ['🍄', 'A little mushroom'], ['🎃', 'A pumpkin seed'], ['🍁', 'The reddest leaf'], ['🌂', 'A lost umbrella'], ['🐿️', 'A squirrel\'s hidden nut'], ['🧦', 'One odd sock'], ['🦉', 'An owl feather']],
    winter: [['🥕', 'The snowman\'s carrot nose'], ['🧣', 'A lost scarf'], ['❄️', 'A perfect snowflake'], ['🧤', 'A tiny mitten'], ['🐦', 'A robin'], ['🍪', 'A gingerbread biscuit'], ['🕯️', 'A candle stub'], ['🎁', 'A forgotten present']],
    spring: [['🐣', 'A chick'], ['🐇', 'A bunny'], ['🌷', 'A tulip bulb'], ['🪺', 'An empty nest'], ['🐞', 'Two ladybirds'], ['🥚', 'A painted egg'], ['🌈', 'A rainbow in a puddle'], ['🪱', 'A friendly worm']],
  };

  // tool families that first appear in a season
  const FAMILY_SEASON = { rake: 2, snow: 3 };

  function famBase(fam) {
    if (fam in intro) return choreValue(intro[fam]);
    if (FAMILY_SEASON[fam]) return seasonValue(FAMILY_SEASON[fam], 0);
    return cafeValue(0); // planting and building
  }
  function toolCost(fam, tierIdx) {
    const base = famBase(fam) * 2;
    return Math.round(TOOLS.COST_MULT[tierIdx] * base / 5) * 5;
  }

  // helper robots: unlocked after a few chores
  const HELPER_COSTS = [choreValue(4) * 3, choreValue(8) * 3.5, choreValue(12) * 4].map((v) => Math.round(v / 5) * 5);
  const HELPER_UNLOCK = 3;

  const PAINTS = [
    { name: 'Sage', c: '#9cc5a1' }, { name: 'Duck egg', c: '#a6d3d4' }, { name: 'Sky', c: '#8fbfe6' },
    { name: 'Lavender', c: '#bba9df' }, { name: 'Blush', c: '#efb4ae' }, { name: 'Cherry', c: '#c9474f' },
    { name: 'Terracotta', c: '#d98b63' }, { name: 'Butter', c: '#f2d88a' }, { name: 'Cream', c: '#f4ecdc' },
    { name: 'Forest', c: '#4e7b5b' }, { name: 'Navy', c: '#3d5a86' }, { name: 'Charcoal', c: '#4b4a52' },
  ];
  const DEFAULT_COLOURS = { fence: '#f4ecdc', door: '#4e7b5b', wall: '#f2d88a', shutters: '#a6d3d4', sign: '#3d5a86', cafeDoor: '#c9474f', awning: '#2f8068' };

  // one keepsake hidden in each job, found the first time through
  const FINDS = {
    'lawn-patch': ['🐞', 'A ladybird'], 'lawn-tree': ['🌰', 'A shiny conker'], 'lawn-stones': ['🐌', 'A sleepy snail'],
    'path-steps': ['🍀', 'A four-leaf clover'], 'path-front': ['🗝️', 'An old brass key'], 'bed-roses': ['💍', 'A lost ring'],
    'fence-left': ['🎀', 'A faded ribbon'], 'fence-right': ['🪀', 'A yo-yo'], 'bed-tulips': ['🐛', 'A hungry caterpillar'],
    'win-kitchen': ['🦋', 'A butterfly sticker'], 'win-living': ['⭐', 'A glow-in-the-dark star'], 'door': ['🔔', 'A little brass bell'],
    'pond': ['🐸', 'A friendly frog'], 'shutters': ['🪶', 'A blue feather'], 'win-bedroom': ['🌈', 'A rainbow sticker'],
    'wall': ['🐝', 'A sleepy bumblebee'], 'roof-left': ['🪁', 'A lost kite'], 'roof-right': ['⚽', 'A very old football'],
    'attic-floor': ['🧩', 'A missing puzzle piece'], 'attic-window': ['🔭', 'A brass telescope'],
    'cafe-floor': ['☕', 'A chipped teacup'], 'cafe-window': ['🕰️', 'A pocket watch'], 'cafe-terrace': ['🦎', 'A little lizard'],
    'cafe-planters': ['🍋', 'A lemon pip'], 'cafe-tables': ['🎟️', 'An old cinema ticket'], 'cafe-deck': ['🪛', 'A tiny screwdriver'],
    'cafe-awning': ['🎐', 'A wind chime'], 'cafe-counter': ['🥄', 'A silver spoon'], 'cafe-wall': ['🐭', 'A shy mouse'],
    'cafe-herbs': ['🌿', 'A sprig of mint'], 'cafe-sign': ['🖌️', 'An old paintbrush'], 'cafe-door': ['🛎️', 'A shop bell'],
    'cafe-tiles': ['💌', 'A love letter'], 'cafe-pots': ['🫖', 'A tiny teapot'],
  };

  // what you do in each kind of job, for the first-time hint
  const VERBS = { mow: 'mow', scrub: 'scrub', paint: 'paint', wash: 'wash', weed: 'pull weeds', skim: 'skim', dust: 'dust', rake: 'rake', snow: 'shovel', plant: 'plant', build: 'build' };

  // decorations, bought in the shed once a few jobs are done at that place
  const DECOR = [
    { id: 'gnome', name: 'Garden gnome', icon: '🧙', cost: 120 },
    { id: 'pots', name: 'Flower pots by the door', icon: '🌸', cost: 220 },
    { id: 'mailbox', name: 'A red mailbox', icon: '📮', cost: 350 },
    { id: 'birdhouse', name: 'A bird house', icon: '🐦', cost: 500 },
    { id: 'lantern', name: 'Lantern by the door', icon: '🏮', cost: 700 },
    { id: 'windowboxes', name: 'Window boxes', icon: '🌺', cost: 950 },
    { id: 'bench', name: 'A garden bench', icon: '🪑', cost: 1300 },
    { id: 'cat2', name: 'A second cat', icon: '🐈', cost: 1700 },
    { id: 'wreath', name: 'A wreath for the door', icon: '💚', cost: 2200 },
    { id: 'lights', name: 'String lights on the fence', icon: '✨', cost: 2800 },
    { id: 'picnic', name: 'A picnic blanket', icon: '🧺', cost: 3600 },
    { id: 'beehive', name: 'A beehive', icon: '🐝', cost: 4600 },
    { id: 'bicycle', name: 'A bicycle with a basket', icon: '🚲', cost: 6000 },
    { id: 'swing', name: 'A swing on the old tree', icon: '🌳', cost: 8000 },
    { id: 'vane', name: 'A weather vane', icon: '🐓', cost: 10500 },
    { id: 'balloon', name: 'A hot-air balloon', icon: '🎈', cost: 15000 },
  ];
  const CAFE_DECOR = [
    { id: 'c-board', name: 'A chalkboard menu', icon: '🪧', cost: 300 },
    { id: 'c-flowers', name: 'A bucket of flowers', icon: '💐', cost: 450 },
    { id: 'c-cat', name: 'A café cat', icon: '🐈', cost: 650 },
    { id: 'c-bunting', name: 'Bunting', icon: '🎏', cost: 900 },
    { id: 'c-baskets', name: 'Hanging baskets', icon: '🌺', cost: 1200 },
    { id: 'c-cakes', name: 'Cakes in the window', icon: '🍰', cost: 1600 },
    { id: 'c-parasol', name: 'A big parasol', icon: '⛱️', cost: 2100 },
    { id: 'c-lights', name: 'Festoon lights', icon: '✨', cost: 2800 },
    { id: 'c-bike', name: 'A delivery bike', icon: '🚲', cost: 3600 },
    { id: 'c-dog', name: 'A sleepy dog', icon: '🐕', cost: 4600 },
    { id: 'c-icecream', name: 'An ice-cream cart', icon: '🍦', cost: 6000 },
    { id: 'c-scooter', name: 'A little scooter', icon: '🛵', cost: 8000 },
  ];
  const DECOR_UNLOCK = 6;

  // the places you can own; the picture of each is drawn by HOUSE or CAFE
  const PLACES = [
    { id: 'cottage', name: 'Ivy Cottage', blurb: 'The forgotten cottage where it all began.', price: 0, chores: CHORES, decor: DECOR, done: 'The cottage is lovely again' },
    { id: 'cafe', name: 'Marigold Café', blurb: 'A little corner café, closed for years. Sweep it, build it, plant it and open it again.', price: 9000, needs: 'cottage', chores: CAFE_CHORES, decor: CAFE_DECOR, done: 'The café is open again' },
  ];
  const placeOf = (id) => PLACES.find((p) => p.id === id) || PLACES[0];

  return {
    AREAS, CHORES, CAFE_CHORES, EXTRAS, PLACES, placeOf, FINDS, SEASON_FINDS, SEASON_ORDER, VERBS, DECOR, CAFE_DECOR, DECOR_UNLOCK, SEASON_NAMES,
    seasonOf, seasonJobs, FAMILY_SEASON, toolCost, HELPER_COSTS, HELPER_UNLOCK, PAINTS, DEFAULT_COLOURS, choreValue, intro,
  };
})();
