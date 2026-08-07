# contenido — lo que se publica

**Padre:** [`ads-agent/`](../README.md)

Las piezas que salen al mundo por canal orgánico. No es la campaña paga —eso
está en [`../campanas/`](../campanas/README.md)— sino lo que se publica sin
pagar por alcance.

| Carpeta | Qué hay |
|---|---|
| [`carousels/`](carousels/README.md) | Los carruseles de Facebook, por semana. `publicados/` guarda los que ya salieron |
| [`organic/`](organic/README.md) | El calendario diario: qué se publica cada día, con su copy |
| [`emails/`](emails/README.md) | Las secuencias de email y los logs de envío |

## Por qué están juntas

Las tres son el mismo trabajo visto por canal: se decide **qué decir**, se genera
la pieza y se programa. Antes colgaban sueltas de la raíz de `ads-agent/`, que
llegó a tener 12 carpetas al mismo nivel sin distinguir una herramienta de un
carrusel publicado.

## Quién escribe acá

```bash
cd ads-agent
node scripts/generar/carousel-generator.mjs   # arma un carrusel
node scripts/agentes/organic-agent.mjs        # arma el calendario
node scripts/programar/schedule-muro.mjs      # lo programa en Facebook
```

⚠️ Los de [`scripts/publicar/`](../scripts/publicar/README.md) **salen al mundo**:
publican de verdad en la fanpage. Los de `programar/` dejan el post agendado.

> Tope de Meta: **29 publicaciones programadas** a la vez, exactas.
