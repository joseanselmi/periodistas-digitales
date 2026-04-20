export type Slide = {
  type: 'title' | 'content' | 'bullets' | 'quote' | 'resources'
  heading?: string
  subheading?: string
  title?: string
  bullets?: string[]
  quote?: string
  author?: string
  items?: string[]
  notes?: string
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
            ${slide.subheading ? `<p style="font-size:1.1rem;color:${brand.text};opacity:0.8;line-height:1.7;">${slide.subheading}</p>` : ''}
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
          <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
            <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title ?? 'Recursos'}</h2>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;">
              ${(slide.items ?? []).map((item, i) => `
                <li style="display:flex;align-items:center;gap:1rem;font-size:1rem;color:${brand.text};opacity:0.85;padding:0.75rem 1rem;background:${brand.bg};border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                  <span style="color:${brand.primary};font-weight:700;font-size:0.85rem;">${String(i + 1).padStart(2, '0')}</span>
                  ${item}
                </li>`).join('')}
            </ul>
          </div>`

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
    body { background: ${brand.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
    #container { width: min(900px, 96vw); aspect-ratio: 16/9; position: relative; }
    .slide { display: none; width: 100%; height: 100%; }
    .slide.active { display: flex; }
    #nav { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.75rem; align-items: center; }
    #nav button { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: ${brand.text}; padding: 0.5rem 1.25rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; transition: background 0.2s; }
    #nav button:hover { background: rgba(255,255,255,0.15); }
    #nav button:disabled { opacity: 0.3; cursor: default; }
    #counter { color: ${brand.text}; opacity: 0.5; font-size: 0.8rem; min-width: 4rem; text-align: center; }
    #audio-indicator { position: fixed; top: 1rem; right: 1rem; display: none; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 0.4rem 0.75rem; font-size: 0.75rem; color: ${brand.primary}; }
    #audio-indicator.visible { display: flex; }
  </style>
</head>
<body>
  <div id="container">
    ${slidesHtml}
  </div>
  <div id="nav">
    <button id="prev" onclick="go(-1)">← Anterior</button>
    <span id="counter">1 / ${slides.length}</span>
    <button id="next" onclick="go(1)">Siguiente →</button>
  </div>
  ${hasAudio ? `<div id="audio-indicator">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
    <span id="audio-label">Reproduciendo</span>
  </div>` : ''}
  <script>
    let cur = 0;
    const slides = document.querySelectorAll('.slide');
    const audioUrls = ${audioData};
    let currentAudio = null;
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
      cur = Math.max(0, Math.min(n, slides.length - 1));
      slides[cur].classList.add('active');
      document.getElementById('counter').textContent = (cur+1) + ' / ' + slides.length;
      document.getElementById('prev').disabled = cur === 0;
      document.getElementById('next').disabled = cur === slides.length - 1;
      playSlideAudio(cur);
    }
    function go(d) { show(cur + d); }
    show(0);
  </script>
</body>
</html>`
}
