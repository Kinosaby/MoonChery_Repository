// COVER
document.getElementById('start-btn').addEventListener('click',()=>{
  document.getElementById('cover').classList.add('hide');
  window.scrollTo({top:0,behavior:'instant'});
});

// NAV + PROGRESS
const ids=['cover','ch-1','ch-2','ch-3','ch-4','ch-5','ch-6','ch-7','ch-ep'];
const dots=document.querySelectorAll('.nav-dot');
const prog=document.getElementById('progress');

window.addEventListener('scroll',()=>{
  const s=window.scrollY,t=document.body.scrollHeight-window.innerHeight;
  prog.style.width=(s/t*100)+'%';
  let a=0;
  ids.forEach((id,i)=>{const el=document.getElementById(id);if(el&&s>=el.offsetTop-window.innerHeight/2)a=i;});
  dots.forEach((d,i)=>d.classList.toggle('active',i===a));
});

dots.forEach((d,i)=>{
  d.addEventListener('click',()=>{
    if(i===0){window.scrollTo({top:0,behavior:'smooth'});document.getElementById('cover').classList.remove('hide');}
    else{document.getElementById('cover').classList.add('hide');document.getElementById(ids[i])?.scrollIntoView({behavior:'smooth'});}
  });
});

// REVEAL
const revs=document.querySelectorAll('.reveal');
const obs=new IntersectionObserver(e=>{e.forEach(r=>{if(r.isIntersecting){r.target.classList.add('visible');obs.unobserve(r.target);}});},{threshold:.1});
revs.forEach(r=>obs.observe(r));

// BG STARS
const bc=document.getElementById('bg-canvas'),bx=bc.getContext('2d');
let bW,bH,pts=[];
function initB(){
  bW=bc.width=window.innerWidth;bH=bc.height=window.innerHeight;
  pts=Array.from({length:260},()=>({
    x:Math.random()*bW,y:Math.random()*bH,
    r:Math.random()*1.4+.2,
    a:Math.random()*.7+.1,
    sp:.001+Math.random()*.004,
    ph:Math.random()*Math.PI*2,
    blue:Math.random()<.3
  }));
}
function drawB(t){
  bx.clearRect(0,0,bW,bH);
  pts.forEach(p=>{
    const a=p.a*(.35+.65*Math.sin(t*p.sp+p.ph));
    bx.globalAlpha=a;bx.beginPath();bx.arc(p.x,p.y,p.r,0,Math.PI*2);
    bx.fillStyle=p.blue?'rgba(150,180,255,1)':'rgba(232,224,240,1)';bx.fill();
  });
  bx.globalAlpha=1;requestAnimationFrame(drawB);
}
initB();requestAnimationFrame(drawB);
window.addEventListener('resize',initB);
