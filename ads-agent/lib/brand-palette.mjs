/**
 * brand-palette.mjs — Paleta oficial de Periodistas del Futuro IA
 * Aprobada por Jose Anselmi — extraída del carrusel del lunes (mayo 2026)
 * Coincide con la paleta de la web (sistemadeingresosdiariosia.com y leadr.cloud)
 */

export const PALETTE = {
  // Fondos
  bg:        '#07070f',   // fondo principal — negro azulado profundo
  bgSurface: '#0a0a18',   // superficies elevadas
  bgCard:    '#080810',   // tarjetas / contenedores

  // Marca — gradiente principal indigo → cyan
  indigo:    '#6366f1',
  cyan:      '#22d3ee',
  violet:    '#7c3aed',
  blue:      '#3b82f6',

  // Acentos secundarios
  amber:     '#f59e0b',   // urgencia / advertencia / monetización
  green:     '#22c55e',   // éxito / aprobación
  red:       '#ef4444',   // problema / alerta / mito

  // Texto
  textPrimary: '#f1f5f9',  // títulos y texto destacado
  textMuted:   '#94a3b8',  // body text
  textSubtle:  '#64748b',  // notas / secundario

  // Bordes
  border:    'rgba(255,255,255,0.06)',
  borderHi:  'rgba(255,255,255,0.14)',

  // Gradientes
  gradBrand:  'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
  gradAmber:  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  gradGreen:  'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
  gradRed:    'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',

  // Glows (radial para fondos)
  glowIndigo: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
  glowCyan:   'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)',
  glowAmber:  'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
  glowRed:    'radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 70%)',

  // Tipografía
  fontDisplay: "'Inter', system-ui, sans-serif",
  fontMono:    "'JetBrains Mono', monospace",

  // Tamaños de texto (carruseles 1080x1080)
  textSizes: {
    eyebrow:  '12px',   // label superior — uppercase, tracked
    small:    '21px',
    body:     '26px',
    bodyLg:   '32px',
    h3:       '40px',
    h2sm:     '44px',
    h2:       '52px',
    h2lg:     '56px',
    h1:       '68px',
    h1lg:     '72px',
    h1xl:     '80px',
    display:  '140px',  // números grandes / stats
  },
}

// CSS listo para pegar en cualquier HTML
export function paletteCSS() {
  return `
    :root {
      --bg:          ${PALETTE.bg};
      --bg-surface:  ${PALETTE.bgSurface};
      --bg-card:     ${PALETTE.bgCard};

      --indigo:      ${PALETTE.indigo};
      --cyan:        ${PALETTE.cyan};
      --violet:      ${PALETTE.violet};
      --amber:       ${PALETTE.amber};
      --green:       ${PALETTE.green};
      --red:         ${PALETTE.red};

      --text:        ${PALETTE.textPrimary};
      --muted:       ${PALETTE.textMuted};
      --subtle:      ${PALETTE.textSubtle};

      --border:      ${PALETTE.border};
      --border-hi:   ${PALETTE.borderHi};

      --grad-brand:  ${PALETTE.gradBrand};
      --grad-amber:  ${PALETTE.gradAmber};
      --grad-green:  ${PALETTE.gradGreen};
      --glow-indigo: ${PALETTE.glowIndigo};
    }
  `
}
