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

  function toolCost(fam, tierIdx) {
    const base = choreValue(intro[fam] || 0) * 1.3;
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

  return { AREAS, CHORES, toolCost, HELPER_COSTS, HELPER_UNLOCK, PAINTS, DEFAULT_COLOURS, choreValue, intro };
})();
