/* =====================================================================
   CRONIVERSO — Escenario de selva pixel art generado por código
   Capas con parallax: fondo lejano, árboles, suelo, enredaderas.
   ===================================================================== */
window.SCENE = (function () {
  'use strict';

  const W = 4600;      // ancho del mundo dibujado
  const H = 900;       // alto del lienzo
  const GROUND = 700;  // línea del suelo

  /* generador pseudoaleatorio con semilla (mismo dibujo siempre) */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const CELL = 8;
  function snap(v) { return Math.round(v / CELL) * CELL; }
  function rect(x, y, w, h, fill, extra) {
    return '<rect x="' + snap(x) + '" y="' + snap(y) + '" width="' + Math.max(CELL, snap(w)) +
      '" height="' + Math.max(CELL, snap(h)) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }

  /* ---------- copa de árbol hecha de bloques ---------- */
  function blob(out, rnd, cx, cy, rx, ry, leaf) {
    for (let y = -ry; y <= ry; y += CELL) {
      for (let x = -rx; x <= rx; x += CELL) {
        const d = (x / rx) * (x / rx) + (y / ry) * (y / ry);
        if (d > 1 - rnd() * 0.22) continue;
        let c = leaf.mid;
        if (y < -ry * 0.35) c = leaf.light;
        else if (y > ry * 0.42) c = leaf.dark;
        if (rnd() < 0.14) c = leaf.dark;
        if (rnd() < 0.06) c = leaf.light;
        out.push(rect(cx + x, cy + y, CELL, CELL, c));
      }
    }
  }

  /* ---------- árbol ---------- */
  function tree(rnd, out, x, baseY, h, w, pal, opts) {
    opts = opts || {};
    // raíces
    out.push(rect(x - w * 0.85, baseY - 26, w * 1.7 + CELL, 26, pal.barkDark));
    out.push(rect(x - w * 0.55, baseY - 46, w * 1.1 + CELL, 24, pal.bark));
    // tronco con inclinación
    const lean = (rnd() - 0.5) * w * 0.5;
    const segs = 9;
    for (let i = 0; i < segs; i++) {
      const t = i / segs;
      const sw = w * (1 - t * 0.28);
      const off = lean * t;
      const yy = baseY - (i + 1) * (h / segs);
      out.push(rect(x + (w - sw) / 2 + off, yy, sw, h / segs + 1, i % 2 ? pal.bark : pal.bark2));
    }
    // vetas de corteza
    for (let i = 0; i < 4; i++) {
      const yy = baseY - 60 - rnd() * (h * 0.55);
      out.push(rect(x + w * (0.2 + rnd() * 0.5) + lean * 0.4, yy, CELL, 30 + rnd() * 40, pal.barkLight));
    }
    const topX = x + w / 2 + lean;
    const topY = baseY - h;
    // copas
    blob(out, rnd, topX, topY + h * 0.10, h * 0.30, h * 0.155, pal.leaf);
    if (!opts.slim) {
      blob(out, rnd, topX - w * 2.0, topY + h * 0.22, h * 0.20, h * 0.10, pal.leaf);
      blob(out, rnd, topX + w * 2.0, topY + h * 0.19, h * 0.22, h * 0.11, pal.leaf);
    }
    // ramas
    out.push(rect(topX - w * 1.6, topY + h * 0.30, w * 1.5, CELL, pal.bark2));
    out.push(rect(topX + w * 0.1, topY + h * 0.36, w * 1.5, CELL, pal.bark2));
    // enredaderas colgantes
    if (!opts.slim) {
      for (let i = 0; i < 3; i++) {
        const vx = topX + (rnd() - 0.5) * w * 3;
        const vh = 60 + rnd() * 160;
        out.push(rect(vx, topY + h * 0.20, CELL, vh, pal.vine));
        for (let k = 0; k < 4; k++) {
          out.push(rect(vx + ((k % 2) ? CELL : -CELL), topY + h * 0.20 + vh * (k / 4), CELL, CELL, pal.leaf.mid));
        }
      }
    }
  }

  /* ---------- paletas ---------- */
  const FAR = {
    leaf: { light: '#3c8767', mid: '#2c6e57', dark: '#1d4e43' },
    bark: '#315b4b', bark2: '#396855', barkDark: '#24483c', barkLight: '#477861', vine: '#287259'
  };
  const MID = {
    leaf: { light: '#79d354', mid: '#49ad4a', dark: '#2d793c' },
    bark: '#74442b', bark2: '#865233', barkDark: '#4d3021', barkLight: '#b17542', vine: '#45a947'
  };
  const NEAR = {
    leaf: { light: '#a4e86e', mid: '#64c750', dark: '#2f8d43' },
    bark: '#56351f', bark2: '#704326', barkDark: '#392516', barkLight: '#99603a', vine: '#60b947'
  };

  /* ---------- capa de árboles ---------- */
  function treeLayer(seed, count, opts) {
    const rnd = rng(seed);
    const out = [];
    for (let i = 0; i < count; i++) {
      const x = (i / count) * (W + 300) - 150 + (rnd() - 0.5) * 90;
      const h = opts.hMin + rnd() * (opts.hMax - opts.hMin);
      const w = opts.wMin + rnd() * (opts.wMax - opts.wMin);
      tree(rnd, out, x, opts.baseY + (rnd() - 0.5) * 20, h, w, opts.pal, { slim: rnd() < 0.35 });
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
      '" preserveAspectRatio="none" aria-hidden="true">' + out.join('') + '</svg>';
  }

  /* ---------- suelo ---------- */
  function groundLayer() {
    const rnd = rng(77);
    const out = [];
    // bandas de tierra
    out.push(rect(0, GROUND, W, 34, '#3f7d3f'));
    out.push(rect(0, GROUND + 30, W, 26, '#346a34'));
    out.push(rect(0, GROUND + 50, W, 60, '#22482a'));
    out.push(rect(0, GROUND + 105, W, H - GROUND - 105, '#16341f'));
    out.push(rect(0, GROUND + 240, W, H - GROUND - 240, '#102517'));
    // borde de pasto irregular
    for (let x = 0; x < W; x += CELL) {
      const hh = 12 + Math.round(rnd() * 26 / CELL) * CELL;
      out.push(rect(x, GROUND - hh, CELL, hh, rnd() < 0.5 ? '#4f9a44' : '#59a84c'));
    }
    // matas y helechos
    for (let i = 0; i < 190; i++) {
      const x = rnd() * W;
      const y = GROUND - 6;
      const c = rnd() < 0.5 ? '#79c25f' : '#3f8640';
      const hh = 12 + rnd() * 40;
      out.push('<rect x="' + snap(x) + '" y="' + snap(y - hh) + '" width="' + CELL + '" height="' + snap(hh) + '" fill="' + c + '"/>');
      out.push('<rect x="' + snap(x - CELL) + '" y="' + snap(y - hh * 0.6) + '" width="' + CELL + '" height="' + snap(hh * 0.6) + '" fill="' + c + '"/>');
      out.push('<rect x="' + snap(x + CELL) + '" y="' + snap(y - hh * 0.7) + '" width="' + CELL + '" height="' + snap(hh * 0.7) + '" fill="' + c + '"/>');
    }
    // piedritas
    for (let i = 0; i < 60; i++) {
      const x = rnd() * W, y = GROUND + 20 + rnd() * 90;
      out.push(rect(x, y, CELL * (1 + rnd() * 2), CELL, rnd() < 0.5 ? '#2b3a2b' : '#39503a'));
    }
    // flores y hongos brillantes
    for (let i = 0; i < 46; i++) {
      const x = snap(rnd() * W) + 6;
      const y = GROUND - 12;
      const kind = rnd();
      if (kind < 0.36) {
        // hongo magenta
        out.push('<rect x="' + (x - 6) + '" y="' + (y - 16) + '" width="' + 26 + '" height="' + 12 + '" fill="#c94f7c"/>');
        out.push('<rect x="' + (x - 12) + '" y="' + (y - 10) + '" width="' + 38 + '" height="' + 10 + '" fill="#e06b99"/>');
        out.push('<rect x="' + (x + 2) + '" y="' + (y) + '" width="' + 10 + '" height="' + 14 + '" fill="#f0e3c8"/>');
      } else if (kind < 0.7) {
        // flor azul
        out.push('<rect x="' + (x - 4) + '" y="' + (y - 18) + '" width="' + 8 + '" height="' + 20 + '" fill="#3f8640"/>');
        out.push('<rect x="' + (x - 10) + '" y="' + (y - 26) + '" width="' + 20 + '" height="' + 10 + '" fill="#5b8fd9"/>');
        out.push('<rect x="' + (x - 4) + '" y="' + (y - 32) + '" width="' + 8 + '" height="' + 8 + '" fill="#9ec7ff"/>');
      } else {
        // florecita rosa
        out.push('<rect x="' + (x - 2) + '" y="' + (y - 14) + '" width="' + 6 + '" height="' + 16 + '" fill="#3f8640"/>');
        out.push('<rect x="' + (x - 8) + '" y="' + (y - 22) + '" width="' + 18 + '" height="' + 10 + '" fill="#e58fb4"/>');
      }
    }
    // haces de luz dorada
    for (let i = 0; i < 9; i++) {
      const x = (i / 9) * W + rnd() * 200;
      out.push('<rect x="' + snap(x) + '" y="' + (GROUND - 210) + '" width="' + (40 + rnd() * 90) + '" height="210" fill="#ffe9a3" opacity="0.055"/>');
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
      '" preserveAspectRatio="none" aria-hidden="true">' + out.join('') + '</svg>';
  }

  /* ---------- enredaderas colgando del techo ---------- */
  function vinesLayer() {
    const rnd = rng(913);
    const out = [];
    for (let i = 0; i < 46; i++) {
      const x = rnd() * W;
      const len = 60 + rnd() * 200;
      out.push(rect(x, 0, CELL, len, '#2f6b34'));
      for (let k = 1; k < len / 22; k++) {
        const side = k % 2 ? CELL : -CELL;
        out.push(rect(x + side, k * 22, CELL, CELL * 1.5, '#4f9a44'));
        if (rnd() < 0.25) out.push(rect(x + side * 2, k * 22 + 14, CELL, CELL, '#79c25f'));
      }
    }
    for (let i = 0; i < 12; i++) {
      const x = rnd() * W;
      out.push(rect(x, 0, 30 + rnd() * 50, 24 + rnd() * 40, '#1c4232'));
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg scene-svg--vines" viewBox="0 0 ' + W + ' 260" width="' + W + '" height="260" preserveAspectRatio="none" aria-hidden="true">' + out.join('') + '</svg>';
  }

  /* ---------- montañas andinas lejanas (profundidad) ---------- */
  function ridgeLayer() {
    const RW = 1600;
    const RH = 900;
    const out = [];
    out.push(rect(0, 470, RW, RH - 470, '#0d3b38'));

    // cadena lejana
    for (let x = 0; x < RW; x += 48) {
      const t = x / RW;
      const h = 402 + Math.sin(t * 6.4 + 1.2) * 78 + Math.sin(t * 15.7 + 4) * 22;
      out.push('<rect x="' + x + '" y="' + snap(h) + '" width="48" height="' + snap(RH - h) + '" fill="#11443d"/>');
      out.push('<rect x="' + x + '" y="' + snap(h) + '" width="48" height="12" fill="#1d5c4e" opacity="0.75"/>');
    }

    // cadena cercana, más oscura
    for (let x = 0; x < RW; x += 48) {
      const t = x / RW;
      const h = 540 + Math.sin(t * 4.3 + 2.6) * 66 + Math.sin(t * 11.2 + 1) * 16;
      out.push('<rect x="' + x + '" y="' + snap(h) + '" width="48" height="' + snap(RH - h) + '" fill="#0a2a29"/>');
      out.push('<rect x="' + x + '" y="' + snap(h) + '" width="48" height="8" fill="#12413c" opacity="0.8"/>');
    }

    // niebla entre montañas
    for (let i = 0; i < 8; i++) {
      out.push('<rect x="' + (((i * 260 + 40) % RW)) + '" y="' + snap(586 + i * 16) + '" width="' + (240 + i * 34) + '" height="18" fill="#8fd9c4" opacity="0.09"/>');
    }

    // andenes / terrazas andinas
    for (let i = 0; i < 5; i++) {
      out.push('<rect x="' + (930 + i * 30) + '" y="' + snap(612 + i * 32) + '" width="' + (420 - i * 66) + '" height="12" fill="#14504a" opacity="0.75"/>');
    }

    // avecillas lejanas
    [[430, 214], [478, 188], [536, 236]].forEach((b) => {
      out.push(rect(b[0], b[1], 8, 8, '#7fc9b0', ' opacity="0.45"'));
      out.push(rect(b[0] + 8, b[1] - 8, 8, 8, '#7fc9b0', ' opacity="0.45"'));
      out.push(rect(b[0] + 16, b[1], 8, 8, '#7fc9b0', ' opacity="0.45"'));
    });

    return '<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg" viewBox="0 0 ' + RW + ' ' + RH + '" width="' + RW + '" height="' + RH +
      '" preserveAspectRatio="none" aria-hidden="true">' + out.join('') + '</svg>';
  }

  /* ---------- helechos gigantes en primer plano ---------- */
  function frond(out, x, y, ang, len, pal) {
    const step = 14;
    const n = Math.round(len / step);
    let a = ang;
    let cx = x;
    let cy = y;
    for (let i = 0; i < n; i++) {
      a += 0.045;
      cx += Math.cos(a) * step;
      cy += Math.sin(a) * step;
      out.push(rect(cx, cy, 10, 10, pal.stem));
      const spread = 1 - i / n;
      for (let s = -1; s <= 1; s += 2) {
        const la = a + s * 1.15;
        const leaves = Math.max(2, Math.round(9 * spread));
        for (let j = 1; j <= leaves; j++) {
          const c = (j % 2) ? pal.leaf : pal.leaf2;
          out.push(rect(cx + Math.cos(la) * j * 11, cy + Math.sin(la) * j * 11, 9, 9, c));
        }
      }
      if (i % 3 === 0) out.push(rect(cx, cy, 12, 12, pal.leaf3));
    }
  }

  function foreLayer() {
    const FW = 1600;
    const FH = 900;
    const out = [];
    const pal = { stem: '#153e20', leaf: '#1f5427', leaf2: '#387c32', leaf3: '#72c94f' };

    // abanico de helechos abajo a la izquierda
    [[-1.28, 220], [-1.06, 300], [-0.84, 350], [-0.62, 260]].forEach((f) => {
      frond(out, 24, 892, f[0], f[1], pal);
    });
    // abanico de helechos abajo a la derecha
    [[-2.06, 240], [-2.3, 330], [-2.54, 350], [-2.78, 230]].forEach((f) => {
      frond(out, 1576, 892, f[0], f[1], pal);
    });

    // pasto silueta en el borde inferior
    for (let x = -12; x < FW + 24; x += 12) {
      const h = 18 + (Math.sin(x * 0.07) + 1) * 20 + (x % 36 === 0 ? 26 : 0);
      out.push('<rect x="' + x + '" y="' + snap(FH - h) + '" width="12" height="' + snap(h) + '" fill="#081a10"/>');
      if (x % 48 === 0) {
        out.push('<rect x="' + (x + 4) + '" y="' + snap(FH - h - 22) + '" width="8" height="' + snap(h) + '" fill="#0c2416"/>');
      }
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg" viewBox="0 0 ' + FW + ' ' + FH + '" width="' + FW + '" height="' + FH +
      '" preserveAspectRatio="none" aria-hidden="true">' + out.join('') + '</svg>';
  }

  /* ---------- decoración del camino (dentro del mundo) ---------- */
  function pathProps() {
    const rnd = rng(451);
    const out = [];
    for (let i = 0; i < 16; i++) {
      const x = 180 + i * 290;
      // mojón de piedra junto al camino
      out.push(rect(x + 60, GROUND - 18, 30, 18, '#3a4a3a'));
    }
    for (let i = 0; i < 76; i++) {
      const x = i * 62 + (i % 2) * 10;
      const y = GROUND - 16 + Math.round(Math.sin(i * 0.8)) * 8;
      const width = 28 + (i % 3) * 8;
      out.push(rect(x, y, width, 8, i % 2 ? '#58785a' : '#687b61'));
      out.push(rect(x + 4, y - 4, width - 8, 4, '#a0b47a'));
    }
    for (let i = 0; i < 26; i++) {
      const x = rnd() * W;
      const y = GROUND - 40 - rnd() * 50;
      out.push('<rect x="' + snap(x) + '" y="' + snap(y) + '" width="8" height="8" fill="#ffe27a" opacity="0.8"/>');
      out.push('<rect x="' + snap(x + 14) + '" y="' + snap(y + 26) + '" width="6" height="6" fill="#ffd45e" opacity="0.5"/>');
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" preserveAspectRatio="none" aria-hidden="true">' + out.join('') + '</svg>';
  }

  function routeY(x, route) {
    const progress = Math.max(0, Math.min(1, (x - route.start) / (route.gap * (route.count - 1))));
    return snap(GROUND - route.rise * progress);
  }

  function mountainSvg(out) {
    return '<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" preserveAspectRatio="none" aria-hidden="true">' + out.join('') + '</svg>';
  }

  function andesFar() {
    const out = [];
    const ridge = [
      [0, 590], [220, 560], [360, 485], [480, 410], [550, 480], [760, 590],
      [960, 570], [1180, 500], [1320, 430], [1450, 500], [1620, 580],
      [1860, 550], [2050, 470], [2200, 405], [2340, 470], [2520, 570],
      [2740, 590], [2960, 510], [3120, 430], [3260, 500], [3480, 585],
      [3680, 560], [3900, 480], [4060, 410], [4200, 500], [4400, 580], [W, 560]
    ];
    const ridgePoints = ridge.concat([[W, H], [0, H]]).map((point) => point.join(',')).join(' ');
    out.push('<polygon points="' + ridgePoints + '" fill="#648b9c"/>');

    [[480, 410], [1320, 430], [2200, 405], [3120, 430], [4060, 410]].forEach((peak) => {
      const x = peak[0], y = peak[1];
      out.push('<polygon points="' +
        (x - 130) + ',' + (y + 136) + ' ' + (x - 62) + ',' + (y + 74) + ' ' +
        (x - 25) + ',' + (y + 82) + ' ' + x + ',' + y + ' ' +
        (x + 32) + ',' + (y + 70) + ' ' + (x + 88) + ',' + (y + 92) + ' ' +
        (x + 142) + ',' + (y + 146) + '" fill="#f3f0d7"/>');
      out.push('<polygon points="' + x + ',' + y + ' ' + (x + 32) + ',' + (y + 70) + ' ' +
        (x + 88) + ',' + (y + 92) + ' ' + (x + 142) + ',' + (y + 146) + ' ' +
        (x + 76) + ',' + (y + 128) + '" fill="#b8d5d4"/>');
    });
    for (let i = 0; i < 20; i++) {
      const x = 180 + i * 218;
      const y = 110 + (i % 3) * 54;
      out.push(rect(x, y, 48, 8, '#d6e8df', ' opacity="0.72"'));
      out.push(rect(x + 12, y - 8, 40, 8, '#d6e8df', ' opacity="0.72"'));
      out.push(rect(x + 38, y, 32, 8, '#d6e8df', ' opacity="0.72"'));
    }
    return mountainSvg(out);
  }

  function andesMid() {
    const out = [];
    for (let x = 0; x < W; x += 24) {
      const y = snap(560 + Math.sin(x / 290) * 48 + Math.sin(x / 97) * 18);
      out.push(rect(x, y, 24, H - y, x % 48 ? '#4d7467' : '#5c806c'));
      out.push(rect(x, y, 24, 8, '#8fa879'));
    }
    for (let i = 0; i < 30; i++) {
      const x = 90 + i * 150;
      const y = 540 + (i % 4) * 24;
      out.push(rect(x, y, 72, 8, '#a3b6a0', ' opacity="0.55"'));
      out.push(rect(x + 16, y - 8, 56, 8, '#a3b6a0', ' opacity="0.55"'));
    }
    return mountainSvg(out);
  }

  function andesGround(route) {
    const out = [];
    let points = '0,' + routeY(0, route);
    for (let x = 32; x <= W; x += 32) points += ' ' + x + ',' + routeY(x, route);
    points += ' ' + W + ',' + H + ' 0,' + H;
    out.push('<polygon points="' + points + '" fill="#77604a"/>');
    for (let x = 0; x < W; x += 24) {
      const y = routeY(x, route);
      out.push(rect(x, y, 24, 12, x % 48 ? '#8bb45b' : '#a2c96a'));
      out.push(rect(x, y + 12, 24, 24, x % 48 ? '#67533f' : '#80664a'));
      out.push(rect(x + 8, y + 20, 8, 8, '#a28a66'));
    }
    return mountainSvg(out);
  }

  function incaTemple(out, x, base) {
    const stone = '#a89068';
    const shade = '#75634d';
    for (let tier = 0; tier < 4; tier++) {
      const width = 300 - tier * 40;
      const y = base - 24 - tier * 28;
      out.push(rect(x - width / 2, y, width, 22, tier % 2 ? stone : shade));
      out.push(rect(x - width / 2 - 8, y, width + 16, 8, '#9eb66a'));
      for (let sx = x - width / 2 + 16; sx < x + width / 2; sx += 32) {
        out.push(rect(sx, y + 12, 20, 4, '#c2a977'));
      }
    }
    const y = base - 142;
    out.push(rect(x - 82, y, 164, 58, '#b19b73'));
    out.push(rect(x - 94, y, 188, 12, '#7b664d'));
    out.push(rect(x - 70, y - 16, 140, 16, '#c7b183'));
    out.push(rect(x - 28, y + 20, 56, 38, '#31494a'));
    out.push(rect(x - 20, y + 24, 40, 34, '#182f37'));
    out.push(rect(x - 92, y + 8, 12, 50, '#77634b'));
    out.push(rect(x + 80, y + 8, 12, 50, '#77634b'));
  }

  function llama(out, x, ground) {
    out.push(rect(x, ground - 30, 42, 22, '#eee3c7'));
    out.push(rect(x + 26, ground - 56, 12, 34, '#eee3c7'));
    out.push(rect(x + 30, ground - 66, 12, 14, '#d4bd96'));
    out.push(rect(x + 32, ground - 62, 4, 4, '#182522'));
    out.push(rect(x + 4, ground - 10, 8, 16, '#c9b18b'));
    out.push(rect(x + 30, ground - 10, 8, 16, '#c9b18b'));
    out.push(rect(x - 5, ground - 34, 8, 8, '#8fc76b'));
  }

  function andesProps(route) {
    const out = [];
    for (let i = 0; i < route.count; i++) {
      const x = route.start + i * route.gap;
      const y = routeY(x, route);
      for (let tier = 1; tier <= 3; tier++) {
        const width = 170 + tier * 22;
        const ty = y + 14 + tier * 24;
        out.push(rect(x - width / 2, ty, width, 18, tier % 2 ? '#6d5943' : '#887052'));
        out.push(rect(x - width / 2, ty, width, 6, '#9bac5e'));
        for (let sx = x - width / 2 + 12; sx < x + width / 2; sx += 30) {
          out.push(rect(sx, ty + 10, 20, 4, '#b29a70'));
        }
      }
    }
    const citadelX = route.start + route.gap * 7;
    incaTemple(out, citadelX, routeY(citadelX, route));
    llama(out, route.start + route.gap * 2, routeY(route.start + route.gap * 2, route));
    llama(out, route.start + route.gap * 5, routeY(route.start + route.gap * 5, route));
    return mountainSvg(out);
  }

  function andesFore() {
    const out = [];
    for (let x = 0; x < W; x += 16) {
      const h = 16 + Math.abs(Math.sin(x * 0.035)) * 30;
      out.push(rect(x, H - h, 16, h, x % 32 ? '#31573b' : '#507a42'));
      if (x % 48 === 0) out.push(rect(x + 4, H - h - 12, 8, 16, '#8bc35b'));
    }
    for (let x = 40; x < W; x += 280) {
      out.push(rect(x, H - 38, 48, 18, '#78674e'));
      out.push(rect(x + 8, H - 46, 28, 8, '#9e8965'));
    }
    return mountainSvg(out);
  }

  function build(route) {
    route = route || { start: 440, gap: 350, count: 10, rise: 180 };
    return {
      far: treeLayer(11, 16, { hMin: 300, hMax: 470, wMin: 30, wMax: 46, baseY: GROUND + 10, pal: FAR }),
      mid: treeLayer(29, 13, { hMin: 380, hMax: 610, wMin: 46, wMax: 74, baseY: GROUND + 6, pal: MID }),
      ground: groundLayer(),
      vines: vinesLayer(),
      props: pathProps(),
      ridge: ridgeLayer(),
      fore: foreLayer(),
      andesFar: andesFar(),
      andesMid: andesMid(),
      andesGround: andesGround(route),
      andesProps: andesProps(route),
      andesFore: andesFore()
    };
  }

  return { build: build, W: W, H: H, GROUND: GROUND };
})();
