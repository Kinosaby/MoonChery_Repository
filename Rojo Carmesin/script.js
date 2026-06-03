/* STARS */
const starsEl=document.getElementById('stars');
for(let i=0;i<220;i++){
  const s=document.createElement('div'); s.className='star';
  const sz=Math.random()*2.4+.6;
  s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*55}%;width:${sz}px;height:${sz}px;background:${Math.random()>.6?'rgba(255,200,230,1)':'rgba(220,160,255,1)'};--lo:${(Math.random()*.4+.2).toFixed(2)};--dur:${(Math.random()*3+2).toFixed(1)}s;animation-delay:${(Math.random()*5).toFixed(2)}s;`;
  starsEl.appendChild(s);
}
/* CLOUDS */
const cloudsEl=document.getElementById('clouds');
[[5,-2,380,110,'rgba(20,0,35,0.88)',22,.82,'55s'],[3,28,500,140,'rgba(28,0,45,0.84)',26,.78,'70s'],[8,55,320,100,'rgba(15,0,28,0.90)',18,.85,'48s'],[2,70,420,130,'rgba(35,0,55,0.75)',20,.70,'62s'],[10,10,280,90,'rgba(40,0,60,0.70)',14,.65,'40s']].forEach(([top,left,w,h,color,blur,op,dur],i)=>{
  const c=document.createElement('div'); c.className='cloud';
  c.style.cssText=`top:${top}%;left:${left}%;width:${w}px;height:${h}px;--cc:${color};--cb:${blur}px;--co:${op};--cd:${dur};animation-direction:${i%2===0?'alternate':'alternate-reverse'};`;
  cloudsEl.appendChild(c);
});
/* TREES */
const forestEl=document.getElementById('forest');
for(let i=0;i<38;i++){
  const t=document.createElement('div'); t.className='tree';
  const w=Math.random()*28+18,h=Math.random()*90+60;
  t.style.cssText=`left:${(i/38)*102-1}%;--w:${w}px;--h:${h}px;`;
  forestEl.appendChild(t);
}
/* LAKE RIPPLES */
const lake=document.getElementById('lake');
for(let i=0;i<20;i++){
  const r=document.createElement('div'); r.className='lake-ripple';
  r.style.cssText=`left:${8+Math.random()*84}%;top:${15+Math.random()*65}%;--lr:${(Math.random()*3).toFixed(2)}s;`;
  lake.appendChild(r);
}
/* RAIN */
function makeRain(id,count,op){
  const el=document.getElementById(id);
  for(let i=0;i<count;i++){
    const d=document.createElement('div'); d.className='drop';
    d.style.cssText=`--rx:${Math.random()*100}%;--rh:${Math.random()*22+10}px;--rd:${(Math.random()*.6+.5).toFixed(2)}s;--rde:${(Math.random()*1.5).toFixed(2)}s;opacity:${op};`;
    el.appendChild(d);
  }
}
makeRain('rain1',180,.55); makeRain('rain2',90,.3);
