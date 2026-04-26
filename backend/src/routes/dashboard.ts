import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/stats', (_req, res) => {
  try {
    const totalRevenue = (db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM sales').get() as any).total || 0;
    const totalExpenses = (db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get() as any).total || 0;
    const netProfit = totalRevenue - totalExpenses;

    const totalSales = (db.prepare('SELECT COUNT(*) as count FROM sales').get() as any).count || 0;

    const topSeller = db.prepare(`
      SELECT productName, SUM(total) as totalSales
      FROM sales
      GROUP BY productName
      ORDER BY totalSales DESC
      LIMIT 1
    `).get() as any;

    const lowStock = db.prepare(
      'SELECT * FROM products WHERE stock <= lowStockThreshold ORDER BY stock ASC'
    ).all();

    const recentSales = db.prepare(
      'SELECT * FROM sales ORDER BY createdAt DESC LIMIT 6'
    ).all();

    const weeklyRevenue = db.prepare(`
      SELECT date, SUM(total) as revenue
      FROM sales
      WHERE date >= date('now', '-7 days')
      GROUP BY date
      ORDER BY date ASC
    `).all();

    const expensesByCategory = db.prepare(`
      SELECT category, SUM(amount) as value
      FROM expenses
      GROUP BY category
    `).all();

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      totalSales,
      topSeller: topSeller || null,
      lowStock,
      recentSales,
      weeklyRevenue,
      expensesByCategory,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;

