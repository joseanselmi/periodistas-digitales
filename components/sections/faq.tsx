'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const faqs = [
  { q: '¿Necesito experiencia previa en redes sociales?', a: 'No. Si sabes usar Instagram o Facebook como usuario, ya tienes lo que necesitas. El sistema te enseña paso a paso a transformar esas plataformas en tu canal de noticias y negocio.' },
  { q: '¿Tengo que saber usar inteligencia artificial?', a: 'Tampoco. El Bono 1 (IA en el Periodismo Actual) te enseña exactamente cómo usar ChatGPT y otras IAs desde cero, con prompts listos para copiar y pegar desde el primer día.' },
  { q: '¿Puedo hacerlo mientras sigo en mi trabajo actual?', a: 'Sí, ese es el punto. El sistema está diseñado para construir tu Plan B sin dejar tu ingreso actual. Funciona con pocas horas a la semana y tú decides el ritmo.' },
  { q: '¿Qué es el Leadr del Bono 3?', a: 'Es mi plataforma personal donde comparto prompts exclusivos para periodistas, clases gratuitas, recursos actualizados mes a mes y acceso a la comunidad cerrada. Recibes acceso completo sin costo adicional con tu compra.' },
  { q: '¿Cuándo recibo acceso a todo?', a: 'Inmediatamente. En menos de 5 minutos de tu pago recibes un email con acceso al curso, los bonos y el CRM. Sin esperas.' },
  { q: '¿Qué pasa si no quedo satisfecho?', a: 'Tienes 7 días de garantía completa. Solicitas el reembolso con un solo clic desde Hotmart y te devolvemos el 100%, sin preguntas ni formularios.' },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-16 border-y border-white/[.07]" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0d1a3a 0%, #060818 50%, #000000 100%)' }}>
      <div className="max-w-[700px] mx-auto px-6">

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.22em] uppercase text-indigo-400 mb-5">
            <span className="w-4 h-px bg-indigo-400" />
            Preguntas frecuentes
          </p>
          <h2
            className="text-[clamp(2rem,4.5vw,3.2rem)] font-semibold tracking-tight text-white"
            
          >
            Tus dudas, resueltas ahora
          </h2>
        </motion.div>

        <div className="flex flex-col gap-2.5">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className={cn(
                'border rounded-2xl overflow-hidden transition-colors duration-300',
                open === i ? 'border-indigo-500/30' : 'border-white/[.07] hover:border-white/[.14]'
              )}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-[.95rem] font-medium text-white bg-transparent cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <span className={cn(
                  'w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-indigo-400 transition-all duration-300',
                  open === i
                    ? 'rotate-180 bg-indigo-500/20 border-indigo-500/30'
                    : 'bg-indigo-500/[.08] border-indigo-500/15'
                )} aria-hidden="true">
                  <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  open === i ? 'max-h-[300px] pb-5' : 'max-h-0'
                )}
              >
                <p className="px-6 text-sm text-zinc-400 leading-[1.75]">{faq.a}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
