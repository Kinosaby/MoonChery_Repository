'use strict';

/* ─────────────────────────────────────────
   LEVEL & OBJECT DATA
───────────────────────────────────────── */
const LEVELS = [
  { num:1, name:'El Amanecer',    minPts:0,   maxPts:60,
    msg:'Eres la razón por la que amo despertar cada mañana.',
    sky:['#07000f','#1a0030','#000'],
    ac:['rgba(110,0,75,.28)','rgba(55,0,105,.22)'],
    rate:1900, spd:1.7 },
  { num:2, name:'Aurora Boreal',  minPts:61,  maxPts:150,
    msg:'Contigo, incluso el cielo se queda sin palabras.',
    sky:['#001220','#002045','#000f1a'],
    ac:['rgba(0,175,110,.22)','rgba(0,85,185,.18)','rgba(55,0,185,.14)'],
    rate:1650, spd:2.1 },
  { num:3, name:'Nebulosa Rosa',  minPts:151, maxPts:280,
    msg:'En toda la galaxia, nada brilla como tú.',
    sky:['#150025','#3a0058','#1a002e'],
    ac:['rgba(255,0,115,.2)','rgba(195,0,230,.18)','rgba(255,75,180,.14)'],
    rate:1400, spd:2.6 },
  { num:4, name:'Alba Dorada',    minPts:281, maxPts:440,
    msg:'Eres la aventura más hermosa en la que me embarqué.',
    sky:['#1a0800','#3d1400','#0a0000'],
    ac:['rgba(255,135,0,.22)','rgba(255,65,30,.16)','rgba(210,0,55,.14)'],
    rate:1180, spd:3.1 },
  { num:5, name:'Paraíso Eterno', minPts:441, maxPts:Infinity,
    msg:'Eres mi hogar, mi calma, mi todo.',
    sky:['#0a001a','#2d004f','#1a002e'],
    ac:['rgba(255,75,200,.24)','rgba(75,210,255,.18)','rgba(255,205,0,.14)','rgba(0,255,135,.1)'],
    rate:980,  spd:3.7 },
];

const TYPES = [
  {e:'💗',pts:1,sz:34,prob:.29,sp:1.00},
  {e:'💕',pts:2,sz:38,prob:.22,sp:.92},
  {e:'❤️',pts:3,sz:36,prob:.18,sp:1.05},
  {e:'💖',pts:4,sz:40,prob:.12,sp:.97},
  {e:'⭐',pts:8,sz:40,prob:.09,sp:.72,tag:'quote'},
  {e:'💫',pts:6,sz:38,prob:.05,sp:.85,tag:'rainbow'},
  {e:'💔',pts:0,sz:34,prob:.05,sp:1.25,tag:'bad'},
];

const QUOTES = [
  {e:'💗',t:'Eres la razón por la que creo en la magia.',              a:'Para siempre tuyo'},
  {e:'⭐',t:'Tu sonrisa es mi lugar favorito en todo el universo.',     a:'Con todo mi corazón'},
  {e:'💫',t:'Contigo, hasta lo imposible parece alcanzable.',           a:'Siempre lo creeré'},
  {e:'🌹',t:'Eres mi poema favorito, el que nunca termino de leer.',    a:'Eternamente'},
  {e:'✨',t:'En un mundo lleno de ruido, tú eres mi calma perfecta.',   a:'Te lo juro'},
  {e:'💖',t:'Cada momento contigo es un regalo que atesoro.',           a:'Agradecido cada día'},
  {e:'🌙',t:'Eres la aventura más hermosa en la que me embarqué.',      a:'Sin dudarlo un segundo'},
  {e:'💕',t:'Tu luz ilumina todo lo oscuro de mi mundo.',               a:'Con amor infinito'},
  {e:'🦋',t:'Eres exactamente lo que buscaba sin saber que buscaba.',   a:'Solo tú, siempre tú'},
  {e:'🌸',t:'Quererte es lo más natural y bello que he hecho.',         a:'Mi verdad más pura'},
  {e:'💛',t:'El universo conspiró para cruzar nuestros caminos.',       a:'Y qué suerte la mía'},
  {e:'🔮',t:'Tenerte es mi superpoder favorito.',                       a:'No lo cambiaría por nada'},
];

/* ─────────────────────────────────────────
   DOM CACHE — cero querySelector en el loop
───────────────────────────────────────── */
const $ = {
  hSc:   document.getElementById('h-sc'),
  hLv:   document.getElementById('h-lv'),
  hNl:   document.getElementById('h-nl'),
  fill:  document.getElementById('bar-fill'),
  bLbl:  document.getElementById('bar-lbl'),
  combo: document.getElementById('combo'),
  cN:    document.getElementById('combo-n'),
  flash: document.getElementById('flash'),
  oStart:document.getElementById('o-start'),
  oQ:    document.getElementById('o-quote'),
  oLvl:  document.getElementById('o-lvl'),
  oOver: document.getElementById('o-over'),
  qe:    document.getElementById('qe'),
  qt:    document.getElementById('qt'),
  qa:    document.getElementById('qa'),
  luN:   document.getElementById('lu-n'),
  luNm:  document.getElementById('lu-name'),
  luMsg: document.getElementById('lu-msg'),
  goSc:  document.getElementById('go-sc'),
  goBst: document.getElementById('go-best'),
};

/* ─────────────────────────────────────────
   CANVAS
───────────────────────────────────────── */
const bgC = document.getElementById('bgC');
const gC  = document.getElementById('gC');
const bgX = bgC.getContext('2d', { alpha: false });
const gX  = gC.getContext('2d');

// Offscreen canvases para capas costosas
const aOff = document.createElement('canvas');
const aX   = aOff.getContext('2d');
const sOff = document.createElement('canvas');
const sX   = sOff.getContext('2d');

let W = 0, H = 0;

function resize() {
  W = bgC.width = gC.width = aOff.width = sOff.width = window.innerWidth;
  H = bgC.height = gC.height = aOff.height = sOff.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); buildStars(); bakeStars(); });

/* ─────────────────────────────────────────
   ESTADO DEL JUEGO
───────────────────────────────────────── */
const G = {
  on:false, paused:false,
  score:0, best:+localStorage.getItem('luv_best')||0,
  lives:5, level:1, combo:0,
  cx:0, tx:0,
  objs:[], parts:[], floats:[], shooters:[],
  stars:[],
  at:0, bt:0,
  frameN:0,
  spawnT:0,
  qQ:[...QUOTES].sort(()=>Math.random()-.5), qI:0, quoteOpen:false,
  last:0, dt:0,
  skyGrd:null, skyLevel:-1,
  aLevel:-1,
  // ── NUEVO: bandera para prevenir burst en cascada ──
  burstBudget:0,
};

// Pool de partículas — MAX_PARTS es el techo absoluto
const MAX_PARTS = 120;

/* ─────────────────────────────────────────
   STARS — baked offscreen, twinkle ~12fps
───────────────────────────────────────── */
function buildStars() {
  G.stars = [];
  const n = Math.floor(W * H / 5000); // reducido para dispositivos pequeños
  for (let i = 0; i < n; i++)
    G.stars.push({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.5 + 0.2,
      tw: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.018 + 0.004,
    });
}
buildStars();

function bakeStars() {
  sX.clearRect(0, 0, W, H);
  const n = G.stars.length;
  for (let i = 0; i < n; i++) {
    const s = G.stars[i];
    const a = (Math.sin(s.tw) + 1) * 0.375 + 0.08;
    sX.beginPath();
    sX.arc(s.x, s.y, s.r, 0, 6.2832);
    sX.fillStyle = `rgba(255,228,238,${a.toFixed(2)})`;
    sX.fill();
  }
}
bakeStars();

/* ─────────────────────────────────────────
   AURORA — baked offscreen ~20fps
   Optimización: se usa ellipse + linearGradient en lugar de grids de radialGradient
───────────────────────────────────────── */
function bakeAurora() {
  const cols = LEVELS[G.level - 1].ac;
  aX.clearRect(0, 0, W, H);
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const t  = G.at;
    const cy = H * (0.08 + i * 0.11) + Math.sin(t * 0.55 + i * 1.4) * 48;
    const bh = H * (0.14 + 0.06 * Math.sin(t * 0.38 + i));
    const bx = W * (0.15 + Math.max(0, Math.sin(t * 0.22 + i * 1.8)) * 0.35);
    const bw = W * (0.55 + Math.cos(t * 0.32 + i * 1.2) * 0.28);
    const g  = aX.createLinearGradient(0, cy - bh * 0.3, 0, cy + bh);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.4, cols[i]);
    g.addColorStop(1, 'transparent');
    aX.globalAlpha = 0.75 + 0.25 * Math.abs(Math.sin(G.bt + i * 1.6));
    aX.fillStyle = g;
    aX.beginPath();
    aX.ellipse(bx + bw * 0.5, cy + bh * 0.5, bw * 0.5, bh * 0.5, 0, 0, 6.2832);
    aX.fill();
  }
  aX.globalAlpha = 1;
  G.aLevel = G.level;
}
bakeAurora();

/* ─────────────────────────────────────────
   INPUT — touch directo, mouse lerp suave
───────────────────────────────────────── */
let isMobile = false;

function setTarget(x, direct) {
  G.tx = Math.max(0, Math.min(W, x));
  if (direct) G.cx = G.tx;
}
gC.addEventListener('mousemove',  e => setTarget(e.clientX, false));
gC.addEventListener('touchmove',  e => { e.preventDefault(); isMobile = true; setTarget(e.touches[0].clientX, true); }, {passive:false});
gC.addEventListener('touchstart', e => { e.preventDefault(); isMobile = true; setTarget(e.touches[0].clientX, true); }, {passive:false});

/* ─────────────────────────────────────────
   BACKGROUND
───────────────────────────────────────── */
function drawBg() {
  G.at += 0.007;
  G.bt += 0.003;
  const lv = LEVELS[G.level - 1];

  if (G.skyLevel !== G.level) {
    const gr = bgX.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0,    lv.sky[0]);
    gr.addColorStop(0.52, lv.sky[1]);
    gr.addColorStop(1,    lv.sky[2]);
    G.skyGrd   = gr;
    G.skyLevel = G.level;
  }
  bgX.fillStyle = G.skyGrd;
  bgX.fillRect(0, 0, W, H);

  if (G.frameN % 3 === 0 || G.aLevel !== G.level) bakeAurora();
  bgX.drawImage(aOff, 0, 0);

  if (G.frameN % 5 === 0) {
    const n = G.stars.length;
    for (let i = 0; i < n; i++) G.stars[i].tw += G.stars[i].sp * 5;
    bakeStars();
  }
  bgX.drawImage(sOff, 0, 0);

  // Shooting stars — eventos raros, muy baratos
  if (Math.random() < 0.0022)
    G.shooters.push({ x:Math.random()*W*.7, y:Math.random()*H*.35,
                      vx:4+Math.random()*6, vy:2+Math.random()*3.5, life:1 });
  for (let i = G.shooters.length - 1; i >= 0; i--) {
    const s = G.shooters[i];
    s.life -= 0.032; s.x += s.vx; s.y += s.vy;
    if (s.life <= 0) { G.shooters.splice(i, 1); continue; }
    bgX.globalAlpha = s.life * .9;
    bgX.strokeStyle = 'rgba(255,230,242,.95)';
    bgX.lineWidth   = 1.5;
    bgX.beginPath();
    bgX.moveTo(s.x, s.y);
    bgX.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
    bgX.stroke();
  }
  bgX.globalAlpha = 1;
}

/* ─────────────────────────────────────────
   CATCHER
───────────────────────────────────────── */
const CW     = Math.min(118, Math.max(88, window.innerWidth * 0.26)) | 0;
const CH     = 20;
const CY_OFF = 70;

function drawCatcher() {
  const x = G.cx, y = H - CY_OFF;

  // Glow ambiental — un radial por frame
  const og = gX.createRadialGradient(x, y+CH*.5, 0, x, y+CH*.5, CW*.9);
  og.addColorStop(0, 'rgba(255,77,109,.32)');
  og.addColorStop(1, 'transparent');
  gX.fillStyle = og;
  gX.fillRect(x - CW*.9, y - 24, CW*1.8, 78);

  // Pill body con gradiente
  const cg = gX.createLinearGradient(x - CW*.5, 0, x + CW*.5, 0);
  cg.addColorStop(0,   'rgba(255,100,130,.2)');
  cg.addColorStop(0.5, 'rgba(255,77,109,.96)');
  cg.addColorStop(1,   'rgba(255,100,130,.2)');

  // ── OPTIMIZACIÓN: shadowBlur solo en catcher, no en partículas ──
  gX.shadowColor = 'rgba(255,77,109,.8)';
  gX.shadowBlur  = 18;
  gX.fillStyle   = cg;
  const r = CH * .5;
  gX.beginPath();
  gX.moveTo(x - CW*.5 + r, y);
  gX.arcTo(x+CW*.5, y,      x+CW*.5, y+CH, r);
  gX.arcTo(x+CW*.5, y+CH,   x-CW*.5, y+CH, r);
  gX.arcTo(x-CW*.5, y+CH,   x-CW*.5, y,    r);
  gX.arcTo(x-CW*.5, y,      x+CW*.5, y,    r);
  gX.closePath();
  gX.fill();
  gX.shadowBlur = 0; // reset inmediato

  gX.textAlign    = 'center';
  gX.textBaseline = 'middle';
  gX.font         = '13px serif';
  gX.fillText('❤️', x, y + CH * .5);
}

/* ─────────────────────────────────────────
   OBJECTS — spawn, update, draw
───────────────────────────────────────── */
function pickType() {
  let r = Math.random();
  for (let i = 0; i < TYPES.length; i++) {
    r -= TYPES[i].prob;
    if (r <= 0) return TYPES[i];
  }
  return TYPES[0];
}

function spawn() {
  const lv   = LEVELS[G.level - 1];
  const t    = pickType();
  const prog = Math.min(1, (G.score - lv.minPts) / (lv.maxPts - lv.minPts || 1));
  G.objs.push({
    ...t,
    x:     t.sz * .5 + Math.random() * (W - t.sz),
    y:     -t.sz,
    speed: (t.sp || 1) * lv.spd * (1 + prog * 0.25),
    angle: 0,
    spin:  (Math.random() - .5) * 0.038,
  });
}

function updateObjs() {
  G.spawnT += G.dt;
  const lv = LEVELS[G.level - 1];

  if (G.spawnT >= lv.rate) {
    spawn(); G.spawnT = 0;
    // ── OPTIMIZACIÓN: doble-spawn con flag directo en lugar de setTimeout ──
    if (G.level >= 3 && Math.random() < .38) G._pendingSpawn1 = G.frameN + 22;
    if (G.level >= 5 && Math.random() < .25) G._pendingSpawn2 = G.frameN + 43;
  }
  // Ejecutar spawns pendientes sin setTimeout
  if (G._pendingSpawn1 && G.frameN >= G._pendingSpawn1) { spawn(); G._pendingSpawn1 = 0; }
  if (G._pendingSpawn2 && G.frameN >= G._pendingSpawn2) { spawn(); G._pendingSpawn2 = 0; }

  const hitY1 = H - CY_OFF;
  const hitY2 = hitY1 + CH + 10;

  for (let i = G.objs.length - 1; i >= 0; i--) {
    const o = G.objs[i];
    o.y     += o.speed * (G.dt / 16);
    o.angle += o.spin;

    const inX = Math.abs(o.x - G.cx) < CW * .5 + o.sz * .28;
    const inY = o.y + o.sz * .4 >= hitY1 && o.y - o.sz * .4 < hitY2;

    if (inX && inY)           { onCatch(o);                           G.objs.splice(i, 1); }
    else if (o.y > H + o.sz) { if (o.tag !== 'bad') { G.combo = 0; updCombo(); } G.objs.splice(i, 1); }
  }
}

function drawObjs() {
  gX.textAlign    = 'center';
  gX.textBaseline = 'middle';

  for (let i = 0, n = G.objs.length; i < n; i++) {
    const o = G.objs[i];
    gX.save();
    gX.translate(o.x, o.y);
    gX.rotate(o.angle);

    if (o.tag === 'quote') {
      // Glow manual: emoji grande difuso atrás, luego nítido encima
      gX.globalAlpha = 0.18;
      gX.font = `${(o.sz * 1.55) | 0}px serif`;
      gX.fillText(o.e, 0, 0);
      gX.globalAlpha = 1;
      gX.font = `${o.sz}px serif`;
      gX.fillText(o.e, 0, 0);
    } else if (o.tag === 'bad') {
      gX.globalAlpha = 0.22;
      gX.fillStyle   = '#ff0050';
      gX.beginPath();
      gX.arc(0, 0, o.sz * .7, 0, 6.2832);
      gX.fill();
      gX.globalAlpha = 1;
      gX.fillStyle   = '#fff';
      gX.font = `${o.sz}px serif`;
      gX.fillText(o.e, 0, 0);
    } else if (o.tag === 'rainbow') {
      const pulse = 1 + 0.08 * Math.sin(G.at * 8 + i);
      gX.scale(pulse, pulse);
      gX.globalAlpha = 0.2;
      gX.font = `${(o.sz * 1.4) | 0}px serif`;
      gX.fillText(o.e, 0, 0);
      gX.globalAlpha = 1;
      gX.font = `${o.sz}px serif`;
      gX.fillText(o.e, 0, 0);
    } else {
      gX.font = `${o.sz}px serif`;
      gX.fillText(o.e, 0, 0);
    }
    gX.restore();
  }
}

/* ─────────────────────────────────────────
   CATCH / LIFE LOGIC
───────────────────────────────────────── */
function onCatch(o) {
  if (o.tag === 'bad') {
    G.combo = 0; updCombo();
    burst(o.x, o.y, 5, ['💔','😢']); // reducido de 6 a 5
    loseLife();
    return;
  }
  G.score += o.pts;
  G.combo += 1;
  const em = o.tag==='quote'   ? ['⭐','✨','💫','🌟']
           : o.tag==='rainbow' ? ['💗','💕','💖','✨','⭐']
           :                     ['💗','💕','✨'];
  // ── OPTIMIZACIÓN: burst reducido y controlado por presupuesto de partículas ──
  burst(o.x, o.y, o.tag === 'quote' ? 10 : 6, em);
  addFloat(o.x, o.y, `+${o.pts}`, o.tag === 'quote' ? '#ffd700' : '#fff');
  if (o.tag === 'quote') showQuote();
  updHUD();
  updCombo();
  checkLevel();
}

function loseLife() {
  G.lives--;
  $.flash.style.opacity = '1';
  setTimeout(() => $.flash.style.opacity = '0', 180);
  shake();
  updLives();
  if (G.lives <= 0) endGame();
}

let shaking = false;
function shake() {
  if (shaking) return;
  shaking = true;
  let n = 0;
  const iv = setInterval(() => {
    const dx = (Math.random() - .5) * 14, dy = (Math.random() - .5) * 10;
    gC.style.transform  = `translate(${dx}px,${dy}px)`;
    bgC.style.transform = `translate(${dx*.3}px,${dy*.3}px)`;
    if (++n > 9) {
      clearInterval(iv);
      gC.style.transform = bgC.style.transform = '';
      shaking = false;
    }
  }, 38);
}

/* ─────────────────────────────────────────
   PARTICLES — pool con techo absoluto MAX_PARTS
   OPTIMIZACIÓN CLAVE: ya no se usa splice en mid-array
   Se usa swap-with-last + pop → O(1) vs O(n)
───────────────────────────────────────── */
function burst(x, y, n, emojis) {
  // Limitar según espacio disponible en el pool
  const available = MAX_PARTS - G.parts.length;
  const count = Math.min(n, available, 14); // nunca más de 14 partículas por burst
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 / count) * i + Math.random() * .5;
    const spd = 2.5 + Math.random() * 4.5;
    G.parts.push({
      x, y,
      e:    emojis[(Math.random() * emojis.length) | 0],
      vx:   Math.cos(ang) * spd,
      vy:   Math.sin(ang) * spd - 2.2,
      sz:   16 + Math.random() * 18,
      life: 1,
    });
  }
}

function drawParts() {
  gX.textAlign    = 'center';
  gX.textBaseline = 'middle';
  // ── OPTIMIZACIÓN: swap-with-last + pop evita desplazar el array completo ──
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const p = G.parts[i];
    p.x    += p.vx;
    p.y    += p.vy;
    p.vy   += 0.09;
    p.life -= 0.026;
    p.sz   *= 0.973;
    if (p.life <= 0) {
      // Swap con el último y hacer pop → más rápido que splice
      G.parts[i] = G.parts[G.parts.length - 1];
      G.parts.pop();
      continue;
    }
    gX.globalAlpha = p.life;
    gX.font        = `${p.sz | 0}px serif`;
    gX.fillText(p.e, p.x, p.y);
  }
  gX.globalAlpha = 1;
}

function addFloat(x, y, txt, col) {
  G.floats.push({ x, y, txt, col, sz:15, life:1 });
}
function drawFloats() {
  gX.textAlign    = 'center';
  gX.textBaseline = 'middle';
  for (let i = G.floats.length - 1; i >= 0; i--) {
    const f = G.floats[i];
    f.y    -= 1.6;
    f.life -= 0.022;
    if (f.life <= 0) {
      G.floats[i] = G.floats[G.floats.length - 1];
      G.floats.pop();
      continue;
    }
    gX.globalAlpha = f.life;
    gX.fillStyle   = f.col;
    gX.font        = `600 ${f.sz}px 'Josefin Sans',sans-serif`;
    gX.fillText(f.txt, f.x, f.y);
  }
  gX.globalAlpha = 1;
}

/* ─────────────────────────────────────────
   HUD — solo escribe al DOM cuando algo cambia
───────────────────────────────────────── */
let _cachedScore = -1, _cachedLevel = -1;
function updHUD() {
  if (G.score !== _cachedScore) {
    $.hSc.textContent = G.score;
    _cachedScore = G.score;
  }
  if (G.level !== _cachedLevel) {
    $.hNl.textContent = G.level;
    _cachedLevel = G.level;
  }
  const lv  = LEVELS[G.level - 1];
  const rng = lv.maxPts - lv.minPts;
  $.fill.style.width = (rng > 0 ? Math.min(100, (G.score - lv.minPts) / rng * 100) : 100) + '%';
}

function updLives() {
  $.hLv.textContent = '❤️'.repeat(Math.max(0, G.lives)) + '🖤'.repeat(Math.max(0, 5 - G.lives));
}

let comboTimer = 0;
function updCombo() {
  if (G.combo >= 4) {
    $.cN.textContent = `×${G.combo}`;
    $.combo.classList.add('on');
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => $.combo.classList.remove('on'), 1600);
    // ── OPTIMIZACIÓN: burst en combos ×10 limitado a 1 sola llamada con tamaño reducido ──
    if (G.combo >= 10 && G.combo % 5 === 0) {
      burst(W*.5, H*.4, 12, ['💗','✨','⭐','💕','💫']);
    }
  } else {
    $.combo.classList.remove('on');
  }
}

/* ─────────────────────────────────────────
   QUOTE — pausa el juego, reanuda al tocar
───────────────────────────────────────── */
function showQuote() {
  if (G.quoteOpen) return;
  G.paused = true; G.quoteOpen = true;
  const q = G.qQ[G.qI++ % G.qQ.length];
  $.qe.textContent = q.e;
  $.qt.textContent = q.t;
  $.qa.textContent = `— ${q.a}`;
  $.oQ.classList.remove('off');
  function close() {
    $.oQ.classList.add('off');
    G.paused = false; G.quoteOpen = false;
    $.oQ.removeEventListener('click',      close);
    $.oQ.removeEventListener('touchstart', close);
  }
  setTimeout(() => {
    $.oQ.addEventListener('click',      close);
    $.oQ.addEventListener('touchstart', close);
  }, 900);
}

/* ─────────────────────────────────────────
   LEVEL CHECK
───────────────────────────────────────── */
function checkLevel() {
  let nLv = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--)
    if (G.score >= LEVELS[i].minPts) { nLv = i + 1; break; }
  if (nLv <= G.level) return;
  G.level = nLv;
  const lv = LEVELS[G.level - 1];
  $.hNl.textContent  = G.level;
  $.bLbl.textContent = `NIVEL ${G.level} — ${lv.name}`;
  $.luN.textContent  = `NIVEL ${lv.num}`;
  $.luNm.textContent = lv.name;
  $.luMsg.textContent = lv.msg;
  $.oLvl.classList.remove('off');
  // ── OPTIMIZACIÓN: burst de level-up reducido de 4×18 a 2×10 ──
  burst(W*.5, H*.35, 10, ['⭐','💕','✨','💫','💗','🌟']);
  setTimeout(() => burst(W*.5, H*.35, 10, ['⭐','💕','✨','💫','💗','🌟']), 300);
  setTimeout(() => $.oLvl.classList.add('off'), 2900);
}

/* ─────────────────────────────────────────
   GAME OVER
───────────────────────────────────────── */
function endGame() {
  G.on = false;
  if (G.score > G.best) { G.best = G.score; localStorage.setItem('luv_best', G.best); }
  $.goSc.textContent  = G.score;
  $.goBst.textContent = G.best > 0 ? `Mejor marca: ${G.best} pts` : '';
  $.oOver.classList.remove('gone');
  $.oOver.classList.remove('off');
  // ── burst de game over moderado ──
  for (let i = 0; i < 4; i++)
    setTimeout(() => burst(Math.random()*W, Math.random()*H*.6, 10, ['💗','💕','💖','⭐','✨']), i*300);
}

/* ─────────────────────────────────────────
   MAIN LOOP — dt limitado a 50ms anti cascade
───────────────────────────────────────── */
function loop(ts) {
  if (!G.on) return;
  G.dt     = Math.min(ts - G.last, 50);
  G.last   = ts;
  G.frameN++;

  drawBg();
  gX.clearRect(0, 0, W, H);

  if (!G.paused) {
    if (!isMobile) G.cx += (G.tx - G.cx) * 0.18;
    updateObjs();
  }

  drawObjs();
  drawParts();
  drawFloats();
  drawCatcher();

  requestAnimationFrame(loop);
}

/* ─────────────────────────────────────────
   START
───────────────────────────────────────── */
function startGame() {
  G.on = true; G.paused = false;
  G.score = 0; G.lives = 5; G.level = 1; G.combo = 0;
  G.objs = []; G.parts = []; G.floats = []; G.shooters = [];
  G.cx = G.tx = W * .5;
  G.spawnT = 0; G.frameN = 0; G.last = performance.now();
  G.skyLevel = -1; G.aLevel = -1;
  G._pendingSpawn1 = 0; G._pendingSpawn2 = 0;
  _cachedScore = -1; _cachedLevel = -1;

  $.bLbl.textContent = 'NIVEL 1 — El Amanecer';
  $.oStart.classList.add('off');
  updHUD(); updLives();
  requestAnimationFrame(loop);
}
document.getElementById('btn-start').addEventListener('click', startGame);

/* ─────────────────────────────────────────
   IDLE BACKGROUND (antes de iniciar)
───────────────────────────────────────── */
(function bgIdle() {
  G.at += 0.007; G.bt += 0.003; G.frameN++;
  if (G.frameN % 3 === 0) bakeAurora();
  if (G.frameN % 5 === 0) { G.stars.forEach(s => s.tw += s.sp * 5); bakeStars(); }

  if (!G.skyGrd) {
    const sk = LEVELS[0].sky;
    const gr = bgX.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, sk[0]); gr.addColorStop(0.52, sk[1]); gr.addColorStop(1, sk[2]);
    G.skyGrd = gr; G.skyLevel = 1;
  }
  bgX.fillStyle = G.skyGrd; bgX.fillRect(0, 0, W, H);
  bgX.drawImage(aOff, 0, 0);
  bgX.drawImage(sOff, 0, 0);

  if (!G.on) requestAnimationFrame(bgIdle);
})();
