<!-- DO: Rewrite freely. Keep under 30 lines. Current truth only. -->
<!-- DON'T: Add history, rationale, or speculation. No "we used to..." -->

# State

## Current Objective
Maintain and improve AllMind control center for managing development infrastructure

## Active Work
- Completed comprehensive TODO system with Launch in Claude integration
- Completed system-wide SITREP panel aggregating cross-repo status
- Completed two-column overview layout redesign
- Completed TheGridCN Ares theme migration (Tron-inspired red UI with glow effects)

## Blockers
None

## Next Actions
- [ ] Test PM2 services startup (allmind, chinvex-gateway, chinvex-tunnel, chinvex-sync)
- [ ] Consider mobile-responsive design improvements

## Quick Reference
- Run: `npm start` (dev) or `pm2 start config/ecosystem.config.cjs` (prod)
- Test: `curl http://localhost:7780/api/health`
- Entry point: `server.js`
- Dashboard: http://localhost:7780 (localhost or tailscale)
- Repo detail views: http://localhost:7780/#/repo/:name
- TODO API: `/api/todos` (GET/POST/PUT/DELETE)

## Out of Scope (for now)
- Production hardening / security
- Authentication (assumes trusted network only)

---
Last memory update: 2026-02-07
Commits covered through: 0195fbb00dfc222506b3fb51c5183ed993740d2f

<!-- chinvex:last-commit:0195fbb00dfc222506b3fb51c5183ed993740d2f -->
