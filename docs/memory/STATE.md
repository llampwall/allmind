<!-- DO: Rewrite freely. Keep under 30 lines. Current truth only. -->
<!-- DON'T: Add history, rationale, or speculation. No "we used to..." -->

# State

## Current Objective
Maintain and improve AllMind control center for managing development infrastructure

## Active Work
- Heads Up panel with project status overview completed
- Git integration with recent commits display working
- Tailscale network access configured

## Blockers
None

## Next Actions
- [ ] Test PM2 services startup (allmind, chinvex-gateway, chinvex-tunnel, chinvex-sync)
- [ ] Consider adding edit/quick actions to Heads Up panel

## Quick Reference
- Run: `npm start` (dev) or `pm2 start config/ecosystem.config.cjs` (prod)
- Test: `curl http://localhost:7780/api/health`
- Entry point: `server.js`
- Dashboard: http://localhost:7780 (localhost or tailscale)
- Repo detail views: http://localhost:7780/#/repo/:name

## Out of Scope (for now)
- Production hardening / security
- Authentication (assumes trusted network only)

---
Last memory update: 2026-02-05
Commits covered through: 5be85249f6eda2cce42d3e307634630058561040

<!-- chinvex:last-commit:5be85249f6eda2cce42d3e307634630058561040 -->
