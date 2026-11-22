/* =====================================================================
   MEMORIA LIBRE — Lógica del juego
   ===================================================================== */
(function () {
  'use strict';

  const D = window.GAME_DATA;
  const P = window.PIXEL;
  const S = window.SCENE;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  /* =============================== AJUSTES =============================== */
  const KEY = 'memoriaLibre.peru.v1';
  const QUESTION_TIME = 10;
  const RESCUE_TIME = 5;
  const MAX_LIVES = 3;
  const TOTAL_STORY = D.QUESTIONS.length;
  const STAGE_WIDTH = 3800;
  const MARKER_START = 440;
  const MARKER_GAP = 350;
  const WALK_SPEED = 330;
  const CLIMB_RISE = 320;
  const MINI_GAMES = [
    { id: 'stairs', name: 'ESCALADA', hint: 'Salta a la piedra con la respuesta correcta', icons: ['🪨', '🧗', '🪨'] },
    { id: 'quipu', name: 'QUIPU', hint: 'Ata el nudo que guarda el dato correcto', icons: ['🧶', '🪢', '🧵'] },
    { id: 'temple', name: 'TEMPLO', hint: 'Abre la puerta que revela la respuesta', icons: ['🚪', '🗿', '✨'] }
  ];

  function trailBottomAt(x) {
    const progress = Math.max(0, Math.min(1, (x - MARKER_START) / (MARKER_GAP * (TOTAL_STORY - 1))));
    return Math.round(200 + CLIMB_RISE * progress);
  }

  /* =============================== GUARDADO ============================== */
  function defaultSave() {
    return {
      version: 1,
      fruits: {},
      totalFruits: 0,
      badges: [],
      blocks: {
        independencia: {
          completed: false,
          completedAt: null,
          attempts: 0,
          best: 0,
          mastered: {},
          mistakes: {},
          lastMissed: [],
          reviews: 0
        }
      },
      reviews: 0,
      lastPlayed: null,
      lastReview: null,
      sound: true
    };
  }

  let save = defaultSave();

  function loadSave() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      const base = defaultSave();
      save = Object.assign(base, data);
      save.blocks = Object.assign(base.blocks, data.blocks || {});
      save.blocks.independencia = Object.assign(
        base.blocks.independencia,
        (data.blocks && data.blocks.independencia) || {}
      );
      save.fruits = Object.assign({}, data.fruits || {});
      save.badges = Array.isArray(data.badges) ? data.badges : [];
    } catch (err) {
      console.warn('No se pudo leer el guardado:', err);
    }
  }

  function saveNow() {
    try {
      localStorage.setItem(KEY, JSON.stringify(save));
    } catch (err) {
      console.warn('No se pudo guardar:', err);
    }
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function daysBetween(a, b) {
    if (!a || !b) return null;
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }

  /* =============================== UTILES =============================== */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function fmtTime(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function masteredCount() {
    const m = save.blocks.independencia.mastered || {};
    return Object.keys(m).filter((k) => m[k] > 0).length;
  }

  function addFruit(id) {
    if (!id) return;
    save.fruits[id] = (save.fruits[id] || 0) + 1;
    save.totalFruits = (save.totalFruits || 0) + 1;
    saveNow();
    updateFruitHud(id);
  }

  /* =============================== AUDIO ================================ */
  const Sfx = {
    ctx: null,
    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC(); } catch (err) { this.ctx = null; }
    },
    tone(freq, dur, type, vol, delay) {
      if (!save.sound || !this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol == null ? 0.05 : vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    },
    click() { this.tone(520, 0.05, 'square', 0.03); },
    correct() {
      this.tone(660, 0.09, 'square', 0.05);
      this.tone(990, 0.12, 'square', 0.045, 0.08);
      this.tone(1320, 0.14, 'triangle', 0.035, 0.17);
    },
    wrong() {
      this.tone(200, 0.16, 'sawtooth', 0.05);
      this.tone(130, 0.22, 'sawtooth', 0.045, 0.13);
    },
    tick() { this.tone(1500, 0.03, 'square', 0.018); },
    step() { this.tone(140 + Math.random() * 30, 0.03, 'triangle', 0.012); },
    win() {
      [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.2, 'square', 0.05, i * 0.14));
    },
    lose() {
      [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.24, 'triangle', 0.05, i * 0.16));
    }
  };

  /* ============================== PANTALLAS ============================= */
  function showScreen(id) {
    $$('.screen').forEach((sc) => sc.classList.toggle('is-active', sc.id === id));
    if (id !== 'screen-game') {
      $('#screen-rescue').classList.remove('is-active');
    }
    window.scrollTo(0, 0);
  }

  /* ============================ FONDOS Y FX ============================= */
  function paintBg(el, svg) {
    if (!el || !svg) return;
    el.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    el.style.backgroundRepeat = 'repeat-x';
    el.style.backgroundPosition = 'left bottom';
    el.style.backgroundSize = 'auto 118%';
  }

  function paintLayer(el, svg, size) {
    if (!el || !svg) return;
    el.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center bottom';
    el.style.backgroundSize = size || '100% auto';
  }

  function paintFlat(el, svg) {
    if (!el || !svg) return;
    el.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center bottom';
    el.style.backgroundSize = '100% 100%';
  }

  function paintWorld(el, svg, w, h) {
    if (!el || !svg) return;
    el.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    el.style.backgroundRepeat = 'repeat-x';
    el.style.backgroundPosition = 'left bottom';
    el.style.backgroundSize = w + 'px ' + h + 'px';
  }

  function buildAllBackgrounds() {
    const sc = S.build({ start: MARKER_START, gap: MARKER_GAP, count: TOTAL_STORY, rise: CLIMB_RISE });
    const bgs = ['#menu-far', '#blocks-far', '#summary-far', '#over-far'];
    bgs.forEach((id) => paintBg($(id), sc.far));
    ['#menu-mid', '#blocks-mid', '#summary-mid', '#over-mid'].forEach((id) => paintBg($(id), sc.mid));

    ['#menu-ridge', '#blocks-ridge', '#summary-ridge', '#over-ridge'].forEach((id) => {
      paintLayer($(id), sc.ridge, '100% auto');
    });
    ['#menu-fore', '#blocks-fore'].forEach((id) => {
      paintLayer($(id), sc.fore, '100% 74%');
    });

    paintWorld($('#layer-far'), sc.andesFar, S.W, S.H);
    paintWorld($('#layer-mid'), sc.andesMid, S.W, S.H);
    paintWorld($('#layer-ground'), sc.andesGround, S.W, S.H);
    paintWorld($('#layer-props'), sc.andesProps, S.W, S.H);
    paintWorld($('#layer-vines'), sc.vines, S.W, 260);
    paintFlat($('#world-fore'), sc.andesFore);
  }

  function spawnLeaves(container, n) {
    if (!container) return;
    let html = '';
    for (let i = 0; i < n; i++) {
      const left = Math.random() * 100;
      const dur = 9 + Math.random() * 10;
      const delay = Math.random() * 14;
      const scale = (0.5 + Math.random() * 1.1).toFixed(2);
      html += '<i style="left:' + left.toFixed(2) + '%;' +
        'animation-duration:' + dur.toFixed(2) + 's;animation-delay:' + delay.toFixed(2) + 's;' +
        '--s:' + scale + '"></i>';
    }
    container.innerHTML = html;
  }

  function spawnMotes(container, n) {
    if (!container) return;
    let html = '';
    for (let i = 0; i < n; i++) {
      const left = Math.random() * 100;
      const top = 20 + Math.random() * 75;
      const dur = 6 + Math.random() * 9;
      const delay = Math.random() * 10;
      const scale = 0.5 + Math.random() * 1.4;
      html += '<i style="left:' + left.toFixed(2) + '%;top:' + top.toFixed(2) + '%;' +
        'animation-duration:' + dur.toFixed(2) + 's;animation-delay:' + delay.toFixed(2) + 's;' +
        'transform:scale(' + scale.toFixed(2) + ')"></i>';
    }
    container.innerHTML = html;
  }

  /* ============================== MENÚ ================================= */
  function renderMenu() {
    $('#menu-fruits').textContent = save.totalFruits || 0;
    $('#menu-badges').textContent = save.badges.length;
    $('#menu-mastered').textContent = masteredCount() + '/' + TOTAL_STORY;
    $('#blocks-fruits').textContent = save.totalFruits || 0;

    const hint = $('#menu-review');
    if (!save.lastPlayed && !save.lastReview) {
      hint.textContent = 'Tu primer viaje te espera. ¡La selva guarda 10 recuerdos!';
    } else {
      const last = save.lastReview || save.lastPlayed;
      const diff = daysBetween(last, todayKey());
      if (diff === 0) {
        hint.textContent = '✔ Ya entrenaste tu memoria hoy. ¡Excelente!';
      } else if (diff === 1) {
        hint.textContent = '🍃 Toca repasar: pasó 1 día. ¡No dejes que se escape!';
      } else {
        hint.textContent = '⏳ Pasaron ' + diff + ' días. Un repaso rápido lo trae de vuelta.';
      }
    }
    renderSoundIcons();
  }

  function renderSoundIcons() {
    const ico = save.sound ? '🔊' : '🔇';
    $('#btn-sound').textContent = ico;
    $('#btn-sound-menu').textContent = ico;
  }

  /* ============================== BLOQUES ============================== */
  function renderBlocks() {
    const grid = $('#blocks-grid');
    grid.innerHTML = '';
    const done = save.blocks.independencia.completed;

    D.BLOCKS.forEach((b, i) => {
      const unlocked = i === 0 || (i === 1 && done);
      const isDone = i === 0 && done;
      const pct = i === 0 ? Math.round((masteredCount() / TOTAL_STORY) * 100) : 0;
      const stars = i === 0 ? Math.max(1, Math.round((masteredCount() / TOTAL_STORY) * 3)) : 0;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'blockcard' + (unlocked ? ' is-open' : ' is-locked') + (isDone ? ' is-done' : '');
      card.dataset.id = b.id;
      card.dataset.index = i;
      card.setAttribute('aria-disabled', unlocked ? 'false' : 'true');

      card.innerHTML =
        '<span class="blockcard__top">' +
          '<span class="blockcard__n">BLOQUE ' + b.n + '</span>' +
          '<span class="blockcard__stars" aria-hidden="true">' +
            '★'.repeat(stars) + '☆'.repeat(3 - stars) +
          '</span>' +
        '</span>' +
        '<span class="blockcard__diorama">' +
          '<span class="blockcard__sun" aria-hidden="true"></span>' +
          '<span class="blockcard__icon">' + b.icon + '</span>' +
          '<span class="blockcard__grass" aria-hidden="true"></span>' +
          (unlocked ? '<span class="blockcard__cta">JUGAR ▶</span>' : '') +
          (unlocked ? '' : '<span class="blockcard__lock">' + P.lock + '</span>') +
        '</span>' +
        '<span class="blockcard__title">' + b.title + '</span>' +
        '<span class="blockcard__years">' + b.years + '</span>' +
        '<span class="blockcard__bar"><i style="width:' + pct + '%"></i></span>' +
        '<span class="blockcard__status">' +
          (isDone ? '✔ COMPLETADO · REPETIR' : unlocked ? 'JUGAR ▶' : 'BLOQUEADO') +
        '</span>' +
        (isDone ? '<span class="blockcard__ribbon">COMPLETADO</span>' : '');

      card.addEventListener('click', () => onBlockClick(i, unlocked));
      grid.appendChild(card);
    });

    $('#blocks-fruit-icon').innerHTML = P.fruit('tuna', 2);
    $('#blocks-fruits').textContent = save.totalFruits || 0;
  }

  function onBlockClick(index, unlocked) {
    Sfx.init(); Sfx.click();
    const b = D.BLOCKS[index];
    if (!unlocked) {
      toast('Completa el bloque anterior para abrir este.');
      return;
    }
    if (index === 0) {
      startStory();
      return;
    }
    // Bloque desbloqueado pero en construcción (demo de frontend)
    $('#soon-icon').textContent = b.icon;
    $('#soon-title').textContent = b.title.toUpperCase();
    $('#soon-text').textContent = '¡Desbloqueado! Este bloque estará disponible muy pronto. ' +
      'Por ahora puedes repasar la Independencia del Perú.';
    openModal('#modal-soon');
  }

  /* ============================== MUNDO ================================ */
  const W = { x: 200, cam: 0, camY: 0, targetX: null, targetMarker: null, vw: 0, keys: { left: false, right: false }, last: 0, goShown: false };
  const M = [];

  const G = {
    mode: 'story',
    active: false,
    paused: false,
    queue: [],
    idx: 0,
    lives: MAX_LIVES,
    correct: 0,
    wrong: 0,
    runFruits: [],
    missed: [],
    answeredIds: [],
    rescueUsed: false,
    rescueQueue: [],
    rescueIdx: 0,
    rescueScore: 0,
    reviewIdx: 0,
    q: null,
    answer: 0,
    answered: false,
    optionEls: [],
    timerRaf: 0,
    timerToken: 0,
    startTime: 0,
    awaitingQuestion: false,
    lastStepAt: 0
  };

  function buildMarkers() {
    const wrap = $('#markers');
    wrap.innerHTML = '';
    M.length = 0;
    D.QUESTIONS.forEach((q, i) => {
      const x = MARKER_START + i * MARKER_GAP;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'marker';
      b.style.left = x + 'px';
      b.style.bottom = trailBottomAt(x) + 'px';
      b.dataset.i = i;
      b.setAttribute('aria-label', 'Recuerdo ' + (i + 1) + ': ' + q.name + ', año ' + q.year);
      b.innerHTML =
        '<span class="marker__beam"></span>' +
        '<span class="marker__hint">¡TÓCAME!</span>' +
        '<span class="marker__lantern"><span class="marker__face"></span><span class="marker__symbol">' + q.icon + '</span></span>' +
        '<span class="marker__sign"><span class="marker__year">' + q.year + '</span>' +
        '<span class="marker__name">' + q.scene + '</span>' +
        '<span class="marker__state">RECUERDO ' + (i + 1) + '</span></span>';
      b.addEventListener('click', () => onMarkerClick(i));
      wrap.appendChild(b);
      M.push({ x: x, bottom: trailBottomAt(x), el: b, q: q });
    });
  }

  function updateMarkers() {
    M.forEach((m, i) => {
      const done = i < G.idx;
      const active = i === G.idx && G.mode === 'story';
      m.el.classList.toggle('is-done', done);
      m.el.classList.toggle('is-active', active);
      m.el.classList.toggle('is-locked', i > G.idx);
      const state = m.el.querySelector('.marker__state');
      const symbol = m.el.querySelector('.marker__symbol');
      if (done) { state.textContent = 'RECORDADO'; symbol.textContent = '✔'; }
      else if (active) { state.textContent = '¡AQUÍ!'; symbol.textContent = m.q.icon; }
      else { state.textContent = 'RECUERDO ' + (i + 1); symbol.textContent = m.q.icon; }
    });
  }

  function onMarkerClick(i) {
    Sfx.init();
    if (G.mode !== 'story') return;
    if (i < G.idx) {
      Sfx.click();
      showFact(M[i].q);
      return;
    }
    if (i > G.idx) {
      toast('Aún no llegas a este recuerdo. Sigue el camino ▶');
      return;
    }
    if (isModalOpen()) return;
    Sfx.click();
    walkToMarker(i);
  }

  function resetWorld() {
    W.x = 200;
    W.cam = 0;
    W.camY = 0;
    W.targetX = null;
    W.keys.left = false;
    W.keys.right = false;
    $('#player').style.left = W.x + 'px';
    $('#player').style.bottom = trailBottomAt(W.x) + 'px';
    $('#player').dataset.walking = '0';
    $('#player').dataset.facing = 'right';
    const vw = $('#world').clientWidth || window.innerWidth;
    W.vw = vw;
    W.cam = clamp(W.x - vw * 0.45, 0, Math.max(0, STAGE_WIDTH - vw));
    renderWorld();
  }

  function renderWorld() {
    $('#stage').style.transform = 'translate3d(' + (-W.cam).toFixed(2) + 'px,' + W.camY.toFixed(2) + 'px,0)';
    $('#layer-far').style.transform = 'translate3d(' + (-W.cam * 0.18).toFixed(2) + 'px,' + (W.camY * 0.12).toFixed(2) + 'px,0)';
    $('#layer-mid').style.transform = 'translate3d(' + (-W.cam * 0.42).toFixed(2) + 'px,' + (W.camY * 0.24).toFixed(2) + 'px,0)';
    $('#layer-vines').style.transform = 'translate3d(' + (-W.cam * 0.3).toFixed(2) + 'px,' + (W.camY * 0.3).toFixed(2) + 'px,0)';
  }

  function walkToMarker(i) {
    if (!M[i]) return;
    G.idx = i;
    G.awaitingQuestion = true;
    W.targetX = M[i].x;
    updateMarkers();
    updateHUD();
  }

  function startLoop() {
    if (G.active) return;
    G.active = true;
    W.last = performance.now();
    requestAnimationFrame(frame);
  }

  function stopLoop() {
    G.active = false;
    W.targetX = null;
    G.awaitingQuestion = false;
  }

  function frame(ts) {
    if (!G.active) return;
    const dt = Math.min(0.06, Math.max(0, (ts - W.last) / 1000));
    W.last = ts;

    const locked = isModalOpen() || G.paused;
    let dir = 0;

    if (W.targetX != null && !locked) {
      const dx = W.targetX - W.x;
      if (Math.abs(dx) < 3) {
        W.x = W.targetX;
        W.targetX = null;
      } else {
        dir = dx > 0 ? 1 : -1;
        if (Math.abs(dx) < 70) dir *= 0.55;
      }
    } else if (!locked && (W.keys.left || W.keys.right)) {
      dir = W.keys.right ? 1 : -1;
      W.targetX = null;
    }

    if (dir) {
      W.x = clamp(W.x + dir * WALK_SPEED * dt, 90, STAGE_WIDTH - 90);
      const player = $('#player');
      player.dataset.facing = dir < 0 ? 'left' : 'right';
      player.dataset.walking = '1';
      if (ts - G.lastStepAt > 320) { G.lastStepAt = ts; Sfx.step(); }
    } else {
      $('#player').dataset.walking = '0';
    }

    $('#player').style.left = W.x.toFixed(1) + 'px';
    $('#player').style.bottom = trailBottomAt(W.x) + 'px';

    // llegada al recuerdo activo
    const m = M[G.idx];
    if (G.awaitingQuestion && m && !locked && Math.abs(W.x - m.x) < 26) {
      W.x = m.x;
      W.targetX = null;
      G.awaitingQuestion = false;
      $('#player').dataset.walking = '0';
      setTimeout(() => { if (!isModalOpen() && G.mode === 'story') openCurrentQuestion(); }, 180);
    }

    // cámara suave
    const vw = $('#world').clientWidth || window.innerWidth;
    const targetCam = clamp(W.x - vw * 0.45, 0, Math.max(0, STAGE_WIDTH - vw));
    W.cam += (targetCam - W.cam) * Math.min(1, dt * 8);
    const vh = $('#world').clientHeight || window.innerHeight;
    const targetCamY = clamp(trailBottomAt(W.x) - vh * 0.4, 0, CLIMB_RISE);
    W.camY += (targetCamY - W.camY) * Math.min(1, dt * 6);
    renderWorld();

    // botón "ir al recuerdo"
    const near = m ? Math.abs(W.x - m.x) < 44 : true;
    const showGo = G.mode === 'story' && m && !near && !locked && !G.awaitingQuestion;
    if (showGo !== W.goShown) {
      W.goShown = showGo;
      $('#btn-go').hidden = !showGo;
    }

    requestAnimationFrame(frame);
  }

  /* =========================== PREGUNTAS =============================== */
  function prepare(item) {
    const opts = item.options.map((text, i) => ({ text: text, ok: i === 0 }));
    const mixed = shuffle(opts);
    return {
      id: item.id,
      year: item.year,
      name: item.name,
      icon: item.icon,
      question: item.question,
      opts: mixed,
      answer: mixed.findIndex((o) => o.ok),
      fact: item.fact,
      fruit: item.fruit,
      learn: item.learn || ''
    };
  }

  function prepareRescue(item) {
    const opts = shuffle(item.options.map((text, i) => ({ text: text, ok: i === 0 })));
    return {
      id: item.id,
      year: 'RETO',
      name: 'Dato concreto',
      icon: '⏱️',
      question: item.q,
      opts: opts,
      answer: opts.findIndex((o) => o.ok),
      fact: item.fact,
      fruit: null,
      learn: ''
    };
  }

  function openCurrentQuestion() {
    if (G.mode !== 'story') return;
    const item = G.queue[G.idx];
    if (!item) return;
    openQuestion(item, 'story');
  }

  function openQuestion(item, mode) {
    G.q = item;
    G.answer = item.answer;
    G.answered = false;

    const isRescue = mode === 'rescue';
    const miniIndex = mode === 'review' ? G.reviewIdx : G.idx;
    const mini = isRescue
      ? { id: 'rescue', name: 'RESCATE', hint: 'Elige rápido la pista correcta', icons: ['🪢', '🪶', '🪨'] }
      : MINI_GAMES[miniIndex % MINI_GAMES.length];
    $('#qcard').classList.toggle('is-rescue', isRescue);
    $('#qcard').dataset.minigame = mini.id;
    if (isRescue) {
      $('#qcard-mode').textContent = '⚠ RESCATE · 5 SEGUNDOS';
    } else if (G.mode === 'review') {
      $('#qcard-mode').textContent = mini.name + ' · REPASO ' + (G.reviewIdx + 1) + ' DE 5';
    } else {
      $('#qcard-mode').textContent = '⛰ ' + mini.name + ' · ' + (G.idx + 1) + ' DE ' + TOTAL_STORY;
    }

    $('#q-icon').textContent = item.icon;
    $('#q-era').textContent = item.year;
    $('#q-name').textContent = item.name;
    $('#q-text').textContent = item.question;

    const wrap = $('#q-options');
    wrap.innerHTML = '';
    G.optionEls = item.opts.map((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'option';
      const icon = document.createElement('span');
      icon.className = 'option__game-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = mini.icons[i];
      const key = document.createElement('span');
      key.className = 'option__key';
      key.textContent = 'ABC'[i];
      const label = document.createElement('span');
      label.className = 'option__text';
      label.textContent = opt.text;
      b.append(icon, key, label);
      b.setAttribute('aria-label', 'Opción ' + 'ABC'[i] + ': ' + opt.text);
      b.addEventListener('click', () => chooseOption(i));
      wrap.appendChild(b);
      return b;
    });

    $('#q-feedback').hidden = true;
    $('#q-feedback').classList.remove('is-bad');
    $('#btn-next').hidden = true;
    $('#q-hint').textContent = mini.hint + ' · teclas 1, 2 o 3';

    openModal('#modal-q', false);
    setTimeout(() => {
      const first = G.optionEls[0];
      if (first && !G.answered) first.focus({ preventScroll: true });
    }, 60);

    startTimer(isRescue ? RESCUE_TIME : QUESTION_TIME, onTimeout);
  }

  function startTimer(seconds, onEnd) {
    stopTimer();
    const token = ++G.timerToken;
    const t0 = performance.now();
    const fill = $('#timer-fill');
    const num = $('#timer-num');
    const timerEl = $('#timer');
    const total = seconds;
    timerEl.classList.remove('is-warn', 'is-danger');
    fill.style.width = '100%';
    num.textContent = String(seconds);
    let lastWhole = seconds;

    function tick(now) {
      if (token !== G.timerToken) return;
      const remain = Math.max(0, total - (now - t0) / 1000);
      fill.style.width = (remain / total) * 100 + '%';
      const whole = Math.ceil(remain);
      if (whole !== lastWhole) {
        lastWhole = whole;
        num.textContent = String(whole);
        if (whole <= 3 && whole > 0) Sfx.tick();
      }
      if (remain <= total * 0.3) timerEl.classList.add('is-danger');
      else if (remain <= total * 0.6) timerEl.classList.add('is-warn');

      if (remain <= 0) {
        num.textContent = '0';
        onEnd();
        return;
      }
      G.timerRaf = requestAnimationFrame(tick);
    }
    G.timerRaf = requestAnimationFrame(tick);
  }

  function stopTimer() {
    G.timerToken++;
    if (G.timerRaf) cancelAnimationFrame(G.timerRaf);
    G.timerRaf = 0;
  }

  function chooseOption(i) {
    if (!G.q || G.answered) return;
    const ok = i === G.answer;
    finishAnswer(ok, i, false);
  }

  function onTimeout() {
    if (!G.q || G.answered) return;
    finishAnswer(false, null, true);
  }

  function finishAnswer(ok, chosen, timedOut) {
    G.answered = true;
    stopTimer();

    const q = G.q;
    const correctIndex = G.answer;

    G.optionEls.forEach((el, i) => {
      el.disabled = true;
      if (i === correctIndex) el.classList.add('is-correct');
      else if (i === chosen) el.classList.add('is-wrong');
      else el.classList.add('is-dim');
    });

    const fb = $('#q-feedback');
    const fbTitle = $('#fb-title');
    const fbFact = $('#fb-fact');
    fb.hidden = false;
    fb.classList.toggle('is-bad', !ok);

    if (ok) {
      G.correct++;
      Sfx.correct();
      if (G.mode !== 'rescue' && q.fruit) {
        addFruit(q.fruit);
        G.runFruits.push(q.fruit);
      }
      fbTitle.textContent = '¡CORRECTO! ' + (q.fruit && G.mode !== 'rescue' ? '+1 ' + P.fruitName(q.fruit).toUpperCase() : '¡BUEN TRABAJO!');
      markMastery(q.id, true);
    } else {
      G.wrong++;
      if (G.mode === 'story') {
        G.lives = Math.max(0, G.lives - 1);
        G.missed.push(q.id);
        markMistake(q.id);
      } else if (G.mode === 'review') {
        G.missed.push(q.id);
        markMistake(q.id);
      }
      Sfx.wrong();
      fbTitle.textContent = (timedOut ? '¡SE ACABÓ EL TIEMPO! ' : '¡CASI! ') +
        'LA RESPUESTA ERA: ' + q.opts[correctIndex].text.toUpperCase();
    }

    fbFact.textContent = q.fact;

    const btn = $('#btn-next');
    btn.hidden = false;
    btn.textContent = G.mode === 'rescue' ? 'SIGUIENTE ▶' : 'CONTINUAR ▶';
    setTimeout(() => btn.focus({ preventScroll: true }), 40);

    updateHUD();
    updateFruitHud();
  }

  function markMastery(id, ok) {
    const b = save.blocks.independencia;
    if (ok) {
      b.mastered[id] = (b.mastered[id] || 0) + 1;
      if (b.mastered[id] > 3) b.mastered[id] = 3;
    }
    saveNow();
  }

  function markMistake(id) {
    const b = save.blocks.independencia;
    b.mistakes[id] = (b.mistakes[id] || 0) + 1;
    saveNow();
  }

  /* ============================= SIGUIENTE ============================= */
  function nextStep() {
    if (!G.answered) return;
    $('#btn-next').hidden = true;

    if (G.mode === 'rescue') {
      G.rescueIdx++;
      if (G.rescueIdx >= G.rescueQueue.length) {
        closeModal('#modal-q');
        finishRescue();
      } else {
        openQuestion(G.rescueQueue[G.rescueIdx], 'rescue');
      }
      return;
    }

    if (G.mode === 'review') {
      closeModal('#modal-q');
      G.reviewIdx++;
      updateHUD();
      if (G.reviewIdx >= G.queue.length) finishReview();
      else setTimeout(() => openQuestion(G.queue[G.reviewIdx], 'review'), 260);
      return;
    }

    // historia
    closeModal('#modal-q');
    if (G.lives <= 0) {
      if (!G.rescueUsed) {
        $('#screen-rescue').classList.add('is-active');
        Sfx.lose();
      } else {
        gameOver();
      }
      return;
    }

    G.idx++;
    G.answered = false;
    updateMarkers();
    updateHUD();

    if (G.idx >= TOTAL_STORY) {
      finishStory();
      return;
    }
    G.awaitingQuestion = true;
    W.targetX = null;
    W.goShown = false;
    $('#btn-go').hidden = true;
    toast('Escala hasta ' + M[G.idx].q.scene + ' y pulsa E.');
  }

  /* ============================== RESCATE ============================== */
  function startRescue() {
    $('#screen-rescue').classList.remove('is-active');
    G.mode = 'rescue';
    G.rescueIdx = 0;
    G.rescueScore = 0;
    G.rescueQueue = shuffle(D.RESCUE).slice(0, 3).map(prepareRescue);
    updateHUD();
    openQuestion(G.rescueQueue[0], 'rescue');
  }

  function finishRescue() {
    if (G.rescueScore >= 2) {
      G.rescueUsed = true;
      G.lives = 1;
      G.mode = 'story';
      updateHUD();
      updateMarkers();
      toast('¡RESCATE LOGRADO! Recuperas 1 vida. Vuelve al recuerdo ' + (G.idx + 1) + '.');
      Sfx.correct();
      setTimeout(() => {
        if (G.mode === 'story') openCurrentQuestion();
      }, 900);
    } else {
      G.mode = 'story';
      gameOver('No superaste la ronda de rescate.');
    }
  }

  /* ============================== HISTORIA ============================= */
  function startStory() {
    Sfx.init();
    showScreen('screen-game');
    stopLoop();
    stopTimer();

    G.mode = 'story';
    G.idx = 0;
    G.lives = MAX_LIVES;
    G.correct = 0;
    G.wrong = 0;
    G.runFruits = [];
    G.missed = [];
    G.rescueUsed = false;
    G.answered = false;
    G.paused = false;
    G.queue = D.QUESTIONS.map(prepare);
    G.startTime = Date.now();
    G.awaitingQuestion = true;
    G.q = null;

    $('#markers').hidden = false;
    $('#hearts').style.visibility = 'visible';
    $('#hud-segs').style.visibility = 'visible';
    $('#btn-go').hidden = true;
    W.goShown = false;

    resetWorld();
    updateMarkers();
    updateHUD();
    startLoop();

    toast('¡Sube por las terrazas! Acércate al guía y pulsa E para hablar.');
  }

  function finishStory() {
    stopLoop();
    stopTimer();
    G.active = false;

    const b = save.blocks.independencia;
    b.completed = true;
    b.completedAt = new Date().toISOString();
    b.attempts = (b.attempts || 0) + 1;
    b.best = Math.max(b.best || 0, G.correct);
    b.lastMissed = G.missed.slice();
    save.lastPlayed = todayKey();
    if (save.badges.indexOf('independencia') === -1) save.badges.push('independencia');
    saveNow();

    renderSummary();
    showScreen('screen-summary');
    confetti();
    Sfx.win();
  }

  function gameOver(reason) {
    stopLoop();
    stopTimer();
    G.active = false;

    const b = save.blocks.independencia;
    b.attempts = (b.attempts || 0) + 1;
    b.lastMissed = G.missed.slice();
    save.lastPlayed = todayKey();
    saveNow();

    $('#over-sub').textContent = reason || 'Te quedaste sin vidas. ¡La memoria se entrena!';
    $('#over-reached').textContent = Math.min(G.idx, TOTAL_STORY) + '/' + TOTAL_STORY;
    $('#over-correct').textContent = String(G.correct);
    $('#over-fruits').textContent = String(G.runFruits.length);
    showScreen('screen-over');
    Sfx.lose();
  }

  /* ============================== RESUMEN ============================== */
  function renderSummary() {
    $('#summary-badge').innerHTML = P.badge;
    $('#summary-sub').textContent = 'Completaste «' + D.BLOCKS[0].title + '». Ya tienes la insignia de la Independencia.';

    $('#stat-correct').textContent = String(G.correct);
    $('#stat-wrong').textContent = String(G.wrong);
    $('#stat-time').textContent = fmtTime(Date.now() - G.startTime);
    $('#stat-fruits').textContent = String(G.runFruits.length);

    const fruitsWrap = $('#summary-fruits');
    fruitsWrap.innerHTML = G.runFruits.map((f) => P.fruit(f, 2)).join('') ||
      '<span style="font-size:12px;color:#9fc79f">—</span>';

    const list = $('#learned-list');
    list.innerHTML = '';
    G.queue.forEach((q) => {
      const li = document.createElement('li');
      const missed = G.missed.indexOf(q.id) !== -1;
      if (missed) li.classList.add('is-miss');
      li.innerHTML = '<span class="yr">' + q.year + '</span><span>' +
        (q.learn || q.name) + (missed ? ' <b>(repasar)</b>' : '') + '</span>';
      list.appendChild(li);
    });

    const btnReview = $('#btn-summary-review');
    btnReview.hidden = false;
  }

  function confetti() {
    const wrap = $('#confetti');
    wrap.innerHTML = '';
    const colors = ['#ffe27a', '#79c25f', '#e0483f', '#5b8fd9', '#e58fb4', '#f2b32a', '#f8f1e0'];
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('i');
      p.style.left = (Math.random() * 100).toFixed(2) + '%';
      p.style.background = colors[i % colors.length];
      p.style.width = (6 + Math.random() * 8).toFixed(0) + 'px';
      p.style.height = (8 + Math.random() * 10).toFixed(0) + 'px';
      p.style.animationDuration = (2.6 + Math.random() * 2.6).toFixed(2) + 's';
      p.style.animationDelay = (Math.random() * 1.4).toFixed(2) + 's';
      wrap.appendChild(p);
    }
    setTimeout(() => { wrap.innerHTML = ''; }, 7000);
  }

  /* =============================== REPASO ============================== */
  function startReview() {
    Sfx.init();
    showScreen('screen-game');
    stopLoop();
    stopTimer();

    G.mode = 'review';
    G.idx = -1;
    G.awaitingQuestion = false;
    G.lives = MAX_LIVES;
    G.correct = 0;
    G.wrong = 0;
    G.runFruits = [];
    G.missed = [];
    G.reviewIdx = 0;
    G.paused = false;
    G.startTime = Date.now();
    G.queue = buildReviewQueue();

    $('#markers').hidden = true;
    $('#hearts').style.visibility = 'hidden';
    $('#btn-go').hidden = true;
    W.goShown = false;

    resetWorld();
    updateHUD();
    G.active = true;
    W.last = performance.now();
    requestAnimationFrame(frame);

    toast('🍃 Repaso: 5 preguntas para que no se te olvide.');
    setTimeout(() => openQuestion(G.queue[0], 'review'), 600);
  }

  function buildReviewQueue() {
    const b = save.blocks.independencia;
    const pool = D.QUESTIONS.slice();
    const priority = (b.lastMissed || []).filter((id) => pool.some((q) => q.id === id));
    const picked = [];

    shuffle(priority).forEach((id) => {
      if (picked.length < 3) {
        const q = pool.find((item) => item.id === id);
        if (q && picked.indexOf(q) === -1) picked.push(q);
      }
    });

    const rest = shuffle(pool.filter((q) => picked.indexOf(q) === -1));
    while (picked.length < 5 && rest.length) picked.push(rest.pop());

    return shuffle(picked).map(prepare);
  }

  function finishReview() {
    stopLoop();
    save.reviews = (save.reviews || 0) + 1;
    save.lastReview = todayKey();
    save.blocks.independencia.reviews = (save.blocks.independencia.reviews || 0) + 1;
    saveNow();

    $('#review-score').textContent = G.correct + ' / 5';
    $('#review-sub').textContent = G.correct === 5
      ? '¡Memoria de acero! No se te escapó ni un recuerdo.'
      : G.correct >= 3
        ? '¡Muy bien! Cada repaso hace más fuerte tu memoria.'
        : 'Buen intento. Repetir es la clave para no olvidar.';
    $('#review-fruits').innerHTML = G.runFruits.map((f) => P.fruit(f, 2)).join('') ||
      '<span style="font-size:12px;color:#9fc79f">Sin frutas esta vez</span>';
    openModal('#modal-review');
    Sfx.correct();
  }

  /* =============================== HUD ================================= */
  function updateHUD() {
    const hearts = $('#hearts');
    if (!hearts.dataset.built) {
      hearts.dataset.built = '1';
    }
    hearts.innerHTML = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      const s = document.createElement('span');
      s.className = i < G.lives ? 'is-on' : 'is-lost';
      s.innerHTML = P.heart;
      hearts.appendChild(s);
    }

    let progress = '1/' + TOTAL_STORY;
    if (G.mode === 'rescue') progress = (G.rescueIdx + 1) + '/3';
    else if (G.mode === 'review') progress = (G.reviewIdx + 1) + '/5';
    else progress = Math.min(G.idx + 1, TOTAL_STORY) + '/' + TOTAL_STORY;
    $('#hud-progress').textContent = progress;

    $('#hud-fruits').textContent = String(save.totalFruits || 0);

    const segs = $('#hud-segs');
    segs.innerHTML = '';
    for (let i = 0; i < TOTAL_STORY; i++) {
      const s = document.createElement('i');
      if (i < G.idx) s.className = 'is-done';
      else if (i === G.idx && G.mode === 'story') s.className = 'is-current';
      if (G.missed.indexOf(D.QUESTIONS[i].id) !== -1 && i < G.idx) s.className = 'is-missed';
      segs.appendChild(s);
    }

    if (G.mode === 'story' && !save.fruits.__none) {
      const last = G.runFruits[G.runFruits.length - 1] || 'tuna';
      $('#hud-fruit-icon').innerHTML = P.fruit(last, 2);
    }
  }

  function updateFruitHud(id) {
    const fruitId = id || G.runFruits[G.runFruits.length - 1] || 'tuna';
    $('#hud-fruit-icon').innerHTML = P.fruit(fruitId, 2);
    $('#hud-fruits').textContent = String(save.totalFruits || 0);
    $('#menu-fruits').textContent = String(save.totalFruits || 0);
    $('#blocks-fruits').textContent = String(save.totalFruits || 0);
    $('#hud-fruit-icon').animate
      ? $('#hud-fruit-icon').animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.45)' }, { transform: 'scale(1)' }],
          { duration: 320, easing: 'ease-out' }
        )
      : null;
  }

  /* =============================== MODALES ============================= */
  function openModal(sel, backdropClose) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (!el) return;
    el.hidden = false;
    el.dataset.modal = '1';
    document.body.classList.add('modal-open');
    if (backdropClose) {
      el.dataset.backdrop = '1';
    }
  }

  function closeModal(sel) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (!el) return;
    el.hidden = true;
    delete el.dataset.modal;
    if (!isModalOpen()) document.body.classList.remove('modal-open');
    if (el.id === 'modal-q') stopTimer();
  }

  function isModalOpen() {
    return $$('.modal').some((m) => !m.hidden);
  }

  let toastTimer = 0;
  function toast(text, ms) {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), ms || 2800);
  }

  function showFact(q) {
    $('#fact-year').textContent = q.year;
    $('#fact-name').textContent = q.scene || q.name;
    $('#fact-text').textContent = q.fact;
    openModal('#modal-fact', true);
  }

  /* ============================== EVENTOS ============================== */
  function bindEvents() {
    // música/gesto inicial
    const unlockAudio = () => Sfx.init();
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    $('#btn-history').addEventListener('click', () => {
      Sfx.init(); Sfx.click();
      renderBlocks();
      showScreen('screen-blocks');
    });
    $('#btn-blocks-back').addEventListener('click', () => { Sfx.click(); renderMenu(); showScreen('screen-menu'); });
    $('#btn-review-menu').addEventListener('click', () => { Sfx.click(); startReview(); });
    $('#btn-how').addEventListener('click', () => { Sfx.click(); openModal('#modal-how', true); });
    $('#btn-how-close').addEventListener('click', () => { Sfx.click(); closeModal('#modal-how'); });
    $('#btn-soon-close').addEventListener('click', () => { Sfx.click(); closeModal('#modal-soon'); });

    $('#btn-sound').addEventListener('click', toggleSound);
    $('#btn-sound-menu').addEventListener('click', toggleSound);

    $('#btn-pause').addEventListener('click', () => {
      if (G.mode !== 'story' || isModalOpen()) return;
      Sfx.click();
      G.paused = true;
      openModal('#modal-pause');
      $('#btn-resume').focus();
    });
    $('#btn-resume').addEventListener('click', () => {
      Sfx.click();
      G.paused = false;
      closeModal('#modal-pause');
    });
    $('#btn-quit').addEventListener('click', () => {
      Sfx.click();
      G.paused = false;
      closeModal('#modal-pause');
      quitToMenu();
    });

    $('#move-left').addEventListener('pointerdown', (e) => { e.preventDefault(); W.keys.left = true; });
    $('#move-right').addEventListener('pointerdown', (e) => { e.preventDefault(); W.keys.right = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => {
      $('#move-left').addEventListener(ev, () => { W.keys.left = false; });
      $('#move-right').addEventListener(ev, () => { W.keys.right = false; });
    });

    $('#btn-go').addEventListener('click', () => {
      if (G.mode === 'story' && M[G.idx]) { Sfx.click(); walkToMarker(G.idx); }
    });

    $('#btn-next').addEventListener('click', () => { Sfx.click(); nextStep(); });
    $('#btn-fact-close').addEventListener('click', () => { Sfx.click(); closeModal('#modal-fact'); });
    $('#modal-fact .modal__backdrop').addEventListener('click', () => closeModal('#modal-fact'));
    $('#modal-how .modal__backdrop').addEventListener('click', () => closeModal('#modal-how'));
    $('#modal-soon .modal__backdrop').addEventListener('click', () => closeModal('#modal-soon'));

    $('#btn-rescue-start').addEventListener('click', () => { Sfx.init(); Sfx.click(); startRescue(); });

    $('#btn-summary-menu').addEventListener('click', () => { Sfx.click(); quitToMenu(); });
    $('#btn-summary-again').addEventListener('click', () => { Sfx.click(); startStory(); });
    $('#btn-summary-review').addEventListener('click', () => { Sfx.click(); startReview(); });

    $('#btn-over-retry').addEventListener('click', () => { Sfx.click(); startStory(); });
    $('#btn-over-menu').addEventListener('click', () => { Sfx.click(); quitToMenu(); });

    $('#btn-review-again').addEventListener('click', () => { Sfx.click(); closeModal('#modal-review'); startReview(); });
    $('#btn-review-home').addEventListener('click', () => { Sfx.click(); closeModal('#modal-review'); quitToMenu(); });
    $('#modal-review .modal__backdrop').addEventListener('click', () => closeModal('#modal-review'));

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', () => { renderWorld(); });

    // parallax suave del menú con el ratón
    window.addEventListener('mousemove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      $$('.screen.is-active .bg-jungle__layer').forEach((layer) => {
        const par = parseFloat(layer.dataset.par || '0.1');
        layer.style.transform = 'translate3d(' + (nx * par * -260).toFixed(1) + 'px,' +
          (ny * par * -90).toFixed(1) + 'px,0)';
      });
    });
  }

  function toggleSound() {
    save.sound = !save.sound;
    saveNow();
    renderSoundIcons();
    if (save.sound) { Sfx.init(); Sfx.click(); }
  }

  function quitToMenu() {
    stopLoop();
    stopTimer();
    G.active = false;
    G.paused = false;
    $$('.modal').forEach((m) => { m.hidden = true; });
    $('#screen-rescue').classList.remove('is-active');
    renderMenu();
    showScreen('screen-menu');
  }

  function onKeyDown(e) {
    const key = e.key;

    if (key === 'Escape') {
      if (!$('#modal-how').hidden) { closeModal('#modal-how'); return; }
      if (!$('#modal-soon').hidden) { closeModal('#modal-soon'); return; }
      if (!$('#modal-fact').hidden) { closeModal('#modal-fact'); return; }
      if (!$('#modal-pause').hidden) { G.paused = false; closeModal('#modal-pause'); return; }
      return;
    }

    const qOpen = !$('#modal-q').hidden;
    if (qOpen) {
      if (key === '1' || key === '2' || key === '3') {
        e.preventDefault();
        const idx = parseInt(key, 10) - 1;
        if (!G.answered && G.optionEls[idx]) chooseOption(idx);
        return;
      }
      if ((key === 'Enter' || key === ' ') && !$('#btn-next').hidden && G.answered) {
        e.preventDefault();
        Sfx.click();
        nextStep();
        return;
      }
      return;
    }

    if (!$('#modal-pause').hidden || !$('#modal-fact').hidden || !$('#modal-how').hidden || !$('#modal-soon').hidden) return;

    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      W.keys.left = true;
      W.targetX = null;
      e.preventDefault();
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      W.keys.right = true;
      W.targetX = null;
      e.preventDefault();
    } else if (key === 'e' || key === 'E' || key === ' ') {
      if (G.mode === 'story' && M[G.idx]) {
        e.preventDefault();
        if (Math.abs(W.x - M[G.idx].x) < 70) {
          W.x = M[G.idx].x;
          W.targetX = null;
          G.awaitingQuestion = false;
          openCurrentQuestion();
        } else {
          G.awaitingQuestion = true;
          W.targetX = null;
          W.goShown = false;
          $('#btn-go').hidden = true;
          toast('Sigue el sendero hasta ' + M[G.idx].q.scene + ' y pulsa E.');
        }
      }
    }
  }

  function onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') W.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') W.keys.right = false;
  }

  /* ================================ INIT =============================== */
  function init() {
    loadSave();
    buildAllBackgrounds();
    buildMarkers();
    spawnMotes($('#menu-motes'), 26);
    spawnMotes($('#game-motes'), 22);
    spawnLeaves($('#menu-leaves'), 18);
    spawnLeaves($('#game-leaves'), 12);

    $('#menu-hero').innerHTML = P.heroIdle;
    $('#player .player__sprite').innerHTML = P.heroA + P.heroB;
    $('#summary-badge').innerHTML = P.badge;
    $('#blocks-fruit-icon').innerHTML = P.fruit('tuna', 2);
    $('#hud-fruit-icon').innerHTML = P.fruit('tuna', 2);
    $('#stat-ico-fruit').innerHTML = P.fruit('tuna', 2);
    $('#stat-ico-badge').innerHTML = P.badge;
    $('#menu-fruit-1').innerHTML = P.fruit('lucuma', 2);
    $('#menu-fruit-2').innerHTML = P.fruit('maracuya', 2);

    bindEvents();
    window.addEventListener('keyup', onKeyUp);
    renderMenu();
    updateHUD();
    renderSoundIcons();

    // deja el guardado listo desde el primer momento
    saveNow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
