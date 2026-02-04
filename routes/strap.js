import { Router } from 'express';
import { readFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { config, readJson, exists, runPwsh } from '../lib/utils.js';

export const strapRoutes = Router();

/**
 * GET /api/strap/registry
 * Full strap registry with repos and shims
 */
strapRoutes.get('/registry', async (req, res, next) => {
  try {
    const registry = await readJson(config.strapRegistry);
    if (!registry) {
      return res.status(404).json({ error: 'Registry not found', path: config.strapRegistry });
    }
    res.json(registry);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/strap/shims
 * List all shims with their targets and detect collisions
 */
strapRoutes.get('/shims', async (req, res, next) => {
  try {
    const shims = [];
    const collisions = [];
    const shimsDir = config.shimsDir;

    if (!await exists(shimsDir)) {
      return res.json({ shims: [], collisions: [], error: 'Shims directory not found' });
    }

    // Read shim files
    const files = await readdir(shimsDir);
    const ps1Files = files.filter(f => f.endsWith('.ps1'));

    for (const file of ps1Files) {
      const name = basename(file, '.ps1');
      const ps1Path = join(shimsDir, file);
      const cmdPath = join(shimsDir, `${name}.cmd`);

      try {
        const content = await readFile(ps1Path, 'utf-8');
        
        // Parse shim metadata from comments
        const repoMatch = content.match(/# Repo: ([^\s|]+)/);
        const typeMatch = content.match(/# Type: (\w+)/);
        const venvMatch = content.match(/# Venv: ([^\s]+)/);
        const exeMatch = content.match(/\$exe\s*=\s*"([^"]+)"/);

        shims.push({
          name,
          ps1Path,
          cmdExists: await exists(cmdPath),
          repo: repoMatch?.[1] || 'unknown',
          type: typeMatch?.[1] || 'unknown',
          venv: venvMatch?.[1] || null,
          exe: exeMatch?.[1] || null,
        });
      } catch (err) {
        shims.push({
          name,
          ps1Path,
          error: err.message,
        });
      }
    }

    // Detect collisions (same shim name, different repos)
    const registry = await readJson(config.strapRegistry);
    if (registry?.repos) {
      const shimOwners = new Map();
      for (const repo of registry.repos) {
        for (const shim of repo.shims || []) {
          const existing = shimOwners.get(shim.name);
          if (existing && existing !== repo.name) {
            collisions.push({
              shim: shim.name,
              owners: [existing, repo.name],
            });
          }
          shimOwners.set(shim.name, repo.name);
        }
      }
    }

    // Check for orphans (on disk but not in registry)
    const registeredShims = new Set();
    if (registry?.repos) {
      for (const repo of registry.repos) {
        for (const shim of repo.shims || []) {
          registeredShims.add(shim.name);
        }
      }
    }

    const orphans = shims
      .filter(s => !registeredShims.has(s.name))
      .map(s => s.name);

    res.json({ shims, collisions, orphans });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/strap/config
 * Strap configuration
 */
strapRoutes.get('/config', async (req, res, next) => {
  try {
    const strapConfig = await readJson(config.strapConfig);
    res.json(strapConfig || { error: 'Config not found' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/strap/doctor
 * Run strap doctor checks
 */
strapRoutes.get('/doctor', async (req, res, next) => {
  try {
    const checks = [];

    // SHIM001: Shims directory exists and on PATH
    const shimsExists = await exists(config.shimsDir);
    const pathEntries = (process.env.PATH || '').split(';').map(p => p.toLowerCase().replace(/\\+$/, ''));
    const shimsOnPath = pathEntries.includes(config.shimsDir.toLowerCase().replace(/\\+$/, ''));
    
    checks.push({
      id: 'SHIM001',
      name: 'Shims directory on PATH',
      passed: shimsExists && shimsOnPath,
      severity: 'critical',
      details: {
        exists: shimsExists,
        onPath: shimsOnPath,
        path: config.shimsDir,
      },
    });

    // SHIM002: Registry exists
    const registryExists = await exists(config.strapRegistry);
    checks.push({
      id: 'SHIM002',
      name: 'Strap registry exists',
      passed: registryExists,
      severity: 'error',
      details: { path: config.strapRegistry },
    });

    // Check shim/cmd pairs
    if (shimsExists) {
      const files = await readdir(config.shimsDir);
      const ps1Files = files.filter(f => f.endsWith('.ps1'));
      
      for (const file of ps1Files) {
        const name = basename(file, '.ps1');
        const cmdPath = join(config.shimsDir, `${name}.cmd`);
        const cmdExists = await exists(cmdPath);
        
        if (!cmdExists) {
          checks.push({
            id: 'SHIM008',
            name: `Launcher pair: ${name}`,
            passed: false,
            severity: 'warning',
            details: { missing: `${name}.cmd` },
          });
        }
      }
    }

    const passed = checks.filter(c => c.passed).length;
    const failed = checks.filter(c => !c.passed).length;

    res.json({
      summary: { passed, failed, total: checks.length },
      checks,
    });
  } catch (err) {
    next(err);
  }
});
