'use client'

import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const items = [
  { title: 'Módulo 1 — Elegí tu nicho periodístico', desc: 'Descubrís cuál es el tema que más te apasiona y que tiene audiencia lista para seguirte en IG y Facebook.' },
  { title: 'Módulo 2 — Creá tu periódico digital en 24hs', desc: 'Nombre, identidad visual y primera publicación. Sin saber de diseño ni tecnología.' },
  { title: 'Módulo 3 — El sistema de contenido diario', desc: 'Cómo publicar todos los días en menos de 30 minutos usando IA y plantillas probadas.' },
  { title: 'Módulo 4 — Monetización desde el primer mes', desc: 'Las 3 fuentes de ingreso que usa José: publicidad local, suscripciones y marcas aliadas.' },
  { title: 'Módulo 5 — Crecimiento orgánico en redes', desc: 'El método para pasar de 0 a tu primera comunidad de lectores sin gastar en anuncios.' },
  { title: 'Acceso de por vida + todas las actualizaciones', desc: 'Tuyo para siempre. Cada mejora del sistema llega directo a tu cuenta sin costo extra.' },
]

export function IncludesSection() {
  return (
    <section className="py-16" style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 50%, #091428 0%, #000000 70%)' }}>
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.22em] uppercase text-indigo-400 mb-5">
            <span className="w-4 h-px bg-indigo-400" />
            Lo que recibes
          </p>
          <h2
            className="text-[clamp(2rem,4.5vw,3.2rem)] font-semibold tracking-tight text-white"
            
          >
            Todo el sistema, listo para activar hoy
          </h2>
        </motion.div>

        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <a
            href="#bonus"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:-translate-y-[2px] hover:shadow-[0_0_28px_rgba(99,102,241,.4)] transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Ver los bonos incluidos
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          <motion.div
            className="relative rounded-[20px]"
            style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.15)' }}
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/mockup.png"
              alt="Todo lo que incluye el sistema"
              width={560}
              height={800}
              className="rounded-[20px] w-full object-contain"
              unoptimized
            />
          </motion.div>

          <ul className="flex flex-col">
            {items.map((item, i) => (
              <motion.li
                key={item.title}
                className="flex gap-4 py-4 border-b border-white/[.07] last:border-0"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-0.5">{item.title}</h4>
                  <p className="text-xs text-zinc-300">{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
