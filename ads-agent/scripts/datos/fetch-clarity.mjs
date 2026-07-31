/**
 * fetch-clarity.mjs — métricas de comportamiento de Microsoft Clarity (Data Export API)
 *
 *   node --env-file=.env.local scripts/datos/fetch-clarity.mjs            # agregado del sitio, últimos 3 días
 *   node --env-file=.env.local scripts/datos/fetch-clarity.mjs --days=1   # 1 día
 *   node --env-file=.env.local scripts/datos/fetch-clarity.mjs --raw      # JSON crudo
 *
 * La API da métricas AGREGADAS (scroll, rage/dead clicks, engagement) de los últimos 1-3 días,
 * máx 10 llamadas/día. NO da grabaciones ni heatmaps (eso es solo panel).
 * OJO: desglosar por URL fragmenta por los fbclid/utm de cada visita → se pide agregado.
 * Doc: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export
 */

const TOKEN = process.env.CLARITY_API_TOKEN;
if (!TOKEN) { console.error('❌ Falta CLARITY_API_TOKEN en .env.local'); process.exit(1); }

const args = process.argv.slice(2);
const days = Number((args.find(a => a.startsWith('--days=')) || '--days=3').split('=')[1]) || 3;
const raw = args.includes('--raw');

const url = new URL('https://www.clarity.ms/export-data/api/v1/project-live-insights');
url.searchParams.set('numOfDays', String(days));

const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
if (!res.ok) { console.error(`❌ Clarity API ${res.status}: ${await res.text()}`); process.exit(1); }
const data = await res.json();

if (raw) { console.log(JSON.stringify(data, null, 2)); process.exit(0); }

// Indexar métricas por nombre → primera fila de información (agregado)
const M = {};
for (const m of data) M[m.metricName] = (m.information && m.information[0]) || {};

const num = v => (v === undefined || v === null ? null : Number(v));
const show = (label, val, suf = '') => { if (val !== null && val !== undefined) console.log(`   ${label.padEnd(26)} ${val}${suf}`); };

console.log(`\n📊 CLARITY — comportamiento del sitio, últimos ${days} días\n`);

const t = M.Traffic || {};
show('Sesiones', num(t.totalSessionCount));
show('Usuarios únicos', num(t.distinctUserCount));
show('Sesiones de bots', num(t.totalBotSessionCount));
show('Páginas por sesión', t.pagesPerSessionPercentage);

console.log('\n  ── ¿Llegan hasta el botón? ──');
show('Scroll promedio', num((M.ScrollDepth || {}).averageScrollDepth), '%');
const et = M.EngagementTime || {};
show('Tiempo activo total (s)', num(et.activeTime));
show('Tiempo total (s)', num(et.totalTime));

console.log('\n  ── Señales de fricción ──');
const fric = [
  ['Rage clicks (furia)', 'RageClickCount'],
  ['Dead clicks (no responde)', 'DeadClickCount'],
  ['Quickback (entra y vuelve)', 'QuickbackClick'],
  ['Excessive scroll', 'ExcessiveScroll'],
  ['Error clicks', 'ErrorClickCount'],
  ['Errores de JavaScript', 'ScriptErrorCount'],
];
for (const [label, key] of fric) {
  const m = M[key] || {};
  const total = num(m.subTotal);
  const pct = m.sessionsWithMetricPercentage;
  if (total !== null) show(label, total, pct ? `   (${pct}% de sesiones)` : '');
}

console.log('\n✅ Clarity OK.  Métricas encontradas:', Object.keys(M).join(', '));
console.log('   (--raw para el JSON completo)');
