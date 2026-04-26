import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  createdAt: string;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalSales: number;
  topSeller: { productName: string; totalSales: number } | null;
  lowStock: Product[];
  recentSales: Sale[];
  weeklyRevenue: { date: string; revenue: number }[];
  expensesByCategory: { category: string; value: number }[];
}

