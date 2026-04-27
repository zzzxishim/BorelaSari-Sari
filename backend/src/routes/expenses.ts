import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = 'SELECT * FROM expenses';
    const params: any[] = [];

    if (startDate && endDate) {
      sql += ' WHERE date >= ? AND date <= ?';
      params.push(startDate as string, endDate as string);
    } else if (startDate) {
      sql += ' WHERE date >= ?';
      params.push(startDate as string);
    } else if (endDate) {
      sql += ' WHERE date <= ?';
      params.push(endDate as string);
    }

    sql += ' ORDER BY createdAt DESC';
    const expenses = db.prepare(sql).all(...params);
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

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, description, date } = req.body;
    const stmt = db.prepare(
      'UPDATE expenses SET category = ?, amount = ?, description = ?, date = ? WHERE id = ?'
    );
    stmt.run(category, amount, description, date, id);
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    (req as any).io.emit('expense:updated', expense);
    res.json(expense);
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

