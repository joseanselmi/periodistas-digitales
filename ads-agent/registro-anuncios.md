# 📒 Registro de Anuncios — Sistema de Ingresos Diarios (curso)

Log vivo de cada anuncio: **qué probamos, por qué, cómo salió y qué decidimos.**
Lo lee y escribe Mateo (skill `/mateo`, modo "crear anuncio"). Cada vez que se crea
un anuncio se agrega un renglón; cuando corre, se cargan resultados y la decisión.

- Detalle técnico de tracking: `sistema-ingresos/docs/TRACKING.md`
- Estrategia, benchmarks y árbol de decisiones: `ads-agent/docs/SISTEMA-ADS.md`
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

**✅ Chequeo día 4 — 2026-07-03 (Mateo, análisis profundo con desgloses):** lifetime $32.72 · **3 compras · CPA $10.91** · CTR 7.91% · link-CTR 3.91% · CPC-link $0.18 · freq 1.55 (sin fatiga). +$4.40 desde el día 3 sin nueva compra → CPA subió de $9.44 a $10.91 (sigue < $12). **Decisión: MANTENER.** Hallazgos que definen el próximo anuncio:
- **Embudo:** 185 link clicks → 141 LPV → **21 initiate_checkout → 3 compras**. La fuga real está en el checkout (86% abandono) y en LPV→checkout (15%), NO en el anuncio. El creativo trae clicks baratos y de sobra.
- **Edad:** 45-64 se comió **$20.27 (62% del gasto) con 0 compras**. Los 3 compradores cayeron en 25-34, 35-44 y 65+. El creativo atrae clickers mayores que no compran → ⚠️ **contradice el test "40-65" que figuraba como próximo #1** (ese $6.33 fue otro creativo/época).
- **Género:** male 83% del gasto, CPA $13.56 · female CPA $5.24 (2.6× más eficiente, recibe 1/5 del budget).
- **Placement:** Facebook feed carga todo ($19.04, 2 compras, CTR 11.55%). Instagram feed gastó $6.77 con 0 compras. Reels/stories flojos (creativo estático, no vertical).
- **País:** compras CO/DO/CR. A vigilar: MX $6.47 y AR $3.50 gastados sin compra (CTR alto pero no convierten). Geo NO sangra fuera de LatAm.
- **Caveat:** solo 3 compras → cortes DIRECCIONALES, no leyes. Sirven para elegir la próxima palanca, no para cerrar conclusiones.

**⚽ (2026-07-03) Nuevo ángulo pedido por Jose — `ad3-mundial` (newsjacking del Mundial):** aprovechar la ventana del **Mundial 2026 (en curso, USA/MX/CA)** como gancho *topical* del MISMO mecanismo probado (FOMO + IA + periodismo → ingresos propios). NO es un exploratorio nuevo: es el ganador con un hook time-limited. El copy usa el Mundial como prueba de que "la atención vale oro" y aterriza en la promesa real del curso (método de ingresos para periodistas), **no** promete armar un medio que rankee en Google Noticias. En preparación — ver fila `ad3-mundial` en el registro. **Budget-fit decidido:** $10/día en conjunto propio, en paralelo a ad1 (~$20/día total mientras dure el Mundial). Pendiente: creativo (Higgsfield, **sin marcas FIFA**) + OK de Jose al copy.

**🔴 (2026-07-05) CERRADO — Jose apagó ad3-mundial antes de tiempo.** No esperó al fin del Mundial: en 3 días ($6.34) el gancho topical rindió PEOR que ad1 (link-CTR 2.51% vs 3.91%, clics ~75% más caros) y no dejó ninguna compra (18 LPV → 2 init → 0 venta). La hipótesis "el Mundial sube CTR/baja CPA" quedó refutada. Decisión: volver a **un anuncio por vez** (ad1, el ganador) y poner la energía en el checkout (#40), que es la fuga real — no en meter más tráfico frío en paralelo. Muestra chica ($6.34 < $20) → lectura direccional, aceptable por ser el ad secundario.

**🔎 (2026-07-08→09) Diagnóstico "cayeron los pagos iniciados" — NO se rompió nada: ruido de muestra chica + normalización post-lanzamiento.** Jose objetó (con razón) que era "imposible en tan poco tiempo", y aclaró que **solo le cambió el NOMBRE** al anuncio. Conclusión final tras descartar hipótesis:
- **No es la edición.** Renombrar en Meta es cosmético (no resetea aprendizaje). Confirmado por API: mismo ad ID corriendo sin cortes desde el 29/06 → no hubo reset. (Descarté antes "fatiga" — freq 1.36, sin saturación.)
- **No es la página / ni lag.** Pixel OK (compras el 07/07 y el día en curso); 69-97% de los que clickean llegan a la landing incluso los días malos; los números no se rellenaron al re-consultar.
- **Qué pasó de verdad:** (a) **normalización** — el ad arrancó con CTR inflado de 10% (pico de novedad el 30/06) y se asentó en ~2.5-3%, su nivel real; (b) **ruido** — los pagos iniciados promedian **~4/día** (a $10/día); a esa escala un día de 8 y uno de 1 son swings aleatorios, no un escalón. Serie: `30/06:9 · …05/07:8 · 06/07:2 · 07/07:1 · día en curso:4` = jumpy alrededor de ~4. Ya rebota (4 init + compra).
- **➡️ Acción: NADA.** No está roto. Mirar el **promedio móvil de 3 días**, no el día suelto. Refrescar con ad2-fomo2 ([#39](https://trello.com/c/DfdLqvnD)) solo si el promedio de 3 días sigue cayendo varios días más.
- **🧠 Regla aprendida:** a este volumen no leer días sueltos (ruido de Poisson) — reaccionar solo a tendencias de 3+ días. Renombrar un anuncio es seguro; lo que sí resetea es editar creativo/targeting/optimización/presupuesto.

## ⏭️ Próximos tests en cola (cuando haya datos/presupuesto)

1. **Segmento 40-65** (mejor CPA histórico $6.33, nunca escalado) — prioridad máxima.
2. Prueba social + value stack completo (lookalike compradores).
3. Exploratorios: testimonio narrativo · antes/después visual · mecanismo en pasos.

> Ángulos ya pensados con hipótesis: `campanas/historico/2026-06-21/config.json` (10 ads).

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
| `ad1-fomo` | ad1-fomo · FOMO+IA (en Meta figura como "Nuevo anuncio de Ventas" — renombrar) | FOMO+IA / N1 | 30-55 · Worldwide+español+exclusiones | Control: ángulo validado sostiene CPA<$12 a $10/día | ads1-fomo.png ✅ (sin $) | $10 | 🟢 Activo | 2026-06-30 | **$10.91** | **7.91%** | **3** | ✅ MANTENER (día 4, 03/07). CPA $10.91 < objetivo. Fuga real = checkout (21 init→3 compra). 45-64 comió 62% del gasto con 0 ventas → el creativo empuja a no-compradores. |
| `ad2-fomo2` | ad2-fomo2 · FOMO+IA creativo B | FOMO+IA / N1 | **= ad1** (30-55 intereses) | **1 variable = SOLO el sujeto de la foto**: periodista más joven (~37) reorienta entrega a 25-44 y baja CPA sin tocar targeting/texto | ✅ ads2-fomo2.png (1080×1080, listo) | $10 | 🟢 Creativo listo — falta publicar | — | — | — | — | Trello [#39](https://trello.com/c/DfdLqvnD). Decisión: conjunto propio $10/día vs. mismo de ad1. Ficha: `ads-curso/ad2-fomo2/`. |
| `ad3-mundial` | ad3-mundial · Mundial (newsjacking) | FOMO+IA *topical* / N1 | = ad1 base LatAm · **conjunto PROPIO** (paralelo a ad1) | **1 variable vs ad1 = el gancho**: hook topical del Mundial 2026 (ventana de máx. relevancia) sube CTR / baja CPA vs el FOMO evergreen | ✅ corregido y verificado LIVE (`ads3-mundial-publicado.png`) | **$10** (conjunto propio, ~$20/día total con ad1) | 🔴 **PAUSADO 05/07** (adset PAUSED, verificado API) | 2026-07-02 | — (0 compras) | **4.02%** (link 2.51%) | **0** | ❌ **HIPÓTESIS REFUTADA — apagado por Jose 05/07.** El gancho del Mundial NO le ganó al evergreen: link-CTR 2.51% vs 3.91% de ad1, y CPC-link $0.317 vs $0.18 (clics ~75% más caros). $6.34 gastados → 18 LPV → 2 initiate_checkout → **0 compras**. Como era un 2º adset ($10/día extra, ~$20 total) bajo presupuesto acotado y perdía en su propia métrica clave, se concentra en ad1 (ganador probado) + arreglar el checkout (#40, fuga real). Caveat: $6.34 < umbral $20/4 días → corte DIRECCIONAL (muestra chica), no ley — pero razonable por ser el anuncio secundario. |

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
