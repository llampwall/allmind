import { Router } from 'express';
import { runCmd, config, chinvexRequest } from '../lib/utils.js';

export const servicesRoutes = Router();

/**
 * GET /api/services
 * List all services (pm2 processes + known endpoints)
 */
servicesRoutes.get('/', async (req, res, next) => {
  try {
    const services = [];

    // Get PM2 processes
    try {
      const pm2Result = await runCmd('pm2', ['jlist']);
      const pm2Processes = JSON.parse(pm2Result.stdout || '[]');

      for (const proc of pm2Processes) {
        services.push({
          id: `pm2-${proc.pm_id}`,
          name: proc.name,
          type: 'pm2',
          status: proc.pm2_env?.status || 'unknown',
          pid: proc.pid,
          pm2Id: proc.pm_id,
          uptime: proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : null,
          restarts: proc.pm2_env?.restart_time || 0,
          memory: proc.monit?.memory,
          cpu: proc.monit?.cpu,
          cwd: proc.pm2_env?.pm_cwd,
          script: proc.pm2_env?.pm_exec_path,
        });
      }
    } catch (err) {
      // PM2 not available
      services.push({
        id: 'pm2',
        name: 'PM2 Daemon',
        type: 'system',
        status: 'error',
        error: err.message,
      });
    }

    // Check Chinvex endpoint (production/remote API)
    try {
      const health = await chinvexRequest('/health');
      services.push({
        id: 'chinvex-api',
        name: 'Chinvex API',
        type: 'http',
        status: 'running',
        url: config.chinvexUrl,
        details: health,
      });
    } catch (err) {
      services.push({
        id: 'chinvex-api',
        name: 'Chinvex API',
        type: 'http',
        status: 'error',
        url: config.chinvexUrl,
        error: err.message,
      });
    }

    // Note: chinvex-tunnel (cloudflared) is already shown via PM2 processes above

    res.json({ services });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/services/:id/restart
 * Restart a PM2 service
 */
servicesRoutes.post('/:id/restart', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only allow pm2 process restarts for now
    if (!id.startsWith('pm2-')) {
      return res.status(400).json({ error: 'Only PM2 services can be restarted via API' });
    }

    const pm2Id = id.replace('pm2-', '');
    const result = await runCmd('pm2', ['restart', pm2Id]);

    res.json({
      id,
      action: 'restart',
      success: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/services/:id/stop
 * Stop a PM2 service
 */
servicesRoutes.post('/:id/stop', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.startsWith('pm2-')) {
      return res.status(400).json({ error: 'Only PM2 services can be stopped via API' });
    }

    const pm2Id = id.replace('pm2-', '');
    const result = await runCmd('pm2', ['stop', pm2Id]);

    res.json({
      id,
      action: 'stop',
      success: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/services/:id/start
 * Start a PM2 service
 */
servicesRoutes.post('/:id/start', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.startsWith('pm2-')) {
      return res.status(400).json({ error: 'Only PM2 services can be started via API' });
    }

    const pm2Id = id.replace('pm2-', '');
    const result = await runCmd('pm2', ['start', pm2Id]);

    res.json({
      id,
      action: 'start',
      success: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/services/:id/logs
 * Get recent logs for a PM2 service
 */
servicesRoutes.get('/:id/logs', async (req, res, next) => {
  try {
    const { id } = req.params;
    const lines = parseInt(req.query.lines) || 50;

    if (!id.startsWith('pm2-')) {
      return res.status(400).json({ error: 'Only PM2 logs available via API' });
    }

    const pm2Id = id.replace('pm2-', '');
    const result = await runCmd('pm2', ['logs', pm2Id, '--lines', String(lines), '--nostream']);

    res.json({
      id,
      lines,
      logs: result.stdout,
    });
  } catch (err) {
    next(err);
  }
});
