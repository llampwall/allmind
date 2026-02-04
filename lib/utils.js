import { spawn } from 'child_process';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

// Config - customize these for your machine
export const config = {
  strapRoot: process.env.STRAP_ROOT || 'P:\\software',
  strapRegistry: process.env.STRAP_REGISTRY || 'P:\\software\\_strap\\registry.json',
  strapConfig: process.env.STRAP_CONFIG || 'P:\\software\\_strap\\config.json',
  shimsDir: process.env.SHIMS_DIR || 'P:\\software\\bin',
  chinvexUrl: process.env.CHINVEX_URL || 'https://chinvex.unkndlabs.com',
  chinvexToken: process.env.CHINVEX_API_TOKEN || '',
  pm2Path: process.env.PM2_PATH || 'pm2',
  pwshPath: process.env.PWSH_PATH || 'C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.5.4.0_x64__8wekyb3d8bbwe\\pwsh.exe',
};

/**
 * Run a PowerShell command and return stdout
 */
export async function runPwsh(command, options = {}) {
  return new Promise((resolve, reject) => {
    const args = ['-NoLogo', '-NoProfile', '-Command', command];
    const proc = spawn(config.pwshPath, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && !options.ignoreExitCode) {
        reject(new Error(`PowerShell exited with code ${code}: ${stderr || stdout}`));
      } else {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
      }
    });

    proc.on('error', reject);

    // Timeout
    if (options.timeout) {
      setTimeout(() => {
        proc.kill();
        reject(new Error('Command timed out'));
      }, options.timeout);
    }
  });
}

/**
 * Run a simple command (not PowerShell)
 */
export async function runCmd(cmd, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      shell: true,
      windowsHide: true,  // Prevent terminal windows from flashing on Windows
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
    });

    proc.on('error', reject);
  });
}

/**
 * Read JSON file safely
 */
export async function readJson(path) {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/**
 * Check if path exists
 */
export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * List directories in a path
 */
export async function listDirs(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return [];
  }
}

/**
 * Get git status for a repo
 */
export async function getGitStatus(repoPath) {
  try {
    const [statusResult, branchResult, remoteResult] = await Promise.all([
      runCmd('git', ['status', '--porcelain'], { cwd: repoPath }),
      runCmd('git', ['branch', '--show-current'], { cwd: repoPath }),
      runCmd('git', ['remote', '-v'], { cwd: repoPath }),
    ]);

    const dirty = statusResult.stdout.length > 0;
    const branch = branchResult.stdout || 'unknown';
    const remotes = remoteResult.stdout.split('\n').filter(Boolean);

    // Check ahead/behind
    let ahead = 0, behind = 0;
    try {
      const abResult = await runCmd('git', ['rev-list', '--left-right', '--count', `origin/${branch}...HEAD`], { cwd: repoPath });
      const [b, a] = abResult.stdout.split('\t').map(Number);
      ahead = a || 0;
      behind = b || 0;
    } catch { /* no remote tracking */ }

    return { dirty, branch, remotes, ahead, behind, status: dirty ? 'dirty' : 'clean' };
  } catch (err) {
    return { error: err.message, status: 'error' };
  }
}

/**
 * Make a request to Chinvex API
 */
export async function chinvexRequest(path, options = {}) {
  const url = `${config.chinvexUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (config.chinvexToken) {
    headers['Authorization'] = `Bearer ${config.chinvexToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    throw new Error(`Chinvex API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
