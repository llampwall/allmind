# C3 Backend - Chinvex Control Center

Local backend server for the C3 dashboard. Provides unified API for:
- Chinvex API proxy
- Strap registry and shims
- Repository scanning and git status
- PM2 service management
- Action execution (open Claude, VS Code, run tests)

## Quick Start

```powershell
cd P:\software\c3-backend
npm install
npm start
```

Or with pm2:
```powershell
pm2 start ecosystem.config.cjs
pm2 save
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `C3_PORT` | 7780 | Server port |
| `STRAP_ROOT` | `P:\software` | Root directory for repos |
| `STRAP_REGISTRY` | `P:\software\build\registry.json` | Strap registry file |
| `STRAP_CONFIG` | `P:\software\strap.config.json` | Strap config file |
| `SHIMS_DIR` | `P:\software\bin` | Shims directory |
| `CHINVEX_URL` | `https://chinvex.unkndlabs.com` | Chinvex API URL |
| `CHINVEX_API_TOKEN` | (required) | Chinvex bearer token |
| `PWSH_PATH` | `C:\Program Files\PowerShell\7\pwsh.exe` | PowerShell 7 path |

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
- `GET /api/repos` - List all repos with git status
- `GET /api/repos/:name` - Repo details + memory files
- `POST /api/repos/:name/test` - Run tests
- `POST /api/repos/:name/git` - Run safe git commands

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

## Integration with Dashboard

The React dashboard expects this backend at `http://localhost:7780`. Update the dashboard's API base URL if using a different port.

## Security Notes

- This is a local development tool, not production-hardened
- Actions can execute commands on your system
- Keep the port firewalled from external access
- The token in env vars provides Chinvex access
