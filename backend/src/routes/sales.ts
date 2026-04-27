import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;
    let query = 'SELECT * FROM sales WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    if (productId) {
      query += ' AND productId = ?';
      params.push(productId);
    }

    query += ' ORDER BY createdAt DESC';
    const sales = db.prepare(query).all(...params);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const { productId, productName, quantity, price, total, date } = req.body;

    // Check stock availability
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Only ${product.stock} ${product.unit} available.` });
    }
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const stmt = db.prepare(
      'INSERT INTO sales (productId, productName, quantity, price, total, date) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(productId, productName, quantity, price, total, date);

    // Deduct stock
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantity, productId);

    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(result.lastInsertRowid);
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    (req as any).io.emit('sale:created', sale);
    (req as any).io.emit('product:updated', updatedProduct);

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /:id — Edit a sale (restores old stock, deducts new stock)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { productId, productName, quantity, price, total, date } = req.body;

    const oldSale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as any;
    if (!oldSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Restore old stock
    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(oldSale.quantity, oldSale.productId);

    // Check if new quantity is available
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (updatedProduct.stock < quantity) {
      // Rollback: restore old stock back
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(oldSale.quantity, oldSale.productId);
      return res.status(400).json({ error: `Insufficient stock. Only ${updatedProduct.stock} ${updatedProduct.unit} available.` });
    }

    // Update sale
    db.prepare(
      'UPDATE sales SET productId = ?, productName = ?, quantity = ?, price = ?, total = ?, date = ? WHERE id = ?'
    ).run(productId, productName, quantity, price, total, date, id);

    // Deduct new stock
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantity, productId);

    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    const finalProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    const oldProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(oldSale.productId);

    (req as any).io.emit('sale:updated', sale);
    (req as any).io.emit('product:updated', finalProduct);
    if (oldSale.productId !== productId) {
      (req as any).io.emit('product:updated', oldProduct);
    }

    res.json(sale);
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

