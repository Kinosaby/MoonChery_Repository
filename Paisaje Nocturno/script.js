const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let W, H, t = 0;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ─── CONFIG ───────────────────────────────────────────────
const PALETTE = {
  skyTop:    [5,   8,  20],
  skyMid:    [12,  22,  50],
  skyHorizon:[35,  55,  90],
  horizonGlow:[80, 55,  35],
  moonColor: [255, 240, 200],
  moonGlow:  [255, 220, 140],
  waterDeep: [4,   10,  25],
  waterSheen:[20,  35,  65],
  hillFar:   [18,  28,  50],
  hillNear:  [10,  15,  28],
  treeTrunk: [8,   12,  20],
  treeLeaf:  [12,  22,  38],
  grass:     [10,  18,  30],
};

// ─── HELPERS ──────────────────────────────────────────────
function rgb([r,g,b], a=1) { return `rgba(${r},${g},${b},${a})`; }
function lerp(a, b, t) { return a + (b-a)*t; }
function lerpRGB(a, b, t) { return a.map((v,i)=>Math.round(lerp(v, b[i], t))); }
function noise(x, y, s=1) {
  return (Math.sin(x*s*1.3 + y*s*0.7 + t*0.4)*0.5 +
          Math.sin(x*s*0.7 - y*s*1.1 + t*0.3)*0.3 +
          Math.sin(x*s*2.1 + t*0.2)*0.2);
}

// ─── STARS ────────────────────────────────────────────────
const STARS = Array.from({length: 180}, () => ({
  x: Math.random(),
  y: Math.random() * 0.55,
  r: 0.3 + Math.random() * 1.1,
  phase: Math.random() * Math.PI * 2,
  speed: 0.5 + Math.random() * 1.5,
}));

function drawStars() {
  STARS.forEach(s => {
    const tw = Math.sin(t * s.speed * 0.015 + s.phase);
    const alpha = 0.3 + tw * 0.35;
    const px = s.x * W, py = s.y * H;
    ctx.beginPath();
    ctx.arc(px, py, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(220,235,255,${Math.max(0,alpha)})`;
    ctx.fill();
  });
}

// ─── SKY ──────────────────────────────────────────────────
function drawSky() {
  const horiz = H * 0.52;
  const grad = ctx.createLinearGradient(0, 0, 0, horiz);
  grad.addColorStop(0,   rgb(PALETTE.skyTop));
  grad.addColorStop(0.55, rgb(PALETTE.skyMid));
  grad.addColorStop(0.88, rgb(PALETTE.skyHorizon));
  grad.addColorStop(1,   rgb(lerpRGB(PALETTE.skyHorizon, PALETTE.horizonGlow, 0.4)));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, horiz + 2);
}

// ─── MOON ─────────────────────────────────────────────────
function drawMoon() {
  const mx = W * 0.72, my = H * 0.16;
  const mr = Math.min(W, H) * 0.052;

  // Atmospheric glow layers
  [0.04, 0.08, 0.12, 0.18].forEach((a, i) => {
    const gr = mr * (3.5 - i * 0.6);
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, gr);
    g.addColorStop(0,   `rgba(255,220,140,${a})`);
    g.addColorStop(0.5, `rgba(200,160,80,${a*0.4})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mx, my, gr, 0, Math.PI*2);
    ctx.fill();
  });

  // Moon body
  const mg = ctx.createRadialGradient(mx - mr*0.25, my - mr*0.25, mr*0.1, mx, my, mr);
  mg.addColorStop(0,   'rgba(255,248,220,1)');
  mg.addColorStop(0.6, 'rgba(240,225,180,1)');
  mg.addColorStop(1,   'rgba(200,180,120,0.95)');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI*2);
  ctx.fill();

  // Subtle craters
  [[0.3,-0.2,0.18],[-0.2,0.3,0.12],[0.1,0.1,0.08]].forEach(([dx,dy,cr])=>{
    ctx.beginPath();
    ctx.arc(mx+dx*mr, my+dy*mr, cr*mr, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(180,155,100,0.18)';
    ctx.fill();
  });
}

// ─── DISTANT HILLS ────────────────────────────────────────
function hillPoint(i, total, baseY, amp, freq, off) {
  const x = (i / total) * W;
  const h = amp * (0.5 + 0.5 * Math.sin(i * freq + off) +
                   0.25 * Math.sin(i * freq * 1.7 + off * 0.6) +
                   0.15 * Math.sin(i * freq * 3.1 + off * 1.2));
  return [x, baseY - h];
}

function drawHills() {
  const horiz = H * 0.52;

  // Far hill — dark indigo
  ctx.beginPath();
  ctx.moveTo(0, horiz);
  const pts = 80;
  for (let i=0; i<=pts; i++) {
    const [x,y] = hillPoint(i, pts, horiz, H*0.09, 0.18, 0);
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.lineTo(W, horiz); ctx.lineTo(0, horiz); ctx.closePath();
  const hg1 = ctx.createLinearGradient(0, horiz-H*0.09, 0, horiz);
  hg1.addColorStop(0, rgb(PALETTE.hillFar));
  hg1.addColorStop(1, rgb(lerpRGB(PALETTE.hillFar, PALETTE.skyHorizon, 0.15)));
  ctx.fillStyle = hg1;
  ctx.fill();

  // Near hill — deeper
  ctx.beginPath();
  for (let i=0; i<=pts; i++) {
    const [x,y] = hillPoint(i, pts, horiz + H*0.04, H*0.07, 0.22, 2.5);
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  const hg2 = ctx.createLinearGradient(0, horiz, 0, H);
  hg2.addColorStop(0, rgb(PALETTE.hillNear));
  hg2.addColorStop(1, rgb([6,10,18]));
  ctx.fillStyle = hg2;
  ctx.fill();
}

// ─── WATER ────────────────────────────────────────────────
function drawWater() {
  const waterTop = H * 0.57;
  const wg = ctx.createLinearGradient(0, waterTop, 0, H);
  wg.addColorStop(0, rgb(PALETTE.waterSheen, 0.9));
  wg.addColorStop(0.4, rgb(PALETTE.waterDeep));
  wg.addColorStop(1, rgb([3,6,14]));
  ctx.fillStyle = wg;
  ctx.fillRect(0, waterTop, W, H - waterTop);

  // Moon reflection shimmer
  const rx = W * 0.72;
  const rw = W * 0.08;
  const rg = ctx.createLinearGradient(0, waterTop, 0, H);
  rg.addColorStop(0, 'rgba(255,220,130,0.25)');
  rg.addColorStop(0.5,'rgba(255,200,100,0.12)');
  rg.addColorStop(1,  'rgba(255,180,80,0.04)');

  // Wavy ribbon
  ctx.save();
  ctx.beginPath();
  for (let y = waterTop; y < H; y += 2) {
    const progress = (y - waterTop) / (H - waterTop);
    const ww = rw * (0.3 + progress * 1.4);
    const wobble = Math.sin(y * 0.08 + t * 0.025) * 4 * progress;
    ctx.rect(rx - ww/2 + wobble, y, ww, 2);
  }
  ctx.fillStyle = rg;
  ctx.fill();
  ctx.restore();

  // Ripple lines
  for (let j=0; j<7; j++) {
    const ry = waterTop + (H - waterTop) * (0.1 + j*0.13);
    const phase = t * 0.018 + j * 1.1;
    const amp   = 3 + j * 1.5;
    const freq  = 0.012 - j * 0.0008;
    const alpha = 0.04 + j * 0.015;
    ctx.beginPath();
    for (let x=0; x<=W; x+=3) {
      const y2 = ry + Math.sin(x * freq + phase) * amp
                    + Math.sin(x * freq * 2.3 - phase * 0.7) * amp * 0.4;
      x===0 ? ctx.moveTo(x, y2) : ctx.lineTo(x, y2);
    }
    ctx.strokeStyle = `rgba(100,150,220,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ─── GROUND STRIP ─────────────────────────────────────────
function drawGround() {
  const gt = H * 0.535, gb = H * 0.6;
  const g = ctx.createLinearGradient(0, gt, 0, gb);
  g.addColorStop(0, rgb(PALETTE.hillNear));
  g.addColorStop(1, rgb(PALETTE.grass));
  ctx.fillStyle = g;
  ctx.fillRect(0, gt, W, gb - gt);

  // Grass blades
  const bladeCount = Math.floor(W / 5);
  for (let i=0; i<bladeCount; i++) {
    const bx = (i / bladeCount) * W + (Math.random() - 0.5) * 8;
    const bh = 8 + Math.random() * 18;
    const sway = Math.sin(t * 0.02 + i * 0.3) * 3;
    ctx.beginPath();
    ctx.moveTo(bx, gt + 2);
    ctx.quadraticCurveTo(bx + sway, gt - bh * 0.5, bx + sway * 1.5, gt - bh);
    ctx.strokeStyle = `rgba(${12+Math.random()*8},${30+Math.random()*15},${50+Math.random()*20},0.6)`;
    ctx.lineWidth = 0.8 + Math.random() * 0.6;
    ctx.stroke();
  }
}

// ─── TREES ────────────────────────────────────────────────
function drawTree(x, baseY, height, leafR, sway) {
  const lean = sway * 1.8;
  // Trunk
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + lean * 0.3, baseY - height * 0.5, x + lean, baseY - height);
  ctx.strokeStyle = rgb(PALETTE.treeTrunk, 0.9);
  ctx.lineWidth = height * 0.045;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Canopy — layered blobs
  const topX = x + lean, topY = baseY - height;
  [1.0, 0.82, 0.68].forEach((scale, i) => {
    const offX = [0, -leafR*0.3, leafR*0.25][i];
    const offY = [0, leafR*0.2, leafR*0.15][i];
    const g = ctx.createRadialGradient(
      topX+offX, topY+offY, 0,
      topX+offX, topY+offY, leafR*scale
    );
    g.addColorStop(0, rgb(lerpRGB(PALETTE.treeLeaf, [20,35,60], 0.3), 0.9));
    g.addColorStop(1, rgb(PALETTE.treeLeaf, 0));
    ctx.beginPath();
    ctx.ellipse(topX+offX, topY+offY, leafR*scale*0.85, leafR*scale, 0, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
  });
}

function drawTrees() {
  const baseY = H * 0.545;
  const sway  = Math.sin(t * 0.018) * 1;

  // Left cluster
  drawTree(W*0.06, baseY, H*0.22, H*0.065, sway);
  drawTree(W*0.11, baseY, H*0.28, H*0.075, sway * 0.9);
  drawTree(W*0.03, baseY, H*0.16, H*0.048, sway * 1.1);

  // Right cluster
  drawTree(W*0.88, baseY, H*0.26, H*0.07,  -sway);
  drawTree(W*0.94, baseY, H*0.2,  H*0.055, -sway * 1.1);
  drawTree(W*0.82, baseY, H*0.19, H*0.052, -sway * 0.8);
}

// ─── FIREFLIES ────────────────────────────────────────────
const FLIES = Array.from({length: 28}, () => ({
  x: 0.05 + Math.random() * 0.9,
  y: 0.35 + Math.random() * 0.22,
  phase: Math.random() * Math.PI * 2,
  speed: 0.3 + Math.random() * 0.5,
  drift: (Math.random() - 0.5) * 0.00015,
  driftY: (Math.random() - 0.5) * 0.00008,
  r: 1.2 + Math.random() * 1.4,
  hue: 55 + Math.random() * 25,
}));

function drawFireflies() {
  FLIES.forEach(f => {
    f.x += f.drift + Math.sin(t*0.01 + f.phase) * 0.0003;
    f.y += f.driftY + Math.cos(t*0.008 + f.phase*1.3) * 0.00015;
    if (f.x < 0.02) f.x = 0.98;
    if (f.x > 0.98) f.x = 0.02;
    if (f.y < 0.3) f.y = 0.55;
    if (f.y > 0.56) f.y = 0.32;

    const blink = 0.5 + 0.5 * Math.sin(t * f.speed * 0.04 + f.phase);
    const alpha = blink * blink;
    if (alpha < 0.05) return;

    const px = f.x * W, py = f.y * H;
    // Glow
    const g = ctx.createRadialGradient(px, py, 0, px, py, f.r * 5);
    g.addColorStop(0,   `hsla(${f.hue},100%,85%,${alpha * 0.9})`);
    g.addColorStop(0.4, `hsla(${f.hue},90%,70%,${alpha * 0.3})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(px, py, f.r * 5, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
    // Core
    ctx.beginPath();
    ctx.arc(px, py, f.r, 0, Math.PI*2);
    ctx.fillStyle = `hsla(${f.hue},100%,95%,${alpha})`;
    ctx.fill();
  });
}

// ─── CLOUDS (wispy) ───────────────────────────────────────
const CLOUDS = Array.from({length: 5}, () => ({
  x: Math.random(),
  y: 0.06 + Math.random() * 0.18,
  w: 0.12 + Math.random() * 0.18,
  speed: 0.00003 + Math.random() * 0.00004,
  alpha: 0.04 + Math.random() * 0.08,
}));

function drawClouds() {
  CLOUDS.forEach(c => {
    c.x += c.speed;
    if (c.x > 1.2) c.x = -0.2;
    const cx = c.x * W, cy = c.y * H, cw = c.w * W, ch = cw * 0.28;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cw*0.5);
    g.addColorStop(0, `rgba(160,190,255,${c.alpha})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw*0.5, ch*0.5, 0, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
  });
}

// ─── HORIZON GLOW ─────────────────────────────────────────
function drawHorizonGlow() {
  const hy = H * 0.52;
  const g = ctx.createRadialGradient(W*0.72, hy, 0, W*0.72, hy, W*0.35);
  g.addColorStop(0,   'rgba(80,55,30,0.18)');
  g.addColorStop(0.5, 'rgba(50,35,15,0.06)');
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, hy - H*0.1, W, H*0.15);
}

// ─── VIGNETTE ─────────────────────────────────────────────
function drawVignette() {
  const g = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(2,4,12,0.65)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ─── RENDER LOOP ──────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H);
  drawSky();
  drawClouds();
  drawStars();
  drawMoon();
  drawHorizonGlow();
  drawHills();
  drawWater();
  drawGround();
  drawTrees();
  drawFireflies();
  drawVignette();
  t++;
  requestAnimationFrame(draw);
}

draw();

// Reveal text after a moment
setTimeout(() => document.body.classList.add('revealed'), 2200);
