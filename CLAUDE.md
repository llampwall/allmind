# CLAUDE.md

## Project

AllMind - Universal control center for your development system

## Language

JavaScript (Node.js)

## Structure

- `server.js` - Express API entry point
- `public/index.html` - React dashboard with inline Babel
- `routes/` - API route handlers (repos, services, chinvex, strap, actions)
- `lib/utils.js` - Shared utilities and config
- `config/ecosystem.config.cjs` - PM2 service definitions
- `docs/memory/` - Project memory files (STATE, CONSTRAINTS, DECISIONS)

## Commands (PowerShell)

npm start                         # Start server (dev)
pm2 start config/ecosystem.config.cjs  # Start with PM2 (prod)
pm2 restart allmind              # Restart service
curl http://localhost:7780/api/health  # Health check

## Architecture

- **Express API**: REST endpoints for repos, services, chinvex, strap
- **React Dashboard**: Single-page app with hash routing, served from public/
- **PM2 Services**: Manages allmind, chinvex-gateway, chinvex-tunnel, chinvex-sync
- **Registry Integration**: Reads from `P:\software\_strap\registry.json` as source of truth
- **Git Integration**: Full path git.exe with shell:false for Windows compatibility

## Memory System

Chinvex repos use structured memory files in `docs/memory/`:

- **STATE.md**: Current objective, active work, blockers, next actions
- **CONSTRAINTS.md**: Infrastructure facts, rules, hazards (merge-only)
- **DECISIONS.md**: Append-only decision log with dated entries

**SessionStart Integration**: When you open a chinvex-managed repo, a hook runs `chinvex brief --context <name>` to load project context.

**If memory files are uninitialized** (empty or bootstrap templates), the brief will show "ACTION REQUIRED" instructing you to run `/update-memory`.

**The /update-memory skill** analyzes git history and populates memory files with:
- Current state from recent commits
- Constraints learned from bugs/infrastructure
- Decisions with evidence (commit hashes)

See `\docs\MEMORY_SYSTEM_HOW_IT_WORKS.md` and `docs/PROJECT_MEMORY_SPEC` for details.

## Rules

- Registry is source of truth - filesystem is secondary enrichment
- Dashboard code lives in public/index.html with inline React/Babel (no separate JSX)
- Always use windowsHide: true in PM2 config to prevent terminal flashing
- Use shell:false for git commands to avoid Windows path/escaping issues
- When opening a repo, check if brief shows "ACTION REQUIRED" - if so, offer to run `/update-memory`
- Server binds to 0.0.0.0:7780 for tailscale/LAN access (not production-hardened)
