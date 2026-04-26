import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Filter, Loader2 } from 'lucide-react';
import { api, type Sale, type Product } from '../services/api';
import { socket } from '../services/socket';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    price: '',
  });

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales');
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
    socket.on('sale:deleted', fetchSales);
    socket.on('product:updated', fetchProducts);

    return () => {
      socket.off('sale:created', fetchSales);
      socket.off('sale:deleted', fetchSales);
      socket.off('product:updated', fetchProducts);
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
        <h1 className="text-white text-4xl">Sales Log</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Sale</span>
        </button>
      </div>

      {isFormOpen && (
        <GlassCard>
          <h2 className="text-white text-xl mb-4">New Sale</h2>
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
                  <option value="">Select product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-gray-800">
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Price (₱)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Add Sale
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl">Sales History</h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-white/70" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="today" className="bg-gray-800">Today</option>
              <option value="week" className="bg-gray-800">This Week</option>
              <option value="month" className="bg-gray-800">This Month</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/80 py-3 px-4">Product</th>
                <th className="text-left text-white/80 py-3 px-4">Quantity</th>
                <th className="text-left text-white/80 py-3 px-4">Price</th>
                <th className="text-left text-white/80 py-3 px-4">Total</th>
                <th className="text-left text-white/80 py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="text-white py-3 px-4">{sale.productName}</td>
                  <td className="text-white py-3 px-4">{sale.quantity}</td>
                  <td className="text-white py-3 px-4">₱{sale.price.toLocaleString()}</td>
                  <td className="text-green-400 py-3 px-4">₱{sale.total.toLocaleString()}</td>
                  <td className="text-white/70 py-3 px-4">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

