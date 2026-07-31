# Email: Bienvenida — usuarios sin actividad

**Campaña:** `leadr-bienvenida-actividad`
**Segmento:** 13 usuarios Pro que activaron pero nunca abrieron una clase
**Objetivo:** Medir cuántos hacen clic en el CTA y entran al dashboard
**Tracking:** Brevo mide apertura automáticamente. El botón lleva UTM para medir clics en Google Analytics / Vercel Analytics.

---

## Asunto

`Ya tenés tu acceso a Leadr — ¿por dónde empezar?`

**Preheader:** La plataforma de aprendizaje hecha por periodistas para periodistas.

---

## Cuerpo del email (HTML)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu acceso a Leadr</title>
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo / header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Leadr<span style="color:#6366f1;">.</span>
              </span>
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">

              <!-- Saludo -->
              <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                Hola, nos alegra que puedas probar Leadr.
              </p>

              <!-- Cuerpo -->
              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">
                Tu acceso Pro ya está activo. Queremos que lo aproveches al máximo, así que vamos directo al punto.
              </p>

              <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">
                Leadr es la única plataforma de aprendizaje continuo <strong style="color:#ffffff;">hecha por periodistas, para periodistas</strong>. No hay cursos genéricos de marketing ni contenido que podés encontrar en YouTube. Todo lo que vas a ver fue construido pensando en la realidad del periodista que quiere hacer crecer su carrera con IA y nuevas herramientas.
              </p>

              <p style="margin:0 0 28px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">
                Cada semana subimos <strong style="color:#ffffff;">nuevas clases, noticias del sector, prompts listos para usar</strong> y recursos que podés aplicar el mismo día. No es un archivo estático — es una plataforma viva.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid #1e1e2e;margin:0 0 28px 0;"></div>

              <!-- Lo que encontrás -->
              <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">
                Qué encontrás adentro
              </p>

              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;">
                    <span style="color:#22d3ee;font-size:18px;">→</span>
                  </td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">
                    <strong style="color:#ffffff;">Clases en video</strong> organizadas por módulo, con slides descargables
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;">
                    <span style="color:#22d3ee;font-size:18px;">→</span>
                  </td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">
                    <strong style="color:#ffffff;">Prompts curados</strong> que podés copiar y usar con ChatGPT, Claude o Gemini
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;">
                    <span style="color:#22d3ee;font-size:18px;">→</span>
                  </td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">
                    <strong style="color:#ffffff;">Noticias del sector</strong> filtradas y resumidas cada semana
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:28px;">
                    <span style="color:#22d3ee;font-size:18px;">→</span>
                  </td>
                  <td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">
                    <strong style="color:#ffffff;">Contenido nuevo cada semana</strong>, sin que tengas que buscar nada
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://leadr.cloud/dashboard?utm_source=email&utm_medium=bienvenida&utm_campaign=leadr-bienvenida-actividad&utm_content=cta-principal"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">
                      Empezá a aprender →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Nota token -->
              <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">
                Tu acceso Pro está activo hasta el 21 de junio.<br/>
                Si tenés alguna duda, respondé este email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 20px 0 20px;">
              <p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">
                Recibís este email porque activaste tu acceso Pro en Leadr.<br/>
                <a href="{{unsubscribe}}" style="color:#40405a;">Darte de baja</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

---

## Destinatarios (13)

```
josezambrano250920@gmail.com
emmanuel.cabello@uteq.edu.mx
bagual001@gmail.com
renefabiancardozo@gmail.com
carlos.robledo49@yahoo.com
oilujrasecinamam@gmail.com
mariajose1978@gmail.com
parceparce894@gmail.com
gustavo.mathieu@gmail.com
amalavoz@gmail.com
pguzmanparedes@gmail.com
sosadaniel2104@gmail.com
pinerojmeister@gmail.com
```

---

## Qué medir

| Métrica | Dónde verla | Meta |
|---------|-------------|------|
| Tasa de apertura | Brevo → campaña | >35% |
| Clics en CTA | Brevo → campaña | >20% |
| Entradas al dashboard | Vercel Analytics (utm_campaign=leadr-bienvenida-actividad) | >3 personas |
| Clases vistas post-email | Supabase → user_progress (revisar 48hs después) | >2 personas |

---

## Próximo paso

Revisar `user_progress` 48 horas después del envío para ver cuántos de los 13 abrieron su primera clase.
