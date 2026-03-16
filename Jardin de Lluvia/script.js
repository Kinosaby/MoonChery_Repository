// ══════════════════════════════
//  FLOWERS DATA
// ══════════════════════════════
const FLOWERS = [
  // [xPercent, stemHeight, petalColor1, petalColor2, centerColor, swayDuration, swayDelay, size]
  [5,  110, '#E84878','#C82848','#2a0818', 3.8, 0,   42],
  [12, 90,  '#F5C518','#E8A010','#1a1005', 3.2, .5,  36],
  [20, 130, '#E8721A','#C85010','#1a0808', 4.1, 1,   48],
  [29, 80,  '#E84878','#C02858','#1a0810', 3.5, .3,  32],
  [38, 150, '#F5C518','#E8B010','#1a1008', 4.4, .8,  54],
  [47, 100, '#C82828','#A01818','#100808', 3.7, 1.2, 40],
  [56, 120, '#E8721A','#D06018','#180a04', 3.3, .6,  44],
  [65, 85,  '#E84878','#D03060','#1a0815', 4.0, .2,  34],
  [74, 140, '#F5C518','#EAB008','#181205', 3.6, .9,  50],
  [82, 95,  '#C82828','#B01820','#120808', 4.2, .4,  38],
  [90, 115, '#E8721A','#CC5810','#180a04', 3.9, 1.1, 46],
  [96, 75,  '#E84878','#CC2855','#1a0812', 3.4, .7,  30],
];

const layer = document.getElementById('flowers-layer');

FLOWERS.forEach(([xp, stemH, pc1, pc2, cc, swayDur, swayDel, sz], idx) => {
  const wrap = document.createElement('div');
  wrap.className = 'stem';
  wrap.style.cssText = `left:${xp}%;animation:stemSway ${swayDur}s ease-in-out ${swayDel}s infinite alternate;`;

  // stem
  const stemBody = document.createElement('div');
  stemBody.className = 'stem-body';
  stemBody.style.height = stemH + 'px';

  // leaves
  const leafL = document.createElement('div');
  leafL.className = 'leaf left';
  leafL.style.top = (stemH * .4) + 'px';
  const leafR = document.createElement('div');
  leafR.className = 'leaf right';
  leafR.style.top = (stemH * .65) + 'px';
  stemBody.appendChild(leafL);
  stemBody.appendChild(leafR);

  // flower head SVG
  const head = document.createElement('div');
  head.className = 'flower-head';
  head.style.cssText = `width:${sz}px;height:${sz}px;animation-duration:${swayDur}s;animation-delay:${swayDel}s;`;

  // build gerbera SVG
  const nPetals = 12;
  let petalsOuter = '', petalsInner = '';
  for(let i=0;i<nPetals;i++){
    const angle = (i/nPetals)*360;
    petalsOuter += `<ellipse cx="50" cy="18" rx="6" ry="18" fill="${pc1}" opacity=".95" transform="rotate(${angle} 50 50)"/>`;
  }
  for(let i=0;i<nPetals;i++){
    const angle = (i/nPetals)*360 + 15;
    petalsInner += `<ellipse cx="50" cy="24" rx="4" ry="12" fill="${pc2}" opacity=".85" transform="rotate(${angle} 50 50)"/>`;
  }

  head.innerHTML = `
    <svg width="${sz}" height="${sz}" viewBox="0 0 100 100"
      style="filter:drop-shadow(0 4px 12px rgba(0,0,0,.35));">
      ${petalsOuter}
      ${petalsInner}
      <circle cx="50" cy="50" r="16" fill="${cc}"/>
      <circle cx="50" cy="50" r="11" fill="${cc}" opacity=".7"
        style="filter:brightness(1.3)"/>
      <!-- water droplet on center -->
      <ellipse cx="50" cy="44" rx="4" ry="5.5"
        fill="rgba(150,210,250,.5)"/>
    </svg>
  `;

  wrap.appendChild(head);
  wrap.appendChild(stemBody);
  layer.appendChild(wrap);

  // periodic drop on flower
  setInterval(() => {
    const drop = document.createElement('div');
    drop.className = 'flower-drop';
    drop.style.cssText = `
      left:${Math.random()*sz}px;
      top:${sz*.6}px;
      animation-duration:${.6+Math.random()*.4}s;
    `;
    head.appendChild(drop);
    setTimeout(()=>drop.remove(), 1000);
  }, 800 + Math.random()*2000 + idx*200);
});

// stem sway keyframe
const st = document.createElement('style');
st.textContent = `
  @keyframes stemSway {
    from { transform: rotate(-4deg); }
    to   { transform: rotate(4deg); }
  }
`;
document.head.appendChild(st);

// ══════════════════════════════
//  RAIN
// ══════════════════════════════
const rainCanvas = document.getElementById('rain');
const rctx = rainCanvas.getContext('2d');
let W, H, drops = [];

function initRain() {
  W = rainCanvas.width  = window.innerWidth;
  H = rainCanvas.height = window.innerHeight;
  drops = Array.from({length: 280}, () => newDrop());
}

function newDrop(fromTop=false) {
  return {
    x: Math.random()*W,
    y: fromTop ? 0 : Math.random()*H,
    len: 8 + Math.random()*14,
    speed: 8 + Math.random()*10,
    opacity: .15 + Math.random()*.35,
    width: .5 + Math.random()*.8,
  };
}

function drawRain() {
  rctx.clearRect(0,0,W,H);
  drops.forEach(d => {
    rctx.save();
    rctx.globalAlpha = d.opacity;
    rctx.strokeStyle = 'rgba(150,210,255,1)';
    rctx.lineWidth = d.width;
    rctx.lineCap = 'round';
    rctx.beginPath();
    rctx.moveTo(d.x, d.y);
    rctx.lineTo(d.x - 1, d.y + d.len);
    rctx.stroke();
    rctx.restore();

    d.y += d.speed;
    d.x -= .5;

    if(d.y > H) {
      // splash ripple at ground
      if(d.y < H*1.1) spawnSplash(d.x, H*.7);
      Object.assign(d, newDrop(true));
      d.x = Math.random()*W;
    }
  });
  requestAnimationFrame(drawRain);
}

// ── SPLASHES
const splashCanvas = document.createElement('canvas');
splashCanvas.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:4;';
document.getElementById('scene').appendChild(splashCanvas);
const spctx = splashCanvas.getContext('2d');
let splashes = [];

function spawnSplash(x,y) {
  if(Math.random()>.3) return;
  splashes.push({x,y,r:0,maxR:4+Math.random()*6,opacity:.5,speed:.4+Math.random()*.3});
}

function drawSplashes() {
  spctx.clearRect(0,0,W,H);
  splashes = splashes.filter(s=>s.opacity>0);
  splashes.forEach(s=>{
    spctx.save();
    spctx.globalAlpha=s.opacity;
    spctx.strokeStyle='rgba(150,210,255,1)';
    spctx.lineWidth=.8;
    spctx.beginPath();
    spctx.ellipse(s.x,s.y,s.r,s.r*.4,0,0,Math.PI*2);
    spctx.stroke();
    spctx.restore();
    s.r+=s.speed;
    s.opacity-=.04;
  });
  requestAnimationFrame(drawSplashes);
}

function resizeAll() {
  W = window.innerWidth; H = window.innerHeight;
  rainCanvas.width = splashCanvas.width = W;
  rainCanvas.height = splashCanvas.height = H;
}

window.addEventListener('resize',()=>{resizeAll();initRain();});
initRain();
drawRain();
drawSplashes();

// ══════════════════════════════
//  LIGHTNING
// ══════════════════════════════
const lCanvas  = document.getElementById('lightning-canvas');
const lctx     = lCanvas.getContext('2d');
const thunder  = document.getElementById('thunder');

function resizeLightning(){
  lCanvas.width=window.innerWidth;
  lCanvas.height=window.innerHeight;
}
resizeLightning();
window.addEventListener('resize',resizeLightning);

function drawBolt(x1,y1,x2,y2,width,depth){
  if(depth===0||width<.3)return;
  const mx=(x1+x2)/2+(Math.random()-.5)*(Math.abs(x2-x1)+Math.abs(y2-y1))*.4;
  const my=(y1+y2)/2+(Math.random()-.5)*60;
  lctx.save();
  lctx.strokeStyle=`rgba(200,230,255,${.6+Math.random()*.4})`;
  lctx.lineWidth=width;
  lctx.shadowColor='rgba(150,200,255,.8)';
  lctx.shadowBlur=20;
  lctx.lineCap='round';
  lctx.beginPath();lctx.moveTo(x1,y1);lctx.lineTo(mx,my);lctx.stroke();
  lctx.beginPath();lctx.moveTo(mx,my);lctx.lineTo(x2,y2);lctx.stroke();
  lctx.restore();
  drawBolt(x1,y1,mx,my,width*.6,depth-1);
  drawBolt(mx,my,x2,y2,width*.6,depth-1);
  if(Math.random()>.6){
    const bx=mx+(Math.random()-.5)*100, by=my+50+Math.random()*100;
    drawBolt(mx,my,bx,by,width*.4,depth-2);
  }
}

function lightning(){
  lctx.clearRect(0,0,lCanvas.width,lCanvas.height);
  const x=lCanvas.width*.2+Math.random()*lCanvas.width*.6;
  drawBolt(x,0,x+(Math.random()-.5)*200,lCanvas.height*.5,2.5,6);

  // flash
  thunder.style.opacity='.15';
  setTimeout(()=>{thunder.style.opacity='0';},80);
  setTimeout(()=>{thunder.style.opacity='.08';},140);
  setTimeout(()=>{thunder.style.opacity='0';},220);
  setTimeout(()=>lctx.clearRect(0,0,lCanvas.width,lCanvas.height),500);
}

// random lightning
function scheduleLightning(){
  setTimeout(()=>{
    lightning();
    scheduleLightning();
  }, 5000+Math.random()*12000);
}
setTimeout(scheduleLightning,2000);
