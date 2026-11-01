'use strict';
// The chores in order, what they pay and what tools cost.

const DATA = (() => {
  const AREAS = {
    lawn: 'Front garden', path: 'Garden path', fence: 'Picket fence', windows: 'Windows',
    door: 'Front door', wall: 'Cottage walls', beds: 'Flower beds', pond: 'Garden pond',
    roof: 'Roof', attic: 'Attic', autumn: 'Autumn',
  };

  // part = which piece of the cottage picture this chore restores
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

  CHORES.forEach((c, i) => { c.index = i; c.family = familyOf(c.scene); c.value = choreValue(i); });

  function familyOf(scene) {
    return { lawn: 'mow', stones: 'scrub', roof: 'scrub', fence: 'paint', door: 'paint', wall: 'paint', shutters: 'paint', window: 'wash', roundWindow: 'wash', bed: 'weed', pond: 'skim', attic: 'dust', leaves: 'rake' }[scene];
  }
  function choreValue(i) { return Math.round(32 * Math.pow(1.24, i)); }

  // first chore that uses each family sets the price level of its tools
  const intro = {};
  CHORES.forEach((c) => { if (!(c.family in intro)) intro[c.family] = c.index; });

  // ---------------------------------------------------------------- seasons
  // Once the cottage is restored the year turns. Each season brings back a
  // handful of jobs, some with seasonal mess (leaves, snow, frost).
  const SEASON_ORDER = ['summer', 'autumn', 'winter', 'spring'];
  const SEASON_NAMES = { summer: 'Summer', autumn: 'Autumn', winter: 'Winter', spring: 'Spring' };
  const SEASON_JOBS = {
    summer: [
      ['lawn-tree', 'The lawn has grown back'], ['pond', 'Algae is back in the pond'], ['win-kitchen', 'Summer dust on the kitchen window'],
      ['lawn-stones', 'Long grass by the stones'], ['bed-roses', 'Weeds among the roses'], ['win-living', 'Pollen on the living room window'],
      ['lawn-patch', 'The patch by the gate'], ['path-steps', 'Moss on the stepping stones'],
    ],
    autumn: [
      ['lawn-tree', 'Leaves under the old tree', 'leaves'], ['path-front', 'Leaves on the path', 'leaves'], ['lawn-stones', 'Leaves all over the lawn', 'leaves'],
      ['pond', 'Leaves in the pond', 'leaves'], ['win-bedroom', 'Rain spots on the bedroom windows'], ['lawn-patch', 'Leaves by the gate', 'leaves'],
      ['roof-left', 'Moss creeping back on the roof'], ['path-steps', 'Leaves on the stepping stones', 'leaves'],
    ],
    winter: [
      ['path-front', 'Snow on the path', 'snow'], ['win-kitchen', 'Frost on the kitchen window', 'frost'], ['path-steps', 'Snowy stepping stones', 'snow'],
      ['win-living', 'Frost on the living room window', 'frost'], ['lawn-patch', 'A clear spot for the birds', 'snow'], ['win-bedroom', 'Frosty bedroom windows', 'frost'],
      ['attic-window', 'Frost on the round window', 'frost'], ['attic-floor', 'Winter dusting in the attic'],
    ],
    spring: [
      ['bed-roses', 'Spring weeds in the roses'], ['fence-left', 'Fresh paint for the fence'], ['bed-tulips', 'Spring weeds in the tulips'],
      ['fence-right', 'More fresh paint for the fence'], ['shutters', 'A new colour for the shutters'], ['door', 'A new colour for the door'],
      ['lawn-tree', 'The first mow of the year'], ['roof-right', 'Moss by the chimney'],
    ],
  };
  const seasonOf = (n) => SEASON_ORDER[(n - 1) % 4];
  function seasonValue(n, i) { return Math.round(choreValue(CHORES.length - 1) * 0.42 * Math.pow(1.12, n - 1) * (1 + i * 0.05)); }
  function seasonJobs(n) {
    if (n < 1) return [];
    const season = seasonOf(n);
    return SEASON_JOBS[season].map(([baseId, name, dirt], i) => {
      const b = CHORES.find((c) => c.id === baseId);
      const fam = dirt === 'leaves' ? (b.scene === 'pond' ? 'skim' : 'rake') : dirt === 'snow' ? 'snow' : dirt === 'frost' ? 'wash' : b.family;
      return Object.assign({}, b, {
        id: `s${n}-${i}`, base: b.id, name, season, seasonNo: n, pending: dirt || 'grow', find: SEASON_FINDS[season][i], findId: `${season}-${i}`,
        opts: Object.assign({}, b.opts, dirt ? { dirt } : {}), seed: b.seed + n * 131 + i, family: fam, value: seasonValue(n, i),
      });
    });
  }
  // one keepsake per seasonal job; each is found once, whichever year
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
    return seasonValue(FAMILY_SEASON[fam] || 1, 0);
  }
  function toolCost(fam, tierIdx) {
    const base = famBase(fam) * 1.3;
    return Math.round(TOOLS.COST_MULT[tierIdx] * base / 5) * 5;
  }

  // helper robots: unlocked after a few chores
  const HELPER_COSTS = [choreValue(3) * 1.4, choreValue(6) * 1.8, choreValue(9) * 2.2].map((v) => Math.round(v / 5) * 5);
  const HELPER_UNLOCK = 3;

  const PAINTS = [
    { name: 'Sage', c: '#9cc5a1' }, { name: 'Duck egg', c: '#a6d3d4' }, { name: 'Sky', c: '#8fbfe6' },
    { name: 'Lavender', c: '#bba9df' }, { name: 'Blush', c: '#efb4ae' }, { name: 'Cherry', c: '#c9474f' },
    { name: 'Terracotta', c: '#d98b63' }, { name: 'Butter', c: '#f2d88a' }, { name: 'Cream', c: '#f4ecdc' },
    { name: 'Forest', c: '#4e7b5b' }, { name: 'Navy', c: '#3d5a86' }, { name: 'Charcoal', c: '#4b4a52' },
  ];
  const DEFAULT_COLOURS = { fence: '#f4ecdc', door: '#4e7b5b', wall: '#f2d88a', shutters: '#a6d3d4' };

  // one keepsake hidden in each job, found the first time through
  const FINDS = {
    'lawn-patch': ['🐞', 'A ladybird'], 'lawn-tree': ['🌰', 'A shiny conker'], 'lawn-stones': ['🐌', 'A sleepy snail'],
    'path-steps': ['🍀', 'A four-leaf clover'], 'path-front': ['🗝️', 'An old brass key'], 'bed-roses': ['💍', 'A lost ring'],
    'fence-left': ['🎀', 'A faded ribbon'], 'fence-right': ['🪀', 'A yo-yo'], 'bed-tulips': ['🐛', 'A hungry caterpillar'],
    'win-kitchen': ['🦋', 'A butterfly sticker'], 'win-living': ['⭐', 'A glow-in-the-dark star'], 'door': ['🔔', 'A little brass bell'],
    'pond': ['🐸', 'A friendly frog'], 'shutters': ['🪶', 'A blue feather'], 'win-bedroom': ['🌈', 'A rainbow sticker'],
    'wall': ['🐝', 'A sleepy bumblebee'], 'roof-left': ['🪁', 'A lost kite'], 'roof-right': ['⚽', 'A very old football'],
    'attic-floor': ['🧩', 'A missing puzzle piece'], 'attic-window': ['🔭', 'A brass telescope'],
  };

  // what you do in each kind of job, for the first-time hint
  const VERBS = { mow: 'mow', scrub: 'scrub', paint: 'paint', wash: 'wash', weed: 'pull weeds', skim: 'skim', dust: 'dust', rake: 'rake', snow: 'shovel' };

  // decorations for the cottage, bought in the shed once a few jobs are done
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
  const DECOR_UNLOCK = 6;

  return { AREAS, CHORES, FINDS, SEASON_FINDS, SEASON_ORDER, VERBS, DECOR, DECOR_UNLOCK, SEASON_NAMES, seasonOf, seasonJobs, FAMILY_SEASON, toolCost, HELPER_COSTS, HELPER_UNLOCK, PAINTS, DEFAULT_COLOURS, choreValue, intro };
})();
