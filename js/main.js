'use strict';
// Screens, saving, the shed and the flow between the cottage and a chore.

(() => {
  const $ = (s) => document.querySelector(s);
  const SAVE_KEY = 'ivycottage.v1';

  // ------------------------------------------------------------------ save
  function fresh() {
    return { coins: 0, earned: 0, tiers: {}, done: {}, finds: {}, colours: Object.assign({}, DATA.DEFAULT_COLOURS), helpers: 0, sfx: true, music: true, touched: 0, seasonNo: 0, sdone: {}, decor: {}, name: '', evening: true, started: Date.now() };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && typeof s.coins === 'number') { const f = fresh(); return Object.assign(f, s, { colours: Object.assign(f.colours, s.colours) }); }
    } catch (_) {}
    return fresh();
  }
  let S = load();
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (_) {} }

  const tierIdx = (fam) => S.tiers[fam] || 0;
  const tierOf = (fam) => TOOLS.FAM[fam].tiers[tierIdx(fam)];
  const seasonJobs = () => DATA.seasonJobs(S.seasonNo);
  const nextChore = () => (S.seasonNo === 0 ? DATA.CHORES.find((c) => !S.done[c.id]) : seasonJobs().find((j) => !S.sdone[j.id]));
  const doneCount = () => DATA.CHORES.filter((c) => S.done[c.id]).length;
  const seasonName = () => (S.seasonNo ? DATA.seasonOf(S.seasonNo) : 'spring');
  const famUnlocked = (fam) => {
    if (DATA.FAMILY_SEASON[fam]) return S.seasonNo >= DATA.FAMILY_SEASON[fam];
    if (S.seasonNo > 0) return true;
    const n = nextChore();
    const reach = n ? n.index : DATA.CHORES.length;
    return DATA.intro[fam] !== undefined && DATA.intro[fam] <= reach;
  };
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
    return doneCount() >= DATA.DECOR_UNLOCK && DATA.DECOR.some((d) => !S.decor[d.id] && S.coins >= d.cost);
  }
  function helperOffer() {
    if (doneCount() < DATA.HELPER_UNLOCK) return null;
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
    const st = {}, pending = {};
    for (const c of DATA.CHORES) if (S.done[c.id]) st[c.part] = true;
    for (const j of seasonJobs()) if (!S.sdone[j.id]) pending[j.part] = j.pending;
    const pct = doneCount() / DATA.CHORES.length;
    $('#scene').innerHTML = HOUSE.render(st, S.colours, { pct, fresh: freshPart, season: seasonName(), pending, decor: S.decor, night: isEvening() });
    $('#brandName').textContent = cottageName();
    if (freshPart) {
      const g = $('#scene').querySelectorAll(`[data-part="${freshPart}"]`);
      g.forEach((el) => el.classList.add('fresh'));
    }
    freshPart = null;
    $('#homeCoins').innerHTML = coinHtml(S.coins);
    if (S.seasonNo === 0) {
      $('#restoredBar').style.width = (pct * 100).toFixed(1) + '%';
      $('#restoredTxt').textContent = pct >= 1 ? 'Ivy Cottage is restored' : `${doneCount()} of ${DATA.CHORES.length} jobs done`;
    } else {
      const jobs = seasonJobs(), d = jobs.filter((j) => S.sdone[j.id]).length;
      $('#restoredBar').style.width = ((d / jobs.length) * 100).toFixed(1) + '%';
      $('#restoredTxt').textContent = `${DATA.SEASON_NAMES[seasonName()]}, year ${1 + Math.floor(S.seasonNo / 4)} · ${d} of ${jobs.length}`;
    }
    document.body.dataset.season = seasonName();
    AUDIO.birds((seasonName() === 'spring' || seasonName() === 'summer') && !isEvening());
    const n = nextChore();
    const card = $('#nextCard');
    if (n) {
      const fam = TOOLS.FAM[n.family];
      const where = n.seasonNo ? DATA.SEASON_NAMES[n.season] : DATA.AREAS[n.area];
      card.innerHTML = `<div class="nextInfo"><div class="eyebrow">${where} · ${fam.job}</div><div class="nextName">${n.name}</div>
        <div class="nextMeta">${coinHtml(n.value)}<span class="dot">·</span><span>${tierOf(n.family).name}</span></div></div>
        <div class="nextIcon"></div><button class="go" id="goBtn">Start</button>`;
      card.querySelector('.nextIcon').appendChild(TOOLS.icon(tierOf(n.family), 46, S.colours[n.color]));
      $('#goBtn').onclick = () => { AUDIO.pop(); startChore(n, false); };
    } else {
      const upcoming = DATA.SEASON_NAMES[DATA.seasonOf(S.seasonNo + 1)];
      const title = S.seasonNo === 0 ? 'The cottage is lovely again' : `${DATA.SEASON_NAMES[seasonName()]} is all tidy`;
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
    $('#scene').querySelectorAll('[data-part]').forEach((el) => {
      el.addEventListener('click', () => {
        const part = el.dataset.part;
        const sj = seasonJobs().find((j) => j.part === part && !S.sdone[j.id]);
        const c = sj || DATA.CHORES.find((x) => x.part === part);
        if (c && (sj || S.done[c.id])) { AUDIO.soft(); openJobs(c.id); }
      });
    });
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
    $('#doneOverlay').classList.remove('on');
    $('#playTitle').textContent = c.name;
    updatePlayCoins();
    setupBottom();
    const insets = { top: $('#hudTop').getBoundingClientRect().bottom + 6, bottom: window.innerHeight - $('#hudBottom').getBoundingClientRect().top + 6 };
    const fam = c.family;
    const treasures = [];
    for (let k = 0; k < 3; k++) treasures.push({ kind: 'coin', value: Math.max(2, Math.round(curValue * 0.05)) });
    const f = DATA.FINDS[c.id];
    if (f && !S.finds[c.id]) treasures.push({ kind: 'find', id: c.id, emoji: f[0], name: f[1], value: Math.round(curValue * 0.15) });
    const def = Object.assign({}, c, { opts: Object.assign({}, c.opts, S.done.wall ? { wallColor: S.colours.wall } : {}) });
    ENGINE.start(def, { tier: tierOf(fam), paint: c.color ? S.colours[c.color] : null, value: curValue, helpers: S.helpers, insets, treasures });
    lastMilestone = 0;
    const hint = $('#hint');
    if (S.touched < 3) { hint.querySelector('span').textContent = 'Drag to ' + DATA.VERBS[fam]; hint.classList.add('on'); } else hint.classList.remove('on');
    AUDIO.setWork(workSound(fam, tierOf(fam)));
    setProgress(0);
  }
  function workSound(fam, t) {
    if (fam === 'mow') return t.id === 'shears' ? 'mow' : 'mower';
    if (fam === 'scrub') return t.id === 'washer' || t.id === 'turbo' ? 'washer' : 'scrub';
    if (fam === 'dust' && t.id === 'vacuum') return 'vacuum';
    return fam;
  }
  function setupBottom() {
    const fam = cur.family, t = tierOf(fam);
    const chip = $('#toolChip');
    chip.innerHTML = '';
    chip.appendChild(TOOLS.icon(t, 38, cur.color ? S.colours[cur.color] : null));
    const nm = document.createElement('span'); nm.textContent = t.name; chip.appendChild(nm);
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
    S.coins -= u.cost; S.tiers[cur.family] = tierIdx(cur.family) + 1; save();
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
    const bonus = Math.round(curValue * 0.25);
    S.coins += bonus; S.earned += bonus;
    let first;
    if (cur.seasonNo) { first = !S.sdone[cur.id]; S.sdone[cur.id] = (S.sdone[cur.id] || 0) + 1; }
    else { first = !S.done[cur.id]; S.done[cur.id] = (S.done[cur.id] || 0) + 1; }
    save();
    if (first) freshPart = cur.part;
    AUDIO.chime(); AUDIO.activity(0, false);
    const o = $('#doneOverlay');
    $('#doneTitle').textContent = U.pick(Math.random, ['Lovely!', 'So tidy!', 'Beautiful!', 'All clean!', 'Wonderful!']);
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
  function leavePlay() {
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
    onProgress: setProgress,
    onActivity: (lvl, down) => AUDIO.activity(lvl, down),
    onAutoFinish() { AUDIO.shimmer(); },
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
      c.fillText(cottageName(), W / 2, H + 92);
      c.fillStyle = '#a89c8b'; c.font = '700 30px ui-rounded, system-ui, sans-serif';
      c.fillText(S.seasonNo ? `${DATA.SEASON_NAMES[seasonName()]}, year ${1 + Math.floor(S.seasonNo / 4)}` : `${doneCount()} of ${DATA.CHORES.length} jobs done`, W / 2, H + 132);
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const file = new File([blob], 'my-cottage.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: cottageName() });
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-cottage.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    } catch (e) { if (e && e.name !== 'AbortError') toast('Could not make the picture'); }
  }
  $('#btnPhoto').onclick = () => { AUDIO.soft(); photo(); };

  function seasonCard(name) {
    const el = $('#seasonCard');
    el.dataset.season = name.toLowerCase();
    el.querySelector('b').textContent = name;
    el.querySelector('small').textContent = `Year ${1 + Math.floor(S.seasonNo / 4)}`;
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
    const all = DATA.CHORES.filter((c) => DATA.FINDS[c.id]);
    const got = all.filter((c) => S.finds[c.id]).length;
    const cells = all.map((c) => {
      const f = DATA.FINDS[c.id], has = !!S.finds[c.id];
      return `<div class="find${has ? ' has' : ''}"><i>${has ? f[0] : '?'}</i><span>${has ? f[1] : 'Hidden in ' + c.name.replace(/^The /, 'the ')}</span></div>`;
    }).join('');
    openSheet('Finds', `<div class="findsHead">${got} of ${all.length} keepsakes found</div><div class="findsGrid">${cells}</div>
      <div class="setNote">Every job hides one keepsake under the mess, plus a few little stashes of coins.</div>`);
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
      const t = tierOf(fam), u = nextUpgrade(fam);
      const dots = F.tiers.map((_, i) => `<i class="${i <= tierIdx(fam) ? 'on' : ''}"></i>`).join('');
      rows.push(`<div class="shedRow" data-fam="${fam}"><div class="ic"></div><div class="sInfo"><div class="eyebrow">${F.name}</div><div class="sName">${t.name}</div><div class="tiers">${dots}</div></div>
        ${u ? `<button class="buy${S.coins >= u.cost ? ' can' : ''}" data-fam="${fam}"><span>${u.tier.name}</span><span class="price">${coinHtml(u.cost)}</span></button>` : '<div class="maxed">Best tool</div>'}</div>`);
    }
    const h = helperOffer();
    if (doneCount() >= DATA.HELPER_UNLOCK) {
      rows.push(`<div class="shedRow helperRow"><div class="ic bot"></div><div class="sInfo"><div class="eyebrow">Helpers</div><div class="sName">${S.helpers ? S.helpers + ' tidy-bot' + (S.helpers > 1 ? 's' : '') : 'No helpers yet'}</div><div class="sub">They tidy alongside you on every job</div></div>
        ${h ? `<button class="buy${S.coins >= h.cost ? ' can' : ''}" data-helper="1"><span>${S.helpers ? 'Another' : 'Hire one'}</span><span class="price">${coinHtml(h.cost)}</span></button>` : '<div class="maxed">Full team</div>'}</div>`);
    }
    const tabs = doneCount() >= DATA.DECOR_UNLOCK ? `<div class="tabs"><button class="tab on">Tools</button><button class="tab" id="tabDecor">Decorate</button></div>` : '';
    openSheet('The shed', tabs + `<div class="shedCoins">${coinHtml(S.coins)}</div>` + rows.join(''), (body) => {
      const td = body.querySelector('#tabDecor'); if (td) td.onclick = () => { AUDIO.soft(); openDecor(); };
      body.querySelectorAll('.shedRow[data-fam]').forEach((row) => row.querySelector('.ic').appendChild(TOOLS.icon(tierOf(row.dataset.fam), 52)));
      body.querySelectorAll('.buy').forEach((b) => b.onclick = () => {
        if (b.dataset.helper) {
          const o = helperOffer(); if (!o || S.coins < o.cost) return nope(b);
          S.coins -= o.cost; S.helpers++; save(); AUDIO.buy(); toast('A tidy-bot joins you!'); return openShed();
        }
        const fam = b.dataset.fam, u = nextUpgrade(fam);
        if (!u || S.coins < u.cost) return nope(b);
        S.coins -= u.cost; S.tiers[fam] = tierIdx(fam) + 1; save(); AUDIO.buy(); toast(`${u.tier.name}!`); openShed();
      });
    });
  }
  function openDecor() {
    const rows = DATA.DECOR.map((d) => {
      const has = !!S.decor[d.id];
      return `<div class="shedRow"><div class="ic emo">${d.icon}</div><div class="sInfo"><div class="sName">${d.name}</div><div class="sub">${has ? 'At the cottage' : 'Appears at the cottage'}</div></div>
        ${has ? '<div class="maxed">Yours ✓</div>' : `<button class="buy${S.coins >= d.cost ? ' can' : ''}" data-decor="${d.id}"><span>Buy</span><span class="price">${coinHtml(d.cost)}</span></button>`}</div>`;
    }).join('');
    openSheet('The shed', `<div class="tabs"><button class="tab" id="tabTools">Tools</button><button class="tab on">Decorate</button></div><div class="shedCoins">${coinHtml(S.coins)}</div>${rows}`, (body) => {
      body.querySelector('#tabTools').onclick = () => { AUDIO.soft(); openShed(); };
      body.querySelectorAll('[data-decor]').forEach((b) => b.onclick = () => {
        const d = DATA.DECOR.find((x) => x.id === b.dataset.decor);
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
    const sj = seasonJobs();
    if (sj.length) {
      html += `<div class="jobArea">${DATA.SEASON_NAMES[seasonName()]}</div>`;
      for (const j of sj) html += row(j, S.sdone[j.id]);
    }
    for (const c of DATA.CHORES) {
      if (c.area !== lastArea) { html += `<div class="jobArea">${DATA.AREAS[c.area]}</div>`; lastArea = c.area; }
      html += row(c, S.done[c.id]);
    }
    openSheet('Jobs', html, (body) => {
      body.querySelectorAll('.jGo').forEach((b) => b.onclick = () => {
        const c = DATA.CHORES.find((x) => x.id === b.dataset.id) || sj.find((x) => x.id === b.dataset.id);
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
      <label class="setRow nameRow"><span>Name of the cottage</span><input type="text" id="setName" maxlength="22" placeholder="Ivy Cottage" value="${(S.name || '').replace(/"/g, '&quot;')}"></label>
      <label class="setRow"><span>Evening light after 8 pm</span><input type="checkbox" id="setEvening" ${S.evening ? 'checked' : ''}></label>
      <div class="setNote">Tip: on iPhone, tap Share and then <b>Add to Home Screen</b> to play full screen and offline.</div>
      <div class="setStats">Coins earned in total: ${U.fmt(S.earned)}</div>
      <button class="danger" id="setReset">Start the cottage over</button>`, (body) => {
      body.querySelector('#setSfx').onchange = (e) => { S.sfx = e.target.checked; AUDIO.set('sfx', S.sfx); save(); };
      body.querySelector('#setMusic').onchange = (e) => { S.music = e.target.checked; AUDIO.set('music', S.music); save(); };
      body.querySelector('#setName').oninput = (e) => { S.name = e.target.value.trim().slice(0, 22); save(); };
      body.querySelector('#setEvening').onchange = (e) => { S.evening = e.target.checked; save(); };
      body.querySelector('#setReset').onclick = (e) => {
        if (e.target.dataset.sure) { S = fresh(); save(); closeSheet(); toast('A fresh start'); return; }
        e.target.dataset.sure = '1'; e.target.textContent = 'Tap again to really start over';
      };
    });
  }

  $('#btnShed').onclick = () => { AUDIO.pop(); openShed(); };
  $('#btnJobs').onclick = () => { AUDIO.pop(); openJobs(); };
  $('#btnSettings').onclick = () => { AUDIO.pop(); openSettings(); };
  $('#btnFinds').onclick = () => { AUDIO.pop(); openFinds(); };

  // ----------------------------------------------------------------- boot
  function renderTitle() {
    const st = {}, pending = {};
    for (const c of DATA.CHORES) if (S.done[c.id]) st[c.part] = true;
    for (const j of seasonJobs()) if (!S.sdone[j.id]) pending[j.part] = j.pending;
    $('#titleScene').innerHTML = HOUSE.render(st, S.colours, { season: seasonName(), pending, decor: S.decor, pct: doneCount() / DATA.CHORES.length, night: isEvening() });
    if (S.name) $('#title .logo span').textContent = S.name;
    if (S.earned > 0) $('#title .tap').textContent = 'Back to the cottage';
  }
  renderTitle();
  $('#title').addEventListener('click', () => {
    AUDIO.unlock(); AUDIO.set('sfx', S.sfx); AUDIO.set('music', S.music);
    AUDIO.pop();
    show('home'); renderHome();
  });
  document.addEventListener('pointerdown', () => AUDIO.unlock(), { once: false, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); AUDIO.suspend(); } else AUDIO.resume();
  });
  setInterval(save, 5000);
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && location.hostname !== 'localhost') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // test hooks
  window.__ivy = { get S() { return S; }, ENGINE, startChore: (i) => startChore(DATA.CHORES[i], false), startJob: (c) => startChore(c, false), render: () => renderHome(), save, reset() { S = fresh(); save(); renderHome(); } };
})();
