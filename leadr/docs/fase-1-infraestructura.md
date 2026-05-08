# Fase 1 — Infraestructura base

**Estado:** Completada
**Fecha:** 2026-04-20

---

## Que se hizo

Configuracion del proyecto Supabase existente y creacion del esquema completo de base de datos para Leadr.

---

## Supabase

- **Proyecto:** joseanselmi27@gmail.com's Project
- **ID:** wbwfzsdhtbhkjlfuebrd
- **URL:** https://wbwfzsdhtbhkjlfuebrd.supabase.co
- **Region:** eu-west-1
- **Estado:** ACTIVE_HEALTHY

El proyecto estaba INACTIVE y fue reactivado con `restore_project`.

---

## Tablas creadas

### users
Extiende `auth.users` de Supabase. Se crea automaticamente via trigger al registrarse.

| Columna | Tipo | Descripcion |
|---|---|---|
| id | UUID | FK a auth.users |
| email | TEXT | Email del usuario |
| plan | TEXT | 'basic' o 'pro' |
| created_at | TIMESTAMPTZ | Fecha de registro |

### groups
Modulos o categorias que agrupan el contenido.

| Columna | Tipo | Descripcion |
|---|---|---|
| id | SERIAL | PK autoincremental |
| name | TEXT | Nombre del grupo |
| category | TEXT | 'clases', 'prompts', 'automatizaciones', 'bonus' |
| order_index | INT | Orden de aparicion |

### classes
Contenido principal de la plataforma.

| Columna | Tipo | Descripcion |
|---|---|---|
| id | SERIAL | PK autoincremental |
| title | TEXT | Titulo de la clase |
| description | TEXT | Descripcion corta |
| group_id | INT | FK a groups |
| plan_required | TEXT | 'basic' o 'pro' |
| video_url | TEXT | ID del video de YouTube |
| slides_url | TEXT | URL del HTML de slides en Supabase Storage |
| audio_urls | JSONB | Array de URLs MP3 por slide (modo v2) |
| status | TEXT | 'draft' o 'published' |

### user_progress
Registro de clases vistas por usuario.

| Columna | Tipo | Descripcion |
|---|---|---|
| user_id | UUID | FK a users |
| class_id | INT | FK a classes |
| watched_at | TIMESTAMPTZ | Fecha en que marco como vista |

---

## Row Level Security

Todas las tablas tienen RLS habilitado.

| Politica | Tabla | Regla |
|---|---|---|
| users_own_profile | users | Solo puede ver/editar su propio perfil |
| groups_authenticated_read | groups | Cualquier usuario autenticado puede ver grupos |
| classes_plan_access | classes | Basic ve basicas, Pro ve todo (solo published) |
| progress_own_data | user_progress | Solo puede ver/editar su propio progreso |

---

## Trigger automatico

Al registrarse un usuario en `auth.users`, el trigger `on_auth_user_created` crea automaticamente una fila en `public.users` con plan `basic`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan)
  VALUES (NEW.id, NEW.email, 'basic');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Datos de prueba cargados

5 grupos y 7 clases distribuidas entre categorias y planes.

| Clase | Plan | Categoria |
|---|---|---|
| Introduccion a Periodistas Digitales | basic | clases |
| Como usar IA en tu trabajo diario | basic | clases |
| Workflows avanzados con IA | pro | clases |
| Prompt de investigacion profunda | basic | prompts |
| Prompt de analisis de fuentes | pro | prompts |
| Automatizacion de newsletter con Make | pro | automatizaciones |
| Clase bonus — Monetizacion | pro | bonus |

---

## Tests ejecutados

- INSERT en groups y classes + JOIN → OK
- Verificacion de estructura de tablas → OK
- 7 clases con grupos correctamente asignados → OK
