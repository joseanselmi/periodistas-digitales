// Función 13 — PRUEBA TEMPORAL (17/08/2026).
// El código afirma en tres lugares que el plan topea en 12 funciones y que `api/` está
// exactamente en 12, y por eso el link de baja tuvo que colgarse del redirector de PDFs.
// Es el mismo tipo de número heredado que el maxDuration de 60 y que "el plan permite 2 crons",
// los dos falsos. Esto lo comprueba: si el deploy pasa, el tope no existe.
// Se borra apenas se sepa la respuesta.
export default function handler(req, res) {
  res.status(200).json({ ok: true, prueba: 'funcion 13' });
}
