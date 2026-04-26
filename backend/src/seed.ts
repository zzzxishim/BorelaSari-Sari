import { db, initDb } from './db.js';

initDb();

const products = [
  { name: 'Rice (50kg sack)', category: 'Staples', price: 2500, stock: 15, unit: 'sack', lowStockThreshold: 5 },
  { name: 'Eggs (tray)', category: 'Fresh', price: 240, stock: 8, unit: 'tray', lowStockThreshold: 3 },
  { name: 'Frozen Chicken', category: 'Frozen', price: 180, stock: 25, unit: 'kg', lowStockThreshold: 10 },
  { name: 'Hotdogs', category: 'Frozen', price: 120, stock: 30, unit: 'pack', lowStockThreshold: 10 },
  { name: 'Soft Drinks (Coke)', category: 'Beverages', price: 45, stock: 60, unit: 'bottle', lowStockThreshold: 20 },
  { name: 'Charcoal', category: 'Supplies', price: 150, stock: 12, unit: 'sack', lowStockThreshold: 5 },
  { name: 'Kangkong', category: 'Vegetables', price: 30, stock: 5, unit: 'bundle', lowStockThreshold: 2 },
  { name: 'Spices Mix', category: 'Spices', price: 15, stock: 40, unit: 'pack', lowStockThreshold: 10 },
  { name: 'Bear Brand', category: 'Powdered Drinks', price: 35, unit: 'can', stock: 50, lowStockThreshold: 15 },
  { name: 'Ensure', category: 'Powdered Drinks', price: 75, stock: 20, unit: 'can', lowStockThreshold: 8 },
  { name: 'Milo', category: 'Powdered Drinks', price: 180, stock: 25, unit: 'pack', lowStockThreshold: 10 },
  { name: 'Canned Sardines', category: 'Canned Goods', price: 28, stock: 80, unit: 'can', lowStockThreshold: 30 },
];

const sales = [
  { productId: 1, productName: 'Rice (50kg sack)', quantity: 2, price: 2500, total: 5000, date: '2026-04-26' },
  { productId: 2, productName: 'Eggs (tray)', quantity: 3, price: 240, total: 720, date: '2026-04-26' },
  { productId: 5, productName: 'Soft Drinks (Coke)', quantity: 10, price: 45, total: 450, date: '2026-04-26' },
  { productId: 12, productName: 'Canned Sardines', quantity: 15, price: 28, total: 420, date: '2026-04-25' },
  { productId: 3, productName: 'Frozen Chicken', quantity: 5, price: 180, total: 900, date: '2026-04-25' },
  { productId: 9, productName: 'Bear Brand', quantity: 8, price: 35, total: 280, date: '2026-04-24' },
  { productId: 11, productName: 'Milo', quantity: 4, price: 180, total: 720, date: '2026-04-24' },
  { productId: 4, productName: 'Hotdogs', quantity: 12, price: 120, total: 1440, date: '2026-04-23' },
];

const expenses = [
  { category: 'Supplies', amount: 5000, description: 'Restock inventory', date: '2026-04-20' },
  { category: 'Rent', amount: 3000, description: 'Monthly rent', date: '2026-04-01' },
  { category: 'Utilities', amount: 1500, description: 'Electricity bill', date: '2026-04-15' },
  { category: 'Supplies', amount: 2000, description: 'Plastic bags, containers', date: '2026-04-10' },
];

// Clear existing data
 db.prepare('DELETE FROM sales').run();
 db.prepare('DELETE FROM expenses').run();
 db.prepare('DELETE FROM products').run();

 const productStmt = db.prepare(
  'INSERT INTO products (name, category, price, stock, unit, lowStockThreshold) VALUES (?, ?, ?, ?, ?, ?)'
 );

 for (const p of products) {
  productStmt.run(p.name, p.category, p.price, p.stock, p.unit, p.lowStockThreshold);
 }

 const saleStmt = db.prepare(
  'INSERT INTO sales (productId, productName, quantity, price, total, date) VALUES (?, ?, ?, ?, ?, ?)'
 );

 for (const s of sales) {
  saleStmt.run(s.productId, s.productName, s.quantity, s.price, s.total, s.date);
 }

 const expenseStmt = db.prepare(
  'INSERT INTO expenses (category, amount, description, date) VALUES (?, ?, ?, ?)'
 );

 for (const e of expenses) {
  expenseStmt.run(e.category, e.amount, e.description, e.date);
 }

 console.log('Database seeded successfully!');

