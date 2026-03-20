const canvas = document.getElementById('tank-canvas');
const ctx    = canvas.getContext('2d');
const tank   = document.getElementById('tank');

let W, H;
function resize(){
  W = canvas.width  = tank.clientWidth;
  H = canvas.height = tank.clientHeight;
}
resize();
window.addEventListener('resize', resize);

// ── AGUA FONDO ──
function drawBg(){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,  '#0a2a5a');
  g.addColorStop(.4, '#0a1e48');
  g.addColorStop(1,  '#060e28');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
}

// ── ARENA ──
const sandPebbles = Array.from({length:60},()=>({
  x:Math.random()*100,y:Math.random()*8,
  r:Math.random()*3+1.5,
  c:['#c8a870','#b89060','#d4b880','#a07850'][Math.floor(Math.random()*4)]
}));
function drawSand(){
  // base arena
  const g = ctx.createLinearGradient(0,H-28,0,H);
  g.addColorStop(0,'#c8a870');g.addColorStop(1,'#a07848');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(0,H-22);
  ctx.bezierCurveTo(W*.25,H-28,W*.5,H-18,W*.75,H-26);
  ctx.bezierCurveTo(W*.88,H-30,W,H-20,W,H);
  ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  // piedritas
  sandPebbles.forEach(p=>{
    ctx.beginPath();
    ctx.ellipse(p.x/100*W, H-14+p.y, p.r, p.r*.6, 0, 0, Math.PI*2);
    ctx.fillStyle=p.c;ctx.fill();
  });
}

// ── PLANTAS ──
const plants = [
  {x:.08,h:.55,c1:'#186030',c2:'#28a050',leaves:6,phase:0},
  {x:.15,h:.40,c1:'#1a7040',c2:'#30b860',leaves:4,phase:.5},
  {x:.85,h:.60,c1:'#186030',c2:'#28a050',leaves:7,phase:.8},
  {x:.92,h:.35,c1:'#1a7040',c2:'#30b860',leaves:4,phase:1.2},
  {x:.5, h:.30,c1:'#d07090',c2:'#f090b0',leaves:3,phase:.3},
];
function drawPlant(p,t){
  const bx=p.x*W, by=H-24, ph=p.h*H;
  for(let i=0;i<p.leaves;i++){
    const f = i/p.leaves;
    const ly = by - f*ph;
    const sw = Math.sin(t*.8+p.phase+f*1.5)*8;
    const lw = 12-f*4;
    ctx.save();
    ctx.strokeStyle=i%2===0?p.c1:p.c2;
    ctx.lineWidth=lw;ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(bx,ly+lw*.5);
    ctx.quadraticCurveTo(bx+sw+16,ly-14,bx+sw+28,ly-22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx,ly+lw*.5);
    ctx.quadraticCurveTo(bx+sw-16,ly-14,bx+sw-28,ly-22);
    ctx.stroke();
    ctx.restore();
  }
  // tallo
  ctx.save();ctx.strokeStyle=p.c1;ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(bx,by);
  for(let i=0;i<10;i++){
    const fy=by-i*(ph/10);
    const sw=Math.sin(t*.8+p.phase+i*.3)*5;
    if(i===0)ctx.moveTo(bx,by);
    else ctx.lineTo(bx+sw,fy);
  }
  ctx.stroke();ctx.restore();
}

// ── BURBUJAS ──
const bubbles = Array.from({length:22},()=>newBubble());
function newBubble(){
  return {
    x:Math.random()*W, y:H+10,
    r:Math.random()*4+2,
    speed:Math.random()*.5+.3,
    wobble:Math.random()*Math.PI*2,
    wSpeed:Math.random()*.05+.02,
  };
}
function drawBubbles(t){
  bubbles.forEach((b,i)=>{
    b.y-=b.speed;
    b.wobble+=b.wSpeed;
    const bx=b.x+Math.sin(b.wobble)*3;
    if(b.y<-10)bubbles[i]=newBubble();
    ctx.save();
    ctx.beginPath();ctx.arc(bx,b.y,b.r,0,Math.PI*2);
    ctx.strokeStyle='rgba(180,220,255,.5)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(180,220,255,.08)';ctx.fill();
    ctx.restore();
  });
}

// ── DECORACIÓN: castillo y piedras ──
function drawDeco(){
  // piedras grandes
  [[.35,H-20,18,12],[.4,H-22,14,10],[.6,H-20,20,13],[.65,H-18,12,9]].forEach(([fx,fy,rw,rh])=>{
    ctx.beginPath();ctx.ellipse(fx*W,fy,rw,rh,0,0,Math.PI*2);
    ctx.fillStyle='#607080';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=1;ctx.stroke();
  });
  // castillito simple
  const cx=W*.78, cy=H-24;
  ctx.fillStyle='#708090';
  ctx.fillRect(cx-14,cy-28,28,28);
  // torres
  [-12,12].forEach(dx=>{
    ctx.fillRect(cx+dx-5,cy-38,10,12);
    // almenas
    [-3,3].forEach(mx=>{ctx.fillRect(cx+dx+mx-1.5,cy-42,3,5);});
  });
  // puerta
  ctx.fillStyle='#1a1a2a';
  ctx.beginPath();ctx.arc(cx,cy,7,Math.PI,0);ctx.rect(cx-7,cy-7,14,7);ctx.fill();
  // brillito cristal
  ctx.fillStyle='rgba(255,255,255,.12)';
  ctx.fillRect(cx-12,cy-36,4,10);
}

// ── PECES KAWAII ──
const messages = [
  "eres mi persona favorita 🌸",
  "te pienso todo el tiempo ✨",
  "me alegras los días 💕",
  "tu sonrisa es mi favorita 🌼",
  "me gustas muchísimo 🐠",
  "eres muy bonita 💫",
  "ojalá siempre estés bien 🌷",
];

const fishColors = [
  {body:'#ff8060',fin:'#ff5030',eye:'#fff',stripe:'#ff6040'},
  {body:'#ff80c0',fin:'#e060a0',eye:'#fff',stripe:'#ffb0d8'},
  {body:'#60c0ff',fin:'#3090e0',eye:'#fff',stripe:'#90d8ff'},
  {body:'#ffc060',fin:'#e09030',eye:'#fff',stripe:'#ffe090'},
  {body:'#a080ff',fin:'#7050d0',eye:'#fff',stripe:'#c0b0ff'},
  {body:'#60e0b0',fin:'#30b080',eye:'#fff',stripe:'#a0f0d0'},
];

class Fish {
  constructor(i){
    this.i = i;
    this.reset(true);
    this.col = fishColors[i%fishColors.length];
    this.msg = messages[i%messages.length];
    this.showMsg = false;
    this.msgTimer = 0;
    this.tail = 0;
    this.scared = false;
    this.scaredTimer = 0;
    this.eating = false;
    this.eatTimer = 0;
  }
  reset(init=false){
    this.dir = Math.random()<.5?1:-1;
    this.x   = init?(Math.random()*W):(this.dir>0?-60:W+60);
    this.y   = 60+Math.random()*(H-140);
    this.vy  = 0;
    this.targetY = this.y;
    this.speed = Math.random()*1.2+.6;
    this.size  = Math.random()*14+22;
    this.bob   = Math.random()*Math.PI*2;
    this.bobS  = Math.random()*.02+.01;
  }
  update(t){
    this.tail = Math.sin(t*4+this.i)*0.5;
    this.bob += this.bobS;
    this.x += this.speed*this.dir*(this.scared?2.5:1);
    // suave subida/bajada
    if(Math.random()<.008) this.targetY = 60+Math.random()*(H-140);
    this.y += (this.targetY-this.y)*.012;
    this.y += Math.sin(this.bob)*.4;
    if(this.msgTimer>0)this.msgTimer--;
    else this.showMsg=false;
    if(this.scaredTimer>0){this.scaredTimer--;if(this.scaredTimer===0)this.scared=false;}
    if(this.eatTimer>0)this.eatTimer--;else this.eating=false;
    if(this.x>W+80||this.x<-80)this.reset();
  }
  draw(ctx){
    ctx.save();
    ctx.translate(this.x,this.y);
    if(this.dir<0)ctx.scale(-1,1);
    const s=this.size;
    // cola
    const tailSwing=this.tail*s*.5;
    ctx.beginPath();
    ctx.moveTo(-s*.6,0);
    ctx.lineTo(-s*1.1+tailSwing,-s*.55);
    ctx.lineTo(-s*1.1+tailSwing, s*.55);
    ctx.closePath();
    ctx.fillStyle=this.col.fin;ctx.fill();
    // cuerpo
    ctx.beginPath();
    ctx.ellipse(0,0,s*.8,s*.45,0,0,Math.PI*2);
    ctx.fillStyle=this.col.body;ctx.fill();
    // aleta dorsal
    ctx.beginPath();
    ctx.moveTo(-s*.1,-s*.44);
    ctx.quadraticCurveTo(s*.2,-s*.8,s*.4,-s*.44);
    ctx.fillStyle=this.col.fin;ctx.fill();
    // aleta pectoral
    ctx.beginPath();
    ctx.ellipse(s*.1,s*.2,s*.22,s*.12,-0.4,0,Math.PI*2);
    ctx.fillStyle=this.col.fin;ctx.fill();
    // rayas
    for(let r=0;r<2;r++){
      ctx.save();ctx.globalAlpha=.2;
      ctx.beginPath();ctx.ellipse(s*(.1-r*.25),0,s*.06,s*.4,0,0,Math.PI*2);
      ctx.fillStyle=this.col.stripe;ctx.fill();
      ctx.restore();
    }
    // ojo
    ctx.beginPath();ctx.arc(s*.5,s*-.1,s*.14,0,Math.PI*2);
    ctx.fillStyle='#fff';ctx.fill();
    ctx.beginPath();ctx.arc(s*.53,s*-.1,s*.08,0,Math.PI*2);
    ctx.fillStyle='#222';ctx.fill();
    // brillo ojo
    ctx.beginPath();ctx.arc(s*.55,s*-.14,s*.04,0,Math.PI*2);
    ctx.fillStyle='#fff';ctx.fill();
    // boca kawaii
    ctx.beginPath();
    if(this.eating){
      ctx.arc(s*.72,s*.1,s*.08,0,Math.PI*2);
      ctx.fillStyle='#c04060';ctx.fill();
    } else {
      ctx.arc(s*.72,s*.08,s*.06,0,Math.PI);
      ctx.strokeStyle='#c04060';ctx.lineWidth=1.5;ctx.stroke();
    }
    // mejillitos kawaii
    ctx.save();ctx.globalAlpha=.35;
    ctx.beginPath();ctx.ellipse(s*.55,s*.15,s*.1,s*.06,0,0,Math.PI*2);
    ctx.fillStyle='#ff8080';ctx.fill();
    ctx.restore();
    ctx.restore();
    // mensaje globo
    if(this.showMsg){
      ctx.save();
      ctx.translate(this.x,this.y-this.size-10);
      const tw=ctx.measureText(this.msg).width+16;
      const th=26;
      ctx.fillStyle='rgba(255,255,255,.92)';
      roundRect(ctx,-tw/2,-th,tw,th,8);ctx.fill();
      ctx.strokeStyle='rgba(200,160,220,.5)';ctx.lineWidth=1.5;
      roundRect(ctx,-tw/2,-th,tw,th,8);ctx.stroke();
      // colita
      ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.lineTo(0,8);ctx.closePath();
      ctx.fillStyle='rgba(255,255,255,.92)';ctx.fill();
      ctx.fillStyle='#604080';ctx.font=`bold ${Math.min(11,tw/this.msg.length*1.5)}px Nunito`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(this.msg,0,-th/2);
      ctx.restore();
    }
  }
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

// ── COMIDA ──
const foods = [];
class Food{
  constructor(x,y){
    this.x=x;this.y=y;this.vy=0;this.eaten=false;this.alpha=1;
    this.c=['#ffb060','#ff8060','#ffd080'][Math.floor(Math.random()*3)];
    this.r=3+Math.random()*3;
  }
  update(){
    if(!this.eaten){
      this.vy+=.05;this.vy*=.95;
      this.y+=this.vy;
      if(this.y>H-30)this.y=H-30;
    }
  }
  draw(ctx){
    ctx.save();ctx.globalAlpha=this.alpha;
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=this.c;ctx.fill();
    ctx.restore();
  }
}

// crear peces
const fishes = Array.from({length:6},(_,i)=>new Fish(i));

// ── INTERACCIÓN ──
tank.addEventListener('click',e=>{
  const rect=tank.getBoundingClientRect();
  const cx=e.clientX-rect.left;
  const cy=e.clientY-rect.top;
  // comida
  for(let i=0;i<3;i++) foods.push(new Food(cx+(Math.random()-0.5)*20,cy));
  // corazón
  spawnHeart(e.clientX,e.clientY);
  // peces reaccionan
  fishes.forEach(f=>{
    const dx=cx-f.x,dy=cy-f.y;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<80){f.scared=true;f.scaredTimer=40;f.showMsg=true;f.msgTimer=120;}
  });
});

function spawnHeart(x,y){
  const syms=['🌸','💕','✨','🐠','💗'];
  const el=document.createElement('div');
  el.className='heart-pop';
  el.textContent=syms[Math.floor(Math.random()*syms.length)];
  el.style.left=x+'px';el.style.top=y+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),900);
}

// ── CLICK EN PEZ ──
tank.addEventListener('click',e=>{
  const rect=tank.getBoundingClientRect();
  const cx=e.clientX-rect.left,cy=e.clientY-rect.top;
  fishes.forEach(f=>{
    const dx=cx-f.x,dy=cy-f.y;
    if(Math.sqrt(dx*dx+dy*dy)<f.size){
      f.showMsg=true;f.msgTimer=180;
      f.eating=true;f.eatTimer=40;
    }
  });
});

// ── PECES COMEN COMIDA ──
function checkEating(){
  fishes.forEach(f=>{
    foods.forEach(fd=>{
      if(!fd.eaten){
        const dx=fd.x-f.x,dy=fd.y-f.y;
        if(Math.sqrt(dx*dx+dy*dy)<f.size*1.2){
          fd.eaten=true;f.eating=true;f.eatTimer=60;
        }
      }
    });
  });
}

// ── LUZ CAUSTICA (destellos en el agua) ──
const caustics = Array.from({length:15},()=>({
  x:Math.random()*100,y:Math.random()*60,
  r:Math.random()*20+10,
  a:Math.random()*.06+.02,
  sp:Math.random()*.8+.4,ph:Math.random()*Math.PI*2,
}));
function drawCaustics(t){
  caustics.forEach(c=>{
    const a=c.a*Math.abs(Math.sin(t*c.sp*.01+c.ph));
    ctx.save();ctx.globalAlpha=a;
    ctx.beginPath();ctx.arc(c.x/100*W,c.y/100*H,c.r,0,Math.PI*2);
    ctx.fillStyle='rgba(150,210,255,1)';ctx.fill();
    ctx.restore();
  });
}

// ── LOOP ──
let t=0;
function loop(){
  t++;
  ctx.clearRect(0,0,W,H);
  drawBg();
  drawCaustics(t);
  plants.forEach(p=>drawPlant(p,t*.02));
  drawDeco();
  drawSand();
  // comida
  for(let i=foods.length-1;i>=0;i--){
    const f=foods[i];
    f.update();
    if(f.eaten){f.alpha-=.04;if(f.alpha<=0){foods.splice(i,1);continue;}}
    f.draw(ctx);
  }
  checkEating();
  fishes.forEach(f=>{f.update(t);f.draw(ctx);});
  drawBubbles(t);
  requestAnimationFrame(loop);
}
loop();
