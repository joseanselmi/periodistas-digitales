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
          renderOnDemand={false}
        />
      </div>

      {/* LAYER 1 — Gradiente oscuro abajo */}
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
        className="relative z-[2] h-full flex flex-col justify-end pb-24 md:pb-16"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto px-5 md:px-12 w-full">

          {/* H1 */}
          <motion.h1
            variants={item}
            className="font-semibold leading-[1.04] tracking-tight text-white mb-5 max-w-[720px]"
            style={{ fontSize: 'clamp(2.2rem, 6.5vw, 5.8rem)' }}
          >
            Tu conocimiento periodístico es un negocio.{' '}
            <em className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent not-italic">
              Solo falta el sistema.
            </em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="text-zinc-300 text-base md:text-lg mb-6 max-w-[540px] leading-snug"
          >
            Crea tu periódico digital con IA y genera ingresos reales —{' '}
            <span className="text-white font-medium">aunque nunca hayas emprendido.</span>
          </motion.p>

          {/* CTA */}
          <motion.div variants={item} className="flex flex-col gap-3">
            <a
              href="#bonus" data-track="cta_hero"
              className="cursor-pointer inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-[0.95rem] px-8 py-[14px] rounded-full hover:-translate-y-[2px] hover:shadow-[0_0_36px_rgba(34,197,94,.4)] transition-all duration-200 w-full md:w-fit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Quiero crear mi periódico digital
            </a>

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
