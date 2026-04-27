import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Filter, Loader2, Edit, Trash2, Calendar } from 'lucide-react';
import { api, type Sale, type Product } from '../services/api';
import { socket } from '../services/socket';
import { toast } from 'sonner';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({ productId: '', quantity: '', price: '' });

  const fetchSales = async () => {
    try {
      const params: any = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filter === 'today') {
        params.startDate = today.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (filter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (filter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        params.startDate = monthAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      }

      if (customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const res = await api.get('/sales', { params });
      setSales(res.data);
    } catch (err) {
      console.error('Failed to fetch sales', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchSales(), fetchProducts()]).then(() => setLoading(false));

    socket.on('sale:created', fetchSales);
    socket.on('sale:updated', fetchSales);
    socket.on('sale:deleted', fetchSales);
    socket.on('product:updated', fetchProducts);

    return () => {
      socket.off('sale:created', fetchSales);
      socket.off('sale:updated', fetchSales);
      socket.off('sale:deleted', fetchSales);
      socket.off('product:updated', fetchProducts);
    };
  }, []);

  useEffect(() => {
    fetchSales();
  }, [filter, customStartDate, customEndDate]);

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
        toast.success('Sale updated successfully');
      } else {
        await api.post('/sales', payload);
        toast.success('Sale recorded successfully');
      }
      setFormData({ productId: '', quantity: '', price: '' });
      setIsFormOpen(false);
      setEditingSale(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save sale');
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      productId: sale.productId.toString(),
      quantity: sale.quantity.toString(),
      price: sale.price.toString(),
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    try {
      await api.delete(`/sales/${id}`);
      toast.success('Sale deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete sale');
    }
  };

  const totalFilteredSales = sales.reduce((sum, s) => sum + s.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#a8d5e2] dark:text-[#00ff88]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white text-4xl">Sales Log</h1>
        <button
          onClick={() => { setEditingSale(null); setFormData({ productId: '', quantity: '', price: '' }); setIsFormOpen(!isFormOpen); }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Sale</span>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <p className="text-white/70 text-sm">Total Sales</p>
          <p className="text-white text-2xl">₱{totalFilteredSales.toLocaleString()}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-white/70 text-sm">Transactions</p>
          <p className="text-white text-2xl">{sales.length}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-white/70 text-sm">Average Sale</p>
          <p className="text-white text-2xl">₱{sales.length ? Math.round(totalFilteredSales / sales.length) : 0}</p>
        </GlassCard>
      </div>

      {/* Add/Edit Sale Form */}
      {isFormOpen && (
        <GlassCard>
          <h2 className="text-white text-xl mb-4">{editingSale ? 'Edit Sale' : 'New Sale'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white/80 text-sm block mb-2">Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => {
                    const product = products.find(p => p.id === Number(e.target.value));
                    setFormData({ ...formData, productId: e.target.value, price: product?.price.toString() || '' });
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="" className="bg-gray-800">Select product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-gray-800">{product.name} (Stock: {product.stock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Quantity</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" required min="1" />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Price (₱)</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" required min="0" step="0.01" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => { setIsFormOpen(false); setEditingSale(null); }}
                className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all">{editingSale ? 'Update Sale' : 'Add Sale'}</button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-white text-xl">Sales History</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-white/70" />
            <select value={filter} onChange={(e) => { setFilter(e.target.value as any); setCustomStartDate(''); setCustomEndDate(''); }}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="today" className="bg-gray-800">Today</option>
              <option value="week" className="bg-gray-800">This Week</option>
              <option value="month" className="bg-gray-800">This Month</option>
              <option value="all" className="bg-gray-800">All Time</option>
            </select>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/50" />
              <input type="date" value={customStartDate} onChange={(e) => { setCustomStartDate(e.target.value); setFilter('all'); }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              <span className="text-white/50">to</span>
              <input type="date" value={customEndDate} onChange={(e) => { setCustomEndDate(e.target.value); setFilter('all'); }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/80 py-3 px-4">Product</th>
                <th className="text-left text-white/80 py-3 px-4">Qty</th>
                <th className="text-left text-white/80 py-3 px-4">Price</th>
                <th className="text-left text-white/80 py-3 px-4">Total</th>
                <th className="text-left text-white/80 py-3 px-4">Date</th>
                <th className="text-left text-white/80 py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="text-white py-3 px-4">{sale.productName}</td>
                  <td className="text-white py-3 px-4">{sale.quantity}</td>
                  <td className="text-white py-3 px-4">₱{sale.price.toLocaleString()}</td>
                  <td className="text-green-400 py-3 px-4">₱{sale.total.toLocaleString()}</td>
                  <td className="text-white/70 py-3 px-4">{sale.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(sale)} className="p-2 bg-white/10 text-white rounded hover:bg-white/20 transition-all"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(sale.id)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={6} className="text-white/50 py-8 text-center">No sales found for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

