// ══ COVER ══
document.getElementById('start-btn').addEventListener('click',()=>{
  document.getElementById('cover').classList.add('hide');
  window.scrollTo({top:0,behavior:'instant'});
});

// ══ PROGRESS + NAV ══
const chapters = ['cover','ch-1','ch-2','ch-3','ch-4','ch-5','ch-6','ch-epilogue'];
const navDots  = document.querySelectorAll('.nav-dot');
const progBar  = document.getElementById('progress');

window.addEventListener('scroll',()=>{
  const scrolled = window.scrollY;
  const total    = document.body.scrollHeight - window.innerHeight;
  progBar.style.width = (scrolled/total*100)+'%';

  // active nav dot
  let active = 0;
  chapters.forEach((id,i)=>{
    const el = document.getElementById(id);
    if(!el) return;
    if(scrolled >= el.offsetTop - window.innerHeight/2) active=i;
  });
  navDots.forEach((d,i)=>d.classList.toggle('active',i===active));
});

navDots.forEach((dot,i)=>{
  dot.addEventListener('click',()=>{
    const id = chapters[i];
    if(id==='cover'){
      window.scrollTo({top:0,behavior:'smooth'});
      document.getElementById('cover').classList.remove('hide');
    } else {
      document.getElementById('cover').classList.add('hide');
      document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// ══ SCROLL REVEAL ══
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
},{threshold:.12});
reveals.forEach(r=>observer.observe(r));

// ══ BG PARTICLES (subtle dust) ══
const bgCanvas = document.getElementById('bg-canvas');
const bctx     = bgCanvas.getContext('2d');
let bW,bH,particles=[];

function initBg(){
  bW=bgCanvas.width=window.innerWidth;
  bH=bgCanvas.height=window.innerHeight;
  particles=Array.from({length:80},()=>({
    x:Math.random()*bW, y:Math.random()*bH,
    r:Math.random()*.8+.2,
    a:Math.random()*.3+.05,
    sp:.001+Math.random()*.003,
    ph:Math.random()*Math.PI*2
  }));
}
function drawBg(t){
  bctx.clearRect(0,0,bW,bH);
  particles.forEach(p=>{
    const a=p.a*(.4+.6*Math.sin(t*p.sp+p.ph));
    bctx.globalAlpha=a;
    bctx.beginPath();bctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    bctx.fillStyle='rgba(200,180,140,1)';bctx.fill();
  });
  bctx.globalAlpha=1;
  requestAnimationFrame(drawBg);
}
initBg();requestAnimationFrame(drawBg);
window.addEventListener('resize',initBg);
