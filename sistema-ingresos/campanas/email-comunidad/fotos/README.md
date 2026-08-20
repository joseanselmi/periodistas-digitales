# Fotos de los testimonios

**Acá va la foto de cada persona que da su testimonio.** La carpeta existe porque el repo vive
dentro de OneDrive: Jose sube la imagen desde la tablet o el celular y aparece sola en la notebook,
sin tener que pasarla por ningún lado.

## Cómo subirla estando en remoto

**Por Google Drive** (la vía que se usa, probada el 20/08/2026):

1. Subir la imagen a **Google Drive** desde la tablet o el celular, a cualquier carpeta.
2. **Avisar en el chat** con el nombre del archivo.
3. Claude la busca, la baja con el MCP de Drive y la guarda acá con
   `node herramientas/guardar-imagen-drive.mjs`.

El binario **no pasa por el contexto**: el MCP devuelve base64 (una foto de 200 KB son ~260.000
caracteres, que no entran), el resultado queda en un archivo y el script lo decodifica desde el
disco. Además verifica que sea una imagen **por la firma del archivo**, no por la extensión — un
base64 cortado a la mitad se escribe sin dar error y produce algo que parece sano hasta que alguien
lo abre.

> ⚠️ **Por OneDrive ya no.** Sería lo natural, porque el repo vive adentro de OneDrive y una foto
> subida desde la app aparecería sola en la notebook. Pero **la cuenta está llena** (20/08/2026).
> Si algún día se libera espacio, vuelve a ser el camino más corto.

## Cómo se nombra

`<eje>-<quien>.<ext>` — el eje es el de [pedir-testimonios.md](../pedir-testimonios.md):

```
b-51anios.jpg        el testimonio del eje B (el de "cambiar el chip a los 51")
a-carlos.jpg         el eje A
```

Si el nombre no dice de quién es, dentro de dos meses no se sabe qué foto acompaña a qué texto.

## Antes de publicar una foto

- **Que la persona haya dado permiso** para que se use su cara, no sólo su texto. Son dos permisos
  distintos y se piden por separado.
- Si no hay foto o no dio permiso, el testimonio sale **sin foto**: no se rellena con una imagen
  genérica ni con un retrato generado. Una cara inventada al lado de un testimonio real convierte
  lo verdadero en sospechoso.
