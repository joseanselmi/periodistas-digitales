# Plan de lanzamiento a produccion — Leadr

Plataforma de clases online para alumnos de Periodistas Digitales.
Dos planes: Basic (Periodista Digital) y Pro (Periodista Digital Pro).

---

## FASE 1 — Infraestructura base (Dia 1-2)

### Supabase: esquema de base de datos

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'basic', -- 'basic' | 'pro'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'clases' | 'prompts' | 'automatizaciones' | 'bonus'
  order_index INT DEFAULT 0
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  group_id INT REFERENCES groups(id),
  plan_required TEXT DEFAULT 'basic',
  video_url TEXT,
  slides_url TEXT,
  audio_urls JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_progress (
  user_id UUID REFERENCES users(id),
  class_id INT REFERENCES classes(id),
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, class_id)
);
```

### Test fase 1
```sql
INSERT INTO groups (name, category) VALUES ('Modulo 1', 'clases');
INSERT INTO classes (title, group_id, plan_required) VALUES ('Test clase', 1, 'basic');
SELECT * FROM classes JOIN groups ON classes.group_id = groups.id;
-- Esperado: 1 fila con join correcto
```

---

## FASE 2 — Auth y RLS (Dia 2-3)

### Row Level Security — control de acceso por plan

```sql
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_access" ON classes
  FOR SELECT USING (
    plan_required = 'basic'
    OR (
      plan_required = 'pro'
      AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND plan = 'pro'
      )
    )
  );

CREATE POLICY "own_progress" ON user_progress
  FOR ALL USING (user_id = auth.uid());
```

### Test fase 2
```
- Usuario basic no ve clases Pro (RLS bloquea a nivel DB)
- Usuario pro ve todas las clases
- Verificar en Supabase Dashboard > Auth > Policies
```

---

## FASE 3 — Next.js: scaffold y conexion (Dia 3-4)

### Instalar dependencias
```bash
cd "c:/Users/Jose Anselmi/OneDrive/Escritorio/Periodistas Digitales/web"
npm install @supabase/supabase-js @supabase/ssr
```

### Cliente Supabase
```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
ANTHROPIC_API_KEY=sk-ant-xxx
ELEVENLABS_API_KEY=xxx
```

### Test fase 3
```ts
const { data } = await supabase.from('classes').select('*')
console.log(data)
// Esperado: array con clases segun plan del usuario logueado
```

---

## FASE 4 — Login y Dashboard real (Dia 4-5)

### Login — app/login/page.tsx
```tsx
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (!error) router.push('/dashboard')
```

### Dashboard — query grupos + clases
```tsx
const { data: groups } = await supabase
  .from('groups')
  .select('*, classes(*)')
  .order('order_index')
```

### Marcar clase como vista
```tsx
await supabase.from('user_progress').upsert({ user_id: user.id, class_id: classId })
```

### Test fase 4
```
- Login incorrecto muestra error
- Login correcto redirige al dashboard
- Dashboard carga grupos y clases desde Supabase
- Usuario basic no ve clases Pro
- Marcar como visto persiste al recargar
- Logout redirige a login
```

---

## FASE 5 — Generacion de clases con Claude (Dia 5-7)

### API Route — app/api/generate-class/route.ts
```ts
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  const { instruction } = await req.json()
  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Genera una clase sobre: ${instruction}
      Devuelve JSON: {
        "title": "...",
        "description": "...",
        "slides": [{ "type": "title|content", "heading": "...", "bullets": ["..."], "notes": "texto para audio" }]
      }`
    }]
  })
  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  return Response.json(JSON.parse(content))
}
```

### Guardar slides en Supabase Storage
```ts
const blob = new Blob([slidesHtml], { type: 'text/html' })
await supabase.storage.from('slides').upload(`classes/${classId}/index.html`, blob)
```

### Test fase 5
```
- POST /api/generate-class devuelve JSON valido con slides
- HTML generado tiene brand colors aplicados
- HTML sube a Supabase Storage y URL es publica
- Clase guardada en DB como draft
- Admin puede publicar y aparece en dashboard
```

---

## FASE 6 — Audio con ElevenLabs (Dia 7-9) — modo v2

### API Route — app/api/generate-audio/route.ts
```ts
for (const [idx, slide] of slides.entries()) {
  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/{voice_id}', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
    body: JSON.stringify({ text: slide.notes, voice_settings: { stability: 0.5 } })
  })
  const buf = await res.arrayBuffer()
  await supabase.storage.from('audio').upload(`classes/${classId}/slide-${idx}.mp3`, buf)
}
```

### Test fase 6
```
- 1 MP3 generado por slide
- URLs guardadas en classes.audio_urls
- Player sincroniza slide con audio correctamente
- Costo por clase menor a $0.50
```

---

## FASE 7 — QA completo (Dia 9-10)

| Area | Test | Esperado |
|---|---|---|
| Auth | Login / Logout | Funciona, sesion persiste |
| Auth | Registro nuevo usuario | Plan basic por defecto |
| Auth | Ruta protegida sin login | Redirige a /login |
| Planes | Usuario basic + clase pro | Candado, sin contenido |
| Planes | Usuario pro + clase pro | Acceso completo |
| Clases | Video YouTube embed | Carga correctamente |
| Clases | Marcar como visto | Persiste en DB |
| Admin | Crear clase manual | Aparece como draft |
| Admin | Generar con IA | Claude responde, HTML guardado |
| Admin | Publicar clase | Visible en dashboard alumno |
| Admin | Brand identity | Colores aplicados en slides |
| Mobile | Dashboard | Cards responsive sin scroll horizontal |
| Mobile | Vista de clase | Video responsive |

---

## FASE 8 — Deploy (Dia 10)

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add ANTHROPIC_API_KEY production

git add .
git commit -m "feat: produccion completa - auth, DB, generacion IA"
git push
# Vercel redeploya automaticamente
```

### Test final
```
- URL produccion carga en menos de 3 seg
- Login funciona en produccion
- Claude API responde sin CORS
- Supabase Storage URLs publicas accesibles
- No hay API keys en client-side
```

---

## Resumen de tiempos

| Fase | Dias | Bloqueante |
|---|---|---|
| 1-2: Infra + Auth | 1-3 | Si |
| 3-4: Next.js + Login + Dashboard | 3-5 | Si |
| 5: Generacion Claude | 5-7 | Paralelo al 4 |
| 6: Audio ElevenLabs | 7-9 | Opcional para v1 |
| 7-8: QA + Deploy | 9-10 | Si |

Total estimado: 10 dias de trabajo a tiempo parcial.

---

## Stack

- Next.js 16 + TypeScript + Tailwind CSS — carpeta /web
- Supabase: Auth + DB + Storage
- Claude API claude-opus-4-7 — generacion de slides
- ElevenLabs API — voz para modo v2
- Vercel — hosting
- GitHub: https://github.com/joseanselmi/periodistas-digitales
- Produccion: https://web-eight-mu-lz57dkhohk.vercel.app
