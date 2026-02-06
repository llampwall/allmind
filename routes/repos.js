import { Router } from 'express';
import { join } from 'path';
import { config, listDirs, exists, getGitStatus, readJson, runCmd, getChinvexStatus } from '../lib/utils.js';

export const reposRoutes = Router();

// Cache for expensive repo scanning
let reposCache = {
  data: null,
  lastUpdated: null,
  isRefreshing: false,
};

/**
 * Refresh repos cache (runs in background)
 */
async function refreshReposCache() {
  if (reposCache.isRefreshing) {
    console.log('Repo cache refresh already in progress, skipping...');
    return;
  }

  reposCache.isRefreshing = true;
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting repo cache refresh...`);

  try {
    const repos = [];

    // Read registry as source of truth
    const registry = await readJson(config.strapRegistry);
    if (!registry?.repos) {
      console.warn('No repos found in registry.json');
      reposCache.data = { repos: [], root: config.strapRoot, count: 0 };
      reposCache.lastUpdated = new Date().toISOString();
      return;
    }

    // Process each registry entry
    for (const regEntry of registry.repos) {
      const repoPath = regEntry.repoPath || join(config.strapRoot, regEntry.name);
      const repoExists = await exists(repoPath);

      // Build repo object from registry entry
      // Handle both array and object formats for shims
      const shimCount = Array.isArray(regEntry.shims) ? regEntry.shims.length :
                       (regEntry.shims && typeof regEntry.shims === 'object' ? 1 : 0);

      const repo = {
        name: regEntry.name,
        id: regEntry.id,
        status: regEntry.status,
        chinvexDepth: regEntry.chinvex_depth,
        tags: regEntry.tags || [],
        path: repoPath,
        exists: repoExists,
        shimCount,
        createdAt: regEntry.created_at,
        updatedAt: regEntry.updated_at,
        setup: regEntry.setup,
      };

      // Enrich with git status if repo exists and has .git
      if (repoExists) {
        const gitDir = join(repoPath, '.git');
        if (await exists(gitDir)) {
          repo.git = await getGitStatus(repoPath);

          // Get recent commits for Heads Up panel
          try {
            const logResult = await runCmd(config.gitPath, ['log', '--format=%H|%an|%ae|%at|%s', '-10'], { cwd: repoPath });
            repo.recentCommits = logResult.stdout.split('\n').filter(Boolean).map(line => {
              const [hash, author, email, timestamp, ...msgParts] = line.split('|');
              return {
                hash,
                author,
                email,
                date: new Date(parseInt(timestamp) * 1000).toISOString(),
                message: msgParts.join('|')
              };
            });
          } catch (err) {
            console.error(`[git log error for ${regEntry.name}]:`, err.message);
            repo.recentCommits = [];
          }
        } else {
          repo.git = { error: 'Not a git repository' };
          repo.recentCommits = [];
        }

        // Check for special files
        const hasClaudeProject = await exists(join(repoPath, '.claude'));
        const hasVenv = await exists(join(repoPath, '.venv')) || await exists(join(repoPath, 'venv'));
        const hasPackageJson = await exists(join(repoPath, 'package.json'));
        const hasPyproject = await exists(join(repoPath, 'pyproject.toml'));
        const hasMemory = await exists(join(repoPath, 'docs', 'memory', 'STATE.md'));

        repo.tools = {
          claudeProject: hasClaudeProject,
          venv: hasVenv,
          node: hasPackageJson,
          python: hasPyproject,
          memory: hasMemory,
        };

        // Check for test scripts
        let testCommand = null;
        if (hasPackageJson) {
          const pkg = await readJson(join(repoPath, 'package.json'));
          if (pkg?.scripts?.test) testCommand = 'npm test';
        }
        if (hasPyproject || await exists(join(repoPath, 'tests'))) {
          testCommand = testCommand || 'pytest';
        }
        repo.testCommand = testCommand;

        // Get Chinvex ingestion status
        repo.chinvexStatus = await getChinvexStatus(repoPath);
      } else {
        // Repo doesn't exist on disk yet
        repo.git = { error: 'Repository path does not exist' };
        repo.recentCommits = [];
        repo.tools = {
          claudeProject: false,
          venv: false,
          node: false,
          python: false,
          memory: false,
        };
      }

      repos.push(repo);
    }

    // Update cache
    reposCache.data = {
      repos,
      root: config.strapRoot,
      count: repos.length,
    };
    reposCache.lastUpdated = new Date().toISOString();

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Repo cache refreshed: ${repos.length} repos in ${duration}ms`);
  } catch (err) {
    console.error('Error refreshing repo cache:', err);
  } finally {
    reposCache.isRefreshing = false;
  }
}

// Initialize cache on startup
refreshReposCache();

// Background refresh every 30 seconds
setInterval(refreshReposCache, 30000);

/**
 * GET /api/repos
 * List all repos under strap root with git status (cached)
 */
reposRoutes.get('/', async (req, res, next) => {
  try {
    // Force refresh if requested
    if (req.query.refresh === 'true') {
      await refreshReposCache();
    }

    // Return cached data
    if (reposCache.data) {
      res.json({
        ...reposCache.data,
        cached: true,
        lastUpdated: reposCache.lastUpdated,
      });
    } else {
      // Cache not ready yet (startup), return empty with retry hint
      res.json({
        repos: [],
        root: config.strapRoot,
        count: 0,
        cached: false,
        message: 'Cache initializing, try again in a moment',
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/repos/:name
 * Get detailed info for a specific repo
 */
reposRoutes.get('/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const repoPath = join(config.strapRoot, name);

    if (!await exists(repoPath)) {
      return res.status(404).json({ error: 'Repo not found', name });
    }

    // Try to find repo in cache first for registry data
    const cachedRepo = reposCache.data?.repos.find(r => r.name === name);

    const gitStatus = await getGitStatus(repoPath);

    // Get recent commits with more details
    let recentCommits = [];
    try {
      const logResult = await runCmd(config.gitPath, ['log', '--format=%H|%an|%ae|%at|%s', '-10'], { cwd: repoPath });
      recentCommits = logResult.stdout.split('\n').filter(Boolean).map(line => {
        const [hash, author, email, timestamp, ...msgParts] = line.split('|');
        return {
          hash,
          author,
          email,
          date: new Date(parseInt(timestamp) * 1000).toISOString(),
          message: msgParts.join('|')
        };
      });
    } catch (err) {
      console.error(`[git log error for ${name}]:`, err.message);
    }

    // Read memory files if they exist
    let memory = null;
    const memoryPath = join(repoPath, 'docs', 'memory');
    if (await exists(memoryPath)) {
      const { readFile } = await import('fs/promises');
      memory = {};
      try { memory.state = await readFile(join(memoryPath, 'STATE.md'), 'utf-8'); } catch {}
      try { memory.constraints = await readFile(join(memoryPath, 'CONSTRAINTS.md'), 'utf-8'); } catch {}
    }

    // Check for special files
    const hasClaudeProject = await exists(join(repoPath, '.claude'));
    const hasVenv = await exists(join(repoPath, '.venv')) || await exists(join(repoPath, 'venv'));
    const hasPackageJson = await exists(join(repoPath, 'package.json'));
    const hasPyproject = await exists(join(repoPath, 'pyproject.toml'));
    const hasMemory = await exists(join(repoPath, 'docs', 'memory', 'STATE.md'));

    const tools = {
      claudeProject: hasClaudeProject,
      venv: hasVenv,
      node: hasPackageJson,
      python: hasPyproject,
      memory: hasMemory,
    };

    // Check for test scripts
    let testCommand = null;
    if (hasPackageJson) {
      const pkg = await readJson(join(repoPath, 'package.json'));
      if (pkg?.scripts?.test) testCommand = 'npm test';
    }
    if (hasPyproject || await exists(join(repoPath, 'tests'))) {
      testCommand = testCommand || 'pytest';
    }

    // Get Chinvex status
    const chinvexStatus = await getChinvexStatus(repoPath);

    res.json({
      name,
      path: repoPath,
      git: gitStatus,
      recentCommits,
      memory,
      tools,
      testCommand,
      chinvexStatus,
      setup: cachedRepo?.setup,
      strapEntry: cachedRepo ? {
        status: cachedRepo.status,
        chinvexDepth: cachedRepo.chinvexDepth,
        tags: cachedRepo.tags,
        shimCount: cachedRepo.shimCount,
        id: cachedRepo.id,
      } : null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/repos/:name/test
 * Run tests for a repo
 */
reposRoutes.post('/:name/test', async (req, res, next) => {
  try {
    const { name } = req.params;
    const repoPath = join(config.strapRoot, name);

    if (!await exists(repoPath)) {
      return res.status(404).json({ error: 'Repo not found', name });
    }

    // Determine test command
    let cmd, args;
    const hasPackageJson = await exists(join(repoPath, 'package.json'));
    const hasPytest = await exists(join(repoPath, 'tests')) || await exists(join(repoPath, 'pyproject.toml'));

    if (req.body?.command) {
      // Custom command from request
      const parts = req.body.command.split(' ');
      cmd = parts[0];
      args = parts.slice(1);
    } else if (hasPackageJson) {
      cmd = 'npm';
      args = ['test'];
    } else if (hasPytest) {
      cmd = 'pytest';
      args = ['-v'];
    } else {
      return res.status(400).json({ error: 'No test command found for repo' });
    }

    const result = await runCmd(cmd, args, { cwd: repoPath });

    res.json({
      name,
      command: `${cmd} ${args.join(' ')}`,
      exitCode: result.code,
      passed: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/repos/:name/configure
 * Update registry metadata for a repo via strap configure
 */
reposRoutes.post('/:name/configure', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { status, depth, tags } = req.body;

    // Build strap configure command
    const args = ['configure', name];

    if (status) args.push('--status', status);
    if (depth !== undefined) args.push('--depth', depth);
    if (tags !== undefined) {
      // Tags should be comma-separated string
      args.push('--tags', Array.isArray(tags) ? tags.join(',') : tags);
    }

    // Add flags for API usage
    args.push('--yes', '--json');

    console.log(`[configure] Running: strap ${args.join(' ')}`);
    const result = await runCmd('strap', args, { cwd: config.strapRoot });
    console.log(`[configure] Exit code: ${result.code}`);
    console.log(`[configure] Stdout:`, result.stdout);
    console.log(`[configure] Stderr:`, result.stderr);

    if (result.code !== 0) {
      return res.status(400).json({
        error: 'Configuration failed',
        stderr: result.stderr,
        stdout: result.stdout,
        exitCode: result.code,
      });
    }

    // Parse JSON response (may have warnings/ANSI codes before the JSON)
    let response;
    try {
      // Find the JSON object in stdout (starts with '{')
      const jsonStart = result.stdout.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON object found in output');
      }
      const jsonStr = result.stdout.substring(jsonStart);
      response = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[configure] JSON parse error:', parseErr.message);
      return res.status(500).json({
        error: 'Failed to parse strap configure response',
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    // Trigger cache refresh and wait for it
    await refreshReposCache();

    res.json(response);
  } catch (err) {
    console.error('[configure] Unexpected error:', err);
    next(err);
  }
});

/**
 * POST /api/repos/:name/git
 * Run git command on repo
 */
reposRoutes.post('/:name/git', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { args } = req.body;
    const repoPath = join(config.strapRoot, name);

    if (!await exists(repoPath)) {
      return res.status(404).json({ error: 'Repo not found', name });
    }

    // Whitelist safe git commands
    const safeCommands = ['status', 'log', 'branch', 'diff', 'fetch', 'pull', 'push'];
    const gitCmd = args?.[0];

    if (!safeCommands.includes(gitCmd)) {
      return res.status(400).json({
        error: 'Git command not allowed',
        allowed: safeCommands,
      });
    }

    const result = await runCmd(config.gitPath, args, { cwd: repoPath });

    res.json({
      command: `git ${args.join(' ')}`,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    next(err);
  }
});
