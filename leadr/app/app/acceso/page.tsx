import Link from 'next/link'

const STEPS = [
  {
    n: '01',
    title: 'Revisá tu email',
    desc: 'Te llegó un mensaje de Leadr con el asunto "Activá tu cuenta". Puede tardar unos minutos.',
    warn: 'Si no lo ves, revisá la carpeta de spam.',
  },
  {
    n: '02',
    title: 'Creá tu contraseña',
    desc: 'Hacé clic en el link del email. Te lleva a una página donde elegís tu contraseña para Leadr.',
    warn: null,
  },
  {
    n: '03',
    title: 'Entrá a Leadr',
    desc: 'Ingresá con tu email y la contraseña que acabás de crear. Tu plan Pro ya está activo.',
    warn: null,
  },
]

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center px-4 py-16">

      {/* Glow de fondo */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-64 bg-cyan-400/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-cyan-400 flex items-center justify-center">
            <span className="text-[#020617] font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-xl">Leadr</span>
        </div>

        {/* Card principal */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-br from-violet-500/15 to-cyan-400/10 border-b border-violet-500/20 px-8 py-7 text-center">
            {/* Check animado */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 rounded-full px-3 py-1 text-violet-300 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Pago confirmado
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">¡Bienvenido a Leadr Pro!</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tu suscripción está activa. En minutos recibís el email para acceder a la plataforma.
            </p>
          </div>

          {/* Pasos */}
          <div className="px-8 py-6 space-y-4">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Cómo acceder</p>
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#0A0F1E] border border-slate-800 rounded-xl px-4 py-4">
                <div className="w-9 h-9 rounded-xl bg-cyan-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#020617] font-bold text-xs font-mono">{s.n}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-0.5">{s.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                  {s.warn && (
                    <p className="text-amber-400/80 text-xs mt-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {s.warn}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-8 pb-7 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold rounded-xl transition-colors text-sm"
            >
              Ir a Leadr
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-center text-slate-600 text-xs">
              ¿Problemas para acceder? Escribinos y lo resolvemos.
            </p>
          </div>

        </div>

        {/* Lo que desbloqueaste */}
        <div className="mt-6 bg-[#0F172A] border border-slate-800 rounded-2xl px-6 py-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Lo que desbloqueaste</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '▶', label: 'Todas las clases', sub: 'Sin límites' },
              { icon: '⚡', label: 'Automatizaciones', sub: 'Make + IA' },
              { icon: '✦', label: 'Prompts exclusivos', sub: 'Para periodistas' },
              { icon: '↻', label: 'Contenido nuevo', sub: 'Cada semana' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#0A0F1E] border border-slate-800 rounded-xl px-3 py-3">
                <span className="text-cyan-400 text-sm">{f.icon}</span>
                <div>
                  <p className="text-white text-xs font-medium">{f.label}</p>
                  <p className="text-slate-500 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-8">
          © 2026 Leadr · Periodistas Digitales
        </p>

      </div>
    </div>
  )
}
