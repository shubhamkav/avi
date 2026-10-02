const videoIntro = document.getElementById('videoIntro');
const introVideo = document.getElementById('introVideo');
const introSource = document.getElementById('introSource');
const videoFallback = document.getElementById('videoFallback');
const videoProgress = document.getElementById('videoProgress');
const skipIntro = document.getElementById('skipIntro');
const playIntro = document.getElementById('playIntro');
const bookIntro = document.getElementById('bookIntro');
const closedBook = document.getElementById('closedBook');
const openBook = document.getElementById('openBook');
const siteShell = document.getElementById('siteShell');
const leftPage = document.getElementById('leftPage');
const rightPage = document.getElementById('rightPage');
const chapterLabel = document.getElementById('chapterLabel');
const pageNumber = document.getElementById('pageNumber');
const progressBar = document.getElementById('progressBar');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const soundToggle = document.getElementById('soundToggle');
const music = document.getElementById('music');
const scrapbook = document.getElementById('scrapbook');

const pages = [
  ['home','HOME'], ['about','ABOUT YOU'], ['story','OUR STORY'], ['reasons','REASONS'],
  ['memories','MEMORIES'], ['notes','NOTES']
];
let current = 0;
let transitioning = false;
let introFinished = false;
let introSourceIndex = 0;
const introSources = ['/assets/intro.mp4', '/intro.mp4'];
const musicSources = ['/assets/our-song.mp3', '/our-song.mp3'];

function setIntroSource(index = 0) {
  introSourceIndex = index;
  if (!introSource) return;
  introSource.src = introSources[index] || introSources[0];
  introVideo.load();
}

function setMusicSource(index = 0) {
  music.dataset.sourceIndex = String(index);
  music.src = musicSources[index] || musicSources[0];
  music.load();
}

function showBookIntro() {
  if (introFinished) return;
  introFinished = true;
  introVideo.pause();
  introVideo.currentTime = 0;
  videoIntro.classList.add('video-out');
  setTimeout(() => {
    videoIntro.style.display = 'none';
    bookIntro.classList.add('active');
    bookIntro.setAttribute('aria-hidden', 'false');
  }, 850);
}

introVideo.addEventListener('timeupdate', () => {
  if (introVideo.duration) videoProgress.style.width = `${(introVideo.currentTime / introVideo.duration) * 100}%`;
});
introVideo.addEventListener('ended', showBookIntro);
introVideo.addEventListener('error', () => {
  if (introSourceIndex < introSources.length - 1) {
    setIntroSource(introSourceIndex + 1);
    return;
  }
  videoFallback.classList.add('show');
  if (playIntro) playIntro.textContent = 'Video not found';
});
introVideo.addEventListener('loadeddata', () => {
  videoFallback.classList.remove('show');
  if (playIntro) playIntro.disabled = false;
});

async function playIntroWithSound() {
  if (introFinished) return;
  try {
    introVideo.muted = false;
    introVideo.volume = 1;
    await introVideo.play();
    // Keep the video's original audio/voice at full volume.
    introVideo.muted = false;
    introVideo.volume = 1;
    if (playIntro) {
      playIntro.textContent = 'Playing with sound';
      playIntro.classList.add('playing');
    }
  } catch (error) {
    console.warn('Intro video could not start:', error);
    videoFallback.classList.add('show');
  }
}

playIntro?.addEventListener('click', playIntroWithSound);
skipIntro.addEventListener('click', showBookIntro);

// Do not autoplay: mobile browsers block autoplay with sound.
// The user taps once, then the original voice/audio inside intro.mp4 plays.
introVideo.muted = false;
introVideo.playsInline = true;
setIntroSource(0);
setMusicSource(0);

function templateFor(key) {
  const t = document.getElementById(`${key}Template`);
  return t ? t.content.cloneNode(true) : document.createDocumentFragment();
}

function isMobileBook() {
  return window.matchMedia('(max-width: 700px)').matches;
}

function mobilePageCount() {
  return pages.length * 2;
}

function setPageContent(index) {
  const mobile = isMobileBook();
  const chapterIndex = mobile ? Math.floor(index / 2) : index;
  const sideIndex = mobile ? index % 2 : null;
  const [key, label] = pages[chapterIndex];

  leftPage.innerHTML = '';
  rightPage.innerHTML = '';

  const fragment = templateFor(key);
  const nodes = [...fragment.children];

  if (mobile) {
    // On mobile, each physical notebook page gets its own screen.
    // The next page replaces the current one instead of appearing underneath it.
    const node = nodes[sideIndex];
    if (node) leftPage.appendChild(node);
  } else {
    if (nodes[0]) leftPage.appendChild(nodes[0]);
    if (nodes[1]) rightPage.appendChild(nodes[1]);
  }

  const total = mobile ? mobilePageCount() : pages.length;
  pageNumber.textContent = String(index + 1).padStart(2, '0');
  const pageTotal = document.getElementById('pageTotal');
  if (pageTotal) pageTotal.textContent = String(total).padStart(2, '0');
  chapterLabel.textContent = `${label} · ${String(index + 1).padStart(2, '0')}`;
  progressBar.style.width = `${((index + 1) / total) * 100}%`;
  prevPage.disabled = index === 0;
  nextPage.disabled = index === total - 1;
  bindDynamicContent(key);
}

function makeTurningSheet(direction) {
  if (window.matchMedia('(max-width: 700px)').matches) return document.createElement('div');
  const source = direction === 'next' ? rightPage : leftPage;
  const sheet = source.cloneNode(true);
  sheet.classList.remove('left-page', 'right-page');
  sheet.classList.add('turning-sheet', direction === 'next' ? 'turn-forward' : 'turn-back');
  sheet.setAttribute('aria-hidden', 'true');
  scrapbook.appendChild(sheet);
  return sheet;
}

function renderPage(index) {
  setPageContent(index);
}

function goTo(index) {
  const total = isMobileBook() ? mobilePageCount() : pages.length;
  if (transitioning || index < 0 || index >= total || index === current) return;
  transitioning = true;
  const direction = index > current ? 'next' : 'prev';
  const isMobile = isMobileBook();
  if (isMobile) scrapbook.classList.add('mobile-transition');
  const turningSheet = makeTurningSheet(direction);

  scrapbook.classList.add('is-turning', direction === 'next' ? 'turning-next' : 'turning-prev');

  setTimeout(() => {
    current = index;
    setPageContent(current);
  }, isMobile ? 20 : 430);

  setTimeout(() => {
    if (turningSheet && turningSheet.isConnected) turningSheet.remove();
    scrapbook.classList.remove('is-turning', 'turning-next', 'turning-prev', 'mobile-transition');
    transitioning = false;
  }, isMobile ? 460 : 940);
}

function bindDynamicContent(key) {
  if (key === 'notes') loadNotes();
}

async function loadNotes() {
  const stack = document.getElementById('noteStack');
  if (!stack) return;
  try {
    const response = await fetch('/api/notes');
    const notes = await response.json();
    stack.innerHTML = notes.map(note => `<article class="note-card"><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.text)}</p></article>`).join('');
  } catch {
    stack.innerHTML = '<article class="note-card"><h3>A little reminder</h3><p>You matter more than you probably realize. ✦</p></article>';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
}

openBook.addEventListener('click', () => {
  if (closedBook.classList.contains('opening')) return;
  closedBook.classList.add('opening');
  openBook.classList.add('hide');
  setTimeout(() => bookIntro.classList.add('book-opened'), 620);
  setTimeout(() => {
    bookIntro.classList.add('exit');
    siteShell.classList.add('visible');
    siteShell.setAttribute('aria-hidden', 'false');
    startMusic();
    setTimeout(() => bookIntro.style.display = 'none', 1200);
  }, 1850);
});

soundToggle.addEventListener('click', async () => {
  if (music.paused) await startMusic();
  else { music.pause(); soundToggle.textContent = '🔇'; }
});

async function startMusic() {
  try {
    music.volume = 0.55;
    await music.play();
    soundToggle.textContent = '♫';
    soundToggle.setAttribute('aria-label', 'Pause music');
  } catch (error) {
    const currentSource = Number(music.dataset.sourceIndex || 0);
    if (currentSource < musicSources.length - 1) {
      setMusicSource(currentSource + 1);
      try {
        await music.play();
        soundToggle.textContent = '♫';
        soundToggle.setAttribute('aria-label', 'Pause music');
        return;
      } catch (_) {}
    }
    soundToggle.textContent = '♪';
    soundToggle.setAttribute('aria-label', 'Play music');
  }
}

music.addEventListener('error', () => {
  const currentSource = Number(music.dataset.sourceIndex || 0);
  if (currentSource < musicSources.length - 1) {
    setMusicSource(currentSource + 1);
    return;
  }
  soundToggle.textContent = '♪';
  soundToggle.title = 'Put our-song.mp3 inside public/assets/';
});

prevPage.addEventListener('click', () => goTo(current - 1));
nextPage.addEventListener('click', () => goTo(current + 1));
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); goTo(current + 1); }
  if (event.key === 'ArrowLeft') goTo(current - 1);
});

let touchX = 0;
document.addEventListener('touchstart', event => {
  if (!siteShell.classList.contains('visible')) return;
  touchX = event.changedTouches[0].clientX;
}, {passive:true});
document.addEventListener('touchend', event => {
  if (!siteShell.classList.contains('visible')) return;
  const dx = event.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 55) goTo(current + (dx < 0 ? 1 : -1));
}, {passive:true});

if (window.matchMedia('(pointer:fine)').matches) {
  scrapbook.addEventListener('mousemove', event => {
    const rect = scrapbook.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    scrapbook.style.setProperty('--rx', `${y * -1.2}deg`);
    scrapbook.style.setProperty('--ry', `${x * 1.6}deg`);
  });
  scrapbook.addEventListener('mouseleave', () => {
    scrapbook.style.setProperty('--rx', '0deg');
    scrapbook.style.setProperty('--ry', '0deg');
  });
}

function makePetals() {
  const wrap = document.getElementById('petals');
  for (let i = 0; i < 28; i++) {
    const petal = document.createElement('i');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDelay = `${-Math.random() * 18}s`;
    petal.style.animationDuration = `${11 + Math.random() * 12}s`;
    petal.style.opacity = `${.2 + Math.random() * .45}`;
    wrap.appendChild(petal);
  }
}

function burstHearts() {
  for (let i = 0; i < 24; i++) {
    const heart = document.createElement('span');
    heart.textContent = '♥';
    Object.assign(heart.style, {position:'fixed',left:'50%',top:'50%',zIndex:100,color:i%2?'#f2a0ae':'#fff',fontSize:`${12+Math.random()*22}px`,pointerEvents:'none',transition:'transform 1.15s cubic-bezier(.1,.7,.2,1),opacity 1.15s'});
    document.body.appendChild(heart);
    requestAnimationFrame(() => {
      heart.style.transform = `translate(${(Math.random()-.5)*520}px,${(Math.random()-.5)*460}px) rotate(${Math.random()*360}deg)`;
      heart.style.opacity = '0';
    });
    setTimeout(() => heart.remove(), 1300);
  }
}

makePetals();
renderPage(0);

let lastMobileMode = isMobileBook();
window.addEventListener('resize', () => {
  const nowMobile = isMobileBook();
  if (nowMobile === lastMobileMode) return;
  const chapterIndex = nowMobile ? Math.floor(current / 2) : Math.min(current, pages.length - 1);
  current = nowMobile ? chapterIndex * 2 : chapterIndex;
  setPageContent(current);
  lastMobileMode = nowMobile;
});


// Premium cursor light trail on desktop.
if (window.matchMedia('(pointer:fine)').matches) {
  let lastSpark = 0;
  document.addEventListener('pointermove', (event) => {
    const now = performance.now();
    if (now - lastSpark < 45) return;
    lastSpark = now;
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.setProperty('--dx', `${(Math.random() - .5) * 34}px`);
    spark.style.setProperty('--dy', `${(Math.random() - .5) * 34}px`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 720);
  });
}

// Add a small celebratory burst whenever the visitor changes chapter.
function chapterBurst() {
  const symbols = ['✦','·','♥','✧'];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span');
    s.textContent = symbols[i % symbols.length];
    Object.assign(s.style, {position:'fixed',left:'50%',top:'50%',zIndex:95,color:i%2?'#ff9bad':'#f5d4b4',fontSize:`${8+Math.random()*14}px`,pointerEvents:'none',opacity:'0'});
    s.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:.9},{transform:`translate(${(Math.random()-.5)*280}px,${(Math.random()-.5)*220}px) scale(0)`,opacity:0}],{duration:900+Math.random()*450,easing:'cubic-bezier(.16,1,.3,1)'});
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),1500);
  }
}
const originalGoTo = goTo;
goTo = function(index){
  if(index !== current) chapterBurst();
  return originalGoTo(index);
};
