import Link from 'next/link'

const PROFILES = [
  {
    label: 'Periodista en inicio de carrera',
    age: '20-30 años',
    pain: 'Necesitás diferenciarte en un mercado saturado. La IA puede ser tu ventaja — si sabés usarla bien.',
    color: 'text-cyan-400',
    border: 'border-cyan-400/20',
    bg: 'bg-cyan-400/5',
  },
  {
    label: 'Periodista consolidado',
    age: '30-42 años',
    pain: 'Tenés el criterio, te falta el tiempo. Aprendés cómo hacer en 20 minutos lo que hoy te lleva 3 horas.',
    color: 'text-violet-400',
    border: 'border-violet-400/20',
    bg: 'bg-violet-400/5',
  },
  {
    label: 'Periodista con experiencia',
    age: '42-55 años',
    pain: 'Décadas de oficio no se reemplazan con un algoritmo. Aprendés a usar IA sin perder tu voz ni tu criterio.',
    color: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/5',
  },
]

const PAINS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'El deadline llegó y todavía estás en el primer párrafo',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Tenés que publicar en 5 plataformas distintas con el mismo contenido',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Todos hablan de IA pero nadie te enseña a usarla en tu trabajo real',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Sabés que deberías aprender IA, pero no sabés por dónde empezar',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    text: 'Miedo a usarla mal — y quedar expuesto ante tu audiencia o tu editor',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
    text: 'Como freelancer, trabajás solo con la carga de toda una redacción',
  },
]

const TRANSFORMATION = [
  {
    before: 'Llegás a la cobertura sin contexto. Improvisás.',
    after: 'Llegás con un briefing completo — actores, antecedentes y ángulos — en 10 minutos.',
  },
  {
    before: 'La pantalla en blanco te paraliza 30 minutos.',
    after: 'Tenés un borrador estructurado antes de tomar el segundo café.',
  },
  {
    before: 'Publicás en una plataforma. El resto lo dejás para después.',
    after: 'El mismo contenido llega adaptado a X, LinkedIn, newsletter y reel sin esfuerzo extra.',
  },
  {
    before: 'Verificar un dato te lleva horas de búsqueda manual.',
    after: 'Cruzás fuentes y trazás cronologías con IA en minutos, sin perder rigor.',
  },
  {
    before: 'Tus titulares no enganchan. El algoritmo te entierra.',
    after: 'Escribís titulares que compiten con los grandes medios sin ser clickbait.',
  },
  {
    before: 'La tecnología te genera ansiedad. La evitás.',
    after: 'La IA es tu herramienta más confiable — y la usás mejor que tus competidores.',
  },
]

const MODULES = [
  {
    tag: 'Módulo 1',
    title: 'IA para periodistas',
    desc: 'Entendés cómo funcionan ChatGPT, Claude y Gemini. Sabés cuándo usarlos, cuándo no, y cómo sacarles el máximo sin comprometer tu credibilidad.',
    items: ['Prompt engineering periodístico', 'Cuándo confiar en la IA — y cuándo verificar', 'Ética y transparencia en el uso'],
    color: 'text-cyan-400',
    border: 'border-cyan-400/20',
    bg: 'bg-cyan-400/5',
    dot: 'bg-cyan-400',
  },
  {
    tag: 'Módulo 2',
    title: 'Investigación con IA',
    desc: 'Convertís horas de rastreo manual en minutos. Briefings, cronologías, análisis de documentos extensos y búsqueda de fuentes que nadie más está mirando.',
    items: ['OSINT y fuentes abiertas con IA', 'Análisis de documentos y datos', 'Detección de ángulos exclusivos'],
    color: 'text-violet-400',
    border: 'border-violet-400/20',
    bg: 'bg-violet-400/5',
    dot: 'bg-violet-400',
  },
  {
    tag: 'Módulo 3',
    title: 'Redacción sin pantalla en blanco',
    desc: 'De notas a borrador estructurado. Titulares que enganchan sin ser clickbait. Textos que vas a querer firmar — escritos a tu velocidad, no a la velocidad de la sala de redacción.',
    items: ['Borradores desde tus notas de campo', 'Titulares que compiten con los grandes medios', 'Edición y reescritura asistida'],
    color: 'text-emerald-400',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/5',
    dot: 'bg-emerald-400',
  },
  {
    tag: 'Módulo 4',
    title: 'Distribución multiplataforma',
    desc: 'Un contenido, cinco plataformas. La IA adapta el formato según el canal — X, LinkedIn, newsletter, Instagram, TikTok — vos mantenés el criterio editorial.',
    items: ['Adaptación de contenido por canal', 'Algoritmos: qué funciona y por qué', 'Newsletters y crecimiento de audiencia'],
    color: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/5',
    dot: 'bg-amber-400',
  },
  {
    tag: 'Módulo 5',
    title: 'Automatización sin código',
    desc: 'Tu medio digital trabaja incluso cuando no estás. Alertas de fuentes, publicaciones programadas, resúmenes automáticos. Con Make — sin saber programar.',
    items: ['Flujos automáticos con Make', 'Monitoreo de fuentes y alertas', 'Publicación y distribución automática'],
    color: 'text-rose-400',
    border: 'border-rose-400/20',
    bg: 'bg-rose-400/5',
    dot: 'bg-rose-400',
  },
  {
    tag: 'Módulo 6',
    title: 'Prompts exclusivos',
    desc: 'Una biblioteca de prompts construidos específicamente para el periodismo. Para cada tipo de nota, cada etapa del proceso, cada plataforma.',
    items: ['Prompts por tipo de cobertura', 'Templates para investigación y entrevistas', 'Biblioteca actualizada constantemente'],
    color: 'text-sky-400',
    border: 'border-sky-400/20',
    bg: 'bg-sky-400/5',
    dot: 'bg-sky-400',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Creás tu cuenta gratis',
    desc: 'Acceso inmediato. Sin tarjeta de crédito. Empezás con las clases básicas desde el primer minuto.',
  },
  {
    n: '02',
    title: 'Aprendés a tu ritmo',
    desc: 'Clases cortas y directas. Cada una termina con algo concreto que podés aplicar en tu próxima nota.',
  },
  {
    n: '03',
    title: 'Lo aplicás en tu trabajo real',
    desc: 'No es teoría. Cada clase está diseñada para el flujo de trabajo de un periodista real, no de un tech blogger.',
  },
]

export default function LeadrHomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center" aria-hidden="true">
              <span className="text-[#020617] font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl">Leadr</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors min-h-[44px] flex items-center">
              Iniciar sesión
            </Link>
            <Link href="/register" className="px-5 py-2.5 text-sm font-semibold bg-cyan-400 hover:bg-cyan-300 text-[#020617] rounded-lg transition-colors min-h-[44px] flex items-center">
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Formación de IA específica para periodistas
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 max-w-4xl mx-auto">
          La IA no va a reemplazarte.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500">
            Pero el periodista que sabe usarla, sí.
          </span>
        </h1>

        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
          Leadr es la plataforma donde los periodistas aprenden a usar inteligencia artificial de forma práctica, ética y aplicada a su trabajo real. No cursos teóricos — workflows que usás desde el día uno.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
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

      {/* Para quién es */}
      <section className="border-t border-slate-800/40 bg-[#060B18]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Diseñado para cada etapa de tu carrera</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Seas principiante, freelancer o veterano — hay algo que Leadr puede darte hoy.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {PROFILES.map(p => (
              <div key={p.label} className={`rounded-2xl border p-6 ${p.border} ${p.bg} bg-[#0A0F1E]`}>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${p.color} bg-current/10`} style={{backgroundColor: 'transparent', border: '1px solid currentColor', borderColor: 'inherit'}}>
                  {p.age}
                </span>
                <h3 className={`font-bold text-lg mb-2 ${p.color}`}>{p.label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dolores */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">¿Te suena conocido alguno de estos?</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Si dijiste que sí a alguno, Leadr es para vos.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {PAINS.map((p, i) => (
            <div key={i} className="flex items-start gap-4 bg-[#0A0F1E] border border-slate-800 rounded-xl px-5 py-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400 mt-0.5">
                {p.icon}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Transformación */}
      <section className="border-t border-slate-800/40 bg-[#060B18]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Lo que cambia cuando sabés usar IA</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">No es magia. Es entrenamiento específico para tu oficio.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {TRANSFORMATION.map((t, i) => (
              <div key={i} className="bg-[#0A0F1E] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <p className="text-slate-500 text-sm">{t.before}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Módulos */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Qué vas a aprender</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Seis módulos construidos sobre los dolores reales del periodismo digital. Todo aplicable desde la primera clase.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map(m => (
            <div key={m.title} className={`rounded-2xl border p-6 bg-[#0A0F1E] ${m.border} hover:border-opacity-50 transition-colors`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                <span className="text-slate-500 text-xs font-mono">{m.tag}</span>
              </div>
              <h3 className={`font-bold text-lg mb-2 ${m.color}`}>{m.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{m.desc}</p>
              <ul className="space-y-1.5">
                {m.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-slate-500 text-xs">
                    <span className={`w-1 h-1 rounded-full ${m.dot} flex-shrink-0`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-slate-800/40 bg-[#060B18]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Así de simple</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Sin curvas de aprendizaje complicadas. Sin tiempo perdido.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={i} className="relative bg-[#0A0F1E] border border-slate-800 rounded-2xl p-7 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-cyan-400 font-bold font-mono text-sm">{s.n}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-px bg-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué Leadr */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-5">Por qué Leadr y no cualquier curso de IA</h2>
            <div className="space-y-4 text-slate-400">
              <p className="leading-relaxed">
                Los cursos genéricos de IA te enseñan a usar ChatGPT para escribir correos y resumir textos. Leadr te enseña a investigar con OSINT, escribir titulares que rankean, adaptar una nota para cinco plataformas en simultáneo y automatizar tu flujo de trabajo como periodista.
              </p>
              <p className="leading-relaxed">
                Cada clase, cada prompt, cada ejercicio está construido desde el oficio. No desde la tecnología.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Contenido específico para periodismo', sub: 'No ejemplos de marketing ni negocios — casos del oficio' },
              { label: 'Clases cortas, aplicación inmediata', sub: 'Cada módulo termina con algo que usás en tu próxima nota' },
              { label: 'Ética integrada, no como afterthought', sub: 'Cuándo usar IA, cuándo no, cómo declararlo' },
              { label: 'Actualización constante', sub: 'La IA cambia rápido. El contenido también' },
              { label: 'Tu ritmo, tu dispositivo', sub: 'Desde el celular, en el colectivo, entre cobertura y cobertura' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#0A0F1E] border border-slate-800 rounded-xl px-5 py-4">
                <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{item.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nunca obsoleto */}
      <section className="border-t border-slate-800/40">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/8 via-[#060B18] to-cyan-400/5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/10 blur-3xl rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/8 blur-3xl rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />
          <div className="relative max-w-6xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 rounded-full px-4 py-1.5 text-violet-300 text-sm font-medium mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  El diferencial de Leadr
                </div>
                <h2 className="text-4xl font-extrabold mb-5 leading-tight">
                  Con Leadr,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                    nunca vas a quedar obsoleto
                  </span>
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  La IA avanza cada semana. Un curso que compraste hace seis meses ya está desactualizado.
                </p>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Leadr no es un curso. Es una membresía activa. Mientras seguís suscripto, recibís en tiempo real cómo están usando la IA los periodistas que están a la vanguardia — las herramientas nuevas, los flujos que funcionan, los errores que evitar.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  El periodismo moderno cambia rápido. Con Leadr, vos también.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    title: 'Contenido nuevo cada semana',
                    desc: 'Clases, prompts y casos de uso que se agregan constantemente. Lo que los periodistas están usando ahora mismo.',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    title: 'Seguimiento del periodismo moderno',
                    desc: 'Cómo los grandes medios y los periodistas independientes más exitosos están integrando IA en su trabajo real.',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    ),
                    title: 'Alertas de herramientas y cambios',
                    desc: 'Cuando llega algo nuevo que cambia el juego, lo sabés antes que el resto. Sin ruido, solo lo que importa para tu trabajo.',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    title: 'Una suscripción, siempre actualizado',
                    desc: 'No pagás por cada curso nuevo. Con una sola suscripción Pro accedés a todo lo que se agrega — para siempre mientras seguís activo.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-[#0A0F1E]/80 border border-violet-500/15 rounded-xl px-5 py-4 backdrop-blur-sm">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0 text-violet-400 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{item.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-6 pb-20 border-t border-slate-800/40 pt-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A0F1E] to-[#0D1220] border border-slate-800 rounded-3xl px-8 py-20 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-400/8 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-32 bg-violet-500/8 blur-3xl rounded-full pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
              El periodismo cambia ahora.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
                Vos podés ir adelante.
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-3 leading-relaxed">
              Cada semana que pasa, más periodistas ya usan estas herramientas. Creá tu cuenta gratis y empezá hoy.
            </p>
            <p className="text-slate-500 text-sm mb-10">
              Las primeras clases son gratuitas. Sin tarjeta de crédito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-12 py-5 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold text-lg rounded-xl transition-colors min-h-[60px]"
              >
                Crear cuenta gratis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-base rounded-xl transition-colors min-h-[60px]"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cyan-400 flex items-center justify-center" aria-hidden="true">
              <span className="text-[#020617] font-bold text-xs">L</span>
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
