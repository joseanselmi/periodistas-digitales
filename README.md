# Periodistas Digitales

Repositorio del negocio **Periodistas Digitales**. Contiene dos proyectos
independientes que comparten la misma base de marketing (Supabase
`periodistas-marketing`) y el mismo tablero de trabajo (Trello "Roadmap
Periodistas Digitales").

> Para el contexto operativo completo (Trello, agentes, reglas de trabajo) ver
> [CLAUDE.md](CLAUDE.md) — es el archivo que se carga como contexto en cada
> sesión de Claude Code. Este README es el mapa "para humanos".

## Los dos proyectos

| Carpeta | Qué es | Deploy |
|---|---|---|
| [`sistema-ingresos/`](sistema-ingresos/) | Landing + backend del curso **"Sistema de Ingresos Diarios"** (pago único en Hotmart, $27). HTML de las páginas + funciones serverless (`api/`) que corren en Vercel. | Vercel `sistema-ingresos-landing` → `sistemadeingresosdiariosia.com` |
| [`ads-agent/`](ads-agent/) | **Equipo de agentes de marketing** (Meta Ads, email, contenido orgánico, carruseles). Scripts `.mjs` que se corren a mano + los "cerebros", el estado y el material que producen. | Se corre local (Node) / algunas rutinas viven en Vercel dentro de `sistema-ingresos/api/` |

## Lo que NO está en este repo

- **Leadr** (la plataforma, `leadr.cloud`) se separó a su propio repositorio el
  2026-06-27 → vive en la carpeta hermana `../Leadr`
  (`github.com/joseanselmi/leadr`). No traer código de Leadr acá.
- **`_material/`, `node_modules/`, `ads-agent/hotmart-chrome-profile/`** son
  archivos locales (material de trabajo, dependencias, un perfil de navegador con
  el login de Hotmart). Están en `.gitignore` a propósito: no son parte del
  código y no se versionan. El repo real son ~217 archivos.

## Cómo está documentado

Cada carpeta con contenido propio tiene su `README.md` explicando qué guarda y
cómo se usa. Empezá por el README del proyecto que te interese
([sistema-ingresos](sistema-ingresos/README.md) ·
[ads-agent](ads-agent/README.md)) y desde ahí bajás a cada subcarpeta.
