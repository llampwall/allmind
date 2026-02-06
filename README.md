# AllMind

**Universal control center for your development system.**

AllMind provides a unified dashboard and API to monitor and control all aspects of your development environment. It serves as the central hub for repositories, services, contexts, and tools - bringing everything into one place.

## Views

### Overview
System health dashboard showing:
- Service status (Chinvex, PM2, Strap registry)
- Quick stats and uptime
- Configuration overview

### Repositories
Manage all repositories registered in your system:
- View all repos from `registry.json` (source of truth)
- Git status, branch info, ahead/behind counts
- Repository metadata: lifecycle status, chinvex depth, tags
- Edit metadata directly from dashboard (syncs with registry)
- Tool detection (Claude projects, Python venvs, Node packages)
- Quick actions: Open in Claude/VS Code/Terminal
- Run tests, view memory files, git operations
- Memory files (STATE.md, CONSTRAINTS.md) display side-by-side on desktop

### Chinvex
Knowledge base search and context management:
- Browse available contexts
- Semantic search across all contexts
- View search results with source attribution

### Services
Monitor and control running services:
- PM2 process management
- Service health checks
- Start/stop/restart controls
- View logs

### Strap
Shim and tool management:
- View registered shims
- Detect collisions
- Run diagnostic checks

## Quick Start

```powershell
cd P:\software\allmind
npm install
npm start
```

The dashboard will be available at:
- Local: `http://localhost:7780`
- Tailscale: `http://<tailscale-ip>:7780`

Or run with pm2 for persistence:
```powershell
pm2 start config/ecosystem.config.cjs
pm2 save
```

### PM2 Setup

**IMPORTANT:** PM2 is vendored and managed by strap. You do NOT need to install PM2 globally or configure any paths.

- **Vendored Location:** `P:\software\_node-tools\pm2`
- **Shim:** `P:\software\bin\pm2.cmd` (managed by strap)
- **No manual installation needed** - PM2 is automatically available system-wide via the shim

The `lib/utils.js` and `config/ecosystem.config.cjs` files use `pm2.cmd` directly (no paths required). This setup ensures PM2 won't break if global package managers change. If PM2 ever stops working:

1. Verify the shim exists: `where.exe pm2.cmd` should show `P:\software\bin\pm2.cmd`
2. Check the vendor installation: `P:\software\_node-tools\pm2\node_modules\.bin\pm2.cmd --version`
3. If broken, recreate the shim: `strap shim pm2 --cmd "P:\software\_node-tools\pm2\node_modules\.bin\pm2.cmd" --repo _strap`

**Network Access:**
The server listens on `0.0.0.0:7780`, making it accessible from:
- Localhost (127.0.0.1)
- LAN IP addresses
- Tailscale network

This allows you to access the dashboard from other devices on your tailscale network.

## Architecture

AllMind consists of:
- **Backend API** (Express.js) - Port 7780
- **Dashboard UI** (React) - Single-page application served from backend
- **Data Sources**:
  - Strap registry (`P:\software\_strap\registry.json`) - Source of truth for repos
  - Chinvex API - Knowledge base and semantic search
  - PM2 - Process management
  - Git repositories - Status and metadata

### Data Flow
1. Registry defines what's managed by the system
2. Backend enriches registry data with git/filesystem status
3. Dashboard presents unified view of all components
4. Actions execute through backend API

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLMIND_PORT` | 7780 | Server port |
| `STRAP_ROOT` | `P:\software` | Root directory for repos |
| `STRAP_REGISTRY` | `P:\software\_strap\registry.json` | Strap registry (source of truth) |
| `STRAP_CONFIG` | `P:\software\_strap\config.json` | Strap config file |
| `SHIMS_DIR` | `P:\software\bin` | Shims directory |
| `CHINVEX_URL` | `https://chinvex.unkndlabs.com` | Chinvex API URL |
| `CHINVEX_API_TOKEN` | (required) | Chinvex bearer token |
| `PWSH_PATH` | `C:\\Program Files\\WindowsApps\\...\\pwsh.exe` | PowerShell 7 path |
| `GIT_PATH` | `C:\\Program Files\\Git\\cmd\\git.exe` | Git executable path |
| `PM2_CMD` | `pm2.cmd` | PM2 command (vendored by strap, no configuration needed) |

**Note:** PM2_CMD uses the vendored PM2 shim and does not require manual configuration. See "PM2 Setup" section above.

## API Endpoints

### Health
- `GET /api/health` - System health overview

### Chinvex
- `GET /api/chinvex/health` - Chinvex health
- `GET /api/chinvex/contexts` - List contexts
- `POST /api/chinvex/search` - Search contexts
- `POST /api/chinvex/evidence` - Get grounded evidence

### Strap
- `GET /api/strap/registry` - Full registry
- `GET /api/strap/shims` - List shims with collision detection
- `GET /api/strap/config` - Strap config
- `GET /api/strap/doctor` - Run doctor checks

### Repos
- `GET /api/repos` - List all repos from registry with enriched data
- `GET /api/repos/:name` - Repo details + memory files
- `POST /api/repos/:name/test` - Run tests
- `POST /api/repos/:name/git` - Run safe git commands
- `POST /api/repos/:name/configure` - Update registry metadata (status, depth, tags)

**Repo Metadata:**
- `status`: Lifecycle status (active, stable, archived, deprecated)
- `chinvexDepth`: Ingestion depth for Chinvex (light, full)
- `tags`: Array of category tags for organizing repos

**Note:** Registry is the source of truth. All repos in `registry.json` will appear, even if they don't exist on disk yet.

### Services
- `GET /api/services` - List all services (pm2 + endpoints)
- `POST /api/services/:id/restart` - Restart PM2 service
- `POST /api/services/:id/stop` - Stop PM2 service
- `POST /api/services/:id/start` - Start PM2 service
- `GET /api/services/:id/logs` - Get PM2 logs

### Actions
- `POST /api/actions/open-claude` - Open Claude in repo
- `POST /api/actions/open-vscode` - Open VS Code in repo
- `POST /api/actions/open-terminal` - Open terminal in repo
- `POST /api/actions/run-brief` - Run chinvex brief
- `POST /api/actions/run-ingest` - Run chinvex ingest
- `POST /api/actions/run-digest` - Run chinvex digest
- `POST /api/actions/strap-doctor` - Run strap doctor

## Development

```powershell
# Watch mode
npm run dev

# Test endpoints
curl http://localhost:7780/api/health
curl http://localhost:7780/api/repos
curl http://localhost:7780/api/strap/shims
```

## Design Philosophy

**Registry as Source of Truth**
The strap registry defines what's managed. Filesystem is secondary - enriches but doesn't define.

**Hub, Not Orchestrator**
AllMind observes and provides controls. It doesn't manage service lifecycles or deployments.

**Extensible Foundation**
Built to grow. Additional views, data sources, and integrations plug in through the API layer.

## Security Notes

- This is a local development tool, not production-hardened
- Actions execute commands on your system with your permissions
- Server listens on `0.0.0.0:7780` for tailscale access
- Keep port 7780 firewalled from untrusted networks (safe on tailscale)
- Chinvex API token in environment provides full access to knowledge base
- No authentication - assumes trusted network (tailscale or localhost only)
