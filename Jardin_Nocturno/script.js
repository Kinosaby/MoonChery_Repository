const c=document.getElementById('c');
const ctx=c.getContext('2d');
let W,H;
function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
resize();window.addEventListener('resize',resize);

// ── LUNA ──
const moon={x:0,y:0};

// ── ESTRELLAS ──
const stars=Array.from({length:200},()=>({x:Math.random()*100,y:Math.random()*55,r:Math.random()*.9+.2,a:Math.random()*.7+.2,sp:.002+Math.random()*.005,ph:Math.random()*Math.PI*2}));

// ── NUBES ──
const clouds=[
  {x:15,y:12,w:120,h:40,sp:.03},
  {x:55,y:8,w:100,h:35,sp:.02},
  {x:78,y:15,w:90,h:30,sp:.025},
];

// ── ÁRBOLES ──
function drawTree(x,h,col,t){
  // tronco
  ctx.fillStyle='#3a2010';
  ctx.fillRect(x-5,H-h*.3,10,h*.3);
  // copa — 3 triángulos
  [[0,h,.55],[0,h*.75,.45],[0,h*.5,.35]].forEach(([ox,oh,frac])=>{
    ctx.beginPath();
    ctx.moveTo(x+ox-oh*frac,H-h*.3);
    ctx.lineTo(x+ox,H-oh);
    ctx.lineTo(x+ox+oh*frac,H-h*.3);
    ctx.closePath();
    ctx.fillStyle=col;ctx.fill();
  });
}

// ── FLORES ──
const flowers=Array.from({length:28},()=>({
  x:Math.random()*100,
  stemH:30+Math.random()*40,
  petals:4+Math.floor(Math.random()*4),
  col:['#ff80a0','#ffb0d0','#c080ff','#80c0ff','#ffff80','#ff80ff'][Math.floor(Math.random()*6)],
  size:6+Math.random()*6,
  ph:Math.random()*Math.PI*2,
  bloomed:false,
  bloom:0,
}));

function drawFlower(f,t){
  const x=f.x/100*W;
  const by=H-60;
  const sw=Math.sin(t*.015+f.ph)*4;
  // tallo
  ctx.save();ctx.strokeStyle='#406020';ctx.lineWidth=2;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,by);ctx.quadraticCurveTo(x+sw,by-f.stemH*.5,x,by-f.stemH);ctx.stroke();
  // hoja
  ctx.fillStyle='#508030';
  ctx.beginPath();ctx.ellipse(x+sw*.5-8,by-f.stemH*.4,10,5,-.5,0,Math.PI*2);ctx.fill();
  // flor
  if(f.bloom>0){
    const s=f.size*f.bloom;
    for(let i=0;i<f.petals;i++){
      const a=(i/f.petals)*Math.PI*2;
      ctx.save();ctx.globalAlpha=f.bloom;
      ctx.beginPath();
      ctx.ellipse(x+Math.cos(a)*s,by-f.stemH+Math.sin(a)*s,s*.7,s*.4,a,0,Math.PI*2);
      ctx.fillStyle=f.col;ctx.fill();
      ctx.restore();
    }
    // centro
    ctx.save();ctx.globalAlpha=f.bloom;
    ctx.beginPath();ctx.arc(x,by-f.stemH,s*.4,0,Math.PI*2);
    ctx.fillStyle='#ffe060';ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ── LUCIÉRNAGAS ──
class Firefly{
  constructor(){this.reset();}
  reset(){
    this.x=Math.random()*100;this.y=25+Math.random()*45;
    this.vx=(Math.random()-.5)*.4;this.vy=(Math.random()-.5)*.3;
    this.glow=Math.random();this.glowSp=.02+Math.random()*.03;
    this.r=2+Math.random()*2;
    this.col=['#c0ff80','#80ffc0','#ffff80','#a0ff60'][Math.floor(Math.random()*4)];
    this.trail=[];
  }
  update(){
    this.glow+=this.glowSp;
    this.x+=this.vx+(Math.random()-.5)*.2;
    this.y+=this.vy+(Math.random()-.5)*.15;
    if(this.x<0)this.x=100;if(this.x>100)this.x=0;
    if(this.y<15)this.vy=Math.abs(this.vy);
    if(this.y>68)this.vy=-Math.abs(this.vy);
    const px=this.x/100*W,py=this.y/100*H;
    this.trail.push({x:px,y:py,a:.5});
    if(this.trail.length>12)this.trail.shift();
    this.trail.forEach(p=>p.a*=.88);
  }
  draw(){
    const px=this.x/100*W,py=this.y/100*H;
    const g=.5+.5*Math.sin(this.glow);
    // trail
    this.trail.forEach((p,i)=>{
      ctx.save();ctx.globalAlpha=p.a*g*.4;
      ctx.beginPath();ctx.arc(p.x,p.y,this.r*.5,0,Math.PI*2);
      ctx.fillStyle=this.col;ctx.fill();ctx.restore();
    });
    // glow
    const gr=ctx.createRadialGradient(px,py,0,px,py,this.r*5);
    gr.addColorStop(0,this.col.replace(')',`,${g*.6})`).replace('rgb','rgba'));
    gr.addColorStop(1,'transparent');
    ctx.save();ctx.globalAlpha=g*.4;
    ctx.beginPath();ctx.arc(px,py,this.r*5,0,Math.PI*2);
    ctx.fillStyle=gr;ctx.fill();ctx.restore();
    // cuerpo
    ctx.save();ctx.globalAlpha=g;
    ctx.beginPath();ctx.arc(px,py,this.r,0,Math.PI*2);
    ctx.fillStyle=this.col;ctx.fill();ctx.restore();
  }
}
const flies=Array.from({length:35},()=>new Firefly());

// ── PASTO ──
const grassBlades=Array.from({length:120},()=>({x:Math.random()*100,h:15+Math.random()*25,w:2+Math.random()*2,ph:Math.random()*Math.PI*2,col:['#306020','#407030','#508040'][Math.floor(Math.random()*3)]}));

function drawGrass(t){
  grassBlades.forEach(g=>{
    const x=g.x/100*W,by=H-50;
    const sw=Math.sin(t*.012+g.ph)*5;
    ctx.save();ctx.strokeStyle=g.col;ctx.lineWidth=g.w;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x,by);ctx.quadraticCurveTo(x+sw*.5,by-g.h*.6,x+sw,by-g.h);
    ctx.stroke();ctx.restore();
  });
}

// ── MENSAJES ──
const msgs=["eres mi lugar favorito 🌙","te pienso aunque no te diga 🌿","eres la persona más bonita 🌸","me alegras el día 💫","ojalá siempre estés bien ✨"];
let mi=0;
function spawnMsg(x,y){
  const el=document.createElement('div');el.className='float-msg';
  el.textContent=msgs[mi%msgs.length];mi++;
  el.style.left=x+'px';el.style.top=y+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),2000);
}

// ── INTERACCIÓN ──
function handleClick(e){
  const cx=(e.touches?e.touches[0].clientX:e.clientX);
  const cy=(e.touches?e.touches[0].clientY:e.clientY);
  spawnMsg(cx-80,cy-40);
  // bloom flores cercanas
  flowers.forEach(f=>{
    const fx=f.x/100*W,fy=H-60-f.stemH;
    if(Math.hypot(cx-fx,cy-fy)<80){f.bloomed=true;}
  });
  // atraer luciérnagas
  flies.forEach(f=>{
    const tx=cx/W*100,ty=cy/H*100;
    f.vx+=(tx-f.x)*.004;f.vy+=(ty-f.y)*.004;
  });
}
c.addEventListener('click',handleClick);
c.addEventListener('touchstart',e=>{e.preventDefault();handleClick(e);});

// ── LOOP ──
let t=0;
function loop(){
  t++;ctx.clearRect(0,0,W,H);
  // cielo
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#010208');sky.addColorStop(.6,'#020510');sky.addColorStop(1,'#040e08');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // estrellas
  stars.forEach(s=>{
    const a=s.a*(.5+.5*Math.sin(t*s.sp+s.ph));
    ctx.save();ctx.globalAlpha=a;ctx.beginPath();ctx.arc(s.x/100*W,s.y/100*H,s.r,0,Math.PI*2);ctx.fillStyle='#d0e8c0';ctx.fill();ctx.restore();
  });
  // luna
  moon.x=W*.82;moon.y=H*.12;
  const mg=ctx.createRadialGradient(moon.x,moon.y,0,moon.x,moon.y,50);
  mg.addColorStop(0,'rgba(240,255,220,.12)');mg.addColorStop(1,'transparent');
  ctx.fillStyle=mg;ctx.beginPath();ctx.arc(moon.x,moon.y,50,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(moon.x,moon.y,36,0,Math.PI*2);
  ctx.fillStyle='#e8f8d0';ctx.fill();
  // cráter
  ctx.save();ctx.globalAlpha=.15;[[-10,-8,6],[ 8,-2,4],[2,12,3]].forEach(([dx,dy,r])=>{
    ctx.beginPath();ctx.arc(moon.x+dx,moon.y+dy,r,0,Math.PI*2);ctx.fillStyle='#607050';ctx.fill();});ctx.restore();
  // nubes
  clouds.forEach(cl=>{
    cl.x-=cl.sp;if(cl.x<-cl.w/W*100)cl.x=110;
    ctx.save();ctx.globalAlpha=.06;
    ctx.fillStyle='#c0d8c0';
    ctx.beginPath();ctx.ellipse(cl.x/100*W,cl.y/100*H,cl.w*.5,cl.h*.4,0,0,Math.PI*2);ctx.fill();ctx.restore();
  });
  // árboles fondo
  [[5,H*.55,'#1a3010'],[12,H*.65,'#1e3812'],[88,H*.6,'#1a3010'],[94,H*.5,'#182e0e']].forEach(([x,h,col])=>drawTree(x/100*W,h,col,t));
  // flores
  flowers.forEach(f=>{if(f.bloomed&&f.bloom<1)f.bloom=Math.min(1,f.bloom+.04);drawFlower(f,t);});
  // pasto
  drawGrass(t);
  // suelo
  const ground=ctx.createLinearGradient(0,H-55,0,H);
  ground.addColorStop(0,'#1e4010');ground.addColorStop(1,'#0a1808');
  ctx.fillStyle=ground;ctx.fillRect(0,H-52,W,52);
  // luciérnagas
  flies.forEach(f=>{f.update();f.draw();});
  requestAnimationFrame(loop);
}
loop();
