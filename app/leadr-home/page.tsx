import Link from 'next/link'

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'IA aplicada al periodismo',
    desc: 'Aprendés a usar Claude, ChatGPT y otras herramientas para investigar, redactar y publicar más rápido — sin perder tu voz.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/20',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Clases cortas y prácticas',
    desc: 'Cada clase es un paso concreto. Sin teoría innecesaria — cada módulo termina con algo que podés aplicar ese mismo día.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/20',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Contenido organizado por herramienta',
    desc: 'Claude, ChatGPT, automatizaciones y más. Cada sección es un camino completo desde cero hasta dominar la herramienta.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Progreso guardado',
    desc: 'Marcás cada clase como vista y tu progreso queda guardado. Retomás donde dejaste, en cualquier dispositivo.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
]

const MODULOS = [
  { nombre: 'Claude para periodistas', clases: 10, color: 'border-cyan-400/30 text-cyan-400', tag: 'Incluido' },
  { nombre: 'ChatGPT para periodistas', clases: 10, color: 'border-violet-400/30 text-violet-400', tag: 'Incluido' },
  { nombre: 'Tecnología para periodistas', clases: 7, color: 'border-amber-400/30 text-amber-400', tag: 'Incluido' },
  { nombre: 'Automatizaciones con Make', clases: 0, color: 'border-slate-700 text-slate-500', tag: 'Próximamente' },
  { nombre: 'Prompts esenciales', clases: 0, color: 'border-slate-700 text-slate-500', tag: 'Próximamente' },
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
            <span className="font-bold text-lg">Leadr</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors min-h-[44px] flex items-center"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-cyan-400 hover:bg-cyan-300 text-[#020617] rounded-lg transition-colors min-h-[44px] flex items-center"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium mb-8">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Para periodistas digitales
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto">
          Aprendé IA y publicá{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            el doble en la mitad del tiempo
          </span>
        </h1>

        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
          Leadr es la plataforma de aprendizaje para periodistas que quieren usar inteligencia artificial sin complicaciones. Clases cortas, prácticas y aplicables desde el primer día.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold text-base rounded-xl transition-colors min-h-[52px] flex items-center"
          >
            Empezar gratis
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-base rounded-xl transition-colors min-h-[52px] flex items-center"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <p className="text-slate-600 text-sm mt-5">Sin tarjeta de crédito · Acceso inmediato</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">Todo lo que necesitás para adaptarte a la IA</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Sin tecnicismos. Sin promesas vacías. Solo herramientas que funcionan en el periodismo real.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className={`bg-[#0A0F1E] border rounded-2xl p-6 ${f.bg}`}>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.bg} ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contenido */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Un camino claro de principiante a experto</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Cada módulo es un viaje completo. Arrancás desde cero y terminás con un sistema de trabajo propio que podés usar desde el día siguiente.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold rounded-xl transition-colors min-h-[44px]"
            >
              Ver todo el contenido
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-3">
            {MODULOS.map(m => (
              <div key={m.nombre} className={`flex items-center justify-between bg-[#0A0F1E] border rounded-xl px-5 py-4 ${m.color.split(' ')[0]}`}>
                <div>
                  <p className={`font-semibold ${m.clases > 0 ? 'text-white' : 'text-slate-500'}`}>{m.nombre}</p>
                  {m.clases > 0 && <p className="text-slate-500 text-sm mt-0.5">{m.clases} clases</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  m.tag === 'Incluido'
                    ? `${m.color.split(' ')[0]} ${m.color.split(' ')[1]} bg-opacity-10`
                    : 'border-slate-700 text-slate-600'
                }`}>
                  {m.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="bg-gradient-to-br from-cyan-400/10 to-violet-500/10 border border-cyan-400/20 rounded-3xl px-8 py-16 text-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Empezá hoy, gratis
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Creá tu cuenta y accedé al contenido gratuito en segundos. Sin formularios largos, sin tarjeta requerida.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold text-lg rounded-xl transition-colors min-h-[56px]"
          >
            Crear cuenta gratis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-slate-400 text-sm">Leadr · Periodistas Digitales</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-600">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">Crear cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
