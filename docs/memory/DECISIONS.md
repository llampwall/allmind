<!-- DO: Append new entries to current month. Rewrite Recent rollup. -->
<!-- DON'T: Edit or delete old entries. Don't log trivial changes. -->

# Decisions

## Recent (last 30 days)
- Established AllMind as universal control center for development infrastructure
- Registry-centric architecture: registry.json is source of truth, filesystem enriches
- Dashboard uses inline React/Babel in HTML (no separate JSX build step)
- PM2 manages all core services with proper restart limits
- Fixed UI bugs: search results mapping, clickable context rows, shim iteration

## 2026-02

### 2026-02-04 — Initial AllMind implementation

- **Why:** Need unified dashboard to manage development infrastructure (repos, services, contexts, tools)
- **Impact:** Created Express API + React dashboard serving as central hub for 23+ repos, PM2 services, Chinvex, and Strap tooling
- **Evidence:** 5e45643

### 2026-02-04 — Registry as source of truth for repos view

- **Why:** Registry defines what's managed by the system - repos may not exist on disk yet or may be in non-standard locations
- **Impact:** Changed `/api/repos` endpoint to read from registry.json first, then enrich with filesystem/git data as secondary information
- **Evidence:** af2febe

### 2026-02-04 — PM2 crash loop prevention

- **Why:** Services were restarting too aggressively, causing resource exhaustion and Windows terminal spam
- **Impact:** Configured fork mode with max_restarts=10, min_uptime=5000ms, restart_delay=2000-5000ms, and windowsHide=true for all services
- **Evidence:** 5e45643

### 2026-02-04 — Fixed shims iteration error for mixed array/object formats

- **Symptom:** "object is not iterable" error when sentinel-kit registry had shims as object instead of array
- **Root cause:** Code assumed shims would always be an array, but registry format allows both array and object
- **Fix:** Added format detection and normalization in repos.js and strap.js routes
- **Prevention:** Always handle both formats when iterating over shims from registry
- **Evidence:** bea868d

### 2026-02-04 — Dashboard in public/index.html, removed separate JSX file

- **Why:** Separate c3-dashboard.jsx was not being used - dashboard served from public/index.html with inline React/Babel
- **Impact:** Removed 978-line unused JSX file to eliminate confusion when making edits. Dashboard code now has single source of truth.
- **Evidence:** 1af6dda

### 2026-02-04 — Fixed search results API mapping

- **Symptom:** Search results showed undefined content and scores
- **Root cause:** Mapping incorrect field names - API returns `text` (not `content`), `scores.rank` (not `score`), `source_uri` (not `source_path`)
- **Fix:** Corrected field mapping in dashboard to match actual Chinvex API response structure
- **Prevention:** Reference API schema when mapping response fields
- **Evidence:** 144ebd0

### 2026-02-04 — Added Claude Code project configuration

- **Why:** Enable Claude Code CLI integration for this repository
- **Impact:** Added `.claude/settings.json` with project configuration
- **Evidence:** da43697
