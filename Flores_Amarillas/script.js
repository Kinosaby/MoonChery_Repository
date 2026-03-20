// ── CURSOR ──
const cursor = document.getElementById('cursor');
const cursors = ['🌻','✨','🌼','💛','⭐'];
let ci = 0;
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
setInterval(() => { cursor.textContent = cursors[ci % cursors.length]; ci++; }, 1200);

// ── CANVAS ──
const canvas = document.getElementById('main-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── CIELO DEGRADADO ──
function drawSky(t) {
  // noche → amanecer dorado
  const prog = (.5 + .5 * Math.sin(t * .0004)); // 0..1 lento
  const skyG = ctx.createLinearGradient(0, 0, 0, H);
  skyG.addColorStop(0,   `hsl(240,30%,${4 + prog * 8}%)`);
  skyG.addColorStop(.35, `hsl(30,40%,${6 + prog * 10}%)`);
  skyG.addColorStop(.65, `hsl(35,60%,${8 + prog * 14}%)`);
  skyG.addColorStop(1,   `hsl(38,70%,${10 + prog * 18}%)`);
  ctx.fillStyle = skyG;
  ctx.fillRect(0, 0, W, H);
}

// ── SOL ──
function drawSun(t) {
  const sx = W * .5 + Math.sin(t * .0003) * W * .1;
  const sy = H * .18 + Math.sin(t * .0002) * H * .05;
  // halos
  [120, 80, 50, 30].forEach((r, i) => {
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    const a = [.04, .07, .12, .22][i];
    g.addColorStop(0, `rgba(255,210,30,${a})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
  });
  // sol
  ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe040'; ctx.fill();
  ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#fff080'; ctx.fill();
}

// ── ESTRELLAS ──
const stars = Array.from({ length: 180 }, () => ({
  x: Math.random() * 100, y: Math.random() * 50,
  r: Math.random() * 1.2 + .2,
  a: Math.random() * .6 + .2,
  sp: .002 + Math.random() * .005,
  ph: Math.random() * Math.PI * 2,
}));
function drawStars(t) {
  stars.forEach(s => {
    const a = s.a * (.4 + .6 * Math.sin(t * s.sp + s.ph)) * .6;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(s.x / 100 * W, s.y / 100 * H, s.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8d0'; ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ── PARTÍCULAS DORADAS (luciérnagas) ──
const sparkles = Array.from({ length: 55 }, () => newSparkle());
function newSparkle() {
  return {
    x: Math.random() * W,
    y: H * .3 + Math.random() * H * .6,
    vx: (Math.random() - .5) * .5,
    vy: -Math.random() * .4 - .1,
    r:  Math.random() * 2.5 + 1,
    a:  0,
    maxA: Math.random() * .7 + .2,
    life: 0,
    maxLife: 120 + Math.random() * 200,
  };
}
function drawSparkles() {
  sparkles.forEach((s, i) => {
    s.life++;
    s.x += s.vx; s.y += s.vy;
    const prog = s.life / s.maxLife;
    s.a = prog < .3 ? prog / .3 * s.maxA : prog > .7 ? (1 - prog) / .3 * s.maxA : s.maxA;
    if (s.life > s.maxLife) sparkles[i] = newSparkle();
    // glow
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
    g.addColorStop(0, `rgba(255,220,50,${s.a * .5})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = s.a;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe060'; ctx.fill();
    ctx.globalAlpha = 1;
  });
}

// ── PÉTALOS CAYENDO ──
const petals = Array.from({ length: 60 }, () => newPetal());
function newPetal(fromTop = true) {
  return {
    x: Math.random() * W,
    y: fromTop ? -20 : Math.random() * H,
    vx: (Math.random() - .5) * 1.5,
    vy: .5 + Math.random() * 1.2,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - .5) * .05,
    size: 6 + Math.random() * 8,
    a: Math.random() * .6 + .3,
    col: ['#ffd020', '#ffe040', '#ffc010', '#ffdc30', '#fff060'][Math.floor(Math.random() * 5)],
  };
}
function drawPetals() {
  petals.forEach((p, i) => {
    p.x += p.vx + Math.sin(p.rot * .5) * .5;
    p.y += p.vy;
    p.rot += p.rotV;
    if (p.y > H + 20) petals[i] = newPetal(true);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.a;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * .45, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.col;
    ctx.fill();
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

// ── CAMPO DE FLORES (fondo) ──
class FieldFlower {
  constructor(x, bloom = false) {
    this.x = x;
    this.stemH = H * (.2 + Math.random() * .25);
    this.size  = 10 + Math.random() * 16;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = .006 + Math.random() * .008;
    this.bloom = bloom ? 1 : 0;
    this.blooming = bloom;
    this.col   = ['#ffd020', '#ffe040', '#ffc010', '#ffdc30'][Math.floor(Math.random() * 4)];
    this.col2  = ['#e0a010', '#d09000', '#c07808'][Math.floor(Math.random() * 3)];
  }
  update(t) {
    if (this.blooming && this.bloom < 1) this.bloom = Math.min(1, this.bloom + .018);
  }
  draw(ctx, t) {
    const by = H - 40;
    const sw = Math.sin(t * this.speed + this.phase) * 8;
    const s = this.size * this.bloom;
    // tallo
    ctx.save();
    ctx.strokeStyle = '#2a5010'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(this.x, by);
    ctx.quadraticCurveTo(this.x + sw * .5, by - this.stemH * .5, this.x + sw, by - this.stemH);
    ctx.stroke();
    if (this.bloom > .3) {
      // hoja
      ctx.fillStyle = '#3a6018';
      ctx.beginPath();
      ctx.ellipse(this.x + sw * .4 - 12, by - this.stemH * .45, 12, 6, -.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (s < 2) return;
    // pétalos
    ctx.save();
    ctx.translate(this.x + sw, by - this.stemH);
    const nP = 12;
    for (let i = 0; i < nP; i++) {
      const a = (i / nP) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = i % 2 === 0 ? this.col : this.col2;
      ctx.globalAlpha = .9 * this.bloom;
      ctx.beginPath();
      ctx.ellipse(0, -s * 1.1, s * .42, s * .75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // centro
    ctx.globalAlpha = this.bloom;
    ctx.beginPath(); ctx.arc(0, 0, s * .38, 0, Math.PI * 2);
    ctx.fillStyle = '#2c1406'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, s * .26, 0, Math.PI * 2);
    ctx.fillStyle = '#3c1c08'; ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

// flores del campo fijo
let fieldFlowers = [];
function initField() {
  fieldFlowers = Array.from({ length: 40 }, (_, i) => {
    const x = (i / 40) * W + (Math.random() - .5) * (W / 40);
    return new FieldFlower(x, i < 20);
  });
  // bloom progresivo
  setTimeout(() => fieldFlowers.slice(20).forEach((f, i) => {
    setTimeout(() => f.blooming = true, i * 80);
  }), 400);
}
initField();

// ── FLORES INTERACTIVAS (click/touch) ──
const clickFlowers = [];
function addClickFlower(x, y) {
  clickFlowers.push({
    x, y: Math.min(y, H - 50),
    size: 8 + Math.random() * 14,
    bloom: 0, blooming: true,
    phase: Math.random() * Math.PI * 2,
    col: ['#ffd020','#ffe040','#ffc010','#fff060'][Math.floor(Math.random()*4)],
    stemH: 30 + Math.random() * 60,
  });
}

function drawClickFlower(f, t) {
  if (f.blooming && f.bloom < 1) f.bloom = Math.min(1, f.bloom + .03);
  const s = f.size * f.bloom;
  const sw = Math.sin(t * .008 + f.phase) * 5;
  // tallo
  ctx.save();
  ctx.strokeStyle = '#3a6014'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(f.x, f.y);
  ctx.quadraticCurveTo(f.x + sw, f.y - f.stemH * .5, f.x + sw, f.y - f.stemH);
  ctx.stroke(); ctx.restore();
  if (s < 2) return;
  ctx.save();
  ctx.translate(f.x + sw, f.y - f.stemH);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.save(); ctx.rotate(a);
    ctx.globalAlpha = .85 * f.bloom;
    ctx.fillStyle = f.col;
    ctx.beginPath();
    ctx.ellipse(0, -s, s * .4, s * .7, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha = f.bloom;
  ctx.beginPath(); ctx.arc(0, 0, s * .35, 0, Math.PI * 2);
  ctx.fillStyle = '#2a1406'; ctx.fill();
  ctx.globalAlpha = 1; ctx.restore();
}

// ── SUELO ──
function drawGround(t) {
  // pasto base
  const g = ctx.createLinearGradient(0, H - 80, 0, H);
  g.addColorStop(0, '#1a3808'); g.addColorStop(1, '#0c1e04');
  ctx.fillStyle = g; ctx.fillRect(0, H - 60, W, 60);
  // borde suave
  const ge = ctx.createLinearGradient(0, H - 90, 0, H - 55);
  ge.addColorStop(0, 'transparent'); ge.addColorStop(1, '#1a3808');
  ctx.fillStyle = ge; ctx.fillRect(0, H - 90, W, 35);
  // pastos
  for (let i = 0; i < 80; i++) {
    const gx = (i / 80) * W + (i * 37) % 18 - 9;
    const gh = 15 + Math.sin(i * 1.3) * 10;
    const sw2 = Math.sin(t * .012 + i * .5) * 5;
    ctx.save();
    ctx.strokeStyle = ['#2a5010','#3a6018','#1e4008'][i % 3];
    ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(gx, H - 40);
    ctx.quadraticCurveTo(gx + sw2, H - 40 - gh * .6, gx + sw2, H - 40 - gh);
    ctx.stroke(); ctx.restore();
  }
}

// ── INTERACCIÓN ──
function handleInteract(e) {
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  if (y > H - 20) return;
  addClickFlower(x, y);
  // sparkle burst
  for (let i = 0; i < 4; i++) {
    const s = newSparkle();
    s.x = x + (Math.random() - .5) * 40;
    s.y = y + (Math.random() - .5) * 40;
    s.vy = -Math.random() * 2 - 1;
    sparkles.push(s);
    if (sparkles.length > 80) sparkles.shift();
  }
}
canvas.addEventListener('click', handleInteract);
canvas.addEventListener('touchstart', e => { e.preventDefault(); handleInteract(e); });

// ── CONTADOR ──
function updateCountdown() {
  const now   = new Date();
  const target = new Date(now.getFullYear(), 2, 21); // 21 Marzo
  if (now > target) target.setFullYear(now.getFullYear() + 1);
  const diff = target - now;
  const days  = Math.floor(diff / 86400000);
  const hrs   = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const cdNum = document.getElementById('cd-num');
  const cdUnit = document.getElementById('cd-unit');
  if (!cdNum || !cdUnit) return;
  if (days > 0) {
    cdNum.textContent = days === 0 ? '🌻' : days;
    cdUnit.textContent = days === 1 ? 'día para las flores amarillas' : 'días para las flores amarillas';
  } else if (hrs > 0) {
    cdNum.textContent  = hrs;
    cdUnit.textContent = 'horas para las flores amarillas';
  } else if (mins > 0) {
    cdNum.textContent  = mins;
    cdUnit.textContent = '¡Ya casi! Minutos para las flores 🌻';
  } else {
    cdNum.textContent  = '🌻';
    cdUnit.textContent = '¡Hoy es el día de las flores amarillas!';
  }
}
updateCountdown();
setInterval(updateCountdown, 30000);

// ── LOOP ──
let t = 0;
function loop() {
  t++;
  ctx.clearRect(0, 0, W, H);

  drawSky(t);
  drawStars(t);
  drawSun(t);

  // flores del campo
  fieldFlowers.forEach(f => { f.update(t); f.draw(ctx, t); });

  // flores del click
  clickFlowers.forEach(f => drawClickFlower(f, t));

  drawGround(t);
  drawPetals();
  drawSparkles();

  requestAnimationFrame(loop);
}
loop();
