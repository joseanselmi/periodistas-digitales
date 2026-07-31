# Guía: crear la app de WhatsApp Business en Meta y sacar los 3 datos

> Para: conectar WhatsApp a Make y mandar los Regalos 3/4 + Oferta del funnel
> "Guía Claude Periodistas". Esta parte son **clicks manuales en la web de Meta**
> (no se puede hacer por API/Claude). El resto (mandar plantillas a aprobar,
> armar el escenario de Make) sí lo hace Claude una vez que existan los 3 datos.

## Lo que necesitamos sacar (los 3 datos)

Al terminar esta guía vas a tener anotados:

1. **Phone Number ID** — un número largo (NO es el teléfono; es un ID interno).
2. **WABA ID** — ID de la cuenta de WhatsApp Business.
3. **Token permanente** — la "llave" que usa Make. NO el temporal de 24hs.

⚠️ **Advertencia sobre el número:** un número registrado en la Cloud API deja de
funcionar en la app normal de WhatsApp del celular. Usá un número exclusivo para
esto, y asegurate de poder recibir un SMS/llamada de verificación en él.

---

## FASE 1 — Crear la app y agregar WhatsApp

1. Entrá a **developers.facebook.com/apps** (logueado con tu Facebook del Business).
2. Botón **"Crear app"** (Create App).
3. Elegí el caso de uso **"Otro" → tipo "Empresa/Business"** (si te pide vincular
   un Business Portfolio, elegí el de Periodistas Digitales / el mismo que ya usás
   para los anuncios).
4. Ponele un nombre (ej. `Periodistas WhatsApp`) y creala.
5. En el panel de la app, buscá el producto **WhatsApp** y tocá **"Configurar"** (Set up).

## FASE 2 — Registrar el número

En la sección **WhatsApp → Configuración de la API / "Empezar" (Getting Started)**:

- Vas a ver un **número de prueba gratis** que da Meta y un selector "De" (From).
- Para usar TU número: tocá **"Agregar número de teléfono"** (Add phone number),
  cargá el número, elegí verificación por **SMS o llamada**, y meté el código que
  te llegue.
- ✅ Apenas quede verificado, **anotá el "ID del número de teléfono" (Phone Number ID)**
  que aparece justo debajo del selector. Ese es el **dato #1**.

## FASE 3 — Sacar el WABA ID

- En esa misma pantalla de WhatsApp, arriba/al costado dice
  **"Identificador de la cuenta de WhatsApp Business"** (WhatsApp Business Account ID).
- Copialo. Ese es el **dato #2 (WABA ID)**.
- (Si no lo ves ahí: Business Settings → Cuentas → Cuentas de WhatsApp → seleccioná
  la cuenta y el ID aparece arriba.)

## FASE 4 — Token PERMANENTE (el paso más delicado)

El token que aparece en "Getting Started" dura **solo 24hs** — no sirve para Make.
Hay que generar uno permanente vía System User:

1. Entrá a **business.facebook.com/settings** (Configuración del negocio).
2. Menú izquierdo → **Usuarios → Usuarios del sistema** (System Users).
3. **"Agregar"** → nombre (ej. `whatsapp-make`) → rol **Administrador** → crear.
4. Con ese usuario seleccionado, tocá **"Asignar activos"** (Add Assets):
   - En **Apps**, asigná la app que creaste (control total).
   - En **Cuentas de WhatsApp**, asigná tu WABA (control total).
5. Tocá **"Generar nuevo token"** (Generate new token):
   - Elegí la app que creaste.
   - Marcá los permisos: **`whatsapp_business_messaging`** y
     **`whatsapp_business_management`**.
   - Generá → **copiá el token AHORA** (se muestra una sola vez; si lo perdés,
     generás otro).
- Ese es el **dato #3 (token permanente)**.

---

## Cuando tengas los 3 datos → me los pasás

Mandámelos así (el token es secreto, pero es lo que Make necesita):

```
Phone Number ID: ...
WABA ID: ...
Token: ...
```

Con eso Claude:
1. **Manda las 3 plantillas a aprobar por la Graph API** (Regalo 3, Regalo 4,
   Oferta — contenido ya escrito en `whatsapp-regalos-3-4-oferta.md`). La
   aprobación de Meta tarda horas, por eso es lo primero.
2. Prepara la **conexión "WhatsApp Business Cloud" en Make** y el escenario que
   dispara los mensajes (con normalización del prefijo "9" para números argentinos
   — ver `reference_whatsapp_business_api`).

## Tip: podés arrancar la aprobación de plantillas en paralelo

No hace falta esperar a tener TODO. Apenas tengas la app + WABA creados, la
aprobación de las plantillas puede ir corriendo mientras armás el token y Make.
