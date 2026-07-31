/* track.js — beacon de tracking de las landings → tabla `events` (base de marketing).
   Manda un evento por cada pageview y por cada clic en un link de checkout de Hotmart,
   con la atribución (src/sck/utm/fbp/fbc) + un session_id anónimo persistente.
   Liviano y best-effort: usa sendBeacon (no bloquea la navegación) y falla en silencio.

   Cada página define su ubicación en el embudo antes de cargar este script:
     <script>window.PD_TRACK={funnel:'meta-ads-directo',step:'landing'};</script>
   El endpoint /api/event guarda todo; un trigger en Postgres resuelve funnel/step a FKs. */
(function () {
  var ENDPOINT = '/api/event';
  var page = window.PD_TRACK || {};

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }

  // session_id anónimo, persistente por visitante (para contar sesiones/visitantes únicos).
  function sessionId() {
    try {
      var k = 'pd_sid', v = localStorage.getItem(k);
      if (!v) { v = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return ''; }
  }

  var q = new URLSearchParams(location.search);

  function send(tipo) {
    var body = {
      tipo_evento: tipo,
      url: location.href,
      path: location.pathname,
      referrer: document.referrer || '',
      src: q.get('src') || '',
      sck: q.get('sck') || '',
      utm_source: q.get('utm_source') || '',
      utm_medium: q.get('utm_medium') || '',
      utm_campaign: q.get('utm_campaign') || '',
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
      session_id: sessionId(),
      funnel: page.funnel || '',
      step: page.step || '',
      ts: new Date().toISOString()
    };
    try {
      var json = JSON.stringify(body);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([json], { type: 'application/json' }));
      } else {
        fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: true });
      }
    } catch (e) { /* telemetría: nunca romper la página */ }
  }

  // Pageview al cargar.
  send('pageview');

  // Clic en cualquier botón de checkout (link de Hotmart).
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="hotmart"]') : null;
    if (a) send('click_checkout');
  }, true);
})();
