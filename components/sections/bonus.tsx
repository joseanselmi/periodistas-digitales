'use client'

import { motion } from 'framer-motion'

const bonuses = [
  {
    num: '1',
    title: 'IA en el Periodismo Actual — Clase exclusiva',
    desc: 'Aprende a usar ChatGPT, Claude y las herramientas de IA más potentes para crear titulares virales, artículos en minutos y contenido que engancha. El periodista que usa IA produce 10x más y no tiene competencia.',
    value: '$47 USD',
  },
  {
    num: '2',
    title: 'Canva para Periodistas Digitales',
    desc: '+100 templates profesionales diseñados para periódicos digitales en Instagram y Facebook. Posts, Stories, Reels y carruseles. Tu medio se verá como un canal establecido desde el día 1, sin necesitar diseñador.',
    value: '$27 USD',
  },
  {
    num: '3',
    title: 'Acceso Gratuito a mi CRM Privado',
    desc: 'Entra a mi CRM personal donde comparto prompts exclusivos, clases gratuitas, recursos actualizados y acceso a la comunidad cerrada. Todo lo que uso yo para gestionar mis medios digitales — tuyo sin costo adicional.',
    value: '$97 USD',
  },
]

export function BonusSection() {
  return (
    <section className="py-28 bg-[#06060f] border-y border-white/[.07]">
      <div className="max-w-4xl mx-auto px-6">

        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.22em] uppercase text-indigo-400 mb-5">
            <span className="w-4 h-px bg-indigo-400" />
            Bonos exclusivos
          </p>
          <h2
            className="text-[clamp(2rem,4.5vw,3.2rem)] font-semibold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            3 bonos que valen más{' '}
            <em className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent not-italic">
              que el curso mismo
            </em>
          </h2>
          <p className="text-zinc-500 mt-3 text-sm">Valor total de bonos: $171 USD — incluidos sin costo extra.</p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {bonuses.map((bonus, i) => (
            <motion.div
              key={bonus.num}
              className="group relative flex gap-6 items-start bg-white/[.025] border border-white/[.07] rounded-2xl p-7 hover:border-indigo-500/30 transition-colors duration-250 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-cyan-500 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 rounded-r-sm" />
              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {bonus.num}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[1rem] font-semibold text-white mb-1.5 tracking-tight">{bonus.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">{bonus.desc}</p>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-zinc-600 line-through">Valor: {bonus.value}</span>
                  <span className="text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide text-[10px]">
                    Incluido
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2"
            className="cursor-pointer inline-flex items-center gap-2.5 bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold text-[1.05rem] px-10 py-5 rounded-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(34,197,94,.5)] transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Quiero todo esto por $17 USD
          </a>
          <p className="flex items-center justify-center gap-1.5 text-zinc-600 text-xs mt-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Garantía 7 días · Acceso inmediato · Sin suscripción
          </p>
        </motion.div>

      </div>
    </section>
  )
}
