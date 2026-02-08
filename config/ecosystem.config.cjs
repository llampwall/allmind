// Central PM2 Ecosystem Config
// Manages all core services for the system
// Usage: pm2 start config/ecosystem.config.cjs

module.exports = {
  apps: [
    // AllMind - Universal control center and dashboard
    {
      name: 'allmind',
      script: 'server.js',
      cwd: 'P:\\software\\allmind',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: 5000,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        ALLMIND_PORT: 7780,
        STRAP_ROOT: 'P:\\software',
        STRAP_REGISTRY: 'P:\\software\\_strap\\registry.json',
        STRAP_CONFIG: 'P:\\software\\_strap\\config.json',
        SHIMS_DIR: 'P:\\software\\bin',
        CHINVEX_URL: 'https://chinvex.unkndlabs.com',
        PM2_PATH: 'pm2.cmd',
        PWSH_PATH: 'C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.5.4.0_x64__8wekyb3d8bbwe\\pwsh.exe',
        GIT_PATH: 'C:\\Program Files\\Git\\cmd\\git.exe',
      },
      error_file: 'P:\\software\\allmind\\logs\\error.log',
      out_file: 'P:\\software\\allmind\\logs\\out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      windowsHide: true,
    },

    // Chinvex Gateway - Python-based semantic search gateway
    {
      name: 'chinvex-gateway',
      script: 'P:\\software\\chinvex\\.venv\\Scripts\\pythonw.exe',
      args: '-m chinvex.cli gateway serve --port 7778',
      cwd: 'P:\\software\\chinvex',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: 10000,  // Longer for Python app with warmup
      restart_delay: 5000,
      error_file: 'P:\\software\\chinvex\\logs\\gateway-error.log',
      out_file: 'P:\\software\\chinvex\\logs\\gateway-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      windowsHide: true,
    },

    // Chinvex Tunnel - Cloudflared tunnel for external access
    {
      name: 'chinvex-tunnel',
      script: 'cloudflared',
      args: 'tunnel --protocol http2 run chinvex-gateway',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: 5000,
      restart_delay: 5000,
      cron_restart: '0 */4 * * *',  // Restart every 4 hours to refresh tunnel
      error_file: 'P:\\software\\chinvex\\logs\\tunnel-error.log',
      out_file: 'P:\\software\\chinvex\\logs\\tunnel-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      windowsHide: true,
    },

    // Chinvex Sync - File watcher daemon for auto-ingestion
    {
      name: 'chinvex-sync',
      script: 'P:\\software\\chinvex\\.venv\\Scripts\\pythonw.exe',  // windowless python (logs go to file)
      args: '-m chinvex.sync.process "C:\\Users\\Jordan\\.chinvex" "P:\\ai_memory\\contexts"',
      cwd: 'P:\\software\\chinvex',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: 5000,
      restart_delay: 5000,
      error_file: 'P:\\software\\chinvex\\logs\\sync-error.log',
      out_file: 'P:\\software\\chinvex\\logs\\sync-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      windowsHide: true,
    },

    // AllMind UI - Next.js frontend for AllMind dashboard
    {
      name: 'allmind-ui',
      script: 'node_modules/next/dist/bin/next',  
      args: 'start',
      cwd: 'P:\\software\\allmind\\ui',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: 5000,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: 'P:\\software\\allmind\\logs\\ui-error.log',
      out_file: 'P:\\software\\allmind\\logs\\ui-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      windowsHide: true,
    },
  ],
};
