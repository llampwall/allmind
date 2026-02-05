# ALLMIND Dashboard Roadmap

> **Status:** Active
> **Created:** 2026-02-04
> **Purpose:** Track feature backlog + specs for the C3 central hub dashboard

---

## Priority Order

| # | Feature | Effort | Status | Depends On |
|---|---------|--------|--------|------------|
| 1 | Heads Up Section | Medium | Not started | Chinvex briefs/STATE.md |
| 2 | Per-Repo View | Medium | Not started | Route restructure |
| 3 | Quick Add | Low | Not started | Storage decision |
| 4 | Buttons (expanded) | Low | Partial | Per-repo view |
| 5 | Central Documents | Low | Not started | — |
| 6 | Environment Viewer | Low | Not started | Per-repo view |
| 7 | Monitoring (enhanced) | Medium | Partial | PM2 endpoints exist |
| 8 | Statistics | Medium | Not started | Time-series store |
| 9 | Interactive Timeline | High | Not started | Git log parsing |
| 10 | Create/Rename/Delete Repo | Medium | Not started | Strap integration |
| 11 | Skin Refresh | Low | Not started | — |

---

## Architectural Decision: Per-Repo View

Before speccing individual features, the biggest structural change needs to land first.

**Current state:** Single-page dashboard. Everything is system-wide.

**Target state:** Two modes sharing the same component library.

```
/                     → System overview (all repos, global stats, global heads-up)
/repo/:name           → Single repo view (repo-specific heads-up, buttons, env, timeline)
```

**Implementation:**
- Frontend: React Router (hash-based, since we're a single HTML file with CDN React)
- Backend: Most endpoints already accept repo filtering, add `?repo=name` where missing
- Sidebar: Clicking a repo name navigates to `/repo/:name`
- Back button or logo navigates to `/`

**Why first:** Heads Up, Buttons, Environment, Timeline — all need the per-repo context to be useful. Building them system-wide-only means rebuilding later.

---

## Feature Spec: Heads Up Section

### What It Does

A prominent card at the top of both system and repo views that answers four questions at a glance:

1. **Last thing done** — most recent meaningful activity
2. **What's up next** — current objective / next actions
3. **Most critical issue** — blockers, failures, or gaps
4. **Highest ROI move** — the single thing that would unlock the most progress

### Data Sources

| Field | System View Source | Repo View Source |
|-------|-------------------|-----------------|
| Last thing done | Most recent commit across all repos | `git log -1` for this repo |
| What's up next | Chinvex brief (top actions) | `docs/memory/STATE.md` → Next Actions |
| Critical issue | Chinvex brief (blockers) | `docs/memory/STATE.md` → Blockers |
| Highest ROI | Chinvex brief or manual pin | `docs/memory/STATE.md` → Current Objective |

### Backend Endpoints

**`GET /api/headsup`** — system-wide summary

```json
{
  "last_done": {
    "repo": "chinvex",
    "message": "fix: cross-context search allowlist",
    "hash": "abc1234",
    "timestamp": "2026-02-04T10:30:00Z"
  },
  "next_up": [
    "Re-ingest all contexts after wipe",
    "Strap-chinvex integration batch 1"
  ],
  "critical": "Global context DB corrupt — re-ingesting",
  "high_roi": "Ship strap-chinvex integration (automates context lifecycle)"
}
```

**`GET /api/headsup?repo=chinvex`** — repo-specific

```json
{
  "last_done": {
    "message": "fix: cross-context search allowlist",
    "hash": "abc1234",
    "timestamp": "2026-02-04T10:30:00Z"
  },
  "next_up": ["Complete P5 eval suite", "Memory maintainer scheduling"],
  "critical": null,
  "high_roi": "Stabilize cross-context search"
}
```

### Backend Logic

```
GET /api/headsup?repo={name}
  1. git log -1 --format=json  (from repo path via registry)
  2. Read {repo}/docs/memory/STATE.md (if exists)
     - Parse "## Current Objective" → high_roi
     - Parse "## Next Actions" → next_up (first 3)
     - Parse "## Blockers" → critical
  3. Fallback: if no STATE.md, use git log + "No memory files found"
  4. Return JSON

GET /api/headsup (no repo param)
  1. For each repo in registry:
     - git log -1 (find most recent across all)
  2. Read Chinvex brief if available (or aggregate STATE.md files)
  3. Return JSON with cross-repo summary
```

### Frontend

Card with 4 quadrants. Minimal, scannable. Each quadrant:
- Icon + label (subtle)
- 1-2 lines of content
- Timestamp where relevant
- Click-through to detail (future)

### Acceptance Criteria

- [ ] System view shows cross-repo summary
- [ ] Repo view shows repo-specific data from STATE.md
- [ ] Graceful fallback when STATE.md doesn't exist
- [ ] Refreshes on dashboard load (not polled)
- [ ] Renders in under 200ms after data arrives

---

## Feature Spec: Quick Add

### What It Does

Minimal capture interface. Three modes, one input box.

- **Note** — freeform text, timestamped, filed to repo or global
- **Future Task** — captured to backlog, not actionable now
- **Quick Task** — actionable now, goes to top of next actions

### Storage

**Decision needed:** Where do these live?

| Option | Pros | Cons |
|--------|------|------|
| Append to STATE.md | Immediately visible to agents | Pollutes curated file |
| Separate `inbox.md` | Clean separation, Dual Nature aligned | Another file to track |
| SQLite | Queryable, structured | Agents can't read it naturally |
| `docs/memory/INBOX.md` | In memory dir, agent-visible, separate from curated | Needs maintainer to process |

**Recommendation:** `docs/memory/INBOX.md` per repo + `P:\ai_memory\global\INBOX.md` for system-wide. Aligns with Dual Nature "Drop Box" concept. Maintainer processes inbox into STATE.md during runs.

### Format

```markdown
# Inbox

## 2026-02-04

- [note] Context wipe completed, starting fresh ingestion
- [task] Write Pester tests for shim generation
- [future] Explore thegridcn-ui for dashboard skin refresh
```

### Backend Endpoint

**`POST /api/quickadd`**

```json
{
  "repo": "chinvex",       // optional, null = global
  "type": "note",          // "note" | "task" | "future"
  "content": "Fix the _global context DB"
}
```

Response: `201 Created`

**Logic:**
1. Resolve target file: `{repo}/docs/memory/INBOX.md` or global inbox
2. Read existing content (or create with `# Inbox` header)
3. Ensure today's date section exists
4. Append `- [{type}] {content}`
5. Write file

### Frontend

- Floating action button (bottom-right) or keyboard shortcut
- Opens small modal: text input + type selector (3 toggle buttons)
- Optional repo dropdown (defaults to current repo view, or "Global")
- Enter to submit, Escape to close
- Toast confirmation on success

### Acceptance Criteria

- [ ] Can add note/task/future from any view
- [ ] Items appear in correct INBOX.md file
- [ ] Date sections auto-created
- [ ] Works from both system and repo views
- [ ] Keyboard-driven (no mouse required)

---

## Backlog (not yet specced)

### Buttons (Expanded)

Current buttons work. Need to add per-repo (some of these we have):
- Open dir (File Pilot)
- Open VS Code (`code {path}`)
- Open Claude (`claude --dir {path}`)
- Open Codex 
- Run tests (`strap test` or detect test runner)
- View logs (tail recent log files)
- **Investigate** — opens Claude Code with: "Read STATE.md and recent git log for {repo}. What's the current status and what needs attention?"
- Emergency killswitch — kill all processes associated with repo
- Git status/push/pull
- Run with arguments (custom command input)

### Central Documents

File browser / link collection pointing to:
- /docs
- README.md
- CLAUDE.md + AGENTS.md if there

Could be a simple curated JSON/markdown file that the dashboard renders as a link grid.

### Environment Viewer

Per-repo panel showing:
- Dependencies (`package.json`, `requirements.txt`, `pyproject.toml`)
- Relevant env vars (read from `.env.example`, never `.env`)
- Venv status (exists? python version? installed packages?)
- Node version, npm/pnpm
- Sandbox parameters (future — Dual Nature compute limits)

### Monitoring (Enhanced)

Extend current PM2 view:
- CPU/RAM per process (PM2 provides this)
- Running Claude/Codex instances (detect by process name)
- Threshold alarms (configure via UI, notify via ntfy)
- Kill button per process

### Statistics

Needs a collection mechanism first:
- Uptime/downtime per service (PM2 restart history)
- Time spent working on each repo (git log analysis: commits per day, active hours)
- Error rates (parse log files)
- Custom stats (user-defined counters)
- Feature coverage (test coverage reports)

### Interactive Timeline

The big one. MVP approach:
1. Parse `git log --all --graph` for a repo
2. Render as a horizontal timeline with zoom
3. Major features = tagged commits or merge commits
4. Zoom in = individual commits with branch lines
5. Click commit = show diff summary
6. **Agent context integration:** "Show me what was happening around Jan 15" → timeline highlights + Chinvex search

Libraries to evaluate: `vis-timeline`, `d3-timeline`, or custom SVG.

### Create/Rename/Delete Repo

Protected operations behind confirmation flow:
1. Click "New Repo" or "Manage" button
2. Confirmation modal with repo name typed to confirm
3. Password/PIN verification (stored hashed in config)
4. Executes via strap CLI (`strap clone`, `strap rename`, `strap uninstall`)
5. Chinvex context auto-managed (once strap-chinvex integration ships)

### Skin Refresh

[thegridcn-ui](https://github.com/educlopez/thegridcn-ui) — bento grid layout.
Evaluate whether it's a drop-in for our CDN React setup or needs a build step.
If build step required, defer until we decide on frontend architecture.

---

## Open Questions

1. **Frontend architecture:** Stay with single HTML + CDN React, or move to a proper build (Vite/Next)? Single file is simple but limits what we can do with routing, code splitting, and component libraries.

2. **Auth:** Dashboard is local-only for now. If exposed via tunnel, need auth. Pin-based? Token?

3. **Real-time updates:** Polling vs WebSocket vs SSE for monitoring data?

4. **Mobile:** Should this work on phone (via Happy/tunnel)? Affects layout decisions.

---

## References

- [C3 Backend repo](P:\software\c3-backend)
- [Dual Nature Vision](dual_nature_vision_architecture_v_1.md)
- [Strap-Chinvex Integration](strap-chinvex-integration.md)
- [thegridcn-ui](https://github.com/educlopez/thegridcn-ui)
