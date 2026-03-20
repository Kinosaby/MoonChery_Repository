document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('cover').classList.add('hide');
  window.scrollTo({ top: 0, behavior: 'instant' });
});

const ids = [
  'cover', 'ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'ch-6', 'ch-7', 'ch-8', 'ch-9', 'ch-10',
  'ch-11', 'ch-12', 'ch-13', 'ch-14', 'ch-15', 'ch-16', 'ch-17', 'ch-18', 'ch-19', 'ch-20', 'fin'
];

const dots = document.querySelectorAll('.nav-dot');
const prog = document.getElementById('progress');

window.addEventListener('scroll', () => {
  const s = window.scrollY, t = document.body.scrollHeight - window.innerHeight;
  prog.style.width = (s / t * 100) + '%';
  let a = 0;
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && s >= el.offsetTop - window.innerHeight / 2) a = i;
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === a));
});

dots.forEach((d, i) => {
  d.addEventListener('click', () => {
    if (i === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById('cover').classList.remove('hide');
    } else {
      document.getElementById('cover').classList.add('hide');
      document.getElementById(ids[i])?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const revs = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(e => {
  e.forEach(r => {
    if (r.isIntersecting) {
      r.target.classList.add('visible');
      obs.unobserve(r.target);
    }
  });
}, { threshold: .07 });
revs.forEach(r => obs.observe(r));

const bc = document.getElementById('bg-canvas'), bx = bc.getContext('2d');
let bW, bH, pts = [];

function initB() {
  bW = bc.width = window.innerWidth;
  bH = bc.height = window.innerHeight;
  pts = Array.from({ length: 120 }, () => ({
    x: Math.random() * bW,
    y: Math.random() * bH,
    r: Math.random() * .8 + .15,
    a: Math.random() * .2 + .04,
    sp: .0006 + Math.random() * .002,
    ph: Math.random() * Math.PI * 2,
    kind: Math.floor(Math.random() * 4)
  }));
}

function drawB(t) {
  bx.clearRect(0, 0, bW, bH);
  const gr = bx.createRadialGradient(bW * .5, bH * .5, 0, bW * .5, bH * .5, bH * .55);
  gr.addColorStop(0, 'rgba(42,56,112,.05)');
  gr.addColorStop(1, 'transparent');
  bx.fillStyle = gr;
  bx.fillRect(0, 0, bW, bH);
  pts.forEach(p => {
    const a = p.a * (.3 + .7 * Math.sin(t * p.sp + p.ph));
    bx.globalAlpha = a;
    bx.beginPath();
    bx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    if (p.kind === 0) bx.fillStyle = 'rgba(232,224,240,1)';
    else if (p.kind === 1) bx.fillStyle = 'rgba(74,96,192,1)';
    else if (p.kind === 2) bx.fillStyle = 'rgba(212,168,80,1)';
    else bx.fillStyle = 'rgba(192,64,96,1)';
    bx.fill();
  });
  bx.globalAlpha = 1;
  requestAnimationFrame(drawB);
}

initB();
requestAnimationFrame(drawB);
window.addEventListener('resize', initB);
