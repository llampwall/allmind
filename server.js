import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { healthRoutes } from './routes/health.js';
import { strapRoutes } from './routes/strap.js';
import { reposRoutes } from './routes/repos.js';
import { servicesRoutes } from './routes/services.js';
import { actionsRoutes } from './routes/actions.js';
import { chinvexRoutes } from './routes/chinvex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.ALLMIND_PORT || process.env.C3_PORT || 7780;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/strap', strapRoutes);
app.use('/api/repos', reposRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/chinvex', chinvexRoutes);

// API index (for debugging)
app.get('/api', (req, res) => {
  res.json({
    name: 'AllMind',
    version: '0.1.0',
    endpoints: [
      'GET  /api/health',
      'GET  /api/strap/registry',
      'GET  /api/strap/shims',
      'GET  /api/strap/doctor',
      'GET  /api/repos',
      'GET  /api/repos/:name',
      'POST /api/repos/:name/test',
      'GET  /api/services',
      'POST /api/services/:id/restart',
      'POST /api/actions/open-claude',
      'POST /api/actions/open-vscode',
      'GET  /api/chinvex/contexts',
      'POST /api/chinvex/search',
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AllMind running on http://0.0.0.0:${PORT}`);
  console.log(`Accessible via localhost:${PORT} or tailscale IP`);
  console.log(`Strap root: ${process.env.STRAP_ROOT || 'P:\\software'}`);
});
