'use client'

import { motion } from 'framer-motion'

export function FinalCta() {
  return (
    <section className="relative py-36 bg-black text-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(99,102,241,.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.22em] uppercase text-indigo-400 mb-6">
            <span className="w-4 h-px bg-indigo-400" />
            Tu Plan B empieza hoy
          </p>
          <h2
            className="text-[clamp(2.2rem,5vw,3.8rem)] font-semibold tracking-tight text-white mb-6 leading-[1.08]"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            Tienes el conocimiento.<br />
            Ahora activa{' '}
            <em className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent not-italic">
              el sistema.
            </em>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-zinc-400 text-[1.15rem] max-w-lg mx-auto mb-12 leading-relaxed"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            <em>+5.500 periodistas ya crearon su medio en IG y Facebook.</em>
            <span className="block not-italic text-zinc-600 text-base mt-2">
              Con IA, con Canva, con el sistema. Por $17, hoy mismo.
            </span>
          </p>

          <a
            href="https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2"
            className="cursor-pointer inline-flex items-center gap-2.5 bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold text-[1.1rem] px-12 py-5 rounded-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(34,197,94,.5)] transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Quiero activar mi sistema ahora
          </a>

          <p className="text-zinc-600 text-xs mt-5">
            $17 USD · Pago único · Acceso inmediato · Garantía 7 días · Sin suscripción
          </p>
        </motion.div>

      </div>
    </section>
  )
}
