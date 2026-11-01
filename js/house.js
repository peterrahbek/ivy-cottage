'use strict';
// The cottage overview, drawn as SVG. Each restorable part has a tired look
// and a restored look; colours chosen while painting carry over here.

const HOUSE = (() => {
  const VB = { w: 400, h: 540 };

  function seeded(seed) { return U.rng(seed); }

  // set at the start of every render: the season and which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost')
  let SEASON = 'spring', PEND = {};
  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILLS = { spring: ['#b6d2ad', '#a0c493'], summer: ['#a9cf98', '#8fc27b'], autumn: ['#d4c08e', '#c6aa6c'], winter: ['#e6edf2', '#dbe4ea'] };
  const CANOPY = { spring: ['#6f9d5c', '#7aa866'], summer: ['#5f9a4c', '#6aa858'], autumn: ['#d9822b', '#c9692f'], winter: null };

  function defs() {
    return `
    <defs>
      <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="hSun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <pattern id="pTall" width="14" height="12" patternUnits="userSpaceOnUse">
        <rect width="14" height="12" fill="#6a9846"/>
        <path d="M2 12 Q3 6 1 2 M5 12 Q6 7 7 3 M9 12 Q8 6 10 1 M12 12 Q13 8 12 4" stroke="#4f8034" stroke-width="1.2" fill="none"/>
        <path d="M3.5 12 Q5 8 4 5 M10.5 12 Q11 9 13 6" stroke="#88b35c" stroke-width="1" fill="none"/>
      </pattern>
      <pattern id="pDandelion" width="46" height="38" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="9" r="1.8" fill="#f3cf3a"/><circle cx="31" cy="27" r="1.6" fill="#f3cf3a"/><circle cx="22" cy="6" r="1.4" fill="#fff"/>
      </pattern>
      <pattern id="pStripes" width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="#7cbb57"/><rect width="14" height="28" fill="#93cb6a"/>
      </pattern>
      <pattern id="pMoss" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#8d9466"/>
        <circle cx="4" cy="5" r="3" fill="#6f8a3e"/><circle cx="12" cy="11" r="3.5" fill="#748f42"/><circle cx="11" cy="3" r="1.5" fill="#a5a86c"/>
      </pattern>
      <pattern id="pFlags" width="30" height="22" patternUnits="userSpaceOnUse">
        <rect width="30" height="22" fill="#b9aa8d"/>
        <rect x="1" y="1" width="16" height="9" rx="2" fill="#ddd3c0"/><rect x="19" y="1" width="10" height="9" rx="2" fill="#d2c6b0"/>
        <rect x="1" y="12" width="9" height="9" rx="2" fill="#d6cbb7"/><rect x="12" y="12" width="17" height="9" rx="2" fill="#e2d9c8"/>
      </pattern>
      <pattern id="pTilesOld" width="14" height="10" patternUnits="userSpaceOnUse">
        <rect width="14" height="10" fill="#7c6d55"/>
        <path d="M0 9.5 H14" stroke="#5e5240" stroke-width="1"/><path d="M7 0 V9.5" stroke="#5e5240" stroke-width="0.8"/>
        <circle cx="3" cy="4" r="2.6" fill="#6f8a3e"/><circle cx="11" cy="7" r="2" fill="#81974a"/>
      </pattern>
      <pattern id="pTiles" width="14" height="10" patternUnits="userSpaceOnUse">
        <rect width="14" height="10" fill="#c96f4f"/>
        <path d="M0 9.5 H14" stroke="#9e4f36" stroke-width="1.2"/><path d="M7 0 V9.5" stroke="#a9553a" stroke-width="0.8"/>
        <rect x="1" y="1" width="5" height="2" rx="1" fill="#de8c69"/>
      </pattern>
      <pattern id="pStain" width="60" height="50" patternUnits="userSpaceOnUse">
        <ellipse cx="14" cy="18" rx="12" ry="8" fill="#000" opacity="0.07"/><ellipse cx="44" cy="38" rx="10" ry="12" fill="#000" opacity="0.06"/>
        <path d="M34 4 l3 6 l-2 5 l3 7" stroke="#6b5f4d" stroke-width="0.7" fill="none" opacity="0.6"/>
      </pattern>
      <pattern id="pPlaster" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="7" r="1" fill="#fff" opacity="0.18"/><circle cx="20" cy="22" r="1.2" fill="#000" opacity="0.05"/><circle cx="24" cy="6" r="0.8" fill="#000" opacity="0.06"/>
      </pattern>
      <linearGradient id="gRoom" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe4a8"/><stop offset="1" stop-color="#f0a95f"/>
      </linearGradient>
      <linearGradient id="gGrime" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7f7a69"/><stop offset="1" stop-color="#5f5a4e"/>
      </linearGradient>
      <linearGradient id="gPond" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7cc7d8"/><stop offset="1" stop-color="#3f8ea6"/>
      </linearGradient>
      <pattern id="pSnow" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="pLeaves" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>
      <linearGradient id="gFrost" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/>
      </linearGradient>
      <linearGradient id="gDusty" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/>
      </linearGradient>
      <filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>`;
  }

  // -------------------------------------------------------------- pieces
  function sky() {
    return `
    <rect width="400" height="300" fill="url(#hSky)"/>
    <circle cx="330" cy="62" r="46" fill="url(#hSun)"/>
    <circle cx="330" cy="62" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="#ffffff" opacity="0.92">
      <ellipse cx="70" cy="62" rx="26" ry="11"/><ellipse cx="90" cy="55" rx="18" ry="13"/><ellipse cx="108" cy="63" rx="20" ry="9"/>
    </g>
    <g class="cloud c2" fill="#ffffff" opacity="0.8">
      <ellipse cx="240" cy="36" rx="20" ry="8"/><ellipse cx="256" cy="31" rx="14" ry="10"/><ellipse cx="271" cy="37" rx="15" ry="7"/>
    </g>
    <path d="M0 214 Q70 186 150 204 T300 196 T400 202 V300 H0Z" fill="${HILLS[SEASON][0]}"/>
    <path d="M0 238 Q90 214 190 232 T400 226 V300 H0Z" fill="${HILLS[SEASON][1]}"/>
    ${bgTree(26, 214, 30, 0)}${bgTree(84, 222, 24, 1)}${bgTree(352, 214, 32, 0)}${bgTree(386, 230, 22, 1)}`;
  }
  function bgTree(x, y, r, which) {
    if (!CANOPY[SEASON]) {
      return `<g stroke="#7a6252" stroke-linecap="round" fill="none"><path d="M${x} ${y + r * 0.9} V${y - r * 0.4}" stroke-width="3"/>
        <path d="M${x} ${y} l-${r * 0.4} -${r * 0.4} M${x} ${y - r * 0.15} l${r * 0.45} -${r * 0.35} M${x} ${y - r * 0.3} l-${r * 0.2} -${r * 0.35}" stroke-width="1.6"/></g>
        <ellipse cx="${x}" cy="${y + r * 0.92}" rx="${r * 0.5}" ry="2" fill="#fff"/>`;
    }
    const col = CANOPY[SEASON][which];
    return `<g><rect x="${x - 2}" y="${y}" width="4" height="${r * 0.9}" fill="#6b5240"/>
      <circle cx="${x}" cy="${y - r * 0.15}" r="${r * 0.62}" fill="${col}"/><circle cx="${x - r * 0.35}" cy="${y + r * 0.1}" r="${r * 0.45}" fill="${col}"/><circle cx="${x + r * 0.35}" cy="${y + r * 0.08}" r="${r * 0.48}" fill="${U.shade(col, -0.1)}"/>
      <circle cx="${x - r * 0.15}" cy="${y - r * 0.35}" r="${r * 0.3}" fill="${U.shade(col, 0.15)}"/></g>`;
  }

  function lawnPart(id, pts, done) {
    const d = 'M' + pts.map((p) => p.join(' ')).join(' L') + 'Z';
    const pend = PEND[id === 'lawnFront2' ? 'lawnFront' : id];
    const tag = id === 'lawnFront2' ? 'lawnFront' : id;
    if (!done || pend === 'grow') return `<g data-part="${tag}"><path d="${d}" fill="url(#pTall)"/><path d="${d}" fill="url(#pDandelion)"/></g>`;
    if (pend === 'leaves') return `<g data-part="${tag}"><path d="${d}" fill="url(#pStripes)"/><path d="${d}" fill="url(#pLeaves)"/><path d="${d}" fill="url(#pLeaves)" transform="translate(11 7)"/></g>`;
    if (SEASON === 'winter' || pend === 'snow') return `<g data-part="${tag}"><path d="${d}" fill="url(#pSnow)"/></g>`;
    return `<g data-part="${tag}"><path d="${d}" fill="url(#pStripes)"/>${SEASON === 'autumn' ? `<path d="${d}" fill="url(#pLeaves)" opacity="0.35"/>` : ''}</g>`;
  }

  function roof(st) {
    const left = 'M88 172 L200 76 L200 172 Z', right = 'M200 76 L312 172 L200 172 Z';
    return `
      <g data-part="roofLeft"><path d="${left}" fill="url(#${st.roofLeft && !PEND.roofLeft ? 'pTiles' : 'pTilesOld'})"/></g>
      <g data-part="roofRight"><path d="${right}" fill="url(#${st.roofRight && !PEND.roofRight ? 'pTiles' : 'pTilesOld'})"/></g>
      ${SEASON === 'winter' ? '<path d="M86 172 L200 74 L314 172 L300 172 Q290 160 278 168 Q262 150 246 158 L200 104 L154 158 Q138 150 122 168 Q110 160 100 172 Z" fill="#f4f8fb"/>' : ''}
      <path d="M84 174 L200 72 L316 174" fill="none" stroke="${st.roofLeft && st.roofRight ? '#8e4430' : '#5d5243'}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
      <g data-part="atticWin"><circle cx="200" cy="134" r="13" fill="${!st.atticWin ? 'url(#gGrime)' : PEND.atticWin === 'frost' ? 'url(#gFrost)' : 'url(#gRoom)'}" stroke="#efe6d4" stroke-width="3"/></g>
      <path d="M200 121 V147 M187 134 H213" stroke="#efe6d4" stroke-width="2"/>`;
  }

  function chimney(st) {
    const smoke = st.attic
      ? `<g class="smoke" fill="#ffffff"><circle cx="252" cy="80" r="5" opacity="0.7"/><circle cx="256" cy="68" r="7" opacity="0.5"/><circle cx="252" cy="52" r="9" opacity="0.3"/></g>` : '';
    return `${smoke}<rect x="240" y="88" width="22" height="56" fill="#b0715a"/><rect x="237" y="84" width="28" height="8" rx="2" fill="#8e5744"/>
      <path d="M240 100 H262 M240 112 H262 M240 124 H262" stroke="#9a604b" stroke-width="1"/>`;
  }

  function wall(st, col) {
    const fill = st.wall ? col : '#c9bea6';
    return `<g data-part="wall"><rect x="108" y="168" width="184" height="168" fill="${fill}"/>
      <rect x="108" y="168" width="184" height="168" fill="url(#${st.wall ? 'pPlaster' : 'pStain'})"/>
      <rect x="108" y="168" width="184" height="10" fill="#000" opacity="0.12"/></g>`;
  }

  function windowSvg(x, y, w, h, clean, part, kind) {
    const pend = clean && PEND[part];
    if (pend === 'frost' || pend === 'grow') {
      const g = pend === 'frost' ? 'url(#gFrost)' : 'url(#gDusty)';
      return `<g data-part="${part}"><rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="2" fill="#fbf7ee"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${g}"/>
        ${pend === 'frost' ? `<path d="M${x} ${y + h * 0.3} q${w * 0.2} -4 ${w * 0.3} -${h * 0.3} M${x + w} ${y + h * 0.7} q-${w * 0.2} 4 -${w * 0.35} ${h * 0.3}" stroke="#fff" stroke-width="1.5" fill="none"/>` : ''}
        <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="#fbf7ee" stroke-width="2.5"/>
        <rect x="${x - 6}" y="${y + h + 2}" width="${w + 12}" height="5" rx="1.5" fill="${SEASON === 'winter' ? '#f4f8fb' : '#efe6d4'}"/></g>`;
    }
    const glass = clean ? 'url(#gRoom)' : 'url(#gGrime)';
    const frame = clean ? '#fbf7ee' : '#b8b1a2';
    let inside = '';
    if (clean) {
      const cur = kind === 'bed' ? '#c9a3d9' : kind === 'kitchen' ? '#e98a7c' : '#8fbfe6';
      inside = `<path d="M${x + 2} ${y + 2} h${w * 0.22} q-2 ${h * 0.5} 2 ${h - 4} h-${w * 0.22 + 2}Z" fill="${cur}"/>
        <path d="M${x + w - 2} ${y + 2} h-${w * 0.22} q2 ${h * 0.5} -2 ${h - 4} h${w * 0.22 + 2}Z" fill="${cur}"/>
        <path d="M${x + w * 0.25} ${y + h - 3} l${w * 0.5} -${h * 0.85}" stroke="#fff" stroke-width="${w * 0.08}" opacity="0.28"/>`;
      if (kind === 'living') inside += `<ellipse cx="${x + w * 0.5}" cy="${y + h - 6}" rx="${w * 0.16}" ry="4" fill="#5b4a42"/><circle cx="${x + w * 0.62}" cy="${y + h - 9}" r="3.5" fill="#5b4a42"/>`;
      if (kind === 'kitchen') inside += `<rect x="${x + w * 0.4}" y="${y + h - 13}" width="${w * 0.2}" height="9" rx="2" fill="#6aa86a"/><circle cx="${x + w * 0.5}" cy="${y + h - 16}" r="5" fill="#5f9e55"/>`;
    } else {
      inside = `<path d="M${x + 4} ${y + 6} q${w * 0.3} 6 ${w * 0.6} -2" stroke="#4e4a40" stroke-width="3" opacity="0.4" fill="none"/>
        <path d="M${x + w - 3} ${y + 3} l-8 0 l8 8 Z" fill="#ffffff" opacity="0.35"/>`;
    }
    return `<g data-part="${part}">
      <rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="2" fill="${frame}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glass}"/>${inside}
      <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${frame}" stroke-width="2.5"/>
      <rect x="${x - 6}" y="${y + h + 2}" width="${w + 12}" height="5" rx="1.5" fill="${clean ? '#efe6d4' : '#a59e90'}"/>
    </g>`;
  }

  function door(st, col) {
    const c = st.door ? col : '#8a8170';
    const dk = U.shade(c, -0.22);
    return `<g data-part="door">
      <path d="M178 337 V276 Q178 258 200 258 Q222 258 222 276 V337 Z" fill="${st.wall ? U.shade(st.wallCol, -0.25) : '#9c917b'}"/>
      <path d="M181 336 V277 Q181 262 200 262 Q219 262 219 277 V336 Z" fill="${c}"/>
      <rect x="185" y="282" width="12" height="20" rx="2" fill="none" stroke="${dk}" stroke-width="1.5"/>
      <rect x="203" y="282" width="12" height="20" rx="2" fill="none" stroke="${dk}" stroke-width="1.5"/>
      <rect x="185" y="308" width="12" height="22" rx="2" fill="none" stroke="${dk}" stroke-width="1.5"/>
      <rect x="203" y="308" width="12" height="22" rx="2" fill="none" stroke="${dk}" stroke-width="1.5"/>
      <path d="M186 275 Q200 264 214 275 Z" fill="${st.door ? 'url(#gRoom)' : '#6d675a'}"/>
      <circle cx="214" cy="306" r="2.3" fill="${st.door ? '#e9c35a' : '#77705f'}"/>
      ${st.door ? '' : '<path d="M190 300 l6 3 l-2 6 M206 318 l5 -2 l2 6" stroke="#b9b0a0" stroke-width="1.2" fill="none"/>'}
    </g>
    <rect x="172" y="336" width="56" height="7" rx="2" fill="#b7ada0"/>`;
  }

  function ivy(st) {
    const r = seeded(77);
    let s = '';
    const n = st.wall ? 26 : 120;
    for (let i = 0; i < n; i++) {
      let x, y;
      if (st.wall) { x = 110 + r() * 26; y = 210 + r() * 125; }
      else { const side = r() < 0.6; x = side ? 108 + r() * 70 : 220 + r() * 72; y = (side ? 180 : 230) + r() * (side ? 155 : 105); }
      const col = U.pick(r, ['#4f8a3c', '#5d9644', '#3f7531', '#6aa04c']);
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(3 + r() * 2.5).toFixed(1)}" ry="${(2.2 + r() * 1.6).toFixed(1)}" fill="${col}" transform="rotate(${(r() * 180) | 0} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    return `<g class="ivy">${s}</g>`;
  }

  function shutters(st, col) {
    const c = st.shutters ? col : '#a8a191';
    let s = '';
    for (const [x, y] of [[111, 246], [164, 246], [227, 246], [280, 246]]) {
      s += `<rect x="${x}" y="${y}" width="9" height="54" rx="1" fill="${c}"/>
        <path d="M${x + 1.5} ${y + 8} h6 M${x + 1.5} ${y + 16} h6 M${x + 1.5} ${y + 24} h6 M${x + 1.5} ${y + 32} h6 M${x + 1.5} ${y + 40} h6 M${x + 1.5} ${y + 48} h6" stroke="${U.shade(c, -0.25)}" stroke-width="1"/>`;
    }
    return `<g data-part="shutters">${s}</g>`;
  }

  function beds(st) {
    const r = seeded(91);
    const bed = (id, x0, x1, done, cols) => {
      done = done && PEND[id] !== 'grow';
      if (SEASON === 'winter' && done) return `<g data-part="${id}"><rect x="${x0}" y="338" width="${x1 - x0}" height="16" rx="5" fill="#6b4a33"/><rect x="${x0}" y="338" width="${x1 - x0}" height="8" rx="4" fill="#f4f8fb"/></g>`;
      let s = `<g data-part="${id}"><rect x="${x0}" y="338" width="${x1 - x0}" height="16" rx="5" fill="${done ? '#6b4a33' : '#7a6448'}"/>`;
      for (let i = 0; i < 16; i++) {
        const x = x0 + 4 + r() * (x1 - x0 - 8), y = 341 + r() * 10;
        if (done) s += `<circle cx="${x.toFixed(1)}" cy="${(y + 3).toFixed(1)}" r="3" fill="#4f8a3a"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${U.pick(r, cols)}"/>`;
        else s += `<path d="M${x.toFixed(1)} ${(y + 6).toFixed(1)} l-3 -7 M${x.toFixed(1)} ${(y + 6).toFixed(1)} l1 -9 M${x.toFixed(1)} ${(y + 6).toFixed(1)} l4 -6" stroke="${U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32'])}" stroke-width="1.6"/>`;
      }
      return s + '</g>';
    };
    return bed('bedLeft', 110, 176, st.bedLeft, ['#ef8aa6', '#f5b3c4', '#e0607e']) + bed('bedRight', 224, 290, st.bedRight, ['#f7c548', '#f08a4b', '#ffffff']);
  }

  function path(st) {
    const pend = st.path && PEND.path;
    if (pend === 'snow') return `<g data-part="path"><path d="M186 342 L214 342 L234 540 L166 540 Z" fill="url(#pSnow)"/></g>`;
    if (pend === 'leaves') return `<g data-part="path"><path d="M186 342 L214 342 L234 540 L166 540 Z" fill="url(#pFlags)"/><path d="M186 342 L214 342 L234 540 L166 540 Z" fill="url(#pLeaves)"/></g>`;
    return `<g data-part="path"><path d="M186 342 L214 342 L234 540 L166 540 Z" fill="url(#${st.path ? 'pFlags' : 'pMoss'})"/>
      <path d="M186 342 L166 540 M214 342 L234 540" stroke="${st.path ? '#a8987b' : '#6d7448'}" stroke-width="1.5"/></g>`;
  }

  function steps(st) {
    const pts = [[242, 392], [262, 410], [284, 426], [305, 440]];
    const pend = st.steps && PEND.steps;
    const col = !st.steps || pend === 'grow' ? '#7f8a55' : pend === 'leaves' ? '#c98a4a' : pend === 'snow' || SEASON === 'winter' ? '#f4f8fb' : '#d8d0c2';
    return `<g data-part="steps">${pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 1.5}" rx="9" ry="5" fill="#00000022"/><ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="${col}"/>`).join('')}</g>`;
  }

  function pond(st) {
    return `<g data-part="pond">
      <ellipse cx="336" cy="380" rx="44" ry="16" fill="#9e9584"/>
      <ellipse cx="336" cy="380" rx="40" ry="13.5" fill="${!st.pond || PEND.pond === 'grow' ? '#5f7a3a' : PEND.pond === 'leaves' ? '#7d6a3a' : SEASON === 'winter' ? '#dfeef5' : 'url(#gPond)'}"/>
      ${PEND.pond === 'leaves' ? '<ellipse cx="336" cy="380" rx="38" ry="12" fill="url(#pLeaves)"/>' : ''}
      ${SEASON === 'winter' && st.pond && !PEND.pond ? '<path d="M312 376 l18 -4 M340 386 l20 -5" stroke="#fff" stroke-width="2"/>' : ''}
      ${st.pond && !PEND.pond && SEASON !== 'winter'
        ? `<ellipse cx="322" cy="377" rx="6" ry="2.6" fill="#5fae5a"/><circle cx="324" cy="376" r="1.5" fill="#f7b6c8"/><ellipse cx="350" cy="384" rx="5" ry="2.2" fill="#6bb865"/>
           <path class="koi" d="M330 383 q4 -3 8 0 q-4 3 -8 0 l-3 -2 v4z" fill="#f08a3c"/>`
        : `<circle cx="318" cy="378" r="2" fill="#7f9a4a"/><circle cx="345" cy="383" r="2.5" fill="#86a04e"/><circle cx="335" cy="375" r="1.6" fill="#93a85a"/>`}
    </g>`;
  }

  function tree(st) {
    if (SEASON === 'winter') {
      return `<g class="bigtree"><path d="M44 410 Q48 360 40 320 L56 320 Q52 360 60 410 Z" fill="#6b4a32"/>
        <g stroke="#6b4a32" stroke-linecap="round" fill="none"><path d="M48 322 Q30 290 14 270 M48 322 Q60 288 84 266 M48 322 Q46 280 44 244 M30 296 Q20 296 8 300 M64 296 Q78 300 90 296 M45 270 Q34 262 28 250" stroke-width="4"/></g>
        <g fill="#fff"><ellipse cx="22" cy="276" rx="7" ry="2.5"/><ellipse cx="74" cy="272" rx="8" ry="2.5"/><ellipse cx="44" cy="248" rx="6" ry="2.2"/><ellipse cx="51" cy="409" rx="18" ry="3"/></g></g>`;
    }
    if (SEASON === 'autumn') {
      return `<g class="bigtree"><path d="M44 410 Q48 360 40 320 L56 320 Q52 360 60 410 Z" fill="#6b4a32"/>
        <circle cx="48" cy="290" r="42" fill="#d9822b"/><circle cx="20" cy="306" r="26" fill="#c9692f"/><circle cx="78" cy="304" r="28" fill="#c4462f"/>
        <circle cx="40" cy="268" r="24" fill="#e9a13c"/><circle cx="64" cy="278" r="16" fill="#efb23c"/></g>`;
    }
    return `<g class="bigtree">
      <path d="M44 410 Q48 360 40 320 L56 320 Q52 360 60 410 Z" fill="#6b4a32"/>
      <circle cx="48" cy="290" r="42" fill="#5c8f45"/><circle cx="20" cy="306" r="26" fill="#558740"/><circle cx="78" cy="304" r="28" fill="#4f803c"/>
      <circle cx="40" cy="268" r="24" fill="#6ca552"/><circle cx="64" cy="278" r="16" fill="#73ad58"/>
    </g>`;
  }

  function fence(st, col) {
    const half = (id, x0, x1, done) => {
      const r = seeded(id === 'fenceLeft' ? 5 : 6);
      const c = done ? col : '#a39d92', dk = U.shade(c, -0.28);
      let s = `<g data-part="${id}"><rect x="${x0}" y="${500}" width="${x1 - x0}" height="4" fill="${dk}"/><rect x="${x0}" y="${520}" width="${x1 - x0}" height="4" fill="${dk}"/>`;
      for (let x = x0 + 2; x < x1 - 6; x += 12) {
        if (!done && r() < 0.12) continue;
        const tilt = done ? 0 : (r() - 0.5) * 12;
        s += `<path d="M${x} 532 V496 L${x + 4} 490 L${x + 8} 496 V532 Z" fill="${c}" stroke="${dk}" stroke-width="0.8" transform="rotate(${tilt.toFixed(1)} ${x + 4} 532)"/>`;
      }
      return s + '</g>';
    };
    return half('fenceLeft', 0, 164, st.fenceLeft) + half('fenceRight', 236, 400, st.fenceRight)
      + `<rect x="160" y="488" width="6" height="46" rx="1" fill="#8d7a64"/><rect x="234" y="488" width="6" height="46" rx="1" fill="#8d7a64"/>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  const DECOR = {
    gnome: () => `<g><ellipse cx="296" cy="366" rx="7" ry="2" fill="#00000022"/><path d="M290 366 l2 -12 h8 l2 12z" fill="#3d5a86"/><circle cx="296" cy="351" r="4" fill="#f2c9a0"/>
      <path d="M296 357 q-5 4 -3 9 h6 q2 -5 -3 -9z" fill="#fff"/><path d="M290.5 349 L296 333 L301.5 349z" fill="#d9534f"/></g>`,
    pots: () => [170, 230].map((x) => `<path d="M${x - 6} 334 h12 l-2 9 h-8z" fill="#c8763f"/><circle cx="${x - 3}" cy="330" r="3.6" fill="#ef8aa6"/><circle cx="${x + 3}" cy="331" r="3.4" fill="#f7c548"/><circle cx="${x}" cy="327" r="3" fill="#bba9df"/>`).join(''),
    mailbox: () => `<g><rect x="247" y="470" width="3" height="22" fill="#6b4a32"/><path d="M241 462 h15 v10 h-15z M241 462 q7.5 -8 15 0" fill="#c9474f"/><rect x="254" y="459" width="2" height="7" fill="#f2c230"/></g>`,
    lantern: () => `<g><rect x="232" y="268" width="2" height="8" fill="#3d3d42"/><rect x="228.5" y="276" width="9" height="13" rx="2" fill="#3d3d42"/><rect x="230.5" y="278" width="5" height="9" fill="#ffe08a"/>
      <circle cx="233" cy="283" r="14" fill="#ffe08a" opacity="0.18"/></g>`,
    birdhouse: () => `<g><rect x="56" y="350" width="12" height="13" fill="#d98b63"/><path d="M54 351 l8 -7 l8 7z" fill="#8e4430"/><circle cx="62" cy="357" r="2.2" fill="#3d2a1e"/><rect x="61" y="363" width="2" height="3" fill="#6b4a32"/></g>`,
    windowboxes: () => [[122, 299, 40], [238, 299, 40], [134, 223, 34], [232, 223, 34]].map(([x, y, w]) => `<rect x="${x}" y="${y + 6}" width="${w}" height="5" rx="1" fill="#8a5a3c"/>` +
      Array.from({ length: 6 }, (_, i) => `<circle cx="${x + 4 + i * (w - 8) / 5}" cy="${y + 5}" r="2.4" fill="${['#e0485a', '#f7c548', '#ef8aa6'][i % 3]}"/>`).join('')).join(''),
    wreath: () => `<g><circle cx="200" cy="290" r="8" fill="none" stroke="#4f8a3c" stroke-width="4"/><circle cx="194" cy="286" r="1.4" fill="#d9534f"/><circle cx="205" cy="293" r="1.4" fill="#d9534f"/><path d="M196 297 l4 -3 l4 3 l-4 2z" fill="#d9534f"/></g>`,
    bench: () => `<g><ellipse cx="128" cy="438" rx="24" ry="3" fill="#00000022"/><rect x="108" y="420" width="40" height="5" rx="1.5" fill="#a77b56"/><rect x="108" y="426" width="40" height="4" rx="1.5" fill="#8a6142"/>
      <rect x="110" y="430" width="3" height="8" fill="#3d3d42"/><rect x="143" y="430" width="3" height="8" fill="#3d3d42"/><rect x="108" y="412" width="40" height="4" rx="1.5" fill="#a77b56"/></g>`,
    lights: () => {
      const seg = (x0, x1) => { let d = `<path d="M${x0} 488 ${Array.from({ length: Math.round((x1 - x0) / 20) }, (_, i) => `Q${x0 + i * 20 + 10} 496 ${x0 + (i + 1) * 20} 488`).join(' ')}" stroke="#4a4a50" stroke-width="0.8" fill="none"/>`;
        for (let x = x0 + 10; x < x1; x += 20) d += `<circle class="bulb" cx="${x}" cy="493" r="2.2" fill="${['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'][(x / 20 | 0) % 4]}"/>`;
        return d; };
      return `<g>${seg(0, 160)}${seg(240, 400)}</g>`;
    },
    picnic: () => `<g><path d="M236 430 l44 -6 l10 20 l-46 7z" fill="#e05b5b"/><path d="M247 428 l10 21 M258 427 l10 21 M269 425 l10 21 M240 437 l46 -6 M243 444 l45 -6" stroke="#fff" stroke-width="2" opacity="0.6"/>
      <rect x="262" y="428" width="13" height="9" rx="2" fill="#c98a50"/><path d="M263 428 q5.5 -7 11 0" stroke="#8a5a3c" stroke-width="1.4" fill="none"/></g>`,
    beehive: () => `<g><rect x="366" y="430" width="3" height="10" fill="#6b4a32"/><ellipse cx="368" cy="420" rx="11" ry="12" fill="#f2c230"/>
      <path d="M357.5 414 h21 M357 420 h22 M357.5 426 h21" stroke="#c9952a" stroke-width="1.4"/><ellipse cx="368" cy="428" rx="3" ry="2" fill="#5a3e1a"/>
      <circle class="bee" cx="380" cy="410" r="1.6" fill="#3d3d42"/></g>`,
    bicycle: () => `<g><circle cx="292" cy="520" r="9" fill="none" stroke="#3d3d42" stroke-width="2"/><circle cx="318" cy="520" r="9" fill="none" stroke="#3d3d42" stroke-width="2"/>
      <path d="M292 520 l10 -14 h12 l4 14 M302 506 l-3 14 h-7 M314 506 l-2 -5 h-4 M302 506 l-2 -4 h6" stroke="#5aa6a0" stroke-width="2.4" fill="none"/>
      <path d="M311 499 h10 v6 h-10z" fill="#c98a50"/><circle cx="313" cy="498" r="2" fill="#ef8aa6"/><circle cx="318" cy="497" r="2" fill="#f7c548"/></g>`,
    swing: () => `<g class="swing"><path d="M74 318 V392 M96 318 V392" stroke="#8a6142" stroke-width="1.4"/><rect x="70" y="390" width="30" height="5" rx="2" fill="#a77b56"/></g>`,
    vane: () => `<g><rect x="199" y="56" width="2" height="20" fill="#3d3d42"/><path d="M190 62 h20" stroke="#3d3d42" stroke-width="1.2"/>
      <path d="M195 56 q3 -8 9 -5 q4 2 3 6 q-1 3 -4 3 h-7 q-2 0 -1 -4z" fill="#3d3d42"/><circle cx="200" cy="76" r="2" fill="#3d3d42"/></g>`,
    cat2: () => `<g><ellipse cx="152" cy="303" rx="7" ry="4.5" fill="#6d6d78"/><circle cx="146" cy="299" r="3.8" fill="#6d6d78"/><path d="M143.5 296.5 l0.5 -3.5 l2 2.6 M147 295.5 l2 -2.8 l0.8 3.6" fill="#6d6d78"/><path d="M159 304 q5 0 4 -6" stroke="#6d6d78" stroke-width="2" fill="none"/></g>`,
    balloon: () => `<g class="balloon"><path d="M80 70 q-24 0 -24 -28 q0 -24 24 -24 q24 0 24 24 q0 28 -24 28z" fill="#ef8aa6"/>
      <path d="M80 70 q-10 0 -10 -28 q0 -24 10 -24 q10 0 10 24 q0 28 -10 28z" fill="#f7c548"/><path d="M76 70 l-3 10 M84 70 l3 10" stroke="#8a6142" stroke-width="0.8"/><rect x="72" y="80" width="16" height="9" rx="2" fill="#a77b56"/></g>`,
  };

  function decorations(owned) {
    let s = '';
    for (const id of Object.keys(DECOR)) if (owned[id]) s += DECOR[id]();
    return s;
  }

  function life(st, pct) {
    let s = '';
    if (pct > 0.15) s += `<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>`;
    if (pct > 0.4) s += `<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>`;
    if (pct > 0.3) s += `<g class="bird"><path d="M290 150 q4 -4 8 0 q4 -4 8 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>`;
    if (st.door) s += `<g class="cat"><ellipse cx="232" cy="336" rx="8" ry="5" fill="#e0a86a"/><circle cx="238" cy="331" r="4.2" fill="#e0a86a"/>
        <path d="M235 328 l1 -4 l2 3 M239 327 l2 -3 l1 4" fill="#e0a86a"/><path d="M224 338 q-6 0 -5 -6" stroke="#e0a86a" stroke-width="2.2" fill="none"/></g>`;
    return s;
  }

  // paint that needs a fresh coat looks a little washed out
  function faded() {
    let s = '';
    if (PEND.fenceLeft) s += '<rect x="0" y="486" width="164" height="48" fill="#cfc6b6" opacity="0.45"/>';
    if (PEND.fenceRight) s += '<rect x="236" y="486" width="164" height="48" fill="#cfc6b6" opacity="0.45"/>';
    if (PEND.door) s += '<path d="M181 336 V277 Q181 262 200 262 Q219 262 219 277 V336 Z" fill="#cfc6b6" opacity="0.5"/>';
    if (PEND.shutters) for (const x of [111, 164, 227, 280]) s += `<rect x="${x}" y="246" width="9" height="54" fill="#cfc6b6" opacity="0.5"/>`;
    return s;
  }
  function weather() {
    let s = '';
    if (SEASON === 'winter') {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${(i * 0.83) % 9}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 9; i++) s += `<ellipse class="fleaf" cx="${(i * 47 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${(i * 1.3) % 10}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring' && Object.keys(PEND).length) {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#f7c6d1" style="animation-delay:-${(i * 1.7) % 11}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather">${s}</g>`;
  }

  // evening: darken everything, then let lit windows and lights glow
  function night(st, decor) {
    let s = '<rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply"/>';
    s += '<rect width="400" height="540" fill="#24306a" opacity="0.18"/>';
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 180)}" r="${0.6 + (i % 3) * 0.4}" fill="#fff" style="animation-delay:-${(i * 0.7) % 4}s"/>`;
    s += '<mask id="mMoon"><rect width="400" height="200" fill="#fff"/><circle cx="337" cy="56" r="14" fill="#000"/></mask><circle cx="330" cy="62" r="16" fill="#fff6d8" mask="url(#mMoon)"/><circle cx="330" cy="62" r="30" fill="#fff6d8" opacity="0.08"/>';
    const glow = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffd98a" opacity="0.9"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.max(w, h) * 0.9}" fill="#ffd98a" opacity="0.1"/>
      <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="#7a5a3a" stroke-width="2" opacity="0.6"/>`;
    const lit = (part) => st[part] && !PEND[part];
    if (lit('winKitchen')) s += glow(122, 248, 40, 50);
    if (lit('winLiving')) s += glow(238, 248, 40, 50);
    if (lit('winBedroom')) s += glow(134, 186, 34, 36) + glow(232, 186, 34, 36);
    if (lit('atticWin')) s += '<circle cx="200" cy="134" r="11" fill="#ffd98a" opacity="0.9"/><circle cx="200" cy="134" r="22" fill="#ffd98a" opacity="0.15"/>';
    if (st.door) s += '<path d="M186 275 Q200 264 214 275 Z" fill="#ffd98a"/>';
    if (decor.lantern) s += '<rect x="230.5" y="278" width="5" height="9" fill="#ffe9a8"/><circle cx="233" cy="283" r="18" fill="#ffd98a" opacity="0.3"/>';
    if (decor.lights) for (const x0 of [0, 240]) for (let x = x0 + 10; x < x0 + 160; x += 20) s += `<circle cx="${x}" cy="493" r="2.4" fill="${['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'][(x / 20 | 0) % 4]}"/><circle cx="${x}" cy="493" r="7" fill="#ffe08a" opacity="0.2"/>`;
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  function sparkles(part) {
    if (!part) return '';
    const spots = {
      lawnFront: [100, 505], lawnLeft: [120, 410], lawnRight: [300, 440], steps: [272, 415], path: [200, 440],
      fenceLeft: [80, 510], fenceRight: [320, 510], winKitchen: [148, 272], winLiving: [252, 272], winBedroom: [200, 202],
      door: [200, 300], wall: [200, 220], shutters: [200, 270], bedLeft: [143, 345], bedRight: [257, 345], pond: [336, 380],
      roofLeft: [150, 140], roofRight: [250, 140], attic: [252, 80], atticWin: [200, 134],
    }[part] || [200, 300];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 18 + (i % 3) * 10;
      const x = spots[0] + Math.cos(a) * d, y = spots[1] + Math.sin(a) * d * 0.7;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${x} ${y - 6} L${x + 1.5} ${y - 1.5} L${x + 6} ${y} L${x + 1.5} ${y + 1.5} L${x} ${y + 6} L${x - 1.5} ${y + 1.5} L${x - 6} ${y} L${x - 1.5} ${y - 1.5}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles">${s}</g>`;
  }

  // st: map of restored part -> true; cols: chosen paint colours
  function render(st, cols, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {};
    const s = Object.assign({}, st, { wallCol: cols.wall });
    const pct = opts.pct || 0;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house">
      ${defs()}${sky()}
      <rect x="0" y="250" width="400" height="290" fill="${SEASON === 'winter' ? '#e9eff4' : '#86a865'}"/>
      ${lawnPart('lawnLeft', [[0, 300], [108, 300], [108, 356], [184, 356], [174, 470], [0, 470]], st.lawnLeft)}
      ${lawnPart('lawnRight', [[400, 300], [292, 300], [292, 356], [216, 356], [226, 470], [400, 470]], st.lawnRight)}
      ${lawnPart('lawnFront', [[0, 470], [174, 470], [167, 540], [0, 540]], st.lawnFront)}
      ${lawnPart('lawnFront2', [[226, 470], [400, 470], [400, 540], [233, 540]], st.lawnFront)}
      ${path(st)}${steps(st)}${pond(st)}
      ${chimney(st)}${wall(s, cols.wall)}${roof(st)}
      ${windowSvg(134, 186, 34, 36, st.winBedroom, 'winBedroom', 'bed')}${windowSvg(232, 186, 34, 36, st.winBedroom, 'winBedroom', 'bed')}
      ${windowSvg(122, 248, 40, 50, st.winKitchen, 'winKitchen', 'kitchen')}${windowSvg(238, 248, 40, 50, st.winLiving, 'winLiving', 'living')}
      ${shutters(st, cols.shutters || '#4e7b5b')}${door(s, cols.door)}${ivy(st)}${beds(st)}
      ${tree(st)}${fence(st, cols.fence)}${faded()}${decorations(opts.decor || {})}${life(st, pct)}${weather()}${opts.night ? night(st, opts.decor || {}) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR };
})();
