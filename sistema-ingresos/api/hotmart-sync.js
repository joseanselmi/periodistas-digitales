// Las SINCRONIZACIONES DE DATOS del día, con cron propio.
//
// QUÉ HACE. Trae de afuera lo que después miran los paneles: ventas de Hotmart, gasto de Meta
// (acumulado por anuncio, embudo diario por anuncio y gasto diario de toda la cuenta), estado de
// los agentes y métricas de las versiones de checkout y landing.
//
// POR QUÉ TIENE CRON PROPIO DESDE EL 17/08/2026. Las seis viajaban adentro del cron de
// recuperación de carritos, con el comentario "no tiene cron propio (Hobby permite 2 y ya están
// usados)". Ese límite era falso: el plan permite 100 crons por proyecto, uno por día cada uno.
// Lo que sí limita es la cantidad de FUNCIONES —12, comprobado el 17/08 agregando una 13ª y
// viendo el deploy fallar—, y por eso las seis comparten ESTE endpoint, que ya existía, en vez
// de tener uno cada una.
//
// LO QUE SE GANA. Si una sincronización falla, ya no arrastra ni queda escondida detrás del
// trabajo de otra corrida: falla sola, se ve cuál, y la recuperación de carritos no se entera.
// Y al revés: un error en la recuperación ya no deja los paneles con datos de ayer.
//
// ⚠️ HORARIO: 11:00 UTC, ANTES del embudo (13:00) y de la recuperación (15:00). Con la
// imprecisión de ±59 min de los crons diarios ese orden se mantiene igual, así que la
// recuperación sigue viendo las ventas del día ya reconciliadas — que es lo que la hace no
// escribirle a alguien que ya compró.
//
// MODOS:
//   (sin parámetros)  — sólo el sync de Hotmart. Es el comportamiento de siempre, para
//                       dispararlo a mano sin arrastrar las otras cinco.
//   ?todos=1          — las seis. Es lo que llama el cron.
//
// Seguridad: CRON_SECRET (Authorization: Bearer <secret> o ?key=<secret>).

const { runHotmartSync } = require('./_lib/hotmart-sync');
const { runMetaGastoTotalPorAnuncio } = require('./_lib/meta-gasto-total-por-anuncio');
const { runMetaEmbudoDiarioPorAnuncio } = require('./_lib/meta-embudo-diario-por-anuncio');
const { runMetaGastoDiarioTodaLaCuenta } = require('./_lib/meta-gasto-diario-toda-la-cuenta');
const { runSyncEstados } = require('./_lib/sync-estados');
const { runVersionesSync } = require('./_lib/versiones-sync');

// Cada una en su propio try: el objetivo entero de sacarlas del cron de recuperación es que una
// que falla no se lleve puestas a las demás. Devolver el error en vez de tragarlo es la otra
// mitad — si esto contestara 200 con todo vacío, sería otro éxito falso de los que ya costaron
// semanas en este repo.
const SYNCS = [
  ['hotmart', runHotmartSync],
  ['meta_gasto_total_por_anuncio', runMetaGastoTotalPorAnuncio],
  ['meta_embudo_diario_por_anuncio', runMetaEmbudoDiarioPorAnuncio],
  ['meta_gasto_diario_toda_la_cuenta', runMetaGastoDiarioTodaLaCuenta],
  ['estados', runSyncEstados],
  ['versiones', runVersionesSync],
];

module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret
    || req.headers.authorization === `Bearer ${secret}`
    || searchParams.get('key') === secret;
  if (!authOk) return res.status(401).json({ error: 'unauthorized' });

  const todos = searchParams.get('todos') === '1';

  if (!todos) {
    try {
      const out = await runHotmartSync();
      return res.status(200).json({ ok: true, ...out });
    } catch (e) {
      console.error('hotmart-sync endpoint', e);
      return res.status(500).json({ error: String((e && e.message) || e) });
    }
  }

  const resultados = {};
  const fallaron = [];
  for (const [nombre, correr] of SYNCS) {
    const t0 = Date.now();
    try {
      const out = await correr();
      resultados[nombre] = { ok: true, ms: Date.now() - t0, ...out };
      console.log(JSON.stringify({ type: `sync_${nombre}`, ...out }));
    } catch (e) {
      const error = String((e && e.message) || e);
      resultados[nombre] = { ok: false, ms: Date.now() - t0, error };
      fallaron.push(nombre);
      console.error(`sync ${nombre} falló (no frena a las demás):`, error);
    }
  }

  // 207 cuando alguna falló: un 200 con errores adentro es justo lo que hace que nadie los mire.
  return res.status(fallaron.length ? 207 : 200).json({
    ok: fallaron.length === 0,
    corrieron: SYNCS.length,
    fallaron,
    resultados,
  });
};
