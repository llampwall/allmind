# AllMind Component Overview

## 1. Purpose

**AllMind is the central control center for a Windows-based development environment.** It provides a unified web dashboard and REST API to monitor and control:
- 23+ repositories managed by the strap tooling system
- PM2-managed services (chinvex-gateway, chinvex-tunnel, chinvex-sync, allmind itself)
- Cross-repo task tracking with TODO system
- System-wide SITREP aggregating commits, blockers, and priorities across repos

**Users:** Primarily human developers accessing via browser (localhost or tailscale). The dashboard serves as a "mission control" for infrastructure health, repo status, git operations, and quick actions like launching Claude Code in specific repos.

## 2. How It Works

**Core Flow:** AllMind reads `P:\software\_strap\registry.json` as the source of truth for what repositories exist in the system. It then enriches this registry data by scanning the filesystem, querying git for status/commits/branches, checking for special files (.claude, .venv, package.json), and aggregating cross-repo state. The React frontend (served from a single `public/index.html` with inline Babel transpilation—no build step) displays this data and provides controls.

**Backend (Express.js on port 7780)** binds to `0.0.0.0` for tailscale network access. Routes live in `routes/*.js` and handle health checks, repo operations, PM2 service control, chinvex API proxying, strap shim management, and action triggers (open Claude, run git commands, launch terminals). A key architectural detail: Windows `.cmd` batch files like `pm2.cmd` must be invoked via `cmd.exe /c` wrapper (see `runPm2()` in `lib/utils.js`) because Node's `spawn()` can't execute them directly. Git commands use explicit path (`C:\Program Files\Git\cmd\git.exe`) with `shell:false` to avoid Windows path-splitting issues.

**Frontend (React + hash-based routing)** uses React Router v5 for client-side navigation. Main views: Overview (system diagnostics + TODO + SITREP), Repositories (registry listing + per-repo detail pages showing git status, commits, memory files), Services (PM2 process control), Chinvex (context search), Strap (shim management). Recently applied "Ares" theme (Tron-inspired red glow effects) via CSS-only—preserving the no-build architecture.

**Key Data Stores:**
- `P:\software\_strap\registry.json` — Strap's source of truth for repos, shims, setup status
- `data/todos.json` — In-file TODO storage with in-memory cache
- `.chinvex-status.json` — Per-repo status files for chinvex ingestion state
- `docs/memory/` in each repo — STATE.md, CONSTRAINTS.md, DECISIONS.md (parsed for SITREP)

**Deployment:** PM2 manages allmind as a service via `config/ecosystem.config.cjs`. Also runs 3 other services: chinvex-gateway (Python FastAPI on 7778), chinvex-tunnel (cloudflared), chinvex-sync (file watcher daemon). Config includes restart limits (max_restarts=10, min_uptime=5s) and `windowsHide: true` to prevent terminal flashing. Evidence: commits 544e182, be5a35d, 197cc0f.

## 3. Interface Surface

**CLI Commands:**
- `npm start` — Dev server (direct node process)
- `pm2 start config/ecosystem.config.cjs` — Production PM2-managed mode
- `pm2 restart allmind` — Restart service
- No dedicated CLI tool; operations happen via web UI or API

**API Endpoints (all under `/api`):**
- Health: `GET /health` — System health + service status
- Repos: `GET /repos`, `GET /repos/:name`, `POST /repos/:name/git`, `POST /repos/:name/configure`
- Services: `GET /services`, `POST /services/:id/{restart,stop,start}`, `GET /services/:id/logs`
- Chinvex: `GET /chinvex/contexts`, `POST /chinvex/search`, `POST /chinvex/evidence`
- Strap: `GET /strap/{registry,shims,config}`, `GET /strap/doctor`
- Actions: `POST /actions/{open-claude,open-vscode,open-terminal,run-brief,run-ingest}`
- TODOs: `GET /todos`, `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`

**MCP Tools:** None (allmind doesn't expose MCP tools; it *uses* chinvex which has MCP)

**Config Files Consumed:**
- `P:\software\_strap\registry.json` — Repo definitions (consumed by routes/repos.js, routes/strap.js)
- `config/ecosystem.config.cjs` — PM2 service definitions (consumed by PM2)
- Environment variables: `ALLMIND_PORT`, `STRAP_ROOT`, `CHINVEX_API_TOKEN`, `GIT_PATH`, etc. (see lib/utils.js:6-16)

## 4. Integration Points

**Consumes from:**
- **Strap** (`_strap` repo): Reads `registry.json` and `config.json` for repo metadata, shim listings, setup status. Strap is the authoritative source for "what repos exist."
- **Chinvex** (chinvex-gateway service + API): Proxies search requests to `https://chinvex.unkndlabs.com`, fetches contexts, runs brief/ingest/digest commands. Requires `CHINVEX_API_TOKEN` env var.
- **PM2** (vendored at `P:\software\_node-tools\pm2`): Queries process status, restarts services. Uses strap-managed shim at `P:\software\bin\pm2.cmd`.
- **Git**: Runs status/log/branch/diff/push commands via explicit path to avoid PM2 PATH issues.

**Provides to:**
- **Humans**: Web dashboard at `http://localhost:7780` or `http://<tailscale-ip>:7780`. No authentication (assumes trusted network).
- **Other components**: None directly. AllMind is a terminal node in the dependency graph—it observes and controls, but nothing else calls its API.
- **PWA Install**: Since 197cc0f, dashboard can be installed as a standalone app (manifest.json, service worker for offline UI).

**Specific component interactions:**
- Calls `chinvex brief --context <name>` via actions API to generate project context (consumed by SessionStart hook)
- Reads memory files (`docs/memory/STATE.md`) from repos like chinvex, strap, godex for SITREP aggregation
- Launches Claude Code via `wt -d <repo> pwsh -Command "claude --dangerously-skip-permissions '<prompt>'"` (Windows Terminal integration)

## 5. Current State

**Shipped & Working (verified in git log + code audit):**
- ✅ Express API with all documented endpoints (server.js, routes/*.js)
- ✅ React dashboard with hash-based routing (public/index.html ~143KB inline)
- ✅ PM2 service management integration (routes/services.js uses runPm2() wrapper)
- ✅ Git operations (status, log, branch, push) with Windows compatibility fixes (shell:false, explicit git path)
- ✅ Registry-centric repo listing with filesystem enrichment (routes/repos.js)
- ✅ TODO system with priority levels, repo tagging, markdown rendering (routes/todos.js, data/todos.json)
- ✅ SITREP panel aggregating cross-repo commits, todos, blockers (added 544e182)
- ✅ Launch in Claude button for repo-contextual prompts (actions.js:30-34)
- ✅ PWA support: installable app, offline UI, service worker (197cc0f, manifest.json)
- ✅ Ares theme (red glow, Tron aesthetic) applied via CSS-only (preserves no-build architecture)
- ✅ Markdown rendering for memory files (marked.js integration, dd4e221)
- ✅ Per-repo detail views showing git status, commits, memory files (2a82a5a)

**Partially Built/Experimental:**
- ⚠️ Mobile-responsive design: UI works but not optimized for mobile (noted in STATE.md next actions)
- ⚠️ Repo cache refresh: Background cache updates work but no auto-refresh interval configured (repos.js:17-22)

**Specced but Not Started:**
- N/A (no unimplemented specs found in docs)

## 6. Known Gaps

**Broken/Unreliable:**
- No authentication or authorization (explicitly out of scope per STATE.md:31-32, README.md:192-198). Security model assumes trusted network (tailscale/localhost only).
- PM2 service startup untested according to STATE.md:19 "Test PM2 services startup" still in next actions. However, ecosystem.config.cjs exists and is comprehensive (95 lines defining 4 services).

**Missing:**
- **Mobile responsive design** (STATE.md:20): Dashboard is desktop-centric. 143KB inline HTML would benefit from responsive breakpoints.
- **Auto-refresh for repo data**: Cache refresh is manual-triggered only. Dashboard doesn't poll or websocket for live updates.
- **Error handling for missing dependencies**: If `git.exe`, `pm2.cmd`, `wt`, or `chinvex` are missing, errors are generic. No graceful degradation or helpful "install X first" messages.
- **Logs UI**: Can fetch logs via API (`GET /services/:id/logs`) but no UI for viewing them in dashboard yet.

**Stale/Wrong Docs:**
- README.md:117 claims `PM2_CMD` defaults to `pm2.cmd` and "does not require manual configuration"—this is accurate per code (lib/utils.js:13).
- README.md:24 mentions "Memory files (STATE.md, CONSTRAINTS.md) display side-by-side on desktop"—verified in commits (dd4e221 added markdown rendering, 2a82a5a added per-repo views). Docs are current.
- CONSTRAINTS.md:28 documents PM2 .cmd wrapper requirement—verified in code (lib/utils.js:102-106 implements runPm2() as specified). Docs are accurate.

**Conclusion:** Documentation is well-maintained and matches code. Main gaps are **mobile UI** and **service startup validation**, both noted in STATE.md. No evidence of broken features—recent commits show active development and working implementations.
