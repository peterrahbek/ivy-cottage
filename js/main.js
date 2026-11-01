'use strict';
// Screens, saving, the shed and the flow between the cottage and a chore.

(() => {
  const $ = (s) => document.querySelector(s);
  const SAVE_KEY = 'ivycottage.v1';

  // ------------------------------------------------------------------ save
  function fresh() {
    return { coins: 0, earned: 0, tiers: {}, done: {}, finds: {}, colours: Object.assign({}, DATA.DEFAULT_COLOURS), helpers: 0, sfx: true, music: true, touched: 0, seasonNo: 0, sdone: {}, decor: {}, name: '', evening: true, wips: {}, place: 'cottage', owned: { cottage: 1 }, use: {}, musicVol: 0.45, cloud: {}, jobsDone: 0, started: Date.now() };
  }
  // fill in anything an older save does not have yet
  function upgrade(s) {
    const f = fresh();
    const out = Object.assign(f, s, { colours: Object.assign(f.colours, s.colours) });
    if (s.wip && s.wip.id && !s.wips) out.wips = { [s.wip.id]: s.wip.grid };
    delete out.wip;
    out.wips = out.wips || {};
    out.owned = Object.assign({ cottage: 1 }, s.owned);
    out.use = out.use || {};
    if (typeof out.musicVol !== 'number') out.musicVol = 0.45;
    out.cloud = out.cloud || {};
    if (typeof out.jobsDone !== 'number') out.jobsDone = Object.values(out.done).reduce((a, b) => a + b, 0) + Object.keys(out.sdone).length;
    if (!out.owned[out.place]) out.place = 'cottage';
    // seasons used to be one fixed list of eight; the varied ones start afresh
    if (Object.keys(out.sdone || {}).some((k) => /^s\d+-\d+$/.test(k))) out.sdone = {};
    out.coins = Math.max(0, Math.round(out.coins)); out.earned = Math.round(out.earned || 0);
    return out;
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && typeof s.coins === 'number') return upgrade(s);
    } catch (_) {}
    return fresh();
  }
  let S = load();
  let saveWarned = false;
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }
    catch (_) { if (!saveWarned) { saveWarned = true; toast('This phone would not let the game save'); } }
    if (S.cloud.code && cloudSig() !== pushedSig) cloudSoon();
  }

  // tierIdx = the best tool owned; useIdx = the one picked for work, which
  // can be any owned tool (some days the shears are nicer than the tractor)
  const tierIdx = (fam) => S.tiers[fam] || 0;
  const useIdx = (fam) => Math.min(tierIdx(fam), S.use[fam] != null ? S.use[fam] : tierIdx(fam));
  const tierOf = (fam) => TOOLS.FAM[fam].tiers[useIdx(fam)];

  // ---------------------------------------------------------------- places
  // Each place has its own chores, picture and decorations; coins, tools,
  // helpers and the turning year are shared.
  const here = () => DATA.placeOf(S.place);
  const owned = (id) => !!S.owned[id];
  const doneCount = (pl = S.place) => DATA.placeOf(pl).chores.filter((c) => S.done[c.id]).length;
  const totalDone = () => DATA.PLACES.reduce((n, p) => n + doneCount(p.id), 0);
  const restored = (pl) => doneCount(pl) === DATA.placeOf(pl).chores.length;
  const restoredPlaces = () => DATA.PLACES.filter((p) => owned(p.id) && restored(p.id)).map((p) => p.id);
  const placeName = (pl = S.place) => (pl === 'cottage' ? cottageName() : DATA.placeOf(pl).name);
  const seasonJobs = () => DATA.seasonJobs(S.seasonNo, restoredPlaces());
  const jobsAt = (pl) => seasonJobs().filter((j) => j.place === pl);
  const nextRestore = (pl) => DATA.placeOf(pl).chores.find((c) => !S.done[c.id]);
  const nextChore = (pl = S.place) => nextRestore(pl) || (S.seasonNo > 0 ? jobsAt(pl).find((j) => !S.sdone[j.id]) : undefined);
  const seasonName = () => (S.seasonNo ? DATA.seasonOf(S.seasonNo) : 'spring');
  const famUnlocked = (fam) => {
    if (DATA.FAMILY_SEASON[fam] && S.seasonNo >= DATA.FAMILY_SEASON[fam]) return true;
    if (seasonJobs().some((j) => j.family === fam)) return true;
    return DATA.PLACES.some((p) => {
      if (!owned(p.id)) return false;
      const n = nextRestore(p.id), reach = n ? n.index : p.chores.length;
      return p.chores.some((c) => c.family === fam && c.index <= reach);
    });
  };
  function placeOffer() {
    return DATA.PLACES.find((p) => !owned(p.id) && (!p.needs || restored(p.needs)));
  }
  function renderPlace(id, st, opts) {
    if (id === 'cafe' && typeof CAFE !== 'undefined') return CAFE.render(st, S.colours, opts);
    if (id === 'cove' && typeof COVE !== 'undefined') return COVE.render(st, S.colours, opts);
    return HOUSE.render(st, S.colours, opts);
  }
  // decorations plus the Christmas lights once they are up this winter
  function decorAt(pl) {
    const lit = jobsAt(pl).some((j) => /lights$/.test(j.base) && S.sdone[j.id]);
    return lit ? Object.assign({}, S.decor, { [DATA.placeOf(pl).lights]: 1 }) : S.decor;
  }
  function partsDone(pl) {
    const st = {};
    for (const c of DATA.placeOf(pl).chores) if (S.done[c.id]) st[c.part] = true;
    return st;
  }
  function pendingAt(pl) {
    const pending = {};
    for (const j of jobsAt(pl)) if (!S.sdone[j.id] && j.part) pending[j.part] = j.pending;
    return pending;
  }
  function nextUpgrade(fam) {
    const t = tierIdx(fam), tiers = TOOLS.FAM[fam].tiers;
    if (t + 1 >= tiers.length) return null;
    return { tier: tiers[t + 1], cost: DATA.toolCost(fam, t + 1) };
  }
  function affordableSomething() {
    for (const fam of Object.keys(TOOLS.FAM)) {
      if (!famUnlocked(fam)) continue;
      const u = nextUpgrade(fam);
      if (u && S.coins >= u.cost) return true;
    }
    const h = helperOffer();
    if (h && S.coins >= h.cost) return true;
    return doneCount() >= DATA.DECOR_UNLOCK && here().decor.some((d) => !S.decor[d.id] && S.coins >= d.cost);
  }
  function helperOffer() {
    if (totalDone() < DATA.HELPER_UNLOCK) return null;
    if (S.helpers >= DATA.HELPER_COSTS.length) return null;
    return { cost: DATA.HELPER_COSTS[S.helpers] };
  }

  // ------------------------------------------------------------- screens
  function show(id) {
    for (const el of document.querySelectorAll('.screen')) el.classList.toggle('on', el.id === id);
  }

  const isEvening = () => { const h = new Date().getHours(); return S.evening && (h >= 20 || h < 6); };
  const cottageName = () => S.name || 'Ivy Cottage';

  function coinHtml(n) { return `<i class="coin"></i><span>${U.fmt(n)}</span>`; }

  // ---------------------------------------------------------------- home
  let freshPart = null;
  function renderHome() {
    const pl = here();
    const st = partsDone(pl.id), pending = pendingAt(pl.id);
    const pct = doneCount() / pl.chores.length;
    $('#scene').innerHTML = renderPlace(pl.id, st, { pct, fresh: freshPart, season: seasonName(), pending, decor: decorAt(pl.id), night: isEvening() });
    $('#brandName').textContent = placeName();
    $('#brandChev').hidden = DATA.PLACES.filter((p) => owned(p.id)).length < 2;
    if (freshPart) {
      const g = $('#scene').querySelectorAll(`[data-part="${freshPart}"]`);
      g.forEach((el) => el.classList.add('fresh'));
    }
    freshPart = null;
    $('#homeCoins').innerHTML = coinHtml(S.coins);
    const jobs = jobsAt(pl.id);
    if (!restored(pl.id) || S.seasonNo === 0 || !jobs.length) {
      $('#restoredBar').style.width = (pct * 100).toFixed(1) + '%';
      $('#restoredTxt').textContent = pct >= 1 ? `${placeName()} is restored` : `${doneCount()} of ${pl.chores.length} jobs done`;
    } else {
      const d = jobs.filter((j) => S.sdone[j.id]).length;
      $('#restoredBar').style.width = ((d / jobs.length) * 100).toFixed(1) + '%';
      $('#restoredTxt').textContent = `${DATA.SEASON_NAMES[seasonName()]}, year ${1 + Math.floor(S.seasonNo / 4)} · ${d} of ${jobs.length}`;
    }
    document.body.dataset.season = seasonName();
    AUDIO.theme({ place: S.place, season: seasonName(), night: isEvening() });
    AUDIO.birds((seasonName() === 'spring' || seasonName() === 'summer') && !isEvening());
    const n = nextChore();
    const card = $('#nextCard');
    // season jobs still waiting somewhere else
    const elsewhere = S.seasonNo > 0 && DATA.PLACES.find((p) => p.id !== pl.id && owned(p.id) && nextChore(p.id));
    if (n) {
      const fam = TOOLS.FAM[n.family];
      const where = n.seasonNo ? DATA.SEASON_NAMES[n.season] : DATA.AREAS[n.area];
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">${where} · ${fam.job}</div><div class="nextName">${n.name}</div>
        <div class="nextMeta">${coinHtml(n.value)}<span class="dot">·</span><span>${S.wips[n.id] ? 'Half done' : tierOf(n.family).name}</span></div></div>
        <div class="nextIcon"></div><button class="go" id="goBtn">Start</button>`;
      card.querySelector('.nextIcon').appendChild(TOOLS.icon(tierOf(n.family), 46, S.colours[n.color]));
      $('#goBtn').onclick = () => { AUDIO.pop(); startChore(n, false); };
    } else if (elsewhere) {
      const what = nextRestore(elsewhere.id) ? 'Jobs are waiting' : `${DATA.SEASON_NAMES[seasonName()]} jobs are waiting`;
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">All tidy here</div><div class="nextName">${what} at ${placeName(elsewhere.id)}</div>
        <div class="nextMeta">Everything here is done for now.</div></div><button class="go" id="goBtn">Go there</button>`;
      $('#goBtn').onclick = () => { AUDIO.pop(); goPlace(elsewhere.id); };
    } else {
      const upcoming = DATA.SEASON_NAMES[DATA.seasonOf(S.seasonNo + 1)];
      const title = S.seasonNo === 0 ? pl.done : `${DATA.SEASON_NAMES[seasonName()]} is all tidy`;
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">${S.seasonNo === 0 ? 'All restored' : 'Season done'}</div><div class="nextName">${title}</div>
        <div class="nextMeta">${upcoming} is on its way, with new jobs.</div></div><button class="go" id="goBtn">${upcoming}</button>`;
      $('#goBtn').onclick = () => {
        S.seasonNo++; S.sdone = {}; save();
        AUDIO.chime();
        seasonCard(upcoming);
        renderHome();
      };
    }
    $('#btnShed').classList.toggle('alert', affordableSomething());
    const offer = placeOffer();
    $('#btnPlaces').classList.toggle('alert', !!offer && S.coins >= offer.price);
    $('#scene').querySelectorAll('[data-part]').forEach((el) => {
      el.addEventListener('click', () => {
        const part = el.dataset.part;
        const sj = jobsAt(pl.id).find((j) => j.part === part && !S.sdone[j.id]);
        const c = sj || pl.chores.find((x) => x.part === part);
        if (c && (sj || S.done[c.id])) { AUDIO.soft(); openJobs(c.id); }
      });
    });
  }
  function goPlace(id, bought) {
    S.place = id; save();
    $('#sheet').classList.remove('on');
    renderHome();
    if (bought) { AUDIO.chime(); seasonCard(DATA.placeOf(id).name, 'It is yours!'); }
    else AUDIO.shimmer();
  }

  // ---------------------------------------------------------------- play
  let cur = null, curValue = 0, earnedThis = 0, shownCoins = 0, isReplay = false;
  let foundThis = null;
  function startChore(c, replay) {
    AUDIO.birds(false); foundThis = null;
    cur = c; isReplay = replay;
    curValue = Math.round(c.value * (replay ? 0.6 : 1));
    earnedThis = 0; shownCoins = S.coins;
    show('play');
    $('#doneOverlay').classList.remove('on'); $('#toolPick').classList.remove('on');
    $('#playTitle').textContent = c.name;
    updatePlayCoins();
    setupBottom();
    const insets = hudInsets();
    const fam = c.family;
    const resume = S.wips[c.id] || null;
    delete S.wips[c.id];
    const treasures = [];
    // coin stashes only on a fresh start, or leaving and coming back would refill them
    if (!resume) for (let k = 0; k < 3; k++) treasures.push({ kind: 'coin', value: Math.max(2, Math.round(curValue * 0.05)) });
    const f = c.find || DATA.FINDS[c.id], fid = c.findId || c.id;
    if (f && !S.finds[fid]) treasures.push({ kind: 'find', id: fid, emoji: f[0], name: f[1], value: Math.round(curValue * 0.15) });
    const def = Object.assign({}, c, { opts: Object.assign({}, c.opts, c.place !== 'cafe' && S.done.wall ? { wallColor: S.colours.wall } : {}) });
    ENGINE.start(def, { tier: tierOf(fam), paint: c.color ? S.colours[c.color] : null, value: curValue, helpers: S.helpers, insets, treasures, resume });
    const cvs = $('#cv'); cvs.classList.remove('fadein'); void cvs.offsetWidth; cvs.classList.add('fadein');
    lastMilestone = 0;
    const hint = $('#hint');
    if (S.touched < 3 || c.verb) { hint.querySelector('span').textContent = 'Drag to ' + (c.verb || DATA.VERBS[fam]); hint.classList.add('on'); } else hint.classList.remove('on');
    AUDIO.setWork(workSound(fam, tierOf(fam)));
    setProgress(0);
  }
  function hudInsets() {
    return { top: $('#hudTop').getBoundingClientRect().bottom + 6, bottom: window.innerHeight - $('#hudBottom').getBoundingClientRect().top + 6 };
  }
  function workSound(fam, t) {
    if (fam === 'mow') return t.id === 'shears' ? 'mow' : 'mower';
    if (fam === 'scrub') return t.id === 'washer' || t.id === 'turbo' ? 'washer' : 'scrub';
    if (fam === 'dust' && t.id === 'vacuum') return 'vacuum';
    if (fam === 'snow' && t.id === 'blower') return 'snowblower';
    if (fam === 'rake' && t.id === 'blower') return 'washer';
    if (fam === 'rake' && t.id === 'leafvac') return 'vacuum';
    if (fam === 'polish' && (t.id === 'buffer' || t.id === 'twin')) return 'buffer';
    return fam;
  }
  function setupBottom() {
    const fam = cur.family, t = tierOf(fam);
    const chip = $('#toolChip');
    chip.innerHTML = '';
    chip.appendChild(TOOLS.icon(t, 38, cur.color ? S.colours[cur.color] : null));
    const nm = document.createElement('span'); nm.textContent = t.name; chip.appendChild(nm);
    if (tierIdx(fam) > 0) { const sw = document.createElement('b'); sw.className = 'swap'; sw.textContent = '⇄'; chip.appendChild(sw); }
    updateUpPill();
    const pal = $('#palette');
    if (cur.color) {
      pal.classList.add('on');
      pal.innerHTML = DATA.PAINTS.map((p) => `<button class="sw${p.c === S.colours[cur.color] ? ' sel' : ''}" data-c="${p.c}" style="--c:${p.c}" aria-label="${p.name}"></button>`).join('');
      pal.querySelectorAll('.sw').forEach((b) => b.onclick = () => {
        S.colours[cur.color] = b.dataset.c; save();
        pal.querySelectorAll('.sw').forEach((x) => x.classList.toggle('sel', x === b));
        ENGINE.setPaint(b.dataset.c); AUDIO.soft();
        const chipCv = TOOLS.icon(tierOf(fam), 38, b.dataset.c); chip.replaceChild(chipCv, chip.firstChild);
      });
    } else { pal.classList.remove('on'); pal.innerHTML = ''; }
  }
  // pick any tool already owned, from the chip at the bottom
  function openToolPick() {
    const fam = cur.family, pick = $('#toolPick');
    if (pick.classList.contains('on') || tierIdx(fam) < 1) { pick.classList.remove('on'); if (tierIdx(fam) < 1) toast('Buy a better tool to have a choice'); return; }
    pick.innerHTML = '';
    TOOLS.FAM[fam].tiers.slice(0, tierIdx(fam) + 1).forEach((t, i) => {
      const b = document.createElement('button');
      if (i === useIdx(fam)) b.className = 'sel';
      b.appendChild(TOOLS.icon(t, 34, cur.color ? S.colours[cur.color] : null));
      const nm = document.createElement('span'); nm.textContent = t.name; b.appendChild(nm);
      b.onclick = () => {
        S.use[fam] = i; save(); pick.classList.remove('on');
        ENGINE.setTier(t); AUDIO.pop(); AUDIO.setWork(workSound(fam, t)); setupBottom();
      };
      pick.appendChild(b);
    });
    pick.classList.add('on'); AUDIO.soft();
  }
  $('#toolChip').onclick = openToolPick;
  function updateUpPill() {
    const pill = $('#upPill');
    const u = nextUpgrade(cur.family);
    if (!u) { pill.classList.remove('on'); return; }
    pill.classList.add('on');
    const can = S.coins >= u.cost;
    pill.classList.toggle('can', can);
    pill.innerHTML = `<span class="up">${can ? 'Upgrade' : 'Next'}</span><b>${u.tier.name}</b><span class="cost">${coinHtml(u.cost)}</span>`;
    pill.style.setProperty('--p', Math.min(1, S.coins / u.cost));
  }
  $('#upPill').onclick = () => {
    const u = nextUpgrade(cur.family);
    if (!u || S.coins < u.cost) { AUDIO.soft(); $('#upPill').classList.add('nope'); setTimeout(() => $('#upPill').classList.remove('nope'), 400); return; }
    S.coins -= u.cost; S.tiers[cur.family] = tierIdx(cur.family) + 1; S.use[cur.family] = S.tiers[cur.family]; save();
    shownCoins = Math.min(shownCoins, S.coins);
    ENGINE.setTier(tierOf(cur.family));
    AUDIO.buy(); AUDIO.setWork(workSound(cur.family, tierOf(cur.family)));
    setupBottom(); updatePlayCoins();
    toast(`${u.tier.name}!`);
  };
  function updatePlayCoins() { $('#playCoins').innerHTML = coinHtml(shownCoins); }
  let lastPct = -1, lastMilestone = 0;
  function setProgress(p) {
    const v = Math.floor(p * 100);
    if (v === lastPct) return;
    lastPct = v;
    const m = Math.floor(v / 25);
    if (m > lastMilestone && m < 4) {
      lastMilestone = m; AUDIO.soft();
      const pr = $('.prog'); pr.classList.remove('pulse'); void pr.offsetWidth; pr.classList.add('pulse');
    }
    $('#progFill').style.width = (p * 100).toFixed(1) + '%';
    $('#progTxt').textContent = v + '%';
  }

  function finishChore() {
    delete S.wips[cur.id];
    const bonus = Math.round(curValue * 0.25);
    S.coins += bonus; S.earned += bonus;
    let first;
    if (cur.seasonNo) { first = !S.sdone[cur.id]; S.sdone[cur.id] = (S.sdone[cur.id] || 0) + 1; }
    else { first = !S.done[cur.id]; S.done[cur.id] = (S.done[cur.id] || 0) + 1; }
    S.jobsDone++;
    save();
    if (first) freshPart = cur.part;
    AUDIO.chime(); AUDIO.activity(0, false);
    const o = $('#doneOverlay');
    $('#doneTitle').textContent = U.pick(Math.random, cur.family === 'plant' ? ['Lovely!', 'So green!', 'Blooming lovely!', 'Beautiful!'] : cur.family === 'build' ? ['Well built!', 'Solid work!', 'Lovely!', 'Wonderful!'] : ['Lovely!', 'So tidy!', 'Beautiful!', 'All clean!', 'Wonderful!']);
    $('#doneBtn').textContent = 'Back to ' + here().short;
    $('#doneName').textContent = cur.name;
    $('#doneEarn').innerHTML = coinHtml(earnedThis);
    $('#doneBonus').innerHTML = coinHtml(bonus);
    $('#doneFind').innerHTML = foundThis ? `<i>${foundThis.emoji}</i> ${foundThis.name} is on your shelf` : '';
    $('#doneFind').style.display = foundThis ? '' : 'none';
    o.classList.add('on');
    let k = 0; const target = earnedThis + bonus;
    const tick = () => { k = Math.min(target, k + Math.max(1, target / 30)); $('#doneTotal').innerHTML = coinHtml(k); if (k < target) requestAnimationFrame(tick); };
    tick();
    shownCoins = S.coins; updatePlayCoins(); updateUpPill();
  }
  $('#doneBtn').onclick = () => { AUDIO.pop(); leavePlay(); };
  $('#btnBack').onclick = () => { AUDIO.soft(); leavePlay(); };
  function keepWip() {
    if (!cur || $('#doneOverlay').classList.contains('on')) return;
    const g = ENGINE.snapshot();
    if (!g || ENGINE.progress() <= 0.02) return;
    delete S.wips[cur.id];
    S.wips[cur.id] = g;
    const ids = Object.keys(S.wips);
    while (ids.length > 5) delete S.wips[ids.shift()];
  }
  function leavePlay() {
    keepWip();
    ENGINE.stop(); AUDIO.stopWork(); save();
    show('home'); renderHome();
    if (freshPart === null && $('#scene .fresh')) AUDIO.shimmer();
  }

  ENGINE.init($('#cv'), {
    onEarn(v) { S.coins += v; S.earned += v; earnedThis += v; },
    onCoinArrive(v) {
      shownCoins = Math.min(S.coins, shownCoins + v);
      updatePlayCoins(); updateUpPill();
      const el = $('#playCoins'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      AUDIO.coin();
    },
    coinTarget() { const r = $('#playCoins .coin').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
    insets: hudInsets,
    onProgress: setProgress,
    onActivity: (lvl, down) => AUDIO.activity(lvl, down),
    onAutoFinish() { AUDIO.shimmer(); },
    onUnit(kind) { AUDIO.unit(kind); },
    onTouch() {
      if ($('#hint').classList.contains('on')) { $('#hint').classList.remove('on'); S.touched++; save(); }
    },
    onFind(g) {
      if (g.kind === 'coin') { AUDIO.shimmer(); return; }
      S.finds[g.id] = Date.now(); save(); foundThis = g;
      AUDIO.chime();
      foundBanner(g);
    },
    onDone: finishChore,
  });

  // ------------------------------------------------------------ photo
  // Draw the cottage picture into a PNG and hand it to the share sheet.
  async function photo() {
    const svg = $('#scene svg');
    if (!svg) return;
    try {
      const W = 1200, H = 1620, band = 150;
      const xml = new XMLSerializer().serializeToString(svg).replace('<svg ', `<svg width="${W}" height="${H}" `);
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      await img.decode();
      const cv = U.canvas(W, H + band), c = cv.getContext('2d');
      c.fillStyle = '#f6efe3'; c.fillRect(0, 0, W, H + band);
      c.drawImage(img, 0, 0, W, H);
      c.fillStyle = '#46623f'; c.font = '900 64px ui-rounded, "SF Pro Rounded", system-ui, sans-serif'; c.textAlign = 'center';
      c.fillText(placeName(), W / 2, H + 92);
      c.fillStyle = '#a89c8b'; c.font = '700 30px ui-rounded, system-ui, sans-serif';
      c.fillText(S.seasonNo && restored(S.place) ? `${DATA.SEASON_NAMES[seasonName()]}, year ${1 + Math.floor(S.seasonNo / 4)}` : `${doneCount()} of ${here().chores.length} jobs done`, W / 2, H + 132);
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const fname = `my-${S.place}.png`;
      const file = new File([blob], fname, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: placeName() });
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    } catch (e) { if (e && e.name !== 'AbortError') toast('Could not make the picture'); }
  }
  const bind = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
  bind('#btnPhoto', () => { AUDIO.soft(); photo(); });

  function seasonCard(name, small) {
    const el = $('#seasonCard');
    el.dataset.season = small ? seasonName() : name.toLowerCase();
    el.querySelector('b').textContent = name;
    el.querySelector('small').textContent = small || `Year ${1 + Math.floor(S.seasonNo / 4)}`;
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 2600);
  }

  // ------------------------------------------------------------ finds
  let bannerT = 0;
  function foundBanner(g) {
    const b = $('#found');
    b.innerHTML = `<i>${g.emoji}</i><div><small>You found</small><b>${g.name}</b></div>`;
    b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('on'), 2600);
  }
  function openFinds() {
    let places = '';
    for (const p of DATA.PLACES) {
      if (!owned(p.id)) continue;
      const all = p.chores.filter((c) => DATA.FINDS[c.id]);
      const got = all.filter((c) => S.finds[c.id]).length;
      const cells = all.map((c) => {
        const f = DATA.FINDS[c.id], has = !!S.finds[c.id];
        return `<div class="find${has ? ' has' : ''}"><i>${has ? f[0] : '?'}</i><span>${has ? f[1] : 'Hidden in ' + c.name.replace(/^The /, 'the ')}</span></div>`;
      }).join('');
      places += `<div class="findsHead">${placeName(p.id)} · ${got} of ${all.length}</div><div class="findsGrid">${cells}</div>`;
    }
    let seasons = '';
    if (S.seasonNo > 0) {
      for (const sn of DATA.SEASON_ORDER) {
        const list = DATA.SEASON_FINDS[sn];
        const n = list.filter((_, i) => S.finds[`${sn}-${i}`]).length;
        seasons += `<div class="findsHead">${DATA.SEASON_NAMES[sn]} · ${n} of ${list.length}</div><div class="findsGrid">` +
          list.map(([e, nm], i) => { const has = !!S.finds[`${sn}-${i}`]; return `<div class="find${has ? ' has' : ''}"><i>${has ? e : '?'}</i><span>${has ? nm : 'A ' + sn + ' secret'}</span></div>`; }).join('') + '</div>';
      }
    }
    openSheet('Finds', `${places}${seasons}
      <div class="setNote">Every job hides one keepsake under the mess, plus a few little stashes of coins. Each season has its own secrets.</div>`);
  }

  // ---------------------------------------------------------------- toast
  let toastT = 0;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1600);
  }

  // ---------------------------------------------------------------- sheets
  function openSheet(title, html, after) {
    $('#sheetTitle').textContent = title;
    $('#sheetBody').innerHTML = html;
    $('#sheet').classList.add('on');
    after && after($('#sheetBody'));
  }
  function closeSheet() { $('#sheet').classList.remove('on'); renderHome(); }
  $('#sheetClose').onclick = () => { AUDIO.soft(); closeSheet(); };
  $('#sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });

  function openShed() {
    const rows = [];
    for (const [fam, F] of Object.entries(TOOLS.FAM)) {
      if (!famUnlocked(fam)) continue;
      const t = F.tiers[tierIdx(fam)], u = nextUpgrade(fam);
      const dots = F.tiers.map((_, i) => `<i class="${i <= tierIdx(fam) ? 'on' : ''}"></i>`).join('');
      const width = (x) => (x.shape === 'rect' ? x.w : x.r * 2);
      const stat = u ? `<div class="sub">Size ${width(t)} → <b>${width(u.tier)}</b> · Strength ${t.power.toFixed(1)} → <b>${u.tier.power.toFixed(1)}</b></div>` : `<div class="sub">Size ${width(t)} · Strength ${t.power.toFixed(1)}</div>`;
      rows.push(`<div class="shedRow" data-fam="${fam}"><div class="ic"></div><div class="sInfo"><div class="eyebrow">${F.name}</div><div class="sName">${t.name}</div><div class="tiers">${dots}</div>${stat}</div>
        ${u ? `<button class="buy${S.coins >= u.cost ? ' can' : ''}" data-fam="${fam}"><span>${u.tier.name}</span><span class="price">${coinHtml(u.cost)}</span></button>` : '<div class="maxed">Best tool</div>'}</div>`);
    }
    const h = helperOffer();
    if (totalDone() >= DATA.HELPER_UNLOCK) {
      rows.push(`<div class="shedRow helperRow"><div class="ic bot"></div><div class="sInfo"><div class="eyebrow">Helpers</div><div class="sName">${S.helpers ? S.helpers + ' tidy-bot' + (S.helpers > 1 ? 's' : '') : 'No helpers yet'}</div><div class="sub">They tidy alongside you on every job</div></div>
        ${h ? `<button class="buy${S.coins >= h.cost ? ' can' : ''}" data-helper="1"><span>${S.helpers ? 'Another' : 'Hire one'}</span><span class="price">${coinHtml(h.cost)}</span></button>` : '<div class="maxed">Full team</div>'}</div>`);
    }
    const tabs = doneCount() >= DATA.DECOR_UNLOCK ? `<div class="tabs"><button class="tab on">Tools</button><button class="tab" id="tabDecor">Decorate</button></div>` : '';
    openSheet('The shed', tabs + `<div class="shedCoins">${coinHtml(S.coins)}</div>` + rows.join(''), (body) => {
      const td = body.querySelector('#tabDecor'); if (td) td.onclick = () => { AUDIO.soft(); openDecor(); };
      body.querySelectorAll('.shedRow[data-fam]').forEach((row) => row.querySelector('.ic').appendChild(TOOLS.icon(TOOLS.FAM[row.dataset.fam].tiers[tierIdx(row.dataset.fam)], 52)));
      body.querySelectorAll('.buy').forEach((b) => b.onclick = () => {
        if (b.dataset.helper) {
          const o = helperOffer(); if (!o || S.coins < o.cost) return nope(b);
          S.coins -= o.cost; S.helpers++; save(); AUDIO.buy(); toast('A tidy-bot joins you!'); return openShed();
        }
        const fam = b.dataset.fam, u = nextUpgrade(fam);
        if (!u || S.coins < u.cost) return nope(b);
        S.coins -= u.cost; S.tiers[fam] = tierIdx(fam) + 1; S.use[fam] = S.tiers[fam]; save(); AUDIO.buy(); toast(`${u.tier.name}!`); openShed();
      });
    });
  }
  function openDecor() {
    const at = here().short;
    const rows = here().decor.map((d) => {
      const has = !!S.decor[d.id];
      return `<div class="shedRow"><div class="ic emo">${d.icon}</div><div class="sInfo"><div class="sName">${d.name}</div><div class="sub">${has ? 'At ' + at : 'Appears at ' + at}</div></div>
        ${has ? '<div class="maxed">Yours ✓</div>' : `<button class="buy${S.coins >= d.cost ? ' can' : ''}" data-decor="${d.id}"><span>Buy</span><span class="price">${coinHtml(d.cost)}</span></button>`}</div>`;
    }).join('');
    openSheet('The shed', `<div class="tabs"><button class="tab" id="tabTools">Tools</button><button class="tab on">Decorate</button></div><div class="shedCoins">${coinHtml(S.coins)}</div>${rows}`, (body) => {
      body.querySelector('#tabTools').onclick = () => { AUDIO.soft(); openShed(); };
      body.querySelectorAll('[data-decor]').forEach((b) => b.onclick = () => {
        const d = here().decor.find((x) => x.id === b.dataset.decor);
        if (S.coins < d.cost) return nope(b);
        S.coins -= d.cost; S.decor[d.id] = Date.now(); save(); AUDIO.buy();
        closeSheet(); toast(`${d.name} added`);
        const sc = $('#scene'); sc.classList.remove('newdecor'); void sc.offsetWidth; sc.classList.add('newdecor');
      });
    });
  }
  function nope(b) { AUDIO.soft(); b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 400); }

  function openJobs(focus) {
    const n = nextChore();
    let html = '', lastArea = '';
    const row = (c, doneN) => {
      const done = !!doneN, isNext = n && n.id === c.id, locked = !done && !isNext;
      const v = done ? Math.round(c.value * 0.6) : c.value;
      return `<div class="jobRow${locked ? ' locked' : ''}${focus === c.id ? ' focus' : ''}" id="job-${c.id}"><div class="jState">${done ? '✓' : isNext ? '•' : ''}</div>
        <div class="jName">${c.name}<div class="sub">${TOOLS.FAM[c.family].job}${done ? ' · done' + (doneN > 1 ? ' ×' + doneN : '') : ''}</div></div>
        ${locked ? '<div class="lock">Later</div>' : `<button class="jGo" data-id="${c.id}">${done ? 'Again' : 'Start'} ${coinHtml(v)}</button>`}</div>`;
    };
    const sj = jobsAt(S.place), list = here().chores;
    if (sj.length) {
      html += `<div class="jobArea">${DATA.SEASON_NAMES[seasonName()]}</div>`;
      for (const j of sj) html += row(j, S.sdone[j.id]);
    }
    for (const c of list) {
      if (c.area !== lastArea) { html += `<div class="jobArea">${DATA.AREAS[c.area]}</div>`; lastArea = c.area; }
      html += row(c, S.done[c.id]);
    }
    openSheet(`Jobs · ${placeName()}`, html, (body) => {
      body.querySelectorAll('.jGo').forEach((b) => b.onclick = () => {
        const c = list.find((x) => x.id === b.dataset.id) || sj.find((x) => x.id === b.dataset.id);
        $('#sheet').classList.remove('on'); AUDIO.pop();
        startChore(c, !!(S.done[c.id] || S.sdone[c.id]));
      });
      if (focus) { const el = body.querySelector('#job-' + focus); el && el.scrollIntoView({ block: 'center' }); }
    });
  }

  function openSettings() {
    openSheet('Settings', `
      <label class="setRow"><span>Sound effects</span><input type="checkbox" id="setSfx" ${S.sfx ? 'checked' : ''}></label>
      <label class="setRow"><span>Music</span><input type="checkbox" id="setMusic" ${S.music ? 'checked' : ''}></label>
      <label class="setRow"><span>Music volume</span><input type="range" id="setMusicVol" min="0" max="100" step="5" value="${Math.round(S.musicVol * 100)}"></label>
      <label class="setRow nameRow"><span>Name of the cottage</span><input type="text" id="setName" maxlength="22" placeholder="Ivy Cottage" value="${(S.name || '').replace(/"/g, '&quot;')}"></label>
      <label class="setRow"><span>Evening light after 8 pm</span><input type="checkbox" id="setEvening" ${S.evening ? 'checked' : ''}></label>
      <div class="setNote">Tip: on iPhone, tap Share and then <b>Add to Home Screen</b> to play full screen and offline. Safari and the Home Screen app keep separate saves; move yours with a save code.</div>
      <div class="codeRow"><button class="closeBtn" id="setExport">Copy offline save code</button><button class="closeBtn" id="setImport">Paste save code</button></div>
      <textarea id="setCode" rows="3" placeholder="Paste a save code here" hidden></textarea>
      <button class="go" id="setLoad" hidden>Load this cottage</button>
      ${cloudHtml()}
      <div class="setStats">Coins earned in total: ${U.fmt(S.earned)}</div>
      <button class="danger" id="setReset">Start the cottage over</button>`, (body) => {
      cloudBind(body);
      body.querySelector('#setSfx').onchange = (e) => { S.sfx = e.target.checked; AUDIO.set('sfx', S.sfx); save(); };
      body.querySelector('#setMusic').onchange = (e) => { S.music = e.target.checked; AUDIO.set('music', S.music); save(); };
      body.querySelector('#setMusicVol').oninput = (e) => { S.musicVol = e.target.value / 100; AUDIO.volume(S.musicVol); save(); };
      body.querySelector('#setName').oninput = (e) => { S.name = e.target.value.trim().slice(0, 22); save(); };
      body.querySelector('#setEvening').onchange = (e) => { S.evening = e.target.checked; save(); };
      const codeBox = body.querySelector('#setCode'), loadBtn = body.querySelector('#setLoad');
      body.querySelector('#setExport').onclick = () => {
        const code = 'IVY1:' + btoa(unescape(encodeURIComponent(JSON.stringify(Object.assign({}, S, { wips: {} })))));
        const showBox = () => { codeBox.hidden = false; codeBox.value = code; codeBox.select(); toast('Copy the code from the box'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(() => toast('Save code copied'), showBox);
        else showBox();
      };
      body.querySelector('#setImport').onclick = () => { codeBox.hidden = false; codeBox.value = ''; loadBtn.hidden = false; codeBox.focus(); };
      loadBtn.onclick = () => {
        try {
          const raw = codeBox.value.trim().replace(/^IVY1:/, '');
          const s = JSON.parse(decodeURIComponent(escape(atob(raw))));
          if (!s || typeof s.coins !== 'number') throw new Error('not a save');
          S = upgrade(s); save(); closeSheet(); toast('Cottage loaded');
        } catch (_) { toast('That code did not work'); }
      };
      body.querySelector('#setReset').onclick = (e) => {
        if (e.target.dataset.sure) { S = fresh(); save(); closeSheet(); toast('A fresh start'); return; }
        e.target.dataset.sure = '1'; e.target.textContent = 'Tap again to really start over';
      };
    });
  }

  // ----------------------------------------------------------------- cloud
  // An optional copy of the save on a small Cloudflare service (cloud/): a
  // cloud code carries the game over to another phone, and friends lists show
  // nicknames and a few numbers. Everything else works without it, offline.
  const CLOUD = 'https://ivy-cottage.rahbek.workers.dev/api';
  let pushedSig = '', cloudTimer = 0, cloudBusy = false;
  const cloudSig = () => `${S.earned}:${S.coins}:${S.jobsDone}:${Object.keys(S.finds).length}`;
  const cloudStats = () => ({ finds: Object.keys(S.finds).length, places: restoredPlaces().length, jobs: S.jobsDone });
  const cloudData = () => JSON.stringify(Object.assign({}, S, { wips: {} }));
  async function cloudCall(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (S.cloud.code) headers['X-Ivy-Code'] = S.cloud.code;
    const text = body ? JSON.stringify(body) : undefined;
    const r = await fetch(CLOUD + path, { method, headers, body: text, keepalive: !!text && text.length < 60000 });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(d.error || 'cloud'), { status: r.status });
    return d;
  }
  // at most one upload every two minutes while playing, and one when leaving
  function cloudSoon() { if (!cloudTimer) cloudTimer = setTimeout(() => { cloudTimer = 0; cloudPush(); }, 120000); }
  async function cloudPush() {
    if (!S.cloud.code || cloudBusy) return;
    cloudBusy = true;
    const sig = cloudSig();
    try { await cloudCall('PUT', '/save', { data: cloudData(), earned: S.earned, stats: cloudStats() }); pushedSig = sig; S.cloud.at = Date.now(); }
    catch (_) {}
    cloudBusy = false;
  }
  // more progress in the cloud (played on another phone): carry on from there
  async function cloudPull() {
    if (!S.cloud.code || $('#play').classList.contains('on')) return;
    try {
      const d = await cloudCall('GET', '/save');
      if (!(d.earned > S.earned) || $('#play').classList.contains('on')) return;
      const keep = { sfx: S.sfx, music: S.music, musicVol: S.musicVol, wips: S.wips, cloud: S.cloud };
      S = upgrade(Object.assign(JSON.parse(d.data), keep)); pushedSig = cloudSig(); save();
      if ($('#home').classList.contains('on')) renderHome(); else renderTitle();
      toast('Picked up where you left off');
    } catch (_) {}
  }
  async function cloudStart() {
    const d = await cloudCall('POST', '/save', { data: cloudData(), earned: S.earned, stats: cloudStats() });
    S.cloud = { code: d.code, at: Date.now() }; pushedSig = cloudSig(); save();
    return d.code;
  }
  function cloudHtml() {
    if (!S.cloud.code) {
      return `<div class="setHead">Cloud save</div><div class="setNote">Keep a copy of your progress online, so you can carry on from another phone.</div>
        <div class="codeRow"><button class="closeBtn" id="cloudOn">Save in the cloud</button><button class="closeBtn" id="cloudHave">I have a code</button></div>
        <input class="cloudIn" id="cloudIn" placeholder="XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" hidden><button class="go" id="cloudLoad" hidden>Load my progress</button>`;
    }
    const at = S.cloud.at ? new Date(S.cloud.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'not yet';
    return `<div class="setHead">Cloud save</div><div class="cloudCode">${S.cloud.code}</div>
      <div class="setNote">Your cloud code. On another phone, open Settings, tap <b>I have a code</b> and type it in. Keep it to yourself: anyone with the code can play your game. Last saved: ${at}.</div>
      <div class="codeRow"><button class="closeBtn" id="cloudCopy">Copy the code</button><button class="closeBtn" id="cloudNow">Save now</button></div>`;
  }
  function cloudBind(body) {
    const on = body.querySelector('#cloudOn');
    if (on) on.onclick = async () => { on.disabled = true; try { await cloudStart(); toast('Saved in the cloud'); openSettings(); } catch (_) { on.disabled = false; toast('No connection right now'); } };
    const have = body.querySelector('#cloudHave'), inp = body.querySelector('#cloudIn'), load = body.querySelector('#cloudLoad');
    if (have) have.onclick = () => { inp.hidden = false; load.hidden = false; inp.focus(); };
    if (load) load.onclick = async () => {
      const code = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length !== 12) return toast('A cloud code has 12 letters and digits');
      const was = S.cloud;
      S.cloud = { code: `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}` };
      try {
        const d = await cloudCall('GET', '/save');
        const keep = { sfx: S.sfx, music: S.music, musicVol: S.musicVol, cloud: S.cloud };
        S = upgrade(Object.assign(JSON.parse(d.data), keep)); S.wips = {}; pushedSig = cloudSig(); save();
        closeSheet(); toast('Welcome back!');
      } catch (e) { S.cloud = was; toast(e.status === 404 ? 'That code was not found' : 'No connection right now'); }
    };
    const copy = body.querySelector('#cloudCopy');
    if (copy) copy.onclick = () => { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(S.cloud.code).then(() => toast('Code copied'), () => toast(S.cloud.code)); else toast(S.cloud.code); };
    const now = body.querySelector('#cloudNow');
    if (now) now.onclick = async () => { await cloudPush(); toast(pushedSig === cloudSig() ? 'Saved' : 'No connection right now'); openSettings(); };
  }

  // friends lists: a nickname, a list code to share, and everyone's numbers
  async function openFriends() {
    const intro = '<div class="setNote">Make a friends list and share its code, or join a friend\'s list. Friends see only your nickname and your numbers, so use a nickname, not your real name.</div>';
    if (!S.cloud.code) {
      openSheet('Friends', `${intro}<div class="setNote">Friends lists use the cloud save.</div><button class="go wide" id="frCloud">Turn on cloud save</button>`, (body) => {
        body.querySelector('#frCloud').onclick = async (e) => { e.target.disabled = true; try { await cloudStart(); openFriends(); } catch (_) { e.target.disabled = false; toast('No connection right now'); } };
      });
      return;
    }
    openSheet('Friends', '<div class="setNote">Looking up your friends…</div>');
    let d;
    try { await cloudPush(); d = await cloudCall('GET', '/list'); }
    catch (_) { openSheet('Friends', '<div class="setNote">No connection right now. Try again in a moment.</div>'); return; }
    if (!d.list) {
      openSheet('Friends', `${intro}
        <label class="setRow nameRow"><span>Your nickname</span><input type="text" id="frNick" maxlength="16" placeholder="Nickname" value="${(S.cloud.nick || '').replace(/"/g, '&quot;')}"></label>
        <button class="go wide" id="frNew">Start a friends list</button>
        <div class="setHead">Or join a friend's list</div>
        <div class="codeRow"><input class="cloudIn" id="frCode" placeholder="XXX-XXX" autocomplete="off" autocapitalize="characters"><button class="closeBtn" id="frJoin">Join</button></div>`, (body) => {
        const nick = () => body.querySelector('#frNick').value.trim();
        const go = async (path, extra, btn) => {
          if (nick().length < 2) return toast('Pick a nickname first');
          btn.disabled = true;
          try { const r = await cloudCall('POST', path, Object.assign({ nick: nick() }, extra)); S.cloud.nick = r.nick; save(); AUDIO.chime(); openFriends(); }
          catch (e) { btn.disabled = false; toast(e.status === 404 ? 'That list was not found' : e.status === 409 ? 'That list is full' : e.message === 'nickname' ? 'Try another nickname' : 'No connection right now'); }
        };
        body.querySelector('#frNew').onclick = (e) => go('/list', {}, e.target);
        body.querySelector('#frJoin').onclick = (e) => go('/list/join', { list: body.querySelector('#frCode').value }, e.target);
      });
      return;
    }
    const rows = d.members.map((m, i) => `<div class="friendRow${m.me ? ' me' : ''}"><div class="rank">${i + 1}</div><div class="fnick">${m.nick.replace(/</g, '&lt;')}${m.me ? ' <small>(you)</small>' : ''}</div>
      <div class="fstat">${coinHtml(m.earned)}<span title="Keepsakes">⭐ ${m.finds}</span><span title="Places restored">🏡 ${m.places}</span></div></div>`).join('');
    openSheet('Friends', `<div class="setNote">Your friends list: <b class="listCode">${d.list}</b>. Share the code so friends can join. Ranked by coins earned.</div>${rows}
      <div class="codeRow"><button class="closeBtn" id="frRefresh">Refresh</button><button class="closeBtn" id="frLeave">Leave the list</button></div>`, (body) => {
      body.querySelector('#frRefresh').onclick = () => { AUDIO.soft(); openFriends(); };
      body.querySelector('#frLeave').onclick = async (e) => {
        if (!e.target.dataset.sure) { e.target.dataset.sure = '1'; e.target.textContent = 'Tap again to leave'; return; }
        try { await cloudCall('POST', '/list/leave', {}); toast('You left the list'); openFriends(); } catch (_) { toast('No connection right now'); }
      };
    });
  }

  // ---------------------------------------------------------------- places
  function placePic(id, st, opts) {
    const svg = renderPlace(id, st, opts).replace('<svg ', '<svg width="400" height="540" ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function openPlaces() {
    const cards = DATA.PLACES.map((p) => {
      const own = owned(p.id), isHere = S.place === p.id;
      const pic = placePic(p.id, own ? partsDone(p.id) : {}, { season: seasonName(), pending: own ? pendingAt(p.id) : {}, decor: own ? S.decor : {}, pct: own ? doneCount(p.id) / p.chores.length : 0, forSale: !own, uid: 'p' });
      const n = p.chores.length, d = doneCount(p.id);
      let sub, action;
      if (own) {
        const waiting = jobsAt(p.id).filter((j) => !S.sdone[j.id]).length;
        sub = d < n ? `${d} of ${n} jobs done` : waiting ? `Restored · ${waiting} ${DATA.SEASON_NAMES[seasonName()].toLowerCase()} job${waiting > 1 ? 's' : ''} waiting` : 'Restored and tidy';
        action = isHere ? '<div class="maxed">You are here</div>' : `<button class="buy can" data-go="${p.id}"><span>Go there</span></button>`;
      } else {
        const ready = !p.needs || restored(p.needs);
        sub = ready ? p.blurb : `${p.blurb} For sale once ${placeName(p.needs)} is restored.`;
        action = ready ? `<button class="buy${S.coins >= p.price ? ' can' : ''}" data-buy="${p.id}"><span>Buy</span><span class="price">${coinHtml(p.price)}</span></button>` : '<div class="lock">Later</div>';
      }
      return `<div class="placeCard${isHere ? ' here' : ''}${own ? '' : ' forSale'}"><div class="pic"><img alt="" src="${pic}"></div>
        <div class="pInfo"><div class="sInfo"><div class="pName">${placeName(p.id)}</div><div class="pSub">${sub}</div></div>${action}</div></div>`;
    }).join('');
    openSheet('Places', `<div class="shedCoins">${coinHtml(S.coins)}</div>${cards}<div class="setNote">Every place has its own jobs, keepsakes and decorations. Your coins, tools and helpers come along everywhere.</div>`, (body) => {
      body.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => goPlace(b.dataset.go));
      body.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => {
        const p = DATA.placeOf(b.dataset.buy);
        if (owned(p.id) || S.coins < p.price) return nope(b);
        S.coins -= p.price; S.owned[p.id] = Date.now(); save(); AUDIO.buy();
        goPlace(p.id, true);
      });
    });
  }

  $('#btnShed').onclick = () => { AUDIO.pop(); openShed(); };
  $('#btnJobs').onclick = () => { AUDIO.pop(); openJobs(); };
  $('#btnPlaces').onclick = () => { AUDIO.pop(); openPlaces(); };
  $('#home .brand').onclick = () => { AUDIO.pop(); openPlaces(); };
  $('#btnSettings').onclick = () => { AUDIO.pop(); openSettings(); };
  bind('#btnFriends', () => { AUDIO.pop(); openFriends(); });
  bind('#btnFinds', () => { AUDIO.pop(); openFinds(); });

  // ----------------------------------------------------------------- boot
  function renderTitle() {
    $('#titleScene').innerHTML = HOUSE.render(partsDone('cottage'), S.colours, { season: seasonName(), pending: pendingAt('cottage'), decor: S.decor, pct: doneCount('cottage') / DATA.CHORES.length, night: isEvening() });
    if (S.name) $('#title .logo span').textContent = S.name;
    if (S.earned > 0) $('#title .tap').textContent = 'Back to the cottage';
    const standalone = navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const tip = $('#homeTip');
    if (tip) tip.hidden = !(ios && !standalone);
  }
  renderTitle();
  cloudPull();
  $('#title').addEventListener('click', () => {
    AUDIO.volume(S.musicVol); AUDIO.unlock(); AUDIO.set('sfx', S.sfx); AUDIO.set('music', S.music);
    AUDIO.pop();
    $('#titleScene').innerHTML = '';
    show('home'); renderHome();
  });
  // iOS only counts touchend and click as a gesture that may wake the sound up
  for (const ev of ['pointerdown', 'touchend', 'click']) document.addEventListener(ev, () => AUDIO.unlock(), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if ($('#play').classList.contains('on')) keepWip(); save(); AUDIO.suspend(); if (S.cloud.code && cloudSig() !== pushedSig) cloudPush(); }
    else { AUDIO.resume(); cloudPull(); }
  });
  setInterval(save, 5000);
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && location.hostname !== 'localhost') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // test hooks
  window.__ivy = {
    get S() { return S; }, ENGINE, startChore: (i) => startChore(DATA.CHORES[i], false), startCafe: (i) => startChore(DATA.CAFE_CHORES[i], false), startCove: (i) => startChore(DATA.COVE_CHORES[i], false), startJob: (c) => startChore(c, false),
    render: () => renderHome(), save, cloudPush, cloudPull, openFriends, reset() { S = fresh(); save(); renderHome(); }, keepWip, finish: () => ENGINE.debugFinish(), goPlace, openPlaces, seasonJobs,
  };
})();
