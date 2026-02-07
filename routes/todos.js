import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TODOS_FILE = join(__dirname, '..', 'data', 'todos.json');

export const todosRoutes = Router();

// Helper to read todos
async function readTodos() {
  try {
    const data = await readFile(TODOS_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // Backward compatibility: add missing fields to existing todos
    parsed.todos = parsed.todos.map(todo => ({
      ...todo,
      status: todo.status || 'open',
      notes: todo.notes !== undefined ? todo.notes : null,
      updated_at: todo.updated_at || todo.created_at,
    }));

    return parsed;
  } catch (err) {
    // If file doesn't exist or is corrupted, return empty structure
    return { todos: [] };
  }
}

// Helper to write todos
async function writeTodos(data) {
  await writeFile(TODOS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/todos - list todos
todosRoutes.get('/', async (req, res, next) => {
  try {
    const data = await readTodos();
    let todos = data.todos;

    // Filter by repo if specified
    if (req.query.repo) {
      todos = todos.filter(t => t.repo === req.query.repo);
    }

    // Filter completed unless explicitly requested
    if (req.query.include_completed !== 'true') {
      todos = todos.filter(t => !t.completed_at);
    }

    // Sort by priority (high > medium > low) then created_at desc
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    todos.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.json({ todos });
  } catch (err) {
    next(err);
  }
});

// POST /api/todos - create todo
todosRoutes.post('/', async (req, res, next) => {
  try {
    const { text, repo, priority } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required and must be non-empty' });
    }

    const data = await readTodos();
    const timestamp = new Date().toISOString();
    const newTodo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      repo: repo || null,
      priority: priority || 'medium',
      status: 'open',
      notes: null,
      created_at: timestamp,
      completed_at: null,
      updated_at: timestamp,
    };

    data.todos.push(newTodo);
    await writeTodos(data);

    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/todos/:id - update todo
todosRoutes.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const data = await readTodos();
    const todo = data.todos.find(t => t.id === id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Allow updating text, repo, priority, completed_at
    if (updates.text !== undefined) {
      if (typeof updates.text !== 'string' || !updates.text.trim()) {
        return res.status(400).json({ error: 'text must be non-empty' });
      }
      todo.text = updates.text.trim();
    }
    if (updates.repo !== undefined) todo.repo = updates.repo || null;
    if (updates.priority !== undefined) todo.priority = updates.priority;
    if (updates.completed_at !== undefined) todo.completed_at = updates.completed_at;

    await writeTodos(data);
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// PUT /api/todos/:id - update task status
todosRoutes.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status is provided and valid
    const validStatuses = ['open', 'in-progress', 'complete', 'failed'];
    if (!status) {
      return res.status(400).json({ error: 'status field is required' });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const data = await readTodos();
    const todo = data.todos.find(t => t.id === id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Update status
    todo.status = status;

    // Update notes: if provided, use it; if not provided, clear to null
    todo.notes = notes !== undefined ? notes : null;

    // Update completed_at based on status
    if (status === 'complete') {
      todo.completed_at = new Date().toISOString();
    } else {
      todo.completed_at = null;
    }

    // Update timestamp
    todo.updated_at = new Date().toISOString();

    await writeTodos(data);
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:id - hard delete
todosRoutes.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await readTodos();
    const index = data.todos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    data.todos.splice(index, 1);
    await writeTodos(data);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
