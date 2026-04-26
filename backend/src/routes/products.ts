import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, category, price, stock, unit, lowStockThreshold } = req.body;
    const stmt = db.prepare(
      'INSERT INTO products (name, category, price, stock, unit, lowStockThreshold) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, category, price, stock, unit, lowStockThreshold);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    (req as any).io.emit('product:created', product);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, unit, lowStockThreshold } = req.body;
    const stmt = db.prepare(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, unit = ?, lowStockThreshold = ? WHERE id = ?'
    );
    stmt.run(name, category, price, stock, unit, lowStockThreshold, id);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    (req as any).io.emit('product:updated', product);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    (req as any).io.emit('product:deleted', { id: Number(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;

