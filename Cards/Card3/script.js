// Stars
const sc=document.getElementById('stars');
const sctx=sc.getContext('2d');
let W,H,stars=[];
function init(){
  W=sc.width=window.innerWidth;H=sc.height=window.innerHeight*.45;
  stars=Array.from({length:120},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.2,a:Math.random()*.7+.1,sp:.002+Math.random()*.005,ph:Math.random()*Math.PI*2}));
}
function draw(t){
  sctx.clearRect(0,0,W,H);
  stars.forEach(s=>{
    const a=s.a*(.4+.6*Math.sin(t*s.sp+s.ph));
    sctx.globalAlpha=a;sctx.beginPath();sctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    sctx.fillStyle='white';sctx.fill();
  });
  sctx.globalAlpha=1;requestAnimationFrame(draw);
}
init();requestAnimationFrame(draw);
window.addEventListener('resize',init);

// Floating petals
const floats=document.getElementById('floats');
const petalCols=['#E8721A','#E84878','#C82828','#ff9a4a','#c03040'];
for(let i=0;i<16;i++){
  const p=document.createElement('div');
  p.className='float-el';
  const c=petalCols[Math.floor(Math.random()*petalCols.length)];
  const sz=6+Math.random()*10;
  p.innerHTML=`<svg width="${sz}" height="${sz}" viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="4" ry="9" fill="${c}" opacity=".55" transform="rotate(${Math.random()*360} 10 10)"/></svg>`;
  p.style.cssText=`left:${Math.random()*100}vw;top:${Math.random()*100}vh;animation-duration:${4+Math.random()*4}s;animation-delay:${Math.random()*4}s;`;
  floats.appendChild(p);
}
