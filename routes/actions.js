import { Router } from 'express';
import { spawn } from 'child_process';
import { join } from 'path';
import { config, exists, runCmd, runPwsh } from '../lib/utils.js';

export const actionsRoutes = Router();

/**
 * POST /api/actions/open-claude
 * Open Claude Code in a repo directory
 */
actionsRoutes.post('/open-claude', async (req, res, next) => {
  try {
    const { repo, path: customPath } = req.body;
    
    let targetPath;
    if (customPath) {
      targetPath = customPath;
    } else if (repo) {
      targetPath = join(config.strapRoot, repo);
    } else {
      return res.status(400).json({ error: 'Must provide repo or path' });
    }

    if (!await exists(targetPath)) {
      return res.status(404).json({ error: 'Path not found', path: targetPath });
    }

    // Try to launch claude
    // Claude Code CLI: `claude` or via wezterm for a new terminal
    try {
      // Option 1: Direct claude command (if installed globally)
      const proc = spawn('claude', [], {
        cwd: targetPath,
        detached: true,
        stdio: 'ignore',
        shell: true,
      });
      proc.unref();

      res.json({
        action: 'open-claude',
        path: targetPath,
        success: true,
        method: 'claude CLI',
      });
    } catch (err) {
      // Option 2: Open in wezterm with claude
      try {
        const proc = spawn('wezterm', ['start', '--cwd', targetPath, '--', 'claude'], {
          detached: true,
          stdio: 'ignore',
          shell: true,
        });
        proc.unref();

        res.json({
          action: 'open-claude',
          path: targetPath,
          success: true,
          method: 'wezterm + claude',
        });
      } catch (err2) {
        res.status(500).json({ 
          error: 'Could not launch Claude', 
          details: [err.message, err2.message],
        });
      }
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/actions/open-vscode
 * Open VS Code in a repo directory
 */
actionsRoutes.post('/open-vscode', async (req, res, next) => {
  try {
    const { repo, path: customPath } = req.body;
    
    let targetPath;
    if (customPath) {
      targetPath = customPath;
    } else if (repo) {
      targetPath = join(config.strapRoot, repo);
    } else {
      return res.status(400).json({ error: 'Must provide repo or path' });
    }

    if (!await exists(targetPath)) {
      return res.status(404).json({ error: 'Path not found', path: targetPath });
    }

    const proc = spawn('code', [targetPath], {
      detached: true,
      stdio: 'ignore',
      shell: true,
    });
    proc.unref();

    res.json({
      action: 'open-vscode',
      path: targetPath,
      success: true,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/actions/open-terminal
 * Open a terminal in a repo directory
 */
actionsRoutes.post('/open-terminal', async (req, res, next) => {
  try {
    const { repo, path: customPath, terminal = 'wezterm' } = req.body;
    
    let targetPath;
    if (customPath) {
      targetPath = customPath;
    } else if (repo) {
      targetPath = join(config.strapRoot, repo);
    } else {
      return res.status(400).json({ error: 'Must provide repo or path' });
    }

    if (!await exists(targetPath)) {
      return res.status(404).json({ error: 'Path not found', path: targetPath });
    }

    let cmd, args;
    switch (terminal) {
      case 'wezterm':
        cmd = 'wezterm';
        args = ['start', '--cwd', targetPath];
        break;
      case 'wt':
      case 'windows-terminal':
        cmd = 'wt';
        args = ['-d', targetPath];
        break;
      default:
        cmd = 'pwsh';
        args = ['-NoExit', '-WorkingDirectory', targetPath];
    }

    const proc = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore',
      shell: true,
    });
    proc.unref();

    res.json({
      action: 'open-terminal',
      path: targetPath,
      terminal,
      success: true,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/actions/run-brief
 * Run chinvex brief for a context
 */
actionsRoutes.post('/run-brief', async (req, res, next) => {
  try {
    const { context } = req.body;
    
    if (!context) {
      return res.status(400).json({ error: 'Must provide context' });
    }

    const result = await runCmd('chinvex', ['brief', '--context', context]);

    res.json({
      action: 'run-brief',
      context,
      exitCode: result.code,
      success: result.code === 0,
      output: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/actions/run-ingest
 * Run chinvex ingest for a context
 */
actionsRoutes.post('/run-ingest', async (req, res, next) => {
  try {
    const { context, repo } = req.body;
    
    if (!context) {
      return res.status(400).json({ error: 'Must provide context' });
    }

    const args = ['ingest', '--context', context];
    if (repo) {
      args.push('--repo', repo);
    }

    const result = await runCmd('chinvex', args);

    res.json({
      action: 'run-ingest',
      context,
      repo,
      exitCode: result.code,
      success: result.code === 0,
      output: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/actions/run-digest
 * Run chinvex digest for a context
 */
actionsRoutes.post('/run-digest', async (req, res, next) => {
  try {
    const { context } = req.body;
    
    if (!context) {
      return res.status(400).json({ error: 'Must provide context' });
    }

    const result = await runCmd('chinvex', ['digest', '--context', context]);

    res.json({
      action: 'run-digest',
      context,
      exitCode: result.code,
      success: result.code === 0,
      output: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/actions/strap-doctor
 * Run strap doctor
 */
actionsRoutes.post('/strap-doctor', async (req, res, next) => {
  try {
    const result = await runPwsh('strap doctor', { timeout: 30000 });

    res.json({
      action: 'strap-doctor',
      exitCode: result.code,
      success: result.code === 0,
      output: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});
