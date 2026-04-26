import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { TrendingUp, DollarSign, ShoppingBag, Award, Plus, Filter, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, type Product, type Sale, type DashboardStats } from '../services/api';
import { socket } from '../services/socket';

const COLORS = ['#a8d5e2', '#8cc4d4', '#6fb3c7', '#f59e0b', '#ef4444'];

export function UnifiedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    price: '',
  });
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('week');

  const fetchAll = async () => {
    try {
      const [statsRes, productsRes, salesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/products'),
        api.get('/sales'),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
      setSales(salesRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    fetchAll().then(() => setLoading(false));

    socket.on('product:created', fetchAll);
    socket.on('product:updated', fetchAll);
    socket.on('product:deleted', fetchAll);
    socket.on('sale:created', fetchAll);
    socket.on('sale:deleted', fetchAll);
    socket.on('expense:created', fetchAll);
    socket.on('expense:deleted', fetchAll);

    return () => {
      socket.off('product:created', fetchAll);
      socket.off('product:updated', fetchAll);
      socket.off('product:deleted', fetchAll);
      socket.off('sale:created', fetchAll);
      socket.off('sale:deleted', fetchAll);
      socket.off('expense:created', fetchAll);
      socket.off('expense:deleted', fetchAll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === Number(formData.productId));
    if (!product) return;

    try {
      await api.post('/sales', {
        productId: Number(formData.productId),
        productName: product.name,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        total: Number(formData.quantity) * Number(formData.price),
        date: new Date().toISOString().split('T')[0],
      });
      setFormData({ productId: '', quantity: '', price: '' });
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to create sale', err);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'today') {
      return sale.date === today.toISOString().split('T')[0];
    } else if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    }
    return true;
  });

  const productSales = sales.reduce((acc, sale) => {
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
        { day: 'Mon', revenue: 4500 },
        { day: 'Tue', revenue: 5200 },
        { day: 'Wed', revenue: 4800 },
        { day: 'Thu', revenue: 6100 },
        { day: 'Fri', revenue: 7200 },
        { day: 'Sat', revenue: 8500 },
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
      <div className="flex items-center justify-between">
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Dashboard</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Sale</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Income</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl mt-1">₱{(stats?.totalRevenue || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2 text-[#00cc6f] dark:text-[#00ff88] text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Expenses</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl mt-1">₱{(stats?.totalExpenses || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <span>-3.2%</span>
              </div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Net Profit</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl mt-1">₱{(stats?.netProfit || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2 text-[#00cc6f] dark:text-[#00ff88] text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+18.7%</span>
              </div>
            </div>
            <div className="p-3 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Top Seller</p>
              <p className="text-[#2d2d2d] dark:text-white text-xl mt-1">{stats?.topSeller?.productName?.split('(')[0] || 'N/A'}</p>
              <div className="flex items-center mt-2 text-[#a8d5e2] dark:text-[#00ff88] text-sm">
                <span>₱{(stats?.topSeller?.totalSales || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-full">
              <Award className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {isFormOpen && (
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Add New Sale</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => {
                    const product = products.find(p => p.id === Number(e.target.value));
                    setFormData({ ...formData, productId: e.target.value, price: product?.price.toString() || '' });
                  }}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                >
                  <option value="">Select product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-white dark:bg-gray-800">
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Price (₱)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2 bg-white/50 dark:bg-white/10 text-[#2d2d2d] dark:text-white rounded-lg hover:bg-white/70 dark:hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all"
              >
                Add Sale
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" className="dark:stroke-white/10" />
              <XAxis dataKey="day" stroke="#6b6b6b" className="dark:stroke-white/70" />
              <YAxis stroke="#6b6b6b" className="dark:stroke-white/70" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#a8d5e2"
                strokeWidth={3}
                dot={{ fill: '#a8d5e2', r: 5 }}
                className="dark:stroke-[#00ff88] dark:fill-[#00ff88]"
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Top Products by Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" className="dark:stroke-white/10" />
              <XAxis dataKey="product" stroke="#6b6b6b" className="dark:stroke-white/70" />
              <YAxis stroke="#6b6b6b" className="dark:stroke-white/70" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="sales" fill="#a8d5e2" radius={[8, 8, 0, 0]} className="dark:fill-[#00ff88]" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Expense Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.expensesByCategory || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(stats?.expensesByCategory || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#2d2d2d] dark:text-white text-xl">Recent Sales</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-[#6b6b6b] dark:text-white/70" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
              >
                <option value="today" className="bg-white dark:bg-gray-800">Today</option>
                <option value="week" className="bg-white dark:bg-gray-800">Week</option>
                <option value="month" className="bg-white dark:bg-gray-800">Month</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {filteredSales.slice(0, 6).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/5 rounded-lg">
                <div>
                  <p className="text-[#2d2d2d] dark:text-white text-sm">{sale.productName.split('(')[0]}</p>
                  <p className="text-[#6b6b6b] dark:text-white/50 text-xs">{sale.date}</p>
                </div>
                <p className="text-[#00cc6f] dark:text-[#00ff88]">₱{sale.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

