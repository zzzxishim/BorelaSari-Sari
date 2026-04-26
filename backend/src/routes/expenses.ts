import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY createdAt DESC').all();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const { category, amount, description, date } = req.body;
    const stmt = db.prepare(
      'INSERT INTO expenses (category, amount, description, date) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(category, amount, description, date);
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    (req as any).io.emit('expense:created', expense);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    (req as any).io.emit('expense:deleted', { id: Number(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;

