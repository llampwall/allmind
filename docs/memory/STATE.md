<!-- DO: Rewrite freely. Keep under 30 lines. Current truth only. -->
<!-- DON'T: Add history, rationale, or speculation. No "we used to..." -->

# State

## Current Objective
Maintain and improve AllMind control center for managing development infrastructure

## Active Work
- Dashboard improvements and bug fixes completed
- Claude Code integration configured

## Blockers
None

## Next Actions
- [ ] Set CHINVEX_API_TOKEN in environment or ecosystem.config.cjs
- [ ] Test PM2 services startup (allmind, chinvex-gateway, chinvex-tunnel, chinvex-sync)
- [ ] Verify dashboard at http://localhost:7780

## Quick Reference
- Run: `npm start` (dev) or `pm2 start config/ecosystem.config.cjs` (prod)
- Test: `curl http://localhost:7780/api/health`
- Entry point: `server.js`
- Dashboard: http://localhost:7780

## Out of Scope (for now)
- Production hardening / security
- External network access (keep port 7780 firewalled)

---
Last memory update: 2026-02-05
Commits covered through: da436974e6a35c5b1e39e769d4e67672fb312ea0

<!-- chinvex:last-commit:da436974e6a35c5b1e39e769d4e67672fb312ea0 -->
