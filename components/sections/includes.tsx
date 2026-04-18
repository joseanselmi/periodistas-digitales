'use client'

import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const items = [
  { title: 'Sistema de Ingresos Diarios para Periodistas', desc: 'El método completo para crear tu periódico en IG y Facebook y monetizarlo desde cero.' },
  { title: 'IA para Periodistas — Micro Curso', desc: 'Usás ChatGPT y Claude para trabajar más rápido, mejor y ser más competente que tus colegas.' },
  { title: 'Canva — Identidad visual de tu periódico', desc: '+100 diseños listos. Elegís, cambiás el nombre y en 10 minutos tenés tu medio listo.' },
  { title: 'Leadr — 1 mes gratis', desc: 'Mi plataforma con prompts, automatizaciones copy-paste y clases de redacción con IA.' },
  { title: '+50 Prompts periodísticos para copiar y pegar', desc: 'IA lista para usar en titulares, artículos y contenido para redes. Sin curva de aprendizaje.' },
  { title: 'Acceso de por vida + todas las actualizaciones', desc: 'Tuyo para siempre. Cada vez que el sistema mejora, vos también recibís la actualización.' },
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
