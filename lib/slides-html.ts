export type ResourceItem = { text: string; url?: string; tag?: string }

export type Slide = {
  type: 'title' | 'content' | 'bullets' | 'quote' | 'resources' | 'checklist' | 'practice' | 'errors' | 'exercise' | 'diagram'
  heading?: string
  subheading?: string
  title?: string
  bullets?: string[]
  items?: Array<string | ResourceItem>
  steps?: string[]
  tip?: string
  task?: string
  quote?: string
  author?: string
  notes?: string
  center?: string
  nodes?: string[]
}

export type BrandConfig = {
  primary: string
  secondary: string
  bg: string
  surface: string
  text: string
}

const DEFAULT_BRAND: BrandConfig = {
  primary: '#22D3EE',
  secondary: '#7C3AED',
  bg: '#020617',
  surface: '#0F172A',
  text: '#F8FAFC',
}

function slideHtml(slide: Slide, brand: BrandConfig, index: number, total: number): string {
  const progress = Math.round(((index + 1) / total) * 100)

  const content = (() => {
    switch (slide.type) {
      case 'title':
        return `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:4rem;">
            <div style="width:48px;height:4px;background:${brand.primary};border-radius:2px;margin-bottom:2rem;"></div>
            <h1 style="font-size:2.8rem;font-weight:700;color:${brand.text};line-height:1.2;margin-bottom:1rem;max-width:800px;">${slide.heading ?? ''}</h1>
            ${slide.subheading ? `<p style="font-size:1.25rem;color:${brand.primary};opacity:0.8;">${slide.subheading}</p>` : ''}
          </div>`

      case 'content':
        return `
          <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
            <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:1.5rem;">${slide.title ?? ''}</h2>
            ${slide.subheading ? `<p style="font-size:1.1rem;color:${brand.text};opacity:0.85;line-height:1.8;">${slide.subheading}</p>` : ''}
          </div>`

      case 'bullets':
        return `
          <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
            <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title ?? ''}</h2>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">
              ${(slide.bullets ?? []).map(b => `
                <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};opacity:0.9;line-height:1.5;">
                  <span style="width:8px;height:8px;border-radius:50%;background:${brand.primary};margin-top:0.45rem;flex-shrink:0;"></span>
                  ${b}
                </li>`).join('')}
            </ul>
          </div>`

      case 'checklist':
        return `
          <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
            <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title ?? 'Qué vas a aprender'}</h2>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">
              ${(slide.items ?? []).map(item => {
                const text = typeof item === 'string' ? item : item.text
                return `
                <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};line-height:1.5;">
                  <span style="width:20px;height:20px;border-radius:50%;background:${brand.primary}25;border:1.5px solid ${brand.primary};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:0.1rem;">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="${brand.primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  ${text}
                </li>`
              }).join('')}
            </ul>
          </div>`

      case 'practice':
        return `
          <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;overflow:auto;">
            <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:1.75rem;">${slide.title ?? 'Ejemplo práctico'}</h2>
            <ol style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.875rem;">
              ${(slide.steps ?? []).map((step, i) => `
                <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1rem;color:${brand.text};opacity:0.9;line-height:1.5;">
                  <span style="width:26px;height:26px;border-radius:8px;background:${brand.primary};color:${brand.bg};font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</span>
                  ${step}
                </li>`).join('')}
            </ol>
            ${slide.tip ? `
              <div style="margin-top:1.5rem;padding:1rem 1.25rem;background:${brand.primary}15;border:1px solid ${brand.primary}40;border-radius:10px;font-size:0.9rem;color:${brand.text};opacity:0.9;">
                <span style="color:${brand.primary};font-weight:600;">💡 Tip: </span>${slide.tip}
              </div>` : ''}
          </div>`

      case 'errors':
        return `
          <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
            <h2 style="font-size:2rem;font-weight:700;color:#F87171;margin-bottom:2rem;">${slide.title ?? 'Errores comunes'}</h2>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">
              ${(slide.bullets ?? []).map(b => `
                <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};opacity:0.9;line-height:1.5;">
                  <span style="width:20px;height:20px;border-radius:50%;background:#EF444425;border:1.5px solid #EF4444;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:0.1rem;font-size:0.7rem;color:#EF4444;font-weight:700;">✕</span>
                  ${b}
                </li>`).join('')}
            </ul>
          </div>`

      case 'exercise':
        return `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:3rem;text-align:center;">
            <div style="background:${brand.primary}10;border:1px solid ${brand.primary}35;border-radius:20px;padding:2.5rem 3rem;max-width:640px;width:100%;">
              <div style="font-size:2.5rem;margin-bottom:1rem;">🎯</div>
              <h2 style="font-size:1.75rem;font-weight:700;color:${brand.text};margin-bottom:0.75rem;">${slide.title ?? 'Tu ejercicio'}</h2>
              ${slide.subheading ? `<p style="font-size:1rem;color:${brand.text};opacity:0.7;line-height:1.6;margin-bottom:1.5rem;">${slide.subheading}</p>` : ''}
              ${slide.task ? `
                <div style="background:${brand.bg};border-radius:12px;padding:1.25rem 1.5rem;border:1px solid ${brand.primary}25;">
                  <p style="color:${brand.primary};font-size:0.95rem;font-weight:500;line-height:1.6;">${slide.task}</p>
                </div>` : ''}
            </div>
          </div>`

      case 'quote':
        return `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:4rem;text-align:center;">
            <div style="font-size:4rem;color:${brand.primary};opacity:0.4;line-height:1;margin-bottom:1rem;">"</div>
            <blockquote style="font-size:1.5rem;color:${brand.text};line-height:1.6;max-width:700px;font-style:italic;margin:0 0 1.5rem;">
              ${slide.quote ?? ''}
            </blockquote>
            ${slide.author ? `<p style="color:${brand.primary};font-size:0.95rem;font-weight:500;">— ${slide.author}</p>` : ''}
          </div>`

      case 'resources':
        return `
          <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;overflow:auto;">
            <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title ?? 'Recursos'}</h2>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;">
              ${(slide.items ?? []).map((item, i) => {
                const isObj = typeof item === 'object' && item !== null
                const text = isObj ? (item as ResourceItem).text : String(item)
                const url = isObj ? (item as ResourceItem).url : undefined
                const tag = isObj ? (item as ResourceItem).tag : undefined
                return `
                <li style="display:flex;align-items:center;gap:1rem;font-size:1rem;color:${brand.text};padding:0.75rem 1rem;background:${brand.bg};border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                  <span style="color:${brand.primary};font-weight:700;font-size:0.8rem;min-width:22px;">${String(i + 1).padStart(2, '0')}</span>
                  <span style="flex:1;opacity:0.85;">${url ? `<a href="${url}" target="_blank" style="color:${brand.text};text-decoration:underline;text-underline-offset:3px;opacity:0.85;">${text}</a>` : text}</span>
                  ${tag ? `<span style="font-size:0.7rem;padding:0.2rem 0.6rem;background:${brand.primary}20;color:${brand.primary};border-radius:20px;white-space:nowrap;">${tag}</span>` : ''}
                </li>`
              }).join('')}
            </ul>
          </div>`

      case 'diagram': {
        const nodes = slide.nodes ?? []
        const cols = nodes.length <= 3 ? nodes.length : Math.ceil(nodes.length / 2)
        const hasText = !!slide.subheading
        return `
          <div style="display:flex;flex-direction:column;height:100%;padding:2.25rem 3rem;gap:1rem;box-sizing:border-box;overflow:auto;">
            <h2 style="font-size:1.5rem;font-weight:700;color:${brand.text};flex-shrink:0;">${slide.title ?? ''}</h2>
            ${hasText ? `<p style="font-size:0.95rem;color:${brand.text};opacity:0.75;line-height:1.65;flex-shrink:0;">${slide.subheading}</p>` : ''}
            <div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;flex:1;justify-content:center;">
              <div style="background:${brand.primary};color:${brand.bg};padding:0.55rem 1.75rem;border-radius:12px;font-size:0.95rem;font-weight:700;text-align:center;box-shadow:0 0 20px ${brand.primary}44;flex-shrink:0;">
                ${slide.center ?? ''}
              </div>
              <div style="width:2px;height:14px;background:linear-gradient(${brand.primary},${brand.primary}00);flex-shrink:0;"></div>
              <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:0.6rem;width:100%;">
                ${nodes.map((n, i) => `
                  <div style="background:${brand.bg};border:1px solid ${brand.primary}35;border-radius:10px;padding:0.6rem 0.75rem;text-align:center;font-size:0.8rem;color:${brand.text};opacity:0.9;">
                    <span style="display:block;width:18px;height:18px;border-radius:50%;background:${brand.primary}20;border:1.5px solid ${brand.primary}60;color:${brand.primary};font-size:0.6rem;font-weight:700;line-height:18px;text-align:center;margin:0 auto 0.3rem;">${i + 1}</span>
                    ${n}
                  </div>`).join('')}
              </div>
            </div>
          </div>`
      }

      default:
        return `<div style="padding:3.5rem 4rem;"><p style="color:${brand.text};">${JSON.stringify(slide)}</p></div>`
    }
  })()

  return `
    <div class="slide" style="width:100%;height:100%;background:${brand.surface};border-radius:16px;overflow:hidden;position:relative;flex-direction:column;">
      <!-- Progress bar -->
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.06);">
        <div style="height:100%;width:${progress}%;background:${brand.primary};transition:width 0.3s;"></div>
      </div>
      <!-- Slide number -->
      <div style="position:absolute;bottom:1.5rem;right:2rem;font-size:0.75rem;color:${brand.text};opacity:0.3;font-family:monospace;">
        ${index + 1} / ${total}
      </div>
      ${content}
    </div>`
}

export function generateSlidesHTML(
  slides: Slide[],
  brand: BrandConfig = DEFAULT_BRAND,
  audioUrls?: string[]
): string {
  const slidesHtml = slides.map((s, i) => slideHtml(s, brand, i, slides.length)).join('\n')
  const hasAudio = audioUrls && audioUrls.length > 0
  const audioData = hasAudio ? JSON.stringify(audioUrls) : 'null'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Slides</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${brand.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    #container { width: min(900px, 96vw); aspect-ratio: 16/9; position: relative; }
    .slide { display: none; width: 100%; height: 100%; }
    .slide.active { display: flex; }

    /* Nav bar */
    #nav { position: fixed; bottom: 1.25rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; align-items: center; background: rgba(2,6,23,0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.4rem 0.5rem; backdrop-filter: blur(8px); }
    #nav button { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: ${brand.text}; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; transition: background 0.15s; display: flex; align-items: center; gap: 0.4rem; min-height: 36px; }
    #nav button:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
    #nav button:disabled { opacity: 0.25; cursor: default; }
    #counter { color: ${brand.text}; opacity: 0.45; font-size: 0.75rem; min-width: 3.5rem; text-align: center; }

    /* Hint inicial */
    #hint { position: fixed; bottom: 4.5rem; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.4rem; opacity: 1; transition: opacity 0.5s; pointer-events: none; }
    #hint.hidden { opacity: 0; }
    #hint-text { color: ${brand.primary}; font-size: 0.75rem; font-weight: 500; white-space: nowrap; }
    #hint-arrow { width: 20px; height: 20px; border-right: 2px solid ${brand.primary}; border-bottom: 2px solid ${brand.primary}; transform: rotate(45deg); animation: bounce 1s ease-in-out infinite; opacity: 0.7; }
    @keyframes bounce { 0%,100% { transform: rotate(45deg) translateY(0); } 50% { transform: rotate(45deg) translateY(4px); } }

    /* Zonas táctiles laterales */
    #tap-prev, #tap-next { position: fixed; top: 0; bottom: 4rem; width: 20%; cursor: pointer; z-index: 10; }
    #tap-prev { left: 0; }
    #tap-next { right: 0; }

    /* Barra de progreso */
    #progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: ${brand.primary}; transition: width 0.3s ease; opacity: 0.7; }

    #audio-indicator { position: fixed; top: 1rem; right: 1rem; display: none; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 0.4rem 0.75rem; font-size: 0.75rem; color: ${brand.primary}; }
    #audio-indicator.visible { display: flex; }
  </style>
</head>
<body>
  <div id="progress-bar"></div>

  <div id="container">
    ${slidesHtml}
  </div>

  <!-- Zonas táctiles -->
  <div id="tap-prev" onclick="go(-1)"></div>
  <div id="tap-next" onclick="go(1)"></div>

  <!-- Hint inicial -->
  <div id="hint">
    <span id="hint-text">Tocá el lado derecho o usá las flechas para avanzar</span>
    <div id="hint-arrow"></div>
  </div>

  <div id="nav">
    <button id="prev" onclick="go(-1)">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      Anterior
    </button>
    <span id="counter">1 / ${slides.length}</span>
    <button id="next" onclick="go(1)">
      Siguiente
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </button>
  </div>

  ${hasAudio ? `<div id="audio-indicator">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
    <span id="audio-label">Reproduciendo</span>
  </div>` : ''}

  <script>
    let cur = 0;
    const slides = document.querySelectorAll('.slide');
    const total = slides.length;
    const audioUrls = ${audioData};
    let currentAudio = null;
    let hintDismissed = false;

    function dismissHint() {
      if (hintDismissed) return;
      hintDismissed = true;
      document.getElementById('hint').classList.add('hidden');
    }

    function playSlideAudio(index) {
      if (!audioUrls || !audioUrls[index]) return;
      if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
      currentAudio = new Audio(audioUrls[index]);
      const indicator = document.getElementById('audio-indicator');
      if (indicator) {
        indicator.classList.add('visible');
        currentAudio.onended = () => indicator.classList.remove('visible');
        currentAudio.onerror = () => indicator.classList.remove('visible');
      }
      currentAudio.play().catch(() => {});
    }

    function show(n) {
      slides[cur].classList.remove('active');
      cur = Math.max(0, Math.min(n, total - 1));
      slides[cur].classList.add('active');
      document.getElementById('counter').textContent = (cur + 1) + ' / ' + total;
      document.getElementById('prev').disabled = cur === 0;
      document.getElementById('next').disabled = cur === total - 1;
      document.getElementById('progress-bar').style.width = ((cur + 1) / total * 100) + '%';
      playSlideAudio(cur);
      dismissHint();
    }

    function go(d) { show(cur + d); }

    // Teclado
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
    });

    // Swipe táctil
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        go(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    // Auto-dismiss hint después de 4 segundos
    setTimeout(dismissHint, 4000);

    show(0);
  </script>
</body>
</html>`
}
