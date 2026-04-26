export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  lowStockThreshold: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export const products: Product[] = [
  { id: '1', name: 'Rice (50kg sack)', category: 'Staples', price: 2500, stock: 15, unit: 'sack', lowStockThreshold: 5 },
  { id: '2', name: 'Eggs (tray)', category: 'Fresh', price: 240, stock: 8, unit: 'tray', lowStockThreshold: 3 },
  { id: '3', name: 'Frozen Chicken', category: 'Frozen', price: 180, stock: 25, unit: 'kg', lowStockThreshold: 10 },
  { id: '4', name: 'Hotdogs', category: 'Frozen', price: 120, stock: 30, unit: 'pack', lowStockThreshold: 10 },
  { id: '5', name: 'Soft Drinks (Coke)', category: 'Beverages', price: 45, stock: 60, unit: 'bottle', lowStockThreshold: 20 },
  { id: '6', name: 'Charcoal', category: 'Supplies', price: 150, stock: 12, unit: 'sack', lowStockThreshold: 5 },
  { id: '7', name: 'Kangkong', category: 'Vegetables', price: 30, stock: 5, unit: 'bundle', lowStockThreshold: 2 },
  { id: '8', name: 'Spices Mix', category: 'Spices', price: 15, stock: 40, unit: 'pack', lowStockThreshold: 10 },
  { id: '9', name: 'Bear Brand', category: 'Powdered Drinks', price: 35, unit: 'can', stock: 50, lowStockThreshold: 15 },
  { id: '10', name: 'Ensure', category: 'Powdered Drinks', price: 75, stock: 20, unit: 'can', lowStockThreshold: 8 },
  { id: '11', name: 'Milo', category: 'Powdered Drinks', price: 180, stock: 25, unit: 'pack', lowStockThreshold: 10 },
  { id: '12', name: 'Canned Sardines', category: 'Canned Goods', price: 28, stock: 80, unit: 'can', lowStockThreshold: 30 },
];

export const sales: Sale[] = [
  { id: '1', productId: '1', productName: 'Rice (50kg sack)', quantity: 2, price: 2500, total: 5000, date: '2026-04-26' },
  { id: '2', productId: '2', productName: 'Eggs (tray)', quantity: 3, price: 240, total: 720, date: '2026-04-26' },
  { id: '3', productId: '5', productName: 'Soft Drinks (Coke)', quantity: 10, price: 45, total: 450, date: '2026-04-26' },
  { id: '4', productId: '12', productName: 'Canned Sardines', quantity: 15, price: 28, total: 420, date: '2026-04-25' },
  { id: '5', productId: '3', productName: 'Frozen Chicken', quantity: 5, price: 180, total: 900, date: '2026-04-25' },
  { id: '6', productId: '9', productName: 'Bear Brand', quantity: 8, price: 35, total: 280, date: '2026-04-24' },
  { id: '7', productId: '11', productName: 'Milo', quantity: 4, price: 180, total: 720, date: '2026-04-24' },
  { id: '8', productId: '4', productName: 'Hotdogs', quantity: 12, price: 120, total: 1440, date: '2026-04-23' },
];

export const expenses: Expense[] = [
  { id: '1', category: 'Supplies', amount: 5000, description: 'Restock inventory', date: '2026-04-20' },
  { id: '2', category: 'Rent', amount: 3000, description: 'Monthly rent', date: '2026-04-01' },
  { id: '3', category: 'Utilities', amount: 1500, description: 'Electricity bill', date: '2026-04-15' },
  { id: '4', category: 'Supplies', amount: 2000, description: 'Plastic bags, containers', date: '2026-04-10' },
];
