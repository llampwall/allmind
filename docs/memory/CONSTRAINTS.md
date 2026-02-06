<!-- DO: Add bullets. Edit existing bullets in place with (updated YYYY-MM-DD). -->
<!-- DON'T: Delete bullets. Don't write prose. Don't duplicate — search first. -->

# Constraints

## Infrastructure
- AllMind backend runs on port 7780 (updated 2026-02-05)
- AllMind binds to 0.0.0.0:7780 for tailscale/LAN access (updated 2026-02-05)
- Chinvex gateway runs on port 7778
- PM2 manages 4 services: allmind, chinvex-gateway, chinvex-tunnel, chinvex-sync
- Registry source of truth: `P:\software\_strap\registry.json`
- Strap root: `P:\software`
- Shims directory: `P:\software\bin`
- Chinvex API: https://chinvex.unkndlabs.com
- PowerShell 7 path: `C:\Program Files\WindowsApps\Microsoft.PowerShell_7.5.4.0_x64__8wekyb3d8bbwe\pwsh.exe`
- Git path: `C:\Program Files\Git\cmd\git.exe` (added 2026-02-05)
- PM2 vendored at: `P:\software\_node-tools\pm2` with strap shim at `P:\software\bin\pm2.cmd` (added 2026-02-05)
- PM2 restart limits: max_restarts=10, min_uptime=5000ms (10000ms for Python), restart_delay=2000-5000ms

## Rules
- Registry is source of truth for repos - filesystem is secondary enrichment
- Dashboard code lives in `public/index.html` with inline React/Babel (no separate JSX file)
- Always use windowsHide: true in PM2 config to prevent terminal flashing on Windows
- Require CHINVEX_API_TOKEN in environment for Chinvex integration
- Use shell:false for git commands to avoid percent-escaping issues on Windows (added 2026-02-05)
- Safe git commands whitelist: status, log, branch, diff, fetch, pull, push (updated 2026-02-05)

## Key Facts
- API root: `/api`
- Dashboard served from `/` (static files in `public/`)
- PM2 config: `config/ecosystem.config.cjs`
- Logs directory: `logs/` (error.log, out.log)
- Repo detail URLs: `/#/repo/:name` (hash-based routing) (added 2026-02-05)
- Memory files location: `docs/memory/` (STATE.md, CONSTRAINTS.md, DECISIONS.md) (added 2026-02-05)

## Hazards
- Shims can be array or object format in registry - must handle both to prevent iteration errors
- PM2 crash loops if restart settings not configured properly (fork mode, max_restarts, min_uptime required)
- Missing CHINVEX_API_TOKEN will break Chinvex routes
- Git path with spaces requires shell:false in spawn() to avoid command splitting (added 2026-02-05)
- PM2 processes don't inherit full system PATH - use explicit paths for executables like git and pwsh (updated 2026-02-05)
- PM2 is vendored by strap - do not install globally or modify paths in code (added 2026-02-05)

## Superseded
(None yet)
