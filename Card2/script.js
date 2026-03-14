// ── STAR FIELD ──
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let W, H, stars = [];

function initStars() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  stars = Array.from({length: 160}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.4 + 0.2,
    a: Math.random(),
    sp: 0.003 + Math.random()*0.008,
    ph: Math.random()*Math.PI*2
  }));
}

function drawStars(t) {
  ctx.clearRect(0,0,W,H);
  stars.forEach(s => {
    const a = s.a * (0.5 + 0.5*Math.sin(t*s.sp + s.ph));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(240,232,216,${a})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}

initStars();
requestAnimationFrame(drawStars);
window.addEventListener('resize', initStars);

// ── FALLING 🌙 & ✦ ──
const symbols = ['🌙','✦','✧','⋆','♦'];
for(let i=0; i<16; i++){
  const el = document.createElement('div');
  el.className='falling';
  el.style.cssText=`
    left:${Math.random()*100}vw;
    font-size:${8+Math.random()*12}px;
    color:rgba(201,144,58,${0.3+Math.random()*0.4});
    animation-duration:${9+Math.random()*10}s;
    animation-delay:${Math.random()*12}s;
    text-shadow:0 0 6px rgba(201,144,58,0.5);
  `;
  el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
  document.body.appendChild(el);
}

// ── CLICK SPARKLE ──
const sparkSyms = ['🌙','✦','❤️','⭐','🖤','✧'];
document.getElementById('card').addEventListener('click', e => {
  for(let i=0;i<9;i++){
    const s = document.createElement('div');
    s.textContent = sparkSyms[Math.floor(Math.random()*sparkSyms.length)];
    s.style.cssText=`
      position:fixed;
      left:${e.clientX+(Math.random()-.5)*120}px;
      top:${e.clientY+(Math.random()-.5)*120}px;
      font-size:${11+Math.random()*16}px;
      pointer-events:none; z-index:9999;
      animation:sparkBurst 1s ease-out forwards;
    `;
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),1000);
  }
});

// inject keyframe (already handled in CSS, but keeping JS logic if needed for dynamic injection)
// const st = document.createElement('style');
// st.textContent=`@keyframes sparkBurst{0%{opacity:1;transform:scale(0.2) translateY(0)}100%{opacity:0;transform:scale(2) translateY(-50px)}}`;
// document.head.appendChild(st);
