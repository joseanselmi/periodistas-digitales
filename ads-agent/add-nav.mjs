import { readFileSync, writeFileSync } from 'fs'

const files = [
  'carousels/semana-12-05/lunes-prompt-maestro.html',
  'carousels/semana-12-05/miercoles-whatsapp.html',
  'carousels/semana-12-05/viernes-primer-anunciante.html',
  'carousels/semana-12-05/domingo-google-noticias.html',
]

const navCSS = `
  body { margin:0 !important; padding:0 !important; background:#000 !important; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .info { display:none !important; }
  .slides { gap:0 !important; }
  .slide { display:none !important; }
  .slide.active { display:flex !important; }
  .controls {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    display:flex; gap:16px; align-items:center;
    background:rgba(0,0,0,.85); border:1px solid rgba(255,255,255,.12);
    padding:10px 24px; border-radius:100px; z-index:999;
    font-family:'Inter',system-ui,sans-serif;
  }
  .nav-btn {
    background:#6366f1; color:#fff; border:none;
    padding:8px 22px; border-radius:100px; font-size:14px; font-weight:700;
    cursor:pointer;
  }
  .nav-btn:disabled { opacity:.25; cursor:default; }
  .nav-counter { color:#94a3b8; font-size:13px; min-width:54px; text-align:center; }
  .nav-hint { position:fixed; top:16px; left:50%; transform:translateX(-50%);
    color:#374151; font-size:12px; font-family:'Inter',system-ui,sans-serif; letter-spacing:.06em; white-space:nowrap; }
`

const navHTML = `
<p class="nav-hint">WIN + SHIFT + S para capturar &nbsp;·&nbsp; ← → para navegar</p>
<div class="controls">
  <button class="nav-btn" id="prevBtn">← Anterior</button>
  <span class="nav-counter" id="navCounter">1 / ?</span>
  <button class="nav-btn" id="nextBtn">Siguiente →</button>
</div>
<script>
(function() {
  const slides = document.querySelectorAll('.slide')
  let cur = 0
  const counter = document.getElementById('navCounter')
  const prev = document.getElementById('prevBtn')
  const next = document.getElementById('nextBtn')
  counter.textContent = '1 / ' + slides.length
  slides[0].classList.add('active')
  prev.disabled = true
  function go(dir) {
    slides[cur].classList.remove('active')
    cur = Math.max(0, Math.min(slides.length - 1, cur + dir))
    slides[cur].classList.add('active')
    counter.textContent = (cur + 1) + ' / ' + slides.length
    prev.disabled = cur === 0
    next.disabled = cur === slides.length - 1
  }
  prev.addEventListener('click', () => go(-1))
  next.addEventListener('click', () => go(1))
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  })
})()
</script>
`

for (const file of files) {
  let html = readFileSync(file, 'utf-8')
  html = html.replace('</style>', navCSS + '\n</style>')
  html = html.replace('</body>', navHTML + '\n</body>')
  writeFileSync(file, html)
  console.log('✅ ' + file)
}

console.log('\n👉 Abrí cada HTML en Chrome — usá ← → o los botones para navegar entre slides')
console.log('   Capturá cada uno con Win+Shift+S')
