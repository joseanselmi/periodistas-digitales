import { createClient } from '@supabase/supabase-js'
import { BRAND, uploadAndUpdate } from './slide-helper.mjs'

const sb = createClient('https://ovwlsnnhiuoxoazyrhvt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92d2xzbm5oaXVveG9henlyaHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3OTI3MSwiZXhwIjoyMDkzMjU1MjcxfQ.bDYDu97rrARa4JToZVvflJbXPsUYuSBBcsEeekTTrKo')

const slides = [
  {
    type: 'title',
    heading: 'Protegé tu trabajo y tus fuentes',
    subheading: 'Seguridad digital básica para periodistas',
  },
  {
    type: 'checklist',
    title: 'Qué vas a aprender',
    items: [
      'Por qué la seguridad digital no es solo para hackers ni paranoicos',
      'Gestores de contraseñas: cómo funciona y por qué una sola contraseña fuerte no alcanza',
      'Autenticación en dos pasos: la barrera más efectiva que existe hoy',
      'Signal: comunicación cifrada de extremo a extremo con tus fuentes',
      'VPN básico: cuándo usarlo y cuándo no hace falta',
    ],
  },
  {
    type: 'diagram',
    title: 'Las capas de seguridad digital',
    subheading: 'La seguridad digital funciona en capas: cada capa protege algo distinto. No necesitás implementar todo de una vez, pero sí en orden — las primeras capas son las que más impacto tienen con menos esfuerzo.',
    center: 'Tu trabajo periodístico',
    nodes: ['Contraseñas fuertes', 'Doble factor (2FA)', 'Comunicación cifrada', 'Dispositivo seguro', 'VPN cuando es necesario'],
  },
  {
    type: 'content',
    title: 'Por qué esto importa más de lo que creés',
    subheading: 'En 2023, más de 30 periodistas latinoamericanos tuvieron sus comunicaciones con fuentes comprometidas. No fueron hackers sofisticados — fueron contraseñas reutilizadas y cuentas sin doble factor. Una fuente que confió en vos y terminó expuesta no vuelve a hablar con nadie. La seguridad digital no es paranoia, es responsabilidad profesional.',
  },
  {
    type: 'bullets',
    title: 'Contraseñas: el problema y la solución',
    bullets: [
      'El problema: la mayoría usa 3-5 contraseñas para decenas de cuentas',
      'Si una cuenta se filtra, todas las demás quedan expuestas automáticamente',
      'La solución: un gestor de contraseñas (Bitwarden, 1Password)',
      'Genera y recuerda contraseñas únicas de 20+ caracteres por cada cuenta — vos solo recordás una',
    ],
  },
  {
    type: 'bullets',
    title: 'Doble factor de autenticación (2FA)',
    bullets: [
      'Aunque alguien tenga tu contraseña, no puede entrar sin el segundo factor',
      'Activalo en: email, redes sociales, Notion, Drive, cualquier herramienta de trabajo',
      'Usá una app autenticadora (Google Authenticator, Authy) — no SMS',
      'El SMS como 2FA es vulnerable a SIM swapping — una app es mucho más segura',
    ],
  },
  {
    type: 'bullets',
    title: 'Signal: para comunicarte con fuentes sensibles',
    bullets: [
      'Cifrado de extremo a extremo: ni Signal puede leer tus mensajes',
      'Los mensajes pueden desaparecer automáticamente después de X tiempo',
      'Úsalo cuando la fuente puede estar en riesgo si la conversación se filtra',
      'No es para toda comunicación — es para las conversaciones que importan',
    ],
  },
  {
    type: 'practice',
    title: 'Configuración básica — 30 minutos de una vez',
    steps: [
      'Instalá Bitwarden (gratuito) y migrá tus contraseñas más importantes',
      'Activá 2FA con Google Authenticator en tu cuenta de Gmail',
      'Activá 2FA en tus redes sociales principales (Instagram, X, LinkedIn)',
      'Instalá Signal y pedile a al menos una fuente habitual que también lo instale',
      'En tu teléfono, activá el bloqueo con PIN o huella — no con patrón visual',
    ],
    tip: 'No intentes implementar todo en un día. Contraseñas esta semana, 2FA la siguiente, Signal después. Un cambio bien hecho vale más que cinco a medias.',
  },
  {
    type: 'errors',
    title: 'Errores que comprometen tu seguridad',
    bullets: [
      'Usar la misma contraseña en trabajo y cuentas personales — si una se filtra, ambas caen',
      'Confiar en SMS como segundo factor — el SIM swapping puede interceptarlos',
      'Tener conversaciones sensibles con fuentes por WhatsApp sin notar de quién es el backup',
      'No activar el bloqueo de pantalla del celular — es la primera línea de defensa física',
    ],
  },
  {
    type: 'exercise',
    title: 'Tu ejercicio esta semana',
    subheading: 'Implementá al menos dos de estas tres medidas antes del viernes.',
    task: '1. Instalá Bitwarden y cambiá las contraseñas de tu email y redes sociales\n2. Activá 2FA con app autenticadora en Gmail\n3. Instalá Signal y tenés lista una conversación cifrada con una fuente',
  },
  {
    type: 'resources',
    title: 'Herramientas verificadas',
    items: [
      { text: 'Bitwarden — gestor de contraseñas gratuito y de código abierto', url: 'https://bitwarden.com', tag: 'Herramienta' },
      { text: 'Signal — mensajería cifrada de extremo a extremo', url: 'https://signal.org', tag: 'Herramienta' },
      { text: 'Proton Mail — email cifrado para comunicaciones sensibles', url: 'https://proton.me', tag: 'Herramienta' },
      { text: 'Google Authenticator — app para doble factor de autenticación', url: 'https://support.google.com/accounts/answer/1066447', tag: 'Herramienta' },
    ],
  },
  {
    type: 'bullets',
    title: 'Lo que te llevás de esta clase',
    bullets: [
      'Una contraseña única robada compromete todas tus cuentas — usá un gestor',
      'El 2FA con app detiene el 99% de los intentos de acceso no autorizado',
      'Signal no es paranoia — es el estándar mínimo para fuentes en riesgo',
      'La seguridad digital se implementa en capas, no toda junta',
      'Proteger a tus fuentes es tan importante como proteger tu propio trabajo',
    ],
  },
]

const body = `
<h2>Por qué la seguridad digital es una responsabilidad profesional</h2>
<p>Cuando una fuente te habla en confianza, está apostando su seguridad a que vos vas a proteger esa conversación. Si tu celular no tiene bloqueo de pantalla, si usás la misma contraseña en tu email de trabajo y en una cuenta de streaming que se filtró en 2021, si tus conversaciones con esa fuente están en un chat sin cifrado — estás fallando esa apuesta antes de empezar.</p>
<p>La seguridad digital no requiere ser experto en tecnología. Requiere tomar tres o cuatro decisiones y dedicarle una tarde a implementarlas. Después de eso, la mayoría funciona sola.</p>

<h2>Contraseñas: el problema y la solución real</h2>
<p>La mayoría de las personas usa entre tres y cinco contraseñas para decenas de cuentas. Eso significa que cuando una base de datos se filtra — algo que pasa constantemente y en escala masiva — las credenciales robadas se prueban automáticamente en todos los servicios populares. Si tu contraseña de un foro que usaste en 2018 es la misma que la de tu email de trabajo, alguien puede entrar a tu email sin ningún esfuerzo adicional.</p>
<p>La solución es un gestor de contraseñas. <strong>Bitwarden</strong> es gratuito, de código abierto, y funciona en todos los dispositivos. La idea es simple: el gestor genera y guarda contraseñas únicas de 20 o más caracteres para cada cuenta. Vos solo recordás una contraseña maestra — la del gestor. El resto lo maneja él.</p>
<p>Una vez que lo instalás, el cambio de hábito es mínimo: cuando entrás a un sitio, el gestor completa automáticamente las credenciales. En la práctica, es más cómodo que recordar contraseñas, no menos.</p>

<h2>Doble factor de autenticación: la barrera más efectiva</h2>
<p>El doble factor de autenticación (2FA) agrega una segunda verificación al momento de entrar a una cuenta. Aunque alguien tenga tu contraseña, no puede entrar sin ese segundo factor. Es la medida de seguridad con mejor relación esfuerzo-resultado que existe.</p>
<p>El 2FA por SMS — donde te mandan un código por mensaje de texto — tiene una vulnerabilidad conocida llamada SIM swapping: alguien convence a tu operadora de que sos vos y transfiere tu número a otra SIM. A partir de ahí, recibe todos tus SMS, incluyendo los códigos de verificación.</p>
<p>La alternativa segura es una app autenticadora como Google Authenticator o Authy. Genera códigos cada 30 segundos directamente en tu dispositivo, sin depender de la red de telefonía. Es más seguro y funciona incluso sin internet.</p>
<p>Activalo en todo lo que importa: email, redes sociales, Notion, Google Drive, cualquier herramienta donde guardés material de trabajo o comunicaciones.</p>

<h2>Signal: para las conversaciones que más importan</h2>
<p>Signal es una aplicación de mensajería con cifrado de extremo a extremo. Eso significa que los mensajes se cifran en tu dispositivo antes de salir y se descifran solo en el dispositivo del destinatario. Ni Signal, ni tu operadora, ni nadie en el medio puede leer el contenido.</p>
<p>Tiene una función adicional útil para periodistas: los mensajes desaparecen automáticamente después de un tiempo que vos configurás. Si la conversación no necesita existir después de que la información fue publicada, podés hacer que no exista.</p>
<p>Signal no es para toda comunicación. Es para las conversaciones con fuentes que pueden estar en riesgo si el contenido se filtra — funcionarios que filtran información sensible, víctimas de situaciones delicadas, cualquiera para quien una conversación comprometida tenga consecuencias reales.</p>

<h2>El dispositivo físico también importa</h2>
<p>Todo el cifrado del mundo no sirve si alguien puede agarrar tu celular desbloqueado. El bloqueo de pantalla con PIN o huella digital es la primera línea de defensa física. El patrón visual es menos seguro — deja marcas de grasa en la pantalla que revelan el patrón con luz lateral.</p>
<p>En tu computadora, activá el cifrado del disco duro. En Mac es FileVault, en Windows es BitLocker. Si perdés la computadora o te la roban, el cifrado hace que los datos sean inaccesibles sin tu contraseña.</p>

<h2>VPN: cuándo usarlo y cuándo no hace falta</h2>
<p>Una VPN cifra tu tráfico de internet y oculta tu dirección IP. Es útil en dos situaciones: cuando usás redes WiFi públicas (cafés, aeropuertos, hoteles) donde alguien puede interceptar el tráfico no cifrado, y cuando necesitás que tu ubicación geográfica no sea visible para el sitio que visitás.</p>
<p>En tu casa con una conexión segura, una VPN agrega poco. En una red pública durante una cobertura importante, puede marcar la diferencia. Proton VPN tiene un plan gratuito sin límite de datos — es suficiente para el uso ocasional.</p>

<h2>Tu ejercicio</h2>
<p>Esta semana implementá dos medidas concretas. Primero: instalá Bitwarden y cambiá las contraseñas de tu email principal y tus redes sociales por contraseñas generadas por el gestor. Segundo: activá 2FA con app autenticadora en Gmail. Con esas dos medidas, tu nivel de seguridad ya supera al de la mayoría de las redacciones.</p>
`

await uploadAndUpdate(sb, slides, body, 19)
console.log('✓ ID 19 Seguridad digital completada')
