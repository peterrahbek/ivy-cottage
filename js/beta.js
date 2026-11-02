'use strict';
// The Puzzle Room overview, drawn as SVG the same way as the cottage
// (house.js), the café and the rescue. A cosy garden studio: a big corkboard
// with one pinned card per puzzle, a window onto the season, and a work table
// with a lamp, a mug, pencils, wool and a sleeping cat. An unsolved card is a
// pencil sketch on cream paper, a little askew; a solved one is the same
// picture in soft colour with a gold star. Every id carries a 'b' prefix
// (plus opts.uid when given) so this picture can share a page with the others.

const BETA = (() => {
  const VB = { w: 400, h: 540 };
  // the picture is sliced from the bottom up (xMidYMax), so a short or wide
  // screen loses the top first: the window, the board and the table sit DY
  // lower than they are drawn, and the floor starts at FY
  const DY = 48, FY = 482;
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, the id suffix, evening
  let SEASON = 'spring', UID = '', NIGHT = false;
  const id = (n) => `b${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const f1 = (v) => (+v).toFixed(1);
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#3b2a1a', 0.16);
  // mix two #rrggbb colours, t = 0..1 towards b
  const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, '0')).join('');
  const dark = (c, t = 0.22) => mix(c, '#3b352e', t);
  const light = (c, t = 0.4) => mix(c, '#fffaf1', t);
  const star = (cx, cy, r1, r2, rot = 0) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = ((i * 36 + rot - 90) * Math.PI) / 180, r = i % 2 ? r2 : r1;
      d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}`;
    }
    return d + 'Z';
  };
  const ovalD = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${f1(cy)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0Z`;

  const SKY = {
    spring: ['#bfe2ef', '#eef4e6'], summer: ['#9fd0f0', '#e6f3ea'],
    autumn: ['#efc9a4', '#f7e4cc'], winter: ['#c6d3e0', '#eef2f6'],
  };
  const HILL = { spring: ['#a9cf8f', '#8fbd78'], summer: ['#86b971', '#6f9a5c'], autumn: ['#d4b06c', '#b98f5a'], winter: ['#eef3f7', '#dfe8f0'] };

  // the four cards: where they hang, how askew, their tint and pin colour
  const CARDS = {
    cups: { x: 204, y: 106, tilt: -5, label: 'Cups', tint: '#a6d3d4', pin: '#efb4ae' },
    feed: { x: 318, y: 106, tilt: 4, label: 'Feeding', tint: '#f2d88a', pin: '#8fbfe6' },
    hose: { x: 204, y: 244, tilt: 3.5, label: 'Watering', tint: '#8fbfe6', pin: '#6f9a6a' },
    beds: { x: 318, y: 244, tilt: -4, label: 'Bedtime', tint: '#bba9df', pin: '#d98b63' },
  };

  // a sleeping cat breathes, the mug steams, petals and snow drift past the window
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .bt-breathe{animation:btbreathe 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes btbreathe{50%{transform:scaleY(1.06)}}
      #scene .bt-steam path{animation:btsteam 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      #scene .bt-steam path:nth-child(2){animation-delay:1.7s}
      @keyframes btsteam{0%{opacity:0;transform:translateY(3px) scaleY(.6)}40%{opacity:.8}100%{opacity:0;transform:translateY(-6px) scaleY(1.1)}}
      #scene .bt-fall{animation:btfall 12s linear infinite}
      @keyframes btfall{from{transform:translate(-8px,-150px)}to{transform:translate(8px,150px)}}
    }</style>`;
  }

  function defs() {
    const sky = NIGHT ? ['#1f2a5a', '#3a4884'] : SKY[SEASON];
    return `<defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <pattern id="${id('Wall')}" width="26" height="60" patternUnits="userSpaceOnUse">
        <rect width="26" height="60" fill="#efe4cf"/><rect width="1.2" height="60" fill="#dccdb2"/><rect x="1.2" width="1" height="60" fill="#f8f0e0"/>
        <path d="M9 12 q2 6 0 12 M18 38 q1.6 5 0 10" stroke="#e3d6bf" stroke-width="0.8" fill="none"/>
      </pattern>
      <pattern id="${id('Cork')}" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#d6ab79"/>
        <circle cx="3" cy="4" r="1" fill="#b98a5c"/><circle cx="10" cy="9" r="1.2" fill="#c0935f"/><circle cx="7" cy="2" r="0.7" fill="#e6c091"/>
        <circle cx="12" cy="3" r="0.6" fill="#a87c50"/><circle cx="4" cy="11" r="0.8" fill="#e2bb8b"/>
      </pattern>
      <pattern id="${id('Floor')}" width="60" height="14" patternUnits="userSpaceOnUse">
        <rect width="60" height="14" fill="#c99e69"/><rect y="13" width="60" height="1" fill="#a47a49"/><rect x="38" width="1" height="13" fill="#a47a49"/>
        <path d="M4 5 h22 M44 8 h12" stroke="#b98f5a" stroke-width="0.7"/>
      </pattern>
      <pattern id="${id('Hatch')}" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <rect width="0.55" height="3.4" fill="#8d8578" opacity="0.45"/>
      </pattern>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id('Hole')}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000"/><stop offset="0.45" stop-color="#3a3a3a"/><stop offset="1" stop-color="#fff"/></radialGradient>
      <clipPath id="${id('Glass')}"><rect x="26" y="54" width="92" height="150"/></clipPath>
    </defs>`;
  }

  // ---------------------------------------------------------------- the room
  function room() {
    let s = `<rect width="400" height="540" fill="${url('Wall')}"/>
      <rect y="0" width="400" height="16" fill="#b98f5a"/><rect y="13" width="400" height="4" fill="#94703f"/><path d="M0 5 H400" stroke="#cda274" stroke-width="1"/>
      <rect y="${FY - 8}" width="400" height="9" fill="#e4d6bd"/><rect y="${FY}" width="400" height="${540 - FY}" fill="${url('Floor')}"/>
      <rect y="${FY}" width="400" height="10" fill="#3b2a1a" opacity="0.08"/>`;
    // a pot of ivy hanging from the beam over the window
    s += `<path d="M72 17 L60 62 M72 17 L84 62" stroke="#b5a184" stroke-width="1"/>
      <path d="M61 70 q-6 10 -2 22 M66 72 q-3 8 1 16 M82 70 q7 9 3 20" stroke="#6f9a6a" stroke-width="1.3" fill="none"/>
      ${[[59, 80], [57, 90], [66, 82], [67, 89], [84, 78], [86, 88], [62, 62], [72, 58], [82, 62]].map(([x, y], i) => oval(x, y, 4, 2.6, i % 2 ? '#8dbb80' : '#6f9a6a')).join('')}
      <path d="M58 62 h28 l-3 12 q-1 3 -4 3 h-14 q-3 0 -4 -3Z" fill="#efb4ae"/><path d="M58 62 h28 v3 h-28Z" fill="#f4c8c2"/>`;
    // a striped rag rug
    const ry = FY + 33;
    s += `${oval(200, ry, 160, 17, '#a6d3d4')}${oval(200, ry, 146, 13, '#f6efe3')}${oval(200, ry, 128, 9.6, '#efb4ae')}${oval(200, ry, 108, 6.4, '#f6efe3')}${oval(200, ry, 86, 3.5, '#bba9df')}`;
    return s;
  }

  // the window: frame, sill, a pot of herbs and the season outside
  function windowView() {
    let out = `<rect x="26" y="54" width="92" height="150" fill="${url('Sky')}"/>`;
    if (!NIGHT && SEASON === 'summer') out += `${dot(100, 76, 16, '#fff3c4', 0.5)}${dot(100, 76, 10, '#fbe08f')}`;
    else if (!NIGHT && SEASON !== 'winter') out += `<path d="M84 84 q4 -6 10 -3 q4 -6 11 -1 q6 0 6 5 H84Z" fill="#fff" opacity="0.8"/>`;
    const h = HILL[SEASON];
    out += `<path d="M26 166 Q56 148 84 160 T118 152 V204 H26Z" fill="${h[0]}"/><path d="M26 186 Q72 172 118 182 V204 H26Z" fill="${h[1]}"/>`;
    // a garden fence and the tree
    out += `<path d="M26 184 H118 M26 190 H118" stroke="#d8c5a4" stroke-width="1.6"/>`;
    for (let x = 30; x < 118; x += 11) out += `<path d="M${x} 194 V180 l2 -2.4 l2 2.4 V194Z" fill="#e8dcc4"/>`;
    out += `<path d="M44 204 Q46 160 48 128 M47 150 Q38 138 32 124 M48 140 Q58 128 66 116" stroke="#8a6142" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    const blobs = [[36, 112, 17], [55, 98, 19], [68, 118, 15], [44, 128, 13], [58, 124, 12]];
    if (SEASON === 'spring') out += blobs.map(([x, y, r]) => dot(x, y, r, '#a8d08e')).join('') + blobs.map(([x, y], i) => dot(x - 5 + (i % 3) * 5, y - 4 + (i % 2) * 7, 2.6, '#f7c3d6') + dot(x + 6, y + 2, 2.2, '#fbd9e4')).join('');
    if (SEASON === 'summer') out += blobs.map(([x, y, r]) => dot(x, y, r, '#79ad66')).join('') + blobs.map(([x, y]) => dot(x - 4, y - 5, 5, '#93c47d', 0.8)).join('');
    if (SEASON === 'autumn') out += blobs.slice(0, 4).map(([x, y, r], i) => dot(x, y, r * 0.9, ['#e09a45', '#d0603d', '#e9b23c', '#c97a3a'][i])).join('');
    if (SEASON === 'winter') out += `<path d="M47 150 Q38 138 32 124 M48 140 Q58 128 66 116 M48 128 L50 112" stroke="#f4f8fb" stroke-width="1.6" fill="none" stroke-linecap="round"/>${oval(72, 204, 50, 8, '#f8fbfd')}`;
    // drifting things, inside the glass only
    const fall = { spring: ['#f7c3d6', 2.4, 1.5], autumn: ['#d9822b', 3.4, 1.7], winter: ['#ffffff', 1.7, 1.7] }[SEASON];
    if (fall) {
      for (let i = 0; i < 9; i++) {
        const x = 30 + ((i * 29) % 86), y = 62 + ((i * 47) % 130);
        const c = SEASON === 'autumn' ? ['#d9822b', '#c4462f', '#e9b23c'][i % 3] : fall[0];
        out += `<ellipse class="bt-fall" cx="${x}" cy="${y}" rx="${fall[1]}" ry="${fall[2]}" fill="${c}" style="animation-delay:-${((i * 1.37) % 12).toFixed(1)}s"/>`;
      }
    }
    if (NIGHT) {
      out += `<rect x="26" y="54" width="92" height="150" fill="#18204a" opacity="0.55"/>`;
      for (let i = 0; i < 14; i++) out += `<circle class="star" cx="${f1(30 + ((i * 37) % 86))}" cy="${f1(58 + ((i * 13) % 40))}" r="${f1(0.6 + (i % 3) * 0.35)}" fill="#fff"/>`;
      out += `<path d="M98 66 a11 11 0 1 0 8 19 a8.6 8.6 0 1 1 -8 -19Z" fill="#fff3cf"/>${dot(102, 76, 18, '#fff3cf', 0.08)}`;
    }
    let s = `${shadow(72, 230, 64, 4)}<rect x="18" y="46" width="108" height="166" rx="3" fill="#f3ead9"/>
      <g clip-path="${url('Glass')}">${out}</g>
      <path d="M30 120 L60 58 M42 150 L86 58" stroke="#fff" stroke-width="5" opacity="${NIGHT ? 0.05 : 0.18}"/>
      <rect x="70.5" y="54" width="3" height="150" fill="#f3ead9"/><rect x="26" y="127" width="92" height="3" fill="#f3ead9"/>
      <rect x="26" y="54" width="92" height="150" fill="none" stroke="#dccdb2" stroke-width="1.2"/>
      <rect x="12" y="204" width="120" height="9" rx="2" fill="#f6efe3"/><rect x="14" y="213" width="116" height="4" fill="#d9c9ac"/>`;
    if (SEASON === 'winter') s += `<path d="M27 203 q10 -4 20 0 q12 -3 22 0 M75 203 q14 -4 42 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    // herbs on the sill
    s += `<path d="M100 190 Q102 176 98 168 M106 190 Q106 172 112 164 M103 190 Q100 180 92 176" stroke="#6f9a6a" stroke-width="1.6" fill="none"/>
      ${oval(98, 168, 4, 2.4, '#7fae74')}${oval(112, 164, 4.4, 2.4, '#6f9a6a')}${oval(92, 176, 4, 2.2, '#8dbb80')}${oval(104, 176, 3.6, 2, '#7fae74')}
      <path d="M94 190 h20 l-2 14 h-16Z" fill="#d98b63"/><rect x="92.5" y="188" width="23" height="4.4" rx="1" fill="#e7a27d"/>`;
    return s;
  }

  // fairy lights in swags under the beam; bright and haloed in the evening
  function lights() {
    let wire = 'M0 17', bulbs = '';
    const cols = ['#f2d88a', '#efb4ae', '#a6d3d4', '#c6dcb4'];
    for (let k = 0; k < 4; k++) {
      const a = k * 100, b = a + 100;
      wire += ` Q${a + 50} 33 ${b} 17`;
      for (const t of [0.25, 0.5, 0.75]) {
        const x = a + 100 * t, y = 17 + 2 * t * (1 - t) * 16 + 2;
        const c = cols[(k * 3 + t * 4) % 4];
        if (NIGHT) bulbs += `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="12" ry="12" fill="${url('Glow')}"/>`;
        bulbs += `<rect x="${f1(x - 1.4)}" y="${f1(y - 2.6)}" width="2.8" height="2.4" fill="#8a7a62"/>${oval(x, y + 2, 2.4, 3.2, NIGHT ? light(c, 0.2) : c, NIGHT ? 1 : 0.85)}`;
      }
    }
    return `<path d="${wire}" stroke="#7a6a52" stroke-width="0.9" fill="none"/>${bulbs}`;
  }

  // ------------------------------------------------------------ the board
  function board() {
    return `<rect x="141" y="33" width="246" height="290" rx="4" fill="#3b2a1a" opacity="0.14"/>
      <rect x="138" y="30" width="246" height="290" rx="4" fill="#b98f5a"/><rect x="138" y="30" width="246" height="3" rx="1.5" fill="#d2ab78"/>
      <rect x="146" y="38" width="230" height="274" fill="${url('Cork')}"/><rect x="146" y="38" width="230" height="5" fill="#3b2a1a" opacity="0.12"/>
      <rect x="146" y="38" width="4" height="274" fill="#3b2a1a" opacity="0.08"/>`;
  }
  // the BETA tape label across the top of the board
  function tape() {
    return `<g transform="translate(261 33) rotate(-4)">
      <path d="M-28 -9 l2 3 l-2 3 l2 3 l-2 3 l2 3 l-2 3 H28 l-2 -3 l2 -3 l-2 -3 l2 -3 l-2 -3 l2 -3Z" fill="#f2d88a" opacity="0.92"/>
      <text x="0" y="4.6" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="900" letter-spacing="2" fill="#6b6157">BETA</text></g>`;
  }

  // pencil or colour: every shape on a card goes through P (filled) or L (a line)
  let COL = false;
  const PEN = '#8d8578', LINE = '#6b6157';
  function P(d, fill, hatch) {
    if (COL) return `<path d="${d}" fill="${fill}" stroke="${LINE}" stroke-width="1" stroke-linejoin="round"/>`;
    return `<path d="${d}" fill="${hatch ? url('Hatch') : 'none'}" stroke="${PEN}" stroke-width="0.9" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${PEN}" stroke-width="0.5" opacity="0.45" transform="translate(0.8 -0.6)"/>`;
  }
  const E = (cx, cy, rx, ry, fill, hatch) => P(ovalD(cx, cy, rx, ry), fill, hatch);
  const L = (d, col, w = 1.6) => `<path d="${d}" fill="none" stroke="${COL ? col : PEN}" stroke-width="${COL ? w : Math.max(0.9, w * 0.6)}" stroke-linecap="round" stroke-linejoin="round"/>`;

  // the little drawings, in card units (100 x 116; picture in 8..92 x 12..94)
  const ART = {
    cups() {
      const shelf = (y) => P(`M10 ${y} h80 v4 h-80Z`, '#b98f5a', true) + P(`M18 ${y + 4} v8 l6 -8Z M82 ${y + 4} v8 l-6 -8Z`, '#a47a49');
      const cup = (x, y, c) => L(`M${x + 6.4} ${y - 10.6} q5.6 -0.4 5 3.6 q-0.5 3.4 -5.8 3.4`, dark(c), 2) +
        P(`M${x - 7} ${y - 13} h14 l-1.6 11 q-0.3 2 -2.3 2 h-6.2 q-2 0 -2.3 -2Z`, c, c === '#d98b63') + E(x, y - 13, 7, 1.6, light(c, 0.5));
      return shelf(44) + shelf(82) + cup(27, 44, '#efb4ae') + cup(50, 44, '#a6d3d4') + cup(73, 44, '#d98b63') +
        cup(26, 82, '#f2d88a') + cup(49, 82, '#bba9df') + cup(72, 82, '#6f9a6a');
    },
    feed() {
      let s = P('M10 90 L12 42 Q10 34 16 33 L36 31 Q43 31 42 39 L45 90 Q45 93 42 93 H13 Q10 93 10 90Z', '#e8cf9f', true) +
        L('M12 44 Q27 40 43 42', '#c9a46a', 1.2) + P('M17 55 h22 v18 h-22Z', '#fffaf1');
      // a paw on the bag
      s += E(28, 67, 3.4, 2.6, '#d98b63') + E(23.6, 61.6, 1.4, 1.4, '#d98b63') + E(27, 59.6, 1.4, 1.4, '#d98b63') + E(31, 60, 1.4, 1.4, '#d98b63') + E(33.6, 63, 1.3, 1.3, '#d98b63');
      const bowl = (x, y, c) => P(`M${x - 11} ${y - 5} Q${x - 10} ${y + 5} ${x} ${y + 5} Q${x + 10} ${y + 5} ${x + 11} ${y - 5}Z`, c, true) +
        E(x, y - 5, 11, 3, light(c, 0.45)) + P(`M${x - 7.6} ${y - 5.4} Q${x} ${y - 12} ${x + 7.6} ${y - 5.4}Z`, '#c99a5a');
      s += bowl(63, 87, '#8fbfe6') + bowl(85, 87, '#efb4ae');
      return s + E(54, 93, 1.2, 1, '#b98f5a') + E(49, 90, 1.1, 0.9, '#b98f5a');
    },
    hose() {
      let s = P('M4 24 h14 v9 h-14Z', '#b9c4cb', true) + P('M17 20 h11 v14 h-11Z', '#a6b4bd') + P('M20 34 h5 v7 h-5Z', '#a6b4bd') +
        L('M22.5 20 v-6 M16.5 14 h12', '#d98b63', 2.6);
      s += L('M22.5 41 V56 H64 V64', '#6f9a6a', 4.4) + E(22.5, 56, 3.2, 3.2, '#5c8458') + E(64, 56, 3.2, 3.2, '#5c8458');
      s += P('M64 67 q-2 3 0 4.4 q2 -1.4 0 -4.4Z', '#8fbfe6');
      // the flower in its pot
      s += L('M77 72 V44', '#6f9a6a', 1.8) + P('M77 60 q-9 -2 -10 -9 q8 0 10 9Z', '#8dbb80') + P('M77 54 q8 -2 9 -8 q-7 0 -9 8Z', '#8dbb80');
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; s += E(77 + Math.cos(a) * 5, 38 + Math.sin(a) * 5, 3.8, 3.8, '#efb4ae'); }
      s += E(77, 38, 3, 3, '#f2d88a');
      s += P('M60 76 h30 l-3 17 q-0.5 2 -2.5 2 h-19 q-2 0 -2.5 -2Z', '#d98b63', true) + P('M58 71 h34 v5.4 h-34Z', '#e7a27d');
      return s;
    },
    beds() {
      let s = P('M80 13 A12 12 0 1 0 92 33 A9.4 9.4 0 0 1 80 13Z', '#f2d88a') + P(star(22, 24, 4.6, 2), '#f2d88a') +
        P(star(46, 16, 3.4, 1.5, 10), '#f2d88a') + P(star(60, 34, 2.8, 1.2), '#f2d88a');
      // the back bed with a sleeping pup, the front one with a curled cat
      s += E(70, 66, 21, 8.4, '#a6d3d4', true) + E(70, 64, 15, 5, light('#a6d3d4', 0.5)) +
        E(72, 60.4, 11, 5, '#d9b48a') + E(61, 60.6, 5, 4.2, '#d9b48a') + P('M57.4 58 q-3 1 -2.4 5 q2.4 -0.6 3.6 -3Z', '#b98f5a') + L('M59.4 61 q1 0.8 2 0', LINE, 0.8);
      s += E(32, 84, 23, 9, '#efb4ae', true) + E(32, 82, 17, 5.4, light('#efb4ae', 0.5)) +
        E(30, 78.4, 11, 5.2, '#e39a52') + E(41, 78.6, 4.8, 4.2, '#e39a52') + P('M38.4 75.6 l0.6 -4 l2.6 2.4Z M42.4 74.8 l2.6 -2.4 l0.4 3.6Z', '#e39a52') +
        L('M39.6 79 q0.9 0.7 1.8 0', LINE, 0.8) + L('M19.6 80 q-2 3 3 3.6 h10', '#c4793a', 2);
      return s + L('M84 46 h5 l-5 6 h5 M91 38 h3.6 l-3.6 4.4 h3.6', '#8a83a8', 1.2);
    },
  };

  // one pinned card, unsolved (pencil, askew) or solved (colour, gold star)
  function card(part, done) {
    const c = CARDS[part];
    COL = done;
    const tilt = done ? c.tilt * 0.2 : c.tilt;
    let s = `<g data-part="${part}" transform="translate(${c.x} ${c.y}) rotate(${tilt}) translate(-50 -58)">
      <rect x="-6" y="-8" width="112" height="132" fill="#000" fill-opacity="0"/>
      <rect x="2" y="3.4" width="100" height="116" rx="2" fill="#3b2a1a" opacity="0.2"/>
      <rect width="100" height="116" rx="2" fill="${done ? '#fffaf1' : '#f3e9d4'}"/>`;
    if (done) s += `<rect x="6" y="12" width="88" height="84" rx="4" fill="${c.tint}" opacity="0.3"/>`;
    else s += '<path d="M8 99 H92 M8 9 H40" stroke="#d9cdb6" stroke-width="0.7"/><path d="M100 102 L86 116 H98 q2 0 2 -2Z" fill="#e2d5bc"/>';
    s += ART[part]();
    s += `<text x="${done ? 46 : 50}" y="110" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="800" fill="${done ? '#3b352e' : PEN}">${c.label}</text>`;
    if (done) {
      s += `<g transform="rotate(12 86 101)"><path d="${star(86, 101, 12, 5.6)}" fill="#e9bf4f" stroke="#c99a2e" stroke-width="0.8" stroke-linejoin="round"/>
        <path d="${star(86, 101, 7.4, 3.4)}" fill="#f6d77a"/>${dot(83, 96.6, 1.4, '#fff', 0.8)}</g>`;
    }
    // the pin
    const pin = done ? c.pin : '#d98b63';
    s += `${oval(52, 10, 4.6, 2.4, '#3b2a1a', 0.25)}${dot(50, 7, 5, pin)}${dot(50, 7, 3.6, light(pin, 0.25))}${dot(48.4, 5.4, 1.4, '#fff', 0.8)}</g>`;
    COL = false;
    return s;
  }

  // ------------------------------------------------------- the work table
  function lamp() {
    const bulb = NIGHT ? '#fff3c4' : '#f6e6b8';
    return `${shadow(54, 367, 22, 3)}${oval(54, 362, 17, 4.6, '#5c8458')}<rect x="51" y="352" width="6" height="10" rx="2" fill="#5c8458"/>
      <path d="M54 354 L36 300 L84 270" stroke="#6f9a6a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${dot(36, 300, 4.2, '#5c8458')}${dot(84, 270, 3.6, '#5c8458')}
      <g transform="translate(88 274) rotate(-28)"><path d="M-6 -6 H6 L16 16 H-16Z" fill="#6f9a6a"/><path d="M-6 -6 H6 L8 -2 H-8Z" fill="#82ad7c"/>
      ${oval(0, 16, 16, 3.6, '#5c8458')}${oval(0, 16.4, 9, 2.6, bulb)}</g>`;
  }
  function table(st) {
    // drawn DY higher than it shows, so the legs reach down to FY
    const leg = FY - DY - 376;
    let s = `${shadow(200, FY - DY + 4, 190, 6)}
      <rect x="14" y="376" width="13" height="${leg}" fill="#a47a49"/><rect x="373" y="376" width="13" height="${leg}" fill="#a47a49"/>
      <rect x="27" y="380" width="346" height="7" fill="#94703f"/>
      <path d="M10 350 H390 L398 366 H2Z" fill="#d6b07e"/><path d="M14 352 H386" stroke="#e6c597" stroke-width="1.2"/>
      <rect x="2" y="366" width="396" height="12" rx="1.5" fill="#b98f5a"/><rect x="2" y="376" width="396" height="2.4" fill="#94703f"/>`;
    // under the table: a pile of puzzle books and a basket of wool
    s += `<g transform="translate(0 ${FY - DY - 458})">${shadow(80, 459, 34, 3)}<rect x="52" y="445" width="56" height="13" rx="2" fill="#a6d3d4"/><rect x="56" y="433" width="50" height="12" rx="2" fill="#efb4ae"/><rect x="60" y="423" width="40" height="10" rx="2" fill="#bba9df"/>
      <path d="M52 449 H108 M56 437 H106 M60 426.6 H100" stroke="#fffaf1" stroke-width="1" opacity="0.6"/>
      ${shadow(306, 459, 36, 3)}${dot(292, 434, 9, '#f2d88a')}${dot(310, 431, 10, '#a6d3d4')}${dot(325, 437, 8, '#efb4ae')}
      <path d="M272 438 H340 L334 458 H278Z" fill="#c99e69"/><path d="M274 444 H338 M276 450 H336" stroke="#a47a49" stroke-width="1.2"/>
      <path d="M284 438 V458 M296 438 V458 M308 438 V458 M320 438 V458 M332 438 V458" stroke="#b98f5a" stroke-width="0.8"/></g>`;
    s += lamp();
    // a mug of tea, steaming
    s += `${shadow(120, 361, 14, 2)}<path d="M131 340 q8 0 8 7 q0 6 -8 6" stroke="#c4704b" stroke-width="3" fill="none"/>
      <path d="M109 336 h22 v20 q0 4 -4 4 h-14 q-4 0 -4 -4Z" fill="#d98b63"/>${oval(120, 336, 11, 2.6, '#e7a27d')}${oval(120, 336.4, 9, 1.8, '#8a5a3a')}
      <path d="M113 346 h14" stroke="#f2d88a" stroke-width="2"/>
      <g class="bt-steam"><path d="M116 330 q-3 -5 0 -9 q3 -4 0 -8" stroke="#fffaf1" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.75"/><path d="M124 331 q-3 -5 0 -9 q3 -4 0 -8" stroke="#fffaf1" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.75"/></g>`;
    // a jar of pencils
    const pencil = (x, top, rot, c) => `<g transform="rotate(${rot} ${x} 350)"><rect x="${x - 2}" y="${top}" width="4" height="${350 - top}" fill="${c}"/><path d="M${x - 2} ${top} L${x} ${top - 6} L${x + 2} ${top}Z" fill="#f1dcb4"/>${dot(x, top - 5, 0.9, '#6b6157')}</g>`;
    s += `${shadow(162, 361, 14, 2)}${pencil(155, 312, -10, '#f2d88a')}${pencil(161, 306, -2, '#efb4ae')}${pencil(167, 314, 8, '#6f9a6a')}${pencil(172, 318, 16, '#8fbfe6')}
      <path d="M150 330 h24 v26 q0 4 -4 4 h-16 q-4 0 -4 -4Z" fill="#a6d3d4" opacity="0.92"/>${oval(162, 330, 12, 2.4, '#c6e4e4')}<path d="M154 336 v18" stroke="#fffaf1" stroke-width="2" opacity="0.6"/>`;
    // a sketch pad
    s += `<path d="M188 352 L230 350 L236 360 L192 362Z" fill="#fffaf1"/><path d="M196 355 q8 -3 14 0 t14 -1" stroke="#b5ab9c" stroke-width="0.8" fill="none"/>`;
    s += cat() + wool();
    return s;
  }
  // a ginger cat curled up asleep on the table
  function cat() {
    const fur = '#e39a52', dk = '#b8692e', lt = '#f6c48a';
    return `${shadow(284, 361, 30, 2.6)}<g class="bt-breathe">${oval(288, 348, 26, 12.4, fur)}${oval(286, 344, 18, 5, lt, 0.6)}
      <path d="M276 338 q3 5 0 11 M286 336 q3 6 0 13 M296 337 q3 5 0 11" stroke="${dk}" stroke-width="1.6" fill="none" opacity="0.7"/></g>
      <path d="M312 352 q4 8 -10 9 h-34" stroke="${fur}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M276 361 h-6" stroke="${dk}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
      ${dot(264, 350, 10, fur)}<path d="M256 344 l-1 -9 l7 5Z M266 340 l6 -6 l1 9Z" fill="${fur}"/><path d="M257 342 l-0.4 -4 l3 2.4Z M268 339 l3 -3 l0.4 4Z" fill="#f4a9b8"/>
      <path d="M258 351 q2 1.6 4 0 M266 351 q2 1.6 4 0" stroke="#5a3a22" stroke-width="1" fill="none" stroke-linecap="round"/>${dot(264, 354, 1, '#e2768b')}
      ${oval(264, 356, 4.6, 2.4, lt)}<path d="M257 354.6 l-6 -0.4 M257 356 l-5.6 1.6 M271 354.6 l6 -0.4" stroke="#fff" stroke-width="0.5" opacity="0.85"/>
      <path d="M281 332 h5 l-5 6 h5 M291 323 h4 l-4 5 h4" stroke="#8a83a8" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`;
  }
  // a ball of lavender wool with needles, its strand trailing off the table
  function wool() {
    return `${shadow(348, 361, 16, 2.4)}<path d="M340 358 q-6 12 4 22 q8 8 2 22" stroke="#bba9df" stroke-width="1.6" fill="none"/>
      ${dot(348, 346, 14, '#bba9df')}<path d="M336 340 q12 -6 24 4 M335 348 q13 -8 26 2 M338 355 q10 -6 22 -2 M342 334 q-2 12 4 25 M352 333 q-4 12 2 26" stroke="#9c89c6" stroke-width="1.1" fill="none"/>
      <path d="M330 322 L360 362 M368 324 L338 360" stroke="#b98f5a" stroke-width="2.2" stroke-linecap="round"/>${dot(330, 322, 2.6, '#d98b63')}${dot(368, 324, 2.6, '#d98b63')}`;
  }

  // evening: darken the room except near the lamp; glow, warm pool on the table
  function night() {
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    return `<g class="night" pointer-events="none">
      <mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><rect x="26" y="${54 + DY}" width="92" height="150" fill="#000"/><ellipse cx="120" cy="${330 + DY}" rx="310" ry="250" fill="${url('Hole')}"/></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.5" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.14" mask="url(#${id('Dark')})"/>
      <g transform="translate(0 ${DY})">${glow(110, 320, 190, 130)}${glow(130, 356, 120, 16)}<path d="M80 290 L64 352 H180 L108 284Z" fill="#ffe9b0" opacity="0.12"/></g></g>`;
  }

  const SPOTS = Object.fromEntries(Object.entries(CARDS).map(([k, c]) => [k, [c.x, c.y + DY]]));
  function sparkles(part) {
    if (!part) return '';
    const spot = SPOTS[part] || [260, 175];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 30 + (i % 3) * 12;
      const x = spot[0] + Math.cos(a) * d, y = spot[1] + Math.sin(a) * d * 0.9;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${f1(x)} ${f1(y - 6)} L${f1(x + 1.5)} ${f1(y - 1.5)} L${f1(x + 6)} ${f1(y)} L${f1(x + 1.5)} ${f1(y + 1.5)} L${f1(x)} ${f1(y + 6)} L${f1(x - 1.5)} ${f1(y + 1.5)} L${f1(x - 6)} ${f1(y)} L${f1(x - 1.5)} ${f1(y - 1.5)}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles" pointer-events="none">${s}</g>`;
  }

  // st: map of solved puzzle -> true; cols is not used; opts as for
  // RESCUE.render (season, night, fresh, uid; pct, pending and decor unused)
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; NIGHT = !!opts.night;
    const cards = Object.keys(CARDS).map((p) => card(p, !!st[p])).join('');
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house beta">
      ${style()}${defs()}${room()}<g transform="translate(0 ${DY})">${windowView()}${board()}${cards}${tape()}${table(st)}</g>
      ${NIGHT ? night() : ''}${lights()}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, PARTS: Object.keys(SPOTS) };
})();
