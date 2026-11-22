/* =====================================================================
   MEMORIA LIBRE — Sprites pixel art (SVG generado píxel a píxel)
   ===================================================================== */
window.PIXEL = (function () {
  'use strict';

  /** Convierte una matriz de caracteres en un SVG de píxeles. */
  function sprite(rows, palette, px, extraClass) {
    px = px || 4;
    const w = rows[0].length;
    const h = rows.length;
    let out = '';
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      let x = 0;
      while (x < w) {
        const ch = row[x];
        if (!palette[ch]) { x++; continue; }
        let run = 1;
        while (x + run < w && row[x + run] === ch) run++;
        out += '<rect x="' + (x * px) + '" y="' + (y * px) + '" width="' + (run * px) +
               '" height="' + px + '" fill="' + palette[ch] + '"/>';
        x += run;
      }
    }
    return '<svg class="sprite ' + (extraClass || '') + '" viewBox="0 0 ' + (w * px) + ' ' + (h * px) +
           '" width="' + (w * px) + '" height="' + (h * px) +
           '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + out + '</svg>';
  }

  /* --------------------------- HÉROE (INCA) --------------------------- */
  const HERO_PAL = {
    H: '#141019', h: '#e8b93f', S: '#f3c69c', s: '#cf9a72', e: '#241a12',
    G: '#f2b32a', g: '#ffe27a', F: '#e0483f',
    R: '#c0392b', r: '#8f2b25', C: '#2f57a8', Y: '#ffe27a',
    P: '#efe3c2', O: '#3f2a19', o: '#26190f'
  };

  const HERO_A = [
    '..F........F..',
    '..FF..FF..FF..',
    '.FgGGGGGGGGgF.',
    '.gGGGGGGGGGGg.',
    '...SSSSSSSS...',
    '...SeSSSSeSS..',
    '...SSSSSSSS...',
    '....SSSSSS....',
    '....sSSSSs....',
    '..CCRRYYRRCC..',
    '.SCCRRYYRRCCS.',
    '.SCRRRRRRRRCS.',
    '..SRRRRRRRRS..',
    '...RRRRRRRR...',
    '...PPPPPPPP...',
    '...PPP..PPP...',
    '...OOO..OOO...',
    '..OOOO..OOOO..'
  ];

  const HERO_B = HERO_A.slice(0, 14).concat([
    '...PPPPPPPP...',
    '..PPP....PPP..',
    '..OOO....OOO..',
    '.OOOO....OOOO.'
  ]);

  /* --------------------------- FRUTAS --------------------------- */
  const FRUIT_DEFS = {
    mango: {
      name: 'Mango',
      pal: { g: '#2f6b2a', G: '#4d9a3a', Y: '#f6b32b', O: '#ef8a1a', r: '#d94f3d' },
      rows: [
        '...gg.....',
        '..gGGg....',
        '.gYYYYg...',
        'gYYrrYYg..',
        'gYrrrrYYg.',
        'gYYrrYYYg.',
        '.gYYYYYg..',
        '..gYYYg...',
        '...ggg....'
      ]
    },
    lucuma: {
      name: 'Lúcuma',
      pal: { t: '#5a3d1e', G: '#d9a92c', g: '#a87c17', L: '#f2cd5b' },
      rows: [
        '....tt....',
        '...tt.....',
        '..gGGg....',
        '.gGLLGg...',
        'gGLLLLGg..',
        'gGLLLGGg..',
        'gGGGGGGg..',
        '.gGGGGg...',
        '..gggg....'
      ]
    },
    maracuya: {
      name: 'Maracuyá',
      pal: { g: '#3c6b21', Y: '#f2a71b', O: '#e07a1f', r: '#8a4a1c', L: '#ffd45e' },
      rows: [
        '.....g....',
        '....gg....',
        '..YYYg....',
        '.YLLYYY...',
        'YLLrYYOY..',
        'YrrYYYOOY.',
        'YYrYYYOOY.',
        '.YYYYOOY..',
        '..YYYYY...'
      ]
    },
    granadilla: {
      name: 'Granadilla',
      pal: { g: '#3c6b21', O: '#f2912b', Y: '#ffc85c', W: '#fff3cf', r: '#c25f18' },
      rows: [
        '....g.....',
        '...gg.....',
        '..OOOg....',
        '.OYOOOg...',
        'OYOWOOOg..',
        'OrOWOOOg..',
        'OYOOOOOg..',
        '.OYOOOg...',
        '..OOOO....'
      ]
    },
    cacao: {
      name: 'Cacao',
      pal: { b: '#5a3418', B: '#8a5223', L: '#b87a35', r: '#4a2a12', g: '#3c6b21' },
      rows: [
        '..gg......',
        '..gBb.....',
        '.bBBLb....',
        'bBLLLBb...',
        'bBLLLBb...',
        '.bBBLb....',
        '..bBb.....',
        '..bBb.....',
        '...bb.....'
      ]
    },
    tuna: {
      name: 'Tuna',
      pal: { g: '#3c6b21', M: '#d0437a', R: '#a82a5c', L: '#f06fa2' },
      rows: [
        '..g..g....',
        '.gMggMg...',
        'gMLMMRMg..',
        'gMLMMMRg..',
        'gMLMMRRg..',
        '.gMMRRg...',
        '..gRRg....',
        '...gg.....',
        '..........'
      ]
    }
  };

  const fruitCache = {};
  function fruit(id, px) {
    const key = id + ':' + px;
    if (fruitCache[key]) return fruitCache[key];
    const def = FRUIT_DEFS[id] || FRUIT_DEFS.mango;
    fruitCache[key] = sprite(def.rows, def.pal, px || 3, 'sprite--fruit');
    return fruitCache[key];
  }
  function fruitName(id) {
    return (FRUIT_DEFS[id] || FRUIT_DEFS.mango).name;
  }

  /* --------------------------- INSIGNIA --------------------------- */
  const BADGE_PAL = {
    o: '#8a4a10', G: '#f2b32a', g: '#d18f16', L: '#ffe27a', W: '#fff6d6',
    r: '#c0392b', R: '#e05a44', d: '#6b2c0e'
  };
  const BADGE = [
    '.......GG.......',
    '....GGGLLGGG....',
    '..GGLLLLLLLGG...',
    '.GLLLWWWWWLLLG..',
    'GLLWWWGGGWWWLLG.',
    'GLWWGGRRRGGWWLG.',
    'GLWWGRRRRRGWGLG.',
    'GLLWGRRRRRGWLLG.',
    'GLLWGRRRRRGWLLG.',
    'GLWWGRRRRRGWLLG.',
    'GLLWWWGGGWWWLLG.',
    '.GLLLWWWWWLLLG..',
    '..GGLLLLLLLGG...',
    '....GGGLLGGG....',
    '.....gGGGg......',
    '......gg........'
  ];

  /* --------------------------- ICONOS UI --------------------------- */
  const HEART_ROWS = [
    '.RR.RR.',
    'RWRRRRR',
    'RRRRRRR',
    'RRRRRRR',
    '.RRRRR.',
    '..RRR..',
    '...R...'
  ];
  const HEART_PAL = { R: '#e0483f', W: '#ff9b8a' };

  const LOCK_ROWS = [
    '..GGG..',
    '.G...G.',
    '.G...G.',
    'GGGGGGG',
    'GGGdGGG',
    'GGGdGGG',
    'GGGGGGG'
  ];
  const LOCK_PAL = { G: '#d8b04a', d: '#6b4c12' };

  return {
    sprite: sprite,
    heroA: sprite(HERO_A, HERO_PAL, 7, 'sprite--hero'),
    heroB: sprite(HERO_B, HERO_PAL, 7, 'sprite--hero'),
    heroIdle: sprite(HERO_A, HERO_PAL, 9, 'sprite--hero-xl'),
    fruit: fruit,
    fruitName: fruitName,
    fruitList: Object.keys(FRUIT_DEFS),
    badge: sprite(BADGE, BADGE_PAL, 9, 'sprite--badge'),
    heart: sprite(HEART_ROWS, HEART_PAL, 5, 'sprite--heart'),
    lock: sprite(LOCK_ROWS, LOCK_PAL, 4, 'sprite--lock')
  };
})();
