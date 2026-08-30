# Extraer los comentarios de un video de TikTok — gratis, desde el navegador

Los comentarios de un video son la mejor fuente de **lenguaje textual** que existe: ahí la
audiencia describe su dolor con sus propias palabras, que es justo lo que le falta a un gancho
cuando lo escribimos nosotros. Este documento explica cómo bajarlos sin pagar ni instalar nada.

## Por qué NO se usa ninguna de las otras vías

Verificado el 2026-08-18, no supuesto:

| Vía | Veredicto |
|---|---|
| **`yt-dlp`** (el del Radar de Tendencias) | ❌ Su extractor de TikTok solo mapea `comment_count` — te dice **cuántos** comentarios hay, nunca el texto. No implementa `_get_comments`. |
| **Endpoint interno** `tiktok.com/api/comment/list/` | ❌ Exige `msToken` + firma. Un script propio se rompe cada vez que TikTok cambia la firma. |
| **Apify** ("TikTok Comments Scraper") | ❌ Descartado el 18/08 por decisión de Jose: no quiere abrir cuentas ni exponerse a un cobro. |
| **Consola del navegador** ⬅️ | ✅ **Esta.** Gratis, sin cuenta, sin instalar. Usa tu sesión ya logueada, así que TikTok no lo ve como un bot. |

## Los pasos

1. Abrí el video **en Chrome, en la computadora** (no la app del celular). Tiene que ser la
   página del video, no el feed: la URL termina en `/video/1234567...`.
2. Abrí el panel de comentarios, para que se vean en pantalla.
3. Apretá **F12** → pestaña **Console**.
4. ⚠️ Chrome bloquea pegar código en la consola la primera vez. Si aparece una advertencia
   en rojo, escribí a mano `allow pasting` y dale Enter. Se pide una sola vez por navegador.
5. Pegá el bloque de abajo y Enter.
6. El script **baja solo** hasta que TikTok deja de cargar comentarios nuevos (puede tardar
   uno o dos minutos si son muchos — no toques nada mientras corre) y después descarga un
   archivo `comentarios-tiktok.txt`.
7. Guardá ese archivo en la carpeta **`_material/`** del repo y avisale a Claude.

> ⚠️ **El archivo no se commitea nunca.** Trae nombres de usuario de gente real y este
> repositorio es PÚBLICO. `_material/` ya está en el `.gitignore` justamente por eso. Al repo
> solo entran después las frases, sin identificar a nadie.

## El script

```js
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const SEL = '[data-e2e="comment-level-1"], [data-e2e="comment-level-2"]';
  const nodos = () => [...document.querySelectorAll(SEL)];

  if (!nodos().length) {
    console.log('%c❌ No veo comentarios en esta página.', 'color:#f43f5e;font-size:14px');
    console.log('Revisá dos cosas: que el panel de comentarios esté ABIERTO, y que estés en la');
    console.log('página del video (la URL termina en /video/123...), no en el feed.');
    return;
  }

  // 1 · Encontrar cuál es el panel que scrollea
  let el = nodos()[0], panel = null;
  while (el && el !== document.body) {
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 50) { panel = el; break; }
    el = el.parentElement;
  }
  panel = panel || document.scrollingElement;

  // 2 · Bajar hasta que deje de aparecer gente nueva
  let previo = 0, quietas = 0;
  while (quietas < 5) {
    panel.scrollTop = panel.scrollHeight;
    await sleep(1500);
    const n = nodos().length;
    if (n === previo) quietas++;
    else { quietas = 0; previo = n; console.log('cargados:', n); }
  }

  // 3 · Sacar usuario + texto de cada comentario
  const filas = nodos().map(n => {
    let box = n.parentElement, usuario = '';
    for (let i = 0; i < 5 && box; i++) {
      if (box.querySelectorAll(SEL).length > 1) break;   // subimos de más: este contenedor ya tiene varios comentarios
      const u = box.querySelector('[data-e2e="comment-username-1"]');
      if (u) { usuario = u.innerText.trim(); break; }
      box = box.parentElement;
    }
    return { usuario, texto: (n.innerText || '').trim() };
  }).filter(f => f.texto);

  // 4 · Descargar como .txt
  const txt = filas.map(f => `${f.usuario}\t${f.texto}`).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
  a.download = 'comentarios-tiktok.txt';
  a.click();

  console.log(`%c✅ ${filas.length} comentarios descargados.`, 'color:#22d3ee;font-size:14px');
})();
```

## Si algo falla

**Devuelve 0 o el archivo sale vacío.** El script se agarra de los atributos `data-e2e` que
TikTok le pone a cada comentario. Esos atributos son estables desde hace años, pero son de
TikTok y los puede cambiar cuando quiera. Si pasa, copiá lo que imprimió la consola y pasáselo
a Claude: se ajusta el selector y listo. **No es que la vía dejó de servir — es una línea.**

**Trae menos comentarios de los que dice el video.** Es esperable y no es un error:

- TikTok no carga *todos* los comentarios aunque scrollees para siempre; corta en algún punto.
- Las **respuestas** anidadas solo aparecen si alguien clickeó "ver más respuestas" antes.

Para minar lenguaje eso no importa: TikTok ordena por relevancia, así que lo que sí baja son
los comentarios con más likes y respuestas — exactamente donde está la señal. Los primeros
varios cientos alcanzan de sobra.

## Qué se hace después con el archivo

No se leen los comentarios: se buscan **patrones**. El trabajo es separar dos cosas que vienen
mezcladas y que sirven para cosas distintas:

- **Comentarios de periodistas** → su dolor, con sus palabras. Materia prima de los ganchos.
- **Comentarios del público general** → cómo ve la gente de afuera al periodismo. Sirve para
  otra cosa, no para venderle al periodista.

De ahí salen las frases textuales que más se repiten, que se convierten en ganchos y placas
siguiendo las reglas de siempre: directos e incómodos, con persona o consecuencia, nunca cifras.
