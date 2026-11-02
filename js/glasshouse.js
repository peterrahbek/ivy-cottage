'use strict';
// The glasshouse overview, drawn as SVG the same way as the cottage
// (house.js), the café, the cove and the rescue. An old walled garden: a
// Victorian glasshouse with a tall middle and two low wings, a door in the
// wall, long borders against the warm bricks, two old apple trees, a potting
// shed, raised beds, a cutting garden laid out in squares and a lily pond.
// Each restorable part has a tired look and a restored look; the potting shed
// and the door in the wall take the colours chosen while painting. Every id
// carries a 'g' prefix (plus opts.uid when given) so this picture can share a
// page with the others.

const GLASSHOUSE = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the garden is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {};
  const id = (n) => `g${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILLS = { spring: ['#b6d2ad', '#9fc392'], summer: ['#a9cf98', '#8fc27b'], autumn: ['#d4c08e', '#c6aa6c'], winter: ['#e6edf2', '#dbe4ea'] };
  const GRASS = {
    spring: ['#8fbf6a', '#79ad57', '#a6cf7f'], summer: ['#86bb5e', '#70a64c', '#9fcb72'],
    autumn: ['#bdb06c', '#a59858', '#cfc282'], winter: ['#e9eff4', '#d9e3ea', '#f5f8fb'],
  };
  const CANOPY = { spring: ['#6f9d5c', '#7aa866'], summer: ['#5f9a4c', '#6aa858'], autumn: ['#d9822b', '#c9692f'], winter: null };
  const TALL = { spring: ['#6a9846', '#4f8034', '#88b35c'], summer: ['#5f9440', '#47782e', '#7fae52'], autumn: ['#a5975a', '#857842', '#c2b274'], winter: ['#b9bca6', '#9a9c86', '#d9dccb'] };
  // the apple trees through the year: leaves, then blossom or fruit
  const APPLE = {
    spring: { leaf: ['#93c26c', '#a9d082', '#7fb35c'], dots: ['#fbe0ea', '#f7c3d6', '#ffffff'] },
    summer: { leaf: ['#5f9a4c', '#6aa858', '#4f8a3c'], dots: ['#a8c85a', '#d9534f', '#c8d65a'] },
    autumn: { leaf: ['#8a9a3c', '#a99a3a', '#7a8a34'], dots: ['#d9483b', '#e2574c', '#c9302c'] },
    winter: null,
  };

  // ---------------------------------------------------------------- shapes
  // the glasshouse: two low wings and a tall middle with a gable
  const GL = 'M118 276 V242 L160 226 V222 L200 166 L240 222 V226 L282 242 V276Z';
  const DOOR_D = 'M188 298 V240 A12 12 0 0 1 212 240 V298Z';
  const PATH_D = 'M188 298 L212 298 L250 540 L150 540Z';
  const ORCH_D = 'M0 294 Q34 286 72 290 Q112 292 140 300 Q150 340 146 372 Q151 388 140 396 Q96 404 60 398 Q28 394 0 400Z';
  const BORDERS = [[58, 114], [286, 400]];
  const TREES = [[36, 374, 30], [108, 366, 25]];
  const BEDS = [{ x0: 20, x1: 128, y: 404, h: 20, fh: 11 }, { x0: 12, x1: 136, y: 448, h: 22, fh: 13 }];
  // the cutting garden: four by four squares, a little wider at the front
  const CUT = { y0: 420, y1: 484, l0: 252, r0: 312, l1: 248, r1: 316 };
  // which flower grows in each square: every row and every column has one of each
  const LATIN = [[0, 1, 2, 3], [2, 3, 0, 1], [3, 2, 1, 0], [1, 0, 3, 2]];
  const POND = { x: 358, y: 498, rx: 40, ry: 16 };

  // little css of our own: swaying flowers, a fountain, bees and a robin
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .gh-sway{animation:ghsway 4.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes ghsway{from{transform:rotate(-2deg)}to{transform:rotate(2.4deg)}}
      #scene .gh-bob{animation:ghbob 3.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes ghbob{from{transform:translate(-.8px,0) rotate(-3deg)}to{transform:translate(.8px,-.4px) rotate(3deg)}}
      #scene .gh-drop{animation:ghdrop 1.4s ease-in infinite;transform-box:fill-box}
      @keyframes ghdrop{0%{transform:translateY(-2px);opacity:0}25%{opacity:.95}100%{transform:translateY(6px);opacity:0}}
      #scene .gh-flit{animation:ghflit 5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes ghflit{0%{transform:translate(0,0)}35%{transform:translate(6px,-5px)}70%{transform:translate(-4px,-8px)}100%{transform:translate(3px,2px)}}
      #scene .gh-wing{animation:ghwing .32s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes ghwing{to{transform:scaleX(.3)}}
      #scene .gh-hop{animation:ghhop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes ghhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .gh-tail{animation:ghtail 6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes ghtail{0%,70%,100%{transform:rotate(0)}80%{transform:rotate(3deg)}90%{transform:rotate(-2deg)}}
      #scene .gh-glint{animation:ghglint 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes ghglint{0%,100%{opacity:.2;transform:scale(.5)}50%{opacity:1;transform:scale(1.1)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      grass: GRASS[SEASON].map((c) => (winter() ? c : U.mix(c, '#a3a07c', k))),
      brick: U.mix('#bf6a4c', '#9a8a7c', k * 1.2),
      stone: U.mix('#e2d6bf', '#b3aa9a', k),
    };
  }

  function defs(st) {
    const g = K.grass, T = TALL[SEASON], b = K.brick, ob = U.mix(b, '#8a8476', 0.45);
    const shed = st.shed ? K.C.pottingShed : U.mix(K.C.pottingShed, '#a59e90', 0.62);
    const dand = winter() ? '<ellipse cx="12" cy="10" rx="6" ry="2" fill="#fff" opacity="0.85"/><ellipse cx="34" cy="28" rx="7" ry="2.2" fill="#fff" opacity="0.75"/>'
      : SEASON === 'autumn' ? '<circle cx="8" cy="9" r="1.8" fill="#ece6d4"/><circle cx="31" cy="27" r="1.6" fill="#ece6d4"/>'
        : '<circle cx="8" cy="9" r="1.8" fill="#f3cf3a"/><circle cx="31" cy="27" r="1.6" fill="#f3cf3a"/><circle cx="22" cy="6" r="1.4" fill="#fff"/>';
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#ead9c0'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <pattern id="${id('Tall')}" width="14" height="12" patternUnits="userSpaceOnUse">
        <rect width="14" height="12" fill="${T[0]}"/>
        <path d="M2 12 Q3 6 1 2 M5 12 Q6 7 7 3 M9 12 Q8 6 10 1 M12 12 Q13 8 12 4" stroke="${T[1]}" stroke-width="1.2" fill="none"/>
        <path d="M3.5 12 Q5 8 4 5 M10.5 12 Q11 9 13 6" stroke="${T[2]}" stroke-width="1" fill="none"/>
      </pattern>
      <pattern id="${id('Dand')}" width="46" height="38" patternUnits="userSpaceOnUse">${dand}</pattern>
      <pattern id="${id('Mow')}" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
        <rect width="18" height="18" fill="${g[0]}"/><rect width="9" height="18" fill="${g[2]}" opacity="0.55"/>
      </pattern>
      <pattern id="${id('Moss')}" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#8d9466"/>
        <circle cx="4" cy="5" r="3" fill="#6f8a3e"/><circle cx="12" cy="11" r="3.5" fill="#748f42"/><circle cx="11" cy="3" r="1.5" fill="#a5a86c"/>
      </pattern>
      <pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>
      <pattern id="${id('Brick')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(b, false)}</pattern>
      <pattern id="${id('BrickOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(ob, true)}</pattern>
      <pattern id="${id('Laid')}" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#e2d3b8"/>
        <rect x="0.5" y="0.5" width="7" height="3.2" rx="0.5" fill="#c98f73"/><rect x="0.5" y="4.3" width="7" height="3.2" rx="0.5" fill="#bf8468"/>
        <rect x="8.5" y="0.5" width="3.2" height="7" rx="0.5" fill="#d19a7d"/><rect x="12.3" y="0.5" width="3.2" height="7" rx="0.5" fill="#c48a6e"/>
        <rect x="0.5" y="8.5" width="3.2" height="7" rx="0.5" fill="#c48a6e"/><rect x="4.3" y="8.5" width="3.2" height="7" rx="0.5" fill="#d19a7d"/>
        <rect x="8.5" y="8.5" width="7" height="3.2" rx="0.5" fill="#bf8468"/><rect x="8.5" y="12.3" width="7" height="3.2" rx="0.5" fill="#c98f73"/>
      </pattern>
      <pattern id="${id('Shingle')}" width="10" height="7" patternUnits="userSpaceOnUse">
        <rect width="10" height="7" fill="#5f6b63"/><path d="M0 6.6 H10 M5 0 V6.6" stroke="#47514a" stroke-width="0.7"/><rect x="0.6" y="0.6" width="3.6" height="1.2" fill="#fff" opacity="0.1"/>
      </pattern>
      <pattern id="${id('Soil')}" width="14" height="10" patternUnits="userSpaceOnUse">
        <rect width="14" height="10" fill="#6b4a34"/><circle cx="3" cy="3" r="0.8" fill="#8a6448"/><circle cx="10" cy="7" r="0.9" fill="#563a28"/><circle cx="8" cy="2" r="0.6" fill="#8a6448"/>
      </pattern>
      <pattern id="${id('Dry')}" width="18" height="12" patternUnits="userSpaceOnUse">
        <rect width="18" height="12" fill="#9a8466"/><path d="M2 3 l4 2 l2 -1 M10 8 l3 1 l3 -2" stroke="#7a6650" stroke-width="0.6" fill="none"/><circle cx="14" cy="3" r="0.8" fill="#b29c7c"/>
      </pattern>
      <pattern id="${id('Clad')}" width="40" height="6" patternUnits="userSpaceOnUse">
        <rect width="40" height="6" fill="${shed}"/><rect y="5.2" width="40" height="0.8" fill="${U.shade(shed, -0.3)}"/><rect width="40" height="0.8" fill="#fff" opacity="0.2"/>
      </pattern>
      <linearGradient id="${id('Inside')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef6e2"/><stop offset="1" stop-color="#cfe4c2"/></linearGradient>
      <linearGradient id="${id('InsideOld')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfc8ae"/><stop offset="1" stop-color="#a39b80"/></linearGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa38a"/><stop offset="0.7" stop-color="#7d8a62"/><stop offset="1" stop-color="#5f6e44"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('PondG')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0e0"/><stop offset="1" stop-color="#4f9bb3"/></linearGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="${id('GlassClip')}"><path d="${GL}"/></clipPath>
    </defs>`;
  }

  // --------------------------------------------------------- sky and hills
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect width="400" height="270" fill="${url('Sky')}"/>
    <circle cx="338" cy="58" r="46" fill="${url('Sun')}"/><circle cx="338" cy="58" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="64" cy="62" rx="25" ry="10"/><ellipse cx="83" cy="55" rx="17" ry="12"/><ellipse cx="101" cy="63" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="218" cy="102" rx="19" ry="7"/><ellipse cx="233" cy="97" rx="13" ry="9"/><ellipse cx="247" cy="103" rx="14" ry="6"/></g>`;
  }
  function bgTree(x, y, r, which) {
    if (!CANOPY[SEASON]) {
      return `<g stroke="#7a6252" stroke-linecap="round" fill="none"><path d="M${x} ${f1(y + r * 0.9)} V${f1(y - r * 0.4)}" stroke-width="2.6"/>
        <path d="M${x} ${y} l${f1(-r * 0.4)} ${f1(-r * 0.4)} M${x} ${f1(y - r * 0.15)} l${f1(r * 0.45)} ${f1(-r * 0.35)}" stroke-width="1.4"/></g>`;
    }
    const col = CANOPY[SEASON][which];
    return `<g><rect x="${x - 2}" y="${y}" width="4" height="${f1(r * 0.9)}" fill="#6b5240"/>${dot(x, y - r * 0.15, r * 0.62, col)}${dot(x - r * 0.35, y + r * 0.1, r * 0.45, col)}${dot(x + r * 0.35, y + r * 0.08, r * 0.48, U.shade(col, -0.1))}${dot(x - r * 0.15, y - r * 0.35, r * 0.3, U.shade(col, 0.15))}</g>`;
  }
  // beyond the wall: hills, trees and a church spire far off
  function far() {
    const H = HILLS[SEASON];
    let s = `<path d="M0 180 Q70 154 150 168 T300 152 T400 164 V200 H0Z" fill="${H[0]}"/>`;
    s += `<rect x="222" y="160" width="14" height="16" fill="#c9c1b4"/><path d="M226 160 L229 132 L232 160Z" fill="#a7a197"/><rect x="226" y="164" width="6" height="7" fill="#9a9389"/>`;
    s += bgTree(18, 170, 18, 0) + bgTree(56, 164, 14, 1) + bgTree(268, 156, 16, 0) + bgTree(304, 160, 12, 1) + bgTree(380, 162, 20, 0);
    s += `<path d="M-10 198 C60 180 140 176 210 184 C280 190 340 178 410 188 V200 H-10Z" fill="${H[1]}"/>`;
    return s;
  }

  // ------------------------------------------------------------- the wall
  // a pear tree trained flat against the warm bricks
  function espalier(x, base) {
    let s = line(`M${x} ${base} V206`, '#7a5a42', 2.4);
    const tiers = [242, 228, 214];
    for (const y of tiers) s += line(`M${x} ${y} Q${x - 12} ${y - 2} ${x - 24} ${y}`, '#7a5a42', 1.4) + line(`M${x} ${y} Q${x + 12} ${y - 2} ${x + 24} ${y}`, '#7a5a42', 1.4);
    if (winter()) return s + tiers.map((y) => line(`M${x - 24} ${y - 1.4} Q${x - 12} ${y - 3.4} ${x} ${y - 1.4} Q${x + 12} ${y - 3.4} ${x + 24} ${y - 1.4}`, SNOW, 1.2)).join('');
    const leaf = SEASON === 'autumn' ? ['#c9a03a', '#b9852f'] : ['#6aa04c', '#7fb35c'];
    for (const y of tiers) {
      for (let d = -21; d <= 21; d += 6) {
        if (!d) continue;
        s += oval(x + d, y - 2.2, 2.4, 1.3, leaf[(d + 30) % 2]) + oval(x + d + 2, y + 1.6, 2, 1.1, leaf[(d + 31) % 2]);
      }
      if (SEASON === 'spring') for (const d of [-16, -4, 10, 19]) s += dot(x + d, y - 3, 1.4, '#ffffff') + dot(x + d + 0.6, y - 3.4, 0.6, '#f7c3d6');
      if (SEASON === 'summer' || SEASON === 'autumn') for (const d of [-14, 8, 17]) s += `<path d="M${x + d} ${y + 1} q-2.2 3.6 0 5.4 q2.2 -1.8 0 -5.4Z" fill="${SEASON === 'autumn' ? '#d9b444' : '#b9cf5a'}"/>`;
    }
    return s;
  }
  function wall(st) {
    const p = pend(st, 'wall'), ok = st.wall;
    let s = `<g data-part="wall"><rect x="0" y="198" width="400" height="64" fill="${ok ? url('Brick') : url('BrickOld')}"/>`;
    if (ok) s += espalier(318, 256) + espalier(372, 256);
    else {
      // bricks fallen out, cracks, and ivy over the top
      for (const [x, y] of [[64, 210], [88, 228], [76, 240], [296, 214], [334, 232], [368, 206], [384, 240], [312, 246]]) s += `<rect x="${x}" y="${y}" width="10.4" height="4.6" fill="#4d3a30"/><rect x="${x}" y="${y}" width="10.4" height="1.2" fill="#000" opacity="0.25"/>`;
      s += line('M100 204 l-4 9 l3 7 l-5 10 M348 210 l3 8 l-4 6 l2 9 M300 226 l-6 8', '#5a4a40', 0.9, 0.8);
      const r = U.rng(23);
      for (const [x0, x1] of [[56, 114], [288, 400]]) {
        for (let i = 0; i < 9; i++) {
          const x = x0 + r() * (x1 - x0), len = 14 + r() * 26;
          s += line(`M${f1(x)} 196 q${f1((r() - 0.5) * 10)} ${f1(len * 0.5)} ${f1((r() - 0.5) * 6)} ${f1(len)}`, '#4f6b34', 1);
          for (let k = 0; k < 5; k++) s += oval(x + (r() - 0.5) * 8, 198 + r() * len, 2.4, 1.6, U.pick(r, ['#3f6b34', '#4f7f3c', '#5d8a44']));
        }
      }
    }
    // the coping stones along the top, one of them knocked askew
    for (let x = -4, i = 0; x < 404; x += 26, i++) {
      if (!ok && i === 14) { s += `<g transform="rotate(8 ${x + 12} 195)"><rect x="${x + 1}" y="190" width="24" height="8" rx="1.6" fill="#aaa190"/></g>`; continue; }
      s += `<rect x="${x}" y="191" width="25.4" height="8" rx="1.6" fill="${ok ? K.stone : '#aaa190'}"/><path d="M${x + 1} 192.6 H${x + 24}" stroke="#fff" stroke-width="0.8" opacity="0.35"/>`;
    }
    s += '<rect x="0" y="199" width="400" height="2.4" fill="#000" opacity="0.1"/><rect x="0" y="256" width="400" height="6" fill="#000" opacity="0.07"/>';
    if (p === 'grow') {
      s += '<rect x="0" y="198" width="400" height="64" fill="#6f8a3e" opacity="0.18"/>';
      s += line('M70 196 q4 14 -2 30 M330 196 q-5 12 1 26 M380 196 q3 10 -2 18', '#4f6b34', 1.2);
    } else if (p === 'frost') s += `<rect x="0" y="198" width="400" height="64" fill="${url('Frost')}" opacity="0.4"/>`;
    else if (p === 'leaves') s += `<rect x="0" y="246" width="400" height="16" fill="${url('Leaves')}"/>`;
    if (winter() || p === 'snow') s += `<path d="M-4 192 Q22 185 48 191 Q74 186 100 191 Q126 185 152 191 Q178 186 204 191 Q230 185 256 191 Q282 186 308 191 Q334 185 360 191 Q384 186 404 191 V195 H-4Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  // the arched door in the wall, through to the rest of the world
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const c = ok ? C.gardenDoor : U.mix(C.gardenDoor, '#a59e90', 0.62), dk = U.shade(c, -0.28);
    const D = 'M13 262 V226 A19 19 0 0 1 51 226 V262Z';
    let s = `<g data-part="door"><path d="M7 262 V225 A25 25 0 0 1 57 225 V262Z" fill="${U.shade(K.brick, -0.18)}"/>
      <path d="M9 225 A23 23 0 0 1 55 225" stroke="${K.stone}" stroke-width="3" fill="none"/><rect x="29" y="199.6" width="6" height="6" rx="1" fill="${K.stone}"/>
      <path d="${D}" fill="${c}"/>`;
    // the planks, and the battens that hold them
    for (const x of [19.4, 25.8, 32.2, 38.6, 45]) { const top = 226 - Math.sqrt(Math.max(0, 361 - (x - 32) * (x - 32))); s += `<path d="M${x} ${f1(top + 0.6)} V262" stroke="${dk}" stroke-width="0.8"/>`; }
    s += `<rect x="13" y="232" width="38" height="3.2" fill="${dk}"/><rect x="13" y="251" width="38" height="3.2" fill="${dk}"/>
      <circle cx="44" cy="243" r="2.6" fill="none" stroke="${ok ? '#e9c35a' : '#77705f'}" stroke-width="1.2"/>${dot(44, 240.4, 1, ok ? '#e9c35a' : '#77705f')}`;
    if (!ok) {
      s += `${oval(22, 244, 4, 2.6, '#d8cfbf', 0.75)}${oval(38, 222, 3.4, 2, '#d8cfbf', 0.7)}${oval(30, 257, 5, 1.8, '#d8cfbf', 0.6)}
        <path d="M50.6 214 V262" stroke="#2d241e" stroke-width="1.6"/>`;
      const r = U.rng(19);
      for (let i = 0; i < 16; i++) { const a = Math.PI + (i / 15) * Math.PI; s += oval(32 + Math.cos(a) * (20 + r() * 4), 226 + Math.sin(a) * (20 + r() * 4), 2.6, 1.7, U.pick(r, ['#3f6b34', '#4f7f3c', '#5d8a44'])); }
      s += line('M14 226 q6 10 2 22 M50 222 q-4 8 0 16', '#4f6b34', 1);
    }
    if (p === 'grow') s += `<path d="${D}" fill="${FADE}" opacity="0.5"/>`;
    s += `<rect x="5" y="261" width="54" height="6" rx="1.6" fill="${K.stone}"/><rect x="5" y="265" width="54" height="2" fill="#000" opacity="0.08"/>`;
    if (winter() || p === 'snow') s += `<path d="M7 224 A25 25 0 0 1 57 224" stroke="${SNOW}" stroke-width="3.2" fill="none" stroke-linecap="round"/><rect x="5" y="259.6" width="54" height="2.6" rx="1.3" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  function ground() {
    const g = K.grass, r = U.rng(41);
    let s = `<rect x="0" y="258" width="400" height="282" fill="${g[0]}"/>`;
    for (let i = 0; i < 22; i++) s += oval(r() * 400, 300 + r() * 230, 10 + r() * 22, 3 + r() * 4, r() < 0.5 ? g[1] : g[2], 0.5);
    // gravel along the front of the glasshouse
    s += `<path d="M106 294 H294 L300 310 H100Z" fill="${winter() ? '#e9eef2' : '#d9ccb2'}"/>`;
    const q = U.rng(43);
    if (!winter()) for (let i = 0; i < 40; i++) s += dot(104 + q() * 192, 297 + q() * 11, 0.7, U.pick(q, ['#c4b597', '#e8dcc4', '#b3a487']));
    return s;
  }

  // ------------------------------------------------------------ the border
  // a little flower: round petals around an eye
  function bloom(x, y, r, col, eye = '#f2c230', n = 5) {
    let s = '';
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; s += dot(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, col); }
    return s + dot(x, y, r * 0.36, eye);
  }
  // a spire of florets up a stem: delphiniums, foxgloves, lavender
  function spire(x, base, h, col, w = 2.2) {
    let s = line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, '#5f8a3a', 1);
    const n = Math.max(3, Math.round(h * 0.3));
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), y = base - h * (0.38 + 0.62 * t);
      s += oval(x + (i % 2 ? 0.5 : -0.5), y, w * (1 - t * 0.55), 1.4, i % 3 === 2 ? U.shade(col, 0.25) : col);
    }
    return s;
  }
  const tulip = (x, y, col) => `<path d="M${f1(x - 2.3)} ${f1(y - 3.4)} q0 3.6 2.3 3.8 q2.3 -0.2 2.3 -3.8 l-1.15 1.3 l-1.15 -1.8 l-1.15 1.8Z" fill="${col}"/>`;
  function plant(kind, x, base, h, col, r) {
    const top = base - h, leaf = '#5f8a3a';
    switch (kind) {
      case 'ball': return line(`M${f1(x)} ${f1(base)} V${f1(top)}`, leaf, 0.9) + dot(x, top, 3, col) + dot(x - 0.9, top - 0.9, 1.2, U.shade(col, 0.3));
      case 'tulip': return line(`M${f1(x)} ${f1(base)} V${f1(top)}`, leaf, 0.9) + oval(x - 1.6, base - h * 0.35, 1.2, 3, '#6f9a44') + tulip(x, top + 1, col);
      case 'dots': return [[-2, 0], [1.4, -1.6], [2.4, 1], [-0.6, -2.8], [0, 1.4]].map(([dx, dy]) => dot(x + dx, base - 2 + dy, 1, col)).join('') + dot(x + 0.4, base - 2.4, 0.4, '#f2e27a');
      case 'prim': return oval(x, base - 1, 3.4, 1.6, '#6f9a44') + bloom(x - 1.4, base - 2.6, 2.6, col, '#e9a23c') + bloom(x + 1.8, base - 3, 2.2, col, '#e9a23c');
      case 'spire': return spire(x, base, h, col, 2.4);
      case 'holly': {
        let s = line(`M${f1(x)} ${f1(base)} V${f1(top)}`, leaf, 1.1);
        for (let k = 0; k < 4; k++) s += bloom(x + (k % 2 ? 1.6 : -1.6), top + 3 + k * 4.2, 3.2 - k * 0.3, col, '#c9586e');
        return s;
      }
      case 'rose': return dot(x, base - 3, 4, '#4f8a3c') + dot(x + 2.4, base - 4.6, 2.6, '#5d9644') + dot(x - 1.6, base - 5.4, 1.8, col) + dot(x + 2, base - 6, 1.7, col) + dot(x + 0.4, base - 2.6, 1.6, U.shade(col, 0.2));
      case 'daisy': return line(`M${f1(x)} ${f1(base)} V${f1(top)}`, leaf, 0.8) + bloom(x, top, 3, col, '#f2c230', 7);
      case 'spire2': return [-1.6, 0, 1.6].map((dx) => spire(x + dx, base, h * (dx ? 0.8 : 1), col, 1.1)).join('');
      case 'aster': return dot(x, base - 3.4, 4, '#5d8a44') + [[-2, -5], [1.6, -6], [2.6, -3], [-2.6, -2.4], [0, -2]].map(([dx, dy]) => bloom(x + dx, base + dy, 1.8, col, '#f2c230')).join('');
      case 'rud': return line(`M${f1(x)} ${f1(base)} V${f1(top)}`, leaf, 0.9) + bloom(x, top, 3.4, col, '#3a2a1e', 8);
      case 'sedum': return line(`M${f1(x - 1)} ${f1(base)} V${f1(top + 2)} M${f1(x + 1)} ${f1(base)} V${f1(top + 2)}`, '#7fa05a', 1.4) + oval(x, top + 1.4, 4, 2, col) + oval(x, top + 0.8, 3, 1.2, U.shade(col, 0.2));
      case 'grass': return line(`M${f1(x)} ${f1(base)} q-3 ${f1(-h * 0.6)} -6 ${f1(-h * 0.8)} M${f1(x)} ${f1(base)} q0 ${f1(-h * 0.7)} 1 ${f1(-h)} M${f1(x)} ${f1(base)} q3 ${f1(-h * 0.6)} 6 ${f1(-h * 0.8)}`, col, 0.9);
      case 'seed': return line(`M${f1(x)} ${f1(base)} V${f1(top)} M${f1(x)} ${f1(top + h * 0.3)} l3 -3`, '#8a7a5a', 0.9) + dot(x, top, 1.8, col) + dot(x + 3, top + h * 0.3 - 3, 1.3, col) + (winter() ? oval(x, top - 1.4, 2, 0.8, SNOW) : '');
      case 'box': return dot(x, base - 3.2, 4, col) + dot(x - 1.2, base - 4.4, 1.6, U.shade(col, 0.15)) + (winter() ? oval(x, base - 6, 3, 1.2, SNOW) : '');
      default: return '';
    }
  }
  // what grows in the border, back row to front, through the year
  const BLOOMS = {
    spring: { back: [['ball', '#a98bd6'], ['tulip', '#e2574c'], ['ball', '#8a6fc4']], mid: [['tulip', '#f2c230'], ['tulip', '#ef8aa6'], ['tulip', '#ffffff']], front: [['dots', '#7fa7e6'], ['prim', '#f7e27a']] },
    summer: { back: [['spire', '#5d7fd8'], ['holly', '#ef8aa6'], ['spire', '#d76fa0'], ['holly', '#fbf3f5']], mid: [['rose', '#f5b3c4'], ['daisy', '#ffffff'], ['rose', '#e2574c']], front: [['spire2', '#9b7fd1'], ['daisy', '#ffffff']] },
    autumn: { back: [['aster', '#9b7fd1'], ['rud', '#f2b63a'], ['aster', '#c48ad9']], mid: [['sedum', '#c9586e'], ['rud', '#e9962c']], front: [['grass', '#d8c27a'], ['sedum', '#b4485e']] },
    winter: { back: [['seed', '#6b5a44'], ['grass', '#cbb98c']], mid: [['seed', '#7a6650'], ['box', '#3f6b4a']], front: [['box', '#3f6b4a']] },
  };
  // nettles, docks and dead stalks, in the colours of the season
  function weed(x, base, h, r) {
    const dead = winter() || SEASON === 'autumn';
    const c = dead ? U.pick(r, ['#8a7a5a', '#9a8a64', '#75684c']) : U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']);
    const k = r();
    if (k < 0.4) return line(`M${f1(x)} ${f1(base)} l-3 ${f1(-h * 0.7)} M${f1(x)} ${f1(base)} l1 ${f1(-h)} M${f1(x)} ${f1(base)} l3.4 ${f1(-h * 0.6)}`, c, 1.2);
    if (k < 0.7) return oval(x - 2.4, base - h * 0.3, 1.8, h * 0.35, c) + oval(x + 2.2, base - h * 0.25, 1.6, h * 0.3, U.shade(c, -0.1)) + line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, c, 0.9);
    return line(`M${f1(x)} ${f1(base)} q${f1(-h * 0.4)} ${f1(-h)} ${f1(-h * 0.9)} ${f1(-h * 0.5)} M${f1(x)} ${f1(base)} q${f1(h * 0.5)} ${f1(-h * 0.9)} ${f1(h)} ${f1(-h * 0.4)}`, dead ? '#7a5a4a' : '#6a4a3a', 1) + (dead ? '' : dot(x - h * 0.6, base - h * 0.7, 1, '#3a2a40'));
  }
  function border(st) {
    const p = pend(st, 'border'), ok = st.border && p !== 'grow', some = st.border && p === 'grow';
    let s = '';
    BORDERS.forEach(([x0, x1], k) => {
      const mid = f1((x0 + x1) / 2), d = `M${x0} 250 H${x1} V281 Q${mid} 287 ${x0} 281Z`;
      const r = U.rng(310 + k * 7);
      s += `<g data-part="border"><path d="${d}" fill="${st.border ? url('Soil') : url('Dry')}"/>`;
      if (winter() || p === 'snow') s += `<path d="${d}" fill="${url('Snow')}" opacity="0.9"/>`;
      for (const [row, base] of [['back', 259], ['mid', 270], ['front', 280]]) {
        for (let x = x0 + 3 + r() * 3; x < x1 - 2; x += 5.6 + r() * 3.2) {
          const h = (row === 'back' ? 24 : row === 'mid' ? 13 : 6) * (0.8 + r() * 0.4), y = base + (r() - 0.5) * 2;
          if (ok || (some && r() < 0.5)) { const set = BLOOMS[SEASON][row], [kind, col] = set[(r() * set.length) | 0]; s += plant(kind, x, y, h, col, r); }
          else s += weed(x, y, h * 0.85, r);
        }
      }
      if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}" opacity="0.85"/>`;
      else if (p === 'frost') s += `<path d="${d}" fill="${url('Frost')}" opacity="0.45"/>`;
      // a low edging of stones along the front
      s += line(`M${x0} 281 Q${mid} 287 ${x1} 281`, st.border ? '#d3c8b2' : '#9a917f', 2.6);
      s += '</g>';
    });
    return s;
  }

  // ------------------------------------------------------- the glasshouse
  // tomatoes up canes in the left wing, a palm under the gable, geraniums and
  // a lemon tree on the staging in the right wing, a vine along the roof
  function inside(st, decor) {
    const p = pend(st, 'hose'), ok = st.hose && p !== 'grow', thirsty = st.hose && p === 'grow';
    const green = (c) => (thirsty ? U.mix(c, '#c9b77a', 0.45) : c);
    let s = `<g data-part="hose"><rect x="114" y="160" width="172" height="120" fill="${st.hose ? url('Inside') : url('InsideOld')}"/>`;
    // the staging along the right wing and the shelf at the back
    s += `<rect x="242" y="257" width="40" height="3" fill="#8a6142"/><path d="M246 260 V276 M278 260 V276" stroke="#6b4a32" stroke-width="1.6"/>
      <rect x="164" y="248" width="72" height="2.4" fill="#9a7452"/>`;
    if (st.hose) {
      // the vine under the roof
      s += line('M163 224 L200 172 L237 224', green('#6b5a3a'), 1.2);
      for (let t = 0.12; t < 1; t += 0.11) {
        const x = 163 + 74 * t, y = t < 0.5 ? 224 - 104 * t : 172 + 104 * (t - 0.5);
        s += oval(x, y + 3, 3.2, 2.2, green(t * 10 % 2 < 1 ? '#5d9644' : '#6aa04c'));
        if ((SEASON === 'summer' || SEASON === 'autumn') && ok && Math.round(t * 100) % 3 === 0) s += [[0, 6], [-1.4, 7.8], [1.4, 7.8], [0, 9.6]].map(([dx, dy]) => dot(x + dx, y + dy, 1.2, '#6a4a8a')).join('');
      }
      // tomatoes
      for (const x of [127, 139, 151]) {
        const top = 276 - (x - 112) * 0.2 - 22;
        s += line(`M${x} 276 V${f1(top)}`, '#b9a07a', 0.9) + line(`M${x} 276 q-2 -10 0 -20 q2 -8 0 -${f1(276 - top - 20)}`, green('#4f8a3c'), 1.2);
        for (let k = 0; k < 4; k++) s += oval(x + (k % 2 ? 3 : -3), 270 - k * 7, 3, 1.8, green(k % 2 ? '#5d9644' : '#6aa04c'));
        if (ok && (SEASON === 'summer' || SEASON === 'autumn')) s += dot(x + 2.4, 262, 2, '#d9483b') + dot(x - 2.2, 255, 1.8, '#e2574c') + dot(x + 1.8, 248, 1.6, SEASON === 'summer' ? '#9cc85a' : '#d9483b');
        else if (ok && SEASON === 'spring') s += dot(x + 2, 258, 1, '#f2d84a') + dot(x - 2, 251, 1, '#f2d84a');
      }
      // the palm, its fronds spreading under the gable
      s += `<path d="M200 276 Q198 236 200 200" stroke="${green('#8a6a48')}" stroke-width="3" fill="none"/>`;
      for (const [dx, dy] of [[-26, 6], [-20, -10], [-8, -20], [8, -20], [20, -10], [26, 6], [0, -24]]) {
        s += `<path d="M200 200 Q${200 + dx * 0.5} ${200 + dy - 8} ${200 + dx} ${200 + dy}" stroke="${green(ok ? '#4f8a3c' : '#7a8a4a')}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
        s += `<path d="M${f1(200 + dx * 0.4)} ${f1(200 + dy * 0.4 - 4)} l${f1(dx * 0.15)} 4 M${f1(200 + dx * 0.7)} ${f1(200 + dy * 0.7 - 3)} l${f1(dx * 0.12)} 4" stroke="${green('#6aa04c')}" stroke-width="1.2"/>`;
      }
      // hanging baskets
      for (const x of [174, 226]) {
        s += line(`M${x} 214 l-4 10 M${x} 214 l4 10`, '#8a7a62', 0.6) + `<path d="M${x - 6} 224 h12 q-1 6 -6 6 q-5 0 -6 -6Z" fill="#a8743c"/>`;
        s += oval(x, 224, 7, 2.6, green('#5d9644')) + (ok && !winter() ? dot(x - 4, 229, 1.6, '#e26b9a') + dot(x + 3.6, 231, 1.5, '#b04a8a') + dot(x - 1, 232, 1.4, '#e26b9a') : '');
      }
      // pots of geraniums on the staging, and the lemon tree
      for (const [x, col] of [[248, '#d9483b'], [260, '#ef8aa6'], [272, '#ffffff']]) {
        s += `<path d="M${x - 4} 251 h8 l-1 6 h-6Z" fill="#c9764a"/>` + dot(x, 248, 4, green('#5d9644'));
        if (ok || thirsty) s += dot(x - 1.6, 245.6, 1.8, col) + dot(x + 1.8, 246, 1.6, col) + dot(x, 244, 1.5, U.shade(col, 0.2));
      }
      s += line('M262 257 V240', '#7a5a42', 1.4) + dot(261, 236, 8, green('#3f7a3c')) + dot(257, 239, 5, green('#4f8a44'));
      if (ok) s += dot(258, 233, 1.7, '#f2d84a') + dot(265, 238, 1.7, '#f2d84a') + dot(256, 240, 1.6, '#f2d84a');
    } else {
      // everything has dried up: dead canes, a palm gone brown, broken pots
      for (const [x, a] of [[127, -12], [139, 6], [151, -4]]) s += `<g transform="rotate(${a} ${x} 276)">${line(`M${x} 276 V244`, '#a08a6a', 1)}${line(`M${x} 270 l-4 -3 M${x} 260 l4 -4 M${x} 252 l-3 -3`, '#8a6a48', 1)}</g>`;
      s += `<path d="M200 276 Q198 240 201 214" stroke="#8a7458" stroke-width="2.6" fill="none"/>`;
      for (const [dx, dy] of [[-22, 18], [-14, 22], [12, 22], [22, 16], [-4, 24]]) s += `<path d="M201 214 Q${201 + dx * 0.6} ${214 + dy * 0.2} ${201 + dx} ${214 + dy}" stroke="#a0845a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M244 257 l4 -6 l3 6Z M256 257 h8 l-1 -5 h-6Z" fill="#a8765a"/><path d="M270 257 l3 -5 l5 2 l-1 3Z" fill="#a8765a"/>
        ${line('M262 257 V240 M262 246 l-5 -4 M262 244 l5 -5', '#8a7458', 1.2)}`;
      s += line('M118 242 l10 0 M118 242 l6 6 M118 242 l0 9 M282 242 l-10 0 M282 242 l-6 6 M200 166 l-8 9 M200 166 l8 9 M200 166 l0 11', '#e1ddd5', 0.5, 0.8);
    }
    if (decor['g-lights']) s += lightsInside();
    return s + '</g>';
  }
  // fairy lights along the roof, inside the glass
  const BULBS = (() => {
    const out = [], pts = [[122, 246], [160, 231], [164, 225], [200, 175], [236, 225], [240, 231], [278, 246]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8));
      for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n + 2 + (k % 2) * 1.4]);
    }
    return out;
  })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  function lightsInside() {
    return `<g>${line('M122 248 L160 233 L164 227 L200 177 L236 227 L240 233 L278 248', '#3d3d42', 0.5)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.7" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`;
  }
  // the glass, its white bars and the fancy ironwork along the top
  function panes(st) {
    const p = pend(st, 'panes'), ok = st.panes, clear = ok && !p;
    const frame = ok ? '#fbf7ee' : '#b8b1a2', fdk = ok ? '#d6cfc0' : '#8f897d';
    let s = `<g data-part="panes"${clear ? ' pointer-events="none"' : ''}>`;
    if (!ok) {
      // green with algae, one pane broken out, cracks and streaks
      s += `<path d="${GL} M140 252 h19 v22 h-19Z" fill="${url('Grime')}" fill-rule="evenodd" opacity="0.82"/>
        <path d="M140 252 l5 6 l4 -6 M159 274 l-6 -5 l-3 5 M140 274 l4 -7 l3 7" stroke="#e6ece0" stroke-width="0.8" fill="none" opacity="0.8"/>
        ${line('M246 232 l6 9 l-3 6 l5 8 M172 206 l7 7 l-2 6 M220 230 l-5 8 l4 5', '#eef2e6', 0.8, 0.85)}
        ${line('M126 262 q20 -6 32 2 M172 244 q14 8 30 -2 M244 260 q16 -6 32 4', '#4f5e38', 3, 0.35)}`;
    } else if (p === 'frost') {
      s += `<path d="${GL}" fill="${url('Frost')}" opacity="0.85"/>${line('M122 258 q10 -2 14 -12 M236 238 q12 2 16 -10 M166 214 q10 4 18 -6 M250 268 q10 -4 22 0', '#fff', 1.4)}`;
    } else if (p === 'grow') s += `<path d="${GL}" fill="${url('Dusty')}" opacity="0.5"/>`;
    else if (p === 'snow' || p === 'leaves') s += `<path d="${GL}" fill="#e8f6fb" opacity="0.16"/>`;
    else {
      s += `<path d="${GL}" fill="#e8f6fb" opacity="0.16"/>
        <path d="M132 276 L162 228 H170 L140 276Z M206 276 L238 222 H243 L211 276Z M176 226 L196 192 H200 L180 226Z" fill="#fff" opacity="0.16"/>`;
    }
    // the bars: the wings, the tall middle and its round window
    let bars = '';
    for (const x of [128.5, 139, 149.5]) bars += `M${x} 276 V${f1(242 - ((x - 118) * 16) / 42)} `;
    for (const x of [250.5, 261, 271.5]) bars += `M${x} 276 V${f1(226 + ((x - 240) * 16) / 42)} `;
    for (const x of [173.3, 226.7]) bars += `M${x} 276 V${f1(222 - (Math.min(x, 400 - x) - 160) * 1.4)} `;
    bars += 'M186.7 240 V203.4 M213.3 240 V203.4 M200 228 V205 M200 187 V170 M118 259 H160 M240 259 H282 M160 222 H186 M214 222 H240 M160 250 H186 M214 250 H240 ';
    s += `<path d="${bars}" stroke="${frame}" stroke-width="1.6" fill="none"/>`;
    s += `<circle cx="200" cy="196" r="9" fill="none" stroke="${frame}" stroke-width="2"/><path d="M200 187 V205 M191 196 H209" stroke="${frame}" stroke-width="1"/>`;
    s += `<path d="${GL}" stroke="${frame}" stroke-width="3.2" fill="none" stroke-linejoin="round"/><path d="M160 226 V276 M240 226 V276" stroke="${frame}" stroke-width="2.4"/>`;
    s += `<path d="M118 242 L160 226 M240 226 L282 242 M160 222 L200 166 L240 222" stroke="${fdk}" stroke-width="1" fill="none" transform="translate(0 2.4)"/>`;
    if (!ok) s += `${dot(130, 244, 1.2, '#7a7062')}${dot(166, 212, 1.4, '#7a7062')}${dot(232, 216, 1.2, '#7a7062')}${dot(276, 250, 1.3, '#7a7062')}`;
    // the door, glazed, with an arched top
    s += `<path d="${DOOR_D}" fill="${ok ? '#e8f6fb' : '#7d8a62'}" opacity="${ok ? 0.25 : 0.75}"/><path d="${DOOR_D}" stroke="${frame}" stroke-width="2.4" fill="none"/>
      <path d="M200 228 V298 M188 262 H212" stroke="${frame}" stroke-width="1.4"/>${dot(208, 272, 1.3, ok ? '#e9c35a' : '#77705f')}`;
    // the ironwork cresting and the finials
    const iron = ok ? '#3d4a44' : '#6d6a62';
    let crest = '';
    for (let t = 0.1; t < 0.95; t += 0.16) {
      for (const side of [-1, 1]) { const x = 200 + side * 40 * t, y = 166 + 56 * t; crest += `M${f1(x)} ${f1(y - 1.2)} v-4.4 `; }
    }
    s += `<path d="${crest}" stroke="${iron}" stroke-width="1" fill="none"/>`;
    s += `<path d="M200 166 V154" stroke="${iron}" stroke-width="1.6"/>${dot(200, 152, 2.4, iron)}${dot(200, 159, 1.6, iron)}${dot(118, 239, 1.8, iron)}${dot(282, 239, 1.8, iron)}`;
    if (!ok) s += `<g transform="rotate(-18 166 214)"><path d="M166 214 v-4.4" stroke="${iron}" stroke-width="1"/></g>`;
    // snow lies on the glass roof all winter
    if (winter() || p === 'snow') {
      s += `<path d="M116 241 L160 224 M240 224 L284 241" stroke="${SNOW}" stroke-width="4.4" stroke-linecap="round"/><path d="M158 222 L200 164 L242 222" stroke="${SNOW}" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M120 243 L158 228 L158 233 Q140 238 120 249Z M242 228 L280 243 L280 249 Q262 238 242 233Z" fill="${SNOW}" opacity="0.75"/>`;
    }
    if (p === 'leaves') s += oval(132, 246, 3, 1.6, '#d9822b') + oval(152, 236, 2.8, 1.4, '#c4462f') + oval(250, 236, 3, 1.5, '#e9b23c') + oval(186, 192, 2.6, 1.4, '#d9822b') + oval(268, 244, 2.8, 1.5, '#c4462f');
    return s + '</g>';
  }
  function glasshouse(st, decor) {
    let s = shadow(200, 300, 92, 4.4);
    s += `<g clip-path="${url('GlassClip')}">${inside(st, decor)}</g>`;
    // the tiled floor inside, seen through the lower half of the door
    s += `<rect x="186" y="275" width="28" height="23" fill="${st.hose ? '#d9cbb0' : '#a39b80'}"/><path d="M186 286 H214 M196 275 V298 M205 275 V298" stroke="#000" stroke-width="0.5" opacity="0.12"/>`;
    s += panes(st);
    // the low brick wall it stands on, with a stone sill and a gap for the door
    s += `<path d="M114 276 H186 V298 H114Z M214 276 H286 V298 H214Z" fill="${url('Brick')}"/>
      <path d="M112 273 H187 V277.6 H112Z M213 273 H288 V277.6 H213Z" fill="${K.stone}"/><path d="M114 296 H186 M214 296 H286" stroke="#000" stroke-width="2" opacity="0.08"/>`;
    if (!st.panes) s += `<path d="M114 278 H186 V298 H114Z M214 278 H286 V298 H214Z" fill="${url('Moss')}" opacity="0.4"/>`;
    s += `<rect x="186" y="296" width="28" height="4" rx="1" fill="${K.stone}"/>`;
    if (winter()) s += `<path d="M112 273 H187 M213 273 H288" stroke="${SNOW}" stroke-width="2" stroke-linecap="round"/>`;
    return s;
  }

  // terracotta pots either side of the glasshouse door
  const POTS = [[164, 302, 8.6], [176, 304, 6.6], [224, 304, 6.6], [236, 302, 8.6]];
  function pots(st) {
    const p = pend(st, 'pots'), ok = st.pots && p !== 'grow';
    const FLOWERS = { spring: ['#f2d84a', '#ffffff', '#f2d84a', '#e2574c'], summer: ['#d9483b', '#ef8aa6', '#ffffff', '#d9483b'], autumn: ['#e9962c', '#9a2f4a', '#d9822b', '#c84a3a'], winter: ['#e26b9a', '#ffffff', '#e26b9a', '#d9483b'] };
    let s = '<g data-part="pots">';
    POTS.forEach(([x, y, w], i) => {
      const h = w * 1.35, tipped = !st.pots && i === 1, broken = !st.pots && i === 3;
      if (tipped) {
        s += `${shadow(x + 2, y, w + 3, 1.6)}<g transform="rotate(-78 ${x} ${y - 2})"><path d="M${f1(x - w)} ${f1(y - h)} h${f1(w * 2)} l${f1(-w * 0.25)} ${f1(h)} h${f1(-w * 1.5)}Z" fill="#b5694a"/></g>${oval(x + 9, y - 1, 5, 1.6, '#6b4a34')}`;
        return;
      }
      s += `${shadow(x, y, w + 1.4, 1.6)}`;
      if (broken) {
        s += `<path d="M${f1(x - w * 0.75)} ${y} l-1 ${f1(-h * 0.6)} l4 3 l3 -5 l3 4 l2 -3 l1 ${f1(h * 0.6)}Z" fill="#b5694a"/><path d="M${x + 9} ${y} l3 -3 l3 3Z M${x - 12} ${y} l2 -4 l4 4Z" fill="#a8604a"/>`;
        return;
      }
      s += `<path d="M${f1(x - w)} ${f1(y - h)} h${f1(w * 2)} l${f1(-w * 0.25)} ${f1(h)} h${f1(-w * 1.5)}Z" fill="${ok ? '#c9764a' : '#a8765a'}"/><rect x="${f1(x - w - 1)}" y="${f1(y - h - 2)}" width="${f1(w * 2 + 2)}" height="3" rx="1" fill="${ok ? '#d98b63' : '#b08a74'}"/>`;
      if (ok) {
        const col = FLOWERS[SEASON][i];
        s += dot(x, y - h - 3.4, w * 0.75, '#4f8a3c') + dot(x - w * 0.4, y - h - 4.6, w * 0.45, '#5d9644');
        if (SEASON === 'spring' && i % 2 === 0) s += [-3, 0, 3].map((dx) => line(`M${x + dx} ${f1(y - h - 2)} V${f1(y - h - 10)}`, '#5f8a3a', 0.8) + bloom(x + dx, y - h - 11, 2.6, col, '#e9962c', 6)).join('');
        else s += [[-3, -6], [2.4, -7.4], [0, -9], [3.6, -4], [-4, -3]].map(([dx, dy]) => dot(x + dx * w / 8, y - h + dy * w / 8 - 2, 1.6 * w / 8, col)).join('');
        if (winter()) s += oval(x, y - h - 1.6, w + 0.6, 1.2, SNOW);
      } else if (st.pots) s += dot(x, y - h - 2.6, w * 0.6, '#7a9a4a') + dot(x + 1, y - h - 4, 1.4, U.mix(FLOWERS[SEASON][i], '#cfc6b6', 0.5));
      else s += line(`M${x} ${f1(y - h)} l-2 -6 M${x} ${f1(y - h)} l2 -7 l2 3`, '#8a7a5a', 0.9);
    });
    return s + '</g>';
  }

  // the hose on its reel, and a watering can; a tangle before
  function reel(st) {
    const p = pend(st, 'hose'), ok = st.hose && p !== 'grow';
    let s = '<g data-part="hose">';
    if (st.hose) {
      s += `${shadow(262, 305, 14, 1.8)}<path d="M252 304 L258 286 M272 304 L266 286" stroke="#5b636d" stroke-width="1.8"/>
        ${dot(262, 288, 9.4, '#3f7a44')}<circle cx="262" cy="288" r="7.6" fill="none" stroke="#5d9a54" stroke-width="1.4"/><circle cx="262" cy="288" r="5" fill="none" stroke="#4f8a44" stroke-width="1.4"/>
        ${dot(262, 288, 2.2, '#5b636d')}<path d="M270 292 q6 6 2 12 q-2 3 -6 2" stroke="#3f7a44" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      // a watering can, and a puddle when it has just been used
      s += `${shadow(282, 306, 9, 1.6)}<path d="M276 294 h12 v9 q0 2 -2 2 h-8 q-2 0 -2 -2Z" fill="${ok ? '#6f9a8a' : '#8a9a8f'}"/><path d="M288 296 l7 -6" stroke="${ok ? '#6f9a8a' : '#8a9a8f'}" stroke-width="2" stroke-linecap="round"/>
        <rect x="294" y="287.6" width="3" height="3" rx="1" fill="#5f8a7a"/><path d="M278 294 q4 -6 8 0" stroke="#5f8a7a" stroke-width="1.2" fill="none"/>`;
      if (ok && !winter()) s += oval(296, 304, 4, 1.2, '#9fd3e6', 0.7);
    } else {
      s += `${shadow(262, 304, 18, 2)}`;
      for (const [x, y, rx, ry, a] of [[256, 298, 9, 3.6, -10], [266, 300, 8, 3, 14], [261, 294, 6, 2.6, 30], [270, 296, 7, 2.4, -24]]) s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="none" stroke="#6f7a54" stroke-width="1.8"/>`;
      s += `<path d="M274 300 q8 -2 12 4" stroke="#6f7a54" stroke-width="1.8" fill="none"/>
        <g transform="rotate(-80 286 300)"><path d="M280 294 h12 v9 q0 2 -2 2 h-8 q-2 0 -2 -2Z" fill="#8a8f86"/><path d="M292 296 l6 -5" stroke="#8a8f86" stroke-width="2"/></g>${dot(281, 298, 1.6, '#6d6a62')}`;
    }
    return s + '</g>';
  }

  // ------------------------------------------------------------ the orchard
  function orchard(st) {
    const p = pend(st, 'orchard'), ok = st.orchard && p !== 'grow';
    let s = '<g data-part="orchard">';
    if (!ok) {
      s += `<path d="${ORCH_D}" fill="${url('Tall')}"/><path d="${ORCH_D}" fill="${url('Dand')}"/>`;
      if (winter()) s += `<path d="${ORCH_D}" fill="${url('Snow')}" opacity="0.55"/>`;
    } else if (winter() || p === 'snow') s += `<path d="${ORCH_D}" fill="${url('Snow')}"/>`;
    else {
      s += `<path d="${ORCH_D}" fill="${url('Mow')}"/>`;
      if (p === 'leaves') s += `<path d="${ORCH_D}" fill="${url('Leaves')}"/>`;
      else if (SEASON === 'autumn') s += `<path d="${ORCH_D}" fill="${url('Leaves')}" opacity="0.3"/>`;
      else { const r = U.rng(61); for (let i = 0; i < 14; i++) s += bloom(8 + r() * 130, 306 + r() * 84, 1.6, '#ffffff', '#f2c230', 6); }
    }
    return s + '</g>';
  }
  function trees() {
    let s = '';
    TREES.forEach(([x, base, r], k) => {
      const cy = base - r * 1.85, rnd = U.rng(71 + k);
      s += shadow(x + 4, base + 2, r * 0.95, 3.4);
      s += `<path d="M${x - 5} ${base} C${x - 3} ${f1(base - r * 0.6)} ${x - 7} ${f1(base - r)} ${x - 3} ${f1(cy + r * 0.4)} L${x + 3} ${f1(cy + r * 0.4)} C${x + 7} ${f1(base - r)} ${x + 3} ${f1(base - r * 0.6)} ${x + 5} ${base}Z" fill="#7a5a42"/>
        <path d="M${x - 1} ${f1(base - 4)} q-1.4 -8 0.6 -16" stroke="#5f4532" stroke-width="0.8" fill="none"/>`;
      const A = APPLE[SEASON];
      if (!A) {
        s += line(`M${x} ${f1(cy + r * 0.4)} q-6 -10 -18 -16 M${x} ${f1(cy + r * 0.3)} q2 -14 -2 -26 M${x} ${f1(cy + r * 0.4)} q8 -8 20 -12 M${x - 10} ${f1(cy - 2)} l-6 -8 M${x + 12} ${f1(cy - 2)} l6 -6`, '#7a6252', 1.8);
        s += line(`M${x - 18} ${f1(cy - 13)} q6 3 12 9 M${x + 14} ${f1(cy - 5)} q4 -3 6 -6 M${x - 2} ${f1(cy - 22)} q1 4 0 8`, SNOW, 1.4);
        return;
      }
      const L = A.leaf;
      s += `${dot(x, cy, r * 0.75, L[0])}${dot(x - r * 0.5, cy + r * 0.18, r * 0.55, L[2])}${dot(x + r * 0.52, cy + r * 0.12, r * 0.58, L[0])}${dot(x - r * 0.22, cy - r * 0.45, r * 0.46, L[1])}${dot(x + r * 0.3, cy - r * 0.36, r * 0.42, L[1])}`;
      for (let i = 0; i < 14; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * r * 0.85;
        s += SEASON === 'spring' ? dot(x + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 1.5, U.pick(rnd, A.dots)) : dot(x + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 1.9, U.pick(rnd, A.dots));
      }
      // an old tree, unpruned, has dead twigs sticking out
      if (PCT < 0.5) s += line(`M${f1(x - r * 0.7)} ${f1(cy - r * 0.5)} l-6 -6 M${f1(x + r * 0.6)} ${f1(cy - r * 0.6)} l5 -7 l3 2`, '#8a7a6a', 1.1);
    });
    return s;
  }
  const apple = (x, y, col) => `${dot(x, y, 2.5, col)}<path d="M${f1(x)} ${f1(y - 2.3)} l0.5 -1.5" stroke="#5a3f26" stroke-width="0.6"/>${oval(x + 1.3, y - 2.6, 1.2, 0.6, '#6aa04c')}${dot(x - 0.9, y - 0.9, 0.7, '#fff', 0.4)}`;
  function apples(st) {
    const p = pend(st, 'apples'), ok = st.apples && p !== 'grow';
    const r = U.rng(57);
    let s = '<g data-part="apples">';
    if (!ok) {
      const n = st.apples ? 6 : 16;
      for (let i = 0; i < n; i++) {
        const x = 8 + r() * 136, y = 350 + r() * 42;
        if (st.apples && x > 50 && x < 86) continue;
        s += apple(x, y, U.pick(r, st.apples ? ['#d9483b', '#c9302c'] : ['#d9483b', '#c9302c', '#9c4a2a', '#b58a3a', '#8a5a2a']));
      }
    }
    if (st.apples) {
      // a basket full, under the trees
      s += `${shadow(68, 395, 17, 2)}<path d="M56 380 Q68 362 80 380" stroke="#a8743c" stroke-width="1.8" fill="none"/>`;
      if (!winter()) for (const [dx, dy, c] of [[-8, -1, '#d9483b'], [-3, -3, '#c9302c'], [2.4, -2.6, '#e2574c'], [7.4, -1, '#d9483b'], [0, 0, '#b9cf5a'], [-5, 1, '#e2574c'], [5, 1, '#c9302c']]) s += apple(68 + dx, 379 + dy, c);
      s += `<path d="M55 381 h26 l-3 11 q-0.6 2 -2.6 2 h-14.8 q-2 0 -2.6 -2Z" fill="#c9924f"/><path d="M56.6 385 h23 M57.6 389 h21" stroke="#a8743c" stroke-width="0.8"/>
        <path d="M61 381 v12 M68 381 v13 M75 381 v12" stroke="#b07e44" stroke-width="0.6"/><rect x="53.6" y="379" width="28.8" height="3.4" rx="1.6" fill="#a8743c"/>`;
      if (winter()) s += oval(68, 379, 13, 2.4, SNOW);
    }
    return s + '</g>';
  }

  // ---------------------------------------------------------- the potting shed
  function shed(st, C) {
    const p = pend(st, 'shed'), ok = st.shed;
    const trim = ok ? '#f6efe0' : '#c9c1b2', door = ok ? U.shade(C.pottingShed, -0.18) : U.mix(U.shade(C.pottingShed, -0.18), '#a59e90', 0.6);
    let s = `<g data-part="shed">${shadow(347, 392, 52, 3.6)}<rect x="304" y="322" width="86" height="68" fill="${url('Clad')}"/>
      <rect x="302" y="322" width="4" height="68" fill="${trim}"/><rect x="388" y="322" width="4" height="68" fill="${trim}"/>`;
    // the window, with pots on the sill inside
    s += `<rect x="311" y="335" width="30" height="24" rx="1" fill="${trim}"/><rect x="313.4" y="337.4" width="25.2" height="19.2" fill="${ok ? '#cfe6ee' : '#7d8a62'}"/>`;
    if (ok) s += `<path d="M315 356 h6 l-1 -4 h-4Z M325 356 h6 l-1 -4 h-4Z" fill="#c9764a"/>${dot(318, 350.6, 2.6, '#5d9644')}${dot(328, 350.4, 2.4, '#6aa04c')}${dot(329, 348.6, 1.2, '#ef8aa6')}
      <path d="M316 340 l10 -2.6 M330 340 l6 -1.6" stroke="#fff" stroke-width="1.2" opacity="0.6"/>`;
    else s += `<path d="M313.4 337.4 l7 0 l-7 7Z" fill="#fff" opacity="0.3"/>${line('M326 337.4 l3 6 l-2 5 l4 7', '#e6ece0', 0.6)}${line('M313.4 337.4 l6 0 M313.4 337.4 l4 4 M313.4 337.4 l0 6', '#e1ddd5', 0.4)}`;
    s += `<path d="M326 337.4 V356.6 M313.4 347 H338.6" stroke="${trim}" stroke-width="1.6"/><rect x="309" y="358.6" width="34" height="3" rx="1" fill="${trim}"/>`;
    // a window box of herbs and flowers once it is loved
    if (ok && !winter()) s += `<rect x="310" y="361.4" width="32" height="6" rx="1" fill="#a8743c"/>${[314, 320, 326, 332, 338].map((x, i) => dot(x, 360, 2.6, i % 2 ? '#5d9644' : '#6aa04c') + (i % 2 ? '' : dot(x + 0.6, 358.6, 1.3, ['#ef8aa6', '#f2d84a', '#ffffff'][i / 2]))).join('')}`;
    // the stable door
    const tilt = ok ? 0 : 2.4;
    s += `<g transform="rotate(${tilt} 356 390)"><rect x="352" y="334" width="26" height="56" fill="${door}"/><rect x="352" y="334" width="26" height="56" fill="none" stroke="${U.shade(door, -0.25)}" stroke-width="1"/>
      <path d="M352 361 H378 M354 337 L376 359 M354 364 L376 388" stroke="${U.shade(door, -0.22)}" stroke-width="1.6"/>${dot(374, 362, 1.4, ok ? '#e9c35a' : '#77705f')}</g>`;
    s += `<rect x="350" y="331" width="30" height="3" fill="${trim}"/>`;
    if (!ok) {
      s += `${oval(318, 372, 5, 2.4, '#cfc6b6', 0.7)}${oval(340, 380, 3.4, 1.8, '#cfc6b6', 0.6)}${oval(362, 346, 3, 2, '#d8d0c0', 0.6)}
        <g transform="rotate(-8 330 386)"><rect x="306" y="383" width="40" height="5" fill="${U.mix(C.pottingShed, '#a59e90', 0.7)}"/></g>`;
    } else {
      // a rake and a spade hung neatly on the wall
      s += line('M384 332 V376 M380 332 h8', '#8a6142', 1.2) + `<path d="M380 330 h8 v-2 h-8Z" fill="#7d8792"/>` + line('M306 342 V382', '#8a6142', 1.2) + `<path d="M303 382 h6 l-1 7 h-4Z" fill="#9aa3ad"/>`;
    }
    if (p === 'grow') s += `<rect x="304" y="322" width="86" height="68" fill="${FADE}" opacity="0.45"/>`;
    if (winter()) s += `<rect x="309" y="357.6" width="34" height="2" rx="1" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  function roof(st) {
    const p = pend(st, 'roof'), ok = st.roof && p !== 'grow';
    const D = 'M296 326 L306 300 H388 L398 326Z';
    let s = `<g data-part="roof"><path d="${D}" fill="${st.roof ? url('Shingle') : url('Moss')}"/>`;
    if (!st.roof) {
      s += `<rect x="322" y="306" width="10" height="7" fill="#3a2b22"/><rect x="356" y="314" width="10" height="7" fill="#3a2b22"/><rect x="340" y="304" width="7" height="5" fill="#3a2b22"/>
        ${dot(310, 318, 4, '#5f7a34')}${dot(380, 310, 3.4, '#6f8a3e')}${line('M372 312 q-3 -8 1 -12 M374 312 q3 -7 7 -8', '#4f7a32', 1)}`;
    } else if (p === 'grow') s += `<path d="${D}" fill="${url('Moss')}" opacity="0.45"/>`;
    if (winter() || p === 'snow') s += `<path d="M297 324 L306.6 301 H387.4 L397 324 Q372 319 347 323 Q322 319 297 324Z" fill="${SNOW}"/>`;
    if (p === 'leaves') s += `<path d="${D}" fill="${url('Leaves')}"/>`;
    s += `<path d="M305 300.5 H389" stroke="#4d4038" stroke-width="2.4" stroke-linecap="round"/><path d="M295 326.6 H399" stroke="#4d4038" stroke-width="2" stroke-linecap="round"/>
      <rect x="370" y="286" width="5" height="17" fill="#3d3d42"/><rect x="368.6" y="284" width="7.8" height="3" rx="1" fill="#2f2f33"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------- the path
  function path(st) {
    const p = pend(st, 'path'), ok = st.path && p !== 'grow';
    let s = `<g data-part="path"><path d="${PATH_D}" fill="${st.path ? url('Laid') : url('Moss')}"/>`;
    if (!st.path) {
      // bricks showing through the moss, weeds and cracks
      const r = U.rng(81);
      for (let i = 0; i < 14; i++) {
        const y = 310 + r() * 220, w = 24 + (y - 298) * 0.41, x = 200 - w / 2 + r() * (w - 10);
        s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(7 + r() * 4)}" height="3.6" rx="0.6" fill="#b5664a" opacity="0.55"/>`;
      }
      for (let i = 0; i < 12; i++) {
        const y = 306 + r() * 228, w = 24 + (y - 298) * 0.41, x = 200 - w / 2 + r() * w;
        s += line(`M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l3 -4`, '#5f7a34', 1.2);
      }
    } else if (p === 'grow') s += `<path d="${PATH_D}" fill="${url('Moss')}" opacity="0.4"/>`;
    if (p === 'leaves') s += `<path d="${PATH_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${PATH_D}" fill="${url('Snow')}" opacity="0.95"/>`;
    else if (winter() && st.path) s += `<path d="M188 298 L194 298 L166 540 L150 540Z M212 298 L206 298 L234 540 L250 540Z" fill="${SNOW}" opacity="0.85"/>`;
    s += line('M188 298 L150 540 M212 298 L250 540', ok ? '#a8705a' : '#6d7448', 2.2);
    return s + '</g>';
  }

  // ------------------------------------------------- the cutting garden
  // four flowers, each its own shape as well as its own colour
  function cutFlower(kind, x, y, k) {
    switch (kind) {
      case 0: return line(`M${f1(x)} ${f1(y + 4 * k)} V${f1(y)}`, '#5f8a3a', 0.9) + oval(x - 1.6 * k, y + 2.4 * k, 1 * k, 2.4 * k, '#6f9a44') + tulip(x, y + 1, '#d9483b');
      case 1: return line(`M${f1(x)} ${f1(y + 4 * k)} V${f1(y)}`, '#5f8a3a', 0.8) + bloom(x, y, 3.4 * k, '#ffffff', '#f2c230', 8);
      case 2: {
        let s = line(`M${f1(x)} ${f1(y + 4 * k)} V${f1(y)}`, '#5f8a3a', 0.8);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; s += line(`M${f1(x)} ${f1(y)} l${f1(Math.cos(a) * 3 * k)} ${f1(Math.sin(a) * 3 * k)}`, '#4f78d6', 1.4); }
        return s + dot(x, y, 0.9 * k, '#3a4f9a');
      }
      default: return line(`M${f1(x)} ${f1(y + 4 * k)} V${f1(y)}`, '#5f8a3a', 0.9) + dot(x, y, 3 * k, '#e98a2a') + dot(x, y, 2 * k, '#f2a63a') + dot(x, y, 1 * k, '#d9702a');
    }
  }
  function cutting(st) {
    const p = pend(st, 'cutting'), ok = st.cutting && p !== 'grow';
    const at = (i, j) => {
      const y = CUT.y0 + ((CUT.y1 - CUT.y0) * i) / 4, a = CUT.l0 + ((CUT.l1 - CUT.l0) * i) / 4, b = CUT.r0 + ((CUT.r1 - CUT.r0) * i) / 4;
      return [a + ((b - a) * j) / 4, y];
    };
    const D = `M${CUT.l0} ${CUT.y0} H${CUT.r0} L${CUT.r1} ${CUT.y1} H${CUT.l1}Z`;
    let s = `<g data-part="cutting">${shadow(282, 487, 38, 2.4)}<path d="${D}" fill="${st.cutting ? url('Soil') : url('Dry')}"/>`;
    const snowy = (winter() && st.cutting) || p === 'snow';
    if (snowy) s += `<path d="${D}" fill="${url('Snow')}"/>`;
    // the squares, marked with little boards (or with sagging strings before)
    let grid = '';
    for (let k = 1; k < 4; k++) {
      const [ax, ay] = at(k, 0), [bx] = at(k, 4), [cx, cy] = at(0, k), [dx, dy] = at(4, k);
      grid += st.cutting ? `M${f1(ax)} ${f1(ay)} H${f1(bx)} M${f1(cx)} ${f1(cy)} L${f1(dx)} ${f1(dy)} ` : `M${f1(ax)} ${f1(ay)} Q${f1((ax + bx) / 2)} ${f1(ay + 3)} ${f1(bx)} ${f1(ay)} `;
    }
    s += `<path d="${grid}" stroke="${st.cutting ? '#d9c39a' : '#e8e2d4'}" stroke-width="${st.cutting ? 1.6 : 0.6}" fill="none"/>`;
    const r = U.rng(91);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const [x0, y0] = at(i, j), [x1, y1] = at(i + 1, j + 1), x = (x0 + x1) / 2, y = (y0 + y1) / 2 - 2, k = 0.85 + i * 0.07;
        if (snowy) s += `<rect x="${f1(x - 0.8)}" y="${f1(y - 3)}" width="1.6" height="7" fill="#f6efe0"/>${dot(x, y - 3.4, 1.4, ['#d9483b', '#ffffff', '#4f78d6', '#e98a2a'][LATIN[i][j]])}`;
        else if (ok || (st.cutting && r() < 0.55)) s += cutFlower(LATIN[i][j], x, y, k);
        else if (!st.cutting && r() < 0.45) s += weed(x, y + 4, 6, r);
      }
    }
    if (p === 'leaves') s += `<path d="${D}" fill="${url('Leaves')}" opacity="0.8"/>`;
    else if (p === 'frost') s += `<path d="${D}" fill="${url('Frost')}" opacity="0.5"/>`;
    s += `<path d="${D}" fill="none" stroke="${st.cutting ? '#b5783f' : '#8a7f6e'}" stroke-width="2.4" stroke-linejoin="round"/>`;
    if (!st.cutting) {
      for (const [x, y] of [at(0, 0), at(0, 4), at(4, 0), at(4, 4)]) s += `<rect x="${f1(x - 1)}" y="${f1(y - 6)}" width="2" height="7" fill="#8a7a62"/>`;
      // a forgotten seed packet and a trowel
      s += `<g transform="rotate(-14 304 496)"><rect x="298" y="490" width="10" height="13" rx="1" fill="#f6efe0"/>${bloom(303, 495, 2.6, '#e98a2a', '#d9702a', 6)}</g>
        <path d="M232 492 l10 3" stroke="#8a6142" stroke-width="2" stroke-linecap="round"/><path d="M242 495 l7 0 l-2 5 Z" fill="#9aa3ad"/>`;
    }
    return s + '</g>';
  }

  // ------------------------------------------------------- the raised beds
  function raisedBack(st) {
    const wood = st.raised ? '#b77b48' : '#8a8172';
    return BEDS.map((b) => `<g data-part="raised"><rect x="${b.x0 - 3}" y="${b.y - 4}" width="${b.x1 - b.x0 + 6}" height="5" rx="1" fill="${wood}"/></g>`).join('');
  }
  function veg(st) {
    const p = pend(st, 'veg'), ok = st.veg && p !== 'grow';
    let s = '';
    BEDS.forEach((b, k) => {
      const r = U.rng(101 + k), D = `M${b.x0} ${b.y} H${b.x1} V${b.y + b.h} H${b.x0}Z`;
      s += `<g data-part="veg"><path d="${D}" fill="${st.veg ? url('Soil') : url('Dry')}"/>`;
      if (winter() || p === 'snow') s += `<path d="${D}" fill="${url('Snow')}" opacity="0.92"/>`;
      const n = k ? 9 : 7, step = (b.x1 - b.x0 - 12) / (n - 1);
      for (let i = 0; i < n; i++) {
        const x = b.x0 + 6 + i * step + (r() - 0.5) * 2, y = b.y + b.h * 0.62 + (r() - 0.5) * 2;
        if (!(ok || (st.veg && r() < 0.5))) { if (r() < 0.7) s += weed(x, y + 3, 7, r); continue; }
        if (winter()) s += k ? `<rect x="${f1(x - 1)}" y="${f1(y - 10)}" width="2.2" height="10" fill="#f0f2e6"/>${line(`M${f1(x)} ${f1(y - 9)} l-3 -6 M${f1(x + 0.6)} ${f1(y - 9)} l3 -7`, '#3f6b4a', 1.6)}`
          : dot(x, y - 3, 4, '#3f6b4a') + dot(x - 1.4, y - 5, 2, '#4f7a5a') + oval(x, y - 6.4, 3, 1, SNOW);
        else if (k === 0) {
          // lettuces, green and red, or cabbages in the autumn
          const col = SEASON === 'autumn' ? (i % 2 ? '#8fb3a8' : '#7aa39a') : i % 2 ? '#a8443f' : '#8cc063';
          const sz = SEASON === 'spring' ? 2.6 : 4.4;
          s += dot(x, y - 2, sz, col) + dot(x - 0.6, y - 2.8, sz * 0.55, U.shade(col, 0.25)) + (SEASON === 'autumn' ? line(`M${f1(x - 3)} ${f1(y - 2)} q3 -2 6 0`, '#6a8f86', 0.6) : '');
        } else if (SEASON === 'autumn' && i % 3 === 1) {
          // pumpkins
          s += oval(x, y - 2, 5, 3.6, '#e98a2a') + `<path d="M${f1(x - 2)} ${f1(y - 5)} q2 3 0 6 M${f1(x + 2)} ${f1(y - 5)} q-2 3 0 6" stroke="#c9702a" stroke-width="0.6" fill="none"/>` + `<rect x="${f1(x - 0.6)}" y="${f1(y - 7.4)}" width="1.4" height="2.4" fill="#5f6a3a"/>`;
        } else {
          // carrot tops in rows
          s += line(`M${f1(x)} ${f1(y)} l-2 -6 M${f1(x)} ${f1(y)} l0 -7 M${f1(x)} ${f1(y)} l2 -6`, '#4f8a3a', 1) + (SEASON === 'spring' ? '' : oval(x, y + 0.8, 1.4, 0.9, '#f08a3a'));
        }
      }
      if (p === 'leaves') s += `<path d="${D}" fill="${url('Leaves')}"/>`;
      s += '</g>';
    });
    return s;
  }
  function raisedFront(st) {
    const p = pend(st, 'raised'), ok = st.raised;
    const wood = ok ? '#c98a55' : '#9a8f80', dk = U.shade(wood, -0.22), lt = U.shade(wood, 0.16);
    let s = '';
    BEDS.forEach((b, k) => {
      const y = b.y + b.h;
      s += `<g data-part="raised">${shadow((b.x0 + b.x1) / 2, y + b.fh + 1.6, (b.x1 - b.x0) / 2 + 6, 2.6)}
        <rect x="${b.x0 - 3}" y="${b.y - 3}" width="3" height="${b.h + 3}" fill="${dk}"/><rect x="${b.x1}" y="${b.y - 3}" width="3" height="${b.h + 3}" fill="${dk}"/>
        <rect x="${b.x0 - 3}" y="${y}" width="${b.x1 - b.x0 + 6}" height="${b.fh}" fill="${wood}"/><path d="M${b.x0 - 3} ${f1(y + b.fh / 2)} H${b.x1 + 3}" stroke="${dk}" stroke-width="0.8"/>
        <rect x="${b.x0 - 3}" y="${y - 1.4}" width="${b.x1 - b.x0 + 6}" height="2.6" fill="${lt}"/>
        <rect x="${b.x0 - 5}" y="${b.y - 5}" width="4.4" height="${b.h + b.fh + 5}" rx="0.8" fill="${dk}"/><rect x="${b.x1 + 0.6}" y="${b.y - 5}" width="4.4" height="${b.h + b.fh + 5}" rx="0.8" fill="${dk}"/>`;
      if (!ok) {
        if (k === 0) s += `<path d="M60 ${y} h18 v${b.fh} h-18Z" fill="#4d3a2c"/><path d="M62 ${y + b.fh} q8 4 16 0" fill="#9a8466"/>`;
        else s += `<g transform="rotate(9 100 ${y + b.fh + 6})"><rect x="84" y="${y + b.fh + 2}" width="34" height="4.6" rx="0.8" fill="${wood}"/></g><path d="M${b.x0 + 18} ${y + 2} l6 3 l5 -2" stroke="${dk}" stroke-width="0.8" fill="none"/>`;
        s += oval(b.x0 + 8, y + 5, 3, 2, '#7d7a62', 0.6) + oval(b.x1 - 10, y + 6, 4, 2.2, '#6f6a56', 0.5);
      }
      if (p === 'grow') s += `<rect x="${b.x0 - 3}" y="${y}" width="${b.x1 - b.x0 + 6}" height="${b.fh}" fill="${FADE}" opacity="0.5"/>`;
      if (winter() || p === 'snow') s += `<rect x="${b.x0 - 4}" y="${y - 2.6}" width="${b.x1 - b.x0 + 8}" height="2.4" rx="1.2" fill="${SNOW}"/>`;
      s += '</g>';
    });
    return s;
  }

  // ---------------------------------------------------------- the lily pond
  function pond(st) {
    const p = pend(st, 'pond'), ok = st.pond && p !== 'grow';
    const ice = st.pond && (p === 'frost' || p === 'snow' || winter());
    const { x, y, rx, ry } = POND;
    let s = `<g data-part="pond">${oval(x, y + 1.4, rx + 6, ry + 4.4, winter() ? '#d4dce2' : '#b9b0a0')}`;
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; s += oval(x + Math.cos(a) * (rx + 3.4), y + 1 + Math.sin(a) * (ry + 2.6), 3.6, 2.2, i % 2 ? '#c9c0b0' : '#b3aa9a'); }
    s += oval(x, y, rx, ry, ice ? '#dfeef5' : ok ? url('PondG') : '#5f7a3a');
    if (ice) s += line(`M${x - 28} ${y - 2} l18 -4 M${x + 4} ${y + 6} l22 -5 M${x - 20} ${y + 7} l10 -2`, '#fff', 1.8);
    else if (ok) {
      s += line(`M${x - 30} ${y - 4} q8 -2 14 0 M${x + 14} ${y + 8} q7 -2 13 0`, '#fff', 1, 0.6);
      for (const [dx, dy, sz] of [[-20, 3, 6], [-6, -6, 5], [16, -2, 6.4], [24, 7, 4.6], [-26, -6, 4.4]]) s += oval(x + dx, y + dy, sz, sz * 0.42, '#5fae5a') + line(`M${f1(x + dx)} ${f1(y + dy)} l${f1(sz * 0.9)} ${f1(-sz * 0.2)}`, '#3f8a44', 0.7);
      if (!winter() && SEASON !== 'autumn') s += bloom(x - 6, y - 7, 3, '#f7b6c8', '#f2c230', 6) + bloom(x + 16, y - 3, 2.8, '#ffffff', '#f2c230', 6);
      if (SEASON === 'spring' || SEASON === 'summer') s += `<g class="gh-bob">${oval(x - 20, y + 1, 3.4, 2.4, '#6fae4a')}${dot(x - 21.6, y - 0.8, 1, '#f6f2c4')}${dot(x - 18.4, y - 0.8, 1, '#f6f2c4')}${dot(x - 21.6, y - 0.8, 0.45, '#222')}${dot(x - 18.4, y - 0.8, 0.45, '#222')}</g>`;
    } else {
      for (let i = 0; i < 16; i++) { const a = i * 2.4, d = (i % 5) / 5; s += dot(x + Math.cos(a) * rx * 0.85 * d, y + Math.sin(a) * ry * 0.8 * d, 1.6 + (i % 3) * 0.6, i % 2 ? '#7f9a4a' : '#93a85a'); }
      if (!st.pond) s += `<g transform="rotate(-20 ${x + 12} ${y + 2})"><path d="M${x + 6} ${y - 4} h6 v8 h6 v4 h-12Z" fill="#3f4a3a"/></g>${line(`M${x - 30} ${y + 4} q-2 -10 2 -16 M${x - 26} ${y + 5} q3 -8 0 -14`, '#6f8a3a', 1.4)}`;
    }
    if (p === 'leaves') s += oval(x, y, rx - 2, ry - 1.6, url('Leaves'));
    // irises at the far end
    const reed = winter() ? '#b8a27a' : SEASON === 'autumn' ? '#a8984e' : '#5f8a3a';
    s += line(`M${x + 38} ${y - 2} q-2 -14 -1 -22 M${x + 34} ${y - 2} q1 -11 3 -19 M${x + 30} ${y - 1} q-1 -9 -4 -15`, reed, 1.6);
    if (ok && (SEASON === 'spring' || SEASON === 'summer')) s += dot(x + 37, y - 22, 2, '#6a5acd') + dot(x + 36.6, y - 21, 1, '#f2d84a') + dot(x + 26, y - 16, 1.8, '#6a5acd');
    return s + '</g>';
  }

  // mess left lying about while the garden is neglected
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}">${[[146, 418], [230, 384], [384, 420], [124, 516]].map(([x, y]) => [0, 4, 8].map((d) => line(`M${x + d} ${y} q-1 -7 ${d % 8 ? 2 : -2} -11`, '#4f7a32', 1.2) + oval(x + d + (d % 8 ? 1.6 : -1.6), y - 6, 1.8, 1, '#5f8a3a')).join('')).join('')}
      ${oval(280, 404, 7, 3, '#5b636d')}${oval(280, 403, 4, 1.4, '#7d8792')}<path d="M262 520 l18 -4 l2 6 l-18 4Z" fill="#a3a9a0" opacity="0.8"/></g>`;
  }

  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="280.5" y="508" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 282 504)">
      <rect x="258" y="494" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="282" y="507.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 282 512)"><rect x="255" y="508" width="54" height="10" fill="#d9534f"/><text x="282" y="516" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  function butterfly(x, y, col, k = 1, cls = '') {
    return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${k})"><g class="gh-flit${cls}"><g class="gh-wing"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="${col}"/></g>${line('M0 -2 V2', '#3d3d42', 0.8)}</g></g>`;
  }
  function hive(x, y) {
    return `<g>${shadow(x, y + 1, 12, 1.8)}<rect x="${x - 9}" y="${y - 6}" width="18" height="6" fill="#ece6da"/><rect x="${x - 10}" y="${y - 14}" width="20" height="8" fill="#f6f1e6"/><rect x="${x - 9}" y="${y - 21}" width="18" height="7" fill="#ece6da"/>
      <path d="M${x - 13} ${y - 21} L${x} ${y - 30} L${x + 13} ${y - 21}Z" fill="#c9bea8"/><path d="M${x - 10} ${y - 14} H${x + 10} M${x - 9} ${y - 6} H${x + 9}" stroke="#cfc6b6" stroke-width="0.8"/>
      <rect x="${x - 4}" y="${y - 2}" width="8" height="1.6" fill="#5a4a3a"/><path d="M${x - 8} ${y} v4 M${x + 8} ${y} v4" stroke="#8a6142" stroke-width="1.6"/></g>`;
  }
  function peacock(x, y) {
    let eyes = '';
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k <= row; k++) {
        const ex = x - 4 - row * 2.6 + k * 5.4, ey = y + 10 + row * 9;
        eyes += dot(ex, ey, 2.4, '#3f9a7a') + dot(ex, ey, 1.3, '#2f4fa0') + dot(ex, ey - 0.3, 0.5, '#f2c230');
      }
    }
    return `<g><g class="gh-tail"><path d="M${x - 7} ${y - 2} Q${x - 22} ${y + 22} ${x - 17} ${y + 46} Q${x - 4} ${y + 53} ${x + 8} ${y + 45} Q${x + 10} ${y + 20} ${x - 1} ${y - 2}Z" fill="#2f7a6a"/>
      <path d="M${x - 4} ${y} Q${x - 10} ${y + 24} ${x - 6} ${y + 48} M${x - 2} ${y} Q${x} ${y + 24} ${x + 2} ${y + 48}" stroke="#4a9a7a" stroke-width="0.6" fill="none"/>${eyes}</g>
      ${oval(x, y - 4, 6, 4.6, '#2f6ab0')}${oval(x - 3, y - 2.6, 3.4, 2.4, '#3f9a7a')}<path d="M${x + 3} ${y - 6} q2 -8 4 -10" stroke="#2f6ab0" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${dot(x + 7, y - 16, 2.6, '#2f6ab0')}${dot(x + 7.8, y - 16.6, 0.6, '#fff')}<path d="M${x + 9.4} ${y - 16} l2.4 0.6 l-2.4 0.8Z" fill="#c9a06a"/>
      ${[-2, 0, 2].map((d) => line(`M${x + 7 + d} ${y - 18.6} l${d * 0.6} -3`, '#2f6ab0', 0.5) + dot(x + 7 + d * 1.6, y - 21.6, 0.8, '#3f9a7a')).join('')}
      <path d="M${x - 2} ${y} v4 M${x + 2} ${y} v4" stroke="#8a7a62" stroke-width="0.9"/></g>`;
  }
  const DECOR = {
    'g-bench': () => `<g>${shadow(111, 398, 20, 2.2)}<rect x="92" y="377" width="38" height="3.6" rx="1.4" fill="#a77b56"/><rect x="92" y="383" width="38" height="3.6" rx="1.4" fill="#a77b56"/>
      <rect x="92" y="388" width="38" height="3.6" rx="1.4" fill="#8a6142"/><rect x="94" y="391" width="2.6" height="7" fill="#3d3d42"/><rect x="125.4" y="391" width="2.6" height="7" fill="#3d3d42"/>
      ${winter() ? `<rect x="92" y="386.4" width="38" height="2" rx="1" fill="${SNOW}"/>` : ''}</g>`,
    'g-birdbath': () => `<g>${shadow(162, 368, 10, 1.8)}<path d="M158 368 h8 l-1.4 -16 h-5.2Z" fill="#d6cdbd"/><path d="M150 351 h24 q-2 5 -12 5 q-10 0 -12 -5Z" fill="#cfc6b6"/>
      ${oval(162, 351, 12, 2.6, winter() ? '#e6f1f6' : '#9fd3e6')}${winter() ? '' : `<g class="gh-hop">${oval(169, 347, 3.2, 2.2, '#8a6a52')}${dot(171.4, 345, 1.6, '#8a6a52')}<path d="M172.8 345 l1.6 0.4 l-1.6 0.4Z" fill="#e9a23c"/>${dot(171.8, 344.6, 0.4, '#222')}</g>`}</g>`,
    'g-scarecrow': () => `<g>${shadow(150, 432, 9, 1.6)}${line('M150 432 V392 M138 404 H162', '#8a6142', 2.2)}<path d="M141 400 h18 l-2 16 h-14Z" fill="#c9586e"/><path d="M146 400 v16 M154 400 v16" stroke="#a8443f" stroke-width="0.6"/>
      ${dot(150, 393, 5.4, '#f2dca6')}<path d="M142 391 h16 l-3 -5 h-10Z" fill="#c9924f"/><rect x="140" y="389.6" width="20" height="2.4" rx="1" fill="#a8743c"/>
      ${dot(148, 393, 0.7, '#3d3d42')}${dot(152, 393, 0.7, '#3d3d42')}<path d="M147.6 396 q2.4 1.6 4.8 0" stroke="#a8443f" stroke-width="0.7" fill="none"/>
      ${line('M138 404 l-2 3 M138 404 l-3 0 M162 404 l2 3 M162 404 l3 0', '#e2c27a', 0.8)}</g>`,
    'g-beehive': () => `${hive(250, 372)}${hive(276, 374)}<g pointer-events="none">${[[262, 346], [286, 352], [244, 350]].map(([x, y]) => `<g class="bee"><ellipse cx="${x}" cy="${y}" rx="1.8" ry="1.3" fill="#f2c230"/><path d="M${x - 0.4} ${y - 1.2} v2.4" stroke="#3d3d42" stroke-width="0.6"/>${oval(x, y - 1.6, 1.4, 0.8, '#fff', 0.8)}</g>`).join('')}</g>`,
    'g-barrow': () => `<g>${shadow(118, 522, 22, 2)}<path d="M98 506 h34 l-6 12 h-22Z" fill="#3f7a8a"/>${dot(130, 522, 5, '#3d3d42')}${dot(130, 522, 2, '#9aa3ad')}
      ${line('M98 506 l-8 4 M104 518 l-2 6 M120 518 l1 4', '#6b4a32', 1.6)}
      ${winter() ? oval(115, 504, 16, 3, SNOW) : [[102, 503, '#ef8aa6'], [108, 500, '#f2d84a'], [114, 502, '#d9483b'], [120, 499, '#ffffff'], [126, 503, '#9b7fd1'], [111, 505, '#ef8aa6']].map(([x, y, c]) => dot(x, y + 2, 3, '#5d9644') + bloom(x, y, 2.4, c, '#f2c230', 5)).join('')}</g>`,
    'g-arch': () => {
      let s = line('M6 268 V214 Q32 180 58 214 V268', '#5a4a3a', 2.4);
      const r = U.rng(29), leaf = winter() ? null : SEASON === 'autumn' ? '#8a9a3c' : '#4f8a3c';
      for (let i = 0; i < 26; i++) {
        const t = i / 25, a = Math.PI * (1 - t), side = t < 0.25 ? 0 : t > 0.75 ? 2 : 1;
        const x = side === 0 ? 6 : side === 2 ? 58 : 32 + Math.cos(a) * 26, y = side === 0 ? 268 - t * 4 * 54 : side === 2 ? 214 + (t - 0.75) * 4 * 54 : 214 - Math.sin(a) * 22;
        if (leaf) s += oval(x + (r() - 0.5) * 4, y + (r() - 0.5) * 4, 3, 2, leaf);
        if (!winter() && SEASON !== 'autumn' && i % 3 === 0) s += dot(x + (r() - 0.5) * 3, y + (r() - 0.5) * 3, 2, U.pick(r, ['#ef8aa6', '#f5b3c4', '#e0607e']));
        else if (SEASON === 'autumn' && i % 4 === 0) s += dot(x, y, 1.4, '#d9483b');
      }
      return `<g>${s}${winter() ? line('M8 212 Q32 178 56 212', SNOW, 2) : ''}</g>`;
    },
    'g-lights': () => '',
    'g-tortoise': () => {
      let s = '';
      for (const [x, y] of [[24, 512], [36, 518], [48, 510], [62, 516], [30, 526], [56, 526]]) s += oval(x, y, 5, 2.6, '#5d9644') + (winter() ? oval(x, y - 1.6, 4, 1.2, SNOW) : SEASON === 'spring' ? dot(x + 2, y - 2, 1.3, '#ffffff') : dot(x + 2, y - 1, 1.5, '#d9483b'));
      return `<g>${s}${shadow(44, 527, 9, 1.4)}<path d="M36 524 q8 -12 16 0Z" fill="#8a6a3a"/><path d="M39 522 l5 -6 l5 6 M44 516 v8" stroke="#6b4a2a" stroke-width="0.7" fill="none"/>
        ${dot(54, 522, 2.4, '#9a8a5a')}${dot(54.8, 521.4, 0.5, '#222')}<path d="M38 524 v2.4 M50 524 v2.4" stroke="#9a8a5a" stroke-width="1.6" stroke-linecap="round"/></g>`;
    },
    'g-sundial': () => `<g>${shadow(330, 434, 10, 1.8)}<path d="M325 434 h10 l-1.4 -20 h-7.2Z" fill="#d6cdbd"/><rect x="321" y="410.6" width="18" height="4" rx="1" fill="#cfc6b6"/>
      ${oval(330, 410.6, 9, 2.4, '#e2d9c6')}<path d="M330 410.6 l5 -4 v4Z" fill="#b08a4a"/>${winter() ? oval(330, 409.6, 9, 1.6, SNOW) : ''}</g>`,
    'g-fountain': () => {
      const { x, y } = POND;
      const water = winter() ? '' : `<g pointer-events="none">${[[-4, 0], [4, 0.5], [0, 0.9], [-2, 0.3], [2, 0.7]].map(([dx, dl]) => `<circle class="gh-drop" cx="${x + dx}" cy="${y - 25}" r="0.9" fill="#bfe6f2" style="animation-delay:-${dl}s"/>`).join('')}</g>`;
      return `<g>${oval(x, y + 1, 8, 2.6, '#c9c0b0')}<rect x="${x - 2}" y="${y - 14}" width="4" height="15" fill="#d6cdbd"/><path d="M${x - 9} ${y - 15} h18 q-2 5 -9 5 q-7 0 -9 -5Z" fill="#cfc6b6"/>
        <rect x="${x - 1.2}" y="${y - 24}" width="2.4" height="9" fill="#d6cdbd"/>${dot(x, y - 25, 2, '#d6cdbd')}${winter() ? oval(x, y - 15, 9, 1.6, SNOW) : oval(x, y - 15, 8, 1.6, '#9fd3e6')}${water}</g>`;
    },
    'g-peacock': () => peacock(96, 190),
    'g-butterflies': () => `<g pointer-events="none">${winter() ? '' : [[312, 236, '#f2a7b8', ''], [336, 228, '#fbd85c', ''], [356, 240, '#9cc5f0', ''], [376, 232, '#f6efe0', ''], [326, 246, '#e9962c', ''], [80, 236, '#bba9df', '']].map(([x, y, c], i) => butterfly(x, y, c, 0.9)).join('')}</g>`,
  };
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k]) s += DECOR[k]();
    return s;
  }

  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M150 112 q4 -4 8 0 q4 -4 8 0 M174 124 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    if (PCT > 0.5 && !winter() && st.border) s += `<g pointer-events="none">${[[300, 244], [342, 236], [92, 242]].map(([x, y]) => `<circle class="bee" cx="${x}" cy="${y}" r="1.6" fill="#3d3d42"/>`).join('')}</g>`;
    if (PCT > 0.6 && !winter()) s += '<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>';
    if (PCT > 0.8 && SEASON === 'summer') s += '<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>';
    // a robin on the spade handle, once the beds are dug
    if (st.veg && (PCT > 0.7 || winter())) {
      s += `${line('M140 446 V420', '#8a6142', 1.6)}<path d="M136 446 h8 l-1 8 h-6Z" fill="#9aa3ad"/><path d="M137 420 h6" stroke="#8a6142" stroke-width="1.8" stroke-linecap="round"/>
        <g class="gh-hop">${oval(140, 415, 4, 3.2, '#8a6a52')}${oval(141.4, 416, 2.4, 2.2, '#e2683a')}${dot(142.6, 412.4, 2, '#8a6a52')}${dot(143.2, 412, 0.5, '#222')}<path d="M144.4 412.6 l1.6 0.4 l-1.6 0.4Z" fill="#5a4a3a"/><path d="M136.4 414 l-3 1.6" stroke="#6b5240" stroke-width="1.4" stroke-linecap="round"/></g>`;
    }
    return s;
  }

  function weather() {
    let s = '';
    if (winter()) {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${((i * 0.83) % 9).toFixed(2)}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 7; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${((i * 1.3) % 10).toFixed(1)}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#f7c3d6" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: darken everything except the glasshouse and the shed window
  function night(st, decor) {
    const lit = st.panes && !PEND.panes, shedLit = st.shed && !PEND.shed;
    let holes = '';
    if (lit) holes += `<path d="${GL}"/><path d="${DOOR_D}"/>`;
    if (shedLit) holes += '<rect x="313" y="337" width="26" height="20"/>';
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 140)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="345" cy="50" r="14" fill="#000"/></mask><circle cx="338" cy="56" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="338" cy="56" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (lit) s += `<path d="${GL}" fill="#ffd98a" opacity="${st.hose ? 0.3 : 0.18}"/>${glow(200, 236, 120, 80)}${glow(200, 318, 60, 14)}${glow(200, 300, 100, 10)}`;
    if (shedLit) s += `<rect x="313" y="337" width="26" height="20" fill="#ffd98a" opacity="0.35"/>${glow(326, 347, 30, 22)}`;
    if (decor['g-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="${BULB_COLS[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${BULB_COLS[i % 4]}" opacity="0.22"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    path: [200, 430], panes: [200, 232], border: [343, 266], hose: [262, 290], orchard: [70, 330], raised: [74, 470], veg: [74, 416],
    apples: [68, 384], shed: [346, 356], cutting: [282, 452], wall: [70, 222], pond: [358, 498], roof: [346, 312], pots: [200, 296], door: [32, 242],
  };
  function sparkles(part) {
    if (!part) return '';
    const spot = SPOTS[part] || [200, 330];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 18 + (i % 3) * 10;
      const x = spot[0] + Math.cos(a) * d, y = spot[1] + Math.sin(a) * d * 0.7;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${f1(x)} ${f1(y - 6)} L${f1(x + 1.5)} ${f1(y - 1.5)} L${f1(x + 6)} ${f1(y)} L${f1(x + 1.5)} ${f1(y + 1.5)} L${f1(x)} ${f1(y + 6)} L${f1(x - 1.5)} ${f1(y + 1.5)} L${f1(x - 6)} ${f1(y)} L${f1(x - 1.5)} ${f1(y - 1.5)}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles" pointer-events="none">${s}</g>`;
  }

  // st: map of restored part -> true; cols: chosen paint colours (pottingShed,
  // gardenDoor); opts as for RESCUE.render
  function render(st, cols = {}, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1);
    const decor = opts.decor || {};
    palette({ pottingShed: cols.pottingShed || '#9cc5a1', gardenDoor: cols.gardenDoor || '#3d5a86' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house glasshouse">
      ${style()}${defs(st)}${sky()}${far()}${wall(st)}${door(st, C)}${ground()}${border(st)}
      ${glasshouse(st, decor)}${pots(st)}${reel(st)}${orchard(st)}${trees()}${apples(st)}${shed(st, C)}${roof(st)}${st.shed && st.roof ? '<g class="smoke" fill="#ffffff"><circle cx="373" cy="274" r="4" opacity="0.7"/><circle cx="377" cy="264" r="5.6" opacity="0.5"/><circle cx="374" cy="250" r="7" opacity="0.3"/></g>' : ''}
      ${path(st)}${cutting(st)}${raisedBack(st)}${veg(st)}${raisedFront(st)}${pond(st)}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS: Object.keys(SPOTS) };
})();
