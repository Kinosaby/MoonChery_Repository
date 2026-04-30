'use strict';
// ── BG FLOATING PETALS ───────────────────────────────────────────────────────
const floaters = ['🌸','🌼','🌺','🌷','✿','❀'];
for (let i = 0; i < 18; i++) {
  const d = document.createElement('div');
  d.className = 'petal-float';
  d.textContent = floaters[Math.floor(Math.random() * floaters.length)];
  d.style.left             = Math.random() * 100 + 'vw';
  d.style.top              = Math.random() * 100 + 'vh';
  d.style.animationDuration = (4 + Math.random() * 6) + 's';
  d.style.animationDelay   = (-Math.random() * 8) + 's';
  d.style.fontSize         = (0.8 + Math.random() * 1.4) + 'rem';
  document.body.appendChild(d);
}

// ── MESSAGES ────────────────────────────────────────────────────────────────
const MSGS = [
  { t:"Eres la flor más hermosa en el jardín de mi vida",          e:"🌸" },
  { t:"Cada día contigo es un regalo que el universo me da",       e:"🌟" },
  { t:"Tienes el don de hacer que todo brille un poco más",        e:"✨" },
  { t:"Eres tan especial que incluso las flores se detienen a mirarte", e:"🌼" },
  { t:"Tu sonrisa tiene el poder de iluminar los días más grises", e:"☀️" },
  { t:"Eres exactamente la persona que el mundo necesitaba",       e:"💛" },
  { t:"Como una gerbera, llevas color y alegría a donde llegas",   e:"🌺" },
  { t:"Hay personas que hacen el mundo más bello solo por existir. Tú eres una de ellas", e:"🌷" },
  { t:"Eres delicada como un pétalo y fuerte como la raíz de un árbol", e:"🌿" },
  { t:"El mundo florece un poco más cada vez que tú sonríes",      e:"🌸" },
  { t:"Eres la persona más dulce que he conocido jamás",           e:"🍯" },
  { t:"Tu presencia hace que todo lo bueno parezca posible",       e:"💫" },
  { t:"Eres primavera en persona: siempre traes vida y color",     e:"🌈" },
  { t:"Mereces todas las flores del jardín y todos los colores del cielo", e:"🌻" },
  { t:"Cada vez que apareces, hasta las flores sonríen",           e:"🌼" },
  { t:"Tienes una luz que no se puede describir, solo admirar",    e:"💡" },
  { t:"Eres el tipo de persona que te hace creer en lo bonito de la vida", e:"🕊️" },
  { t:"Gracias por existir y por iluminar este mundo con tu presencia", e:"🌟" },
  { t:"Eres tan única que no hay flor, ni jardín, que te iguale",  e:"🌺" },
  { t:"Llevas amabilidad donde vayas y eso te hace extraordinaria", e:"💛" },
  { t:"Eres la mejor parte de cualquier historia donde apareces",  e:"📖" },
  { t:"Como las gerberas: radiante, vibrante y completamente inigualable", e:"🌸" },
  { t:"Eres la calma en el viento y el color entre las hojas",     e:"🍃" },
  { t:"Tu corazón es tan grande que cabe el mundo entero en él",   e:"❤️" },
  { t:"Eres agua fresca, luz de mañana y pétalo suave al mismo tiempo", e:"🌊" },
  { t:"Existes y eso ya es razón suficiente para sonreír hoy",     e:"🌻" },
  { t:"Eres exactamente tan increíble como piensas que no eres",   e:"💎" },
  { t:"El jardín de la vida es más bello porque tú estás en él",   e:"🌷" },
  { t:"Cada detalle tuyo es un milagro pequeño que el mundo agradece", e:"🦋" },
  { t:"Mereces que alguien te diga todos los días lo especial que eres", e:"💌" },
];

let current = 0;

// ── DOTS ──────────────────────────────────────────────────────────────────────
const dotsEl  = document.getElementById('dots');
const VISIBLE = 7;
let dotEls    = [];

function buildDots() {
  dotsEl.innerHTML = '';
  dotEls = [];
  const count = Math.min(MSGS.length, VISIBLE);
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
    dotEls.push(d);
  }
  updateDots();
}
function updateDots() {
  const idx = current % dotEls.length;
  dotEls.forEach((d, i) => d.classList.toggle('active', i === idx));
}

// ── MSG DISPLAY ───────────────────────────────────────────────────────────────
const msgText  = document.getElementById('msgText');
const msgEmoji = document.getElementById('msgEmoji');

function showMsg(idx) {
  const m = MSGS[idx];
  msgText.classList.remove('fade-in');
  msgText.classList.add('fade-out');
  msgEmoji.style.opacity   = '0';
  msgEmoji.style.transform = 'scale(.7)';
  setTimeout(() => {
    msgText.textContent  = m.t;
    msgEmoji.textContent = m.e;
    msgText.classList.remove('fade-out');
    msgText.classList.add('fade-in');
    msgEmoji.style.opacity    = '1';
    msgEmoji.style.transform  = 'scale(1)';
    msgEmoji.style.transition = 'opacity .5s ease .15s, transform .5s cubic-bezier(.34,1.56,.64,1) .15s';
    updateDots();
  }, 500);
}
function goTo(idx) {
  current = ((idx % MSGS.length) + MSGS.length) % MSGS.length;
  showMsg(current);
}

document.getElementById('btnNext').addEventListener('click', () => goTo(current + 1));
buildDots();
setTimeout(() => showMsg(0), 300);
setInterval(() => goTo(current + 1), 8000);

// ── GERBERA DRAWING ───────────────────────────────────────────────────────────
function drawGerbera(ctx, cx, cy, r, outerColor, innerColor, centerColor, rotOff, shadow) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotOff);
  if (shadow) {
    ctx.shadowColor = 'rgba(100,40,0,.18)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  }
  const outerN = 22, innerN = 14;
  for (let i = 0; i < outerN; i++) {
    const a = (i / outerN) * Math.PI * 2;
    ctx.save(); ctx.rotate(a);
    const pw = r * 0.19, pl = r;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.22);
    ctx.bezierCurveTo( pw, r*0.35,  pw*0.7, pl*0.78, 0, pl);
    ctx.bezierCurveTo(-pw*0.7, pl*0.78, -pw, r*0.35, 0, r*0.22);
    ctx.fillStyle = outerColor; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, r*0.22); ctx.lineTo(0, pl*0.92);
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.restore();
  }
  ctx.rotate(Math.PI / outerN);
  for (let i = 0; i < innerN; i++) {
    const a = (i / innerN) * Math.PI * 2;
    ctx.save(); ctx.rotate(a);
    const pw = r * 0.16, pl = r * 0.58;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.25);
    ctx.bezierCurveTo( pw, r*0.35,  pw*0.6, pl*0.8, 0, pl);
    ctx.bezierCurveTo(-pw*0.6, pl*0.8, -pw, r*0.35, 0, r*0.25);
    ctx.fillStyle = innerColor; ctx.fill();
    ctx.restore();
  }
  ctx.rotate(-Math.PI / outerN);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  const cr = r * 0.27;
  const cg = ctx.createRadialGradient(0, -cr*0.2, 0, 0, 0, cr);
  cg.addColorStop(0, centerColor[0]); cg.addColorStop(0.6, centerColor[1]); cg.addColorStop(1, centerColor[2]);
  ctx.beginPath(); ctx.arc(0, 0, cr, 0, Math.PI*2); ctx.fillStyle = cg; ctx.fill();
  for (let d = 0; d < 20; d++) {
    const da = (d/20)*Math.PI*2, dr = cr*(0.35 + (d%3)*0.18);
    ctx.beginPath(); ctx.arc(Math.cos(da)*dr, Math.sin(da)*dr, 1.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(60,20,0,.35)'; ctx.fill();
  }
  for (let d = 0; d < 10; d++) {
    const da = (d/10)*Math.PI*2, dr = cr*0.22;
    ctx.beginPath(); ctx.arc(Math.cos(da)*dr, Math.sin(da)*dr, 1, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,200,100,.45)'; ctx.fill();
  }
  ctx.restore();
}

function drawStem(ctx, x1, y1, x2, y2, cpx, cpy) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.strokeStyle = '#6a9a4a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
}
function drawLeaf(ctx, x, y, angle, size) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size*0.4, -size*0.2,  size*0.8, -size*0.15, size, 0);
  ctx.bezierCurveTo(size*0.8,  size*0.2,  size*0.4,  size*0.25, 0, 0);
  ctx.fillStyle = '#5a8a3a'; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
}

// ── FLOWER CANVAS ─────────────────────────────────────────────────────────────
const fc   = document.getElementById('flowerCanvas');
const fctx = fc.getContext('2d');

function drawFlowerBanner() {
  const W = fc.width, H = fc.height;
  fctx.clearRect(0, 0, W, H);
  const bg = fctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#fff5e8'); bg.addColorStop(0.5, '#fdeacc'); bg.addColorStop(1, '#fcddb8');
  fctx.fillStyle = bg; fctx.fillRect(0, 0, W, H);
  const rg = fctx.createRadialGradient(W/2, H, 0, W/2, H, W*0.7);
  rg.addColorStop(0, 'rgba(255,180,80,.18)'); rg.addColorStop(1, 'transparent');
  fctx.fillStyle = rg; fctx.fillRect(0, 0, W, H);
  drawStem(fctx, W*0.18, H*1.1, W*0.22, H*0.18, W*0.1, H*0.5);
  drawStem(fctx, W*0.45, H*1.1, W*0.48, H*0.12, W*0.5, H*0.6);
  drawStem(fctx, W*0.78, H*1.1, W*0.75, H*0.2,  W*0.85, H*0.5);
  drawLeaf(fctx, W*0.14, H*0.65, -0.5, 28); drawLeaf(fctx, W*0.26, H*0.45, 0.4, 24);
  drawLeaf(fctx, W*0.44, H*0.55, -0.3, 26); drawLeaf(fctx, W*0.55, H*0.38, 0.5, 22);
  drawLeaf(fctx, W*0.72, H*0.5,  -0.4, 27); drawLeaf(fctx, W*0.84, H*0.62, 0.35, 23);
  const blooms = [
    { x:W*0.18, y:H*0.18, r:40, oc:'#e85c3e', ic:'#cc4428', cc:['#4a1a05','#2e0e02','#1a0800'], rot:-0.3 },
    { x:W*0.48, y:H*0.12, r:50, oc:'#f5c030', ic:'#e0a010', cc:['#5c3a02','#3a2001','#200d00'], rot:0.15 },
    { x:W*0.76, y:H*0.18, r:44, oc:'#e84878', ic:'#cc2860', cc:['#4a1020','#2e0812','#1a0408'], rot:0.6 },
    { x:W*0.06, y:H*0.55, r:28, oc:'#f0864a', ic:'#da6830', cc:['#3c1e02','#240e00','#0e0600'], rot:-0.8 },
    { x:W*0.92, y:H*0.5,  r:30, oc:'#d94848', ic:'#ba3030', cc:['#3a1005','#220800','#0e0200'], rot:1.2 },
    { x:W*0.33, y:H*0.72, r:22, oc:'#f0a020', ic:'#d88010', cc:['#4a2e00','#2e1800','#180800'], rot:0.4 },
    { x:W*0.65, y:H*0.7,  r:24, oc:'#e86090', ic:'#cc4070', cc:['#3e1020','#280810','#140408'], rot:-0.5 },
  ];
  blooms.forEach(b => drawGerbera(fctx, b.x, b.y, b.r, b.oc, b.ic, b.cc, b.rot, true));
  const fade = fctx.createLinearGradient(0, H*0.5, 0, H);
  fade.addColorStop(0, 'transparent'); fade.addColorStop(1, 'rgba(255,252,246,1)');
  fctx.fillStyle = fade; fctx.fillRect(0, 0, W, H);
}

function resizeFlowerCanvas() {
  const wrap = fc.parentElement;
  fc.width = wrap.clientWidth; fc.height = wrap.clientHeight;
  drawFlowerBanner();
}

// ── BG CANVAS ─────────────────────────────────────────────────────────────────
const bgc   = document.getElementById('bg');
const bgctx = bgc.getContext('2d');
let BW, BH;

function drawBg() {
  const g = bgctx.createLinearGradient(0,0,BW,BH);
  g.addColorStop(0, '#fdecd2'); g.addColorStop(0.4, '#fbd9c0');
  g.addColorStop(0.8, '#fce8d5'); g.addColorStop(1, '#fbeadc');
  bgctx.fillStyle = g; bgctx.fillRect(0, 0, BW, BH);
  const corners = [
    {x:0,      y:0,      r:70, oc:'#e8d060', ic:'#d0b040', rot:0.8},
    {x:BW,     y:0,      r:80, oc:'#e85040', ic:'#c83020', rot:-0.5},
    {x:0,      y:BH,     r:65, oc:'#f08060', ic:'#d86040', rot:1.2},
    {x:BW,     y:BH,     r:75, oc:'#d84880', ic:'#b82860', rot:-1.0},
    {x:BW*0.5, y:0,      r:45, oc:'#f0a030', ic:'#d88010', rot:0.3},
    {x:BW*0.5, y:BH,     r:50, oc:'#e86070', ic:'#cc4050', rot:-0.3},
  ];
  bgctx.globalAlpha = 0.22;
  corners.forEach(c => drawGerbera(bgctx, c.x, c.y, c.r, c.oc, c.ic, ['#3c1800','#240a00','#100400'], c.rot, false));
  bgctx.globalAlpha = 1;
}

function resizeBg() {
  BW = bgc.width = innerWidth; BH = bgc.height = innerHeight; drawBg();
}

window.addEventListener('resize', () => { resizeBg(); resizeFlowerCanvas(); });
resizeBg();
window.addEventListener('load', () => {
  resizeFlowerCanvas();
  let lastT = 0;
  function animBg(t) {
    if (t - lastT > 5000) { drawBg(); lastT = t; }
    requestAnimationFrame(animBg);
  }
  requestAnimationFrame(animBg);
});
setTimeout(resizeFlowerCanvas, 200);
