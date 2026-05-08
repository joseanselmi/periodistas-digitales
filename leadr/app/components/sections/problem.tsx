'use client'

import { motion } from 'framer-motion'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

export function ProblemSection() {
  return (
    <section className="py-16 border-y border-white/[.07]" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0d1a3a 0%, #060818 50%, #000000 100%)' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={reveal}>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.22em] uppercase text-indigo-400 mb-8">
            <span className="w-4 h-px bg-indigo-400" />
            El problema real
          </p>
        </motion.div>

        <motion.p
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          variants={{ ...reveal, visible: { ...reveal.visible, transition: { duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
          className="text-[clamp(1.05rem,2.2vw,1.25rem)] leading-[1.9] text-zinc-300 mb-8"
        >
          Sabes escribir, sabes contar historias, sabes lo que la gente quiere leer.
          Pero el modelo tradicional te tiene atrapado:{' '}
          <strong className="text-white font-semibold">trabajando para otros, ganando poco, dependiendo de un jefe.</strong>
        </motion.p>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          variants={{ ...reveal, visible: { ...reveal.visible, transition: { duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }}
          className="relative bg-indigo-500/[.06] border border-indigo-500/20 rounded-2xl px-10 py-9 mb-8"
        >
          <span
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[90px] leading-none text-indigo-500/20 select-none"
            
            aria-hidden="true"
          >
            "
          </span>
          <p
            className="text-[clamp(1.3rem,3vw,1.8rem)] font-semibold text-white tracking-tight leading-snug"
            
          >
            "Sé hacer periodismo. No sé cómo vivir de él en internet."
          </p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          variants={{ ...reveal, visible: { ...reveal.visible, transition: { duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
        >
          <p className="text-[clamp(1.05rem,2.2vw,1.25rem)] leading-[1.9] text-zinc-300 mb-6">
            Mientras tanto, la IA está redefiniendo el periodismo. Instagram y Facebook
            se convirtieron en los nuevos medios masivos. Y los que aprendieron a usarlos{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-bold">
              generan ingresos reales todos los días.
            </span>
          </p>

          <p className="text-[clamp(1.05rem,2.2vw,1.25rem)] leading-[1.9] text-zinc-300">
            El problema no eres tú. Es que nadie te enseñó el sistema.
            Tienes el conocimiento, las fuentes, el criterio editorial.{' '}
            <strong className="text-white font-semibold">Solo necesitas convertirlo en un negocio digital.</strong>
          </p>
        </motion.div>

      </div>
    </section>
  )
}
