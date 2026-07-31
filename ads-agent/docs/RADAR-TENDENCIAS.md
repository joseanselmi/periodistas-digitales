# Radar de Tendencias TikTok

Detecta qué está explotando en TikTok **ahora mismo** y devuelve el tema con el
ángulo periodístico y los títulos ya escritos. Pensado como bono del curso: el
alumno lo abre a la mañana y tiene temas listos para trabajar.

Tarjeta: [#102](https://trello.com/c/UbfSnBSU) · Motor: `scripts/agentes/radar-tendencias.mjs`

---

## Cómo se usa

```bash
cd ads-agent

node scripts/agentes/radar-tendencias.mjs --verificar             # ¿los handles existen? correr al tocar fuentes
node scripts/agentes/radar-tendencias.mjs --tema argentina        # la corrida normal
node scripts/agentes/radar-tendencias.mjs --tema madrid --ventana 24 --umbral 2.5
node scripts/agentes/radar-tendencias.mjs --tema argentina --sin-ia   # solo el ranking, sin Claude
```

| Opción | Qué hace | Default |
|---|---|---|
| `--tema` | cuál lista de `radar/fuentes.json` mirar | *(obligatorio)* |
| `--ventana` | horas hacia atrás que se consideran | 48 |
| `--umbral` | cuánto tiene que superar lo normal de su cuenta | 3 |
| `--max` | leer solo las primeras N cuentas (para probar) | todas |

Cada corrida deja `radar/<tema>-<fecha>.md` y pisa `radar/ultimo-<tema>.md`.

---

## Las dos decisiones que explican todo

### 1. Va por cuentas, no por búsqueda de palabras

Probado el 29/07/2026:

| Vía | Resultado |
|---|---|
| Búsqueda por keyword | ❌ captcha |
| Hashtag | ❌ pide registro de app |
| **Perfil público** | ✅ **gratis, 3 s por cuenta, sin bloqueos** |

Eso ahorra los ~$25/mes de un scraper pago (Apify / TikHub), que es la única otra
forma de tener búsqueda por keyword.

Y editorialmente conviene igual: *"noticias última hora Madrid"* no sale de una
palabra, sale de un conjunto de fuentes. Seguís fuentes, no palabras — que es como
trabaja una redacción. Menos ruido, y la calidad de la lista la controlás vos.

> ⚠️ **No corre en Vercel.** `yt-dlp` es un binario, y TikTok le sirve una versión
> recortada a las IPs de datacenter. Va local o en una VM.

### 2. La métrica es velocidad relativa, no vistas

Un video con 800.000 vistas de hace 3 días es historia vieja. Uno con 40.000 de hace
6 horas está explotando **ahora**. Pero "vistas por hora" a secas no sirve, por dos
motivos:

- Un video junta casi todas sus vistas al principio. Comparar el ritmo de uno fresco
  contra el de uno viejo marcaría todo como viral.
- 12.000 vistas en una cuenta chica valen más que 300.000 en RTVE.

Entonces el radar hace dos cosas: **proyecta** dónde va a terminar el video según su
edad, y lo compara contra **la mediana de esa misma cuenta**. El resultado es un
factor: `3.5x` = triplica lo habitual de esa cuenta. Así detecta lo que explota sin
importar el tamaño de quien lo publicó.

---

## Cómo armar la lista de fuentes

En `radar/fuentes.json`. Mezclá tres tipos de cuenta:

1. **Medios** — confirman que algo ya es noticia. Llegan tarde, pero validan.
2. **Periodistas** — cuentas personales; publican antes que su medio.
3. **Virales / calle** — sucesos, vecinos, humor local. **Acá explota primero.**

El valor del radar sale sobre todo del grupo 3: es lo que un periodista no mira.

> Verificá cada handle antes de agregarlo. Uno mal escrito **no da error**: devuelve
> 0 videos y el radar queda ciego sin avisarte. Por eso existe `--verificar`.

---

## Estado

**Funcionando y verificado en vivo** (29/07/2026) — 5 cuentas argentinas, detectó
`3.5x` en @todonoticias con 198.300 vistas en 5,3 h.

Falta:

- [ ] `ANTHROPIC_API_KEY` en `ads-agent/.env` — sin eso el radar detecta pero no
      redacta los temas (avisa y muestra los videos en crudo).
- [ ] Cuentas del grupo 3 en ambos temas.
- [ ] Programar las corridas automáticas.
- [ ] Publicar el resultado donde lo vea el alumno.
