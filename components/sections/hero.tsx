'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { SplineScene } from '@/components/ui/splite'

export function HeroSection() {
  const reduced = useReducedMotion()

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.14, delayChildren: reduced ? 0 : 0.2 } },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 22 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] as any } },
  }

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-black">

      {/* LAYER 0 — Spline fullbleed */}
      <div className="absolute inset-0 z-0">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
          renderOnDemand={true}
        />
      </div>

      {/* LAYER 1 — Gradiente: robot respira arriba, negro dramático abajo */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            linear-gradient(to top,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,0.92) 18%,
              rgba(0,0,0,0.6) 38%,
              rgba(0,0,0,0.15) 62%,
              transparent 100%
            ),
            linear-gradient(to right,
              rgba(0,0,0,0.55) 0%,
              rgba(0,0,0,0.2) 45%,
              transparent 70%
            )
          `,
        }}
      />

      {/* LAYER 2 — Contenido anclado abajo */}
      <motion.div
        className="relative z-[2] h-full flex flex-col justify-end pb-12 md:pb-16"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 w-full">

          {/* Overline editorial */}
          <motion.div variants={item} className="flex items-center gap-3 mb-5">
            <span className="block w-5 h-px bg-indigo-400/70" />
            <span
              className="text-[10px] font-semibold uppercase tracking-[.22em] text-indigo-400/90"
            >
              +5.500 periodistas ya generan ingresos en redes
            </span>
          </motion.div>

          {/* H1 — tipografía editorial Newsreader */}
          <motion.h1
            variants={item}
            className="font-semibold leading-[1.02] tracking-tight text-white mb-7 max-w-[720px]"
            style={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontSize: 'clamp(3rem, 6.5vw, 5.8rem)',
            }}
          >
            Tu conocimiento periodístico<br />
            es un negocio.{' '}
            <em className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent not-italic">
              Solo falta el sistema.
            </em>
          </motion.h1>

          {/* Párrafo + CTA row */}
          <motion.div
            variants={item}
            className="flex flex-col md:flex-row md:items-end gap-8 md:gap-14"
          >
            <p className="text-zinc-400 text-[0.95rem] leading-[1.7] max-w-[340px]">
              Crea tu periódico digital en Instagram y Facebook, genera ingresos reales con IA
              y construye tu Plan B —{' '}
              <strong className="text-zinc-200 font-medium">
                aunque nunca hayas emprendido.
              </strong>
            </p>

            <div className="flex flex-col gap-3 shrink-0">
              <a
                href="https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2"
                className="cursor-pointer inline-flex items-center gap-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-[0.95rem] px-8 py-[14px] rounded-full hover:-translate-y-[2px] hover:shadow-[0_0_36px_rgba(34,197,94,.4)] transition-all duration-200 w-fit"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Quiero crear mi periódico digital
              </a>

              {/* Trust row */}
              <div className="flex items-center gap-3 pl-1">
                <div className="flex" aria-hidden="true">
                  {['JM', 'CR', 'AL', 'PG'].map((initials, i) => (
                    <div
                      key={initials}
                      className="w-6 h-6 rounded-full border-[1.5px] border-black bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ marginLeft: i === 0 ? 0 : '-6px' }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500">
                  <strong className="text-zinc-300 font-medium">+5.500</strong> periodistas activos en redes
                </p>
                <span className="text-zinc-700 text-xs">·</span>
                <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Garantía 7 días
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <span className="text-[9px] uppercase tracking-[.18em] text-white/50">Scroll</span>
        <motion.svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.div>

    </section>
  )
}
