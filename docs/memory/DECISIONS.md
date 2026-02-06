<!-- DO: Append new entries to current month. Rewrite Recent rollup. -->
<!-- DON'T: Edit or delete old entries. Don't log trivial changes. -->

# Decisions

## Recent (last 30 days)
- Established AllMind as universal control center for development infrastructure
- Registry-centric architecture: registry.json is source of truth, filesystem enriches
- Dashboard uses inline React/Babel in HTML (no separate JSX build step)
- PM2 manages all core services with proper restart limits
- Fixed git availability in PM2 by using explicit git path with shell:false
- Added Heads Up panel with parsed STATE.md sections for quick project status
- Tailscale network access enabled via 0.0.0.0 binding
- Hash-based routing for per-repo detail views

## 2026-02

### 2026-02-05 — Heads Up panel with STATE.md parsing

- **Why:** Provide quick at-a-glance project status without scrolling through full memory files
- **Impact:** Added sticky sidebar panel that parses STATE.md sections (Current Objective, Next Actions, Blockers) and displays last commit. Memory Files collapsed into panel bottom. Restructured layout to 2/3 main + 1/3 Heads Up.
- **Evidence:** 5be8524

### 2026-02-05 — Tailscale network access via 0.0.0.0 binding

- **Why:** Enable dashboard access from other devices on tailscale network (e.g., mobile, tablet)
- **Impact:** Changed server.listen() to bind to 0.0.0.0:7780 instead of localhost only. Updated README with network access details and security notes.
- **Evidence:** f9583b5

### 2026-02-05 — Fixed git availability in PM2 environment

- **Symptom:** Recent commits showing empty array, git log commands failing silently in PM2
- **Root cause:** PM2 processes don't inherit full system PATH, and shell:true with paths containing spaces breaks command execution. Git path `C:\Program Files\Git\cmd\git.exe` was being split at the space.
- **Fix:** Added config.gitPath with explicit git.exe path, changed runCmd to use shell:false to avoid shell interpretation issues with spaces and percent characters
- **Prevention:** Use explicit paths for all external executables when running under PM2, use shell:false for commands with special characters
- **Evidence:** a6ee353

### 2026-02-05 — Git integration with push support and Recent Commits display

- **Why:** Users need to see recent commit history and push changes directly from dashboard
- **Impact:** Restructured repo detail layout with Status and Git panels side-by-side. Added Recent Commits section with expand/collapse (3 default, show all button). Added Push button (disabled unless ahead of origin). Added push to safe git commands whitelist.
- **Evidence:** a6ee353

### 2026-02-05 — Markdown rendering for memory files

- **Why:** Memory files in STATE.md and CONSTRAINTS.md format better as rendered markdown than plain text
- **Impact:** Integrated marked.js library with dark theme CSS styling for headers, lists, code blocks, tables
- **Evidence:** dd4e221

### 2026-02-05 — Per-repo detail views with hash-based routing

- **Why:** Users need dedicated pages to view individual repository details, git status, commits, and memory files
- **Impact:** Added React Router v5 with HashRouter for client-side navigation. Created Sidebar with Quick Access repo list. Created RepoDetailView showing git status, commits, memory files, and actions. URLs: `http://localhost:7780/#/repo/:name`
- **Evidence:** 2a82a5a

### 2026-02-05 — Visual support for registry setup field

- **Why:** Setup health status wasn't visible in UI - users couldn't tell if repos had successful setup
- **Impact:** Added SetupBadge component displaying setup status (succeeded/failed/skipped/not_attempted) with color coding and error details
- **Evidence:** a2ab2b0

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
