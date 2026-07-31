# Make — los escenarios de captura de leads

**Un escenario por formulario.** Cada webhook de Facebook Lead Ads queda atado a UN
formulario, así que no hay forma de que uno solo atienda a los dos.

| Formulario | Hook | Escenario | Entrega |
|---|---|---|---|
| `1075862554796241` · Guía Claude | 4236957 | **9474482** `Funnel Leads - Instantaneo (webhook)` | mail de Claude · Brevo lista 5 · funnel `meta-leadgen-guia-claude` |
| `1405521768162136` · ad5-lectores | 4291425 | **9601453** `Funnel Leads - Republicadores (webhook)` | guía "Que te lean miles" · Brevo lista 6 · funnel `meta-leadgen-republicadores` |

> 🚨 **NO vaciar el campo "Form" del escenario 9474482.** Ese escenario conserva adentro
> un router con una rama para "cualquier otro formulario", que hoy nunca se dispara
> porque su webhook solo recibe el de la Guía Claude. Si se vacía ese campo, los leads
> del formulario nuevo caerían **en los dos escenarios a la vez** y la persona recibiría
> el correo duplicado. Cada formulario nuevo va con su propio escenario.

**Campaña nueva = formulario nuevo = hook nuevo + escenario nuevo.** Se clona el 9601453
y se cambian: el `formId` del hook, el contenido del mail, el `listIds` de Brevo y el
`funnel` de `/api/lead`.

---

## Historia: el escenario 9474482 (por qué tiene un router adentro)

Es el único escenario que recibe los leads de **todos** los formularios de Facebook Lead
Ads. Modificado el 31/07/2026 para que cada campaña entregue lo suyo.

## El problema que resolvió

Hasta el 31/07 era **un solo camino**. Entraba un lead —del formulario que fuera— y hacía
siempre lo mismo, con los valores escritos a mano adentro de los módulos:

1. Mandaba el mail *"Tu guía gratis de Claude para periodismo"*
2. Lo sumaba a la **lista 5** de Brevo (Leadgen - Guía Claude)
3. Lo mandaba a `/api/lead` **sin el campo `funnel`** → caía con el valor por defecto

Con la campaña `republicadores` recién publicada, **el primer periodista que bajara la
guía nueva iba a recibir la de Claude**, entrar en la secuencia vieja y quedar contado en
el embudo equivocado. Se detectó antes de que entrara ningún lead por el formulario nuevo.

## Cómo quedó

```
Facebook Lead Ads (trigger, hook 4236957)
        │
        └── Router (módulo 20)
              │
              ├── RAMA 1 · filtro: formId = 1075862554796241
              │     3  → mail "Tu guía gratis de Claude para periodismo"
              │     4  → Brevo lista 5
              │     5  → /api/lead · funnel = meta-leadgen-guia-claude
              │
              └── RAMA 2 · filtro: formId ≠ 1075862554796241
                    30 → mail "Tu guía: que te lean miles, no solo tus amigos"
                    40 → Brevo lista 6
                    50 → /api/lead · funnel = meta-leadgen-republicadores
```

La rama 1 quedó **idéntica a como estaba**, salvo que ahora manda explícito su `funnel` en
vez de depender del valor por defecto de `api/lead.js`.

## Piezas que hubo que crear

| Qué | Dónde |
|---|---|
| Lista **6** de Brevo — "Leadgen - Republicadores (Que te lean miles)" | Brevo, carpeta 1 |
| Mail de entrega de la guía nueva | Módulo 30 (HTML inline, igual que el de Claude) |
| Etiqueta de embudo | Módulo 50, campo `funnel` |

El mail nuevo abre con la misma frase del anuncio —*"Compartes noticias en tu perfil casi
todos los días. Y solo las ven unos pocos"*— para que el lector reconozca de dónde viene,
lista los 4 puntos concretos de la guía, y el botón de descarga apunta a
`/api/d?file=que-te-lean-miles.pdf&src=Email-Republicadores-R1&sck=emailrep1`, **nunca al
PDF directo** (si no, la apertura no queda registrada).

## 🔴 El webhook escucha UN formulario, no la página entera

**Esto costó una tarde de diagnóstico el 31/07.** El router estaba bien y aun así no
entraba nada del formulario nuevo: Meta decía "Success" y Make no registraba ninguna
ejecución.

La causa está en el **hook 4236957** (`FB Lead Ads - Guia Claude (instant)`), que tenía:

```json
"data": { "pageId": "439763019230527", "formId": "1075862554796241" }
```

Con `formId` fijo, **Make descarta los leads de cualquier otro formulario antes de
ejecutar el escenario**. La entrega llega, el filtro la rechaza, y no queda rastro en el
historial de ejecuciones — solo del lado de Meta, que la da por entregada.

**La solución:** en el manifiesto del hook, `formId` es **opcional**. Vaciándolo, el
webhook escucha **todos los formularios de la página** y el router hace la separación.

⚠️ **Solo se puede vaciar desde la interfaz de Make**: el hook viene con `editable: false`
y la API responde *Access denied*. Se abre el escenario → primer módulo (Facebook Lead
Ads) → campo **Form** → dejarlo sin selección → guardar.

**Regla para el futuro:** cada formulario nuevo que se cree en Meta **no llega solo**.
O el hook escucha todos los formularios, o hay que agregarlo a mano. Si un formulario
nuevo "no dispara nada", mirar esto ANTES que el escenario.

## ⚠️ Trampas

- **Un tercer formulario caería en la rama 2 por descarte.** El filtro de esa rama es "todo
  lo que no sea el formulario viejo". Al crear otra campaña hay que **darle su propio
  filtro** y dejar la de republicadores con `formId = <el suyo>`.
- **Las opciones de la pregunta de calificación se escriben exactamente "Sí" y "No".**
  `api/lead.js` las interpreta con una expresión regular para llenar `es_periodista`; con
  cualquier otro texto el campo queda vacío y se pierde la segmentación.
- **El blueprint se reemplaza entero**, no se fusiona: hay que leerlo con `scenarios_get`,
  editarlo y mandarlo completo. Si se manda parcial, se pierde lo que falte.
- Tras cualquier cambio, **releer el escenario** y confirmar `isinvalid: false` e
  `isActive: true`. Un error de sintaxis rompe la captura de **los dos** embudos a la vez.

## Cómo verificarlo sin esperar un lead real

En Meta, vista previa del formulario → enviar una prueba. Después:

```sql
select email, form_id, funnel, es_periodista, ocurrido_en
from public.leads order by ocurrido_en desc limit 5;
```

Tiene que aparecer con el `funnel` de su rama y `es_periodista` poblado.
