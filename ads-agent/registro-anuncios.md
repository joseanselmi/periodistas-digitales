# 📒 Registro de Anuncios — Sistema de Ingresos Diarios (curso)

Log vivo de cada anuncio: **qué probamos, por qué, cómo salió y qué decidimos.**
Lo lee y escribe Mateo (skill `/mateo`, modo "crear anuncio"). Cada vez que se crea
un anuncio se agrega un renglón; cuando corre, se cargan resultados y la decisión.

- Detalle técnico de tracking: `sistema-ingresos/TRACKING.md`
- Estrategia, benchmarks y árbol de decisiones: `ads-agent/cerebro/mateo.md` + `ads-agent/SISTEMA-ADS.md`
- Playbook de configuración (replicable a otros productos): Trello #23

---

## 🧭 Norte — a qué tiene que servir CADA anuncio

- **Producto:** curso "Sistema de Ingresos Diarios para Periodistas" — **$27** (Hotmart `P106404871J`).
- **Audiencia:** periodistas LatAm 30-55. Países top: Ecuador, Puerto Rico, Colombia, México, Chile. Excluir: IN, LY, MZ, PK, SG, VE, AU, BR, TW, BD, NI.
- **Objetivo:** compras rentables. **CPA objetivo < $12** (histórico ~$10.19; mejor registrado $6.33 en seg 40-65). Pausar > $18.
- **Presupuesto actual:** ACOTADO → **$10/día, un anuncio por vez.** Escalar solo con datos (CPA < $8 por 3 días → +30%).
- **Marca:** fondo #07070f + indigo/cyan, **sin dinero en imagen**, **sin "ingresos garantizados"**, texto en imagen < 20%, tratamiento "tú".
- **Optimización:** evento **Compra** (idealmente la conversión personalizada por `content_ids` del curso, no clicks/tráfico).

## 🎯 Qué estamos probando AHORA

**(2026-06-29)** Presupuesto acotado, recién validamos el tracking. Primer anuncio =
el **ganador histórico probado** (FOMO + IA + periodismo, CPA $10.63 a escala) — no
exploramos ángulos nuevos hasta tener una base de compras.
**Hipótesis activa:** el ángulo validado sostiene CPA < $12 corriendo a $10/día.

**🟢 Lanzado 2026-06-30** — anuncio `ad1-fomo` a $10/día (creativo FOMO+IA, copy sin precio, geo Worldwide + español + exclusiones). Ver palancas y reglas abajo.

**✅ Primer chequeo 2026-07-02 (día 3, Mateo):** $28.32 gastados · **3 compras · CPA $9.44** · CTR 9.71% · freq 1.62. Bajo el objetivo ($12) y cerca del histórico ($10.19). Geo NO sangra: el español lo mantiene en LatAm (fuera de target solo centavos); las 3 ventas fueron de CO, DO y CR. **Decisión: MANTENER**, próximo chequeo día 4-5. Escalar +30% recién si CPA < $8 sostenido 3 días.

## ⏭️ Próximos tests en cola (cuando haya datos/presupuesto)

1. **Segmento 40-65** (mejor CPA histórico $6.33, nunca escalado) — prioridad máxima.
2. Prueba social + value stack completo (lookalike compradores).
3. Exploratorios: testimonio narrativo · antes/después visual · mecanismo en pasos.

> Ángulos ya pensados con hipótesis: `campaigns/2026-06-21/config.json` (10 ads).

## 🚗 La "matrícula" del anuncio — identificar todo de un vistazo

Cada anuncio tiene UNA matrícula corta que aparece **igual en todos lados**, así Jose
(que no vive en Meta) nunca se pierde: `adN-angulo`, minúsculas, sin espacios ni acentos.
Ej: `ad1-fomo`, `ad2-seg40-65`. Única, para siempre.

La MISMA matrícula aparece en los 4 lugares:
- Nombre del conjunto y del anuncio en **Meta**
- La **URL** del anuncio: `https://sistemadeingresosdiariosia.com/?src=ad1-fomo`
- La venta en **Hotmart** → campo **"Origen"** = `ad1-fomo`
- La fila de **este registro** (el decodificador: dice ángulo, segmento, hipótesis, resultados)

→ Ves una venta con Origen `ad1-fomo` y sabés al instante qué anuncio fue.

### Nombres en Meta (castellano, legibles — NADA de "SID v4" críptico)
- 📁 **Campaña:** `CURSO Periodistas — VENTAS — [mes año]` (el contenedor; casi no cambia)
- 📂 **Conjunto:** `<matrícula> · <audiencia>` — ej. `ad1-fomo · 30-55 intereses`
- 📄 **Anuncio:** `<matrícula> · <ángulo>` — ej. `ad1-fomo · FOMO+IA`

---

## 📋 Registro de anuncios

| src | Anuncio (nombre en Meta) | Ángulo / nivel | Segmento | Hipótesis | Creativo | $/día | Estado | Lanzado | CPA | CTR | Compras | Decisión |
|-----|--------------------------|----------------|----------|-----------|----------|-------|--------|---------|-----|-----|---------|----------|
| `ad1-fomo` | ad1-fomo · FOMO+IA (en Meta figura como "Nuevo anuncio de Ventas" — renombrar) | FOMO+IA / N1 | 30-55 · Worldwide+español+exclusiones | Control: ángulo validado sostiene CPA<$12 a $10/día | ads1-fomo.png ✅ (sin $) | $10 | 🟢 Activo | 2026-06-30 | **$9.44** | **9.71%** | **3** | ✅ MANTENER (chequeo día 3, 02/07). CPA bajo objetivo. Geo NO sangra (español lo mantiene en LatAm; ventas de CO/DO/CR). Escalar solo si CPA<$8 x3 días. |

## 🎚️ Palancas a ajustar según las métricas

Los settings son palancas — se mueven con DATOS, no a ciegas (decisión de Jose, 2026-06-30).

| Palanca | Hoy (ad1-fomo) | Cuándo / cómo mover |
|---|---|---|
| 🌎 Geo | Worldwide + español + exclusiones | **#1 a vigilar:** a los 3-4 días mirar el desglose por país; si geos baratos gastan sin comprar → pasar a inclusión LatAm (Ecuador, PR, Colombia, México, Chile, Perú, Rep. Dominicana, Uruguay) |
| 💰 Presupuesto | $10/día | CPA < $8 por 3 días → +30% (nunca más de +30% por vez) |
| ✍️ Copy | Sin precio | Si el CTR es bueno pero no compran → testear variante CON precio |
| 🎨 Creativo | ads1-fomo (FOMO+IA) | CTR < 1.5% → fatiga → nuevo creativo |
| 🎯 Edad/intereses | 30-55 + periodismo/IA | Ampliar si la entrega es baja (Advantage+ igual amplía) |

### Reglas de decisión — NO tocar antes de tiempo
- ⛔ NO pausar antes de **$20 gastados / 4 días** — dejá que junte datos primero.
- CPA objetivo **< $12** · alerta **> $18** · CTR mínimo **1.5%**.
- 4 días + $20 + 0 compras → pausar y revisar.
- **Primer chequeo serio: día 3-4** → correr `/mateo` (modo monitoreo).
