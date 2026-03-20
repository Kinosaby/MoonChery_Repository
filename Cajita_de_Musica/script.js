// BG partículas
const bc=document.getElementById('bg-canvas');
const bx=bc.getContext('2d');
let bW,bH,pts=[];
function initB(){bW=bc.width=window.innerWidth;bH=bc.height=window.innerHeight;pts=Array.from({length:60},()=>({x:Math.random()*bW,y:Math.random()*bH,r:Math.random()*.8+.2,a:Math.random()*.3+.05,sp:.001+Math.random()*.003,ph:Math.random()*Math.PI*2}));}
function drawB(t){bx.clearRect(0,0,bW,bH);pts.forEach(p=>{const a=p.a*(.4+.6*Math.sin(t*p.sp+p.ph));bx.globalAlpha=a;bx.beginPath();bx.arc(p.x,p.y,p.r,0,Math.PI*2);bx.fillStyle='rgba(255,180,220,1)';bx.fill();});bx.globalAlpha=1;requestAnimationFrame(drawB);}
initB();requestAnimationFrame(drawB);window.addEventListener('resize',initB);

const lid=document.getElementById('lid');
const ballerina=document.getElementById('ballerina');
const btn=document.getElementById('open-btn');
const msgBox=document.getElementById('msg-box');
const interior=document.getElementById('interior');

const msgs=[
  "eres la persona más bonita que conozco 🌸",
  "me alegras el día solo con existir 💕",
  "pienso en ti más de lo que debería ✨",
  "eres mi favorita, siempre 🌹",
  "ojalá siempre estés bien, Piojito 💫",
];
let msgIdx=0;
let isOpen=false;
let noteInterval=null;

const notes=['♪','♫','♬','🎵','🎶'];

function spawnNote(){
  const n=document.createElement('div');
  n.className='note';
  n.textContent=notes[Math.floor(Math.random()*notes.length)];
  n.style.left=(20+Math.random()*140)+'px';
  n.style.bottom=(60+Math.random()*60)+'px';
  n.style.animationDuration=(1.5+Math.random())+'s';
  interior.appendChild(n);
  setTimeout(()=>n.remove(),2500);
}

function openBox(){
  if(!isOpen){
    isOpen=true;
    lid.classList.add('open');
    ballerina.classList.add('spinning');
    btn.textContent='✦ Cerrar la cajita ✦';
    msgBox.textContent=msgs[msgIdx%msgs.length];
    msgIdx++;
    noteInterval=setInterval(spawnNote,600);
    spawnNote();
  } else {
    isOpen=false;
    lid.classList.remove('open');
    ballerina.classList.remove('spinning');
    btn.textContent='✦ Abrir la cajita ✦';
    msgBox.textContent='Haz clic para descubrir lo que guarda...';
    clearInterval(noteInterval);
  }
}

btn.addEventListener('click',openBox);
document.getElementById('scene').addEventListener('click',e=>{
  if(e.target===document.getElementById('key'))return;
  openBox();
});
