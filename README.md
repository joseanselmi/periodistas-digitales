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

## Los comandos

En [`herramientas/`](herramientas/README.md), porque operan sobre el repo entero
y no sobre un proyecto:

```bash
node herramientas/estado.mjs           # qué está pasando en el negocio (reescribe ESTADO.md)
node herramientas/verificar-repo.mjs   # que nada quedó apuntando a un lugar que ya no existe
```

## Lo que NO está en este repo

- **Leadr** (la plataforma, `leadr.cloud`) se separó a su propio repositorio el
  2026-06-27 → vive en la carpeta hermana `../Leadr`
  (`github.com/joseanselmi/leadr`). No traer código de Leadr acá.
- **`_material/`, `node_modules/`, `ads-agent/hotmart-chrome-profile/`** son
  archivos locales (material de trabajo, dependencias, un perfil de navegador con
  el login de Hotmart). Están en `.gitignore` a propósito: no son parte del
  código y no se versionan. El repo real son ~217 archivos.

## Cómo está documentado

**La regla: nada suelto.** Cada carpeta con contenido propio tiene su
`README.md`, que dice qué guarda, **de qué carpeta cuelga** y cómo se usa. En la
raíz quedan solo los archivos que tienen que estar ahí (este README, `CLAUDE.md`,
`ESTADO.md`, `.gitignore`, `.mcp.json.example`).

> El `.mcp.json` de verdad **no se versiona**: tiene el token de Trello, y este
> repositorio es público. Lo que se sube es el `.example`, con la forma del
> archivo y sin las claves.

## ⚠️ Tres carpetas dicen "agent" y son cosas distintas

Es la confusión más fácil de este repo. `ads-agent` es **un lugar**; las otras
dos son **gente**:

| Carpeta | Qué es | Cómo se usa |
|---|---|---|
| [`ads-agent/`](ads-agent/README.md) | **Todo el marketing.** Campañas, contenido, emails, scripts. El nombre quedó chico: nació solo para anuncios | Es una carpeta, no se "invoca" |
| [`ads-agent/cerebro/`](ads-agent/cerebro/README.md) | **El equipo: 9 agentes con nombre.** Ricardo, Dante, Sofía… Cada uno tiene su rol y su criterio | Se les habla: `/dante`, `/ricardo` |
| `.claude/agents/` | **Ayudantes de un solo trabajo.** No son del equipo y no se les habla: los llama un flujo por dentro | Ej.: el revisor que aprueba una clase antes de producirla |

Regla para acordarse: si tiene **nombre de persona**, es del equipo y vive en
`cerebro/`. Si describe **una tarea**, es un ayudante.

### Por qué `.claude/` no se puede mudar

Las tres carpetas de adentro son **direcciones fijas**: Claude Code lee los
comandos de `.claude/commands/`, los ayudantes de `.claude/agents/` y las
capacidades de `.claude/skills/`, y de ningún otro lado. Moverlas no las
reordena: las hace desaparecer.

> Había una cuarta, `.agents/skills/`, con dos capacidades más (armar un PDF de
> marca y revisarlo antes de entregarlo). Se juntaron con las otras el
> 2026-08-01. No era solo prolijidad: **ahí no se cargaban**. Existían como
> documentación que solo funcionaba porque un script las nombraba por ruta.

Empezá por el README del proyecto que te interese
([sistema-ingresos](sistema-ingresos/README.md) ·
[ads-agent](ads-agent/README.md)) y desde ahí bajás a cada subcarpeta.

Se exceptúan a propósito las carpetas de **assets fechados** (`carousels/semana-*`,
`creatives/2026-*`, `campanas/historico/*/images`), cuyo README padre ya las explica, y los
repos de terceros clonados dentro de `_material/`, que no se documentan por dentro.
