/**
 * send-email.mjs — Sofía envía campañas de email via Brevo
 *
 * Uso:
 *   node scripts/publicar/send-email.mjs --campaign leadr-l1
 *   node scripts/publicar/send-email.mjs --campaign leadr-l2
 *   node scripts/publicar/send-email.mjs --campaign leadr-l3
 *   node scripts/publicar/send-email.mjs --campaign post-compra-1  (para pruebas)
 *
 * Variables de entorno:
 *   BREVO_API_KEY  — del .env.local
 *
 * Contactos:
 *   Poner el CSV de Hotmart en: ads-agent/emails/compradores.csv
 *   Formato esperado: email,nombre  (primera fila = encabezado)
 *
 * Ejemplo:
 *   $env:BREVO_API_KEY = "xkeysib-..."
 *   node scripts/publicar/send-email.mjs --campaign leadr-l1
 */

import { readFileSync, existsSync, writeFileSync, appendFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_URL     = 'https://api.brevo.com/v3/smtp/email'

if (!BREVO_API_KEY) {
  console.error('❌ Falta BREVO_API_KEY')
  process.exit(1)
}

const campaignArg = process.argv.find((a, i) => process.argv[i - 1] === '--campaign')
if (!campaignArg) {
  console.error('❌ Uso: node scripts/publicar/send-email.mjs --campaign [leadr-l1|leadr-l2|leadr-l3] [--limit 100] [--offset 0]')
  process.exit(1)
}

const limitArg  = process.argv.find((a, i) => process.argv[i - 1] === '--limit')
const offsetArg = process.argv.find((a, i) => process.argv[i - 1] === '--offset')
const csvArg    = process.argv.find((a, i) => process.argv[i - 1] === '--csv')
const LIMIT     = limitArg  ? parseInt(limitArg)  : null
const OFFSET    = offsetArg ? parseInt(offsetArg) : 0
const CSV_PATH  = csvArg ?? 'emails/compradores.csv'

// ─── Remitente ────────────────────────────────────────────────────────────────

const SENDER = {
  name:  'José — Periodistas del Futuro IA',
  email: 'jose@sistemadeingresosdiariosia.com',
}

// ─── Campañas disponibles ─────────────────────────────────────────────────────

const CAMPAIGNS = {

  'leadr-l1': {
    subject:     'Lo que ningún editor te va a decir',
    previewText: 'Pero que todos están sintiendo',
    html: `
<p>Hola,</p>

<p>Hace poco hablamos con una periodista de 47 años de Quito.<br>
19 años en el mismo medio. De las que realmente saben hacer su trabajo.</p>

<p>Nos dijo algo que todavía resuena: <em>"No me preocupa que me echen. Me preocupa no entender qué está pasando."</em></p>

<p>Eso es exactamente lo que está pasando en las redacciones de LATAM ahora mismo.</p>

<p>No es que la IA reemplace periodistas. Es que los periodistas que entienden cómo funciona esto están cubriendo más, publicando más rápido, y consiguiendo oportunidades que antes no existían.</p>

<p>Los que no entienden quedan haciendo las mismas notas de siempre, con menos recursos, esperando que alguien les explique.</p>

<p>Nadie les va a explicar. Esa es la parte que nadie dice en voz alta.</p>

<p>Mañana te contamos qué construimos desde Periodistas Digitales para que no te pase esto.</p>

<p>El equipo de Periodistas Digitales</p>
    `,
    text: `Hola,

Hace poco hablamos con una periodista de 47 años de Quito. 19 años en el mismo medio. De las que realmente saben hacer su trabajo.

Nos dijo algo que todavía resuena: "No me preocupa que me echen. Me preocupa no entender qué está pasando."

Eso es exactamente lo que está pasando en las redacciones de LATAM ahora mismo.

No es que la IA reemplace periodistas. Es que los periodistas que entienden cómo funciona esto están cubriendo más, publicando más rápido, y consiguiendo oportunidades que antes no existían.

Los que no entienden quedan haciendo las mismas notas de siempre, con menos recursos, esperando que alguien les explique.

Nadie les va a explicar. Esa es la parte que nadie dice en voz alta.

Mañana te contamos qué construimos desde Periodistas Digitales para que no te pase esto.

El equipo de Periodistas Digitales`,
  },

  'leadr-l2': {
    subject:     'Lo que construimos en Periodistas Digitales',
    previewText: 'Y por qué es para vos',
    html: `
<p>Hola,</p>

<p>Ayer te hablamos de algo que está pasando en silencio en el periodismo de LATAM.</p>

<p>Hoy te contamos qué hicimos al respecto.</p>

<p>En Periodistas Digitales construimos <strong>Leadr</strong>.</p>

<p>Es la plataforma que queríamos que existiera y no existía. Para que ningún periodista tenga que buscar "qué herramienta de IA sirve para periodistas" y encontrar resultados en inglés, para otro mercado, con ejemplos que no tienen nada que ver con nuestra realidad.</p>

<p>Adentro hay dos cosas:</p>

<p><strong>Una enciclopedia completa de periodismo digital con IA.</strong><br>
Todo en español, con ejemplos reales de Colombia, Ecuador, México, Argentina. Desde cómo trabajar con Claude hasta cómo automatizar tu publicación sin tocar código.</p>

<p><strong>Y actualización semanal.</strong><br>
Cada semana filtramos lo más útil que apareció: la herramienta nueva que vale la pena, el cambio de algoritmo que te afecta, el caso real de un periodista de la región que lo está usando bien. Vos abrís Leadr y ya está. No tenés que buscar nada.</p>

<p>Mañana te contamos por qué te estamos escribiendo esto a vos específicamente.</p>

<p>El equipo de Periodistas Digitales</p>
    `,
    text: `Hola,

Ayer te hablamos de algo que está pasando en silencio en el periodismo de LATAM.

Hoy te contamos qué hicimos al respecto.

En Periodistas Digitales construimos Leadr.

Es la plataforma que queríamos que existiera y no existía. Para que ningún periodista tenga que buscar "qué herramienta de IA sirve para periodistas" y encontrar resultados en inglés, para otro mercado, con ejemplos que no tienen nada que ver con nuestra realidad.

Adentro hay dos cosas:

Una enciclopedia completa de periodismo digital con IA. Todo en español, con ejemplos reales de Colombia, Ecuador, México, Argentina. Desde cómo trabajar con Claude hasta cómo automatizar tu publicación sin tocar código.

Y actualización semanal. Cada semana filtramos lo más útil que apareció: la herramienta nueva que vale la pena, el cambio de algoritmo que te afecta, el caso real de un periodista de la región que lo está usando bien. Vos abrís Leadr y ya está. No tenés que buscar nada.

Mañana te contamos por qué te estamos escribiendo esto a vos específicamente.

El equipo de Periodistas Digitales`,
  },

  'leadr-l3-fix': {
    subject:     'El link para activar tu acceso a Leadr',
    previewText: 'El de ayer no funcionaba bien — este sí',
    html: `
<p>Hola,</p>

<p>En el email de ayer te mandé un link para activar tu mes gratis de Leadr que no llevaba al lugar correcto. Te pido disculpas.</p>

<p>El link correcto es este:</p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito a Leadr</a></strong></p>

<p>Entrás, creás tu cuenta con este mismo email, y el acceso Pro de 30 días se activa automáticamente. Sin tarjeta, sin compromiso.</p>

<p>Válido hasta el 31 de mayo.</p>

<p>José</p>
    `,
    text: `Hola,

En el email de ayer te mandé un link para activar tu mes gratis de Leadr que no llevaba al lugar correcto. Te pido disculpas.

El link correcto es este:
https://leadr.cloud/activar

Entrás, creás tu cuenta con este mismo email, y el acceso Pro de 30 días se activa automáticamente. Sin tarjeta, sin compromiso.

Válido hasta el 31 de mayo.

José`,
  },

  'leadr-l3': {
    subject:     'Tu regalo de Periodistas Digitales',
    previewText: 'Por ser parte de la academia desde el principio',
    html: `
<p>Hola,</p>

<p>Desde Periodistas Digitales sacamos nuestra nueva herramienta: <strong>Leadr</strong>.</p>

<p>Y decidimos dársela primero a los que confiaron en nosotros desde el principio.</p>

<p>Vos compraste el curso. Eso cuenta.</p>

<p>Por eso tenés 30 días gratis en Leadr. Sin tarjeta. Sin formularios. Sin compromiso.</p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito</a></strong></p>

<p>Tenés hasta el 31 de mayo.</p>

<p>Sofía Castañon<br>
<small style="color:#94a3b8;">Directora de Marketing — Periodistas Digitales</small></p>

<p><small>PD: Si ya activaste, ignorá este email. Gracias.</small></p>
    `,
    text: `Hola,

Desde Periodistas Digitales sacamos nuestra nueva herramienta: Leadr.

Y decidimos dársela primero a los que confiaron en nosotros desde el principio.

Vos compraste el curso. Eso cuenta.

Por eso tenés 30 días gratis en Leadr. Sin tarjeta. Sin formularios. Sin compromiso.

→ leadr.cloud/activar

Tenés hasta el 31 de mayo.

Sofía Castañon
Directora de Marketing — Periodistas Digitales

PD: Si ya activaste, ignorá este email. Gracias.`,
  },

  'leadr-fix-activacion': {
    subject:     'Tu acceso a Leadr ya está activo',
    previewText: 'Corregimos el problema — ya podés entrar',
    html: `
<p>Hola,</p>

<p>Nos dimos cuenta de que creaste tu cuenta en Leadr pero tu mes gratis no quedó activado por un problema técnico de nuestra parte.</p>

<p>Ya lo corregimos. <strong>Tu acceso Pro está activo hasta el 20 de junio.</strong></p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/login" style="color:#6366f1;">→ Ir a Leadr</a></strong></p>

<p>Cualquier problema, respondé este email.</p>

<p>Sofía Castañon<br>
<small style="color:#94a3b8;">Directora de Marketing — Periodistas Digitales</small></p>
    `,
    text: `Hola,

Nos dimos cuenta de que creaste tu cuenta en Leadr pero tu mes gratis no quedó activado por un problema técnico de nuestra parte.

Ya lo corregimos. Tu acceso Pro está activo hasta el 20 de junio.

→ leadr.cloud/login

Cualquier problema, respondé este email.

Sofía Castañon
Directora de Marketing — Periodistas Digitales`,
  },

  'leadr-bienvenida-actividad': {
    subject:     'Ya tenés tu acceso a Leadr — ¿por dónde empezar?',
    previewText: 'La plataforma de aprendizaje hecha por periodistas para periodistas.',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Leadr<span style="color:#6366f1;">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Hola, nos alegra que puedas probar Leadr.</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Tu acceso Pro ya está activo. Queremos que lo aproveches al máximo, así que vamos directo al punto.</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Leadr es la única plataforma de aprendizaje continuo <strong style="color:#ffffff;">hecha por periodistas, para periodistas</strong>. No hay cursos genéricos de marketing ni contenido que podés encontrar en YouTube. Todo lo que vas a ver fue construido pensando en la realidad del periodista que quiere hacer crecer su carrera con IA y nuevas herramientas.</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Cada semana subimos <strong style="color:#ffffff;">nuevas clases, noticias del sector, prompts listos para usar</strong> y recursos que podés aplicar el mismo día. No es un archivo estático — es una plataforma viva.</p>
              <p style="margin:0 0 28px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Y está diseñada para verla desde donde estés — <strong style="color:#ffffff;">celular, tablet o computadora</strong>.</p>
              <div style="border-top:1px solid #1e1e2e;margin:0 0 28px 0;"></div>
              <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Qué encontrás adentro</p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Clases en video</strong> organizadas por módulo, con slides descargables</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Prompts curados</strong> que podés copiar y usar con ChatGPT, Claude o Gemini</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Noticias del sector</strong> filtradas y resumidas cada semana</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Contenido nuevo cada semana</strong>, sin que tengas que buscar nada</td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://leadr.cloud/dashboard?utm_source=email&utm_medium=bienvenida&utm_campaign=leadr-bienvenida-actividad&utm_content=cta-principal" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Ver contenido</a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">Tu acceso Pro está activo hasta el 21 de junio.<br/>Si tenés alguna duda, respondé este email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 20px 0 20px;">
              <p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque activaste tu acceso Pro en Leadr.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hola,

Tu acceso Pro ya está activo. Queremos que lo aproveches al máximo.

Leadr es la única plataforma de aprendizaje continuo hecha por periodistas, para periodistas. No hay cursos genéricos ni contenido de YouTube. Todo construido para el periodista que quiere crecer con IA.

Cada semana subimos nuevas clases, noticias del sector y prompts listos para usar. Y está diseñada para verla desde donde estés — celular, tablet o computadora.

Qué encontrás adentro:
→ Clases en video organizadas por módulo, con slides descargables
→ Prompts curados para usar con ChatGPT, Claude o Gemini
→ Noticias del sector filtradas y resumidas cada semana
→ Contenido nuevo cada semana, sin que tengas que buscar nada

Ver contenido → https://leadr.cloud/dashboard?utm_source=email&utm_medium=bienvenida&utm_campaign=leadr-bienvenida-actividad

Tu acceso Pro está activo hasta el 21 de junio.
Si tenés alguna duda, respondé este email.`,
  },

  'leadr-1pregunta': {
    subject:     'Una pregunta rápida sobre Leadr',
    previewText: 'Son 10 segundos. En serio.',
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Leadr<span style="color:#6366f1;">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Una pregunta</p>
              <p style="margin:0 0 32px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                Tenés acceso a Leadr pero todavía no abriste ninguna clase. ¿Por qué?
              </p>

              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
                <tr>
                  <td>
                    <a href="https://leadr.cloud/dashboard?utm_source=email&utm_medium=encuesta&utm_campaign=leadr-1pregunta&utm_content=no-tuve-tiempo"
                       style="display:block;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:16px 20px;color:#c0c0d8;font-size:16px;text-decoration:none;margin-bottom:12px;">
                      ⏱ No tuve tiempo todavía
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="https://leadr.cloud/dashboard?utm_source=email&utm_medium=encuesta&utm_campaign=leadr-1pregunta&utm_content=no-supe-empezar"
                       style="display:block;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:16px 20px;color:#c0c0d8;font-size:16px;text-decoration:none;margin-bottom:12px;">
                      🤷 No supe por dónde empezar
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="https://leadr.cloud/dashboard?utm_source=email&utm_medium=encuesta&utm_campaign=leadr-1pregunta&utm_content=no-relevante"
                       style="display:block;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:16px 20px;color:#c0c0d8;font-size:16px;text-decoration:none;">
                      🤔 No me pareció relevante para mi trabajo
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">
                Hacé clic en cualquier opción — eso nos ayuda a mejorar.<br/>
                Y si querés contarnos más, respondé este email.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 20px 0 20px;">
              <p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">
                Recibís este email porque tenés acceso Pro a Leadr.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Una pregunta rápida.

Tenés acceso a Leadr pero todavía no abriste ninguna clase. ¿Por qué?

→ No tuve tiempo todavía
https://leadr.cloud/dashboard?utm_source=email&utm_medium=encuesta&utm_campaign=leadr-1pregunta&utm_content=no-tuve-tiempo

→ No supe por dónde empezar
https://leadr.cloud/dashboard?utm_source=email&utm_medium=encuesta&utm_campaign=leadr-1pregunta&utm_content=no-supe-empezar

→ No me pareció relevante para mi trabajo
https://leadr.cloud/dashboard?utm_source=email&utm_medium=encuesta&utm_campaign=leadr-1pregunta&utm_content=no-relevante

Hacé clic en cualquier opción — eso nos ayuda a mejorar.
Si querés contarnos más, respondé este email.`,
  },

  'leadr-activacion-manual': {
    subject:     'Tu acceso Pro a Leadr ya está activo',
    previewText: 'Lo activamos nosotros — podés entrar ahora',
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Leadr<span style="color:#6366f1;">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Hola, tu acceso Pro ya está activo.</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">
                Vimos que te registraste en Leadr pero tu acceso Pro no quedó activado. Lo activamos nosotros directamente — ya podés entrar con tu cuenta y acceder a todo el contenido.
              </p>
              <p style="margin:0 0 28px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">
                Tenés acceso a clases en video, prompts curados, noticias del sector y contenido nuevo cada semana. Todo hecho por periodistas, para periodistas.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://leadr.cloud/dashboard?utm_source=email&utm_medium=activacion-manual&utm_campaign=leadr-activacion-manual"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">
                      Ir a Leadr →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">
                Tu acceso Pro está activo hasta el 23 de junio.<br/>Si tenés alguna duda, respondé este email.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 20px 0 20px;">
              <p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">
                Recibís este email porque compraste el curso de Periodistas Digitales.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hola,

Vimos que te registraste en Leadr pero tu acceso Pro no quedó activado. Lo activamos nosotros directamente — ya podés entrar con tu cuenta y acceder a todo el contenido.

Ir a Leadr → https://leadr.cloud/dashboard

Tu acceso Pro está activo hasta el 23 de junio.
Si tenés alguna duda, respondé este email.`,
  },

  'leadr-l4': {
    subject:     'Sacamos algo nuevo. Y es para vos.',
    previewText: 'Por ser parte de la academia desde el principio',
    html: `
<p>Hola,</p>

<p>Desde Periodistas Digitales estuvimos construyendo algo.</p>

<p>Se llama <strong>Leadr</strong>.</p>

<p>Es la plataforma de IA para periodistas que queríamos que existiera y no existía. Todo en español. Todo para el trabajo real de cubrir, investigar y publicar.</p>

<p>Decidimos dársela primero a los que confiaron en nosotros desde el principio.</p>

<p>Vos compraste el curso. Eso cuenta.</p>

<p>30 días gratis. Sin tarjeta. Sin formularios.</p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito</a></strong></p>

<p>Válido hasta el 31 de mayo.</p>

<p>El equipo de Periodistas Digitales</p>

<p><small>PD: Si ya activaste, ignorá este email. Gracias.</small></p>
    `,
    text: `Hola,

Desde Periodistas Digitales estuvimos construyendo algo.

Se llama Leadr.

Es la plataforma de IA para periodistas que queríamos que existiera y no existía. Todo en español. Todo para el trabajo real de cubrir, investigar y publicar.

Decidimos dársela primero a los que confiaron en nosotros desde el principio.

Vos compraste el curso. Eso cuenta.

30 días gratis. Sin tarjeta. Sin formularios.

→ leadr.cloud/activar

Válido hasta el 31 de mayo.

El equipo de Periodistas Digitales

PD: Si ya activaste, ignorá este email. Gracias.`,
  },

  'leadgen-1usd-guia': {
    subject:     'Tu guía gratis de Claude para periodismo',
    previewText: 'Ya está lista para descargar',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Tu guía ya está lista</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Acá está lo que pediste: cómo usar Claude para investigar, escribir y editar más rápido como periodista.</p>
              <div style="border-top:1px solid #1e1e2e;margin:24px 0 28px 0;"></div>
              <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Qué incluye la guía</p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">El prompt maestro</strong> — lo configurás una sola vez</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">4 prompts rápidos</strong> para entrevistas, transcripción, documentos largos y edición</td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://sistemadeingresosdiariosia.com/api/d?file=guia-claude-periodistas.pdf&amp;src=Email-Regalo1&amp;sck=email1" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Descargar la guía (PDF) →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">En los próximos días te escribimos con algo más: la versión completa, con +50 prompts para cada situación.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 20px 0 20px;">
              <p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `PERIODISTAS DEL FUTURO IA

Tu guía ya está lista

Acá está lo que pediste: cómo usar Claude para investigar, escribir y editar más rápido como periodista.

QUÉ INCLUYE LA GUÍA
→ El prompt maestro — lo configurás una sola vez
→ 4 prompts rápidos para entrevistas, transcripción, documentos largos y edición

Descargar la guía (PDF): https://sistemadeingresosdiariosia.com/api/d?file=guia-claude-periodistas.pdf&src=Email-Regalo1&sck=email1

En los próximos días te escribimos con algo más: la versión completa, con +50 prompts para cada situación.`,
  },

  'leadgen-2-50-prompts': {
    subject:     'La versión completa: +50 prompts para periodistas',
    previewText: 'Como prometimos en el último mail',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Como prometimos: la versión completa</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">En el mail anterior te dijimos que te íbamos a mandar algo más completo. Acá está: <strong style="color:#ffffff;">+50 prompts</strong> organizados por situación — investigación, entrevistas, redacción, datos, redes, producción diaria, multimedia y lo legal/ético.</p>
              <div style="border-top:1px solid #1e1e2e;margin:24px 0 28px 0;"></div>
              <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">8 situaciones cubiertas</p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Investigación, entrevistas y datos</strong> — los que más tiempo te ahorran</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Redacción, redes y multimedia</strong> — para llevar la misma nota a todos los formatos</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Lo legal y la seguridad de fuentes</strong> — lo que más cuesta corregir después de publicado</td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://sistemadeingresosdiariosia.com/api/d?file=guia-completa-50-prompts.pdf&amp;src=Email-Regalo2&amp;sck=email2" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Descargar los +50 prompts (PDF) →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">Con esto ya tenés el primer ladrillo de tu propio medio digital armado — la parte de producción de contenido con IA. Te vamos a escribir por WhatsApp con el siguiente paso.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 20px 0 20px;">
              <p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `PERIODISTAS DEL FUTURO IA

Como prometimos: la versión completa

En el mail anterior te dijimos que te íbamos a mandar algo más completo. Acá está: +50 prompts organizados por situación — investigación, entrevistas, redacción, datos, redes, producción diaria, multimedia y lo legal/ético.

8 SITUACIONES CUBIERTAS
→ Investigación, entrevistas y datos
→ Redacción, redes y multimedia
→ Lo legal y la seguridad de fuentes

Descargar los +50 prompts (PDF): https://sistemadeingresosdiariosia.com/api/d?file=guia-completa-50-prompts.pdf&src=Email-Regalo2&sck=email2

Con esto ya tenés el primer ladrillo de tu propio medio digital armado — la parte de producción de contenido con IA. Te vamos a escribir por WhatsApp con el siguiente paso.`,
  },

  'leadgen-5-agentes-ia': {
    subject:     'La guía de agentes de IA (el paso que viene después de los prompts)',
    previewText: 'De usar IA suelta a tener agentes trabajando para tu medio',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">El siguiente nivel: agentes de IA</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Hasta acá usaste la IA prompt a prompt. El paso que sigue es otro: <strong style="color:#ffffff;">agentes</strong> que hacen tareas enteras por su cuenta — investigar, redactar borradores, reutilizar una nota en varios formatos — mientras vos te quedás con el criterio editorial.</p>
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Te armamos una guía práctica para entenderlos y empezar a usarlos en tu redacción, sin vueltas técnicas.</p>
              <div style="border-top:1px solid #1e1e2e;margin:24px 0 28px 0;"></div>
              <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Lo que vas a encontrar</p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Chatbot vs. agente</strong> — la diferencia que cambia cómo trabajás</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Casos prácticos para una redacción</strong> — producción, investigación, audiencia y archivo</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Cómo empezar paso a paso</strong> — sin conocimientos técnicos y sin reformar todo de golpe</td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://sistemadeingresosdiariosia.com/api/d?file=guia-agentes-ia-periodistas.pdf&amp;src=Email-Regalo5&amp;sck=email5" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Descargar la guía de agentes de IA (PDF) →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">Leela con calma: es la base para que la IA deje de ser una herramienta suelta y pase a trabajar para tu medio.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 20px 0 20px;">
              <p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `PERIODISTAS DEL FUTURO IA

El siguiente nivel: agentes de IA

Hasta acá usaste la IA prompt a prompt. El paso que sigue es otro: agentes que hacen tareas enteras por su cuenta — investigar, redactar borradores, reutilizar una nota en varios formatos — mientras vos te quedás con el criterio editorial.

Te armamos una guía práctica para entenderlos y empezar a usarlos en tu redacción, sin vueltas técnicas.

LO QUE VAS A ENCONTRAR
→ Chatbot vs. agente — la diferencia que cambia cómo trabajás
→ Casos prácticos para una redacción — producción, investigación, audiencia y archivo
→ Cómo empezar paso a paso — sin conocimientos técnicos y sin reformar todo de golpe

Descargar la guía de agentes de IA (PDF): https://sistemadeingresosdiariosia.com/api/d?file=guia-agentes-ia-periodistas.pdf&src=Email-Regalo5&sck=email5

Leela con calma: es la base para que la IA deje de ser una herramienta suelta y pase a trabajar para tu medio.`,
  },

}

// ─── Leer contactos del CSV ───────────────────────────────────────────────────

function leerContactos() {
  const csvPath = resolve(CSV_PATH)

  if (!existsSync(csvPath)) {
    console.error(`❌ No se encontró el archivo de contactos: emails/compradores.csv`)
    console.error(`   Exportá la lista de Hotmart y guardala ahí.`)
    console.error(`   Formato: email,nombre (primera fila = encabezado)`)
    process.exit(1)
  }

  const lines = readFileSync(csvPath, 'utf-8').trim().split('\n')
  const contactos = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(',')
    const email = parts[0]?.trim().replace(/"/g, '')
    const nombre = parts[1]?.trim().replace(/"/g, '') || ''

    if (email && email.includes('@')) {
      contactos.push({ email, nombre })
    }
  }

  return contactos
}

// ─── Enviar un email ──────────────────────────────────────────────────────────

async function enviarEmail(contacto, campaign) {
  const payload = {
    sender: SENDER,
    to: [{ email: contacto.email, name: contacto.nombre || 'Periodista' }],
    subject: campaign.subject,
    htmlContent: campaign.html,
    textContent: campaign.text,
    headers: {
      'X-Mailin-custom': 'leadr-launch',
    },
  }

  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`)
  }

  return data.messageId
}

// ─── Log de resultados ────────────────────────────────────────────────────────

function logResultado(campaignName, contacto, ok, detalle) {
  const logPath = resolve(`emails/log-${campaignName}.csv`)
  const fecha   = new Date().toISOString()
  const linea   = `${fecha},${contacto.email},${contacto.nombre},${ok ? 'OK' : 'ERROR'},${detalle}\n`

  if (!existsSync(logPath)) {
    writeFileSync(logPath, 'fecha,email,nombre,estado,detalle\n')
  }
  appendFileSync(logPath, linea)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const campaign = CAMPAIGNS[campaignArg]

  if (!campaign) {
    console.error(`❌ Campaña desconocida: ${campaignArg}`)
    console.error(`   Opciones: ${Object.keys(CAMPAIGNS).join(', ')}`)
    process.exit(1)
  }

  let contactos = leerContactos()
  if (OFFSET > 0) contactos = contactos.slice(OFFSET)
  if (LIMIT)      contactos = contactos.slice(0, LIMIT)

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📧 SOFÍA — Enviando campaña: ${campaignArg}`)
  console.log(`   Asunto: "${campaign.subject}"`)
  console.log(`   Contactos: ${contactos.length}`)
  console.log(`${'═'.repeat(60)}\n`)

  let ok = 0
  let errores = 0

  for (let i = 0; i < contactos.length; i++) {
    const contacto = contactos[i]
    process.stdout.write(`  [${i + 1}/${contactos.length}] ${contacto.email}... `)

    try {
      const msgId = await enviarEmail(contacto, campaign)
      console.log(`✅`)
      logResultado(campaignArg, contacto, true, msgId)
      ok++
    } catch (err) {
      console.log(`❌ ${err.message}`)
      logResultado(campaignArg, contacto, false, err.message)
      errores++
    }

    // Pausa entre envíos para no gatillar filtros de spam
    if (i < contactos.length - 1) {
      await new Promise(r => setTimeout(r, 300))
    }
  }

  // Actualizar campaign-state.json
  const statePath = resolve('emails/campaign-state.json')
  if (existsSync(statePath)) {
    const state = JSON.parse(readFileSync(statePath, 'utf-8'))
    const paso  = state.secuencia.find(s => s.id === campaignArg)
    if (paso) {
      paso.enviados     += ok
      paso.errores      += errores
      paso.fecha_envio   = new Date().toISOString().slice(0, 10)
      if (!LIMIT || OFFSET + contactos.length >= state.total_contactos) {
        paso.completado = true
        const idx = state.secuencia.indexOf(paso)
        state.proximo_paso = state.secuencia[idx + 1]?.id ?? 'completado'
      }
      if (state.total_contactos === 0) state.total_contactos = contactos.length
      state.notas.push(`${new Date().toISOString().slice(0, 10)}: ${campaignArg} — ${ok} enviados, ${errores} errores`)
      writeFileSync(statePath, JSON.stringify(state, null, 2))
      console.log(`📊 Estado actualizado: emails/campaign-state.json`)
    }
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`RESUMEN`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`✅ Enviados: ${ok}`)
  console.log(`❌ Errores:  ${errores}`)
  console.log(`📄 Log: emails/log-${campaignArg}.csv`)
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message)
  process.exit(1)
})
