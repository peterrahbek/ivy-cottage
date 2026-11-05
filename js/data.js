'use strict';
// The places, their chores in order, what they pay and what tools cost.

const DATA = (() => {
  const AREAS = {
    lawn: 'Front garden', path: 'Garden path', fence: 'Picket fence', windows: 'Windows',
    door: 'Front door', wall: 'Cottage walls', beds: 'Flower beds', pond: 'Garden pond',
    roof: 'Roof', attic: 'Attic', autumn: 'Autumn',
    inside: 'Inside the café', front: 'The café front', terrace: 'The terrace',
    beach: 'The beach', hutarea: 'The beach hut', sea: 'By the sea', van: 'The camper van', lighthouse: 'The lighthouse',
    kennels: 'The kennels', farmyard: 'The farmyard', dogwalk: 'The dog walk', barn: 'The barn', farmhouse: 'The farmhouse', paddock: 'The paddock', pool: 'The seal pool',
    fromCafe: 'From the café', fromRescue: 'From the rescue', fromGarden: 'From the garden',
    glasshouse: 'The glasshouse', walled: 'The walled garden', border: 'The long border', orchard: 'The orchard', kitchen: 'The kitchen garden', potting: 'The potting shed',
    towpath: 'The towpath', water: 'On the water', bank: 'The bank', boat: 'The narrowboat', lock: 'The lock', lockhouse: 'The lock-keeper\'s cottage', bridge: 'The bridge',
    shop: 'In the shop', shopfront: 'The shop front', nook: 'The reading nook', upstairs: 'Upstairs', courtyard: 'The courtyard',
    fromCanal: 'From the canal', fromBooks: 'From the bookshop',
    potYard: 'The cobbled yard', workshop: 'The workshop', kilnSide: 'By the kiln',
    platform: 'The platform', waitingRoom: 'The waiting room', signalBox: 'The signal box', lineSide: 'Along the line', ticketOffice: 'The ticket office',
    fromPottery: 'From the pottery', fromHalt: 'From the station',
    backRoom: 'The back room', backYard: 'The back yard', walledYard: 'The walled yard',
    fromBeads: 'From the bead shop', fromCurio: 'From the curiosity shop',
    stableYard: 'The stable yard', stableBlock: 'The stable block', tackRoom: 'The tack room', hayBarn: 'The hay barn',
    studio: 'The studio', loftYard: 'The yard', loftFront: 'The loft front',
    fromLoft: 'From the painter\'s loft', fromSky: 'From the night sky',
    hillPath: 'The hill path', hilltop: 'The hilltop', dome: 'The dome', mapRoom: 'The map room',
    poolside: 'The poolside', sunTerrace: 'The sun terrace', lidoKiosk: 'The kiosk', lidoFront: 'The way in',
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
    { id: 'cafe-fridge', area: 'inside', part: 'fridge', name: 'Stock the drinks fridge', scene: 'fridge', opts: {}, seed: 215, verb: 'put every drink in its place' },
    // out of the puzzle room: a job with a little thinking instead of a tool
    { id: 'cafe-cups', area: 'inside', part: 'cups', name: 'Put the cups away', scene: 'cups', opts: {}, seed: 216, how: 'Each cup to its own shelf and colour' },
  ];

  // The third place: a little cove with a beach hut, a rowing boat, a
  // camper van and an old lighthouse. Bought once the café is restored.
  const COVE_CHORES = [
    { id: 'cove-litter', area: 'beach', part: 'beach', name: 'Litter on the beach', scene: 'beach', opts: { items: 'litter' }, seed: 401, verb: 'pick up the litter' },
    { id: 'cove-seaweed', area: 'beach', part: 'sand', name: 'Seaweed all over the sand', scene: 'sand', opts: {}, seed: 402 },
    { id: 'cove-castle', area: 'beach', part: 'castle', name: 'Build a sandcastle', scene: 'castle', opts: {}, seed: 418 },
    { id: 'cove-hut', area: 'hutarea', part: 'hut', name: 'Paint the beach hut', scene: 'hut', opts: {}, seed: 403, color: 'hut' },
    { id: 'cove-boat', area: 'sea', part: 'boat', name: 'Barnacles on the old boat', scene: 'boat', opts: {}, seed: 404 },
    { id: 'cove-dunes', area: 'beach', part: 'dunes', name: 'Plant the dunes', scene: 'plant', opts: { box: 'dunes' }, seed: 405 },
    { id: 'cove-van-inside', area: 'van', part: 'vanInside', name: 'Sand in the old camper van', scene: 'van', opts: { stage: 'inside' }, seed: 406, family: 'dust', verb: 'vacuum' },
    { id: 'cove-boardwalk', area: 'beach', part: 'boardwalk', name: 'A boardwalk through the dunes', scene: 'build', opts: { material: 'planks', boardwalk: true }, seed: 407 },
    { id: 'cove-window', area: 'hutarea', part: 'hutWindow', name: 'The salty hut window', scene: 'window', opts: { room: 'hut' }, seed: 408 },
    { id: 'cove-van-wash', area: 'van', part: 'van', name: 'Wash the camper van', scene: 'van', opts: { stage: 'wash' }, seed: 409, family: 'wash' },
    { id: 'cove-rockpool', area: 'sea', part: 'rockpool', name: 'The rock pool', scene: 'rockpool', opts: {}, seed: 410 },
    { id: 'cove-boat-paint', area: 'sea', part: 'boatPaint', name: 'Paint the boat', scene: 'boatPaint', opts: {}, seed: 411, color: 'boat' },
    { id: 'cove-van-wax', area: 'van', part: 'vanWax', name: 'Wax the camper van', scene: 'van', opts: { stage: 'wax' }, seed: 412, family: 'polish', verb: 'wax' },
    { id: 'cove-shells', area: 'beach', part: 'shells', name: 'Shells for the windowsill', scene: 'beach', opts: { items: 'shells' }, seed: 413, verb: 'collect shells' },
    { id: 'cove-jetty', area: 'sea', part: 'jetty', name: 'Mend the jetty', scene: 'build', opts: { material: 'planks', jetty: true, sea: true }, seed: 414 },
    { id: 'cove-van-polish', area: 'van', part: 'vanShine', name: 'Polish the van till it shines', scene: 'van', opts: { stage: 'polish' }, seed: 415, family: 'polish' },
    { id: 'cove-lantern', area: 'lighthouse', part: 'lantern', name: 'The lighthouse lamp', scene: 'lantern', opts: {}, seed: 416 },
    { id: 'cove-lighthouse', area: 'lighthouse', part: 'lighthouse', name: 'Paint the lighthouse', scene: 'lighthouse', opts: {}, seed: 417, color: 'stripes' },
  ];

  // The fourth place: an old farm that takes in dogs, cats, rabbits and the
  // odd seal pup. Bought once the cove is restored. Feeding, walking and
  // brushing live here, each with tools of its own.
  const RESCUE_CHORES = [
    { id: 'rescue-bowls', area: 'kennels', part: 'bowls', name: 'Breakfast for the dogs', scene: 'bowls', opts: { food: 'dog' }, seed: 501, verb: 'fill every bowl' },
    { id: 'rescue-yard', area: 'farmyard', part: 'yard', name: 'Moss on the farmyard', scene: 'stones', opts: { shape: 'terrace' }, seed: 502 },
    { id: 'rescue-walk', area: 'dogwalk', part: 'trail', name: 'Walk the dogs', scene: 'walk', opts: {}, seed: 503, verb: 'walk the dogs along the path' },
    { id: 'rescue-hutch', area: 'barn', part: 'hutch', name: 'Fresh straw for the rabbits', scene: 'hutch', opts: {}, seed: 504, verb: 'muck out the old straw' },
    { id: 'rescue-puppy', area: 'kennels', part: 'tub', name: 'A very muddy puppy', scene: 'dog', opts: {}, seed: 505, verb: 'give the puppy a bath' },
    { id: 'rescue-toys', area: 'farmyard', part: 'toys', name: 'Dog toys all over the grass', scene: 'beach', opts: { items: 'toys', ground: 'grass' }, seed: 506, family: 'arrange', verb: 'put the toys in the box' },
    { id: 'rescue-cat', area: 'farmhouse', part: 'cat', name: 'Brush the fluffy cat', scene: 'cat', opts: {}, seed: 507, verb: 'brush the cat' },
    { id: 'rescue-fence', area: 'paddock', part: 'fence', name: 'Paint the paddock fence', scene: 'fence', opts: { side: 'left' }, seed: 508, color: 'paddock' },
    { id: 'rescue-water', area: 'kennels', part: 'trough', name: 'Fresh water for everyone', scene: 'bowls', opts: { food: 'water' }, seed: 509, verb: 'fill every bowl' },
    { id: 'rescue-pond', area: 'paddock', part: 'pond', name: 'The duck pond', scene: 'pond', opts: {}, seed: 510 },
    { id: 'rescue-seal', area: 'pool', part: 'seal', name: 'Lunch for the seal pup', scene: 'seal', opts: { where: 'pool' }, seed: 511, verb: 'give the seal its fish' },
    { id: 'rescue-floor', area: 'barn', part: 'floor', name: 'New boards in the barn', scene: 'build', opts: { material: 'planks' }, seed: 512 },
    { id: 'rescue-veg', area: 'barn', part: 'veg', name: 'Carrots for the rabbits', scene: 'plant', opts: { box: 'veg' }, seed: 513 },
    { id: 'rescue-meadow', area: 'paddock', part: 'meadow', name: 'Long grass in the paddock', scene: 'lawn', opts: { shape: 'patch' }, seed: 514 },
    { id: 'rescue-door', area: 'farmhouse', part: 'door', name: 'Paint the farmhouse door', scene: 'door', opts: {}, seed: 515, color: 'rescueDoor' },
    { id: 'rescue-window', area: 'farmhouse', part: 'window', name: 'The office window', scene: 'window', opts: { room: 'office' }, seed: 516 },
    { id: 'rescue-sign', area: 'farmyard', part: 'sign', name: 'Paint the rescue sign', scene: 'sign', opts: { title: 'RESCUE', sub: '· BLUEBELL FARM ·', icon: 'paw', farm: true }, seed: 517, color: 'rescueSign' },
    { id: 'rescue-feed', area: 'kennels', part: 'feed', name: 'Feeding time', scene: 'feeding', opts: {}, seed: 518, how: 'Feed everyone what the chart says' },
    { id: 'rescue-beds', area: 'farmhouse', part: 'beds', name: 'Who sleeps where?', scene: 'beds', opts: {}, seed: 519, how: 'Read the notes, then tuck everyone in' },
  ];

  // The fifth place: a walled garden with an old glasshouse, an orchard and
  // a potting shed. Bought once the rescue is restored. Two of its jobs are
  // puzzles: the watering pipes and the cutting garden.
  const GLASS_CHORES = [
    { id: 'gh-path', area: 'walled', part: 'path', name: 'Moss on the brick path', scene: 'stones', opts: { shape: 'path' }, seed: 701 },
    { id: 'gh-panes', area: 'glasshouse', part: 'panes', name: 'The grimy glasshouse', scene: 'window', opts: { room: 'glasshouse' }, seed: 702 },
    { id: 'gh-border', area: 'border', part: 'border', name: 'Weeds in the long border', scene: 'bed', opts: { flower: 'rose' }, seed: 703 },
    { id: 'gh-water', area: 'glasshouse', part: 'hose', name: 'Water the glasshouse', scene: 'hose', opts: {}, seed: 704, how: 'Tap the pipes to turn them' },
    { id: 'gh-orchard', area: 'orchard', part: 'orchard', name: 'Long grass in the orchard', scene: 'lawn', opts: { shape: 'tree' }, seed: 705 },
    { id: 'gh-raised', area: 'kitchen', part: 'raised', name: 'Build the raised beds', scene: 'build', opts: { material: 'planks' }, seed: 706 },
    { id: 'gh-veg', area: 'kitchen', part: 'veg', name: 'Sow the vegetable beds', scene: 'plant', opts: { box: 'veg' }, seed: 707 },
    { id: 'gh-apples', area: 'orchard', part: 'apples', name: 'Windfalls under the apple trees', scene: 'beach', opts: { items: 'apples', ground: 'grass' }, seed: 708, verb: 'pick up the apples' },
    { id: 'gh-shed', area: 'potting', part: 'shed', name: 'Paint the potting shed', scene: 'hut', opts: { garden: true }, seed: 709, color: 'pottingShed' },
    { id: 'gh-cutting', area: 'border', part: 'cutting', name: 'The cutting garden', scene: 'plan', opts: {}, seed: 710, how: 'One of each flower in every row and column' },
    { id: 'gh-wall', area: 'walled', part: 'wall', name: 'Mend the old garden wall', scene: 'build', opts: { material: 'bricks' }, seed: 711 },
    { id: 'gh-pond', area: 'walled', part: 'pond', name: 'The lily pond', scene: 'pond', opts: {}, seed: 712 },
    { id: 'gh-roof', area: 'potting', part: 'roof', name: 'Moss on the shed roof', scene: 'roof', opts: { side: 'left' }, seed: 713 },
    { id: 'gh-pots', area: 'glasshouse', part: 'pots', name: 'Pots by the glasshouse door', scene: 'plant', opts: { box: 'pots' }, seed: 714 },
    { id: 'gh-door', area: 'walled', part: 'door', name: 'Paint the door in the wall', scene: 'door', opts: { garden: true }, seed: 715, color: 'gardenDoor' },
  ];

  // The sixth place: a canal lock with a narrowboat, a humpback bridge and
  // the lock-keeper's cottage. For sale a year after the glasshouse is
  // restored. Loading the boat is a puzzle.
  const CANAL_CHORES = [
    { id: 'canal-towpath', area: 'towpath', part: 'towpath', name: 'Moss on the towpath', scene: 'stones', opts: { shape: 'path' }, seed: 801 },
    { id: 'canal-weed', area: 'water', part: 'weed', name: 'Duckweed on the canal', scene: 'pond', opts: { canal: true }, seed: 802 },
    { id: 'canal-litter', area: 'towpath', part: 'litter', name: 'Litter along the towpath', scene: 'beach', opts: { items: 'litter', ground: 'grass' }, seed: 803, verb: 'pick up the litter' },
    { id: 'canal-bank', area: 'bank', part: 'bank', name: 'Long grass on the bank', scene: 'lawn', opts: { shape: 'patch' }, seed: 804 },
    { id: 'canal-portholes', area: 'boat', part: 'portholes', name: 'Grimy portholes', scene: 'porthole', opts: {}, seed: 805 },
    { id: 'canal-boat', area: 'boat', part: 'boat', name: 'Paint the narrowboat', scene: 'narrowboat', opts: {}, seed: 806, color: 'narrowboat' },
    { id: 'canal-gates', area: 'lock', part: 'gates', name: 'Mend the lock gates', scene: 'build', opts: { material: 'planks' }, seed: 807 },
    { id: 'canal-hold', area: 'boat', part: 'hold', name: 'Load the boat', scene: 'pack', opts: {}, seed: 808, how: 'Fit every piece into the hold' },
    { id: 'canal-roof', area: 'boat', part: 'roof', name: 'Pots on the boat roof', scene: 'plant', opts: { box: 'pots' }, seed: 809 },
    { id: 'canal-fence', area: 'lockhouse', part: 'fence', name: 'Paint the lock-keeper\'s fence', scene: 'fence', opts: {}, seed: 810, color: 'lockFence' },
    { id: 'canal-door', area: 'lockhouse', part: 'door', name: 'Paint the lock-keeper\'s door', scene: 'door', opts: {}, seed: 811, color: 'lockDoor' },
    { id: 'canal-window', area: 'lockhouse', part: 'window', name: 'The lock-keeper\'s window', scene: 'window', opts: { room: 'kitchen' }, seed: 812 },
    { id: 'canal-bridge', area: 'bridge', part: 'bridge', name: 'Mend the humpback bridge', scene: 'build', opts: { material: 'bricks' }, seed: 813 },
    { id: 'canal-dinghy', area: 'water', part: 'dinghy', name: 'Paint the little rowing boat', scene: 'boatPaint', opts: { where: 'canal' }, seed: 814, color: 'dinghy' },
    { id: 'canal-sign', area: 'lock', part: 'sign', name: 'Paint the lock sign', scene: 'sign', opts: { title: 'KINGFISHER', sub: '· LOCK No 7 ·', icon: 'fish' }, seed: 815, color: 'lockSign' },
  ];

  // The seventh place: an old bookshop with a reading nook, a shop cat and a
  // courtyard. For sale a year after the canal is restored. Sorting the
  // shelves is a puzzle.
  const BOOK_CHORES = [
    { id: 'books-floor', area: 'shop', part: 'floor', name: 'Sweep the coffee corner', scene: 'cafeFloor', opts: {}, seed: 901 },
    { id: 'books-window', area: 'shopfront', part: 'window', name: 'The bookshop window', scene: 'window', opts: { room: 'bookshop' }, seed: 902 },
    { id: 'books-awning', area: 'shopfront', part: 'awning', name: 'Scrub the striped awning', scene: 'awning', opts: {}, seed: 903 },
    { id: 'books-shelves', area: 'shop', part: 'shelves', name: 'Back on the shelves', scene: 'books', opts: {}, seed: 904, how: 'Every series on a shelf of its own' },
    { id: 'books-counter', area: 'shop', part: 'counter', name: 'Polish the coffee machine', scene: 'counter', opts: {}, seed: 905 },
    { id: 'books-sign', area: 'shopfront', part: 'sign', name: 'Paint the bookshop sign', scene: 'sign', opts: { title: 'BOOKS', sub: '· HOLLYHOCK LANE ·', icon: 'book' }, seed: 906, color: 'bookSign' },
    { id: 'books-door', area: 'shopfront', part: 'door', name: 'Paint the shop door', scene: 'door', opts: {}, seed: 907, color: 'bookDoor' },
    { id: 'books-boxes', area: 'shopfront', part: 'boxes', name: 'Window boxes', scene: 'plant', opts: { box: 'windowbox', plants: 'flowers' }, seed: 908 },
    { id: 'books-cat', area: 'nook', part: 'cat', name: 'The shop cat', scene: 'cat', opts: {}, seed: 909, verb: 'brush the cat' },
    { id: 'books-tea', area: 'nook', part: 'tea', name: 'Tea for the readers', scene: 'coffee', opts: { drink: 'tea' }, seed: 910, verb: 'pour a drink in every cup' },
    { id: 'books-tables', area: 'nook', part: 'tables', name: 'Sticky reading tables', scene: 'tables', opts: {}, seed: 911 },
    { id: 'books-attic', area: 'upstairs', part: 'attic', name: 'The dusty stockroom', scene: 'attic', opts: {}, seed: 912 },
    { id: 'books-yard', area: 'courtyard', part: 'yard', name: 'Moss in the courtyard', scene: 'stones', opts: { shape: 'terrace' }, seed: 913 },
    { id: 'books-bed', area: 'courtyard', part: 'bed', name: 'Weeds by the hollyhocks', scene: 'bed', opts: { flower: 'rose' }, seed: 914 },
    { id: 'books-bench', area: 'courtyard', part: 'bench', name: 'Build a reading bench', scene: 'build', opts: { material: 'planks' }, seed: 915 },
  ];

  // The eighth place: a pottery in an old brick barn on a field lane, with a
  // kiln, a potter's wheel and glaze shelves. For sale a year after the
  // bookshop is restored. Throwing a bowl is made with your own hands; glazing
  // the tea set and loading the kiln are puzzles.
  const POTTERY_CHORES = [
    { id: 'pot-yard', area: 'potYard', part: 'yard', name: 'The cobbled yard', scene: 'stones', opts: { shape: 'yard' }, seed: 1001 },
    { id: 'pot-window', area: 'workshop', part: 'window', name: 'The workshop window', scene: 'window', opts: { room: 'pottery' }, seed: 1002 },
    { id: 'pot-floor', area: 'workshop', part: 'floor', name: 'Clay dust on the floor', scene: 'cafeFloor', opts: { where: 'pottery' }, seed: 1003 },
    { id: 'pot-kiln', area: 'kilnSide', part: 'kiln', name: 'Soot on the kiln', scene: 'kiln', opts: {}, seed: 1004 },
    { id: 'pot-wheel', area: 'workshop', part: 'wheel', name: 'The clay-caked wheel', scene: 'counter', opts: { what: 'wheel' }, seed: 1005 },
    { id: 'pot-shelves', area: 'workshop', part: 'shelves', name: 'Dusty glaze shelves', scene: 'attic', opts: { where: 'pottery' }, seed: 1006 },
    { id: 'pot-chimney', area: 'kilnSide', part: 'chimney', name: 'Moss on the kiln chimney', scene: 'roof', opts: { what: 'chimney' }, seed: 1007 },
    { id: 'pot-door', area: 'potYard', part: 'door', name: 'Paint the barn door', scene: 'door', opts: { what: 'barn' }, seed: 1008, color: 'potteryDoor' },
    { id: 'pot-sign', area: 'potYard', part: 'sign', name: 'Paint the pottery sign', scene: 'sign', opts: { title: 'POTTERY', sub: '· KILN LANE ·', icon: 'pot' }, seed: 1009, color: 'potterySign' },
    { id: 'pot-rack', area: 'potYard', part: 'rack', name: 'A new drying rack', scene: 'build', opts: { material: 'planks' }, seed: 1010 },
    { id: 'pot-scraps', area: 'workshop', part: 'scraps', name: 'Clay scraps into the bin', scene: 'beach', opts: { items: 'clay', ground: 'floor' }, seed: 1011, verb: 'put the scraps in the bin' },
    { id: 'pot-lavender', area: 'kilnSide', part: 'lavender', name: 'Lavender by the kiln', scene: 'plant', opts: { box: 'bed', plants: 'lavender' }, seed: 1012 },
    { id: 'pot-throw', area: 'workshop', part: 'throw', name: 'Throw a pot', scene: 'wheel', opts: {}, seed: 1013, how: 'Spin the wheel, pull up the clay, glaze it' },
    { id: 'pot-glaze', area: 'workshop', part: 'glaze', name: 'Glaze the tea set', scene: 'cups', opts: { where: 'pottery' }, seed: 1014, how: 'Each pot to its own shelf and glaze' },
    { id: 'pot-firing', area: 'kilnSide', part: 'firing', name: 'Load the kiln', scene: 'pack', opts: { what: 'kiln' }, seed: 1015, how: 'Fit every pot onto the kiln shelves' },
  ];

  // The ninth place: a little country station where no train has stopped for
  // years. For sale a year after the pottery is restored. Its puzzles are
  // little mysteries: lost property, stamps for the parcels and what is
  // missing from the shelves.
  const HALT_CHORES = [
    { id: 'halt-platform', area: 'platform', part: 'platform', name: 'Moss on the platform', scene: 'stones', opts: { shape: 'platform' }, seed: 1101 },
    { id: 'halt-floor', area: 'waitingRoom', part: 'floor', name: 'The waiting-room floor', scene: 'cafeFloor', opts: { where: 'halt' }, seed: 1102 },
    { id: 'halt-window', area: 'waitingRoom', part: 'window', name: 'The waiting-room window', scene: 'window', opts: { room: 'waiting' }, seed: 1103 },
    { id: 'halt-box', area: 'signalBox', part: 'box', name: 'The signal-box windows', scene: 'window', opts: { room: 'signalbox' }, seed: 1104 },
    { id: 'halt-clock', area: 'platform', part: 'clock', name: 'The station clock', scene: 'roundWindow', opts: { what: 'clock' }, seed: 1105 },
    { id: 'halt-lamps', area: 'platform', part: 'lamps', name: 'The platform lamps', scene: 'lantern', opts: { where: 'halt' }, seed: 1106 },
    { id: 'halt-sign', area: 'platform', part: 'sign', name: 'Paint the station sign', scene: 'sign', opts: { title: 'HALFPENNY HALT', sub: '· PLATFORM 1 ·', icon: 'train' }, seed: 1107, color: 'haltSign' },
    { id: 'halt-door', area: 'ticketOffice', part: 'door', name: 'Paint the ticket-office door', scene: 'door', opts: {}, seed: 1108, color: 'haltDoor' },
    { id: 'halt-gate', area: 'lineSide', part: 'gate', name: 'Paint the crossing gate', scene: 'fence', opts: { what: 'gate' }, seed: 1109, color: 'haltGate' },
    { id: 'halt-bench', area: 'platform', part: 'bench', name: 'A new platform bench', scene: 'build', opts: { material: 'planks' }, seed: 1110 },
    { id: 'halt-baskets', area: 'platform', part: 'baskets', name: 'Hanging baskets', scene: 'plant', opts: { box: 'baskets', plants: 'flowers' }, seed: 1111 },
    { id: 'halt-line', area: 'lineSide', part: 'line', name: 'Litter along the line', scene: 'beach', opts: { items: 'litter', ground: 'gravel' }, seed: 1112, verb: 'pick up the litter' },
    { id: 'halt-lost', area: 'ticketOffice', part: 'lost', name: 'Lost property', scene: 'owners', opts: {}, seed: 1113, how: 'Read the notes, then give everything back' },
    { id: 'halt-parcels', area: 'ticketOffice', part: 'parcels', name: 'Stamps for the parcels', scene: 'post', opts: {}, seed: 1114, how: 'Stamps that add up to each weight' },
    { id: 'halt-shelves', area: 'ticketOffice', part: 'shelves', name: 'What\'s missing from the shelves', scene: 'seek', opts: { where: 'halt' }, seed: 1115, how: 'Find the five things on the list' },
  ];

  // The tenth place: a tiny haberdashery on a cobbled street, with a bow
  // window, drawers of buttons and trays of beads. For sale a year after the
  // station is restored. Three of its jobs are made by hand: stringing beads,
  // sorting buttons and a bracelet for the window.
  const BEAD_CHORES = [
    { id: 'bb-step', area: 'shopfront', part: 'step', name: 'The front step', scene: 'stones', opts: { shape: 'step' }, seed: 1201 },
    { id: 'bb-window', area: 'shopfront', part: 'window', name: 'The bow window', scene: 'window', opts: { room: 'haberdashery' }, seed: 1202 },
    { id: 'bb-awning', area: 'shopfront', part: 'awning', name: 'The striped awning', scene: 'awning', opts: {}, seed: 1203 },
    { id: 'bb-sign', area: 'shopfront', part: 'sign', name: 'Paint the shop sign', scene: 'sign', opts: { title: 'BUTTON & BEAD', sub: '· HABERDASHERY ·', icon: 'button' }, seed: 1204, color: 'beadSign' },
    { id: 'bb-door', area: 'shopfront', part: 'door', name: 'Paint the shop door', scene: 'door', opts: {}, seed: 1205, color: 'beadDoor' },
    { id: 'bb-floor', area: 'shop', part: 'floor', name: 'Threads on the floor', scene: 'cafeFloor', opts: { where: 'beads' }, seed: 1206 },
    { id: 'bb-scales', area: 'shop', part: 'scales', name: 'The brass scales', scene: 'counter', opts: { what: 'scales' }, seed: 1207 },
    { id: 'bb-machine', area: 'backRoom', part: 'machine', name: 'The sewing machine', scene: 'counter', opts: { what: 'machine' }, seed: 1208 },
    { id: 'bb-drawers', area: 'shop', part: 'drawers', name: 'Dusty button drawers', scene: 'attic', opts: { where: 'beads' }, seed: 1209 },
    { id: 'bb-shelves', area: 'shop', part: 'shelves', name: 'Shelves for the ribbons', scene: 'build', opts: { material: 'planks' }, seed: 1210 },
    { id: 'bb-boxes', area: 'shopfront', part: 'boxes', name: 'Window boxes', scene: 'plant', opts: { box: 'windowbox', plants: 'flowers' }, seed: 1211 },
    { id: 'bb-yard', area: 'backYard', part: 'yard', name: 'Moss in the back yard', scene: 'stones', opts: { shape: 'terrace' }, seed: 1212 },
    { id: 'bb-necklace', area: 'backRoom', part: 'necklace', name: 'String the beads', scene: 'beads', opts: {}, seed: 1213, how: 'Carry on the pattern, bead by bead' },
    { id: 'bb-buttons', area: 'shop', part: 'buttons', name: 'Sort the buttons', scene: 'buttons', opts: {}, seed: 1214, how: 'Each button to the jar with its colour and holes' },
    { id: 'bb-bracelet', area: 'backRoom', part: 'bracelet', name: 'A bracelet for the window', scene: 'beads', opts: { what: 'bracelet' }, seed: 1215, how: 'Carry on the pattern, bead by bead' },
  ];

  // The eleventh place: an old curiosity shop with a cabinet of little
  // drawers, a grandfather clock, a globe and a box nobody has opened in
  // years. For sale a year after the bead shop is restored. Its puzzles feel
  // like a little escape room: a locked box, a jigsaw and things to find.
  const CURIO_CHORES = [
    { id: 'cu-window', area: 'shopfront', part: 'window', name: 'The bow-fronted window', scene: 'window', opts: { room: 'curio' }, seed: 1301 },
    { id: 'cu-sign', area: 'shopfront', part: 'sign', name: 'Paint the shop sign', scene: 'sign', opts: { title: 'CURIOSITIES', sub: '· MARCHBANK & DAUGHTER ·', icon: 'key' }, seed: 1302, color: 'curioSign' },
    { id: 'cu-door', area: 'shopfront', part: 'door', name: 'Paint the green door', scene: 'door', opts: {}, seed: 1303, color: 'curioDoor' },
    { id: 'cu-floor', area: 'shop', part: 'floor', name: 'The creaky floor', scene: 'cafeFloor', opts: { where: 'curio' }, seed: 1304 },
    { id: 'cu-cabinet', area: 'shop', part: 'cabinet', name: 'The cabinet of drawers', scene: 'attic', opts: { where: 'curio' }, seed: 1305 },
    { id: 'cu-clock', area: 'shop', part: 'clock', name: 'The grandfather clock', scene: 'counter', opts: { what: 'clock' }, seed: 1306 },
    { id: 'cu-globe', area: 'shop', part: 'globe', name: 'The dusty globe', scene: 'roundWindow', opts: { what: 'globe' }, seed: 1307 },
    { id: 'cu-lamp', area: 'shop', part: 'lamp', name: 'The brass lamp', scene: 'lantern', opts: { where: 'curio' }, seed: 1308 },
    { id: 'cu-fountain', area: 'walledYard', part: 'fountain', name: 'The stone fountain', scene: 'pond', opts: { what: 'fountain' }, seed: 1309 },
    { id: 'cu-yard', area: 'walledYard', part: 'yard', name: 'The mossy yard', scene: 'stones', opts: { shape: 'yard' }, seed: 1310 },
    { id: 'cu-shelves', area: 'backRoom', part: 'shelves', name: 'New shelves', scene: 'build', opts: { material: 'planks' }, seed: 1311 },
    { id: 'cu-ferns', area: 'walledYard', part: 'ferns', name: 'Ferns in the yard', scene: 'plant', opts: { box: 'pots', plants: 'ferns' }, seed: 1312 },
    { id: 'cu-box', area: 'shop', part: 'box', name: 'The locked box', scene: 'lock', opts: {}, seed: 1313, how: 'Count the clues, then turn the dials' },
    { id: 'cu-jigsaw', area: 'backRoom', part: 'jigsaw', name: 'The jigsaw on the table', scene: 'jigsaw', opts: { where: 'curio' }, seed: 1314, how: 'Every piece to its place' },
    { id: 'cu-seek', area: 'shop', part: 'seek', name: 'Lost among the curiosities', scene: 'seek', opts: { where: 'curio' }, seed: 1315, how: 'Find the five things on the list' },
  ];

  // The twelfth place: a little pony yard with three half-doors, a tack room,
  // a paddock with jumps and a hay barn. For sale a year after the curiosity
  // shop is restored. Two ponies and a yard dog live here; they are looked
  // after already and never need anything. Ribbons in the mane are made by hand.
  const STABLE_CHORES = [
    { id: 'st-yard', area: 'stableYard', part: 'yard', name: 'The muddy yard', scene: 'stones', opts: { shape: 'yard' }, seed: 1401 },
    { id: 'st-paddock', area: 'paddock', part: 'paddock', name: 'The paddock grass', scene: 'lawn', opts: { shape: 'patch' }, seed: 1402 },
    { id: 'st-fence', area: 'paddock', part: 'fence', name: 'Paint the paddock fence', scene: 'fence', opts: {}, seed: 1403, color: 'stableFence' },
    { id: 'st-doors', area: 'stableBlock', part: 'doors', name: 'Paint the stable doors', scene: 'door', opts: { what: 'half' }, seed: 1404, color: 'stableDoor' },
    { id: 'st-jumps', area: 'paddock', part: 'jumps', name: 'Paint the jumps', scene: 'fence', opts: { what: 'jumps' }, seed: 1405, color: 'jumps' },
    { id: 'st-sign', area: 'stableYard', part: 'sign', name: 'Paint the yard sign', scene: 'sign', opts: { title: 'FOXGLOVE', sub: '· STABLES ·', icon: 'horseshoe' }, seed: 1406, color: 'stableSign' },
    { id: 'st-window', area: 'tackRoom', part: 'window', name: 'The tack-room window', scene: 'window', opts: { room: 'tack' }, seed: 1407 },
    { id: 'st-tack', area: 'tackRoom', part: 'tack', name: 'The dusty tack room', scene: 'attic', opts: { where: 'tack' }, seed: 1408 },
    { id: 'st-stable', area: 'stableBlock', part: 'stable', name: 'Muck out the stable', scene: 'hutch', opts: { what: 'stable' }, seed: 1409, verb: 'muck out the old straw' },
    { id: 'st-groom', area: 'stableBlock', part: 'pony', name: 'Groom the pony', scene: 'cat', opts: { what: 'pony' }, seed: 1410, verb: 'brush the pony' },
    { id: 'st-trough', area: 'stableYard', part: 'trough', name: 'The water trough', scene: 'bowls', opts: { what: 'trough' }, seed: 1411, verb: 'fill the trough' },
    { id: 'st-barn', area: 'hayBarn', part: 'barn', name: 'New boards on the hay barn', scene: 'build', opts: { material: 'planks' }, seed: 1412 },
    { id: 'st-apples', area: 'paddock', part: 'apples', name: 'Apples for the ponies', scene: 'beach', opts: { items: 'apples', ground: 'grass' }, seed: 1413, verb: 'pick up the apples' },
    { id: 'st-mane', area: 'stableBlock', part: 'mane', name: 'Ribbons in the mane', scene: 'beads', opts: { what: 'mane' }, seed: 1414, how: 'Carry on the pattern, ribbon by ribbon' },
    { id: 'st-saddles', area: 'tackRoom', part: 'saddles', name: 'Whose saddle is whose?', scene: 'owners', opts: { what: 'saddles' }, seed: 1415, how: 'Read the notes, then give every pony its own' },
  ];

  // The thirteenth place: a studio in an old hay loft, with a skylight, easels,
  // a store of frames, a swing seat and a long wall in the yard for a mural.
  // For sale a year after the stables are restored. Three of its jobs are
  // painted by hand; the canvas and the mural stay in the picture afterwards.
  const LOFT_CHORES = [
    { id: 'lo-skylight', area: 'loftFront', part: 'skylight', name: 'The skylight', scene: 'window', opts: { room: 'studio' }, seed: 1501 },
    { id: 'lo-window', area: 'loftFront', part: 'window', name: 'The loft window', scene: 'window', opts: { room: 'loft' }, seed: 1502 },
    { id: 'lo-floor', area: 'studio', part: 'floor', name: 'Paint on the floor', scene: 'cafeFloor', opts: { where: 'loft' }, seed: 1503 },
    { id: 'lo-brushes', area: 'studio', part: 'brushes', name: 'Wash the brushes', scene: 'counter', opts: { what: 'brushes' }, seed: 1504 },
    { id: 'lo-frames', area: 'studio', part: 'frames', name: 'The store of frames', scene: 'attic', opts: { where: 'loft' }, seed: 1505 },
    { id: 'lo-door', area: 'loftFront', part: 'door', name: 'Paint the loft door', scene: 'door', opts: {}, seed: 1506, color: 'loftDoor' },
    { id: 'lo-sign', area: 'loftFront', part: 'sign', name: 'Paint the studio sign', scene: 'sign', opts: { title: 'THE LOFT', sub: '· STUDIO ·', icon: 'palette' }, seed: 1507, color: 'loftSign' },
    { id: 'lo-swing', area: 'loftYard', part: 'swing', name: 'Paint the swing seat', scene: 'fence', opts: { what: 'swing' }, seed: 1508, color: 'swingSeat' },
    { id: 'lo-stairs', area: 'loftFront', part: 'stairs', name: 'The outside stairs', scene: 'build', opts: { material: 'planks' }, seed: 1509 },
    { id: 'lo-yard', area: 'loftYard', part: 'yard', name: 'Moss in the yard', scene: 'stones', opts: { shape: 'yard' }, seed: 1510 },
    { id: 'lo-poppies', area: 'loftYard', part: 'poppies', name: 'Poppies by the wall', scene: 'bed', opts: { flower: 'poppy' }, seed: 1511 },
    { id: 'lo-boxes', area: 'loftFront', part: 'boxes', name: 'Window boxes', scene: 'plant', opts: { box: 'windowbox', plants: 'flowers' }, seed: 1512 },
    { id: 'lo-canvas', area: 'studio', part: 'canvas', name: 'A canvas for the wall', scene: 'numbers', opts: { what: 'canvas' }, seed: 1513, how: 'Tap a jar, then the spaces with its number' },
    { id: 'lo-mural', area: 'loftYard', part: 'mural', name: 'The mural wall', scene: 'numbers', opts: { what: 'mural' }, seed: 1514, how: 'Tap a jar, then the spaces with its number' },
    { id: 'lo-mix', area: 'studio', part: 'mix', name: 'Mix the colours', scene: 'mix', opts: {}, seed: 1515, how: 'Two jars in the bowl for each colour' },
  ];

  // The fourteenth place: a little Victorian observatory on a hill, with a
  // copper dome, a brass telescope, a map room, a stone bench and an owl in the
  // oak. For sale a year after the loft is restored. Its two thinking jobs are
  // joining the stars and a jigsaw of the night sky.
  const OBSERVATORY_CHORES = [
    { id: 'ob-path', area: 'hillPath', part: 'path', name: 'The path up the hill', scene: 'stones', opts: { shape: 'path' }, seed: 1601 },
    { id: 'ob-grass', area: 'hilltop', part: 'grass', name: 'The hilltop grass', scene: 'lawn', opts: { shape: 'patch' }, seed: 1602 },
    { id: 'ob-dome', area: 'dome', part: 'dome', name: 'The copper dome', scene: 'roof', opts: { what: 'dome' }, seed: 1603 },
    { id: 'ob-lens', area: 'dome', part: 'lens', name: 'Polish the lens', scene: 'roundWindow', opts: { what: 'lens' }, seed: 1604 },
    { id: 'ob-telescope', area: 'dome', part: 'telescope', name: 'The brass telescope', scene: 'counter', opts: { what: 'telescope' }, seed: 1605 },
    { id: 'ob-window', area: 'mapRoom', part: 'window', name: 'The map-room window', scene: 'window', opts: { room: 'maproom' }, seed: 1606 },
    { id: 'ob-charts', area: 'mapRoom', part: 'charts', name: 'Dusty star charts', scene: 'attic', opts: { where: 'charts' }, seed: 1607 },
    { id: 'ob-door', area: 'hilltop', part: 'door', name: 'Paint the observatory door', scene: 'door', opts: {}, seed: 1608, color: 'obsDoor' },
    { id: 'ob-sign', area: 'hilltop', part: 'sign', name: 'Paint the sign', scene: 'sign', opts: { title: 'OWL HILL', sub: '· OBSERVATORY ·', icon: 'star' }, seed: 1609, color: 'obsSign' },
    { id: 'ob-lantern', area: 'hilltop', part: 'lantern', name: 'The lantern by the door', scene: 'lantern', opts: { where: 'observatory' }, seed: 1610 },
    { id: 'ob-bench', area: 'hilltop', part: 'bench', name: 'The stone bench', scene: 'build', opts: { material: 'bricks' }, seed: 1611 },
    { id: 'ob-steps', area: 'dome', part: 'steps', name: 'The dome steps', scene: 'build', opts: { material: 'planks' }, seed: 1612 },
    { id: 'ob-thyme', area: 'hilltop', part: 'thyme', name: 'Wild thyme on the slope', scene: 'plant', opts: { box: 'bed', plants: 'thyme' }, seed: 1613 },
    { id: 'ob-stars', area: 'dome', part: 'stars', name: 'Join the stars', scene: 'stars', opts: { where: 'observatory' }, seed: 1614, how: 'Join the stars in order' },
    { id: 'ob-jigsaw', area: 'mapRoom', part: 'jigsaw', name: 'The night-sky jigsaw', scene: 'jigsaw', opts: { where: 'observatory' }, seed: 1615, how: 'Every piece to its place' },
  ];

  // The fifteenth place: an art deco open-air pool with pale blue tiles, a
  // fountain, a diving board, changing huts and a kiosk. For sale a year after
  // the observatory is restored. The pool is drained and rimed in winter,
  // scrubbed in spring and full and shining in summer. The mosaic is a build job
  // whose coloured tiles click in where they are faintly drawn.
  const LIDO_CHORES = [
    { id: 'li-tiles', area: 'poolside', part: 'tiles', name: 'The pool tiles', scene: 'stones', opts: { shape: 'pool' }, seed: 1701 },
    { id: 'li-terrace', area: 'sunTerrace', part: 'terrace', name: 'The sun terrace', scene: 'stones', opts: { shape: 'terrace' }, seed: 1702 },
    { id: 'li-fountain', area: 'poolside', part: 'fountain', name: 'The fountain', scene: 'pond', opts: { what: 'fountain', where: 'lido' }, seed: 1703 },
    { id: 'li-huts', area: 'sunTerrace', part: 'huts', name: 'Paint the changing huts', scene: 'hut', opts: { what: 'lido' }, seed: 1704, color: 'lidoHuts' },
    { id: 'li-gate', area: 'lidoFront', part: 'gate', name: 'Paint the turnstile gate', scene: 'fence', opts: { what: 'turnstile' }, seed: 1705, color: 'lidoGate' },
    { id: 'li-sign', area: 'lidoFront', part: 'sign', name: 'Paint the lido sign', scene: 'sign', opts: { title: 'LIDO', sub: '· SUNNYBANK ·', icon: 'wave' }, seed: 1706, color: 'lidoSign' },
    { id: 'li-kiosk', area: 'lidoKiosk', part: 'kiosk', name: 'The kiosk counter', scene: 'counter', opts: { what: 'kiosk' }, seed: 1707 },
    { id: 'li-windows', area: 'lidoKiosk', part: 'windows', name: 'The kiosk windows', scene: 'window', opts: { room: 'kiosk' }, seed: 1708 },
    { id: 'li-board', area: 'poolside', part: 'board', name: 'The diving board', scene: 'build', opts: { material: 'planks' }, seed: 1709 },
    { id: 'li-steps', area: 'poolside', part: 'steps', name: 'The pool steps', scene: 'build', opts: { material: 'bricks' }, seed: 1710 },
    { id: 'li-mosaic', area: 'poolside', part: 'mosaic', name: 'The mosaic', scene: 'build', opts: { material: 'tiles', pattern: 'starfish' }, seed: 1711, verb: 'lay each tile where it is drawn' },
    { id: 'li-palms', area: 'sunTerrace', part: 'palms', name: 'Palms in pots', scene: 'plant', opts: { box: 'pots', plants: 'palms' }, seed: 1712 },
    { id: 'li-litter', area: 'poolside', part: 'litter', name: 'Litter by the pool', scene: 'beach', opts: { items: 'litter', ground: 'tiles' }, seed: 1713, verb: 'pick up the litter' },
    { id: 'li-chairs', area: 'sunTerrace', part: 'chairs', name: 'Deck chairs out', scene: 'serve', opts: { what: 'deckchairs' }, seed: 1714, verb: 'put each deck chair on its mark' },
    { id: 'li-ices', area: 'lidoKiosk', part: 'ices', name: 'Ice creams for the queue', scene: 'feeding', opts: { what: 'ices' }, seed: 1715, how: 'Scoop each ice just as the board says' },
  ];

  // The puzzle room, a beta place open from the start: jobs with a little
  // thinking instead of a tool (js/puzzles.js). No machines, no robots, a
  // new layout every time, and they can be taken in any order.
  const BETA_CHORES = [
    { id: 'beta-cups', area: 'fromCafe', part: 'cups', name: 'Put the cups away', scene: 'cups', opts: {}, seed: 601, how: 'Each cup to its own shelf and colour' },
    { id: 'beta-feed', area: 'fromRescue', part: 'feed', name: 'Feeding time', scene: 'feeding', opts: {}, seed: 602, how: 'Feed everyone what the chart says' },
    { id: 'beta-beds', area: 'fromRescue', part: 'beds', name: 'Who sleeps where?', scene: 'beds', opts: {}, seed: 604, how: 'Read the notes, then tuck everyone in' },
    { id: 'beta-hose', area: 'fromGarden', part: 'hose', name: 'Water the greenhouse', scene: 'hose', opts: {}, seed: 603, how: 'Tap the pipes to turn them' },
    { id: 'beta-plan', area: 'fromGarden', part: 'plan', name: 'The cutting garden', scene: 'plan', opts: {}, seed: 605, how: 'One of each flower in every row and column' },
    { id: 'beta-books', area: 'fromBooks', part: 'books', name: 'Back on the shelves', scene: 'books', opts: {}, seed: 606, how: 'Every series on a shelf of its own' },
    { id: 'beta-pack', area: 'fromCanal', part: 'pack', name: 'Load the boat', scene: 'pack', opts: {}, seed: 607, how: 'Fit every piece into the hold' },
    { id: 'beta-wheel', area: 'fromPottery', part: 'wheel', name: 'Throw a pot', scene: 'wheel', opts: {}, seed: 608, how: 'Spin the wheel, pull up the clay, glaze it' },
    { id: 'beta-owners', area: 'fromHalt', part: 'owners', name: 'Lost property', scene: 'owners', opts: {}, seed: 609, how: 'Read the notes, then give everything back' },
    { id: 'beta-post', area: 'fromHalt', part: 'post', name: 'Stamps for the parcels', scene: 'post', opts: {}, seed: 610, how: 'Stamps that add up to each weight' },
    { id: 'beta-seek', area: 'fromHalt', part: 'seek', name: 'What\'s missing?', scene: 'seek', opts: { where: 'halt' }, seed: 611, how: 'Find the five things on the list' },
    { id: 'beta-beads', area: 'fromBeads', part: 'beads', name: 'String the beads', scene: 'beads', opts: {}, seed: 612, how: 'Carry on the pattern, bead by bead' },
    { id: 'beta-buttons', area: 'fromBeads', part: 'buttons', name: 'Sort the buttons', scene: 'buttons', opts: {}, seed: 613, how: 'Each button to the jar with its colour and holes' },
    { id: 'beta-lock', area: 'fromCurio', part: 'lock', name: 'The locked box', scene: 'lock', opts: { dice: true }, seed: 614, how: 'Add up the dice, then turn the dials' },
    { id: 'beta-jigsaw', area: 'fromCurio', part: 'jigsaw', name: 'The jigsaw', scene: 'jigsaw', opts: {}, seed: 615, how: 'Every piece to its place' },
    { id: 'beta-numbers', area: 'fromLoft', part: 'numbers', name: 'Paint by numbers', scene: 'numbers', opts: {}, seed: 616, how: 'Tap a jar, then the spaces with its number' },
    { id: 'beta-stars', area: 'fromSky', part: 'stars', name: 'Join the stars', scene: 'stars', opts: {}, seed: 617, how: 'Join the stars in order' },
    { id: 'beta-mix', area: 'fromLoft', part: 'mix', name: 'Mix the colours', scene: 'mix', opts: {}, seed: 618, how: 'Two jars in the bowl for each colour' },
  ];

  // Jobs that only turn up in the seasons, for variety: planting and
  // building around the cottage, serving at the café, a seal at the cove.
  // They have no part in the picture.
  const EXTRAS = [
    { id: 'x-sunflowers', area: 'beds', name: 'Sunflowers', scene: 'plant', opts: { box: 'bed', plants: 'sunflowers' }, seed: 301 },
    { id: 'x-veg', area: 'beds', name: 'The vegetable patch', scene: 'plant', opts: { box: 'veg' }, seed: 302 },
    { id: 'x-bulbs', area: 'beds', name: 'Tulip bulbs', scene: 'plant', opts: { box: 'bed', plants: 'bulbs' }, seed: 303 },
    { id: 'x-windowboxes', area: 'windows', name: 'Window boxes', scene: 'plant', opts: { box: 'windowbox', plants: 'flowers' }, seed: 304 },
    { id: 'x-firewood', area: 'wall', name: 'The woodpile', scene: 'build', opts: { material: 'logs' }, seed: 305 },
    { id: 'x-jetty', area: 'pond', name: 'A jetty by the pond', scene: 'build', opts: { material: 'planks', jetty: true }, seed: 306 },
    { id: 'x-brickpath', area: 'path', name: 'A brick path', scene: 'build', opts: { material: 'bricks', path: true }, seed: 307 },
    { id: 'x-lights', area: 'wall', name: 'Christmas lights', scene: 'lights', opts: { where: 'cottage' }, seed: 308, verb: 'hang the lights' },
    { id: 'x-cafe-lights', place: 'cafe', area: 'front', name: 'Christmas lights', scene: 'lights', opts: { where: 'cafe' }, seed: 309, verb: 'hang the lights' },
    { id: 'x-cove-lights', place: 'cove', area: 'hutarea', name: 'Christmas lights', scene: 'lights', opts: { where: 'cove' }, seed: 310, verb: 'hang the lights' },
    { id: 'x-dog', area: 'lawn', name: 'A muddy dog', scene: 'dog', opts: {}, seed: 311, verb: 'give the dog a bath' },
    { id: 'x-cafe-dog', place: 'cafe', area: 'terrace', name: 'A muddy dog', scene: 'dog', opts: {}, seed: 313, verb: 'give the dog a bath' },
    { id: 'x-cove-dog', place: 'cove', area: 'beach', name: 'A sandy dog', scene: 'dog', opts: {}, seed: 312, verb: 'give the dog a bath' },
    { id: 'x-cafe-coffee', place: 'cafe', area: 'inside', name: 'Coffee for the guests', scene: 'coffee', opts: {}, seed: 314, verb: 'pour a drink in every cup' },
    { id: 'x-cafe-napkins', place: 'cafe', area: 'inside', name: 'Fill the napkin holders', scene: 'serve', opts: { what: 'napkins' }, seed: 315, verb: 'fill every napkin holder' },
    { id: 'x-cafe-chairs', place: 'cafe', area: 'terrace', name: 'Tables and chairs out', scene: 'serve', opts: { what: 'tables' }, seed: 316, verb: 'put each table and chair on its mark' },
    { id: 'x-cove-seal', place: 'cove', area: 'beach', name: 'A hungry seal', scene: 'seal', opts: { where: 'beach' }, seed: 317, verb: 'give the seal its fish' },
    { id: 'x-rescue-lights', place: 'rescue', area: 'barn', name: 'Fairy lights', scene: 'lights', opts: { where: 'rescue' }, seed: 318, verb: 'hang the lights' },
    { id: 'x-walk', area: 'lawn', name: 'Walk the dog next door', scene: 'walk', opts: {}, seed: 319, verb: 'walk the dog along the path' },
    { id: 'x-cat', area: 'door', name: 'The cat next door', scene: 'cat', opts: {}, seed: 320, verb: 'brush the cat' },
    { id: 'x-glass-lights', place: 'glasshouse', area: 'glasshouse', name: 'Fairy lights', scene: 'lights', opts: { where: 'glasshouse' }, seed: 321, verb: 'hang the lights' },
    { id: 'x-glass-cat', place: 'glasshouse', area: 'potting', name: 'The garden cat', scene: 'cat', opts: {}, seed: 322, verb: 'brush the cat' },
    { id: 'x-canal-lights', place: 'canal', area: 'boat', name: 'Fairy lights', scene: 'lights', opts: { where: 'canal' }, seed: 323, verb: 'hang the lights' },
    { id: 'x-books-lights', place: 'books', area: 'shopfront', name: 'Fairy lights', scene: 'lights', opts: { where: 'books' }, seed: 324, verb: 'hang the lights' },
    { id: 'x-canal-dog', place: 'canal', area: 'towpath', name: 'A muddy dog', scene: 'dog', opts: {}, seed: 325, verb: 'give the dog a bath' },
    // the newer puzzles turn up at the older places too
    { id: 'x-cove-pack', place: 'cove', area: 'van', name: 'Pack the camper van', scene: 'pack', opts: { what: 'van' }, seed: 326, how: 'Fit everything into the van' },
    { id: 'x-cottage-books', area: 'attic', name: 'Books back on the shelves', scene: 'books', opts: { where: 'cottage' }, seed: 327, how: 'Every series on a shelf of its own' },
    { id: 'x-cafe-owners', place: 'cafe', area: 'inside', name: 'Left behind at the café', scene: 'owners', opts: { what: 'cafe' }, seed: 328, how: 'Read the notes, then give everything back' },
    { id: 'x-rescue-owners', place: 'rescue', area: 'kennels', name: 'Whose lead is whose?', scene: 'owners', opts: { what: 'leads' }, seed: 329, how: 'Read the notes, then give every dog its own' },
    { id: 'x-books-post', place: 'books', area: 'shop', name: 'Parcels of books', scene: 'post', opts: { where: 'books' }, seed: 330, how: 'Stamps that add up to each weight' },
    { id: 'x-cottage-seek', area: 'attic', name: 'What\'s missing in the attic?', scene: 'seek', opts: { where: 'attic' }, seed: 331, how: 'Find the five things on the list' },
    { id: 'x-cafe-seek', place: 'cafe', area: 'inside', name: 'The store room', scene: 'seek', opts: { where: 'store' }, seed: 332, how: 'Find the five things on the list' },
    { id: 'x-books-seek', place: 'books', area: 'upstairs', name: 'The stockroom', scene: 'seek', opts: { where: 'stockroom' }, seed: 333, how: 'Find the five things on the list' },
    { id: 'x-rescue-seek', place: 'rescue', area: 'barn', name: 'The barn', scene: 'seek', opts: { where: 'barn' }, seed: 334, how: 'Find the five things on the list' },
    { id: 'x-pottery-lights', place: 'pottery', area: 'potYard', name: 'Fairy lights', scene: 'lights', opts: { where: 'pottery' }, seed: 335, verb: 'hang the lights' },
    { id: 'x-halt-lights', place: 'halt', area: 'platform', name: 'Lamps along the platform', scene: 'lights', opts: { where: 'halt' }, seed: 336, verb: 'hang the lights' },
    { id: 'x-pottery-cat', place: 'pottery', area: 'workshop', name: 'The pottery cat', scene: 'cat', opts: { where: 'pottery' }, seed: 337, verb: 'brush the cat' },
    // the bead shop's and the curiosity shop's puzzles at the older places
    { id: 'x-rescue-collar', place: 'rescue', area: 'farmhouse', name: 'A collar for the cat', scene: 'beads', opts: { what: 'collar' }, seed: 338, how: 'Carry on the pattern, bead by bead' },
    { id: 'x-cottage-buttons', area: 'attic', name: 'The sewing box in the attic', scene: 'buttons', opts: { where: 'cottage' }, seed: 339, how: 'Each button to the tin with its colour and holes' },
    { id: 'x-cottage-lock', area: 'attic', name: 'The old trunk in the attic', scene: 'lock', opts: { what: 'trunk' }, seed: 340, how: 'Count the clues, then turn the dials' },
    { id: 'x-books-lock', place: 'books', area: 'upstairs', name: 'The stockroom chest', scene: 'lock', opts: { what: 'chest', dials: 'letters' }, seed: 341, how: 'The first letters of the clues open it' },
    { id: 'x-halt-lock', place: 'halt', area: 'ticketOffice', name: 'A locked suitcase', scene: 'lock', opts: { what: 'case' }, seed: 342, how: 'Count the clues, then turn the dials' },
    // a jigsaw of each place, for autumn and winter afternoons
    { id: 'x-cottage-jigsaw', area: 'attic', name: 'A jigsaw of the cottage', scene: 'jigsaw', opts: { where: 'cottage' }, seed: 343, how: 'Every piece to its place' },
    { id: 'x-cafe-jigsaw', place: 'cafe', area: 'inside', name: 'A jigsaw of the café', scene: 'jigsaw', opts: { where: 'cafe' }, seed: 344, how: 'Every piece to its place' },
    { id: 'x-cove-jigsaw', place: 'cove', area: 'hutarea', name: 'A jigsaw of the cove', scene: 'jigsaw', opts: { where: 'cove' }, seed: 345, how: 'Every piece to its place' },
    { id: 'x-rescue-jigsaw', place: 'rescue', area: 'farmhouse', name: 'A jigsaw of the farm', scene: 'jigsaw', opts: { where: 'rescue' }, seed: 346, how: 'Every piece to its place' },
    { id: 'x-glass-jigsaw', place: 'glasshouse', area: 'potting', name: 'A jigsaw of the glasshouse', scene: 'jigsaw', opts: { where: 'glasshouse' }, seed: 347, how: 'Every piece to its place' },
    { id: 'x-canal-jigsaw', place: 'canal', area: 'lockhouse', name: 'A jigsaw of the lock', scene: 'jigsaw', opts: { where: 'canal' }, seed: 348, how: 'Every piece to its place' },
    { id: 'x-books-jigsaw', place: 'books', area: 'nook', name: 'A jigsaw of the bookshop', scene: 'jigsaw', opts: { where: 'books' }, seed: 349, how: 'Every piece to its place' },
    { id: 'x-pottery-jigsaw', place: 'pottery', area: 'workshop', name: 'A jigsaw of the pottery', scene: 'jigsaw', opts: { where: 'pottery' }, seed: 350, how: 'Every piece to its place' },
    { id: 'x-halt-jigsaw', place: 'halt', area: 'waitingRoom', name: 'A jigsaw of the station', scene: 'jigsaw', opts: { where: 'halt' }, seed: 351, how: 'Every piece to its place' },
    { id: 'x-beads-jigsaw', place: 'beads', area: 'backRoom', name: 'A jigsaw of the bead shop', scene: 'jigsaw', opts: { where: 'beads' }, seed: 352, how: 'Every piece to its place' },
    { id: 'x-beads-lights', place: 'beads', area: 'shopfront', name: 'Fairy lights', scene: 'lights', opts: { where: 'beads' }, seed: 353, verb: 'hang the lights' },
    { id: 'x-curio-lights', place: 'curio', area: 'shopfront', name: 'Fairy lights', scene: 'lights', opts: { where: 'curio' }, seed: 354, verb: 'hang the lights' },
    // the stables and the painter's loft, and their puzzles at the older places
    { id: 'x-st-walk', place: 'stables', area: 'paddock', name: 'Lead the pony round the paddock', scene: 'walk', opts: { what: 'pony' }, seed: 355, verb: 'lead the pony round the paddock' },
    { id: 'x-stables-lights', place: 'stables', area: 'hayBarn', name: 'Fairy lights', scene: 'lights', opts: { where: 'stables' }, seed: 356, verb: 'hang the lights' },
    { id: 'x-loft-lights', place: 'loft', area: 'loftFront', name: 'Fairy lights', scene: 'lights', opts: { where: 'loft' }, seed: 357, verb: 'hang the lights' },
    { id: 'x-stables-jigsaw', place: 'stables', area: 'tackRoom', name: 'A jigsaw of the stables', scene: 'jigsaw', opts: { where: 'stables' }, seed: 358, how: 'Every piece to its place' },
    { id: 'x-loft-jigsaw', place: 'loft', area: 'studio', name: 'A jigsaw of the loft', scene: 'jigsaw', opts: { where: 'loft' }, seed: 359, how: 'Every piece to its place' },
    { id: 'x-cottage-numbers', area: 'attic', name: 'A picture for the living room', scene: 'numbers', opts: { what: 'picture' }, seed: 360, how: 'Tap a jar, then the spaces with its number' },
    { id: 'x-cafe-numbers', place: 'cafe', area: 'inside', name: 'The chalkboard', scene: 'numbers', opts: { what: 'chalkboard' }, seed: 361, how: 'Tap a chalk, then the spaces with its number' },
    { id: 'x-cove-stars', place: 'cove', area: 'hutarea', name: 'Stars over the cove', scene: 'stars', opts: { where: 'cove' }, seed: 362, how: 'Join the stars in order' },
    { id: 'x-canal-stars', place: 'canal', area: 'lock', name: 'Stars over the lock', scene: 'stars', opts: { where: 'canal' }, seed: 363, how: 'Join the stars in order' },
    { id: 'x-beads-stitch', place: 'beads', area: 'backRoom', name: 'Stitch the tear', scene: 'stars', opts: { what: 'stitch' }, seed: 364, family: 'craft', how: 'Stitch from hole to hole, in order' },
    { id: 'x-rescue-stitch', place: 'rescue', area: 'farmhouse', name: 'Mend the dog\'s blanket', scene: 'stars', opts: { what: 'stitch', where: 'rescue' }, seed: 365, family: 'craft', how: 'Stitch from hole to hole, in order' },
    // the observatory and the lido
    { id: 'x-observatory-lights', place: 'observatory', area: 'dome', name: 'Fairy lights', scene: 'lights', opts: { where: 'observatory' }, seed: 366, verb: 'hang the lights' },
    { id: 'x-lido-lights', place: 'lido', area: 'sunTerrace', name: 'Fairy lights', scene: 'lights', opts: { where: 'lido' }, seed: 367, verb: 'hang the lights' },
    { id: 'x-lido-jigsaw', place: 'lido', area: 'lidoKiosk', name: 'A jigsaw of the lido', scene: 'jigsaw', opts: { where: 'lido' }, seed: 368, how: 'Every piece to its place' },
  ];

  const FAMILY_OF = {
    lawn: 'mow', stones: 'scrub', roof: 'scrub', fence: 'paint', door: 'paint', wall: 'paint', shutters: 'paint', window: 'wash', roundWindow: 'wash',
    bed: 'weed', pond: 'skim', attic: 'dust', leaves: 'rake', plant: 'plant', build: 'build',
    cafeFloor: 'dust', awning: 'scrub', sign: 'paint', tables: 'wipe', counter: 'wipe', fridge: 'arrange', lights: 'arrange',
    dog: 'groom', beach: 'collect', sand: 'rake', hut: 'paint', boat: 'scrub', boatPaint: 'paint', rockpool: 'skim', lantern: 'wash', lighthouse: 'paint', castle: 'build',
    coffee: 'brew', serve: 'arrange', seal: 'feed', bowls: 'feed', walk: 'walk', cat: 'brush', hutch: 'muck',
    cups: 'think', feeding: 'think', hose: 'think', beds: 'think', plan: 'think', books: 'think', pack: 'think', narrowboat: 'paint', porthole: 'wash',
    kiln: 'scrub', owners: 'think', post: 'think', seek: 'think', lock: 'think', jigsaw: 'think', stars: 'think',
    // made with your own hands: no tools, no robots, a Hint button like the puzzles
    wheel: 'craft', beads: 'craft', buttons: 'craft', numbers: 'craft', mix: 'craft',
  };
  const familyOf = (scene) => FAMILY_OF[scene];

  // indoor jobs get no snow or falling leaves from the season outside
  const INDOOR = new Set(['cafeFloor', 'tables', 'counter', 'fridge', 'attic', 'coffee', 'bowls', 'cat', 'hutch']);
  const isIndoor = (c) => (INDOOR.has(c.scene) && !(c.scene === 'bowls' && c.opts.what === 'trough')) || (c.scene === 'van' && c.opts.stage === 'inside') || (c.scene === 'build' && c.opts.material === 'tiles' && !c.opts.pattern) || (c.scene === 'serve' && c.opts.what === 'napkins') || (c.scene === 'beach' && c.opts.ground === 'floor') ||
    (c.scene === 'roundWindow' && (c.opts.what === 'globe' || c.opts.what === 'lens')) || (c.scene === 'lantern' && c.opts.where === 'curio');

  // What jobs pay. Kept modest: tools, helpers, decorations and new places
  // should take a while to save up for.
  function choreValue(i) { return Math.round(24 * Math.pow(1.2, i)); }
  function cafeValue(i) { return Math.round(150 * Math.pow(1.1, i)); }
  function coveValue(i) { return Math.round(260 * Math.pow(1.08, i)); }
  function rescueValue(i) { return Math.round(380 * Math.pow(1.07, i)); }
  function glassValue(i) { return Math.round(520 * Math.pow(1.06, i)); }
  function canalValue(i) { return Math.round(640 * Math.pow(1.06, i)); }
  function booksValue(i) { return Math.round(780 * Math.pow(1.06, i)); }
  // from the pottery on, a place's jobs pay its price / 90, rising 6% a job
  const byPrice = (price) => (i) => Math.round((price / 90) * Math.pow(1.06, i));
  const potteryValue = byPrice(80000), haltValue = byPrice(90000), beadsValue = byPrice(100000), curioValue = byPrice(110000), stablesValue = byPrice(120000), loftValue = byPrice(130000), observatoryValue = byPrice(140000), lidoValue = byPrice(150000);
  // puzzles pay like a job in the middle of the cottage: worth doing, but
  // never a shortcut past the other places
  function betaValue(i) { return Math.round(70 * Math.pow(1.15, i)); }

  CHORES.forEach((c, i) => { c.index = i; c.place = 'cottage'; c.family = familyOf(c.scene); c.value = choreValue(i); });
  CAFE_CHORES.forEach((c, i) => { c.index = i; c.place = 'cafe'; c.family = familyOf(c.scene); c.value = cafeValue(i); });
  COVE_CHORES.forEach((c, i) => { c.index = i; c.place = 'cove'; c.family = c.family || familyOf(c.scene); c.value = coveValue(i); });
  RESCUE_CHORES.forEach((c, i) => { c.index = i; c.place = 'rescue'; c.family = c.family || familyOf(c.scene); c.value = rescueValue(i); });
  GLASS_CHORES.forEach((c, i) => { c.index = i; c.place = 'glasshouse'; c.family = c.family || familyOf(c.scene); c.value = glassValue(i); });
  CANAL_CHORES.forEach((c, i) => { c.index = i; c.place = 'canal'; c.family = c.family || familyOf(c.scene); c.value = canalValue(i); });
  BOOK_CHORES.forEach((c, i) => { c.index = i; c.place = 'books'; c.family = c.family || familyOf(c.scene); c.value = booksValue(i); });
  POTTERY_CHORES.forEach((c, i) => { c.index = i; c.place = 'pottery'; c.family = c.family || familyOf(c.scene); c.value = potteryValue(i); });
  HALT_CHORES.forEach((c, i) => { c.index = i; c.place = 'halt'; c.family = c.family || familyOf(c.scene); c.value = haltValue(i); });
  BEAD_CHORES.forEach((c, i) => { c.index = i; c.place = 'beads'; c.family = c.family || familyOf(c.scene); c.value = beadsValue(i); });
  CURIO_CHORES.forEach((c, i) => { c.index = i; c.place = 'curio'; c.family = c.family || familyOf(c.scene); c.value = curioValue(i); });
  STABLE_CHORES.forEach((c, i) => { c.index = i; c.place = 'stables'; c.family = c.family || familyOf(c.scene); c.value = stablesValue(i); });
  LOFT_CHORES.forEach((c, i) => { c.index = i; c.place = 'loft'; c.family = c.family || familyOf(c.scene); c.value = loftValue(i); });
  OBSERVATORY_CHORES.forEach((c, i) => { c.index = i; c.place = 'observatory'; c.family = c.family || familyOf(c.scene); c.value = observatoryValue(i); });
  LIDO_CHORES.forEach((c, i) => { c.index = i; c.place = 'lido'; c.family = c.family || familyOf(c.scene); c.value = lidoValue(i); });
  BETA_CHORES.forEach((c, i) => { c.index = i; c.place = 'beta'; c.family = familyOf(c.scene); c.value = betaValue(i); });
  EXTRAS.forEach((c) => { c.place = c.place || 'cottage'; c.family = c.family || familyOf(c.scene); c.extra = true; });
  // the thinking and the making jobs are puzzles wherever they live (js/puzzles.js)
  const HANDS = new Set(['think', 'craft']);
  [CHORES, CAFE_CHORES, COVE_CHORES, RESCUE_CHORES, GLASS_CHORES, CANAL_CHORES, BOOK_CHORES, POTTERY_CHORES, HALT_CHORES, BEAD_CHORES, CURIO_CHORES, STABLE_CHORES, LOFT_CHORES, OBSERVATORY_CHORES, LIDO_CHORES, BETA_CHORES, EXTRAS].forEach((l) => l.forEach((c) => { if (HANDS.has(c.family)) c.puzzle = true; }));

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
        ['x-walk', 'A summer walk with the dog next door'],
        ['x-cottage-lock', 'The old trunk in the attic'],
      ],
      autumn: [
        ['lawn-tree', 'Leaves under the old tree', 'leaves'], ['path-front', 'Leaves on the path', 'leaves'], ['lawn-stones', 'Leaves all over the lawn', 'leaves'],
        ['pond', 'Leaves in the pond', 'leaves'], ['win-bedroom', 'Rain spots on the bedroom windows'], ['lawn-patch', 'Leaves by the gate', 'leaves'],
        ['roof-left', 'Moss creeping back on the roof'], ['path-steps', 'Leaves on the stepping stones', 'leaves'], ['x-bulbs', 'Plant tulip bulbs for spring'],
        ['x-firewood', 'Stack the firewood'], ['shutters', 'Paint the shutters before winter'], ['bed-tulips', 'Tidy the tulip bed'],
        ['x-dog', 'A muddy dog from next door'], ['x-cat', 'Burrs in the fur of the cat next door'], ['x-cottage-books', 'Books back on the shelves'],
        ['x-cottage-jigsaw', 'A jigsaw for a rainy day', null, { season: 'autumn' }], ['x-cottage-buttons', 'The sewing box in the attic'], ['x-cottage-numbers', 'A picture for the living room'],
      ],
      winter: [
        ['path-front', 'Snow on the path', 'snow'], ['win-kitchen', 'Frost on the kitchen window', 'frost'], ['path-steps', 'Snowy stepping stones', 'snow'],
        ['win-living', 'Frost on the living room window', 'frost'], ['lawn-patch', 'A clear spot for the birds', 'snow'], ['win-bedroom', 'Frosty bedroom windows', 'frost'],
        ['attic-window', 'Frost on the round window', 'frost'], ['attic-floor', 'Winter dusting in the attic'], ['x-firewood', 'More wood for the stove'],
        ['x-jetty', 'Snow on the jetty', 'snow'], ['x-lights', 'Christmas lights on the cottage'], ['x-cat', 'A cat curled up by the stove'],
        ['x-cottage-books', 'Winter reading, back on the shelves'], ['x-cottage-seek', 'What\'s missing in the attic?'],
        ['x-cottage-jigsaw', 'A jigsaw by the fire', null, { season: 'winter' }], ['x-cottage-lock', 'What is in the old trunk?'],
      ],
      spring: [
        ['bed-roses', 'Spring weeds in the roses'], ['fence-left', 'Fresh paint for the fence'], ['bed-tulips', 'Spring weeds in the tulips'],
        ['fence-right', 'More fresh paint for the fence'], ['shutters', 'A new colour for the shutters'], ['door', 'A new colour for the door'],
        ['lawn-tree', 'The first mow of the year'], ['roof-right', 'Moss by the chimney'], ['x-windowboxes', 'Plant the window boxes'],
        ['x-veg', 'Sow the vegetable patch'], ['x-brickpath', 'Lay a brick path to the shed'], ['pond', 'Spring clean in the pond'],
        ['x-dog', 'Bath time after a muddy spring walk'], ['x-walk', 'The dog next door wants a walk'], ['x-cottage-seek', 'Spring cleaning in the attic'],
        ['x-cottage-buttons', 'Spring clean in the sewing box'],
      ],
    },
    cafe: {
      summer: [
        ['cafe-tables', 'Sticky summer tables'], ['cafe-awning', 'Dust on the awning'], ['cafe-terrace', 'Weeds between the flagstones'],
        ['cafe-planters', 'Replant the planter boxes'], ['cafe-floor', 'Sand on the café floor'], ['cafe-pots', 'New flowers for the pots'],
        ['cafe-window', 'Fingerprints on the shop window'], ['cafe-counter', 'Polish the coffee machine'], ['cafe-fridge', 'Cold drinks for a hot day'],
        ['x-cafe-coffee', 'Iced coffee for a hot day', null, { drink: 'iced' }], ['x-cafe-chairs', 'Tables out in the sunshine'], ['x-cafe-napkins', 'Napkins for the lunch rush'],
        ['cafe-cups', 'Cups after the lunch rush'], ['x-cafe-owners', 'Left behind on a sunny day'],
      ],
      autumn: [
        ['cafe-terrace', 'Leaves on the terrace', 'leaves'], ['cafe-deck', 'Leaves on the deck', 'leaves'], ['cafe-window', 'Rain spots on the shop window'],
        ['cafe-floor', 'Muddy footprints on the floor'], ['cafe-herbs', 'Fresh herbs for the kitchen'], ['cafe-tables', 'Coffee rings on the tables'],
        ['x-cafe-dog', 'A guest\'s muddy dog'],
        ['cafe-counter', 'Pumpkin spice everywhere'], ['x-cafe-coffee', 'Lattes for a rainy day'], ['x-cafe-napkins', 'Fresh napkins on every table'],
        ['cafe-cups', 'Teacups for a rainy day'], ['x-cafe-seek', 'What\'s missing from the store room?'],
        ['x-cafe-jigsaw', 'A jigsaw for a rainy afternoon', null, { season: 'autumn' }], ['x-cafe-numbers', 'The chalkboard'],
      ],
      winter: [
        ['cafe-terrace', 'Snow on the terrace', 'snow'], ['cafe-deck', 'Snow on the deck', 'snow'], ['cafe-window', 'Frost on the shop window', 'frost'],
        ['cafe-floor', 'Slushy footprints'], ['cafe-counter', 'Hot chocolate splashes'], ['cafe-tables', 'Cocoa rings on the tables'],
        ['x-cafe-lights', 'Christmas lights in the café'], ['cafe-fridge', 'Restock the fridge for the holidays'],
        ['x-cafe-coffee', 'Hot chocolate for everyone', null, { drink: 'cocoa' }], ['x-cafe-napkins', 'Napkins for the Christmas rush'],
        ['cafe-cups', 'Mugs for the hot chocolate'],
        ['x-cafe-jigsaw', 'A winter jigsaw by the window', null, { season: 'winter' }],
      ],
      spring: [
        ['cafe-sign', 'Repaint the sign'], ['cafe-door', 'A new colour for the door'], ['cafe-planters', 'Spring planting'],
        ['cafe-pots', 'Pots for the steps'], ['cafe-herbs', 'Sow new herbs'], ['cafe-terrace', 'Moss on the terrace'],
        ['cafe-awning', 'Spring clean for the awning'], ['x-cafe-chairs', 'The terrace opens for spring'],
        ['x-cafe-owners', 'Left behind at the café'], ['x-cafe-seek', 'The store room after the winter'],
      ],
    },
    cove: {
      summer: [
        ['cove-castle', 'A sandcastle for the summer'], ['cove-shells', 'Shells after the high tide'], ['cove-rockpool', 'Seaweed in the rock pool'],
        ['cove-litter', 'Picnic litter on the beach'], ['cove-window', 'Sandy fingerprints on the hut window'], ['cove-van-inside', 'Sand in the camper van'],
        ['cove-boat', 'Weed on the boat'], ['cove-seaweed', 'Seaweed after the tide'], ['x-cove-dog', 'A sandy dog after the beach'],
        ['x-cove-seal', 'A hungry seal on the beach'], ['x-cove-pack', 'Pack the camper van for a trip'],
      ],
      autumn: [
        ['cove-litter', 'The storm washed things up', null, { items: 'storm' }], ['cove-seaweed', 'Storm seaweed on the sand'], ['cove-boardwalk', 'Leaves on the boardwalk', 'leaves'],
        ['cove-window', 'Salt spray on the hut window'], ['cove-lantern', 'Salt on the lighthouse lamp'], ['cove-rockpool', 'Leaves in the rock pool', 'leaves'],
        ['cove-van-wash', 'A muddy camper van'], ['cove-boat', 'Barnacles are back'], ['x-cove-seal', 'A seal resting after the storm'],
        ['x-cove-jigsaw', 'A jigsaw on a stormy day', null, { season: 'autumn' }], ['x-cove-stars', 'Stars over the cove'],
      ],
      winter: [
        ['x-cove-lights', 'Christmas lights on the beach hut'], ['cove-boardwalk', 'Snow on the boardwalk', 'snow'], ['cove-jetty', 'Snow on the jetty', 'snow'],
        ['cove-window', 'Frost on the hut window', 'frost'], ['cove-lantern', 'Frost on the lighthouse lamp', 'frost'], ['cove-shells', 'Winter treasures on the beach', null, { items: 'seaglass' }],
        ['cove-litter', 'Driftwood for the fire', null, { items: 'driftwood' }], ['cove-van-wax', 'Wax the van before the frost'],
        ['x-cove-jigsaw', 'A jigsaw in the beach hut', null, { season: 'winter' }],
      ],
      spring: [
        ['cove-hut', 'A new colour for the hut'], ['cove-boat-paint', 'Fresh paint for the boat'], ['cove-lighthouse', 'Touch up the lighthouse'],
        ['cove-dunes', 'Sea pinks for the dunes'], ['cove-seaweed', 'Spring tide seaweed'], ['cove-van-polish', 'Polish the van for the summer'],
        ['cove-castle', 'The first sandcastle of the year'], ['cove-van-wash', 'Spring wash for the camper van'], ['x-cove-seal', 'A seal pup on the sand'],
        ['x-cove-pack', 'Pack the van for the first trip'],
      ],
    },
    rescue: {
      summer: [
        ['rescue-walk', 'A long summer walk'], ['rescue-water', 'Cool water on a hot day'], ['rescue-pond', 'Duckweed on the pond'],
        ['rescue-meadow', 'The paddock has grown again'], ['rescue-puppy', 'A puppy rolled in the mud'], ['rescue-seal', 'Fish for the seal pup'],
        ['rescue-toys', 'Toys left out after playtime'], ['rescue-veg', 'More carrots for the rabbits'], ['rescue-feed', 'Feeding time on a hot day'],
        ['x-rescue-owners', 'Whose lead is whose?'],
        ['x-rescue-collar', 'A collar for the cat'],
      ],
      autumn: [
        ['rescue-yard', 'Leaves in the farmyard', 'leaves'], ['rescue-walk', 'A walk through the autumn woods'], ['rescue-hutch', 'Cosy straw for the autumn'],
        ['rescue-bowls', 'Supper for the dogs'], ['rescue-cat', 'Burrs in the cat\'s fur'], ['rescue-pond', 'Leaves on the duck pond', 'leaves'],
        ['rescue-window', 'Rain on the office window'], ['rescue-puppy', 'Muddy paws after the rain'], ['rescue-beds', 'Cosy beds for autumn nights'],
        ['rescue-feed', 'Supper by the chart'], ['x-rescue-seek', 'What\'s missing in the barn?'],
        ['x-rescue-jigsaw', 'A jigsaw in the farmhouse', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-rescue-lights', 'Fairy lights on the barn'], ['rescue-yard', 'Snow in the farmyard', 'snow'], ['rescue-window', 'Frost on the office window', 'frost'],
        ['rescue-walk', 'A walk in the snow'], ['rescue-hutch', 'Extra straw for cold nights'], ['rescue-water', 'Fresh water on a frosty morning'],
        ['rescue-bowls', 'A warm breakfast'], ['rescue-floor', 'Snow blown into the barn', 'snow'], ['rescue-beds', 'Who sleeps by the stove?'],
        ['rescue-feed', 'A warm supper by the chart'], ['x-rescue-seek', 'Lost in the hay'],
        ['x-rescue-jigsaw', 'A winter jigsaw by the stove', null, { season: 'winter' }], ['x-rescue-stitch', 'Mend the dog\'s blanket'],
      ],
      spring: [
        ['rescue-fence', 'Fresh paint for the paddock fence'], ['rescue-door', 'A new colour for the farmhouse door'], ['rescue-veg', 'Sow the vegetable patch'],
        ['rescue-meadow', 'The first mow of the year'], ['rescue-cat', 'Spring moult: brush the cat'], ['rescue-seal', 'A new seal pup to feed'],
        ['rescue-sign', 'Touch up the sign'], ['rescue-toys', 'Toys out in the spring sunshine'], ['rescue-beds', 'Beds for the new arrivals'],
        ['rescue-feed', 'Feeding time for the new arrivals'], ['x-rescue-owners', 'Leads for the new arrivals'],
        ['x-rescue-collar', 'A new collar for a new arrival'],
      ],
    },
    glasshouse: {
      summer: [
        ['gh-orchard', 'The orchard grass has grown'], ['gh-water', 'Water the glasshouse on a hot day'], ['gh-border', 'Weeds in the summer border'],
        ['gh-pond', 'Duckweed on the lily pond'], ['gh-veg', 'Sow the second crop'], ['gh-pots', 'Fresh pots for the summer'],
        ['gh-panes', 'Summer dust on the glass'], ['gh-cutting', 'Replant the cutting garden'], ['gh-path', 'Weeds between the bricks'],
      ],
      autumn: [
        ['gh-apples', 'Windfalls after the wind'], ['gh-path', 'Leaves on the brick path', 'leaves'], ['gh-orchard', 'Leaves in the orchard', 'leaves'],
        ['gh-pond', 'Leaves on the lily pond', 'leaves'], ['gh-panes', 'Rain spots on the glasshouse'], ['gh-water', 'Water the glasshouse once more'],
        ['gh-shed', 'Paint the shed before winter'], ['x-glass-cat', 'The garden cat, full of burrs'],
        ['x-glass-jigsaw', 'A jigsaw in the potting shed', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-glass-lights', 'Fairy lights in the glasshouse'], ['gh-path', 'Snow on the brick path', 'snow'], ['gh-panes', 'Frost on the glasshouse', 'frost'],
        ['gh-raised', 'Snow on the raised beds', 'snow'], ['gh-water', 'Warm water for the winter plants'], ['gh-roof', 'Moss on the shed roof'],
        ['gh-cutting', 'Plan next year\'s cutting garden'], ['x-glass-cat', 'A cat curled up in the potting shed'],
        ['x-glass-jigsaw', 'A winter jigsaw in the potting shed', null, { season: 'winter' }],
      ],
      spring: [
        ['gh-border', 'Spring weeds in the border'], ['gh-veg', 'Sow the vegetable beds'], ['gh-pots', 'Pots of spring flowers'],
        ['gh-cutting', 'Plant the cutting garden'], ['gh-door', 'A new colour for the door in the wall'], ['gh-shed', 'A new colour for the shed'],
        ['gh-orchard', 'The first mow under the blossom'], ['gh-water', 'Water the seedlings'], ['gh-pond', 'Spring clean in the lily pond'],
      ],
    },
    canal: {
      summer: [
        ['canal-bank', 'The bank has grown again'], ['canal-weed', 'Duckweed in the summer sun'], ['canal-litter', 'Picnic litter on the towpath'],
        ['canal-roof', 'Fresh flowers for the boat roof'], ['canal-hold', 'Load the boat for a summer trip'], ['canal-portholes', 'Summer dust on the portholes'],
        ['canal-dinghy', 'A fresh coat for the rowing boat'], ['canal-towpath', 'Weeds between the flagstones'], ['x-canal-dog', 'A muddy dog from the towpath'],
      ],
      autumn: [
        ['canal-towpath', 'Leaves on the towpath', 'leaves'], ['canal-weed', 'Leaves on the water', 'leaves'], ['canal-bank', 'Leaves on the bank', 'leaves'],
        ['canal-window', 'Rain spots on the lock-keeper\'s window'], ['canal-gates', 'Mend the gates before winter'], ['canal-hold', 'Load the boat with firewood'],
        ['canal-litter', 'The wind blew litter in'], ['canal-boat', 'Touch up the paint before winter'],
        ['x-canal-jigsaw', 'A jigsaw on a rainy day', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-canal-lights', 'Fairy lights on the narrowboat'], ['canal-towpath', 'Snow on the towpath', 'snow'], ['canal-portholes', 'Frost on the portholes', 'frost'],
        ['canal-window', 'Frost on the lock-keeper\'s window', 'frost'], ['canal-bridge', 'Snow on the bridge', 'snow'], ['canal-gates', 'Snow on the lock gates', 'snow'],
        ['x-canal-dog', 'A snowy dog after a walk'],
        ['x-canal-jigsaw', 'A winter jigsaw in the lock-keeper\'s cottage', null, { season: 'winter' }], ['x-canal-stars', 'Stars over the lock'],
      ],
      spring: [
        ['canal-boat', 'A new colour for the narrowboat'], ['canal-door', 'A new colour for the lock-keeper\'s door'], ['canal-fence', 'Fresh paint for the fence'],
        ['canal-sign', 'Touch up the lock sign'], ['canal-dinghy', 'Paint the rowing boat for spring'], ['canal-roof', 'Spring flowers for the boat roof'],
        ['canal-bank', 'The first mow of the year'], ['canal-weed', 'Spring clean on the canal'], ['canal-hold', 'Load the boat for the first trip'],
      ],
    },
    books: {
      summer: [
        ['books-window', 'Summer dust on the shop window'], ['books-awning', 'Pollen on the awning'], ['books-counter', 'Iced coffee drips in the coffee corner'],
        ['books-boxes', 'New flowers for the window boxes'], ['books-yard', 'Weeds between the flagstones'], ['books-bed', 'Weeds by the hollyhocks'],
        ['books-tea', 'Iced coffee for hot readers', null, { drink: 'iced' }], ['books-tables', 'Ice-cream drips on the tables'], ['books-floor', 'Sand from the beach on the floor'],
        ['x-books-post', 'Parcels of holiday books'], ['x-books-seek', 'What\'s missing in the stockroom?'],
      ],
      autumn: [
        ['books-yard', 'Leaves in the courtyard', 'leaves'], ['books-floor', 'Muddy footprints on the floor'], ['books-window', 'Rain spots on the shop window'],
        ['books-shelves', 'Books back after the school rush'], ['books-tea', 'Tea on a rainy afternoon'], ['books-cat', 'The shop cat, full of burrs'],
        ['books-attic', 'Autumn dusting in the stockroom'], ['books-counter', 'Sticky fingers in the coffee corner'],
        ['x-books-jigsaw', 'A jigsaw in the reading nook', null, { season: 'autumn' }], ['x-books-lock', 'The stockroom chest'],
      ],
      winter: [
        ['x-books-lights', 'Fairy lights in the shop window'], ['books-window', 'Frost on the shop window', 'frost'], ['books-yard', 'Snow in the courtyard', 'snow'],
        ['books-floor', 'Slushy footprints'], ['books-tea', 'Hot chocolate for the readers', null, { drink: 'cocoa' }], ['books-shelves', 'Christmas books back on the shelves'],
        ['books-cat', 'A cat curled up by the radiator'], ['books-attic', 'Winter dusting in the stockroom'], ['x-books-post', 'Christmas parcels of books'],
        ['x-books-jigsaw', 'A winter jigsaw in the reading nook', null, { season: 'winter' }],
      ],
      spring: [
        ['books-door', 'A new colour for the door'], ['books-sign', 'Repaint the sign'], ['books-boxes', 'Spring flowers for the window boxes'],
        ['books-bed', 'Spring weeds by the hollyhocks'], ['books-bench', 'A new bench in the courtyard'], ['books-awning', 'Spring clean for the awning'],
        ['books-shelves', 'New books for spring'], ['books-yard', 'Moss in the courtyard'], ['x-books-seek', 'Spring clean in the stockroom'],
        ['x-books-lock', 'What is in the stockroom chest?'],
      ],
    },
    pottery: {
      summer: [
        ['pot-yard', 'Weeds between the cobbles'], ['pot-window', 'Summer dust on the workshop window'], ['pot-floor', 'Clay dust after a busy day'],
        ['pot-wheel', 'Clay on the wheel again'], ['pot-lavender', 'More lavender for the bees'], ['pot-scraps', 'Clay scraps after the summer class'],
        ['pot-throw', 'A pot for the summer fair'], ['pot-glaze', 'Glaze a tea set for the garden'], ['x-pottery-cat', 'The pottery cat, all dusty'],
      ],
      autumn: [
        ['pot-yard', 'Leaves in the yard', 'leaves'], ['pot-window', 'Rain spots on the workshop window'], ['pot-chimney', 'Moss creeping back on the chimney'],
        ['pot-kiln', 'Soot after the autumn firing'], ['pot-floor', 'Muddy boots on the floor'], ['pot-rack', 'Leaves on the drying rack', 'leaves'],
        ['pot-firing', 'Load the kiln for autumn'], ['pot-glaze', 'Glaze mugs for the cold days'], ['pot-throw', 'A pot for the autumn table'],
        ['x-pottery-cat', 'The pottery cat, full of burrs'],
        ['x-pottery-jigsaw', 'A jigsaw for a rainy day', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-pottery-lights', 'Fairy lights on the drying rack'], ['pot-yard', 'Snow in the yard', 'snow'], ['pot-window', 'Frost on the workshop window', 'frost'],
        ['pot-kiln', 'Soot from the winter firing'], ['pot-shelves', 'Winter dusting on the glaze shelves'], ['pot-rack', 'Snow on the drying rack', 'snow'],
        ['pot-firing', 'Load the kiln with presents'], ['pot-glaze', 'Glaze cups for hot chocolate'], ['pot-throw', 'A pot for a present'],
        ['x-pottery-cat', 'A cat asleep by the warm kiln'],
        ['x-pottery-jigsaw', 'A jigsaw by the warm kiln', null, { season: 'winter' }],
      ],
      spring: [
        ['pot-door', 'A new colour for the barn door'], ['pot-sign', 'Repaint the sign'], ['pot-lavender', 'Plant new lavender'],
        ['pot-rack', 'Mend the drying rack'], ['pot-yard', 'Moss between the cobbles'], ['pot-chimney', 'Moss on the chimney'],
        ['pot-scraps', 'Clay scraps after the spring class'], ['pot-throw', 'A pot for spring flowers'], ['pot-firing', 'Load the kiln for the spring fair'],
      ],
    },
    halt: {
      summer: [
        ['halt-platform', 'Weeds on the platform'], ['halt-baskets', 'New flowers for the baskets'], ['halt-line', 'Picnic litter along the line'],
        ['halt-window', 'Summer dust on the waiting-room window'], ['halt-floor', 'Sand from the beach in the waiting room'], ['halt-box', 'Pollen on the signal-box windows'],
        ['halt-lost', 'Left behind after a summer day out'], ['halt-parcels', 'Parcels for the summer post'],
        ['x-halt-lock', 'A suitcase left on the platform'],
      ],
      autumn: [
        ['halt-platform', 'Leaves on the platform', 'leaves'], ['halt-bench', 'Leaves on the bench', 'leaves'], ['halt-window', 'Rain spots on the waiting-room window'],
        ['halt-lamps', 'Cobwebs on the platform lamps'], ['halt-floor', 'Muddy footprints in the waiting room'], ['halt-clock', 'Rain spots on the station clock'],
        ['halt-lost', 'Umbrellas left on a rainy day'], ['halt-shelves', 'What\'s missing after the autumn rush'],
        ['x-halt-jigsaw', 'A jigsaw in the waiting room', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-halt-lights', 'Lamps along the platform'], ['halt-platform', 'Snow on the platform', 'snow'], ['halt-window', 'Frost on the waiting-room window', 'frost'],
        ['halt-box', 'Frost on the signal-box windows', 'frost'], ['halt-clock', 'Frost on the station clock', 'frost'], ['halt-lamps', 'Polish the lamps for the long nights'],
        ['halt-parcels', 'Christmas parcels'], ['halt-lost', 'Mittens and scarves left behind'], ['halt-shelves', 'What\'s missing from the winter shelves'],
        ['x-halt-jigsaw', 'A winter jigsaw by the stove', null, { season: 'winter' }],
      ],
      spring: [
        ['halt-door', 'A new colour for the ticket-office door'], ['halt-sign', 'Touch up the station sign'], ['halt-gate', 'Fresh paint for the crossing gate'],
        ['halt-baskets', 'Spring flowers for the baskets'], ['halt-bench', 'Mend the platform bench'], ['halt-platform', 'Moss on the platform'],
        ['halt-parcels', 'Seed packets by post'], ['halt-shelves', 'Spring clean on the shelves'],
        ['x-halt-lock', 'A locked suitcase'],
      ],
    },
    beads: {
      summer: [
        ['bb-step', 'Dust on the front step'], ['bb-window', 'Summer dust on the bow window'], ['bb-awning', 'Pollen on the awning'],
        ['bb-boxes', 'New flowers for the window boxes'], ['bb-yard', 'Weeds in the back yard'], ['bb-floor', 'Threads after the summer sale'],
        ['bb-scales', 'Fingerprints on the brass scales'], ['bb-necklace', 'A necklace for a summer wedding'], ['bb-buttons', 'Buttons after the summer sale'],
      ],
      autumn: [
        ['bb-step', 'Leaves on the front step', 'leaves'], ['bb-yard', 'Leaves in the back yard', 'leaves'], ['bb-window', 'Rain spots on the bow window'],
        ['bb-floor', 'Muddy footprints and threads'], ['bb-machine', 'Fluff in the sewing machine'], ['bb-drawers', 'Autumn dusting in the drawers'],
        ['bb-bracelet', 'A bracelet in autumn colours'], ['bb-buttons', 'Buttons for winter coats'], ['x-beads-jigsaw', 'A jigsaw for a rainy day', null, { season: 'autumn' }],
        ['x-beads-stitch', 'Stitch the tear'],
      ],
      winter: [
        ['x-beads-lights', 'Fairy lights in the bow window'], ['bb-step', 'Snow on the front step', 'snow'], ['bb-window', 'Frost on the bow window', 'frost'],
        ['bb-yard', 'Snow in the back yard', 'snow'], ['bb-floor', 'Slushy footprints'], ['bb-machine', 'Sewing for Christmas'],
        ['bb-necklace', 'A necklace for a present'], ['bb-bracelet', 'A bracelet for a present'], ['x-beads-jigsaw', 'A winter jigsaw', null, { season: 'winter' }],
      ],
      spring: [
        ['bb-door', 'A new colour for the shop door'], ['bb-sign', 'Repaint the sign'], ['bb-boxes', 'Spring flowers for the window boxes'],
        ['bb-yard', 'Moss in the back yard'], ['bb-shelves', 'New shelves for spring ribbons'], ['bb-awning', 'Spring clean for the awning'],
        ['bb-scales', 'Polish the scales for spring'], ['bb-buttons', 'Spring buttons into their jars'], ['bb-necklace', 'A necklace for spring'], ['x-beads-stitch', 'Stitch the tear'],
      ],
    },
    curio: {
      summer: [
        ['cu-window', 'Summer dust on the window'], ['cu-yard', 'Weeds between the cobbles'], ['cu-fountain', 'Duckweed in the fountain'],
        ['cu-ferns', 'New ferns for the yard'], ['cu-floor', 'Sand on the creaky floor'], ['cu-globe', 'Dust on the globe'],
        ['cu-lamp', 'Polish the brass lamp'], ['cu-seek', 'Lost among the summer curiosities'], ['cu-box', 'A box from a summer auction'],
      ],
      autumn: [
        ['cu-yard', 'Leaves in the yard', 'leaves'], ['cu-fountain', 'Leaves in the fountain', 'leaves'], ['cu-window', 'Rain spots on the window'],
        ['cu-floor', 'Muddy footprints on the floor'], ['cu-cabinet', 'Autumn dusting in the cabinet'], ['cu-clock', 'Polish the clock for the long evenings'],
        ['cu-jigsaw', 'A jigsaw for a rainy day', null, { season: 'autumn' }], ['cu-box', 'A box from an autumn sale'], ['cu-shelves', 'Mend the shelves'],
      ],
      winter: [
        ['x-curio-lights', 'Fairy lights in the window'], ['cu-yard', 'Snow in the yard', 'snow'], ['cu-window', 'Frost on the window', 'frost'],
        ['cu-floor', 'Slushy footprints'], ['cu-clock', 'The clock before the new year'], ['cu-lamp', 'The lamp for the long nights'],
        ['cu-jigsaw', 'A winter jigsaw by the lamp', null, { season: 'winter' }], ['cu-seek', 'Lost among the winter curiosities'],
      ],
      spring: [
        ['cu-door', 'A new colour for the door'], ['cu-sign', 'Repaint the sign'], ['cu-ferns', 'Fresh ferns for spring'],
        ['cu-fountain', 'Spring clean in the fountain'], ['cu-yard', 'Moss between the cobbles'], ['cu-globe', 'Spring dusting on the globe'],
        ['cu-cabinet', 'Spring clean in the cabinet'], ['cu-box', 'A box nobody has opened'], ['cu-seek', 'Spring cleaning among the curiosities'],
      ],
    },
    stables: {
      summer: [
        ['st-paddock', 'The paddock has grown back'], ['st-yard', 'Dust and hay in the yard'], ['st-trough', 'Fresh water on a hot day'],
        ['st-stable', 'Muck out after a summer night'], ['st-groom', 'Burrs in the pony\'s coat'], ['st-window', 'Summer dust on the tack-room window'],
        ['x-st-walk', 'Lead the pony round the paddock'], ['st-mane', 'Ribbons for the summer show'], ['st-saddles', 'Whose saddle after the show?'],
      ],
      autumn: [
        ['st-yard', 'Leaves in the yard', 'leaves'], ['st-paddock', 'Leaves all over the paddock', 'leaves'], ['st-apples', 'Windfalls for the ponies'],
        ['st-window', 'Rain spots on the tack-room window'], ['st-tack', 'Autumn dusting in the tack room'], ['st-stable', 'Fresh straw for the cold nights'],
        ['st-groom', 'A muddy autumn pony'], ['st-saddles', 'Whose saddle is whose?'], ['x-stables-jigsaw', 'A jigsaw for a rainy day', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-stables-lights', 'Fairy lights on the hay barn'], ['st-yard', 'Snow in the yard', 'snow'], ['st-window', 'Frost on the tack-room window', 'frost'],
        ['st-paddock', 'A clear path through the paddock', 'snow'], ['st-trough', 'Fresh water on a frosty morning'], ['st-stable', 'Deep straw for the winter'],
        ['st-groom', 'A thick winter coat to brush'], ['st-mane', 'Ribbons for Christmas'], ['x-stables-jigsaw', 'A winter jigsaw in the tack room', null, { season: 'winter' }],
      ],
      spring: [
        ['st-fence', 'Fresh paint for the paddock fence'], ['st-doors', 'A new colour for the stable doors'], ['st-jumps', 'Paint the jumps for spring'],
        ['st-sign', 'Repaint the yard sign'], ['st-barn', 'Mend the hay barn'], ['st-paddock', 'The first mow of the year'],
        ['x-st-walk', 'A spring walk round the paddock'], ['st-mane', 'Ribbons for the spring show'], ['st-saddles', 'Saddles after the spring clean'],
      ],
    },
    loft: {
      summer: [
        ['lo-yard', 'Weeds in the yard'], ['lo-poppies', 'Weeds among the poppies'], ['lo-boxes', 'New flowers for the window boxes'],
        ['lo-skylight', 'Summer dust on the skylight'], ['lo-floor', 'Fresh paint on the floor'], ['lo-brushes', 'Brushes after a summer class'],
        ['lo-window', 'Pollen on the loft window'], ['lo-canvas', 'A canvas for the summer'], ['lo-mix', 'Mix the summer colours'],
      ],
      autumn: [
        ['lo-yard', 'Leaves in the yard', 'leaves'], ['lo-stairs', 'Leaves on the outside stairs', 'leaves'], ['lo-skylight', 'Rain spots on the skylight'],
        ['lo-window', 'Rain spots on the loft window'], ['lo-frames', 'Autumn dusting in the store of frames'], ['lo-floor', 'Muddy footprints and paint'],
        ['lo-mural', 'A new picture for the wall'], ['lo-mix', 'Mix the autumn colours'], ['x-loft-jigsaw', 'A jigsaw for a rainy day', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-loft-lights', 'Fairy lights up the stairs'], ['lo-yard', 'Snow in the yard', 'snow'], ['lo-skylight', 'Frost on the skylight', 'frost'],
        ['lo-window', 'Frost on the loft window', 'frost'], ['lo-stairs', 'Snow on the outside stairs', 'snow'], ['lo-brushes', 'Brushes after the winter class'],
        ['lo-canvas', 'A canvas for a present'], ['lo-mix', 'Mix the colours for Christmas cards'], ['x-loft-jigsaw', 'A winter jigsaw under the skylight', null, { season: 'winter' }],
      ],
      spring: [
        ['lo-door', 'A new colour for the loft door'], ['lo-sign', 'Repaint the studio sign'], ['lo-swing', 'Fresh paint for the swing seat'],
        ['lo-poppies', 'Weeds among the first poppies'], ['lo-boxes', 'Spring flowers for the window boxes'], ['lo-stairs', 'Mend the outside stairs'],
        ['lo-yard', 'Moss in the yard'], ['lo-mural', 'A spring picture for the wall'], ['lo-canvas', 'A canvas for spring'],
      ],
    },
    observatory: {
      summer: [
        ['ob-grass', 'The hilltop grass has grown back'], ['ob-path', 'Weeds on the hill path'], ['ob-lens', 'Summer dust on the lens'],
        ['ob-window', 'Pollen on the map-room window'], ['ob-thyme', 'More thyme for the bees'], ['ob-telescope', 'Fingerprints on the telescope'],
        ['ob-dome', 'Green on the copper dome'], ['ob-lantern', 'Moths round the lantern'], ['ob-stars', 'The summer stars'],
      ],
      autumn: [
        ['ob-path', 'Leaves on the hill path', 'leaves'], ['ob-grass', 'Leaves all over the hilltop', 'leaves'], ['ob-steps', 'Leaves on the dome steps', 'leaves'],
        ['ob-window', 'Rain spots on the map-room window'], ['ob-charts', 'Autumn dusting among the charts'], ['ob-lens', 'Mist on the lens'],
        ['ob-lantern', 'The lantern for the long nights'], ['ob-stars', 'The autumn stars'], ['ob-jigsaw', 'A jigsaw for a rainy night', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-observatory-lights', 'Fairy lights round the dome'], ['ob-path', 'Snow on the hill path', 'snow'], ['ob-window', 'Frost on the map-room window', 'frost'],
        ['ob-steps', 'Snow on the dome steps', 'snow'], ['ob-lantern', 'The lantern for the snow'], ['ob-telescope', 'The telescope for the clear nights'],
        ['ob-charts', 'New charts for the new year'], ['ob-stars', 'The winter stars'], ['ob-jigsaw', 'A winter jigsaw of the night sky', null, { season: 'winter' }],
      ],
      spring: [
        ['ob-door', 'A new colour for the door'], ['ob-sign', 'Repaint the sign'], ['ob-bench', 'Mend the stone bench'],
        ['ob-thyme', 'Young thyme on the slope'], ['ob-grass', 'The first mow of the year'], ['ob-dome', 'Spring scrub on the dome'],
        ['ob-path', 'Moss on the hill path'], ['ob-charts', 'Spring dusting among the charts'], ['ob-stars', 'The spring stars'],
      ],
    },
    lido: {
      summer: [
        ['li-chairs', 'Deck chairs out for the morning'], ['li-litter', 'Litter after a hot day'], ['li-kiosk', 'A sticky kiosk counter'],
        ['li-windows', 'Sun cream on the kiosk windows'], ['li-fountain', 'A green tinge in the fountain'], ['li-palms', 'New palms for the terrace'],
        ['li-terrace', 'Sand on the sun terrace'], ['li-board', 'Mend the diving board'], ['li-ices', 'Ice creams for the queue'],
      ],
      autumn: [
        ['li-tiles', 'Leaves in the drained pool', 'leaves'], ['li-terrace', 'Leaves on the sun terrace', 'leaves'], ['li-fountain', 'Leaves in the fountain', 'leaves'],
        ['li-steps', 'Leaves on the pool steps', 'leaves'], ['li-chairs', 'Deck chairs for the last warm days'], ['li-windows', 'Rain spots on the kiosk windows'],
        ['li-kiosk', 'Clean down the kiosk for the winter'], ['li-ices', 'The last ices of the year'], ['x-lido-jigsaw', 'A jigsaw for a rainy day', null, { season: 'autumn' }],
      ],
      winter: [
        ['x-lido-lights', 'Fairy lights along the terrace'], ['li-tiles', 'Snow in the empty pool', 'snow'], ['li-terrace', 'Snow on the sun terrace', 'snow'],
        ['li-steps', 'Snow on the pool steps', 'snow'], ['li-windows', 'Frost on the kiosk windows', 'frost'], ['li-board', 'Mend the diving board in the quiet'],
        ['li-mosaic', 'Loose tiles in the mosaic'], ['li-kiosk', 'Dust in the shut-up kiosk'], ['x-lido-jigsaw', 'A winter jigsaw in the kiosk', null, { season: 'winter' }],
      ],
      spring: [
        ['li-tiles', 'Scrub the pool for the summer'], ['li-huts', 'A new colour for the huts'], ['li-gate', 'Fresh paint for the turnstile gate'],
        ['li-sign', 'Repaint the sign'], ['li-palms', 'Palms back out for spring'], ['li-fountain', 'Spring clean in the fountain'],
        ['li-mosaic', 'Loose tiles in the mosaic'], ['li-terrace', 'Moss on the sun terrace'], ['li-litter', 'Blown in over the winter', null, { drained: true }],
      ],
    },
  };
  // Christmas lights always come with winter, and the lido's empty pool always
  // has its season's job (leaves, snow, then the scrub before it is filled)
  const ALWAYS = new Set(['li-tiles', 'x-lights', 'x-cafe-lights', 'x-cove-lights', 'x-rescue-lights', 'x-glass-lights', 'x-canal-lights', 'x-books-lights', 'x-pottery-lights', 'x-halt-lights', 'x-beads-lights', 'x-curio-lights', 'x-stables-lights', 'x-loft-lights', 'x-observatory-lights', 'x-lido-lights']);
  const PER_SEASON = { cottage: 6, cafe: 6, cove: 5, rescue: 5, glasshouse: 5, canal: 5, books: 5, pottery: 5, halt: 5, beads: 5, curio: 5, stables: 5, loft: 5, observatory: 5, lido: 5 };
  // at most this many jobs of one kind in a season (default 2); one puzzle and
  // one thing made by hand per place
  const FAMILY_CAP = { mow: 1, paint: 2, rake: 2, snow: 2, plant: 2, build: 1, polish: 1, arrange: 2, brew: 1, walk: 1, brush: 1, muck: 1, think: 1, craft: 1 };

  const seasonOf = (n) => SEASON_ORDER[(n - 1) % 4];
  // what a job in a season pays: it rises a little every season up to a
  // ceiling, and the ceiling lifts by a tenth for every restored place past the
  // seventh, so a year's pay keeps up with the prices of the later places
  function seasonValue(n, i, places = 7) {
    const ceiling = 1.6 + 0.1 * Math.max(0, places - 7);
    return Math.round(choreValue(CHORES.length - 1) * 0.4 * Math.min(ceiling, Math.pow(1.05, n - 1)) * (1 + i * 0.04));
  }
  const ALL = () => CHORES.concat(CAFE_CHORES, COVE_CHORES, RESCUE_CHORES, GLASS_CHORES, CANAL_CHORES, BOOK_CHORES, POTTERY_CHORES, HALT_CHORES, BEAD_CHORES, CURIO_CHORES, STABLE_CHORES, LOFT_CHORES, OBSERVATORY_CHORES, LIDO_CHORES, EXTRAS);
  const byId = (id) => ALL().find((c) => c.id === id);
  // leaves in water are skimmed with a net, never raked
  const famFor = (b, dirt) => (dirt === 'leaves' ? (b.scene === 'pond' || b.scene === 'rockpool' ? 'skim' : 'rake') : dirt === 'snow' ? 'snow' : dirt === 'frost' ? 'wash' : b.family);

  // Pick a varied handful from the pool: seeded by the season number, never
  // more than the cap of one kind, at least one planting or building job,
  // and jobs from the same season last year pushed to the back.
  function pickSeason(n, place, history = true) {
    const pool = SEASON_POOL[place][seasonOf(n)];
    const r = U.rng(n * 7919 + { cottage: 0, cafe: 104729, cove: 208759, rescue: 312899, glasshouse: 416951, canal: 521009, books: 625057, pottery: 729173, halt: 833177, beads: 937207, curio: 1041271, stables: 1145393, loft: 1249427, observatory: 1353487, lido: 1457551 }[place]);
    const last = history && n > 4 ? new Set(pickSeason(n - 4, place, false)) : new Set();
    const scored = pool.map((p) => ({ p, s: r() + (last.has(p[0]) ? 0.6 : 0) - (ALWAYS.has(p[0]) ? 2 : 0) })).sort((a, b) => a.s - b.s).map((x) => x.p);
    const want = PER_SEASON[place], picked = [], count = {};
    for (const p of scored) {
      if (picked.length >= want) break;
      const fam = famFor(byId(p[0]), p[2]);
      if ((count[fam] || 0) >= (FAMILY_CAP[fam] || 2)) continue;
      count[fam] = (count[fam] || 0) + 1;
      picked.push(p);
    }
    const isNew = (p) => ['plant', 'build', 'collect', 'polish', 'arrange', 'brew', 'feed', 'walk', 'think', 'craft'].includes(famFor(byId(p[0]), p[2]));
    if (!picked.some(isNew)) {
      const swap = scored.find((p) => isNew(p) && !picked.includes(p));
      if (swap) picked[picked.length - 1] = swap;
    }
    return history ? picked : picked.map((p) => p[0]);
  }

  // A season never grows past SEASON_BUDGET jobs, however many places there
  // are. The cottage and the newest restored place are always awake; the
  // others take turns, a window moving round them season by season, so each
  // is awake at least every other season while the budget allows (up to twelve
  // places). From thirteen on a place now and then rests two seasons running,
  // never more (with seventeen, each is awake every third season). With seven
  // places or fewer every place is awake every season, as before.
  const SEASON_BUDGET = 37;
  const perSeason = (p) => PER_SEASON[p] || 5;
  // places: restored place ids in the order they open, the cottage first
  function awakePlaces(n, places, per = perSeason) {
    if (n < 1) return [];
    const fixed = places.filter((p, i) => p === 'cottage' || i === places.length - 1);
    const others = places.filter((p) => !fixed.includes(p));
    const room = SEASON_BUDGET - fixed.reduce((a, p) => a + per(p), 0);
    if (others.reduce((a, p) => a + per(p), 0) <= room) return places.slice();
    const m = others.length, k = Math.max(1, Math.min(m, Math.floor(room / 5)));
    const start = ((n - 1) * k) % m, awake = new Set(fixed);
    let used = 0;
    for (let j = 0; j < k; j++) {
      const p = others[(start + j) % m];
      if (used + per(p) > room) break;
      used += per(p); awake.add(p);
    }
    return places.filter((p) => awake.has(p));
  }
  // places: list of restored place ids, the cottage first
  function seasonJobs(n, places) {
    if (n < 1) return [];
    const season = seasonOf(n);
    const out = [];
    for (const place of awakePlaces(n, places)) {
      pickSeason(n, place).forEach(([baseId, name, dirt, more], i) => {
        const b = byId(baseId);
        const find = place === 'cottage' ? SEASON_FINDS[season][i] : null;
        out.push(Object.assign({}, b, {
          id: `s${n}-${baseId}`, base: b.id, name, season, seasonNo: n, place, pending: dirt || 'grow',
          find, findId: find ? `${season}-${i}` : null,
          opts: Object.assign({}, b.opts, more || {}, dirt ? { dirt } : {}), seed: (b.seed || 1) + n * 131 + i, family: famFor(b, dirt), value: seasonValue(n, i, places.length),
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
    if (['collect', 'polish', 'feed', 'walk', 'brush', 'muck'].includes(fam)) return coveValue(0);
    return cafeValue(0); // planting, building, arranging and pouring
  }
  // every place has its own toolbox, and the later places are dearer
  function toolCost(fam, tierIdx, place) {
    const base = famBase(fam) * 2 * ((place && placeOf(place).toolPrice) || 1);
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
  const DEFAULT_COLOURS = { fence: '#f4ecdc', door: '#4e7b5b', wall: '#f2d88a', shutters: '#a6d3d4', sign: '#3d5a86', cafeDoor: '#c9474f', awning: '#2f8068', hut: '#8fbfe6', boat: '#c9474f', stripes: '#c9474f', paddock: '#f4ecdc', rescueDoor: '#3d5a86', rescueSign: '#4e7b5b', pottingShed: '#9cc5a1', gardenDoor: '#3d5a86', narrowboat: '#4e7b5b', lockFence: '#f4ecdc', lockDoor: '#c9474f', dinghy: '#8fbfe6', lockSign: '#3d5a86', bookSign: '#4e7b5b', bookDoor: '#3d5a86', potteryDoor: '#9cc5a1', potterySign: '#d98b63', haltSign: '#c9474f', haltDoor: '#4e7b5b', haltGate: '#f4ecdc', beadSign: '#efb4ae', beadDoor: '#a6d3d4', curioSign: '#c9474f', curioDoor: '#4e7b5b', stableFence: '#f4ecdc', stableDoor: '#4e7b5b', jumps: '#c9474f', stableSign: '#4e7b5b', loftDoor: '#3d5a86', loftSign: '#d98b63', swingSeat: '#f2d88a', obsDoor: '#3d5a86', obsSign: '#d98b63', lidoHuts: '#efb4ae', lidoGate: '#a6d3d4', lidoSign: '#c9474f' };

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
    'cafe-tiles': ['💌', 'A love letter'], 'cafe-pots': ['🫖', 'A tiny teapot'], 'cafe-fridge': ['🍒', 'A cherry from a sundae'],
    'cove-litter': ['🧭', 'An old brass compass'], 'cove-seaweed': ['🦀', 'A tiny hermit crab'], 'cove-hut': ['👒', 'A straw sun hat'],
    'cove-boat': ['⚓', 'A little anchor'], 'cove-dunes': ['🦩', 'A pink flamingo float'], 'cove-van-inside': ['📻', 'An old radio'],
    'cove-boardwalk': ['🪙', 'A pirate coin'], 'cove-window': ['⛵', 'A model sailboat'], 'cove-van-wash': ['🗺️', 'A road map of the coast'],
    'cove-rockpool': ['🐙', 'A shy little octopus'], 'cove-boat-paint': ['🧜', 'A mermaid figurine'], 'cove-van-wax': ['🎸', 'A ukulele under the seat'],
    'cove-shells': ['💎', 'A piece of blue sea glass'], 'cove-jetty': ['🐬', 'A dolphin, waving'], 'cove-van-polish': ['🔑', 'The van\'s lucky keyring'],
    'cove-lantern': ['🗝️', 'The lighthouse keeper\'s key'], 'cove-lighthouse': ['🦭', 'A seal pup'], 'cove-castle': ['👑', 'A tiny golden crown'],
    'rescue-bowls': ['🦴', 'A squeaky bone'], 'rescue-yard': ['🐾', 'A tile with a paw print'], 'rescue-walk': ['🎾', 'A lost tennis ball'],
    'rescue-hutch': ['🥕', 'A carrot someone hid'], 'rescue-puppy': ['🧼', 'A bar of lavender soap'], 'rescue-toys': ['🧸', 'A teddy with one ear'],
    'rescue-cat': ['🧶', 'A ball of red wool'], 'rescue-fence': ['🌾', 'A sheaf of wheat'], 'rescue-water': ['🐟', 'A goldfish who moved in'],
    'rescue-pond': ['🦆', 'A duckling'], 'rescue-seal': ['🐚', 'A pearly shell'], 'rescue-floor': ['🏷️', 'An old name tag'],
    'rescue-veg': ['🥬', 'The first lettuce'], 'rescue-meadow': ['🌼', 'A daisy chain'], 'rescue-door': ['📜', 'The farm\'s old deed'],
    'rescue-window': ['📷', 'A photo of a happy adoption'], 'rescue-sign': ['🔨', 'Grandad\'s old hammer'],
    'beta-cups': ['🥐', 'A croissant for later'], 'beta-feed': ['🍖', 'A bone-shaped biscuit'], 'beta-hose': ['🌱', 'A seedling of your own'],
    'beta-beds': ['🌙', 'A little moon night-light'], 'beta-plan': ['🌸', 'A pressed flower'],
    'cafe-cups': ['🧁', 'A cupcake someone saved'], 'rescue-feed': ['🥣', 'A bowl with a name on it'], 'rescue-beds': ['🐁', 'A mouse asleep in the hay'],
    'gh-path': ['🪲', 'A shiny green beetle'], 'gh-panes': ['🔍', 'A brass magnifying glass'], 'gh-border': ['🌹', 'The first rose of the year'],
    'gh-water': ['🌵', 'A tiny cactus in a thimble'], 'gh-orchard': ['🦊', 'A fox cub asleep in the long grass'], 'gh-raised': ['🔩', 'An old brass hinge'],
    'gh-veg': ['🥔', 'A potato shaped like a heart'], 'gh-apples': ['🍎', 'The reddest apple'], 'gh-shed': ['🪴', 'A pot plant someone forgot'],
    'gh-cutting': ['💐', 'A posy of your own'], 'gh-wall': ['🪨', 'A stone with a fossil in it'], 'gh-pond': ['🪷', 'A water lily in flower'],
    'gh-roof': ['🕊️', 'A white dove'], 'gh-pots': ['🏺', 'A tiny clay pot'], 'gh-door': ['📖', 'An old gardening diary'],
    'canal-towpath': ['🦦', 'An otter on the towpath'], 'canal-weed': ['🐠', 'A little fish in the clear water'], 'canal-litter': ['🎣', 'A lost fishing rod'],
    'canal-bank': ['🫐', 'A handful of wild blueberries'], 'canal-portholes': ['🫧', 'Soap bubbles in the sun'], 'canal-boat': ['🏰', 'A painted castle'],
    'canal-gates': ['🪵', 'An old oak peg'], 'canal-hold': ['🧺', 'A picnic hamper'], 'canal-roof': ['🌺', 'A geranium cutting'],
    'canal-fence': ['🦇', 'A sleepy bat'], 'canal-door': ['🔦', 'The lock-keeper\'s torch'], 'canal-window': ['🍯', 'A jar of honey'],
    'canal-bridge': ['📯', 'An old post horn'], 'canal-dinghy': ['🛶', 'A toy boat'], 'canal-sign': ['🏮', 'A paper lantern'],
    'books-floor': ['🖋️', 'A fountain pen'], 'books-window': ['✉️', 'A letter that was never sent'], 'books-awning': ['🎨', 'A little paint box'],
    'books-shelves': ['📚', 'A signed first edition'], 'books-counter': ['🔖', 'A silk bookmark'], 'books-sign': ['📮', 'A toy postbox'],
    'books-door': ['🥧', 'A pie from next door'], 'books-boxes': ['🫙', 'A jar of flower seeds'], 'books-cat': ['🧵', 'A spool of red thread'],
    'books-tea': ['🍰', 'A slice of lemon cake'], 'books-tables': ['♟️', 'A chess piece someone lost'], 'books-attic': ['🎩', 'A magician\'s top hat'],
    'books-yard': ['🦜', 'A parrot that flew in'], 'books-bed': ['🪃', 'A boomerang that came back'], 'books-bench': ['⌛', 'An old hourglass'],
    'beta-books': ['🧳', 'A little suitcase of stories'], 'beta-pack': ['🧲', 'A horseshoe magnet'],
    'pot-yard': ['🐌', 'A snail asleep on a cobble'], 'pot-window': ['🏺', 'A tiny glazed vase'], 'pot-floor': ['🧤', 'A pair of clay-caked gloves'],
    'pot-kiln': ['🔥', 'A spark that never went out'], 'pot-wheel': ['🐚', 'A shell pressed into the clay'], 'pot-shelves': ['🫙', 'A jar of blue glaze'],
    'pot-chimney': ['🐦', 'A swallow\'s nest'], 'pot-door': ['🧲', 'A horseshoe for luck'], 'pot-sign': ['🖌️', 'A glazing brush'],
    'pot-rack': ['🪵', 'A wooden rib for shaping'], 'pot-scraps': ['🧩', 'A broken tile shaped like a heart'], 'pot-lavender': ['🐝', 'A bee in the lavender'],
    'pot-throw': ['🥣', 'The first pot you made'], 'pot-glaze': ['🫖', 'A teapot lid that fits'], 'pot-firing': ['🕯️', 'A clay candle holder'],
    'halt-platform': ['🎟️', 'A ticket to somewhere'], 'halt-floor': ['🪙', 'A halfpenny'], 'halt-window': ['🗺️', 'An old railway map'],
    'halt-box': ['🔔', 'The signalman\'s bell'], 'halt-clock': ['🗝️', 'The key that winds the clock'], 'halt-lamps': ['🕯️', 'A lamp wick'],
    'halt-sign': ['📯', 'A guard\'s whistle'], 'halt-door': ['🧳', 'A suitcase full of postcards'], 'halt-gate': ['🐈', 'The station cat\'s bell'],
    'halt-bench': ['📰', 'A newspaper from long ago'], 'halt-baskets': ['🌼', 'A daisy in a teacup'], 'halt-line': ['🚂', 'A toy train'],
    'halt-lost': ['🧣', 'A scarf nobody came back for'], 'halt-parcels': ['📦', 'A parcel addressed to you'], 'halt-shelves': ['🔍', 'A detective\'s magnifying glass'],
    'beta-wheel': ['🏺', 'A little jug you made'], 'beta-owners': ['☂️', 'An umbrella with a name tag'], 'beta-post': ['✉️', 'A stamp with a cat on it'],
    'beta-seek': ['🕵️', 'A detective\'s notebook'],
    'bb-step': ['🪡', 'A needle, found at last'], 'bb-window': ['🧵', 'A reel of gold thread'], 'bb-awning': ['🎀', 'A bow that blew away'],
    'bb-sign': ['✂️', 'A pair of stork scissors'], 'bb-door': ['🧷', 'A safety pin, shut tight'], 'bb-floor': ['🔘', 'A button from a sailor\'s coat'],
    'bb-scales': ['⚖️', 'A tiny brass weight'], 'bb-machine': ['🪢', 'A knot nobody could undo'], 'bb-drawers': ['💎', 'A glass bead like a raindrop'],
    'bb-shelves': ['🎗️', 'A ribbon from a prize'], 'bb-boxes': ['🌸', 'A sprig of sweet peas'], 'bb-yard': ['👗', 'A doll\'s dress on the line'],
    'bb-necklace': ['📿', 'A necklace you strung'], 'bb-buttons': ['🧥', 'A coat with all its buttons'], 'bb-bracelet': ['💝', 'Half a friendship bracelet'],
    'cu-window': ['🔮', 'A glass ball that shows the weather'], 'cu-sign': ['🪶', 'A quill pen'], 'cu-door': ['🗝️', 'A key with no lock'],
    'cu-floor': ['🪙', 'A coin from a faraway country'], 'cu-cabinet': ['🃏', 'A playing card with a secret'], 'cu-clock': ['⚙️', 'A tiny brass cog'],
    'cu-globe': ['🧭', 'A compass that points home'], 'cu-lamp': ['🪔', 'A little oil lamp'], 'cu-fountain': ['💧', 'A wish someone made'],
    'cu-yard': ['🗿', 'A little stone head in the ivy'], 'cu-shelves': ['🎻', 'A violin with one string'], 'cu-ferns': ['🌱', 'A fern uncurling'],
    'cu-box': ['🔐', 'The box\'s own little key'], 'cu-jigsaw': ['🖼️', 'The finished jigsaw, framed'], 'cu-seek': ['🧸', 'A bear in a bowler hat'],
    'beta-beads': ['🫧', 'A bead that looks like a bubble'], 'beta-buttons': ['🩷', 'A button shaped like a heart'], 'beta-lock': ['🎲', 'A pair of lucky dice'],
    'beta-jigsaw': ['🧩', 'The last piece of the jigsaw'],
    'st-yard': ['🧲', 'A horseshoe nail'], 'st-paddock': ['🦗', 'A cricket in the long grass'], 'st-fence': ['🐦', 'A wren on the top rail'],
    'st-doors': ['🔔', 'A pony\'s harness bell'], 'st-jumps': ['🏵️', 'A faded rosette'], 'st-sign': ['🌸', 'A foxglove from the bank'],
    'st-window': ['🕸️', 'A cobweb full of dew'], 'st-tack': ['🪢', 'A plaited lead rope'], 'st-stable': ['🐭', 'A mouse asleep in the straw'],
    'st-groom': ['🧼', 'A bar of saddle soap'], 'st-trough': ['🪣', 'A bucket with a name on it'], 'st-barn': ['🌾', 'A sheaf of sweet hay'],
    'st-apples': ['🍏', 'An apple with one bite gone'], 'st-mane': ['🎀', 'A ribbon from the mane'], 'st-saddles': ['📸', 'A photo of a first ride'],
    'lo-skylight': ['☁️', 'A square of sky'], 'lo-window': ['🕊️', 'A pigeon on the sill'], 'lo-floor': ['🐾', 'A paw print in blue'],
    'lo-brushes': ['🖌️', 'A brush with one hair left'], 'lo-frames': ['🖼️', 'A very small frame'], 'lo-door': ['👒', 'A painter\'s old sun hat'],
    'lo-sign': ['✏️', 'A pencil stub'], 'lo-swing': ['🪶', 'A feather on the swing seat'], 'lo-stairs': ['🧦', 'One paint-spotted sock'],
    'lo-yard': ['🐞', 'A ladybird on a paint lid'], 'lo-poppies': ['🌺', 'A poppy pressed in a sketchbook'], 'lo-boxes': ['🌿', 'A sprig of rosemary'],
    'lo-canvas': ['🎨', 'A dried-up palette'], 'lo-mural': ['🌅', 'A sunrise you painted'], 'lo-mix': ['🌈', 'A jar of every colour'],
    'ob-path': ['🪨', 'A pebble worn smooth by the walk'], 'ob-grass': ['🦋', 'A moth that flies at dusk'], 'ob-dome': ['🪙', 'A penny gone green'],
    'ob-lens': ['🔭', 'A lens cap'], 'ob-telescope': ['📏', 'A brass ruler with tiny numbers'], 'ob-window': ['🕷️', 'A spider mapping the window'],
    'ob-charts': ['🗺️', 'A map of the moon'], 'ob-door': ['🛎️', 'The observatory bell'], 'ob-sign': ['⭐', 'A star that came off the sign'],
    'ob-lantern': ['🕯️', 'A stub of lantern candle'], 'ob-bench': ['🦉', 'An owl pellet, cleaned'], 'ob-steps': ['🧣', 'A stargazer\'s scarf'],
    'ob-thyme': ['🐝', 'A bumblebee asleep in the thyme'], 'ob-stars': ['🌠', 'A fallen star (a glass bead)'], 'ob-jigsaw': ['🌙', 'A tiny silver moon'],
    'li-tiles': ['🐚', 'A tile shaped like a shell'], 'li-terrace': ['🧴', 'A bottle of very old sun cream'], 'li-fountain': ['🦆', 'A rubber duck in the fountain'],
    'li-huts': ['🩴', 'One flip-flop'], 'li-gate': ['🎟️', 'A season ticket from long ago'], 'li-sign': ['🌊', 'A little painted wave'],
    'li-kiosk': ['🍭', 'A lollipop stick with a joke on it'], 'li-windows': ['🥄', 'A little wooden ice-cream spoon'], 'li-board': ['🏅', 'A diving medal'],
    'li-steps': ['🕶️', 'Sunglasses from the deep end'], 'li-mosaic': ['🌟', 'A gold tile from the starfish'], 'li-palms': ['🦎', 'A tiny gecko on a pot'],
    'li-litter': ['🏐', 'A very small beach ball'], 'li-chairs': ['📕', 'A holiday paperback, swollen with water'], 'li-ices': ['🍦', 'The last cone of the summer'],
    'beta-numbers': ['🖍️', 'A crayon worn down to a stub'], 'beta-stars': ['🌠', 'A star you joined up yourself'], 'beta-mix': ['🧪', 'A little jar of a new colour'],
  };

  // what you do in each kind of job, for the first-time hint
  const VERBS = { mow: 'mow', scrub: 'scrub', paint: 'paint', wash: 'wash', weed: 'pull weeds', skim: 'skim', dust: 'dust', rake: 'rake', snow: 'shovel', plant: 'plant', build: 'build', collect: 'pick things up', polish: 'polish', arrange: 'arrange', wipe: 'wipe', groom: 'wash the dog', brew: 'pour', feed: 'feed', walk: 'walk', brush: 'brush', muck: 'muck out', think: 'think', craft: 'make' };

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
  const COVE_DECOR = [
    { id: 'v-deckchairs', name: 'Striped deckchairs', icon: '🏖️', cost: 400 },
    { id: 'v-kite', name: 'A kite on the breeze', icon: '🪁', cost: 600 },
    { id: 'v-surfboard', name: 'A surfboard', icon: '🏄', cost: 850 },
    { id: 'v-lanterns', name: 'Lanterns on the boardwalk', icon: '🏮', cost: 1150 },
    { id: 'v-gulls', name: 'Two friendly gulls', icon: '🐦', cost: 1500 },
    { id: 'v-parasol', name: 'A beach umbrella', icon: '⛱️', cost: 1900 },
    { id: 'v-firepit', name: 'A campfire on the sand', icon: '🔥', cost: 2500 },
    { id: 'v-hammock', name: 'A hammock', icon: '🌴', cost: 3200 },
    { id: 'v-seal', name: 'A seal on the rocks', icon: '🦭', cost: 4200 },
    { id: 'v-sailboat', name: 'A sailboat out at sea', icon: '⛵', cost: 5500 },
    { id: 'v-kiosk', name: 'An ice-cream kiosk', icon: '🍦', cost: 7500 },
    { id: 'v-whale', name: 'A whale saying hello', icon: '🐋', cost: 10000 },
  ];
  const RESCUE_DECOR = [
    { id: 'r-bunting', name: 'Bunting on the barn', icon: '🎏', cost: 500 },
    { id: 'r-bench', name: 'A bench by the paddock', icon: '🪑', cost: 750 },
    { id: 'r-hens', name: 'A few happy hens', icon: '🐔', cost: 1000 },
    { id: 'r-sunflowers', name: 'Sunflowers by the gate', icon: '🌻', cost: 1350 },
    { id: 'r-goat', name: 'A goat on the hay bales', icon: '🐐', cost: 1800 },
    { id: 'r-lights', name: 'Fairy lights on the barn', icon: '✨', cost: 2400 },
    { id: 'r-tractor', name: 'A little red tractor', icon: '🚜', cost: 3000 },
    { id: 'r-donkey', name: 'A donkey friend', icon: '🫏', cost: 3800 },
    { id: 'r-pony', name: 'A Shetland pony', icon: '🐴', cost: 4800 },
    { id: 'r-ducklings', name: 'Ducklings on the pond', icon: '🦆', cost: 6200 },
    { id: 'r-owl', name: 'An owl in the hayloft', icon: '🦉', cost: 8000 },
    { id: 'r-rainbow', name: 'A rainbow after the rain', icon: '🌈', cost: 11000 },
  ];
  const GLASS_DECOR = [
    { id: 'g-bench', name: 'A bench under the apple tree', icon: '🪑', cost: 600 },
    { id: 'g-birdbath', name: 'A bird bath', icon: '🐦', cost: 850 },
    { id: 'g-scarecrow', name: 'A friendly scarecrow', icon: '🧑‍🌾', cost: 1150 },
    { id: 'g-beehive', name: 'Two beehives', icon: '🐝', cost: 1500 },
    { id: 'g-barrow', name: 'A wheelbarrow of flowers', icon: '🌷', cost: 2000 },
    { id: 'g-arch', name: 'A rose arch', icon: '🌹', cost: 2600 },
    { id: 'g-lights', name: 'Fairy lights in the glasshouse', icon: '✨', cost: 3300 },
    { id: 'g-tortoise', name: 'A tortoise in the strawberries', icon: '🐢', cost: 4200 },
    { id: 'g-sundial', name: 'A sundial', icon: '☀️', cost: 5400 },
    { id: 'g-fountain', name: 'A little fountain', icon: '⛲', cost: 7000 },
    { id: 'g-peacock', name: 'A peacock on the wall', icon: '🦚', cost: 9000 },
    { id: 'g-butterflies', name: 'A cloud of butterflies', icon: '🦋', cost: 12500 },
  ];
  const CANAL_DECOR = [
    { id: 'k-bench', name: 'A bench on the towpath', icon: '🪑', cost: 750 },
    { id: 'k-cans', name: 'Painted water cans', icon: '🪣', cost: 1050 },
    { id: 'k-bunting', name: 'Bunting along the boat', icon: '🎏', cost: 1400 },
    { id: 'k-heron', name: 'A heron by the lock', icon: '🪶', cost: 1850 },
    { id: 'k-bike', name: 'A bicycle by the fence', icon: '🚲', cost: 2400 },
    { id: 'k-lights', name: 'Fairy lights on the boat', icon: '✨', cost: 3100 },
    { id: 'k-swans', name: 'A pair of swans', icon: '🦢', cost: 4000 },
    { id: 'k-milepost', name: 'An old milepost', icon: '🪧', cost: 5100 },
    { id: 'k-lanterns', name: 'Lanterns on the bridge', icon: '🏮', cost: 6600 },
    { id: 'k-canoe', name: 'A red canoe', icon: '🛶', cost: 8400 },
    { id: 'k-dog', name: 'A boat dog on the roof', icon: '🐕', cost: 11000 },
    { id: 'k-kingfisher', name: 'The kingfisher', icon: '🐦', cost: 15000 },
  ];
  const BOOK_DECOR = [
    { id: 'b-fern', name: 'A big fern in a pot', icon: '🪴', cost: 900 },
    { id: 'b-lamp', name: 'A reading lamp', icon: '💡', cost: 1250 },
    { id: 'b-cushions', name: 'Cushions for the nook', icon: '🛋️', cost: 1650 },
    { id: 'b-globe', name: 'An old globe', icon: '🌍', cost: 2200 },
    { id: 'b-bike', name: 'A bicycle with a basket of books', icon: '🚲', cost: 2900 },
    { id: 'b-lights', name: 'Fairy lights in the window', icon: '✨', cost: 3700 },
    { id: 'b-ladder', name: 'A rolling library ladder', icon: '🪜', cost: 4800 },
    { id: 'b-armchair', name: 'A second big armchair', icon: '🪑', cost: 6100 },
    { id: 'b-clock', name: 'A grandfather clock', icon: '🕰️', cost: 7800 },
    { id: 'b-trolley', name: 'A tea trolley with cakes', icon: '🍰', cost: 10000 },
    { id: 'b-kitten', name: 'A kitten playing with wool', icon: '🐈', cost: 13000 },
    { id: 'b-piano', name: 'An old piano', icon: '🎹', cost: 17500 },
  ];
  const POTTERY_DECOR = [
    { id: 'p-chimes', name: 'Clay wind chimes', icon: '🎐', cost: 800 },
    { id: 'p-urn', name: 'A big urn by the door', icon: '🏺', cost: 1150 },
    { id: 'p-step', name: 'A mosaic step', icon: '🔷', cost: 1550 },
    { id: 'p-hedge', name: 'A lavender hedge', icon: '💜', cost: 2050 },
    { id: 'p-cat', name: 'The potter\'s cat in the window', icon: '🐈', cost: 2700 },
    { id: 'p-bench', name: 'A bench by the kiln', icon: '🪑', cost: 3450 },
    { id: 'p-bunting', name: 'Bunting', icon: '🎏', cost: 4400 },
    { id: 'p-birdbath', name: 'A glazed bird bath', icon: '🐦', cost: 5600 },
    { id: 'p-lights', name: 'Fairy lights on the rack', icon: '✨', cost: 7000 },
    { id: 'p-barrow', name: 'A wheelbarrow of pots', icon: '🪴', cost: 8800 },
    { id: 'p-sundial', name: 'A sundial', icon: '☀️', cost: 11500 },
    { id: 'p-bike', name: 'A bicycle with pots in the basket', icon: '🚲', cost: 16000 },
  ];
  const HALT_DECOR = [
    { id: 'h-cat', name: 'A cat basket on the platform', icon: '🧺', cost: 900 },
    { id: 'h-churns', name: 'Milk churns', icon: '🥛', cost: 1300 },
    { id: 'h-trunk', name: 'A travel trunk', icon: '🧳', cost: 1750 },
    { id: 'h-postbox', name: 'A red postbox', icon: '📮', cost: 2300 },
    { id: 'h-bike', name: 'A bicycle', icon: '🚲', cost: 3000 },
    { id: 'h-cart', name: 'A barrow of flowers', icon: '🌷', cost: 3900 },
    { id: 'h-poster', name: 'An old poster', icon: '🖼️', cost: 5000 },
    { id: 'h-bunting', name: 'Bunting', icon: '🎏', cost: 6300 },
    { id: 'h-lights', name: 'A string of lamps', icon: '✨', cost: 8000 },
    { id: 'h-bell', name: 'A station bell', icon: '🔔', cost: 10000 },
    { id: 'h-vane', name: 'A weather vane', icon: '🐓', cost: 13000 },
    { id: 'h-tea', name: 'A tea hatch', icon: '🫖', cost: 18000 },
  ];
  const BEAD_DECOR = [
    { id: 'bd-fern', name: 'A fern in a pot', icon: '🪴', cost: 1000 },
    { id: 'bd-bunting', name: 'Bunting', icon: '🎏', cost: 1400 },
    { id: 'bd-bell', name: 'A brass shop bell', icon: '🔔', cost: 1950 },
    { id: 'bd-lace', name: 'A lace curtain', icon: '🪟', cost: 2550 },
    { id: 'bd-poster', name: 'A sewing pattern poster', icon: '🖼️', cost: 3300 },
    { id: 'bd-cat', name: 'A cat in the window', icon: '🐈', cost: 4300 },
    { id: 'bd-scissors', name: 'A big scissors sign', icon: '✂️', cost: 5550 },
    { id: 'bd-pram', name: 'An old pram full of flowers', icon: '🌷', cost: 7000 },
    { id: 'bd-lights', name: 'Fairy lights in the window', icon: '✨', cost: 8900 },
    { id: 'bd-ribbons', name: 'A rainbow of ribbons', icon: '🌈', cost: 11000 },
    { id: 'bd-tree', name: 'A button tree', icon: '🌳', cost: 14500 },
    { id: 'bd-form', name: 'A dress form in the window', icon: '👗', cost: 20000 },
  ];
  const CURIO_DECOR = [
    { id: 'mc-fern', name: 'A fern under a glass dome', icon: '🌿', cost: 1100 },
    { id: 'mc-map', name: 'An old map on the wall', icon: '🗺️', cost: 1550 },
    { id: 'mc-ship', name: 'A ship in a bottle', icon: '⛵', cost: 2150 },
    { id: 'mc-cuckoo', name: 'A cuckoo clock', icon: '🐦', cost: 2800 },
    { id: 'mc-telescope', name: 'A brass telescope', icon: '🔭', cost: 3650 },
    { id: 'mc-cat', name: 'A cat on the cabinet', icon: '🐈', cost: 4750 },
    { id: 'mc-globelamp', name: 'A globe lamp', icon: '🌐', cost: 6100 },
    { id: 'mc-gramophone', name: 'A gramophone', icon: '🎶', cost: 7700 },
    { id: 'mc-lights', name: 'Fairy lights in the window', icon: '✨', cost: 9800 },
    { id: 'mc-horse', name: 'A rocking horse', icon: '🐴', cost: 12100 },
    { id: 'mc-chandelier', name: 'A chandelier', icon: '🕯️', cost: 16000 },
    { id: 'mc-armour', name: 'A little suit of armour', icon: '🛡️', cost: 22000 },
  ];
  const STABLE_DECOR = [
    { id: 'fs-shoe', name: 'A horseshoe over the door', icon: '🧲', cost: 1200 },
    { id: 'fs-swallows', name: 'A swallows\' nest under the eaves', icon: '🐦', cost: 1700 },
    { id: 'fs-block', name: 'A mounting block', icon: '🪨', cost: 2300 },
    { id: 'fs-foxgloves', name: 'A border of foxgloves', icon: '🌸', cost: 3000 },
    { id: 'fs-rosettes', name: 'A board of rosettes', icon: '🏵️', cost: 3950 },
    { id: 'fs-trough', name: 'A trough of flowers', icon: '🌼', cost: 5150 },
    { id: 'fs-hens', name: 'A hen run', icon: '🐔', cost: 6650 },
    { id: 'fs-kennel', name: 'A kennel for the yard dog', icon: '🐕', cost: 8400 },
    { id: 'fs-lights', name: 'Fairy lights on the barn', icon: '✨', cost: 10700 },
    { id: 'fs-dovecote', name: 'A dovecote', icon: '🕊️', cost: 13200 },
    { id: 'fs-cart', name: 'A little pony cart', icon: '🛞', cost: 17500 },
    { id: 'fs-vane', name: 'A weathervane on the barn', icon: '🐎', cost: 24000 },
  ];
  const LOFT_DECOR = [
    { id: 'pl-pail', name: 'A paint pail of daisies', icon: '🪣', cost: 1300 },
    { id: 'pl-bunting', name: 'Bunting across the yard', icon: '🎏', cost: 1850 },
    { id: 'pl-cat', name: 'A cat on the stairs', icon: '🐈', cost: 2500 },
    { id: 'pl-bike', name: 'A bicycle by the wall', icon: '🚲', cost: 3300 },
    { id: 'pl-hare', name: 'A bronze hare', icon: '🐇', cost: 4300 },
    { id: 'pl-sunflowers', name: 'A giant pot of sunflowers', icon: '🌻', cost: 5600 },
    { id: 'pl-sculpture', name: 'A sculpture in the yard', icon: '🗿', cost: 7200 },
    { id: 'pl-chimes', name: 'A wind sculpture', icon: '🎐', cost: 9100 },
    { id: 'pl-lights', name: 'Fairy lights up the stairs', icon: '✨', cost: 11600 },
    { id: 'pl-sun', name: 'A painted sun on the gable', icon: '🌞', cost: 14300 },
    { id: 'pl-hammock', name: 'A hammock', icon: '🧺', cost: 19000 },
    { id: 'pl-vane', name: 'A paintbrush weathervane', icon: '🖌️', cost: 26000 },
  ];
  const OBSERVATORY_DECOR = [
    { id: 'oh-blanket', name: 'A stargazing blanket', icon: '🧺', cost: 1400 },
    { id: 'oh-flowers', name: 'A patch of wildflowers', icon: '🌼', cost: 2000 },
    { id: 'oh-stoneowl', name: 'A stone owl', icon: '🪨', cost: 2700 },
    { id: 'oh-sundial', name: 'A brass sundial', icon: '☀️', cost: 3550 },
    { id: 'oh-spyglass', name: 'A spyglass on the terrace', icon: '🔭', cost: 4650 },
    { id: 'oh-moonlamp', name: 'A moon lamp', icon: '🌕', cost: 6050 },
    { id: 'oh-owl', name: 'An owl in the oak', icon: '🦉', cost: 7750 },
    { id: 'oh-weather', name: 'A little weather station', icon: '🌡️', cost: 9800 },
    { id: 'oh-lights', name: 'Fairy lights round the dome', icon: '✨', cost: 12500 },
    { id: 'oh-meteor', name: 'A meteor bench', icon: '☄️', cost: 15400 },
    { id: 'oh-moonflower', name: 'A glowing moonflower', icon: '🌙', cost: 20450 },
    { id: 'oh-vane', name: 'A copper weathervane', icon: '🧭', cost: 28000 },
  ];
  const LIDO_DECOR = [
    { id: 'sb-bunting', name: 'Bunting over the pool', icon: '🎏', cost: 1500 },
    { id: 'sb-flamingo', name: 'A flamingo pool float', icon: '🦩', cost: 2150 },
    { id: 'sb-towels', name: 'A rainbow towel rack', icon: '🧺', cost: 2900 },
    { id: 'sb-parasols', name: 'Striped parasols', icon: '⛱️', cost: 3800 },
    { id: 'sb-cat', name: 'A cat on a deck chair', icon: '🐈', cost: 4950 },
    { id: 'sb-palm', name: 'A big palm', icon: '🌴', cost: 6450 },
    { id: 'sb-sundial', name: 'A sundial on the terrace', icon: '☀️', cost: 8300 },
    { id: 'sb-lifeguard', name: 'A lifeguard\'s chair', icon: '🛟', cost: 10500 },
    { id: 'sb-lights', name: 'Fairy lights along the terrace', icon: '✨', cost: 13400 },
    { id: 'sb-fountainlight', name: 'Lights in the fountain', icon: '⛲', cost: 16500 },
    { id: 'sb-shells', name: 'A shell mosaic on the kiosk wall', icon: '🐚', cost: 21900 },
    { id: 'sb-jukebox', name: 'A jukebox by the kiosk', icon: '🎵', cost: 30000 },
  ];
  const DECOR_UNLOCK = 6;

  // The places you can own; the picture of each is drawn by HOUSE, CAFE, COVE,
  // RESCUE, GLASSHOUSE, CANAL, BOOKS, POTTERY, HALT, BEADS, CURIO, STABLES, LOFT, OBSERVATORY, LIDO or BETA. A place goes up for sale once
  // the one it needs is restored and `wait` more seasons have turned (main.js).
  const PLACES = [
    { id: 'cottage', name: 'Ivy Cottage', short: 'the cottage', blurb: 'The forgotten cottage where it all began.', price: 0, chores: CHORES, decor: DECOR, done: 'The cottage is lovely again', lights: 'lights' },
    { id: 'cafe', name: 'Marigold Café', short: 'the café', toolPrice: 2, blurb: 'A little corner café, closed for years. Sweep it, build it, plant it and open it again.', price: 9000, needs: 'cottage', chores: CAFE_CHORES, decor: CAFE_DECOR, done: 'The café is open again', lights: 'c-lights' },
    { id: 'cove', name: 'Seashell Cove', short: 'the cove', toolPrice: 3, blurb: 'A beach hut, a rowing boat, an old camper van and a lighthouse, left to the gulls.', price: 20000, needs: 'cafe', wait: 1, chores: COVE_CHORES, decor: COVE_DECOR, done: 'The cove is lovely again', lights: 'v-lanterns' },
    { id: 'rescue', name: 'Bluebell Rescue', short: 'the rescue', toolPrice: 4, blurb: 'An old farm that takes in dogs, cats, rabbits and the odd seal pup. Feed them, walk them, brush them and mend the place.', price: 30000, needs: 'cove', wait: 2, chores: RESCUE_CHORES, decor: RESCUE_DECOR, done: 'The animals are at home again', lights: 'r-lights' },
    { id: 'glasshouse', name: 'Primrose Glasshouse', short: 'the glasshouse', toolPrice: 5, blurb: 'A walled garden with an old glasshouse, an orchard and a potting shed, all gone wild. Water it, grow it, mend it and bring it back into bloom.', price: 42000, needs: 'rescue', wait: 3, chores: GLASS_CHORES, decor: GLASS_DECOR, done: 'The garden is in bloom again', lights: 'g-lights' },
    { id: 'canal', name: 'Kingfisher Lock', short: 'the canal', toolPrice: 6, blurb: 'A canal lock with a narrowboat, a humpback bridge and the lock-keeper\'s cottage, all left to the ducks. Paint the boat, mend the gates and load it for a trip.', price: 55000, needs: 'glasshouse', wait: 4, chores: CANAL_CHORES, decor: CANAL_DECOR, done: 'The canal is lovely again', lights: 'k-lights' },
    { id: 'books', name: 'Hollyhock Books', short: 'the bookshop', toolPrice: 7, blurb: 'An old bookshop on a cobbled lane, with a reading nook, a shop cat and a courtyard at the back. Dust it, sort it, paint it and open the door to readers again.', price: 70000, needs: 'canal', wait: 4, chores: BOOK_CHORES, decor: BOOK_DECOR, done: 'The bookshop is open again', lights: 'b-lights' },
    { id: 'pottery', name: 'Kiln Lane Pottery', short: 'the pottery', toolPrice: 8, blurb: 'A pottery in an old brick barn down a field lane, with a big kiln, a potter\'s wheel and shelves of glazes. Clean it, mend it and make your first bowl.', price: 80000, needs: 'books', wait: 4, chores: POTTERY_CHORES, decor: POTTERY_DECOR, done: 'The pottery is open again', lights: 'p-lights' },
    { id: 'halt', name: 'Halfpenny Halt', short: 'the station', toolPrice: 9, blurb: 'A little country station where no train has stopped for years: a waiting room, a signal box and a lost-property office full of little mysteries.', price: 90000, needs: 'pottery', wait: 4, chores: HALT_CHORES, decor: HALT_DECOR, done: 'The station is lovely again', lights: 'h-lights' },
    // from the bead shop on, tools cost ten times what they cost at the cottage, and no more
    { id: 'beads', name: 'Button & Bead', short: 'the bead shop', toolPrice: 10, blurb: 'A tiny haberdashery on a cobbled street: a bow window full of ribbons, drawers of buttons, trays of beads and an old sewing machine. Dust it, mend it and make something with your own hands.', price: 100000, needs: 'halt', wait: 4, chores: BEAD_CHORES, decor: BEAD_DECOR, done: 'The bead shop is open again', lights: 'bd-lights' },
    { id: 'curio', name: 'Marchbank\'s Curiosities', short: 'the curiosity shop', toolPrice: 10, blurb: 'An old curiosity shop: a cabinet of twenty little drawers, a grandfather clock, a globe and a box nobody has opened in years. Polish it, mend it and find out what it hides.', price: 110000, needs: 'beads', wait: 4, chores: CURIO_CHORES, decor: CURIO_DECOR, done: 'The curiosity shop is open again', lights: 'mc-lights' },
    { id: 'stables', name: 'Foxglove Stables', short: 'the stables', toolPrice: 10, blurb: 'A little pony yard with three half-doors, a tack room, a paddock with jumps and a hay barn. Muck it out, mend it and put ribbons in a mane. The ponies are happy either way.', price: 120000, needs: 'curio', wait: 4, chores: STABLE_CHORES, decor: STABLE_DECOR, done: 'The stables are lovely again', lights: 'fs-lights' },
    { id: 'loft', name: 'The Painter\'s Loft', short: 'the loft', toolPrice: 10, blurb: 'A studio in an old hay loft: a skylight, easels, a store of frames and a long wall in the yard. Clean it, mend it and paint with your own hands.', price: 130000, needs: 'stables', wait: 4, chores: LOFT_CHORES, decor: LOFT_DECOR, done: 'The loft is open again', lights: 'pl-lights' },
    { id: 'observatory', name: 'Owl Hill Observatory', short: 'the observatory', toolPrice: 10, blurb: 'A little Victorian observatory on a hill: a copper dome, a brass telescope, a map room and an owl in the oak. Polish it, mend it and join the stars.', price: 140000, needs: 'loft', wait: 4, chores: OBSERVATORY_CHORES, decor: OBSERVATORY_DECOR, done: 'The observatory is lovely again', lights: 'oh-lights' },
    { id: 'lido', name: 'Sunnybank Lido', short: 'the lido', toolPrice: 10, blurb: 'An art deco open-air pool with pale blue tiles, a fountain, a diving board and striped deck chairs. Scrub it, mend it and fill it for the summer.', price: 150000, needs: 'observatory', wait: 4, chores: LIDO_CHORES, decor: LIDO_DECOR, done: 'The lido is open again', lights: 'sb-lights' },
    // open from the start and outside the order above: never bought, never in the seasons
    { id: 'beta', name: 'The Puzzle Room', short: 'the puzzle room', beta: true, blurb: 'New kinds of jobs to try: no tools, just a little thinking. Each one comes out different every time.', price: 0, chores: BETA_CHORES, decor: [], done: 'Every puzzle is solved' },
  ].filter((p) => !p.soon); // a place still being built can be hidden with soon: true
  const placeOf = (id) => PLACES.find((p) => p.id === id) || PLACES[0];

  return {
    AREAS, CHORES, CAFE_CHORES, COVE_CHORES, RESCUE_CHORES, GLASS_CHORES, CANAL_CHORES, BOOK_CHORES, POTTERY_CHORES, HALT_CHORES, BEAD_CHORES, CURIO_CHORES, STABLE_CHORES, LOFT_CHORES, OBSERVATORY_CHORES, LIDO_CHORES, BETA_CHORES, EXTRAS, PLACES, placeOf, FINDS, SEASON_FINDS, SEASON_ORDER, VERBS,
    DECOR, CAFE_DECOR, COVE_DECOR, RESCUE_DECOR, GLASS_DECOR, CANAL_DECOR, BOOK_DECOR, POTTERY_DECOR, HALT_DECOR, BEAD_DECOR, CURIO_DECOR, STABLE_DECOR, LOFT_DECOR, OBSERVATORY_DECOR, LIDO_DECOR, DECOR_UNLOCK, SEASON_NAMES,
    seasonOf, seasonJobs, awakePlaces, SEASON_BUDGET, PER_SEASON, seasonValue, FAMILY_SEASON, toolCost, HELPER_COSTS, HELPER_UNLOCK, PAINTS, DEFAULT_COLOURS, choreValue, intro, isIndoor,
  };
})();
