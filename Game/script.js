'use strict';

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const CARDS = [
  { id:'moon',    em:'🌙', nm:'Luna',       prize:'poem',   pTitle:'Para la Luna de mi vida',  pEmoji:'🌙' },
  { id:'cherry',  em:'🍒', nm:'Cereza',     prize:'letter', pTitle:'Una carta para ti',        pEmoji:'💌' },
  { id:'flower',  em:'🌸', nm:'Flor',       prize:'coupon', pTitle:'Cupón Especial',           pEmoji:'🎀' },
  { id:'star',    em:'⭐', nm:'Estrella',   prize:'poem',   pTitle:'Eres mi estrella',         pEmoji:'⭐' },
  { id:'heart',   em:'💝', nm:'Corazón',    prize:'letter', pTitle:'Lo que siento',            pEmoji:'💝' },
  { id:'magic',   em:'✨', nm:'Magia',      prize:'coupon', pTitle:'Magia para ti',            pEmoji:'✨' },
];

const PRIZES = {
  poem: [
    `Eres la luna llena\nque ilumina mi noche más oscura.\nEres el amanecer\nque hace que todo valga la pena.\n\nGracias por existir,\nMoonCherry. 🌙`,
    `Como una estrella distante\nque guía a los marineros perdidos,\ntú guías mi corazón\nhacia donde debería estar.\n\nSiempre tuyo, Kinosaby. ⭐`,
  ],
  letter: [
    `Piojito,\n\nHay cosas que no sé cómo decirte en voz alta, así que las escribo aquí.\nEres la persona que más admiro. No por grandes razones, sino por las pequeñas: tu risa, tu forma de ver las cosas, tu corazón.\n\nGracias por dejarme quererte.\n\nCon todo, Kinosaby 💌`,
    `MoonCherry,\n\nCada vez que te veo, pienso que el universo hizo algo muy bien el día que te creó.\n\nNo tengo palabras suficientes, pero sí tengo todo el tiempo del mundo para seguir buscándolas.\n\nSiempre, Kinosaby 💝`,
  ],
  coupon: [
    { emoji:'🍕', title:'Cupón: Pizza Date', desc:'Válido por una noche de pizza y películas, tú eliges todo. Sin límite de tiempo ni de rebanadas.', seal:'CANJEABLE CUANDO QUIERAS' },
    { emoji:'💆', title:'Cupón: Día de Mimos', desc:'Un día completo dedicado a ti: masajes, tu música favorita, tus snacks favoritos y toda mi atención solo para ti.', seal:'VÁLIDO POR SIEMPRE' },
    { emoji:'🌙', title:'Cupón: Noche de Estrellas', desc:'Una noche bajo las estrellas juntos. Yo llevo la cobija, tú traes tu sonrisa.', seal:'INCLUYE ABRAZOS ILIMITADOS' },
  ],
};

const WIN_MESSAGES = [
  `¡Lo encontraste todo!\nEres increíble, MoonCherry.\nCada par que encontraste\nes un pedacito de lo que siento por ti. 💝`,
  `¡Completaste el juego!\nPero el verdadero premio\neres tú, que estás aquí.\nGracias por jugar conmigo. 🌸`,
];

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let flipped = [], matched = [], moves = 0, gameCount = 1, locked = false;
let typingInterval = null;

/* ═══════════════════════════════════════════════
   STARS & PETALS
═══════════════════════════════════════════════ */
function makeStars() {
  const el = document.getElementById('stars');
  el.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${(Math.random()*4+2).toFixed(1)}s;--del:${(Math.random()*4).toFixed(1)}s`;
    el.appendChild(s);
  }
}

function makePetals() {
  const el = document.getElementById('petals');
  el.innerHTML = '';
  const emojis = ['🌸','🌺','🌷','✿','❀','🌹'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = `left:${Math.random()*100}%;animation-duration:${(Math.random()*8+6).toFixed(1)}s;animation-delay:${(Math.random()*10).toFixed(1)}s;font-size:${(Math.random()*0.8+0.7).toFixed(1)}rem`;
    el.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════════ */
function burst(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const emojis = ['🌸','⭐','💝','✨','🌙','🍒'];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const tx = (Math.random() - 0.5) * 160, ty = (Math.random() - 0.5) * 160;
    const r  = Math.random() * 360;
    p.style.cssText = `left:${cx}px;top:${cy}px;--tx:${tx}px;--ty:${ty}px;--r:${r}deg`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

/* ═══════════════════════════════════════════════
   PRIZE MODAL
═══════════════════════════════════════════════ */
function showPrize(card) {
  const overlay = document.getElementById('prizeOverlay');
  const body    = document.getElementById('prizeBody');
  const emoji   = document.getElementById('pEmoji');
  const title   = document.getElementById('pTitle');

  emoji.textContent = card.pEmoji;
  title.textContent = card.pTitle;
  body.innerHTML    = '';

  if (card.prize === 'poem') {
    const poem = PRIZES.poem[Math.floor(Math.random() * PRIZES.poem.length)];
    const div  = document.createElement('div');
    div.className = 'prize-poem';
    div.textContent = poem;
    body.appendChild(div);

  } else if (card.prize === 'letter') {
    const letter = PRIZES.letter[Math.floor(Math.random() * PRIZES.letter.length)];
    const box = document.createElement('div');
    box.className = 'prize-letter';
    body.appendChild(box);
    if (typingInterval) clearInterval(typingInterval);
    let i = 0;
    typingInterval = setInterval(() => {
      if (i < letter.length) {
        box.innerHTML = letter.slice(0, ++i).replace(/\n/g, '<br>') + '<span class="cursor">|</span>';
      } else {
        box.innerHTML = letter.replace(/\n/g, '<br>');
        clearInterval(typingInterval);
      }
    }, 28);

  } else if (card.prize === 'coupon') {
    const c = PRIZES.coupon[Math.floor(Math.random() * PRIZES.coupon.length)];
    body.innerHTML = `
      <div class="prize-coupon">
        <span class="c-emoji">${c.emoji}</span>
        <div class="c-title">${c.title}</div>
        <div class="c-desc">${c.desc}</div>
        <div class="c-seal">✦ ${c.seal} ✦</div>
      </div>`;
  }

  overlay.classList.add('show');
}

function closePrize() {
  document.getElementById('prizeOverlay').classList.remove('show');
  if (typingInterval) clearInterval(typingInterval);
}
window.closePrize = closePrize;

/* ═══════════════════════════════════════════════
   WIN
═══════════════════════════════════════════════ */
function showWin() {
  setTimeout(() => {
    const overlay = document.getElementById('winOverlay');
    document.getElementById('winMsg').textContent = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
    overlay.classList.add('show');
  }, 600);
}

/* ═══════════════════════════════════════════════
   GAME LOGIC
═══════════════════════════════════════════════ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newGame() {
  flipped = []; matched = []; moves = 0; locked = false;
  document.getElementById('moveCnt').textContent = '0';
  document.getElementById('matchCnt').textContent = '0';
  document.getElementById('winOverlay').classList.remove('show');
  document.getElementById('prizeOverlay').classList.remove('show');
  if (typingInterval) clearInterval(typingInterval);
  buildGrid();
  if (document.getElementById('gameCnt').textContent !== '1') {
    gameCount++;
    document.getElementById('gameCnt').textContent = gameCount;
  }
}
window.newGame = newGame;

function buildGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const deck = shuffle([...CARDS, ...CARDS]);

  deck.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = card.id;
    el.dataset.idx = i;
    el.innerHTML = `
      <div class="card-inner">
        <div class="card-back">
          <span class="symbol">🌸</span>
        </div>
        <div class="card-front">
          <span class="em">${card.em}</span>
          <span class="nm">${card.nm}</span>
        </div>
      </div>`;
    el.addEventListener('click', () => flipCard(el, card));
    grid.appendChild(el);
  });
}

function flipCard(el, card) {
  if (locked) return;
  if (el.classList.contains('flipped') || el.classList.contains('matched')) return;
  if (flipped.length >= 2) return;

  el.classList.add('flipped');
  flipped.push({ el, card });

  if (flipped.length === 2) {
    moves++;
    document.getElementById('moveCnt').textContent = moves;
    locked = true;

    if (flipped[0].card.id === flipped[1].card.id) {
      // Match
      setTimeout(() => {
        flipped.forEach(f => { f.el.classList.add('matched'); burst(f.el); });
        matched.push(flipped[0].card.id);
        document.getElementById('matchCnt').textContent = matched.length;
        const prizeCard = flipped[0].card;
        flipped = []; locked = false;
        setTimeout(() => showPrize(prizeCard), 400);
        if (matched.length === CARDS.length) showWin();
      }, 400);
    } else {
      // No match
      setTimeout(() => {
        flipped.forEach(f => f.el.classList.remove('flipped'));
        flipped = []; locked = false;
      }, 900);
    }
  }
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
makeStars(); makePetals(); newGame();
