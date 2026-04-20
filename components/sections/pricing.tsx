'use client'

import { CheckCircle2, ShieldCheck, Star } from 'lucide-react'
import { motion } from 'framer-motion'

const items = [
  { name: 'Sistema de Ingresos Diarios para Periodistas', price: '$47' },
  { name: 'BONO 1 — IA para Periodistas (micro curso)', price: '$47' },
  { name: 'BONO 2 — Canva (+100 diseños para tu periódico)', price: '$27' },
  { name: 'BONO 3 — Leadr, 1 mes gratis', price: '$97' },
  { name: '+50 Prompts periodísticos para copiar y pegar', price: '$9' },
]

export function PricingSection() {
  return (
    <section className="py-16 text-center" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, #0d1a3a 0%, #060818 50%, #000000 100%)' }}>
      <div className="max-w-5xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.22em] uppercase text-indigo-400 mb-5">
            <span className="w-4 h-px bg-indigo-400" />
            Precio
          </p>
          <h2
            className="text-[clamp(2rem,4.5vw,3.2rem)] font-semibold tracking-tight text-white mb-8"
            
          >
            $227 en valor real.<br />Por solo $17 hoy.
          </h2>
        </motion.div>

        <motion.div
          className="max-w-[600px] mx-auto relative"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 -z-10" />

          <div className="bg-[#06060f]/90 border border-white/10 rounded-[28px] p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-indigo-500 to-cyan-500" />

            <div className="inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[11px] font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase mb-8">
              <Star className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
              Oferta por tiempo limitado
            </div>

            <ul className="text-left mb-6">
              {items.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[.07] last:border-0 text-sm">
                  <span className="flex items-center gap-2.5 font-medium text-zinc-200 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" strokeWidth={2} aria-hidden="true" />
                    {item.name}
                  </span>
                  <span className="text-zinc-600 line-through text-xs shrink-0">{item.price}</span>
                </li>
              ))}
            </ul>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            <p className="text-zinc-500 line-through text-sm mb-1">Valor total: $227 USD</p>
            <div
              className="text-[clamp(3.5rem,10vw,5.5rem)] font-bold tracking-[-0.04em] leading-none bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2"
              
            >
              $17 USD
            </div>
            <p className="text-zinc-600 text-xs mb-9">
              Pago único · Acceso inmediato · Sin suscripción · Acceso de por vida
            </p>

            <a
              href="https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2" data-track="cta_pricing"
              className="cursor-pointer w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold text-[1.05rem] py-5 rounded-full hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(34,197,94,.5)] transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Quiero mi sistema por $17 ahora
            </a>

            <p className="flex items-center justify-center gap-1.5 text-zinc-600 text-xs mt-4">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Hotmart · Visa · Mastercard · PayPal
            </p>
          </div>
        </motion.div>

        <motion.div
          className="max-w-[600px] mx-auto mt-8 flex items-start gap-5 bg-green-500/[.04] border border-green-500/[.18] rounded-[18px] px-8 py-6 text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <ShieldCheck className="w-11 h-11 text-green-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h4 className="font-semibold text-green-300 mb-1.5">Garantía de 7 días — sin preguntas</h4>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Si en los primeros 7 días sientes que el curso no es lo que esperabas, solicitas el reembolso
              con un solo clic desde Hotmart y te devolvemos el 100% de tu dinero. Sin formularios, sin explicaciones.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
