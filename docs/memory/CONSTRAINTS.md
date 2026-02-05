<!-- DO: Add bullets. Edit existing bullets in place with (updated YYYY-MM-DD). -->
<!-- DON'T: Delete bullets. Don't write prose. Don't duplicate — search first. -->

# Constraints

## Infrastructure
- AllMind backend runs on port 7780
- Chinvex gateway runs on port 7778
- PM2 manages 4 services: allmind, chinvex-gateway, chinvex-tunnel, chinvex-sync
- Registry source of truth: `P:\software\_strap\registry.json`
- Strap root: `P:\software`
- Shims directory: `P:\software\bin`
- Chinvex API: https://chinvex.unkndlabs.com
- PowerShell 7 path: `C:\Program Files\WindowsApps\Microsoft.PowerShell_7.5.4.0_x64__8wekyb3d8bbwe\pwsh.exe`
- PM2 restart limits: max_restarts=10, min_uptime=5000ms (10000ms for Python), restart_delay=2000-5000ms

## Rules
- Registry is source of truth for repos - filesystem is secondary enrichment
- Dashboard code lives in `public/index.html` with inline React/Babel (no separate JSX file)
- Always use windowsHide: true in PM2 config to prevent terminal flashing on Windows
- Require CHINVEX_API_TOKEN in environment for Chinvex integration

## Key Facts
- API root: `/api`
- Dashboard served from `/` (static files in `public/`)
- PM2 config: `config/ecosystem.config.cjs`
- Logs directory: `logs/` (error.log, out.log)

## Hazards
- Shims can be array or object format in registry - must handle both to prevent iteration errors
- PM2 crash loops if restart settings not configured properly (fork mode, max_restarts, min_uptime required)
- Missing CHINVEX_API_TOKEN will break Chinvex routes

## Superseded
(None yet)
