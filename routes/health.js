import { Router } from 'express';
import { runPwsh, runCmd, runPm2, config, exists, chinvexRequest } from '../lib/utils.js';
import os from 'os';

export const healthRoutes = Router();

/**
 * GET /api/health
 * Overall system health: host info, service statuses
 */
healthRoutes.get('/', async (req, res, next) => {
  try {
    const services = [];

    // Check Chinvex
    try {
      const chinvexHealth = await chinvexRequest('/health');
      services.push({
        id: 'chinvex',
        name: 'Chinvex API',
        type: 'chinvex',
        status: 'online',
        details: chinvexHealth,
      });
    } catch (err) {
      services.push({
        id: 'chinvex',
        name: 'Chinvex API',
        type: 'chinvex',
        status: 'error',
        error: err.message,
      });
    }

    // Check PM2
    try {
      const pm2Result = await runPm2(['jlist']);
      const pm2Processes = JSON.parse(pm2Result.stdout || '[]');
      services.push({
        id: 'pm2',
        name: 'PM2 Daemon',
        type: 'pm2',
        status: 'online',
        details: { processCount: pm2Processes.length },
      });
    } catch (err) {
      services.push({
        id: 'pm2',
        name: 'PM2 Daemon',
        type: 'pm2',
        status: 'error',
        error: err.message,
      });
    }

    // Check strap registry exists
    const registryExists = await exists(config.strapRegistry);
    services.push({
      id: 'strap',
      name: 'Strap Registry',
      type: 'strap',
      status: registryExists ? 'ok' : 'missing',
      details: { path: config.strapRegistry },
    });

    // Check shims directory
    const shimsExists = await exists(config.shimsDir);
    services.push({
      id: 'shims',
      name: 'Shims Directory',
      type: 'strap',
      status: shimsExists ? 'ok' : 'missing',
      details: { path: config.shimsDir },
    });

    res.json({
      status: 'ok',
      host: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
      },
      config: {
        strapRoot: config.strapRoot,
        chinvexUrl: config.chinvexUrl,
      },
      services,
    });
  } catch (err) {
    next(err);
  }
});
