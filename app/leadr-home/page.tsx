import Link from 'next/link'

const PILLARS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Investigación más rápida',
    desc: 'Llegá a cualquier cobertura con contexto completo en minutos. Briefings, cronologías, actores clave y ángulos que nadie más está cubriendo.',
    color: 'text-cyan-400',
    border: 'border-cyan-400/20',
    bg: 'bg-cyan-400/8',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: 'Redacción sin bloqueo',
    desc: 'Nunca más la pantalla en blanco. Convertís tus notas en borradores estructurados, titulares que enganchen y textos que vas a querer firmar.',
    color: 'text-violet-400',
    border: 'border-violet-400/20',
    bg: 'bg-violet-400/8',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    title: 'Distribución multiplataforma',
    desc: 'Un mismo contenido llega a X, LinkedIn, newsletters y reels sin triplicar el trabajo. La IA adapta el formato, vos mantenés el criterio.',
    color: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/8',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Automatización sin código',
    desc: 'Alertas, publicaciones programadas, resúmenes automáticos de fuentes. Tu medio digital trabaja incluso cuando no estás frente a la pantalla.',
    color: 'text-emerald-400',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/8',
  },
]

const TRANSFORMATION = [
  { before: 'Llegás a la cobertura sin contexto', after: 'Llegás con un briefing completo en 10 minutos' },
  { before: 'La pantalla en blanco te paraliza', after: 'Tenés un borrador estructurado antes de tomar el café' },
  { before: 'Publicás en un solo lugar', after: 'El mismo contenido llega a 5 plataformas sin esfuerzo extra' },
  { before: 'La tecnología te genera ansiedad', after: 'La IA es tu herramienta más confiable' },
]

export default function LeadrHomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl">Leadr</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors min-h-[44px] flex items-center">
              Iniciar sesión
            </Link>
            <Link href="/register" className="px-5 py-2.5 text-sm font-semibold bg-cyan-400 hover:bg-cyan-300 text-[#020617] rounded-lg transition-colors min-h-[44px] flex items-center">
              Crear cuenta gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          La plataforma de IA para periodistas
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-7 max-w-4xl mx-auto">
          El periodista que usa IA{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500">
            no tiene competencia
          </span>
        </h1>

        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-12">
          Leadr es la plataforma donde los periodistas aprenden a usar inteligencia artificial de forma práctica, ética y aplicada a su trabajo real. No cursos teóricos — workflows que usás desde el día uno.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="px-10 py-4 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold text-lg rounded-xl transition-colors min-h-[56px] flex items-center gap-2"
          >
            Empezar ahora — es gratis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 bg-transparent hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-lg rounded-xl transition-colors min-h-[56px] flex items-center"
          >
            Ya tengo cuenta
          </Link>
        </div>
        <p className="text-slate-600 text-sm">Sin tarjeta · Sin trampas · Acceso inmediato</p>
      </section>

      {/* Transformación */}
      <section className="border-t border-slate-800/40 bg-[#060B18]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">De periodista a periodista digital</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">No reemplazamos tu trabajo. Lo multiplicamos.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {TRANSFORMATION.map((t, i) => (
              <div key={i} className="bg-[#0A0F1E] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <p className="text-slate-500 text-sm">{t.before}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-cyan-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="text-white text-sm font-medium">{t.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">Todo lo que un periodista necesita dominar</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Desde investigación hasta distribución — cubrimos cada etapa del flujo de trabajo periodístico con IA.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map(p => (
            <div key={p.title} className={`rounded-2xl p-6 border ${p.border} ${p.bg} bg-[#0A0F1E]`}>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${p.border} ${p.color}`}>
                {p.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{p.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enfoque */}
      <section className="border-t border-slate-800/40 bg-[#060B18]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-5">
                Aprendizaje diseñado para el ritmo del periodismo
              </h2>
              <div className="space-y-5 text-slate-400">
                <p className="leading-relaxed">
                  No tenés horas para sentarte a ver cursos largos. En Leadr cada clase es corta, directa y termina con algo concreto que podés aplicar hoy mismo en tu trabajo.
                </p>
                <p className="leading-relaxed">
                  El contenido crece constantemente. Cubrimos las herramientas que existen hoy y las que van a definir el periodismo de mañana — siempre desde una perspectiva práctica y ética.
                </p>
                <p className="leading-relaxed">
                  No importa si venís del papel, la radio o el digital. Si sabés usar el celular, podés aprender a usar IA para periodismo.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Clases cortas y accionables', sub: 'Cada clase termina con un ejercicio real' },
                { label: 'Contenido actualizado constantemente', sub: 'La IA cambia rápido — nosotros también' },
                { label: 'Pensado por y para periodistas', sub: 'No tecnología genérica. Casos reales del oficio' },
                { label: 'Tu progreso, a tu ritmo', sub: 'Avanzás cuando podés, retomás donde dejaste' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-[#0A0F1E] border border-slate-800 rounded-xl px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-slate-500 text-sm mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A0F1E] to-[#0D1220] border border-slate-800 rounded-3xl px-8 py-20 text-center">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-400/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-5">
              El periodismo cambia.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
                Vos también podés.
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
              Creá tu cuenta gratis y empezá a aprender cómo la IA puede potenciar tu trabajo periodístico desde hoy.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-12 py-5 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold text-lg rounded-xl transition-colors min-h-[60px]"
            >
              Crear cuenta gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-slate-600 text-sm mt-5">Sin tarjeta de crédito · Sin compromisos</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <div>
              <span className="text-white font-semibold text-sm">Leadr</span>
              <span className="text-slate-600 text-sm"> · Periodistas Digitales</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">Crear cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
