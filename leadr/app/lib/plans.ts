// ─── LINKS DE HOTMART ────────────────────────────────────────────────────────
export const HOTMART_PRO_URL     = 'https://pay.hotmart.com/F105860238T?checkoutMode=10'
export const HOTMART_ANNUAL_URL  = 'https://pay.hotmart.com/F105964002O?checkoutMode=10'
// ─────────────────────────────────────────────────────────────────────────────

export const PLANS = {
  basic: {
    label: 'Basic',
    price: 'Gratis',
    features: ['Acceso a clases gratuitas', 'Progreso guardado'],
  },
  pro: {
    label: 'Pro',
    price: '$10/mes',
    features: [
      'Todo el contenido sin límites',
      'Clases de automatización',
      'Prompts exclusivos',
      'Contenido nuevo cada semana',
    ],
  },
  pro_annual: {
    label: 'Anual',
    price: '$84/año',
    priceMonthly: '$7/mes',
    savings: 'Ahorrás $36',
    features: [
      'Todo lo del plan Pro',
      'Roadmap personalizado de 12 meses',
      'Votás qué clases se crean cada mes',
      '1 mes gratis para regalar a un colega',
      'Certificado verificable al completar el año',
    ],
  },
}
