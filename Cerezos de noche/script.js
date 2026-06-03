'use strict';
const PI2 = Math.PI * 2;

// ── two-canvas setup ──────────────────────────────────
const cBg  = document.getElementById('cBg');
const cFx  = document.getElementById('cFx');
const ctxB = cBg.getContext('2d');
const ctxF = cFx.getContext('2d');

let W = 0, H = 0;

// ── seeded RNG ────────────────────────────────────────
function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ── lookup tables for sin/cos (256 steps) ─────────────
const SIN = new Float32Array(256);
const COS = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  SIN[i] = Math.sin(i / 256 * PI2);
  COS[i] = Math.cos(i / 256 * PI2);
}
function fsin(x) { return SIN[(x * 40.74366 & 255) + 256 & 255]; }
function fcos(x) { return COS[(x * 40.74366 & 255) + 256 & 255]; }

// ── palette ───────────────────────────────────────────
const PA = [220,160,255], PB = [255,200,240], PC = [180,100,230];
const PALS = [PA, PB, PC];

// ── STARS: pre-baked per-frame alpha lookup ───────────
// We bake 300 frames of alpha (twinkling period), index with T%300
const NUM_STARS = 180;
const STAR_X     = new Float32Array(NUM_STARS);
const STAR_Y     = new Float32Array(NUM_STARS);
const STAR_R     = new Float32Array(NUM_STARS);
const STAR_ALPHA = new Float32Array(NUM_STARS * 300); // [star*300 + frame]
const STAR_PURPLE= new Uint8Array(NUM_STARS);

(function bakeStars() {
  const r = rng(12345);
  for (let i = 0; i < NUM_STARS; i++) {
    STAR_X[i]      = r();
    STAR_Y[i]      = r() * 0.58;
    STAR_R[i]      = 0.3 + r() * 0.9;
    STAR_PURPLE[i] = r() > 0.7 ? 1 : 0;
    const phase = r() * PI2;
    const spd   = 0.4 + r() * 1.2;
    for (let f = 0; f < 300; f++) {
      const tw = Math.sin(f * spd * 0.012 + phase);
      STAR_ALPHA[i * 300 + f] = Math.max(0, 0.15 + tw * 0.4);
    }
  }
})();

// ── WATER RIPPLES: pre-baked per-frame ────────────────
// 5 ripple lines, 300 frames, sampled at N_RPTS x-points
const N_RIPPLES = 5;
const N_RPTS    = 120; // x samples (will stretch to W)
const RIPPLE_Y  = new Float32Array(N_RIPPLES * N_RPTS * 300);

(function bakeRipples() {
  for (let j = 0; j < N_RIPPLES; j++) {
    const amp  = 2 + j * 1.5;
    const freq = 0.011 - j * 0.0007;
    for (let f = 0; f < 300; f++) {
      const ph = f * 0.016 + j * 1.3;
      for (let xi = 0; xi < N_RPTS; xi++) {
        const x = xi / (N_RPTS - 1); // 0..1
        const y = Math.sin(x * freq * 800 + ph) * amp
                + Math.sin(x * freq * 800 * 2.1 - ph * 0.6) * amp * 0.35;
        RIPPLE_Y[(j * N_RPTS + xi) * 300 + f] = y;
      }
    }
  }
})();

// ── BLOSSOM PULSE: pre-baked ──────────────────────────
// pulse = 0.85 + 0.15*sin(T*0.018 + phaseOff)
// bake 350 frames × each blossom phase
const PULSE_FRAMES = 350;
const PULSE_LUT = new Float32Array(PULSE_FRAMES * 256); // 256 phase buckets
(function bakePulse() {
  for (let ph = 0; ph < 256; ph++) {
    const phOff = ph / 256 * 10;
    for (let f = 0; f < PULSE_FRAMES; f++) {
      PULSE_LUT[f * 256 + ph] = 0.85 + 0.15 * Math.sin(f * 0.018 + phOff);
    }
  }
})();

// ── branch tips storage ───────────────────────────────
const branchTips = []; // [ti] = Float32Array([x,y,x,y,...])

// ── blossom data: flat typed arrays ───────────────────
// per blossom: bx,by,ox,oy,r,cr,cg,cb,baseAlpha,phaseBucket
let BLOSSOM_DATA = null; // Float32Array, 10 floats per blossom
let BLOSSOM_COUNT = 0;

// Pre-computed rgba strings for blossoms: [idx] = {glow, core}
let BLOSSOM_STRS = null;

// ── FIREFLIES ─────────────────────────────────────────
const NUM_FLIES = 16;
const FLY = {
  x:     new Float32Array(NUM_FLIES),
  y:     new Float32Array(NUM_FLIES),
  phase: new Float32Array(NUM_FLIES),
  spd:   new Float32Array(NUM_FLIES),
  drift: new Float32Array(NUM_FLIES),
  driftY:new Float32Array(NUM_FLIES),
  r:     new Float32Array(NUM_FLIES),
  hue:   new Uint16Array(NUM_FLIES),
};
(function initFlies() {
  const r = rng(55555);
  for (let i = 0; i < NUM_FLIES; i++) {
    FLY.x[i]      = 0.05 + r() * 0.9;
    FLY.y[i]      = 0.38 + r() * 0.2;
    FLY.phase[i]  = r() * PI2;
    FLY.spd[i]    = 0.3 + r() * 0.6;
    FLY.drift[i]  = (r() - 0.5) * 0.00018;
    FLY.driftY[i] = (r() - 0.5) * 0.0001;
    FLY.r[i]      = 1.2 + r() * 1.4;
    FLY.hue[i]    = 260 + r() * 50 | 0;
  }
})();

// ── PETALS ────────────────────────────────────────────
const NUM_PETALS = 70;
const PET = {
  x:       new Float32Array(NUM_PETALS),
  y:       new Float32Array(NUM_PETALS),
  size:    new Float32Array(NUM_PETALS),
  speedY:  new Float32Array(NUM_PETALS),
  speedX:  new Float32Array(NUM_PETALS),
  swing:   new Float32Array(NUM_PETALS),
  swingA:  new Float32Array(NUM_PETALS),
  swingS:  new Float32Array(NUM_PETALS),
  rot:     new Float32Array(NUM_PETALS),
  rotS:    new Float32Array(NUM_PETALS),
  r:       new Uint8Array(NUM_PETALS),
  g:       new Uint8Array(NUM_PETALS),
  b:       new Uint8Array(NUM_PETALS),
  alpha:   new Float32Array(NUM_PETALS),
};
// Pre-baked color strings per petal (never regenerated)
const PET_COLOR = new Array(NUM_PETALS);
(function initPetals() {
  const r = rng(99999);
  for (let i = 0; i < NUM_PETALS; i++) {
    const c = PALS[Math.floor(r() * 3)];
    PET.x[i]      = r();
    PET.y[i]      = r();
    PET.size[i]   = 1.5 + r() * 3;
    PET.speedY[i] = 0.0004 + r() * 0.0008;
    PET.speedX[i] = (r() - 0.5) * 0.0003;
    PET.swing[i]  = r() * PI2;
    PET.swingA[i] = 0.001 + r() * 0.002;
    PET.swingS[i] = 0.008 + r() * 0.015;
    PET.rot[i]    = r() * PI2;
    PET.rotS[i]   = (r() - 0.5) * 0.04;
    PET.r[i]      = c[0]; PET.g[i] = c[1]; PET.b[i] = c[2];
    PET.alpha[i]  = 0.4 + r() * 0.5;
    PET_COLOR[i]  = `rgba(${c[0]},${c[1]},${c[2]},`;
  }
})();

// ── BUILD STATIC BACKGROUND ───────────────────────────
function buildBg() {
  ctxB.clearRect(0, 0, W, H);

  // Sky
  const sg = ctxB.createLinearGradient(0, 0, 0, H * 0.54);
  sg.addColorStop(0,   '#020008');
  sg.addColorStop(0.45,'#0a0418');
  sg.addColorStop(0.82,'#1a0835');
  sg.addColorStop(1,   '#2a0a45');
  ctxB.fillStyle = sg;
  ctxB.fillRect(0, 0, W, H * 0.54 + 2);

  // Stars (single pass, low detail — static bg)
  const r = rng(12345);
  const sr = rng(12345);
  for (let i = 0; i < NUM_STARS; i++) {
    const sx = STAR_X[i] * W, sy = STAR_Y[i] * H;
    const sa = STAR_ALPHA[i * 300]; // frame 0 alpha for static bg
    ctxB.fillStyle = STAR_PURPLE[i]
      ? `rgba(200,150,255,${sa.toFixed(2)})`
      : `rgba(230,215,255,${sa.toFixed(2)})`;
    ctxB.beginPath();
    ctxB.arc(sx, sy, STAR_R[i], 0, PI2);
    ctxB.fill();
  }

  // Moon
  const mx = W * 0.75, my = H * 0.14;
  const mr = Math.min(W, H) * 0.048;
  const auras = [0.03, 0.06, 0.10, 0.15, 0.22];
  auras.forEach((a, i) => {
    const sz = mr * (5.5 - i * 0.7);
    const g  = ctxB.createRadialGradient(mx, my, 0, mx, my, sz);
    g.addColorStop(0,  `rgba(160,80,255,${a})`);
    g.addColorStop(0.4,`rgba(100,40,200,${(a*0.4).toFixed(3)})`);
    g.addColorStop(1,  'rgba(0,0,0,0)');
    ctxB.fillStyle = g;
    ctxB.beginPath(); ctxB.arc(mx, my, sz, 0, PI2); ctxB.fill();
  });
  const mg = ctxB.createRadialGradient(mx-mr*0.3, my-mr*0.3, mr*0.05, mx, my, mr);
  mg.addColorStop(0,  'rgba(250,245,255,1)');
  mg.addColorStop(0.5,'rgba(230,215,255,1)');
  mg.addColorStop(1,  'rgba(190,160,240,.95)');
  ctxB.fillStyle = mg;
  ctxB.beginPath(); ctxB.arc(mx, my, mr, 0, PI2); ctxB.fill();

  // Hills
  const hy = H * 0.54, pts = 60;
  ctxB.beginPath();
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * W;
    const y = hy - H*0.12*(0.5 + 0.5*Math.sin(i*0.15) + 0.3*Math.sin(i*0.31+1.2) + 0.15*Math.sin(i*0.6+0.5));
    i === 0 ? ctxB.moveTo(x,y) : ctxB.lineTo(x,y);
  }
  ctxB.lineTo(W,hy); ctxB.lineTo(0,hy); ctxB.closePath();
  const hg1 = ctxB.createLinearGradient(0, hy-H*0.12, 0, hy);
  hg1.addColorStop(0,'#1e0838'); hg1.addColorStop(1,'#130525');
  ctxB.fillStyle = hg1; ctxB.fill();

  ctxB.beginPath();
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * W;
    const y = hy+H*0.03 - H*0.08*(0.5 + 0.4*Math.sin(i*0.2+2) + 0.25*Math.sin(i*0.4+0.8));
    i === 0 ? ctxB.moveTo(x,y) : ctxB.lineTo(x,y);
  }
  ctxB.lineTo(W,H); ctxB.lineTo(0,H); ctxB.closePath();
  const hg2 = ctxB.createLinearGradient(0, hy, 0, H);
  hg2.addColorStop(0,'#0e0320'); hg2.addColorStop(1,'#04020a');
  ctxB.fillStyle = hg2; ctxB.fill();

  // Ground
  const gt = H*0.57, gb = H*0.64;
  const gg = ctxB.createLinearGradient(0, gt, 0, gb);
  gg.addColorStop(0,'#100328'); gg.addColorStop(1,'#06010e');
  ctxB.fillStyle = gg;
  ctxB.fillRect(0, gt, W, gb-gt);

  // Ground petals (static scatter)
  const gr = rng(777);
  for (let i = 0; i < 50; i++) {
    const gx = gr() * W, gy = gt + gr()*(gb-gt)*0.7;
    const gs = 1 + gr() * 2.5;
    const c  = PALS[Math.floor(gr()*3)];
    ctxB.save();
    ctxB.translate(gx, gy); ctxB.rotate(gr()*PI2);
    ctxB.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(0.12+gr()*0.18).toFixed(2)})`;
    ctxB.beginPath(); ctxB.ellipse(0,0,gs*0.4,gs,0,0,PI2); ctxB.fill();
    ctxB.restore();
  }

  // Trees
  buildTrees();
}

// ── BUILD TREES ───────────────────────────────────────
const TREES_CFG = [
  {x:.08,scale:1.0, flip:false,seed:42},
  {x:.18,scale:.82, flip:false,seed:77},
  {x:.03,scale:.70, flip:false,seed:13},
  {x:.92,scale:.95, flip:true, seed:99},
  {x:.82,scale:.78, flip:true, seed:55},
  {x:.96,scale:.65, flip:true, seed:31},
];

function buildTrees() {
  const tipsTemp = [];
  const baseY = H * 0.585;

  TREES_CFG.forEach((tr, ti) => {
    const tips = [];
    const r = rng(tr.seed);
    const trH = H * 0.28 * tr.scale;

    function branch(x, y, angle, len, depth) {
      if (depth === 0 || len < 3) return;
      const ex = x + Math.cos(angle) * len;
      const ey = y + Math.sin(angle) * len;
      ctxB.beginPath(); ctxB.moveTo(x,y); ctxB.lineTo(ex,ey);
      ctxB.strokeStyle = depth > 2
        ? `rgba(14,4,28,${Math.min(1, 0.75+depth*0.03).toFixed(2)})`
        : 'rgba(22,6,40,.8)';
      ctxB.lineWidth = Math.max(0.8, depth * 1.3);
      ctxB.lineCap = 'round';
      ctxB.stroke();
      if (depth <= 2) tips.push(ex, ey);
      const s1=r(), s2=r();
      const d1=(0.22+s1*0.18)*(tr.flip?1:-1);
      const d2=(0.18+s2*0.14)*(tr.flip?-1:1);
      branch(ex,ey,angle+d1,len*(0.62+r()*0.1),depth-1);
      branch(ex,ey,angle+d2,len*(0.65+r()*0.1),depth-1);
      if(depth>3) branch(ex,ey,angle-d1*0.3,len*0.55,depth-1);
    }

    branch(tr.x*W, baseY, -Math.PI/2+(tr.flip?.12:-.12), trH, 7);
    tipsTemp[ti] = new Float32Array(tips);
  });

  // Store tips globally
  for (let ti = 0; ti < TREES_CFG.length; ti++) branchTips[ti] = tipsTemp[ti];

  // Build blossom data from tips
  buildBlossomData();
}

function buildBlossomData() {
  const temp = [];
  TREES_CFG.forEach((tr, ti) => {
    const tips = branchTips[ti];
    const r = rng(tr.seed + 1000);
    for (let j = 0; j < tips.length; j += 2) {
      const bx = tips[j], by = tips[j+1];
      const count = 3 + Math.floor(r() * 4);
      for (let k = 0; k < count; k++) {
        temp.push(
          bx + (r()-0.5)*22,  // ox offset already baked in
          by + (r()-0.5)*22,
          2.5 + r()*5,        // r
          Math.round(PA[0] + (PB[0]-PA[0])*r()),
          Math.round(PA[1] + (PB[1]-PA[1])*r()),
          Math.round(PA[2] + (PB[2]-PA[2])*r()),
          0.55 + r()*0.35,    // baseAlpha
          Math.floor(r() * 256), // phaseBucket 0-255
        );
      }
    }
  });
  BLOSSOM_COUNT = temp.length / 8;
  BLOSSOM_DATA  = new Float32Array(temp);

  // Pre-bake rgba strings (only do this once)
  BLOSSOM_STRS = new Array(BLOSSOM_COUNT);
  for (let i = 0; i < BLOSSOM_COUNT; i++) {
    const off = i * 8;
    const cr = BLOSSOM_DATA[off+3]|0;
    const cg = BLOSSOM_DATA[off+4]|0;
    const cb = BLOSSOM_DATA[off+5]|0;
    BLOSSOM_STRS[i] = `rgba(${cr},${cg},${cb},`;
  }
}

// ── ANIMATED FRAME DRAW ───────────────────────────────
let T = 0;
// Reuse gradient references to avoid GC churn
let _waterGrad = null;

function drawFrame() {
  const f300 = T % 300;
  const fPulse = T % PULSE_FRAMES;
  ctxF.clearRect(0, 0, W, H);

  // ── Water base
  const wt = H * 0.62;
  if (!_waterGrad) {
    _waterGrad = ctxF.createLinearGradient(0, wt, 0, H);
    _waterGrad.addColorStop(0,  '#12052a');
    _waterGrad.addColorStop(0.4,'#08021a');
    _waterGrad.addColorStop(1,  '#020008');
  }
  ctxF.fillStyle = _waterGrad;
  ctxF.fillRect(0, wt, W, H - wt);

  // Moon shimmer — single polygon, step 6px
  const rx = W * 0.75;
  ctxF.save();
  ctxF.beginPath();
  for (let y = wt; y < H; y += 6) {
    const p  = (y - wt) / (H - wt);
    const ww = W * 0.06 * (0.3 + p * 1.5);
    const wb = fsin(y * 0.07 * 0.159 + T * 0.02 * 0.159) * 5 * p;
    ctxF.rect(rx - ww*0.5 + wb, y, ww, 6);
  }
  const rg = ctxF.createLinearGradient(0, wt, 0, H);
  rg.addColorStop(0,  'rgba(180,120,255,.28)');
  rg.addColorStop(0.5,'rgba(140,80,220,.12)');
  rg.addColorStop(1,  'rgba(100,40,180,.04)');
  ctxF.fillStyle = rg;
  ctxF.fill();
  ctxF.restore();

  // Ripples — pre-baked y offsets
  for (let j = 0; j < N_RIPPLES; j++) {
    const ry = wt + (H - wt) * (0.1 + j * 0.16);
    const base = (j * N_RPTS) * 300 + f300;
    ctxF.beginPath();
    for (let xi = 0; xi < N_RPTS; xi++) {
      const x  = (xi / (N_RPTS-1)) * W;
      const dy = RIPPLE_Y[base + xi * 300];
      xi === 0 ? ctxF.moveTo(x, ry+dy) : ctxF.lineTo(x, ry+dy);
    }
    ctxF.strokeStyle = `rgba(130,70,200,${(0.03+j*0.014).toFixed(3)})`;
    ctxF.lineWidth = 1;
    ctxF.stroke();
  }

  // ── Fog (cheap, just 3 blobs)
  const fy = H * 0.565;
  for (let i = 0; i < 3; i++) {
    const fx    = W * (0.15 + i * 0.3);
    const fw    = W * 0.28;
    const drift = fsin((T * 0.008 + i * 1.4) * 0.159) * 10;
    const fg    = ctxF.createRadialGradient(fx+drift, fy, 0, fx+drift, fy, fw);
    fg.addColorStop(0,  'rgba(50,15,90,.05)');
    fg.addColorStop(1,  'rgba(0,0,0,0)');
    ctxF.fillStyle = fg;
    ctxF.beginPath();
    ctxF.ellipse(fx+drift, fy, fw, H*0.035, 0, 0, PI2);
    ctxF.fill();
  }

  // ── Blossoms — batch same-color draws using pre-baked strings
  const pIdx = fPulse * 256;
  for (let i = 0; i < BLOSSOM_COUNT; i++) {
    const off = i * 8;
    const bx  = BLOSSOM_DATA[off];
    const by  = BLOSSOM_DATA[off+1];
    const r   = BLOSSOM_DATA[off+2];
    const ba  = BLOSSOM_DATA[off+6];
    const ph  = BLOSSOM_DATA[off+7] | 0;
    const pulse = PULSE_LUT[pIdx + ph];
    const alpha = ba * pulse;
    const cs  = BLOSSOM_STRS[i];

    // Skip glow for tiny blossoms
    if (r > 3) {
      const g = ctxF.createRadialGradient(bx,by,0,bx,by,r*2.2);
      g.addColorStop(0, cs + (alpha*0.35).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctxF.fillStyle = g;
      ctxF.beginPath(); ctxF.arc(bx, by, r*2.2, 0, PI2); ctxF.fill();
    }
    ctxF.fillStyle = cs + alpha.toFixed(3) + ')';
    ctxF.beginPath(); ctxF.arc(bx, by, r*pulse, 0, PI2); ctxF.fill();
  }

  // ── Petals
  for (let i = 0; i < NUM_PETALS; i++) {
    PET.swing[i] += PET.swingS[i];
    PET.x[i]     += PET.speedX[i] + fsin(PET.swing[i] * 0.159) * PET.swingA[i];
    PET.y[i]     += PET.speedY[i];
    PET.rot[i]   += PET.rotS[i];
    if (PET.y[i] > 1.05) { PET.y[i] = -0.05; PET.x[i] = Math.random(); }
    if (PET.x[i] < -0.02) PET.x[i] = 1.02;
    else if (PET.x[i] > 1.02) PET.x[i] = -0.02;

    const px = PET.x[i]*W, py = PET.y[i]*H;
    const sz = PET.size[i];
    ctxF.save();
    ctxF.translate(px, py);
    ctxF.rotate(PET.rot[i]);
    if (sz > 2.5) {
      const gg = ctxF.createRadialGradient(0,0,0,0,0,sz*2.4);
      gg.addColorStop(0, PET_COLOR[i] + (PET.alpha[i]*0.28).toFixed(2) + ')');
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctxF.fillStyle = gg;
      ctxF.beginPath(); ctxF.arc(0,0,sz*2.4,0,PI2); ctxF.fill();
    }
    ctxF.fillStyle = PET_COLOR[i] + PET.alpha[i].toFixed(2) + ')';
    ctxF.beginPath(); ctxF.ellipse(0,0,sz*0.45,sz,0,0,PI2); ctxF.fill();
    ctxF.restore();
  }

  // ── Fireflies
  for (let i = 0; i < NUM_FLIES; i++) {
    FLY.x[i] += FLY.drift[i]  + fsin((T*0.009+FLY.phase[i])*0.159)*0.00025;
    FLY.y[i] += FLY.driftY[i] + fcos((T*0.007+FLY.phase[i]*1.2)*0.159)*0.00012;
    if (FLY.x[i] < 0.02) FLY.x[i] = 0.98;
    else if (FLY.x[i] > 0.98) FLY.x[i] = 0.02;
    if (FLY.y[i] > 0.58) FLY.y[i] = 0.38;
    else if (FLY.y[i] < 0.35) FLY.y[i] = 0.56;

    const bv = 0.5 + 0.5*Math.sin(T*FLY.spd[i]*0.038+FLY.phase[i]);
    const blinkVal = bv*bv;
    if (blinkVal < 0.06) continue;
    const px = FLY.x[i]*W, py = FLY.y[i]*H;
    const hue = FLY.hue[i];
    const a1  = (blinkVal*0.85).toFixed(2);
    const a2  = (blinkVal*0.22).toFixed(2);
    const g   = ctxF.createRadialGradient(px,py,0,px,py,FLY.r[i]*6);
    g.addColorStop(0,  `hsla(${hue},100%,80%,${a1})`);
    g.addColorStop(0.4,`hsla(${hue},80%,65%,${a2})`);
    g.addColorStop(1,  'rgba(0,0,0,0)');
    ctxF.fillStyle = g;
    ctxF.beginPath(); ctxF.arc(px,py,FLY.r[i]*6,0,PI2); ctxF.fill();
    ctxF.fillStyle = `hsla(${hue},100%,95%,${blinkVal.toFixed(2)})`;
    ctxF.beginPath(); ctxF.arc(px,py,FLY.r[i],0,PI2); ctxF.fill();
  }

  // ── Vignette (cheap — just one gradient)
  const vg = ctxF.createRadialGradient(W/2,H/2,H*0.15,W/2,H/2,H*0.88);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,'rgba(2,0,8,.72)');
  ctxF.fillStyle = vg;
  ctxF.fillRect(0,0,W,H);

  T++;
  requestAnimationFrame(drawFrame);
}

// ── INIT ─────────────────────────────────────────────
function init() {
  W = cBg.width = cFx.width  = window.innerWidth;
  H = cBg.height= cFx.height = window.innerHeight;
  _waterGrad = null;
  buildBg();
  drawFrame();
}

init();
window.addEventListener('resize', () => {
  _waterGrad = null;
  W = cBg.width = cFx.width  = window.innerWidth;
  H = cBg.height= cFx.height = window.innerHeight;
  buildBg();
});
setTimeout(() => document.body.classList.add('show'), 2800);
