# Configs de grupos Leadr

Cada archivo JSON en esta carpeta define un grupo completo de clases para Leadr.

Uso:
```bash
node scripts/crear-clase.mjs --config scripts/configs/nombre-grupo.json
```

Variables de entorno necesarias:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (del panel Supabase → Settings → API → service_role)
