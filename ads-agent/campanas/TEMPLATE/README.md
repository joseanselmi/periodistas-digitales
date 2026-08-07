# TEMPLATE — el molde de una campaña nueva

**Padre:** [`campanas/`](../README.md)

Esto no es una campaña: es la plantilla que se copia para armar una. Está vacía a
propósito.

## Cómo se usa

1. Copiar `brief.md` a la carpeta de la campaña nueva —
   `campanas/<segmento>/brief.md`, con el nombre según la convención del
   [README padre](../README.md) (`<canal>-<objetivo>-<segmento>`).
2. Completar todos los campos. **Sin brief completo no hay campaña**: el brief es
   donde queda escrito qué se está probando y con qué se compara después.
3. El `config.json` que leen los scripts de publicación se arma aparte, tomando
   como base el de la campaña anterior en [`historico/`](../historico/README.md).

## Por qué está acá y no en `historico/`

Hasta el 2026-08-07 vivía en `campanas/historico/TEMPLATE/`, adentro de la
carpeta de campañas terminadas. La plantilla vigente no es archivo: se movió un
nivel arriba, al lado de las campañas vivas.

> Había un segundo molde casi idéntico en `docs/playbooks/brief-template.md`:
> mismas secciones, en el mismo orden, con dos de más. Se eliminó el 2026-08-07 y
> esas dos secciones —plan de seguimiento y notas— se sumaron acá. **Este es el
> único molde.** Dos moldes para lo mismo es cómo empiezan a divergir: se corrige
> uno, se olvida el otro, y el que se copia termina siendo el viejo.
