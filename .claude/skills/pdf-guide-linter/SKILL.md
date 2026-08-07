---
version: 0.1.0
name: pdf-guide-linter
description: |
  Verificación MECÁNICA (no a ojo) de que una guía PDF cumple todos los
  criterios de entrega antes de mostrarla o publicarla: estructura de
  página (.page-inner), centrado vertical real (alto físico idéntico en
  todas las páginas), logo de marca presente y existente, fuentes
  cargadas, reglas de paginación, y conjugaciones "vos" filtradas.
  Corre el script ads-agent/scripts/exportar/lint-pdf-guide.mjs, que exporta el PDF y
  compara las dimensiones reales de cada captura — no infiere a ojo si
  una página "se ve corta".
  Use when: SIEMPRE como último paso de la skill pdf-creator, antes de
  decir que una guía está lista — invocar automáticamente, sin que el
  usuario tenga que pedirlo. También: "lint del pdf", "verificar la
  guía", "revisar antes de entregar", "chequear la guía antes de mandarla".
  NOT for: crear o exportar la guía (eso es pdf-creator) — este solo
  verifica un HTML/PDF ya generado.
allowed-tools: Read, Bash, Glob
---

# PDF Guide Linter

Gate de calidad obligatorio antes de declarar lista cualquier guía generada con la skill `pdf-creator`. Existe porque depender del criterio humano/de Claude para juzgar "¿esta página se ve corta?" falló dos veces en la misma guía (2026-06-26): primero no se aplicó el centrado a ninguna página, después solo a 2 de 9 porque "parecían" las únicas cortas. La única forma confiable es medir, no opinar.

## Cómo usarlo

```
node ads-agent/scripts/exportar/lint-pdf-guide.mjs <ruta.html>
```

Exit code `0` = pasó todo. Exit code `1` = hay problemas — **no mostrar la guía al usuario ni publicarla todavía**, corregir y volver a correr el lint hasta que pase.

El script:
1. Exporta el PDF (corre `export-pdf.mjs` automáticamente).
2. Lee el alto en píxeles de **todas** las capturas QA generadas y verifica que sea idéntico en todas — esta es la prueba objetiva de que el centrado vertical (`min-height:100vh` en `.page`) funciona en cada página, no solo en las que "parecen" cortas.
3. Verifica estructura (`.page-inner` presente en cada `.page`), logo real en la portada (existe el archivo referenciado, no es el placeholder `{ }`), fuentes de marca, reglas de paginación, y conjugaciones "vos" conocidas (lista exacta + patrón genérico como advertencia).

## Regla de uso obligatoria

Esto NO es una skill que el usuario tenga que pedir. Es un paso fijo dentro del flujo de `pdf-creator`: después de exportar y antes de mostrar capturas o publicar, correr este lint. Si falla, se corrige y se reintenta — no se le muestra al usuario una guía que no pasó el lint, ni se le pregunta si quiere que se lo salte.

## Limitaciones (no reemplazan el ojo humano)

- Las advertencias de "vos" por patrón genérico tienen falsos positivos (palabras como "país", "francés", "interés" terminan igual que un verbo en vos) — están en una lista blanca, pero una palabra nueva no detectada todavía puede pasar como advertencia y requiere repasar el texto.
- No valida que el *contenido* tenga sentido, ni reglas de negocio específicas de una campaña (ej. "no mencionar el precio antes de la oferta") — eso sigue siendo criterio editorial de quien escribe la guía, ver memoria del proyecto correspondiente.
- Si `export-pdf.mjs` falla (Puppeteer, fuentes, etc.), el lint lo reporta como error y no puede continuar — hay que resolver ese fallo primero.
