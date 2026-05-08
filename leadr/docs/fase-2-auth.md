# Fase 2 — Auth y conexion Next.js

**Estado:** Completada
**Fecha:** 2026-04-20

---

## Que se hizo

Instalacion de Supabase en el proyecto Next.js, configuracion de clientes, middleware de proteccion de rutas, y pantallas de login y dashboard conectadas a datos reales.

---

## Dependencias instaladas

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Archivos creados

### lib/supabase/client.ts
Cliente Supabase para uso en componentes del lado del cliente (browser).

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### lib/supabase/server.ts
Cliente Supabase para uso en Server Components y API Routes. Lee y escribe cookies de sesion.

### middleware.ts
Protege rutas antes de que lleguen al componente.

- Rutas protegidas: `/dashboard`, `/clase`, `/admin`
- Sin sesion → redirect a `/login`
- Con sesion en `/login` → redirect a `/dashboard`

### app/login/page.tsx
Pantalla de login con:
- Formulario email + password
- Manejo de errores con mensaje claro
- Redirect a `/dashboard` tras login exitoso
- Estilo dark mode con brand colors (cyan/slate)

### app/dashboard/page.tsx (Server Component)
Obtiene desde Supabase:
- Perfil del usuario (plan)
- Grupos con clases anidadas
- Progreso del usuario (clases vistas)

Pasa todo como props al componente cliente.

### app/dashboard/dashboard-client.tsx (Client Component)
UI del dashboard:
- Navbar con plan badge y boton de logout
- Tabs por categoria (Clases / Prompts / Automatizaciones / Bonus)
- Cards por grupo con indicador de plan y check de visto
- Cards Pro con candado para usuarios Basic

### app/auth/callback/route.ts
Maneja el codigo OAuth para autenticacion por magic link (futuro).

---

## Variables de entorno (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://wbwfzsdhtbhkjlfuebrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=          <- completar
ELEVENLABS_API_KEY=         <- completar
```

---

## Como crear un usuario para probar

1. Ir a Supabase Dashboard > Authentication > Users
2. Invite user o crear con email + password
3. El trigger asigna plan `basic` automaticamente
4. Para dar plan pro: `UPDATE users SET plan = 'pro' WHERE email = 'x@x.com'`

---

## Tests ejecutados

| Test | Resultado |
|---|---|
| GET /login | 200 OK |
| GET /dashboard sin sesion | 307 redirect a /login |
| Type check archivos nuevos | Sin errores |
| Middleware protege rutas | OK |
