// ── CURSOR PIXEL ──
const cursorC=document.getElementById('cursor');
const cursorCtx=cursorC.getContext('2d');
const cursorFrames=[
  [[0,1,1,0],[1,1,1,1],[1,1,1,1],[0,1,1,0]], // corazón frame 1
  [[0,0,0,0],[0,1,1,0],[1,1,1,1],[0,1,1,0]], // corazón frame 2
];
let cf=0;
function drawCursor(frame){
  cursorCtx.clearRect(0,0,16,16);
  const px=4;
  frame.forEach((row,y)=>row.forEach((cell,x)=>{
    if(cell){cursorCtx.fillStyle='#e84898';cursorCtx.fillRect(x*px,y*px,px,px);}
  }));
}
drawCursor(cursorFrames[0]);
setInterval(()=>{cf=(cf+1)%2;drawCursor(cursorFrames[cf]);},500);
document.addEventListener('mousemove',e=>{
  cursorC.style.left=(e.clientX-8)+'px';cursorC.style.top=(e.clientY-8)+'px';
  cursorC.style.position='fixed';
});

// ── ESCENA PIXEL ART ──
const sc=document.getElementById('scene');
const sctx=sc.getContext('2d');
let sW,sH;
function resizeSc(){
  sW=sc.width=sc.parentElement ? sc.parentElement.offsetWidth : 600;
  if(sW > 600) sW = 600;
  sH=sc.height=240;
}
setTimeout(resizeSc,50);window.addEventListener('resize',()=>setTimeout(resizeSc,50));

// paleta pixel
const P={
  sky1:'#0a0a1e',sky2:'#12122e',
  star:'#f8f8d8',moon:'#f8f0c0',moonS:'#e0d8a0',
  ground:'#1a2a10',ground2:'#243818',
  tree1:'#1a4010',tree2:'#0e2808',trunk:'#3a1808',
  rose:'#e84898',roseD:'#a83068',gold:'#f8c840',goldD:'#c89818',
  boy:'#3848d8',boyS:'#2838b8',boyH:'#f8c898',
  girl:'#e84898',girlS:'#a83068',girlH:'#f8b8b8',
  heart:'#f82040',
  path:'#8a7060',pathD:'#6a5040',
};

// estrellas pixel
const pxStars=Array.from({length:40},()=>({
  x:Math.floor(Math.random()*200),y:Math.floor(Math.random()*80),
  size:Math.random()<.3?2:1,
  ph:Math.random()*Math.PI*2,
}));

// corazones flotantes
const floatHearts=[];
function addFloatHeart(x,y){floatHearts.push({x,y,vy:-1.5,life:60,maxLife:60});}

// personajes
let boyX=0,girlX=0,charT=0;

function drawScene(t){
  const w=sW,h=240;
  sctx.clearRect(0,0,w,h);

  // cielo gradient pixel
  const sky=sctx.createLinearGradient(0,0,0,h*.65);
  sky.addColorStop(0,P.sky1);sky.addColorStop(1,P.sky2);
  sctx.fillStyle=sky;sctx.fillRect(0,0,w,h*.65);

  // estrellas pixel
  pxStars.forEach(s=>{
    const a=.5+.5*Math.sin(t*.04+s.ph);
    sctx.globalAlpha=a*.8;
    sctx.fillStyle=P.star;
    sctx.fillRect(s.x/200*w,s.y/80*h*.65,s.size,s.size);
  });sctx.globalAlpha=1;

  // luna pixel
  const mx=w*.82,my=h*.14;
  const lp=Math.round(w*.02);
  [[0,3],[1,1],[3,0],[3,0],[3,0],[1,1],[0,3]].forEach((row,ry)=>{
    for(let rx=-Math.floor(row[1]/2);rx<=Math.floor(row[1]/2);rx++){
      const lx=Math.round(mx)+rx*lp,ly=Math.round(my)+ry*lp;
      sctx.fillStyle=ry===0||ry===6?P.moonS:P.moon;
      sctx.fillRect(lx-lp/2,ly-lp/2,lp,lp);
    }
  });

  // árbol pixel izq
  const tx=w*.08,ty=h*.38;
  sctx.fillStyle=P.trunk;sctx.fillRect(tx,ty+h*.1,w*.022,h*.18);
  [[tx-w*.04,ty,w*.1,h*.13,P.tree1],[tx-w*.05,ty-h*.07,w*.12,h*.12,P.tree1],[tx-w*.03,ty-h*.13,w*.08,h*.1,P.tree2]].forEach(([x,y,bw,bh,col])=>{
    sctx.fillStyle=col;sctx.fillRect(x,y,bw,bh);
  });

  // árbol pixel der
  const tx2=w*.88,ty2=h*.42;
  sctx.fillStyle=P.trunk;sctx.fillRect(tx2,ty2+h*.08,w*.02,h*.16);
  [[tx2-w*.04,ty2,w*.1,h*.11,P.tree1],[tx2-w*.045,ty2-h*.06,w*.11,h*.11,P.tree2]].forEach(([x,y,bw,bh,col])=>{
    sctx.fillStyle=col;sctx.fillRect(x,y,bw,bh);
  });

  // suelo
  sctx.fillStyle=P.ground2;sctx.fillRect(0,h*.63,w,h*.37);
  sctx.fillStyle=P.ground;sctx.fillRect(0,h*.63,w,h*.08);

  // camino
  sctx.fillStyle=P.pathD;sctx.fillRect(w*.3,h*.65,w*.4,h*.35);
  sctx.fillStyle=P.path;sctx.fillRect(w*.32,h*.66,w*.36,h*.32);

  // flores pixel suelo
  [[.15,.72],[.22,.76],[.75,.74],[.82,.78],[.45,.8],[.55,.82]].forEach(([fx,fy])=>{
    sctx.fillStyle=P.ground;sctx.fillRect(fx*w,fy*h,2,6);
    sctx.fillStyle=P.rose;sctx.fillRect(fx*w-2,fy*h-3,6,4);
    sctx.fillStyle='#fff0c0';sctx.fillRect(fx*w,fy*h-2,2,2);
  });

  // personajes pixel art
  charT=t*.02;
  boyX=w*.38+Math.sin(charT*.3)*3;
  girlX=w*.52+Math.sin(charT*.3+.3)*3;
  const by=h*.58,gy=h*.58;
  const bob=Math.sin(charT)*2;

  // muchacho
  function drawBoy(x,y){
    const s=Math.round(w*.025);
    sctx.fillStyle=P.boyH;sctx.fillRect(x-s,y-s*4-bob,s*2,s*2);
    sctx.fillStyle='#382010';sctx.fillRect(x-s,y-s*5-bob,s*2,s);
    sctx.fillStyle=P.boy;sctx.fillRect(x-s,y-s*2-bob,s*2,s*2.5);
    sctx.fillStyle=P.boyS;sctx.fillRect(x-s,y+bob*.5,s*2,s*1.5);
    sctx.fillStyle='#201808';sctx.fillRect(x-s-1,y+s*1.5+bob*.5,s+1,s*.6);sctx.fillRect(x,y+s*1.5+bob*.5,s+1,s*.6);
    sctx.fillStyle=P.boyH;sctx.fillRect(x+s,y-s*2-bob,s,s*.8);
  }

  // muchacha
  function drawGirl(x,y){
    const s=Math.round(w*.025);
    sctx.fillStyle=P.girlH;sctx.fillRect(x-s,y-s*4-bob,s*2,s*2);
    sctx.fillStyle='#3a1020';sctx.fillRect(x-s-1,y-s*5-bob,s*2+2,s*1.5);
    sctx.fillStyle=P.girl;sctx.fillRect(x-s,y-s*2-bob,s*2,s*2);
    sctx.fillStyle=P.girlS;sctx.fillRect(x-s-2,y-bob,s*2+4,s*2);
    sctx.fillStyle='#e88098';sctx.fillRect(x-s,y+s*1.8+bob*.5,s,s*.5);sctx.fillRect(x,y+s*1.8+bob*.5,s,s*.5);
    sctx.fillStyle=P.girlH;sctx.fillRect(x-s-s*.5,y-s*2-bob,s*.8,s*.8);
  }

  drawBoy(boyX,by);
  drawGirl(girlX,gy);

  // corazón entre ellos pixel
  const hx=(boyX+girlX)*.5;
  const hy=by-h*.2+Math.sin(charT*.5)*4;
  const hs=Math.round(w*.02);
  [[-1,0],[0,-1],[1,-1],[2,0],[2,1],[1,2],[0,3],[-1,2],[-2,1],[-2,0],[-1,-1]].forEach(([px,py])=>{
    sctx.fillStyle=P.heart;sctx.fillRect(hx+px*hs*0.5,hy+py*hs*0.5,hs*.5,hs*.5);
  });

  // corazones flotantes
  floatHearts.forEach((fh,i)=>{
    fh.y+=fh.vy;fh.life--;
    const a=fh.life/fh.maxLife;
    sctx.globalAlpha=a;sctx.fillStyle=P.heart;
    sctx.fillRect(fh.x,fh.y,8,8);sctx.fillRect(fh.x+4,fh.y-4,8,8);sctx.fillRect(fh.x-4,fh.y-4,8,8);
    sctx.fillRect(fh.x-4,fh.y,4,4);sctx.fillRect(fh.x+8,fh.y,4,4);
    sctx.fillRect(fh.x,fh.y+4,12,4);sctx.fillRect(fh.x+2,fh.y+8,8,4);sctx.fillRect(fh.x+4,fh.y+12,4,4);
  });
  for(let i=floatHearts.length-1;i>=0;i--){if(floatHearts[i].life<=0)floatHearts.splice(i,1);}
  sctx.globalAlpha=1;

  // HUD pixel
  sctx.fillStyle='rgba(0,0,0,.5)';sctx.fillRect(0,0,w,18);
  sctx.fillStyle=P.gold;sctx.font=`7px "Press Start 2P"`;sctx.textAlign='left';
  sctx.fillText('♥ PIXEL LOVE',6,12);
  sctx.textAlign='right';
  sctx.fillText(`HEARTS: ${heartCount}/8`,w-6,12);
  sctx.textAlign='left';
}

// loop escena
let scT=0;
function sceneLoop(){scT++;drawScene(scT);requestAnimationFrame(sceneLoop);}
setTimeout(sceneLoop,100);

// click escena
sc.addEventListener('click',e=>{
  const r=sc.getBoundingClientRect();
  const sx=(e.clientX-r.left)*(sW/r.width);
  const sy=(e.clientY-r.top)*(240/r.height);
  addFloatHeart(sx-8,sy);
  spawnPxPop(e.clientX,e.clientY);
});

// ── CORAZONES COLECCIONABLES ──
const heartMsgs=[
  {emoji:'💛',title:'CORAZÓN DORADO',msg:'Eres la persona más bonita que conozco. Y no lo digo porque deba decirlo.'},
  {emoji:'🌸',title:'CORAZÓN FLOR',msg:'Cada vez que sonríes, el mundo se pone un poco mejor. En serio.'},
  {emoji:'⭐',title:'CORAZÓN ESTRELLA',msg:'Si tuviera que elegir una estrella favorita, serías tú. Sin pensarlo.'},
  {emoji:'🌙',title:'CORAZÓN LUNA',msg:'Pienso en ti en los momentos más raros. Y eso me gusta.'},
  {emoji:'🎮',title:'CORAZÓN PIXEL',msg:'En el juego de la vida, tú eres el nivel secreto que nadie más puede desbloquear.'},
  {emoji:'🍫',title:'CORAZÓN DULCE',msg:'Eres dulce de una manera que no se puede fingir. Y eso es muy difícil de encontrar.'},
  {emoji:'💌',title:'CORAZÓN CARTA',msg:'Hay cosas que quisiera decirte de frente y no me salen. Esta es una de ellas: me alegra que existas.'},
  {emoji:'🌻',title:'CORAZÓN GIRASOL',msg:'El 21 de marzo todas las flores amarillas son para ti. Todas. Sin excepción.'},
];

const heartsRow=document.getElementById('hearts-row');
let heartCount=0;
const heartCollected=new Array(8).fill(false);

heartMsgs.forEach((hm,i)=>{
  const d=document.createElement('div');d.style.cssText='position:relative;cursor:pointer;';
  const c=document.createElement('canvas');c.width=32;c.height=32;
  c.style.cssText='width:32px;height:32px;image-rendering:pixelated;transition:transform .15s;';
  d.appendChild(c);heartsRow.appendChild(d);
  drawPixelHeart(c.getContext('2d'),heartCollected[i]?'#f82040':'#3a1828',heartCollected[i]?'#b81828':'#2a0a18');
  d.addEventListener('mouseenter',()=>{c.style.transform='scale(1.3)';});
  d.addEventListener('mouseleave',()=>{c.style.transform='scale(1)';});
  d.addEventListener('click',e=>{
    if(!heartCollected[i]){
      heartCollected[i]=true;heartCount++;
      drawPixelHeart(c.getContext('2d'),'#f82040','#b81828');
      updateProgress();
      unlockCollect(i);
      spawnPxPop(e.clientX,e.clientY);
    }
    showPopup(hm);
  });
});

function drawPixelHeart(c,col,dark){
  c.clearRect(0,0,32,32);
  const map=[
    [0,0,0,0,0,0,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];
  map.forEach((row,y)=>row.forEach((cell,x)=>{
    if(cell){
      c.fillStyle=(y===1||x===0||x===7)?dark:col;
      c.fillRect(x*4,y*4,4,4);
    }
  }));
}

// ── PROGRESO ──
function updateProgress(){
  const pct=(heartCount/8)*100;
  document.getElementById('progress').style.width=pct+'%';
  document.getElementById('progress-label').textContent=`CORAZONES: ${heartCount} / 8`;
  if(heartCount===8){
    setTimeout(()=>showPopup({emoji:'🎉',title:'¡MISIÓN COMPLETADA!',msg:'Coleccionaste todos los corazones. Eres increíble, Piojito. Gracias por existir en este mundo. ♥'}),300);
  }
}

// ── COLECCIONABLES ──
const collectItems=[
  {emoji:'🌸',name:'FLOR\nDE SEUL',msg:'Tú eres la escena de los kdramas que uno quiere repetir.',locked:true},
  {emoji:'🍫',name:'CHOCO\nESPECIAL',msg:'Dulce, irresistible e imposible de olvidar.',locked:true},
  {emoji:'⭐',name:'ESTRELLA\nSECRETA',msg:'La estrella más brillante no necesita esforzarse.',locked:true},
  {emoji:'💌',name:'CARTA\nPIXEL',msg:'Esta carta fue escrita en 8 bits pero con todo el corazón.',locked:true},
  {emoji:'🌙',name:'LUNA\nDE NOCHE',msg:'De noche pienso en ti. De día también, para ser honesto.',locked:true},
  {emoji:'🎵',name:'OST\nESPECIAL',msg:'La canción de nuestra historia tiene el mejor beat.',locked:true},
  {emoji:'🌻',name:'FLORES\nAMARILLAS',msg:'El 21 de marzo le pertenece a las personas especiales. Tú eres una.',locked:true},
  {emoji:'👾',name:'PIXEL\nHEROE',msg:'Eres el personaje que todos quieren en su equipo.',locked:true},
];

const cGrid=document.getElementById('collect-grid');
if(cGrid) {
  collectItems.forEach((ci,i)=>{
    const d=document.createElement('div');d.className='collect-item';d.id=`ci-${i}`;
    d.innerHTML=`<span class="ci-emoji">${ci.emoji}</span><span class="ci-name">${ci.name}</span><div class="ci-locked">🔒</div>`;
    d.addEventListener('click',()=>{if(!ci.locked)showPopup({emoji:ci.emoji,title:ci.name.replace('\n',' '),msg:ci.msg});});
    cGrid.appendChild(d);
  });
}

function unlockCollect(i){
  collectItems[i].locked=false;
  const el=document.getElementById(`ci-${i}`);
  if(el) el.classList.add('unlocked');
}

// ── POPUP ──
function showPopup(data){
  document.getElementById('popup-emoji').textContent=data.emoji;
  document.getElementById('popup-title').textContent=data.title;
  document.getElementById('popup-msg').textContent=data.msg;
  document.getElementById('popup').classList.add('show');
}
document.getElementById('popup-close').addEventListener('click',()=>document.getElementById('popup').classList.remove('show'));
document.getElementById('popup').addEventListener('click',e=>{if(e.target===document.getElementById('popup'))document.getElementById('popup').classList.remove('show');});

// ── PIXEL POP ──
const popSyms=['♥','★','♪','●','▲','◆'];
function spawnPxPop(x,y){
  for(let i=0;i<4;i++){
    const el=document.createElement('div');el.className='px-pop';
    el.textContent=popSyms[Math.floor(Math.random()*popSyms.length)];
    el.style.cssText=`left:${x+(Math.random()-0.5)*40}px;top:${y}px;color:${['#f82040','#f8c840','#e84898','#fff'][Math.floor(Math.random()*4)]};font-size:${12+Math.floor(Math.random()*10)}px;animation-delay:${i*.1}s;`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),900);
  }
}
