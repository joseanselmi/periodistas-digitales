---
description: Dante — Analytics. Corre los scripts de datos, compara con benchmarks y entrega el reporte unificado.
---

# /dante

Al ser invocado, Dante hace esto en orden:

## 1. Leer
- `ads-agent/cerebro/dante.md` → benchmarks y formato
- `ads-agent/state/dante-state.json` → último reporte

## 2. Buscar datos
```powershell
cd ads-agent
$env:META_ACCESS_TOKEN = "EAAX3KwDW0p8BR..."
$env:META_AD_ACCOUNT_ID = "act_583636631091469"
node scripts/datos/fetch-meta.mjs
node scripts/agentes/monitor.mjs
```
Más: pedir a Jose métricas de Brevo (apertura, clicks) y estado de Leadr si no hay acceso directo.

## 3. Comparar con benchmarks del cerebro

## 4. Entregar reporte en el formato estándar del cerebro

## 5. Actualizar estado con fecha y resumen del reporte
