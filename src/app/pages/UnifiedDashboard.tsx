import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { TrendingUp, DollarSign, ShoppingBag, Award, Plus, Filter, Loader2, Edit, Trash2, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type Product, type Sale, type Expense, type DashboardStats, getLocalDateStr } from '../services/api';
import { socket } from '../services/socket';
import { toast } from 'sonner';

const COLORS = ['#a8d5e2', '#8cc4d4', '#6fb3c7', '#f59e0b', '#ef4444'];

export function UnifiedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({ productId: '', quantity: '', price: '' });
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchAll = async () => {
    try {
      const [statsRes, productsRes, salesRes, expensesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/products'),
        api.get('/sales'),
        api.get('/expenses'),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
      setSales(salesRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    fetchAll().then(() => setLoading(false));

    const events = ['product:created', 'product:updated', 'product:deleted', 'sale:created', 'sale:updated', 'sale:deleted', 'expense:created', 'expense:updated', 'expense:deleted'];
    events.forEach(e => socket.on(e, fetchAll));
    return () => { events.forEach(e => socket.off(e, fetchAll)); };
  }, []);

  const getFilteredSales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (customStartDate && customEndDate) {
      return sales.filter(s => s.date >= customStartDate && s.date <= customEndDate);
    }

    if (filter === 'today') {
      const d = getLocalDateStr(today);
      return sales.filter(s => s.date === d);
    } else if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sales.filter(s => new Date(s.date) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return sales.filter(s => new Date(s.date) >= monthAgo);
    } else if (filter === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return sales.filter(s => new Date(s.date) >= yearAgo);
    }
    return sales;
  };

  const getFilteredExpenses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (customStartDate && customEndDate) {
      return expenses.filter(e => e.date >= customStartDate && e.date <= customEndDate);
    }

    if (filter === 'today') {
      const d = getLocalDateStr(today);
      return expenses.filter(e => e.date === d);
    } else if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expenses.filter(e => new Date(e.date) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return expenses.filter(e => new Date(e.date) >= monthAgo);
    } else if (filter === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return expenses.filter(e => new Date(e.date) >= yearAgo);
    }
    return expenses;
  };

  const filteredSales = getFilteredSales();
  const filteredExpenses = getFilteredExpenses();
  const filteredRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const filteredExpenseTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const filteredNetProfit = filteredRevenue - filteredExpenseTotal;

  const filteredProductSales = filteredSales.reduce((acc, sale) => {
    acc[sale.productName] = (acc[sale.productName] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);
  const filteredTopSeller = Object.entries(filteredProductSales).sort((a, b) => b[1] - a[1])[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === Number(formData.productId));
    if (!product) return;

    const payload = {
      productId: Number(formData.productId),
      productName: product.name,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      total: Number(formData.quantity) * Number(formData.price),
      date: new Date().toISOString().split('T')[0],
    };

    try {
      if (editingSale) {
        await api.put(`/sales/${editingSale.id}`, payload);
        toast.success('Sale updated');
      } else {
        await api.post('/sales', payload);
        toast.success('Sale recorded');
      }
      setFormData({ productId: '', quantity: '', price: '' });
      setIsFormOpen(false);
      setEditingSale(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save sale');
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      productId: sale.productId.toString(),
      quantity: sale.quantity.toString(),
      price: sale.price.toString(),
    });
    setIsFormOpen(true);
  };

  const handleDeleteSale = async (id: number) => {
    if (!confirm('Delete this sale?')) return;
    try {
      await api.delete(`/sales/${id}`);
      toast.success('Sale deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const productSales = filteredSales.reduce((acc, sale) => {
    acc[sale.productName] = (acc[sale.productName] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const productBarData = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([product, sales]) => ({ product: product.split('(')[0].trim(), sales }));

  const weeklyData = stats?.weeklyRevenue?.length
    ? stats.weeklyRevenue.map((d: any) => ({ day: d.date.slice(5), revenue: d.revenue }))
    : [
        { day: 'Mon', revenue: 4500 }, { day: 'Tue', revenue: 5200 },
        { day: 'Wed', revenue: 4800 }, { day: 'Thu', revenue: 6100 },
        { day: 'Fri', revenue: 7200 }, { day: 'Sat', revenue: 8500 },
        { day: 'Sun', revenue: 7800 },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#a8d5e2] dark:text-[#00ff88]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Bar */}
          <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 rounded-xl px-3 py-2 border border-black/10 dark:border-white/10">
            <Calendar className="w-4 h-4 text-[#6b6b6b] dark:text-white/50" />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as any); setCustomStartDate(''); setCustomEndDate(''); }}
              className="bg-transparent text-[#2d2d2d] dark:text-white text-sm focus:outline-none"
            >
              <option value="today" className="bg-white dark:bg-gray-800">Today</option>
              <option value="week" className="bg-white dark:bg-gray-800">This Week</option>
              <option value="month" className="bg-white dark:bg-gray-800">This Month</option>
              <option value="year" className="bg-white dark:bg-gray-800">This Year</option>
              <option value="all" className="bg-white dark:bg-gray-800">All Time</option>
            </select>
          </div>
          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => { setCustomStartDate(e.target.value); setFilter('all'); }}
              className="px-3 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
            />
            <span className="text-[#6b6b6b] dark:text-white/50 text-sm">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => { setCustomEndDate(e.target.value); setFilter('all'); }}
              className="px-3 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
            />
          </div>
          <button onClick={() => { setEditingSale(null); setFormData({ productId: '', quantity: '', price: '' }); setIsFormOpen(!isFormOpen); }}
            className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" /><span>Add Sale</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Income</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl mt-1">₱{filteredRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-[#00cc6f] dark:text-[#00ff88] text-sm"><TrendingUp className="w-4 h-4 mr-1" /><span>+12.5%</span></div>
            </div>
            <div className="p-3 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-xl"><DollarSign className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" /></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Expenses</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl mt-1">₱{filteredExpenseTotal.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-red-500 text-sm"><span>-3.2%</span></div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl"><ShoppingBag className="w-8 h-8 text-red-500" /></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Net Profit</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl mt-1">₱{filteredNetProfit.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-[#00cc6f] dark:text-[#00ff88] text-sm"><TrendingUp className="w-4 h-4 mr-1" /><span>+18.7%</span></div>
            </div>
            <div className="p-3 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-xl"><DollarSign className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" /></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Top Seller</p>
              <p className="text-[#2d2d2d] dark:text-white text-xl mt-1">{filteredTopSeller?.[0]?.split('(')[0] || 'N/A'}</p>
              <div className="flex items-center mt-2 text-[#a8d5e2] dark:text-[#00ff88] text-sm"><span>₱{(filteredTopSeller?.[1] || 0).toLocaleString()}</span></div>
            </div>
            <div className="p-3 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-full"><Award className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" /></div>
          </div>
        </GlassCard>
      </div>

      {/* Add/Edit Sale Form */}
      {isFormOpen && (
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">{editingSale ? 'Edit Sale' : 'Add New Sale'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Product</label>
                <select value={formData.productId} onChange={(e) => { const p = products.find(p => p.id === Number(e.target.value)); setFormData({ ...formData, productId: e.target.value, price: p?.price.toString() || '' }); }}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]" required>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id} className="bg-white dark:bg-gray-800">{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Quantity</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]" required min="1" />
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Price (₱)</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]" required min="0" step="0.01" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => { setIsFormOpen(false); setEditingSale(null); }}
                className="px-6 py-2 bg-white/50 dark:bg-white/10 text-[#2d2d2d] dark:text-white rounded-lg hover:bg-white/70 dark:hover:bg-white/20 transition-all">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all">{editingSale ? 'Update Sale' : 'Add Sale'}</button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="day" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#a8d5e2" strokeWidth={3} dot={{ fill: '#a8d5e2', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Top Products by Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="product" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="sales" fill="#a8d5e2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Expense Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats?.expensesByCategory || []} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {(stats?.expensesByCategory || []).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Recent Sales with Filter */}
        <GlassCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
            <h2 className="text-[#2d2d2d] dark:text-white text-xl">Recent Sales</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-5 h-5 text-[#6b6b6b] dark:text-white/70" />
              <select value={filter} onChange={(e) => { setFilter(e.target.value as any); setCustomStartDate(''); setCustomEndDate(''); }}
                className="px-3 py-1 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]">
                <option value="today" className="bg-white dark:bg-gray-800">Today</option>
                <option value="week" className="bg-white dark:bg-gray-800">Week</option>
                <option value="month" className="bg-white dark:bg-gray-800">Month</option>
                <option value="year" className="bg-white dark:bg-gray-800">Year</option>
                <option value="all" className="bg-white dark:bg-gray-800">All</option>
              </select>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#6b6b6b] dark:text-white/50" />
                <input type="date" value={customStartDate} onChange={(e) => { setCustomStartDate(e.target.value); setFilter('all'); }}
                  className="px-2 py-1 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-xs focus:outline-none" />
                <span className="text-[#6b6b6b] dark:text-white/50 text-xs">to</span>
                <input type="date" value={customEndDate} onChange={(e) => { setCustomEndDate(e.target.value); setFilter('all'); }}
                  className="px-2 py-1 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-xs focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="mb-3 text-sm text-[#6b6b6b] dark:text-white/60">
            Showing {filteredSales.length} sales — Total: <span className="text-[#00cc6f] dark:text-[#00ff88] font-semibold">₱{filteredRevenue.toLocaleString()}</span>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {filteredSales.slice(0, 8).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/5 rounded-lg group">
                <div>
                  <p className="text-[#2d2d2d] dark:text-white text-sm">{sale.productName.split('(')[0]}</p>
                  <p className="text-[#6b6b6b] dark:text-white/50 text-xs">{sale.date} · {sale.quantity} × ₱{sale.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[#00cc6f] dark:text-[#00ff88]">₱{sale.total.toLocaleString()}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditSale(sale)} className="p-1.5 bg-white/50 dark:bg-white/10 rounded hover:bg-[#a8d5e2]/30 dark:hover:bg-[#00ff88]/30"><Edit className="w-3.5 h-3.5 text-[#2d2d2d] dark:text-white" /></button>
                    <button onClick={() => handleDeleteSale(sale.id)} className="p-1.5 bg-red-500/10 rounded hover:bg-red-500/30"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSales.length === 0 && <p className="text-white/50 text-sm text-center py-4">No sales for this period</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

