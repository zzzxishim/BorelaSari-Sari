import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Calendar, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api, type Sale, type Expense } from '../services/api';

const COLORS = ['#667eea', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Analytics() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/sales'),
      api.get('/expenses'),
    ]).then(([salesRes, expensesRes]) => {
      setSales(salesRes.data);
      setExpenses(expensesRes.data);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to fetch analytics data', err);
      setLoading(false);
    });
  }, []);

  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
  sales.forEach((sale) => {
    const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
    monthlyData[month].revenue += sale.total;
  });
  expenses.forEach((exp) => {
    const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
    monthlyData[month].expenses += exp.amount;
  });

  const revenueData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    expenses: data.expenses,
  }));

  const productSalesData = sales.reduce((acc, sale) => {
    const existing = acc.find(item => item.name === sale.productName);
    if (existing) {
      existing.value += sale.total;
    } else {
      acc.push({ name: sale.productName, value: sale.total });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const topProducts = productSalesData
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map(item => ({ product: item.name, sales: item.value }));

  const expensesByCategory = expenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#a8d5e2] dark:text-[#00ff88]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-4xl">Analytics</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-white/70" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="week" className="bg-gray-800">Last 7 Days</option>
            <option value="month" className="bg-gray-800">Last 30 Days</option>
            <option value="year" className="bg-gray-800">Last 12 Months</option>
          </select>
        </div>
      </div>

      <GlassCard>
        <h2 className="text-white text-xl mb-4">Revenue & Expenses Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
            <YAxis stroke="rgba(255,255,255,0.7)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-white text-xl mb-4">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
              <YAxis dataKey="product" type="category" stroke="rgba(255,255,255,0.7)" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="sales" fill="#667eea" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="text-white text-xl mb-4">Expense Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <h3 className="text-white/70 text-sm mb-2">Average Daily Sales</h3>
          <p className="text-white text-3xl">
            ₱{Math.round(totalRevenue / 30).toLocaleString()}
          </p>
          <p className="text-green-400 text-sm mt-2">↑ 15.3% from last period</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-white/70 text-sm mb-2">Profit Margin</h3>
          <p className="text-white text-3xl">{profitMargin}%</p>
          <p className="text-green-400 text-sm mt-2">↑ 3.2% from last period</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-white/70 text-sm mb-2">Total Transactions</h3>
          <p className="text-white text-3xl">{sales.length}</p>
          <p className="text-cyan-400 text-sm mt-2">↑ 8.7% from last period</p>
        </GlassCard>
      </div>
    </div>
  );
}

