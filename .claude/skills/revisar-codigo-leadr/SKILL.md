---
name: revisar-codigo-leadr
description: Revisar el código de Leadr (../Leadr) antes de publicar un cambio, con las tres lentes que antes eran tres agentes separados — backend y seguridad, frontend y UX, y QA/performance/infra. Usar al tocar una ruta API, un componente o antes de un deploy de leadr.cloud. Arrastra los hallazgos abiertos de auditorías anteriores para no redescubrir lo mismo.
---

# Revisar el código de Leadr

Una sola revisión con **tres lentes**. Antes eran tres agentes separados —Nicolás
(backend), Valeria (frontend) y Max (QA)— y no se invocaba a ninguno, porque el
momento en que hacen falta es siempre el mismo: **antes de publicar un cambio**.

> **El código está en `../Leadr`, no en este repo.** Leadr se separó el 2026-06-27.
> Acá vive solo el criterio de revisión.

## Paso 0 — Qué se está revisando

| Si tocaste… | Lente obligatoria | Las otras |
|---|---|---|
| `../Leadr/app/app/api/**` | Backend | Conviene QA |
| `../Leadr/app/app/**` (páginas, componentes) | Frontend | Conviene QA |
| Migraciones, RLS, Supabase | QA/Infra | Backend si toca auth |
| Antes de un deploy | **Las tres** | — |

Y en frontend, antes que nada: **¿es vista admin o vista usuario?** Los criterios
son distintos y confundirlos es el error más común.

- **Admin** si la ruta contiene `/admin`
- **Usuario** si es el resto (dashboard, clases, perfil)

---

## Lente 1 — Backend y seguridad (era Nicolás)

Por cada ruta API:

1. **Autenticación y autorización** — ¿verifica sesión? ¿verifica que sea admin
   donde corresponde? ¿un usuario puede leer datos de otro cambiando un id?
2. **Variables de entorno** — ¿falla claro si falta una, o rompe en runtime con
   un error incomprensible?
3. **Manejo de errores** — ¿try/catch? ¿el error que ve el cliente filtra
   detalles internos?
4. **Status HTTP** — 401 sin sesión, 403 sin permiso, 400 input inválido,
   404 no existe. No devolver 200 con `{error}` adentro.
5. **Validación de input** — nunca confiar en el body.
6. **Supabase** — ¿usa la key correcta? La `service_role` **jamás** del lado
   cliente.
7. **Webhooks externos** (Hotmart) — ¿valida la firma o un secreto compartido?
   Un webhook abierto es una puerta abierta.
8. **SSRF y redirecciones** — ningún redirect que acepte destino del usuario sin
   restringirlo a un patrón seguro.

## Lente 2 — Frontend y UX (era Valeria)

**Vista usuario** — es gente que paga: claridad sobre densidad. Estados de carga
y de error visibles, nada de pantallas en blanco. Que se entienda qué hacer
después. Móvil primero: el 82% del tráfico entra por el webview de FB/IG.

**Vista admin** — es Jose trabajando: densidad sobre belleza. Que la información
esté a la vista sin clics de más, y que las acciones destructivas pidan
confirmación.

**Universales** — consistencia con la paleta de marca (`#07070f`, indigo `#6366f1`,
cyan `#22d3ee`), jerarquía tipográfica clara, nada de texto ilegible sobre fondo
oscuro, y ningún string en inglés colado en la interfaz.

## Lente 3 — QA, performance e infraestructura (era Max)

- **Leadr** (`leadr.cloud`) y **landing** — que cargue, que no haya links rotos,
  peso razonable.
- **Supabase** — RLS habilitado **y con políticas** (habilitado sin políticas es
  una tabla cerrada, no protegida); funciones `SECURITY DEFINER` que no sean
  invocables por `anon`; `auth.uid()` en políticas envuelto en `(select ...)` para
  que no se re-evalúe por fila.
- **Vercel** — que el último deploy sea el que se cree que es.

---

## Lo aprendido — hallazgos abiertos desde 2026-05-23

**Chequear primero si siguen abiertos.** Son de la última auditoría real y nadie
los cerró; redescubrirlos es perder el tiempo.

### Backend

- `LEADR2026` es un token **multi-uso sin `expires_at`** — cualquiera con el
  código activa Pro para siempre. Setear vencimiento desde `admin/accesos`.
- `HOTMART_ANNUAL_PRODUCT_ID` sin configurar — el plan anual no activa hasta que
  exista el producto en Hotmart.

### Infra / Supabase

- Tabla `landing_events` **no existe** y algo le pega: 404 desde iPhone Safari.
- `auth.is_admin` es `SECURITY DEFINER` **invocable por `anon`** — riesgo medio.
- **8 tablas** re-evalúan `auth.uid()` por fila en sus políticas RLS — se paga a
  escala.
- `activation_tokens` tiene **RLS habilitado pero sin políticas**.

Rutas ya revisadas alguna vez: `/api/activar`, `/api/activar-redirect`,
`/api/hotmart`, `/api/admin/tokens`.

> Semáforo de mayo: Leadr 🟢 · landing 🟡 · Supabase 🟡.

---

## El veredicto

Uno solo para las tres lentes, y sin medias tintas:

| | Cuándo | Qué significa |
|---|---|---|
| 🟢 **Listo** | Ningún hallazgo que importe | Se publica |
| 🟡 **Ajustes** | Cosas a corregir, ninguna crítica | Se publica después de corregirlas |
| 🔴 **No publicar** | Al menos un crítico | Se frena hasta resolverlo |

**Críticos que frenan sí o sí:** cualquier ruta que exponga datos de un usuario a
otro · la `service_role` del lado cliente · un webhook sin validar · una tabla con
datos personales sin RLS efectivo.

El reporte va con **archivo y línea**, y separando lo que hay que arreglar ahora
de lo que puede esperar. Jose no es técnico: cada hallazgo explica **qué pasa si
no se arregla**, no solo qué está mal.

## Al terminar

Si aparecen críticos nuevos, dejarlos en una tarjeta de Trello con la label
**Nicolás (Backend)** — y actualizar la sección "Lo aprendido" de esta skill, que
es la memoria que reemplaza a los tres `state.json` que tenían los agentes viejos.
