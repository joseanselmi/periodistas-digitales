'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const stats = [
  { num: '+5.500', label: 'Periodistas activos en redes' },
  { num: '+50', label: 'Países alcanzados' },
  { num: '$17', label: 'Para entrar al sistema' },
]

export function InstructorSection() {
  return (
    <section className="py-28 bg-[#06060f] border-y border-white/[.07]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-16 items-center">

          {/* Photo */}
          <motion.div
            className="flex justify-center md:justify-start"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <div className="absolute -inset-[3px] rounded-[23px] bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-50 -z-10" />
              <Image
                src="http://sistemadeingresosdiariosia.com/wp-content/uploads/2026/01/4_11zon.webp"
                alt="José Fiaccini — Fundador"
                width={260}
                height={340}
                className="rounded-[20px] shadow-[0_40px_80px_rgba(0,0,0,.6)] object-cover"
                style={{ height: 340, width: 260 }}
                unoptimized
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.22em] uppercase text-indigo-400 mb-5">
              <span className="w-4 h-px bg-indigo-400" />
              Tu instructor
            </p>

            <h2
              className="text-[clamp(2rem,3.5vw,2.8rem)] font-semibold text-white tracking-tight mb-1.5"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              José Fiaccini
            </h2>
            <p className="text-indigo-400 text-sm font-medium tracking-wide mb-6">
              Periodista · Creador de Medios Digitales · Experto en IA aplicada al Periodismo
            </p>

            <p className="text-zinc-400 leading-[1.8] max-w-[520px] mx-auto md:mx-0">
              Soy periodista, igual que tú. Viví la frustración de tener todo el conocimiento
              y no saber cómo convertirlo en ingresos reales. Hasta que aprendí a usar las redes
              sociales, la IA y las herramientas digitales como un sistema de negocio.
            </p>
            <p className="text-zinc-400 leading-[1.8] max-w-[520px] mt-4 mx-auto md:mx-0">
              Hoy gestiono mis propios medios digitales en Instagram y Facebook, y enseño a
              periodistas en más de 50 países a hacer lo mismo — generando ingresos todos los días,
              sin jefe, sin experiencia técnica previa.
            </p>

            {/* Stats */}
            <div className="flex gap-9 mt-9 flex-wrap justify-center md:justify-start">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className="text-[1.9rem] font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight"
                    style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
                  >
                    {s.num}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
