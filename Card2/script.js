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

// ── PDF EXPORT ──
document.getElementById('downloadPdf').addEventListener('click', () => {
  const element = document.getElementById('card');
  
  const opt = {
    margin:       0,
    filename:     'Viernes13_Piojito.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 3, 
      useCORS: true,
      backgroundColor: '#0a0608',
      scrollY: 0,
      windowWidth: 560,
      onclone: (clonedDoc) => {
        // En el documento clonado, forzamos que todo sea visible
        const clonedCard = clonedDoc.getElementById('card');
        clonedCard.style.opacity = '1';
        clonedCard.style.transform = 'none';
        clonedCard.style.animation = 'none';
        clonedCard.style.backdropFilter = 'none';
        clonedCard.style.background = '#120d13';

        // Forzamos visibilidad de todos los hijos que tienen animaciones fadeUp
        const children = clonedCard.querySelectorAll('*');
        children.forEach(child => {
          child.style.opacity = '1';
          child.style.transform = 'none';
          child.style.animation = 'none';
          child.style.transition = 'none';
          
          // Aseguramos que el texto sea color crema sólido
          if (child.classList.contains('message') || 
              child.classList.contains('quote')   || 
              child.classList.contains('promise') || 
              child.classList.contains('sig-from')) {
            child.style.color = '#f0e8d8';
          }
        });
      }
    },
    jsPDF:        { unit: 'pt', format: 'letter', orientation: 'portrait' },
    pagebreak:    { mode: 'avoid-all' }
  };

  html2pdf().set(opt).from(element).save();
});

// inject keyframe (already handled in CSS, but keeping JS logic if needed for dynamic injection)
// const st = document.createElement('style');
// st.textContent=`@keyframes sparkBurst{0%{opacity:1;transform:scale(0.2) translateY(0)}100%{opacity:0;transform:scale(2) translateY(-50px)}}`;
// document.head.appendChild(st);
