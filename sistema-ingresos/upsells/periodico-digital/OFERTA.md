# Oferta del upsell — "Tu Periódico Digital + Redacción IA"

> OTO (one-time offer) de 1 clic en la página post-compra del curso **Sistema de
> Ingresos Diarios** ($27). Se muestra ANTES de `/gracias`, apenas se aprueba el
> pago: **compra → ESPERA (esta oferta) → aceptar/rechazar → /gracias**.
> Tarjeta Trello [#62](https://trello.com/c/XvzdCj3l). Label: Luna (CRO/Landing).

## 1. Qué se vende (y por qué NO pisa a Leadr ni al curso)

El comprador **acaba de aprender a generar ingresos** con el curso. Este upsell
ataca un **dolor distinto y nuevo**: *tener su propio medio* — un periódico
digital moderno, en vivo, con su marca — y llenarlo de notas escritas por IA con
su estilo, **sin escribir él y sin saber programar**.

- No es "más de lo mismo" del curso (ingresos) → es identidad / status / activo propio.
- No pisa a Leadr (herramienta de trabajo del periodista) → esto es *su* publicación.

**El valor real que se cobra NO es el prompt** (los prompts se copian gratis). Lo
que se paga es **que no se trabe**: la planilla ya publicada, los 3 videos de los
pasos difíciles, la plantilla de respaldo y la FAQ anti-error. Eso es lo que
evita el reembolso.

## 2. Arquitectura de la entrega (decidida)

- **Nivel 1 = Google Sheets** (sin cuentas nuevas, no asusta). El alumno publica
  la planilla como CSV y el sitio la lee.
- **Nivel 2 = Supabase** (cuando el diario crezca, mismo sitio, se migra solo la
  fuente de datos).
- **Herramientas del alumno, todas gratis:** Google Sheets + Claude/ChatGPT +
  Lovable (le da la web en vivo sin código).
- **2 mega-prompts:** (1) constructor del sitio que lee la planilla CSV; (2)
  redacción IA que escribe muchas notas con su estilo, formato TSV para pegar de
  una en la planilla.

## 3. Precio final

- Core del curso: **$27**. Regla OTO sana = 1x–3x del core → rango **$27–$81**.
- **Precio final: $37.** (Ancla de valor ~$297; se revela $37.)
- Justificación del ancla: si tuviera que armarte esto una agencia — el sitio, la
  automatización de redacción, la plantilla y el soporte — no baja de $297. Vos
  ya invertiste en vos hoy, así que te lo dejo **al costo, una sola vez, en esta
  página.**

## 4. Value stack (lo que se muestra en la página VSL)

> Reestructurado según el método de Luis Mena (lección 103–104): **producto
> principal + bonos en el anclaje + 1 SÚPER BONO reservado para el CTA** (el de
> mayor valor percibido, sube conversión 30–35%).

| # | Componente | Valor anclado |
|---|------------|--------------:|
| 1 | **Producto:** Sistema "Tu periódico en una tarde" (planilla + prompt constructor + sitio en vivo con Lovable) | $297 |
| 2 | **Bono 1:** 3 videos de los pasos que traban (publicar CSV · conectar · pegar notas) | $47 |
| 3 | **Bono 2:** Plantilla de sitio de respaldo + mini-FAQ de los 5 errores comunes | $29 |
| 4 | **Bono 3:** Camino de crecimiento Nivel 2 (migrar a Supabase cuando el diario crezca) | incluido |
| 5 | ⭐ **SÚPER BONO** (se revela en el CTA): Prompt de **Redacción IA ilimitada** — notas con tu estilo, para siempre | $147 |
|   | **Valor total** | **$520** |
|   | **Hoy, solo en esta página** | **$37** |

**Ancla de precio (método L. Mena, ×10):** el producto solo ya vale $297; con
los bonos el valor real es $520. Se revela **$37**, un solo pago.

## 5. Garantía (reduce el riesgo)

**"Montás tu periódico o te devuelvo el upsell."** Si seguís los pasos y no
lográs tu diario en vivo, escribís a
`hola@sistemadeingresosdiariosia.com` y te devuelvo los $37 del upsell, sin
preguntas. (No afecta la compra del curso.)

## 6. Formato de la página: VSL (video) — decidido 11/07

La página `espera.html` es una **VSL** (video sales letter), no una carta en
texto. Decisión de Jose tras revisar el método de Luis Mena: para upsells él
recomienda una **Mini VSL de 3–7 min** ("7 minutos de encantamiento", lección
74) abierta en clave "proceso incompleto" (*"Paso 2 de 2 — tu pedido no está
completo"*). Formato del video: **voz en off + grabación de pantalla** (sin cara).

- **Guión completo de la Mini VSL:** `GUION-MINI-VSL.md` (estructura John Benson
  adaptada, fase por fase, con marcas de tiempo y directivas de pantalla).
- **Página VSL:** hero (Paso 2 de 2 + promesa + subtítulo) + **video** + oferta
  debajo (value stack apilado + anclaje $520→$37 + garantía + vista previa de
  checkout + CTAs). El video se pega en `VIDEO_EMBED` (bloque CONFIG); vacío =
  placeholder, sin romper.
- **Respaldo para A/B:** la versión en TEXTO (TSL) quedó en
  `espera-texto-respaldo.html`. Luis Mena recomienda **probar Mini VSL vs texto**.

## 7. Integración técnica (Hotmart 1-clic)

- Se crea un **2º producto en Hotmart** ("Tu Periódico Digital + Redacción IA",
  $37) y se configura el **Funil/Upsell** para que, tras la compra del curso,
  redirija a esta página.
- Hotmart genera dos URLs que se pegan en `espera.html` (bloque `CONFIG` arriba
  del `<script>`): la de **aceptar** (cobra con 1 clic la misma tarjeta) y la de
  **rechazar** (sigue a `/gracias` sin cobrar).
- Mientras esas URLs no estén, los botones muestran un estado "config pendiente"
  en vez de un link roto (mismo patrón que `TELEGRAM_INVITE` en `gracias.html`).

## Estado (checklist Trello #62)

- [x] Concepto, arquitectura, prototipos y 2 prompts
- [x] **Precio final $37 + value stack** ← este doc
- [x] **Página "ESPERA" escrita** ← `espera.html`
- [ ] Planilla plantilla CSV publicada
- [ ] 3 videos de los pasos que traban *(los graba Jose)*
- [ ] Plantilla de respaldo + FAQ
- [ ] Configurar upsell 1-clic en Hotmart *(lo hace Jose: crear 2º producto + pegar URLs)*
- [ ] Empaquetar entrega + probar E2E
