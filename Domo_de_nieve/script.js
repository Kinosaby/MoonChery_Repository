// BG
const bc=document.getElementById('bg-canvas');
const bx=bc.getContext('2d');
let bW,bH;
function initB(){bW=bc.width=window.innerWidth;bH=bc.height=window.innerHeight;}
function drawBG(){bx.clearRect(0,0,bW,bH);const g=bx.createRadialGradient(bW*.5,bH*.4,0,bW*.5,bH*.4,bH);g.addColorStop(0,'rgba(20,40,80,.3)');g.addColorStop(1,'transparent');bx.fillStyle=g;bx.fillRect(0,0,bW,bH);requestAnimationFrame(drawBG);}
initB();drawBG();window.addEventListener('resize',initB);

// NIEVE
const sc=document.getElementById('snow-canvas');
const sctx=sc.getContext('2d');
const R=140;sc.width=sc.height=R*2;
const cx=R,cy=R;

// partículas nieve
class Snow{
  constructor(active=false){this.reset(active);}
  reset(active=false){
    this.angle=Math.random()*Math.PI*2;
    this.dist=active?Math.random()*R*.9:Math.random()*R*.85;
    this.x=cx+Math.cos(this.angle)*this.dist;
    this.y=cy+Math.sin(this.angle)*this.dist;
    this.r=Math.random()*2.5+.8;
    this.vy=Math.random()*.8+.3;
    this.vx=(Math.random()-.5)*.3;
    this.a=Math.random()*.8+.2;
    this.falling=active;
  }
  update(){
    if(!this.falling){this.vy=Math.random()*.8+.3;this.vx=(Math.random()-.5)*.3;this.falling=true;}
    this.x+=this.vx;this.y+=this.vy;
    // mantener dentro del círculo
    const dx=this.x-cx,dy=this.y-cy;
    if(Math.sqrt(dx*dx+dy*dy)>R*.9||this.y>cy+R*.88){this.reset(true);this.y=cy-R*.8;}
    if(Math.abs(dx)>R*.85)this.vx*=-.8;
  }
  draw(){
    sctx.save();sctx.globalAlpha=this.a;
    sctx.beginPath();sctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    sctx.fillStyle='rgba(220,240,255,1)';sctx.fill();
    sctx.restore();
  }
}
const flakes=Array.from({length:120},()=>new Snow());
let snowing=false,snowIntensity=0;

function shake(){
  snowing=true;snowIntensity=1;
  flakes.forEach(f=>{f.vy=(Math.random()*2+1)*-1;f.vx=(Math.random()-.5)*3;f.falling=true;});
  setTimeout(()=>snowIntensity=.3,1500);
  setTimeout(()=>snowing=false,5000);
}

// ── ESCENA INTERIOR ──
function drawScene(){
  // cielo nocturno
  const sky=sctx.createLinearGradient(0,0,0,R*2);
  sky.addColorStop(0,'#050820');sky.addColorStop(.7,'#0a1030');sky.addColorStop(1,'#0c1820');
  sctx.fillStyle=sky;
  sctx.beginPath();sctx.arc(cx,cy,R,0,Math.PI*2);sctx.fill();

  // estrellas
  [[30,40],[60,25],[100,35],[150,20],[200,45],[240,30],[110,55],[180,38]].forEach(([x,y])=>{
    sctx.save();sctx.globalAlpha=.6+.3*Math.sin(Date.now()*.001+x);
    sctx.beginPath();sctx.arc(x,y,1,0,Math.PI*2);sctx.fillStyle='#d0e8ff';sctx.fill();
    sctx.restore();
  });

  // luna
  sctx.beginPath();sctx.arc(200,40,22,0,Math.PI*2);sctx.fillStyle='#f0f8e8';sctx.fill();
  sctx.save();sctx.globalAlpha=.4;sctx.beginPath();sctx.arc(206,37,16,0,Math.PI*2);sctx.fillStyle='#d8f0d0';sctx.fill();sctx.restore();

  // montañas fondo
  sctx.fillStyle='#1a2a40';
  sctx.beginPath();sctx.moveTo(0,160);sctx.lineTo(50,100);sctx.lineTo(100,130);sctx.lineTo(150,90);sctx.lineTo(200,120);sctx.lineTo(250,85);sctx.lineTo(280,110);sctx.lineTo(280,200);sctx.lineTo(0,200);sctx.fill();

  // árboles pino kawaii
  [[50,180,50],[80,175,40],[200,178,45],[230,172,55]].forEach(([tx,ty,th])=>{
    // tronco
    sctx.fillStyle='#4a2810';sctx.fillRect(tx-3,ty-10,6,12);
    // copas
    [[th,0],[th*.75,-th*.3],[th*.5,-th*.55]].forEach(([w,oy])=>{
      sctx.beginPath();sctx.moveTo(tx-w*.4,ty+oy);sctx.lineTo(tx,ty+oy-w*.6);sctx.lineTo(tx+w*.4,ty+oy);sctx.closePath();
      sctx.fillStyle='#1a4020';sctx.fill();
    });
    // nieve en ramas
    sctx.fillStyle='rgba(220,240,255,.7)';
    sctx.beginPath();sctx.moveTo(tx-th*.4,ty);sctx.lineTo(tx,ty-8);sctx.lineTo(tx+th*.4,ty);sctx.closePath();sctx.fill();
  });

  // casita kawaii
  const hx=cx,hy=190;
  // cuerpo
  sctx.fillStyle='#d8c0a0';sctx.fillRect(hx-30,hy-30,60,32);
  // ventanas
  sctx.fillStyle='#ffeebb';
  [[hx-20,hy-22,14,12],[hx+7,hy-22,14,12]].forEach(([wx,wy,ww,wh])=>{
    sctx.fillRect(wx,wy,ww,wh);
    sctx.strokeStyle='#a08060';sctx.lineWidth=1;sctx.strokeRect(wx,wy,ww,wh);
    // luz de la ventana
    sctx.save();sctx.globalAlpha=.3+.2*Math.sin(Date.now()*.002);
    const wg=sctx.createRadialGradient(wx+ww*.5,wy+wh*.5,0,wx+ww*.5,wy+wh*.5,18);
    wg.addColorStop(0,'rgba(255,220,100,.5)');wg.addColorStop(1,'transparent');
    sctx.fillStyle=wg;sctx.fillRect(wx-8,wy-8,ww+16,wh+16);sctx.restore();
  });
  // puerta
  sctx.fillStyle='#8a5030';sctx.fillRect(hx-8,hy-18,16,20);
  sctx.beginPath();sctx.arc(hx,hy-18,8,Math.PI,0);sctx.fill();
  // techo
  sctx.fillStyle='#c04040';
  sctx.beginPath();sctx.moveTo(hx-36,hy-30);sctx.lineTo(hx,hy-58);sctx.lineTo(hx+36,hy-30);sctx.closePath();sctx.fill();
  // nieve techo
  sctx.fillStyle='rgba(220,240,255,.85)';
  sctx.beginPath();sctx.moveTo(hx-36,hy-30);sctx.lineTo(hx,hy-58);sctx.lineTo(hx+36,hy-30);sctx.lineTo(hx+28,hy-30);sctx.lineTo(hx,hy-50);sctx.lineTo(hx-28,hy-30);sctx.closePath();sctx.fill();
  // chimenea
  sctx.fillStyle='#a06040';sctx.fillRect(hx+12,hy-62,12,18);
  // humo
  [0,1,2].forEach(i=>{
    const ht=Date.now()*.001;
    sctx.save();sctx.globalAlpha=.3-i*.08;
    sctx.beginPath();sctx.arc(hx+18+Math.sin(ht+i)*4,hy-66-i*8,4+i*2,0,Math.PI*2);
    sctx.fillStyle='#c0c0d0';sctx.fill();sctx.restore();
  });

  // suelo nevado
  const snow=sctx.createLinearGradient(0,190,0,R*2);
  snow.addColorStop(0,'#d8ecff');snow.addColorStop(1,'#c0d8f0');
  sctx.fillStyle=snow;
  sctx.beginPath();sctx.ellipse(cx,R*2-10,R,30,0,Math.PI,0);sctx.fill();
  sctx.fillRect(0,190,R*2,R*2-190);

  // clip circular
  sctx.save();
  sctx.globalCompositeOperation='destination-in';
  sctx.beginPath();sctx.arc(cx,cy,R-.5,0,Math.PI*2);sctx.fill();
  sctx.restore();
}

// ── MENSAJES ──
const msgs=["eres mi lugar favorito ❄️","pienso en ti todos los días 🌸","eres la persona más bonita ✨","ojalá siempre estés bien 💕","te quiero muchísimo 🌙"];
let mi=0;
const msgEl=document.getElementById('msg');

// ── INTERACCIÓN ──
document.getElementById('globe-wrap').addEventListener('click',()=>{
  const wrap=document.getElementById('globe-wrap');
  wrap.classList.remove('shaking');
  void wrap.offsetWidth;
  wrap.classList.add('shaking');
  wrap.addEventListener('animationend',()=>wrap.classList.remove('shaking'),{once:true});
  shake();
  msgEl.textContent=msgs[mi%msgs.length];mi++;
});

// ── LOOP ──
function loop(){
  sctx.clearRect(0,0,R*2,R*2);
  drawScene();
  if(snowing||flakes.some(f=>f.y<cy+R*.85&&f.falling)){
    flakes.forEach(f=>{if(snowing&&snowIntensity>.5)f.update();else if(f.vy>0)f.update();f.draw();});
  }
  requestAnimationFrame(loop);
}
loop();
