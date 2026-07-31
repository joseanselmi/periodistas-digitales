# 🗂️ Agenda diaria del tablero (Trello) — cómo funciona

Cada mañana, **colgado del mismo email diario** (Panel de Salud, ~12 ART, que se dispara
desde el cron de `recuperacion`), el sistema mira el tablero **Roadmap Periodistas Digitales**
y hace dos cosas. Todo vive en [`api/trello-diario.js`](../api/trello-diario.js) y se cuela en el
correo desde [`api/salud.js`](../api/salud.js). **Un solo email, no llena la casilla.**

## 1) Te AVISA lo que tiene fecha (el corazón de esto)

Para que una tarjeta aparezca en la agenda, tiene que tener **fecha de vencimiento (due date)**
en Trello. Sin fecha, la agenda no la ve. Las que tengan fecha, no estén tildadas y no estén en
**Hecho**, se agrupan en el email:

- 🔴 **Vencidas** — se te pasó la fecha.
- 🟡 **Para hoy**.
- 🔵 **Próximos 3 días**.

Cada línea muestra la tarjeta, el agente (por su label) y hace/faltan cuántos días. Así, si te
olvidás de algo con fecha, el mail de la mañana te lo recuerda solo.

> **Lo único que tenés que hacer vos:** ponerle **fecha** a las tarjetas que querés que te
> recuerde. Es un clic en Trello ("Fecha" → elegir día).

## 2) EJECUTA solo lo que ya es un flujo con código

Una tarjeta se corre sola si en su **descripción** tiene una línea:

```
AUTO: /api/wa-funnel
```

y está **vencida o vence hoy**. El sistema llama a ese flujo; si responde OK, **tilda** la
tarjeta, la **mueve a Hecho** y le deja un comentario "✅ Corrido automático". Sirve para que las
tarjetas recurrentes de un flujo que ya corre solo se **cierren solas** (no para inventar
ejecución de tareas manuales — grabar un video, escribir copy, aprobar algo: eso no se puede
automatizar, solo recordar).

**Flujos permitidos** (lista blanca, por seguridad — nada de URLs arbitrarias):

| Escribí en la descripción | Qué corre |
|---|---|
| `AUTO: /api/wa-funnel`     | Motor diario del funnel de WhatsApp |
| `AUTO: /api/hotmart-sync`  | Sync de ventas de Hotmart |
| `AUTO: /api/sync-estados`  | Sync de estados de agentes |

(No se permiten `salud` ni `recuperacion`: son los que disparan la agenda → haría un bucle.)

## Requisito para que quede LIVE: env vars en Vercel

El endpoint necesita las credenciales de Trello en el proyecto **sistema-ingresos-landing** de
Vercel (hoy solo están en `ads-agent/.env`). Agregar en Vercel → Settings → Environment Variables:

- `TRELLO_API_KEY` — (el mismo valor que en `ads-agent/.env`)
- `TRELLO_TOKEN` — (idem)

Si faltan, el email de salud sale igual pero **sin** la sección de agenda (degradación limpia,
no rompe nada).

## Probar a mano

- `GET /api/trello-diario?mode=json&key=<CRON_SECRET>` → diagnostica y ejecuta AUTO, devuelve
  el resumen en JSON (sin mandar email).
- `GET /api/trello-diario?mode=send&key=<CRON_SECRET>` → manda un email suelto de prueba con la
  agenda (aparte del Panel de Salud).
