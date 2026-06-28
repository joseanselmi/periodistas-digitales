export const BRAND = {
  product: 'Sistema de Ingresos Diarios para Periodistas',
  price: 27,
  perceivedValue: 227,
  landingUrl: 'https://sistemadeingresosdiariosia.com',
  hotmartUrl: 'https://pay.hotmart.com/P106404871J?checkoutMode=10&src=Landing-page-1&sck=b2',

  audience: {
    description: 'Periodistas latinoamericanos 30-55 años',
    primaryMarkets: ['Colombia', 'México', 'Chile'],
    ageRange: '30-55',
    language: 'es-latam', // usar "tú" no "vos"
  },

  aesthetic: [
    'Oscuro, moderno, tecnológico, profesional',
    'Sin stock photos genéricos',
    'Sin dinero en efectivo',
    'Sin dashboards financieros tipo trading',
    'Iluminación dramática azul/púrpura',
    'Personas latinoamericanas 30-55 años',
  ],

  // Paleta oficial aprobada por Jose Anselmi (mayo 2026)
  // Fuente: lib/brand-palette.mjs
  palette: {
    bg:           '#07070f',
    gradBrand:    'linear-gradient(135deg, #6366f1, #22d3ee)',
    indigo:       '#6366f1',
    cyan:         '#22d3ee',
    amber:        '#f59e0b',
    green:        '#22c55e',
    red:          '#ef4444',
    textPrimary:  '#f1f5f9',
    textMuted:    '#94a3b8',
    fontDisplay:  'Inter',
    fontMono:     'JetBrains Mono',
  },

  valueProposition: 'Crear un periódico digital con IA y generar ingresos reales sin dejar el trabajo actual',

  socialProof: 'Más de 5.500 periodistas en Latinoamérica',

  // Oferta actual (mayo 2026) — DIFERENTE a campañas anteriores
  offer: {
    price: 10,
    perceivedValue: 227,
    keyDifferentiator: 'Incluye 1 mes de Leadr — plataforma propia de formación IA para periodistas ($97 valor). Nadie más puede dar este bono.',
    bonuses: [
      { name: 'IA para Periodistas (micro curso)', value: 47 },
      { name: 'Canva +100 diseños para medios', value: 27 },
      { name: 'Leadr — 1 mes gratis (plataforma exclusiva)', value: 97 },
      { name: '+50 Prompts periodísticos', value: 9 },
    ],
    totalValue: 227,
    notes: 'Leadr es el diferenciador único — es un producto propio que ningún competidor puede replicar. Usarlo como argumento de cierre en los copies.',
  },

  metaPolicy: [
    'Sin claims de ingresos garantizados',
    'Sin "hacerse rico rápido"',
    'Sin imágenes de dinero en efectivo',
    'Texto en imagen < 20% del área',
    'Sin before/after con resultados extremos',
    'Prueba social verificable o expresada con cautela',
  ],

  awarenessLevels: {
    1: 'Problema — activa el miedo al desplazamiento laboral, no menciona el producto',
    2: 'Solución — muestra el sistema y resultado concreto, menciona IA y periódico digital',
    3: 'Precio — precio vs valor percibido, prueba social, urgencia de lanzamiento',
  },

  // Benchmarks reales de campañas anteriores (Meta Ads histórico)
  benchmarks: {
    cpaTarget: 10.50,        // CPA promedio histórico $9.93-$10.72
    ctrMin: 1.50,            // CTR mínimo aceptable (%)
    ctrGood: 2.00,           // CTR bueno (PRODUCTO 2 VENTAS)
    ctrExcellent: 2.69,      // CTR excelente (mejor campaña histórica)
    cvrTarget: 3.0,          // CVR landing page objetivo (%)
    cpmRange: [3.0, 6.0],    // CPM histórico USD
    realRoasTarget: 2.5,     // ROAS real incluyendo order bumps (~$26-30 AOV)
    // Nota: ROAS reportado en Meta parece bajo (0.89-1.03) porque
    // solo trackea front-end $10 — el real con OBs es ~2.5x
  },

  // Mercados reales por volumen de ventas históricas
  topMarkets: [
    'Ecuador',      // Mayor volumen histórico
    'Puerto Rico',  // Segundo mayor volumen
    'Colombia',     // Alto volumen, mercado principal nuevo
    'México',       // Alto volumen
    'EEUU hispano', // Florida, Texas, California, NY
    'Chile',
    'República Dominicana',
    'Uruguay',
  ],

  // Ángulo que más ha convertido históricamente
  winningAngle: 'IA + periodismo — "IA para Periodistas" fue el producto más vendido. El ángulo de IA resuena más que "sistema de ingresos" o "método".',
}
