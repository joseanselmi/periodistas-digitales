# Fase 4 — Panel Admin

**Estado:** Completada
**Fecha:** 2026-04-20

---

## Que se hizo

Panel de administracion completo con listado de clases, formulario de creacion y edicion, y proteccion por rol `is_admin`.

---

## Cambios en base de datos

### Columna is_admin
```sql
ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
```

### Politicas RLS para admin
```sql
-- Admin ve y gestiona todas las clases (incluyendo drafts)
CREATE POLICY "admin_all_classes" ON public.classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin gestiona grupos
CREATE POLICY "admin_all_groups" ON public.groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );
```

### Dar permisos de admin a un usuario
```sql
UPDATE public.users SET is_admin = true WHERE email = 'joseanselmi27@gmail.com';
```
Nota: ejecutar esto DESPUES de que el usuario se haya registrado al menos una vez (para que exista en public.users).

---

## Archivos creados

### app/admin/page.tsx (Server Component)
Protecciones:
- Sin sesion → redirect a /login
- Sin is_admin → redirect a /dashboard

Carga desde Supabase:
- Todas las clases (incluyendo drafts, gracias a la politica admin)
- Todos los grupos

### app/admin/admin-client.tsx (Client Component)
UI del panel:
- Navbar con link a "Ver plataforma" y boton "+ Nueva clase"
- Stats: cantidad publicadas y borradores
- Filtros: Todas / Publicadas / Borradores
- Tabla con columnas: Titulo, Grupo, Plan, Estado, Acciones
- Acciones por fila: Editar / Publicar-Despublicar / Eliminar
- Listado de grupos al pie

### app/admin/nueva-clase/page.tsx
Server component que verifica is_admin y carga grupos.
Renderiza ClaseForm sin clase preexistente (modo creacion).

### app/admin/clase/[id]/page.tsx
Server component que verifica is_admin, carga la clase por ID y los grupos.
Renderiza ClaseForm con datos de la clase (modo edicion).

### app/admin/clase-form.tsx (Client Component)
Formulario compartido para crear y editar clases:
- Campo: Titulo (obligatorio)
- Campo: Descripcion (textarea)
- Select: Grupo (agrupado por categoria via optgroup)
- Select: Plan requerido (basic / pro)
- Campo: ID de video YouTube
- Campo: URL de slides (Supabase Storage)
- Toggle: Estado (Borrador / Publicada)
- Submit: llama a Supabase insert o update segun modo

---

## Flujo de uso

1. Admin va a /admin
2. Ve listado de clases con filtros
3. Hace clic en "+ Nueva clase" → va a /admin/nueva-clase
4. Completa el formulario → guarda como borrador o publica directo
5. Desde el listado puede publicar/despublicar con un click
6. Puede editar cualquier campo desde /admin/clase/[id]

---

## Tests ejecutados

| Test | Resultado |
|---|---|
| GET /admin sin sesion | 307 redirect a /login |
| GET /admin con usuario no-admin | 307 redirect a /dashboard |
| Type check archivos | Sin errores |
| Crear clase via formulario | INSERT en Supabase OK |
| Editar clase via formulario | UPDATE en Supabase OK |
| Publicar/despublicar | UPDATE status OK |
| Eliminar clase | DELETE OK con confirmacion |

---

## Notas

- El campo `video_url` guarda solo el ID de YouTube (ej: `dQw4w9WgXcQ`), no la URL completa
- El campo `slides_url` se llena manualmente por ahora; en Fase 5 se llena automaticamente con la generacion por IA
- El admin puede tener cualquier plan (basic o pro); el acceso al panel es por `is_admin`, no por plan
