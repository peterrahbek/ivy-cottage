'use strict';
// The pictures in Paint by numbers (js/pz-numbers.js), and the same pictures as
// SVG for the place that keeps them on its wall (js/loft.js). Needs nothing else.
//
//   PAINTINGS.MOTIFS[id] = { name, w, h, cells: [{ pts: [[x, y], ...], k }], pals, ink }
//     cells tile the whole w x h rectangle, background included; k is the
//     colour of the cell in a palette; pals is a list of palettes of four or
//     five colours; ink is what is printed on the page from the start: lines
//     { lines: [[[x, y], ...], ...] } and dots { dots: [[x, y, r], ...] }.
//   PAINTINGS.CANVAS, PAINTINGS.MURAL   ids of the square and of the wide pictures
//   PAINTINGS.DEFAULT                   { canvas: { m, p }, mural: { m, p } }, what
//                                       a place shows before anything is kept
//   PAINTINGS.spots(id)                 for each cell the point furthest from its
//                                       edges and from the ink: [{ x, y, r }], where
//                                       its number goes
//   PAINTINGS.svg(keep, x, y, w, h)     keep = { m, p }: polygons filling that
//                                       rectangle, no ids and no <svg> around them

const PAINTINGS = (() => {
  // a cell: its colour, then x, y, x, y ...
  const cell = (k, ...v) => { const pts = []; for (let i = 0; i < v.length; i += 2) pts.push([v[i], v[i + 1]]); return { k, pts }; };

  const MOTIFS = {
    // sky, fur, cheeks, nose, grass
    fox: {
      name: 'The fox', w: 100, h: 100,
      cells: [
        cell(0, 0, 0, 50, 0, 50, 30, 38, 30, 22, 8, 16, 50, 42, 74, 45, 80, 0, 80),
        cell(0, 50, 0, 100, 0, 100, 80, 55, 80, 58, 74, 84, 50, 78, 8, 62, 30, 50, 30),
        cell(1, 22, 8, 38, 30, 50, 30, 50, 58, 16, 50),
        cell(1, 78, 8, 84, 50, 50, 58, 50, 30, 62, 30),
        cell(2, 16, 50, 50, 58, 50, 68, 42, 74),
        cell(2, 84, 50, 58, 74, 50, 68, 50, 58),
        cell(3, 50, 68, 58, 74, 50, 90, 42, 74),
        cell(4, 0, 80, 45, 80, 50, 90, 50, 100, 0, 100),
        cell(4, 100, 80, 100, 100, 50, 100, 50, 90, 55, 80),
      ],
      pals: [['#bfe0ea', '#e2853b', '#fbf1df', '#4a3a34', '#8fb97a'], ['#f4cfa9', '#cf6a36', '#fff4e2', '#3f3350', '#7d9a80'], ['#d3e3ee', '#d9803f', '#fdfcf7', '#3f4250', '#e6ecf0']],
      ink: { dots: [[35, 44, 2.5], [65, 44, 2.5]], lines: [[[27, 18], [33, 32]], [[73, 18], [67, 32]]] },
    },
    // sky, white sail, hull, sea, sun and the other sail
    boat: {
      name: 'The little boat', w: 100, h: 100,
      cells: [
        cell(1, 50, 10, 50, 64, 18, 64),
        cell(4, 50, 10, 86, 64, 50, 64),
        cell(2, 14, 64, 18, 64, 50, 64, 86, 64, 90, 64, 76, 82, 28, 82),
        cell(0, 0, 0, 50, 0, 50, 10, 18, 64, 14, 64, 0, 64),
        cell(0, 50, 0, 100, 0, 100, 25, 93, 25, 90, 17, 82, 14, 74, 17, 71, 25, 60, 25, 50, 10),
        cell(0, 60, 25, 71, 25, 74, 33, 82, 36, 90, 33, 93, 25, 100, 25, 100, 64, 90, 64, 86, 64),
        cell(4, 82, 14, 90, 17, 93, 25, 90, 33, 82, 36, 74, 33, 71, 25, 74, 17),
        cell(3, 0, 64, 14, 64, 28, 82, 50, 82, 50, 100, 0, 100),
        cell(3, 50, 100, 50, 82, 76, 82, 90, 64, 100, 64, 100, 100),
      ],
      pals: [['#bfe3f0', '#fdf6e6', '#c9474f', '#4f93b8', '#f2c94f'], ['#f7d6b5', '#fff3dd', '#2f5f7a', '#3d7f8f', '#ee8f55'], ['#d7e6d9', '#fffaf0', '#b7563c', '#6aa59b', '#f0c869']],
      ink: { lines: [[[50, 4], [50, 64]], [[24, 72], [80, 72]], [[8, 90], [14, 87], [20, 90], [26, 87], [32, 90]], [[66, 92], [72, 89], [78, 92], [84, 89], [90, 92]]] },
    },
    // wall, the pot's top, its band, the table, lid, spout and handle
    teapot: {
      name: 'The teapot', w: 100, h: 100,
      cells: [
        cell(0, 0, 0, 50, 0, 50, 32, 42, 32, 36, 42, 30, 42, 20, 48, 14, 58, 10, 50, 9, 40, 1, 42, 3, 54, 7, 64, 14, 70, 22, 80, 32, 84, 0, 84),
        cell(0, 50, 0, 100, 0, 100, 84, 64, 84, 74, 80, 78, 75, 90, 79, 98, 70, 98, 56, 90, 47, 79, 53, 76, 48, 66, 42, 60, 42, 54, 32, 50, 32),
        cell(1, 30, 42, 66, 42, 76, 48, 79, 53, 82, 58, 82, 62, 14, 62, 14, 58, 20, 48),
        cell(2, 14, 62, 82, 62, 82, 70, 78, 75, 74, 80, 64, 84, 32, 84, 22, 80, 14, 70),
        cell(4, 36, 42, 42, 32, 54, 32, 60, 42),
        cell(4, 14, 58, 14, 70, 7, 64, 3, 54, 1, 42, 9, 40, 10, 50),
        cell(4, 79, 53, 90, 47, 98, 56, 98, 70, 90, 79, 78, 75, 82, 70, 90, 70, 90, 58, 82, 58),
        cell(0, 82, 58, 90, 58, 90, 70, 82, 70),
        cell(3, 0, 84, 50, 84, 50, 100, 0, 100),
        cell(3, 50, 84, 100, 84, 100, 100, 50, 100),
      ],
      pals: [['#f3e3c8', '#6fa8a6', '#fbf3e2', '#b98357', '#e08d6b'], ['#d9e4d5', '#d97a6a', '#fff7ea', '#8f6a4c', '#e9bf4f'], ['#e5dcef', '#6c7fb8', '#fdf5e6', '#a8835f', '#e58fa5']],
      ink: { dots: [[48, 28, 3.6]], lines: [[[4, 34], [2.6, 30], [5, 26], [3.6, 22], [5.6, 18]], [[32, 74], [64, 74]]] },
    },
    // sky, white stripes, red stripe and roof, sea, the lamp and the sand
    lighthouse: {
      name: 'The lighthouse', w: 100, h: 100,
      cells: [
        cell(0, 0, 0, 50, 0, 50, 4, 37, 18, 42, 18, 42, 30, 40, 30, 38, 46, 36, 62, 35, 70, 0, 70),
        cell(0, 50, 0, 100, 0, 100, 70, 65, 70, 64, 62, 62, 46, 60, 30, 58, 30, 58, 18, 63, 18, 50, 4),
        cell(2, 37, 18, 50, 4, 63, 18),
        cell(4, 42, 18, 58, 18, 58, 30, 42, 30),
        cell(1, 40, 30, 60, 30, 62, 46, 38, 46),
        cell(2, 38, 46, 62, 46, 64, 62, 36, 62),
        cell(1, 36, 62, 64, 62, 66, 78, 34, 78),
        cell(4, 34, 78, 66, 78, 78, 86, 88, 100, 12, 100, 22, 86),
        cell(3, 0, 70, 35, 70, 34, 78, 22, 86, 12, 100, 0, 100),
        cell(3, 65, 70, 100, 70, 100, 100, 88, 100, 78, 86, 66, 78),
      ],
      pals: [['#bfe3f0', '#fdf8ec', '#d2544b', '#4a8fb3', '#f0c65a'], ['#f5c7a1', '#fff4e0', '#6b4f8a', '#5b85a0', '#f7d774'], ['#d6e8df', '#fffdf5', '#2f7f7a', '#6bb0a8', '#ecc15a']],
      ink: { dots: [[50, 38, 2.4], [50, 54, 2.4]], lines: [[[45, 78], [45, 70], [55, 70], [55, 78]], [[50, 18], [50, 30]], [[24, 22], [30, 20], [36, 22]], [[70, 36], [76, 34], [82, 36]], [[10, 82], [15, 80], [20, 82]], [[82, 80], [87, 78], [92, 80]]] },
    },
    // wall, fur, bib, floor, tail
    cat: {
      name: 'The cat', w: 100, h: 100,
      cells: [
        cell(0, 0, 0, 50, 0, 50, 18, 40, 18, 30, 6, 32, 28, 32, 42, 40, 50, 28, 68, 26, 84, 0, 84),
        cell(0, 50, 0, 100, 0, 100, 84, 84, 84, 95, 76, 97, 60, 90, 48, 82, 54, 88, 60, 86, 72, 73, 76, 72, 68, 60, 50, 68, 42, 68, 28, 70, 6, 60, 18, 50, 18),
        cell(1, 30, 6, 40, 18, 60, 18, 70, 6, 68, 28, 68, 42, 60, 50, 40, 50, 32, 42, 32, 28),
        cell(1, 40, 50, 42, 50, 38, 66, 50, 78, 50, 84, 26, 84, 28, 68),
        cell(1, 58, 50, 60, 50, 72, 68, 73, 76, 74, 84, 50, 84, 50, 78, 62, 66),
        cell(2, 42, 50, 58, 50, 62, 66, 50, 78, 38, 66),
        cell(4, 73, 76, 86, 72, 88, 60, 82, 54, 90, 48, 97, 60, 95, 76, 84, 84, 74, 84),
        cell(3, 0, 84, 50, 84, 50, 100, 0, 100),
        cell(3, 50, 84, 100, 84, 100, 100, 50, 100),
      ],
      pals: [['#cfe3d6', '#e6a057', '#fdf3e1', '#b8875e', '#c97a35'], ['#f1dcc6', '#9aa1b2', '#fbf8f0', '#6f8f8a', '#747c90'], ['#f5e3a8', '#b08a6a', '#f7efe3', '#7f9a78', '#8a6a50']],
      ink: { dots: [[42, 32, 2.4], [58, 32, 2.4], [50, 39, 1.5]], lines: [[[50, 39], [50, 43], [46, 45]], [[50, 43], [54, 45]], [[40, 40], [34, 38]], [[40, 43], [34, 44]], [[60, 40], [66, 38]], [[60, 43], [66, 44]], [[33, 12], [36, 21]], [[67, 12], [64, 21]]] },
    },
    // sky, walls, roof and door, grass, sun
    house: {
      name: 'The little house', w: 100, h: 100,
      cells: [
        cell(0, 0, 0, 50, 0, 50, 16, 44, 21, 30, 21, 27, 14, 20, 11, 13, 14, 10, 21, 0, 21),
        cell(0, 0, 21, 10, 21, 13, 28, 20, 31, 27, 28, 30, 21, 44, 21, 14, 46, 22, 46, 22, 84, 0, 84),
        cell(0, 50, 0, 100, 0, 100, 84, 78, 84, 78, 46, 86, 46, 50, 16),
        cell(4, 20, 11, 27, 14, 30, 21, 27, 28, 20, 31, 13, 28, 10, 21, 13, 14),
        cell(2, 14, 46, 50, 16, 86, 46),
        cell(1, 22, 46, 50, 46, 50, 60, 44, 60, 44, 84, 22, 84),
        cell(1, 50, 46, 78, 46, 78, 84, 56, 84, 56, 60, 50, 60),
        cell(2, 44, 60, 56, 60, 56, 84, 44, 84),
        cell(3, 0, 84, 50, 84, 50, 100, 0, 100),
        cell(3, 50, 84, 100, 84, 100, 100, 50, 100),
      ],
      pals: [['#bfe3f0', '#f6e3b4', '#c9614f', '#8fbd78', '#f5cf5a'], ['#f8d9bd', '#fdf4e3', '#5f7fa6', '#a7c08a', '#ef9a5a'], ['#d9e6f0', '#f3dcc8', '#8a5a52', '#f1f6f7', '#f4c96a']],
      ink: { dots: [[53, 73, 1.5]], lines: [[[27, 54], [39, 54], [39, 67], [27, 67], [27, 54]], [[33, 54], [33, 67]], [[27, 60.5], [39, 60.5]], [[61, 54], [73, 54], [73, 67], [61, 67], [61, 54]], [[67, 54], [67, 67]], [[61, 60.5], [73, 60.5]], [[82, 16], [88, 13], [94, 16]]] },
    },

    // ---------------------------------------------------- the wide ones, for a wall
    // two skies in rays, the sun and its path on the river, far hills, near hills
    sunrise: {
      name: 'Sunrise over the hills', w: 170, h: 100,
      cells: [
        cell(0, 0, 60, 0, 11, 64, 48, 61, 60),
        cell(1, 0, 11, 0, 0, 50, 0, 73, 39, 64, 48),
        cell(0, 50, 0, 85, 0, 85, 36, 73, 39),
        cell(1, 85, 0, 120, 0, 97, 39, 85, 36),
        cell(0, 120, 0, 170, 0, 170, 11, 106, 48, 97, 39),
        cell(1, 170, 11, 170, 60, 109, 60, 106, 48),
        cell(2, 61, 60, 64, 48, 73, 39, 85, 36, 97, 39, 106, 48, 109, 60),
        cell(2, 76, 60, 94, 60, 110, 100, 60, 100),
        cell(3, 0, 60, 61, 60, 76, 60, 68, 80, 34, 70, 0, 82),
        cell(3, 94, 60, 109, 60, 170, 60, 170, 82, 134, 72, 102, 80),
        cell(4, 0, 82, 34, 70, 68, 80, 60, 100, 0, 100),
        cell(4, 102, 80, 134, 72, 170, 82, 170, 100, 110, 100),
      ],
      pals: [['#fbd1a2', '#f7b58f', '#ffe27a', '#8cab7a', '#5f8a66'], ['#cfe6f2', '#a9d4ea', '#fbe38a', '#9cc48d', '#6fa57a'], ['#e9c7dc', '#d3b1dd', '#ffd98a', '#7f8fb8', '#5a6f9a']],
      ink: { lines: [[[22, 28], [27, 25], [32, 28]], [[34, 36], [38, 33.6], [42, 36]], [[134, 22], [139, 19], [144, 22]], [[86, 74], [92, 74]], [[80, 84], [90, 84]], [[92, 92], [100, 92]]] },
    },
    // sky, sea, the whale's back, its belly and the spout, tail and fin
    whale: {
      name: 'The whale', w: 170, h: 100,
      cells: [
        cell(0, 0, 0, 55, 0, 55, 4, 48, 13, 32, 10, 46, 20, 50, 33, 38, 38, 30, 50, 0, 50),
        cell(0, 55, 0, 170, 0, 170, 50, 158, 50, 167, 30, 153, 14, 146, 40, 134, 46, 106, 30, 80, 28, 70, 27, 60, 30, 64, 20, 78, 10, 62, 13, 55, 4),
        cell(3, 50, 33, 46, 20, 32, 10, 48, 13, 55, 4, 62, 13, 78, 10, 64, 20, 60, 30),
        cell(2, 24, 58, 30, 50, 38, 38, 50, 33, 60, 30, 70, 27, 80, 28, 80, 58, 60, 60),
        cell(2, 80, 28, 106, 30, 134, 46, 100, 56, 80, 58),
        cell(3, 24, 58, 60, 60, 80, 58, 100, 56, 134, 46, 130, 60, 100, 74, 80, 76, 60, 78, 36, 72),
        cell(4, 134, 46, 146, 40, 153, 14, 167, 30, 158, 50),
        cell(4, 134, 46, 158, 50, 164, 72, 150, 68, 130, 60),
        cell(4, 60, 78, 80, 76, 86, 94, 66, 90),
        cell(1, 0, 50, 30, 50, 24, 58, 36, 72, 60, 78, 66, 90, 60, 100, 0, 100),
        cell(1, 60, 100, 66, 90, 86, 94, 80, 76, 100, 74, 120, 100),
        cell(1, 120, 100, 100, 74, 130, 60, 150, 68, 164, 72, 158, 50, 170, 50, 170, 100),
      ],
      pals: [['#cfe9f2', '#4f9cc0', '#3d6a8f', '#f2efe6', '#2f5777'], ['#fbe0c2', '#5fa8a8', '#5a6f9a', '#fdf5e6', '#46597f'], ['#e3e9f5', '#7ca7d9', '#6a5f96', '#f8f0f0', '#54497c']],
      ink: { dots: [[44, 49, 2]], lines: [[[28, 59], [40, 62], [52, 62]], [[62, 66], [92, 64]], [[60, 71], [86, 69]], [[14, 72], [20, 69], [26, 72]], [[136, 86], [142, 83], [148, 86]], [[94, 90], [100, 87], [106, 90]]] },
    },
    // sky, the hill, two balloon colours, the sun and the cloud
    balloon: {
      name: 'The balloon', w: 170, h: 100,
      cells: [
        cell(2, 85, 6, 73, 36, 56, 36, 58, 24, 68, 10),
        cell(3, 85, 6, 97, 36, 73, 36),
        cell(2, 85, 6, 102, 10, 112, 24, 114, 36, 97, 36),
        cell(3, 56, 36, 73, 36, 80, 64, 76, 64, 62, 52),
        cell(2, 73, 36, 97, 36, 90, 64, 80, 64),
        cell(3, 97, 36, 114, 36, 108, 52, 94, 64, 90, 64),
        cell(2, 73, 70, 85, 70, 97, 70, 93, 85, 85, 85, 77, 85),
        cell(0, 0, 0, 85, 0, 85, 6, 68, 10, 58, 24, 56, 36, 62, 52, 76, 64, 85, 64, 85, 70, 73, 70, 77, 85, 85, 85, 85, 88, 40, 80, 0, 72, 0, 36, 30, 34, 36, 24, 26, 14, 12, 12, 0, 18),
        cell(0, 85, 0, 144, 0, 140, 10, 150, 24, 170, 28, 170, 72, 130, 80, 85, 88, 85, 85, 93, 85, 97, 70, 85, 70, 85, 64, 94, 64, 108, 52, 114, 36, 112, 24, 102, 10, 85, 6),
        cell(4, 144, 0, 170, 0, 170, 28, 150, 24, 140, 10),
        cell(4, 0, 18, 12, 12, 26, 14, 36, 24, 30, 34, 0, 36),
        cell(1, 0, 72, 40, 80, 85, 88, 130, 80, 170, 72, 170, 100, 0, 100),
      ],
      pals: [['#bfe3f0', '#8fbd78', '#d9574f', '#f2c94f', '#fdf4dc'], ['#f8dcc0', '#9db98a', '#3f7f8f', '#ee8f55', '#fff6e2'], ['#d6e6ef', '#a6c79a', '#8a6fb8', '#ef9db5', '#fffaf0']],
      ink: { lines: [[[78, 64], [79, 70]], [[92, 64], [91, 70]], [[85, 64], [85, 70]], [[120, 44], [125, 41], [130, 44]], [[134, 54], [138, 51.6], [142, 54]], [[30, 92], [36, 90], [42, 92]], [[124, 92], [130, 90], [136, 92]]] },
    },
  };

  const CANVAS = ['fox', 'boat', 'teapot', 'lighthouse', 'cat', 'house'];
  const MURAL = ['sunrise', 'whale', 'balloon'];
  // the pictures that come out of the loft's jobs the first time they are played
  const DEFAULT = { canvas: { m: 'lighthouse', p: 1 }, mural: { m: 'sunrise', p: 2 } };

  // ------------------------------------------------- the middle of each cell
  function inside(pts, x, y) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[j];
      if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) c = !c;
    }
    return c;
  }
  function edgeDist(pts, x, y) {
    let best = Infinity;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [ax, ay] = pts[j], [bx, by] = pts[i], dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
    return best;
  }
  // how far a point is from anything printed on the page
  function inkDist(ink, x, y) {
    let best = Infinity;
    for (const l of ink.lines || []) for (let i = 1; i < l.length; i++) best = Math.min(best, edgeDist([l[i - 1], l[i]], x, y) - 1);
    for (const [dx, dy, r] of ink.dots || []) best = Math.min(best, Math.hypot(x - dx, y - dy) - r - 0.6);
    return best;
  }
  const memo = {};
  function spots(id) {
    if (memo[id]) return memo[id];
    const ink = MOTIFS[id].ink || {};
    memo[id] = MOTIFS[id].cells.map(({ pts }) => {
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      let b = { x: pts[0][0], y: pts[0][1], r: 0 };
      const scan = (x0, y0, x1, y1, d) => {
        for (let x = x0; x <= x1; x += d) for (let y = y0; y <= y1; y += d) {
          if (!inside(pts, x, y)) continue;
          const r = Math.min(edgeDist(pts, x, y), inkDist(ink, x, y));
          if (r > b.r) b = { x, y, r };
        }
      };
      scan(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 1);
      scan(b.x - 1, b.y - 1, b.x + 1, b.y + 1, 0.125);
      return b;
    });
    return memo[id];
  }

  // ----------------------------------------------------------- as SVG
  const f1 = (v) => (+v).toFixed(1);
  // a motif always fills the rectangle it is given; keep says which picture
  // and in which colours, anything unknown falls back on the first canvas
  function svg(keep, x, y, w, h) {
    const k = keep || DEFAULT.canvas, M = MOTIFS[k.m] || MOTIFS[DEFAULT.canvas.m];
    const pal = M.pals[Math.abs(+k.p | 0) % M.pals.length], sx = w / M.w, sy = h / M.h;
    const at = (p) => `${f1(x + p[0] * sx)},${f1(y + p[1] * sy)}`;
    let s = '';
    for (const c of M.cells) s += `<polygon points="${c.pts.map(at).join(' ')}" fill="${pal[c.k]}" stroke="${pal[c.k]}" stroke-width="0.4" stroke-linejoin="round"/>`;
    const ink = M.ink || {}, lw = f1(Math.max(0.3, 0.7 * Math.min(sx, sy)));
    for (const l of ink.lines || []) s += `<polyline points="${l.map(at).join(' ')}" fill="none" stroke="#3b352e" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>`;
    for (const [dx, dy, r] of ink.dots || []) s += `<circle cx="${f1(x + dx * sx)}" cy="${f1(y + dy * sy)}" r="${f1(r * Math.min(sx, sy))}" fill="#3b352e"/>`;
    return s;
  }

  return { MOTIFS, CANVAS, MURAL, DEFAULT, spots, svg };
})();
