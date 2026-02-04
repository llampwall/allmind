import { Router } from 'express';
import { config, chinvexRequest } from '../lib/utils.js';

export const chinvexRoutes = Router();

/**
 * GET /api/chinvex/health
 * Chinvex health check
 */
chinvexRoutes.get('/health', async (req, res, next) => {
  try {
    const health = await chinvexRequest('/health');
    res.json(health);
  } catch (err) {
    res.status(502).json({ error: err.message, upstream: config.chinvexUrl });
  }
});

/**
 * GET /api/chinvex/contexts
 * List Chinvex contexts
 */
chinvexRoutes.get('/contexts', async (req, res, next) => {
  try {
    const data = await chinvexRequest('/v1/contexts');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chinvex/search
 * Search a Chinvex context
 */
chinvexRoutes.post('/search', async (req, res, next) => {
  try {
    const { context, contexts, query, k = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const payload = { query, k };
    if (context) payload.context = context;
    if (contexts) payload.contexts = contexts;

    const data = await chinvexRequest('/v1/search', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chinvex/evidence
 * Get grounded evidence from Chinvex
 */
chinvexRoutes.post('/evidence', async (req, res, next) => {
  try {
    const { context, contexts, query, k = 8 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const payload = { query, k };
    if (context) payload.context = context;
    if (contexts) payload.contexts = contexts;

    const data = await chinvexRequest('/v1/evidence', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chinvex/chunks
 * Get specific chunks by ID
 */
chinvexRoutes.post('/chunks', async (req, res, next) => {
  try {
    const { context, chunk_ids } = req.body;

    if (!context || !chunk_ids) {
      return res.status(400).json({ error: 'context and chunk_ids are required' });
    }

    const data = await chinvexRequest('/v1/chunks', {
      method: 'POST',
      body: JSON.stringify({ context, chunk_ids }),
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});
