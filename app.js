/*
 * app.js — screens, share flows (A/B/C), vibration, event log, CSV export.
 * Depends on: posts.js (window.POST_SETS).
 *
 * Conditions:
 *   A — standard:          Share -> "Share this post?" (Share / Cancel) -> shared. No vibration.
 *   B — source question:   Share -> prompt "Did you check the source?" -> Share / Cancel. No vibration.
 *   C — question + haptic: same prompt as B, plus vibration (1 pulse on prompt, 2 pulses on share).
 * B and C are identical except for vibration.
 */
(function () {
  'use strict';

  // =====================================================================
  // STRINGS — every user-visible text lives here.
  // =====================================================================
  const STRINGS = {
    // Setup (researcher)
    setupTitle: 'Researcher setup',
    placeholderWarning: 'Placeholder posts are loaded (posts.js). Replace them with the real content before the study.',
    setsWarning: 'Post sets problem: {msg}',
    resumeTitle: 'Unfinished session',
    resumeInfo: 'Participant {pid}, session {sid} — stopped at: {where}.',
    resumeBtn: 'Resume this session',
    pidLabel: 'Participant number',
    planEmpty: 'Enter a participant number to see the plan.',
    planHeader: 'Order {order} · rotation {rot}',
    planBlock: 'Part', planCond: 'Condition', planSet: 'Post set',
    condName: { A: 'A — standard', B: 'B — source question', C: 'C — source question + vibration' },
    vibTitle: 'Vibration (condition C)',
    vibToggle: 'Vibration on',
    vibSupported: 'This browser supports vibration.',
    vibUnsupported: 'This browser does NOT support vibration — condition C will not vibrate here. Use Android Chrome.',
    vibOffWarning: 'Vibration is off: condition C will behave like B.',
    test1: 'Test 1 pulse',
    test2: 'Test 2 pulses',
    vibTestResult: 'navigator.vibrate returned: {r}',
    startBtn: 'Start session',
    dataTitle: 'Data',
    dataInfo: 'Export uses the most recent session ({sid}). {n} sessions stored on this phone.',
    dataNone: 'No sessions stored yet.',
    exportRaw: 'Export CSV (raw events)',
    exportSummary: 'Export CSV (summary per post)',
    exportAll: 'Export all sessions (raw)',
    clearData: 'Clear all data…',
    clearConfirm: 'Delete ALL stored sessions from this phone? Export first — this cannot be undone.',
    nothingToExport: 'No session to export yet.',
    leaveWarning: 'A session is running. Leave anyway?',

    // Block intro (B and C share the same text: only vibration differs)
    introPart: 'Part {n} of 3',
    introTitle: 'Before you start',
    introA: 'In this part, sharing works the usual way: tap Share and the post is shared.',
    introB: 'In this part, when you tap Share you will see a short question before the post is shared.',
    introC: 'In this part, when you tap Share you will see a short question before the post is shared.',
    introCommon: 'Scroll through the feed and share any posts you would normally share. You can view a post’s source at any time. When you are done, tap “Finish this feed”.',
    introBegin: 'Begin',

    // Feed
    feedTitle: 'Feed',
    viewSource: 'View source',
    share: 'Share',
    repost: 'Repost',
    reposted: 'Reposted',
    shared: 'Shared ✓',
    sharedToast: 'Shared',
    finishFeed: 'Finish this feed',
    finishFeedAgain: 'Tap again to finish',
    postAria: 'Post by {author}',

    cancel: 'Cancel',

    // Source question prompt (B and C — identical)
    promptTitle: 'Every share asks for a short pause.',
    promptSub: 'This does not mean the post is false.',
    promptQuestion: 'Did you check the source?',
    inspectSource: 'Inspect source',

    // Source page
    sourceTitle: 'Source trace',
    srcPublisher: 'Publisher',
    srcPublished: 'Published',
    srcEvidence: 'Evidence',
    srcNote: 'Note',
    back: 'Back',

    // Block end
    blockEndTitle: 'Part {n} finished',
    blockEndText: 'Please tell the researcher.',
    researcherContinue: 'Researcher: continue',

    // Debrief
    debriefTitle: 'About the posts you saw',
    debriefIntro: 'Some posts in this study were deliberately misleading. Here they are, with corrections:',
    debriefOutro: 'All posts, accounts and sources in this study were created for research. Thank you for taking part!',
    debriefDone: 'Finish',
    debriefClaim: 'Post: “{text}”',

    // End
    endTitle: 'Thank you!',
    endText: 'The session is complete. Please hand the phone back to the researcher.',
    backToSetup: 'Back to setup',

    // Phase names (resume info)
    phase: { intro: 'part {n} intro', feed: 'part {n} feed', blockEnd: 'end of part {n}', debrief: 'debrief', done: 'finished' }
  };

  function t(key, vars) {
    let s = key.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, STRINGS);
    if (s == null) { console.warn('Missing string', key); return key; }
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(String(vars[k])); });
    return s;
  }

  // =====================================================================
  // Constants & helpers
  // =====================================================================
  const ORDERS = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'];
  const CONDS = ['A', 'B', 'C'];
  const SETS = ['S1', 'S2', 'S3'];
  const LS_SETTINGS = 'mf_settings';
  const LS_ACTIVE = 'mf_active';
  const LS_PREFIX = 'mf_session_';
  const VIB_SUPPORTED = 'vibrate' in navigator;

  const $ = function (id) { return document.getElementById(id); };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { console.error('localStorage write failed', e); return false; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  function computePlan(pid) {
    const order = ORDERS[(pid - 1) % 6];
    const rot = Math.floor((pid - 1) / 6) % 3;
    return {
      order: order, rot: rot,
      blocks: order.split('').map(function (c, i) {
        return { block: i + 1, condition: c, set: SETS[(CONDS.indexOf(c) + rot) % 3] };
      })
    };
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let r = Math.imul(a ^ a >>> 15, 1 | a);
      r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, seed) {
    const rnd = mulberry32(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  const POST_BY_ID = {};
  Object.keys(window.POST_SETS || {}).forEach(function (s) {
    window.POST_SETS[s].forEach(function (p) { POST_BY_ID[p.id] = p; });
  });

  function validateSets() {
    const problems = [];
    const seen = {};
    SETS.forEach(function (s) {
      const arr = (window.POST_SETS || {})[s];
      if (!Array.isArray(arr)) { problems.push(s + ' missing'); return; }
      const nTrue = arr.filter(function (p) { return p.veracity === 'true'; }).length;
      const nMis = arr.filter(function (p) { return p.veracity === 'misleading'; }).length;
      if (arr.length !== 8 || nTrue !== 4 || nMis !== 4) problems.push(s + ': ' + arr.length + ' posts (' + nTrue + ' true / ' + nMis + ' misleading), expected 8 (4/4)');
      arr.forEach(function (p) { if (seen[p.id]) problems.push('duplicate id ' + p.id); seen[p.id] = true; });
    });
    return problems;
  }

  function initials(name) {
    return name.split(/\s+/).filter(function (w) { return /^[\p{L}\p{N}]/u.test(w); }).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // Avatar colour derived from the handle, so each account keeps the same colour.
  const AVATAR_COLORS = ['#1d4ed8', '#047857', '#b45309', '#7c3aed', '#be123c', '#0f766e', '#475569', '#9333ea'];
  function avatar(p, small) {
    let h = 0;
    for (let i = 0; i < p.handle.length; i++) h = (h * 31 + p.handle.charCodeAt(i)) >>> 0;
    const a = el('div', { class: 'avatar' + (small ? ' sm' : ''), 'aria-hidden': 'true', text: initials(p.author) });
    a.style.background = AVATAR_COLORS[h % AVATAR_COLORS.length];
    return a;
  }

  // One line: Name  @handle · time
  function postHeader(p) {
    const parts = [el('b', { class: 'name', text: p.author }), el('span', { class: 'handle', text: p.handle })];
    if (p.time) parts.push(el('span', { class: 'handle', text: '· ' + p.time }));
    return el('div', { class: 'tweet-head' }, parts);
  }

  // Compact post (prompt screen and source page): small avatar + header, then text.
  function renderMiniPost(container, p) {
    container.textContent = '';
    container.appendChild(el('div', { class: 'mini-head' }, [avatar(p, true), postHeader(p)]));
    container.appendChild(el('p', { class: 'tweet-text', text: p.text }));
  }

  // Simple line icons (decorative). Paths are original, drawn on a 24×24 grid.
  const ICONS = {
    reply: 'M4 5.5h16v10.5H10l-5 4v-4H4z',
    repost: 'M7 6h10.5v6M14.5 9l3 3 3-3M17 18H6.5v-6M9.5 15l-3-3-3 3',
    like: 'M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z',
    views: 'M5 20v-7M10 20V5M15 20v-10M20 20v-4',
    share: 'M12 15V4M7.5 8.5 12 4l4.5 4.5M5 13v6.5h14V13',
    check: 'M5 12.5l4.5 4.5L19 7.5'
  };
  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'ico');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', ICONS[name]);
    svg.appendChild(path);
    return svg;
  }
  function decoIcon(name) {
    const s = el('span', { class: 'deco-ico', 'aria-hidden': 'true' });
    s.appendChild(icon(name));
    return s;
  }

  // =====================================================================
  // Settings & session state (persisted to localStorage)
  // =====================================================================
  const settings = Object.assign({ vib: true }, JSON.parse(lsGet(LS_SETTINGS) || '{}'));
  function saveSettings() { lsSet(LS_SETTINGS, JSON.stringify(settings)); }

  let session = null;
  /* session = { id, pid, plan, startEpoch, blockIdx, phase, finishedAt,
                 blocks: [{ order:[postId], shared:[postId], visible:[postId], startEpoch }], seq, events:[] }
     phase: 'intro' | 'feed' | 'blockEnd' | 'debrief' | 'done' */

  function saveSession() {
    if (!session) return;
    if (!lsSet(LS_PREFIX + session.id, JSON.stringify(session))) {
      toast('⚠ Could not save log (storage full?) — export now.');
    }
    lsSet(LS_ACTIVE, session.id);
  }
  function loadSession(id) {
    const raw = id ? lsGet(LS_PREFIX + id) : null;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function allSessionIds() {
    const ids = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(LS_PREFIX) === 0) ids.push(k.slice(LS_PREFIX.length));
      }
    } catch (e) { /* ignore */ }
    return ids;
  }

  function curBlock() {
    if (!session || session.phase === 'debrief' || session.phase === 'done') return null;
    return session.plan.blocks[session.blockIdx] || null;
  }
  function cond() { const b = curBlock(); return b ? b.condition : null; }
  function blockState() { return session.blocks[session.blockIdx]; }

  // =====================================================================
  // Event log
  // =====================================================================
  const RAW_COLS = ['participant', 'session_id', 'seq', 'timestamp_iso', 't_ms', 'block', 'condition', 'post_set',
    'post_id', 'post_index', 'veracity', 'event', 'value_ms', 'detail', 'vib_enabled', 'vib_supported'];

  function log(event, o) {
    if (!session) return;
    o = o || {};
    const b = curBlock();
    const pid = o.post_id || '';
    const post = pid ? POST_BY_ID[pid] : null;
    let idx = '';
    if (pid && b) {
      const i = session.blocks[session.blockIdx].order.indexOf(pid);
      if (i >= 0) idx = i + 1;
    }
    const e = {
      participant: session.pid,
      session_id: session.id,
      seq: ++session.seq,
      timestamp_iso: new Date().toISOString(),
      t_ms: Date.now() - session.startEpoch,
      block: b ? b.block : '',
      condition: b ? b.condition : '',
      post_set: b ? b.set : '',
      post_id: pid,
      post_index: idx,
      veracity: post ? post.veracity : '',
      event: event,
      value_ms: o.value_ms == null ? '' : Math.round(o.value_ms),
      detail: o.detail == null ? '' : String(o.detail),
      vib_enabled: settings.vib ? 1 : 0,
      vib_supported: VIB_SUPPORTED ? 1 : 0
    };
    session.events.push(e);
    saveSession();
    return e;
  }

  // =====================================================================
  // Vibration — the ONLY place navigator.vibrate is called during a session.
  // Only condition C vibrates; A and B never do.
  // =====================================================================
  const VIB_PATTERNS = { prompt: 120, done: [80, 80, 80] };

  function haptic(kind, postId) {
    if (cond() !== 'C') return; // guarantees: no vibration in A or B (or outside a block)
    const pattern = VIB_PATTERNS[kind];
    const pat = JSON.stringify(pattern);
    if (!settings.vib) { log('vibrate', { post_id: postId, detail: kind + '|' + pat + '|skipped:disabled' }); return; }
    if (!VIB_SUPPORTED) { log('vibrate', { post_id: postId, detail: kind + '|' + pat + '|skipped:unsupported' }); return; }
    let r;
    try { r = navigator.vibrate(pattern); } catch (e) { r = 'error:' + e.message; }
    log('vibrate', { post_id: postId, detail: kind + '|' + pat + '|' + r });
  }

  // =====================================================================
  // Screens & overlays
  // =====================================================================
  const SCREENS = ['setup', 'intro', 'feed', 'blockend', 'debrief', 'end'];
  function showScreen(name) {
    SCREENS.forEach(function (s) { $('screen-' + s).hidden = s !== name; });
    window.scrollTo(0, 0);
  }
  function updateBodyLock() {
    const open = !$('ov-prompt').hidden || !$('ov-source').hidden;
    document.body.classList.toggle('overlay-open', open);
  }
  function showOverlay(id, on) { $(id).hidden = !on; updateBodyLock(); }

  let toastTimer = 0;
  function toast(msg) {
    const n = $('toast');
    n.textContent = msg; n.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { n.hidden = true; }, 1600);
  }

  function fillStaticStrings() {
    document.querySelectorAll('[data-s]').forEach(function (n) { n.textContent = t(n.getAttribute('data-s')); });
  }

  // =====================================================================
  // Setup screen
  // =====================================================================
  function parsePid() {
    const v = parseInt($('pidInput').value, 10);
    return Number.isFinite(v) && v >= 1 ? v : null;
  }

  function renderPlanPreview() {
    const pid = parsePid();
    const box = $('planPreview');
    box.textContent = '';
    $('btnStart').disabled = !pid;
    if (!pid) { box.appendChild(el('p', { class: 'muted', text: t('planEmpty') })); return; }
    const plan = computePlan(pid);
    box.appendChild(el('p', { class: 'muted', text: t('planHeader', { order: plan.order, rot: plan.rot }) }));
    const tbl = el('table');
    tbl.appendChild(el('tr', null, [el('th', { text: t('planBlock') }), el('th', { text: t('planCond') }), el('th', { text: t('planSet') })]));
    plan.blocks.forEach(function (b) {
      tbl.appendChild(el('tr', null, [el('td', { text: String(b.block) }), el('td', { text: t('condName.' + b.condition) }), el('td', { text: b.set })]));
    });
    box.appendChild(tbl);
  }

  function renderVibStatus() {
    $('vibSupport').textContent = VIB_SUPPORTED ? t('vibSupported') : t('vibUnsupported');
    $('vibSupport').className = VIB_SUPPORTED ? 'muted' : 'warn';
    $('vibOffWarning').hidden = settings.vib || !VIB_SUPPORTED;
    $('vibOffWarning').textContent = t('vibOffWarning');
  }

  function renderSetupData() {
    const ids = allSessionIds();
    const last = lsGet(LS_ACTIVE);
    $('dataInfo').textContent = ids.length ? t('dataInfo', { sid: last || '—', n: ids.length }) : t('dataNone');
    const s = loadSession(last);
    const canResume = s && s.phase !== 'done';
    $('resumePanel').hidden = !canResume;
    if (canResume) {
      const where = t('phase.' + s.phase, { n: s.blockIdx + 1 });
      $('resumeInfo').textContent = t('resumeInfo', { pid: s.pid, sid: s.id, where: where });
    }
  }

  function renderSetup() {
    $('vibToggle').checked = !!settings.vib;
    $('btnTest1').disabled = $('btnTest2').disabled = !VIB_SUPPORTED;
    renderVibStatus();
    if (window.POSTS_ARE_PLACEHOLDER) { $('placeholderWarning').hidden = false; $('placeholderWarning').textContent = t('placeholderWarning'); }
    const probs = validateSets();
    if (probs.length) { $('setsWarning').hidden = false; $('setsWarning').textContent = t('setsWarning', { msg: probs.join('; ') }); }
    renderPlanPreview();
    renderSetupData();
    showScreen('setup');
  }

  // =====================================================================
  // Session lifecycle
  // =====================================================================
  function startSession(pid) {
    const plan = computePlan(pid);
    const now = Date.now();
    session = {
      id: 'P' + pid + '-' + now.toString(36),
      pid: pid, plan: plan, startEpoch: now,
      blockIdx: 0, phase: 'intro', finishedAt: null, seq: 0, events: [],
      blocks: plan.blocks.map(function (b) {
        const ids = window.POST_SETS[b.set].map(function (p) { return p.id; });
        return { order: seededShuffle(ids, pid * 1000 + b.block), shared: [], visible: [] };
      })
    };
    log('session_start', { detail: 'order=' + plan.order + ';rot=' + plan.rot + ';plan=' + plan.blocks.map(function (b) { return b.condition + ':' + b.set; }).join(',') + ';placeholder=' + (window.POSTS_ARE_PLACEHOLDER ? 1 : 0) + ';ua=' + navigator.userAgent });
    requestWakeLock();
    goPhase();
  }

  function resumeSession() {
    const s = loadSession(lsGet(LS_ACTIVE));
    if (!s) return;
    session = s;
    log('session_resume', { detail: 'phase=' + s.phase });
    requestWakeLock();
    goPhase();
  }

  function goPhase() {
    switch (session.phase) {
      case 'intro': renderIntro(); break;
      case 'feed': renderFeed(); break;
      case 'blockEnd': renderBlockEnd(); break;
      case 'debrief': renderDebrief(false); break;
      case 'done': showScreen('end'); break;
    }
  }

  function renderIntro() {
    const b = curBlock();
    $('introPart').textContent = t('introPart', { n: b.block });
    $('introText').textContent = t('intro' + b.condition);
    showScreen('intro');
  }

  function beginBlock() {
    session.phase = 'feed';
    blockState().startEpoch = Date.now();
    log('block_start', { detail: 'order=' + blockState().order.join(',') });
    renderFeed();
  }

  function finishBlock() {
    const bs = blockState();
    log('block_end', { value_ms: bs.startEpoch ? Date.now() - bs.startEpoch : null, detail: 'shared=' + bs.shared.join(',') });
    if (observer) { observer.disconnect(); observer = null; }
    session.phase = 'blockEnd';
    saveSession();
    renderBlockEnd();
  }

  function renderBlockEnd() {
    $('blockEndTitle').textContent = t('blockEndTitle', { n: session.blockIdx + 1 });
    showScreen('blockend');
  }

  function researcherContinue() {
    if (session.blockIdx < session.plan.blocks.length - 1) {
      session.blockIdx++;
      session.phase = 'intro';
      saveSession();
      renderIntro();
    } else {
      session.phase = 'debrief';
      saveSession();
      renderDebrief(true);
    }
  }

  function renderDebrief(logIt) {
    const list = $('debriefList');
    list.textContent = '';
    session.plan.blocks.forEach(function (b) {
      window.POST_SETS[b.set].forEach(function (p) {
        if (p.veracity !== 'misleading') return;
        list.appendChild(el('li', null, [
          el('p', { class: 'claim', text: t('debriefClaim', { text: p.text }) }),
          el('p', { text: p.debrief })
        ]));
      });
    });
    if (logIt) log('debrief_shown');
    showScreen('debrief');
  }

  function endSession() {
    session.phase = 'done';
    session.finishedAt = Date.now();
    log('session_end', { value_ms: Date.now() - session.startEpoch });
    releaseWakeLock();
    showScreen('end');
  }

  // =====================================================================
  // Feed
  // =====================================================================
  let observer = null;

  function renderFeed() {
    const bs = blockState();
    const list = $('feedList');
    list.textContent = '';
    if (observer) observer.disconnect();
    observer = 'IntersectionObserver' in window ? new IntersectionObserver(onIntersect, { threshold: 0.5 }) : null;

    bs.order.forEach(function (id) {
      const p = POST_BY_ID[id];
      const li = el('li', { class: 'tweet', 'data-id': id, 'aria-label': t('postAria', { author: p.author }) });
      const body = el('div', { class: 'tweet-body' });
      body.appendChild(postHeader(p));
      body.appendChild(el('p', { class: 'tweet-text', text: p.text }));

      // "View source" looks like a link, behaves like a button (opens the in-app source page).
      const srcLink = el('button', { type: 'button', class: 'link-btn', text: t('viewSource') });
      srcLink.addEventListener('click', function () { openSource(id, 'feed'); });
      body.appendChild(srcLink);

      // Action row: reply / like / views are decorative only (no counts, to avoid social-proof
      // differences between posts). Repost and Share both start the same share flow.
      const deco = el('div', { class: 'tweet-deco' });
      deco.appendChild(decoIcon('reply'));
      const repostBtn = el('button', { type: 'button', class: 'repost-btn', 'data-repost': id, 'aria-label': t('repost') });
      repostBtn.appendChild(icon('repost'));
      repostBtn.addEventListener('click', function () { shareTap(id, 'repost'); });
      deco.appendChild(repostBtn);
      deco.appendChild(decoIcon('like'));
      deco.appendChild(decoIcon('views'));
      const shareBtn = el('button', { type: 'button', class: 'share-btn', 'data-share': id });
      shareBtn.addEventListener('click', function () { shareTap(id, 'share'); });
      body.appendChild(el('div', { class: 'tweet-actions' }, [deco, shareBtn]));

      li.appendChild(avatar(p));
      li.appendChild(body);
      list.appendChild(li);
      updateShareButton(id);
      if (observer) observer.observe(li);
      else markVisible(id);
    });
    resetFinishButton();
    showScreen('feed');
  }

  function onIntersect(entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) markVisible(en.target.getAttribute('data-id'));
    });
  }
  function markVisible(id) {
    if (!session || session.phase !== 'feed') return;
    const bs = blockState();
    if (bs.visible.indexOf(id) >= 0) return;
    bs.visible.push(id);
    log('post_visible', { post_id: id });
  }

  function updateShareButton(id) {
    const btn = document.querySelector('[data-share="' + id + '"]');
    if (!btn) return;
    const isShared = blockState().shared.indexOf(id) >= 0;
    btn.disabled = isShared;
    btn.textContent = '';
    btn.appendChild(icon(isShared ? 'check' : 'share'));
    btn.appendChild(el('span', { text: isShared ? t('shared').replace(' ✓', '') : t('share') }));
    btn.classList.toggle('shared', isShared);
    const rp = document.querySelector('[data-repost="' + id + '"]');
    if (rp) {
      rp.disabled = isShared;
      rp.classList.toggle('shared', isShared);
      rp.setAttribute('aria-label', isShared ? t('reposted') : t('repost'));
    }
  }

  let finishArmed = false, finishTimer = 0;
  function resetFinishButton() { finishArmed = false; clearTimeout(finishTimer); $('btnFinishFeed').textContent = t('finishFeed'); }
  function onFinishTap() {
    if (!finishArmed) {
      finishArmed = true;
      $('btnFinishFeed').textContent = t('finishFeedAgain');
      finishTimer = setTimeout(resetFinishButton, 3000);
      return;
    }
    resetFinishButton();
    finishBlock();
  }

  // =====================================================================
  // Share flow
  // =====================================================================
  let activePostId = null;  // post currently in the prompt
  let activeEntry = null;   // which feed button started it: 'share' | 'repost'

  // Both the Share button and the Repost icon lead to the same flow (A: shared at once, B/C: prompt).
  function shareTap(id, entry) {
    if (blockState().shared.indexOf(id) >= 0) return;
    activePostId = id;
    activeEntry = entry;
    log('share_tap', { post_id: id, detail: entry });
    if (cond() === 'A') shareComplete('direct');
    else openPrompt(id);
  }

  function shareComplete(via) {
    const id = activePostId;
    if (!id) return;
    log('share_complete', { post_id: id, detail: via + ':' + activeEntry });
    haptic('done', id);
    const bs = blockState();
    if (bs.shared.indexOf(id) < 0) bs.shared.push(id);
    saveSession();
    closePrompt();
    activePostId = null;
    updateShareButton(id);
    toast(t('sharedToast'));
  }

  function shareCancel(via) {
    const id = activePostId;
    if (!id) return;
    log('cancel', { post_id: id, detail: via + ':' + activeEntry });
    closePrompt();
    activePostId = null;
    const btn = document.querySelector('[data-' + (activeEntry === 'repost' ? 'repost' : 'share') + '="' + id + '"]');
    if (btn) btn.focus();
  }


  // ---- B/C: source question prompt (identical UI; C adds vibration) ----
  function openPrompt(id) {
    renderMiniPost($('promptSummary'), POST_BY_ID[id]);
    showOverlay('ov-prompt', true);
    $('ov-prompt').scrollTop = 0;
    log('prompt_shown', { post_id: id });
    haptic('prompt', id);
    $('btnInspect').focus({ preventScroll: true });
  }
  function closePrompt() { showOverlay('ov-prompt', false); }

  // =====================================================================
  // Source trace page
  // =====================================================================
  let sourceState = null; // { postId, context, t0, returnFocus }

  function openSource(id, context) {
    const p = POST_BY_ID[id];
    sourceState = { postId: id, context: context, t0: performance.now(), returnFocus: document.activeElement };
    renderMiniPost($('sourcePost'), p);
    $('srcPublisher').textContent = p.source.publisher;
    $('srcPublished').textContent = p.source.published;
    $('srcEvidence').textContent = p.source.evidence;
    $('srcNote').textContent = p.source.note;
    showOverlay('ov-source', true);
    $('ov-source').scrollTop = 0;
    log('source_open', { post_id: id, detail: context });
    $('btnSourceBack').focus({ preventScroll: true });
  }

  function closeSource() {
    if (!sourceState) return;
    const s = sourceState;
    sourceState = null;
    log('source_close', { post_id: s.postId, value_ms: performance.now() - s.t0, detail: s.context });
    showOverlay('ov-source', false);
    if (s.returnFocus && s.returnFocus.focus) s.returnFocus.focus({ preventScroll: true });
  }

  // =====================================================================
  // Wake lock, visibility, unload
  // =====================================================================
  let wakeLock = null;
  function requestWakeLock() {
    if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; }).catch(function () { /* ignore */ });
  }
  function releaseWakeLock() { if (wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; } }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && session && session.phase !== 'done') requestWakeLock();
  });

  window.addEventListener('beforeunload', function (e) {
    if (session && session.phase !== 'done') { e.preventDefault(); e.returnValue = t('leaveWarning'); return t('leaveWarning'); }
  });

  // =====================================================================
  // CSV export
  // =====================================================================
  function csvCell(v) {
    if (v == null) return '';
    const s = String(v);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(cols, rows) {
    return [cols.join(',')].concat(rows.map(function (r) {
      return cols.map(function (c) { return csvCell(r[c]); }).join(',');
    })).join('\r\n') + '\r\n';
  }

  function rawCSV(sessions) {
    let rows = [];
    sessions.forEach(function (s) { rows = rows.concat(s.events); });
    return toCSV(RAW_COLS, rows);
  }

  const SUM_COLS = ['participant', 'block', 'condition', 'post_set', 'post_id', 'veracity', 'source_opens', 'source_opens_from_prompt',
    'source_time_ms', 'shared', 'shared_via', 'share_attempts', 'repost_attempts', 'cancels', 'decision_time_ms', 'time_from_first_view_ms'];

  function summaryCSV(s) {
    const rows = [];
    s.plan.blocks.forEach(function (b) {
      const evs = s.events.filter(function (e) { return e.block === b.block; });
      window.POST_SETS[b.set].forEach(function (p) {
        const pe = evs.filter(function (e) { return e.post_id === p.id; });
        const count = function (name, detail) {
          return pe.filter(function (e) { return e.event === name && (detail == null || e.detail === detail); }).length;
        };
        let sourceTime = 0, lastTap = null, lastEntry = '', sharedVia = '', decision = '', firstView = null, firstTap = null;
        pe.forEach(function (e) {
          if (e.event === 'source_close' && e.value_ms !== '') sourceTime += Number(e.value_ms);
          if (e.event === 'post_visible' && firstView == null) firstView = e.t_ms;
          if (e.event === 'share_tap') { lastTap = e.t_ms; lastEntry = e.detail; if (firstTap == null) firstTap = e.t_ms; }
          if (e.event === 'share_complete') sharedVia = lastEntry;
          if ((e.event === 'share_complete' || e.event === 'cancel') && lastTap != null) { decision = e.t_ms - lastTap; lastTap = null; }
        });
        rows.push({
          participant: s.pid, block: b.block, condition: b.condition, post_set: b.set, post_id: p.id, veracity: p.veracity,
          source_opens: count('source_open'), source_opens_from_prompt: count('source_open', 'prompt'),
          source_time_ms: sourceTime,
          shared: count('share_complete') > 0 ? 1 : 0,
          shared_via: sharedVia,
          share_attempts: count('share_tap'), repost_attempts: count('share_tap', 'repost'), cancels: count('cancel'),
          decision_time_ms: decision,
          time_from_first_view_ms: firstView != null && firstTap != null ? firstTap - firstView : ''
        });
      });
    });
    return toCSV(SUM_COLS, rows);
  }

  function stamp() {
    const d = new Date();
    const p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes());
  }
  function download(name, text) {
    const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function exportSession(kind) {
    const s = (session && session.id === lsGet(LS_ACTIVE)) ? session : loadSession(lsGet(LS_ACTIVE));
    if (!s) { toast(t('nothingToExport')); return; }
    if (kind === 'raw') download('friction_P' + s.pid + '_raw_' + stamp() + '.csv', rawCSV([s]));
    else download('friction_P' + s.pid + '_summary_' + stamp() + '.csv', summaryCSV(s));
  }
  function exportAll() {
    const list = allSessionIds().map(loadSession).filter(Boolean).sort(function (a, b) { return a.startEpoch - b.startEpoch; });
    if (!list.length) { toast(t('nothingToExport')); return; }
    download('friction_ALL_raw_' + stamp() + '.csv', rawCSV(list));
  }

  // =====================================================================
  // Wire up UI
  // =====================================================================
  function init() {
    fillStaticStrings();

    // Setup
    $('pidInput').addEventListener('input', renderPlanPreview);
    $('vibToggle').addEventListener('change', function () { settings.vib = $('vibToggle').checked; saveSettings(); renderVibStatus(); });
    $('btnTest1').addEventListener('click', function () { const r = navigator.vibrate(VIB_PATTERNS.prompt); $('vibTestResult').textContent = t('vibTestResult', { r: r }); });
    $('btnTest2').addEventListener('click', function () { const r = navigator.vibrate(VIB_PATTERNS.done); $('vibTestResult').textContent = t('vibTestResult', { r: r }); });
    $('btnStart').addEventListener('click', function () { const pid = parsePid(); if (pid) startSession(pid); });
    $('btnResume').addEventListener('click', resumeSession);
    $('btnExportRaw').addEventListener('click', function () { exportSession('raw'); });
    $('btnExportSummary').addEventListener('click', function () { exportSession('summary'); });
    $('btnExportAll').addEventListener('click', exportAll);
    $('btnClear').addEventListener('click', function () {
      if (!window.confirm(t('clearConfirm'))) return;
      allSessionIds().forEach(function (id) { lsDel(LS_PREFIX + id); });
      lsDel(LS_ACTIVE);
      session = null;
      renderSetupData();
    });

    // Flow
    $('btnBeginBlock').addEventListener('click', beginBlock);
    $('btnFinishFeed').addEventListener('click', onFinishTap);
    $('btnResearcherContinue').addEventListener('click', researcherContinue);
    $('btnDebriefDone').addEventListener('click', endSession);
    $('btnEndExportRaw').addEventListener('click', function () { exportSession('raw'); });
    $('btnEndExportSummary').addEventListener('click', function () { exportSession('summary'); });
    $('btnBackToSetup').addEventListener('click', function () { session = null; renderSetup(); });


    // Source question prompt (B/C)
    $('btnInspect').addEventListener('click', function () { openSource(activePostId, 'prompt'); });
    $('btnPromptShare').addEventListener('click', function () { shareComplete('prompt'); });
    $('btnPromptCancel').addEventListener('click', function () { shareCancel('prompt'); });

    // Source
    $('btnSourceBack').addEventListener('click', closeSource);

    // Escape closes the top-most overlay (keyboard users)
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (sourceState) closeSource();
      else if (!$('ov-prompt').hidden) shareCancel('prompt');
    });

    renderSetup();
  }

  init();
})();
