import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const sales = db.prepare('SELECT * FROM sales ORDER BY createdAt DESC').all();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const { productId, productName, quantity, price, total, date } = req.body;
    const stmt = db.prepare(
      'INSERT INTO sales (productId, productName, quantity, price, total, date) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(productId, productName, quantity, price, total, date);

    // Deduct stock
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantity, productId);

    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(result.lastInsertRowid);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    (req as any).io.emit('sale:created', sale);
    (req as any).io.emit('product:updated', product);

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as any;
    if (sale) {
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(sale.quantity, sale.productId);
      db.prepare('DELETE FROM sales WHERE id = ?').run(id);
      (req as any).io.emit('sale:deleted', { id: Number(id) });
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(sale.productId);
      (req as any).io.emit('product:updated', product);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;

