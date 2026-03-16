// Falling gerbera petals
const colors = ['#f07040', '#e8608a', '#f5c842', '#e85530', '#d03a6a'];
for (let i = 0; i < 18; i++) {
  const p = document.createElement('div');
  p.className = 'petal-fall';
  const c = colors[Math.floor(Math.random() * colors.length)];
  const sz = 8 + Math.random() * 10;
  p.innerHTML = `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="4" ry="9" fill="${c}" opacity="0.7" transform="rotate(${Math.random() * 360} 10 10)"/></svg>`;
  p.style.left = Math.random() * 100 + 'vw';
  p.style.animationDuration = (7 + Math.random() * 8) + 's';
  p.style.animationDelay = (Math.random() * 10) + 's';
  document.body.appendChild(p);
}

// Click sparkle effect
const sparks = ['🌼', '💛', '🌸', '✨', '💫', '🧡'];
document.getElementById('card').addEventListener('click', function (e) {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.textContent = sparks[Math.floor(Math.random() * sparks.length)];
    s.style.cssText = `
        position:fixed;
        left:${e.clientX + (Math.random() - 0.5) * 110}px;
        top:${e.clientY + (Math.random() - 0.5) * 110}px;
        font-size:${12 + Math.random() * 16}px;
        pointer-events:none; z-index:9999;
        animation: sparkPop 0.9s ease-out forwards;
      `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
});
