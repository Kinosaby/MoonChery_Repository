// STARS
const canvas = document.getElementById('bg-canvas'),
  ctx = canvas.getContext('2d');
let W, H, stars = [];

function init() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  stars = Array.from({
    length: 180
  }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.2 + .2,
    a: Math.random() * .7 + .1,
    sp: .002 + Math.random() * .007,
    ph: Math.random() * Math.PI * 2
  }));
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  stars.forEach(s => {
    const a = s.a * (.45 + .55 * Math.sin(t * s.sp + s.ph));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245,236,224,${a})`;
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
init();
requestAnimationFrame(draw);
window.addEventListener('resize', init);

// PETALS
const cols = ['#c43060', '#d45080', '#e8b840', '#c8903a', '#d4504a'];
for (let i = 0; i < 18; i++) {
  const p = document.createElement('div');
  p.className = 'petal';
  const c = cols[Math.floor(Math.random() * cols.length)],
    sz = 6 + Math.random() * 9;
  p.innerHTML = `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="4" ry="9" fill="${c}" opacity=".6" transform="rotate(${Math.random()*360} 10 10)"/></svg>`;
  p.style.cssText = `left:${Math.random()*100}vw;animation-duration:${8+Math.random()*10}s;animation-delay:${Math.random()*14}s;`;
  document.body.appendChild(p);
}
