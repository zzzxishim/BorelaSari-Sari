import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Edit, Trash2, AlertTriangle, Grid, List, Loader2 } from 'lucide-react';
import { api, type Product } from '../services/api';
import { socket } from '../services/socket';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesMap, setSalesMap] = useState<Record<number, { quantity: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: '',
    lowStockThreshold: '',
  });

  const categories = ['Staples', 'Fresh', 'Frozen', 'Beverages', 'Supplies', 'Vegetables', 'Spices', 'Powdered Drinks', 'Canned Goods'];

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales');
      const map: Record<number, { quantity: number; total: number }> = {};
      res.data.forEach((sale: any) => {
        if (!map[sale.productId]) map[sale.productId] = { quantity: 0, total: 0 };
        map[sale.productId].quantity += sale.quantity;
        map[sale.productId].total += sale.total;
      });
      setSalesMap(map);
    } catch (err) {
      console.error('Failed to fetch sales', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchSales()]).then(() => setLoading(false));

    socket.on('product:created', fetchProducts);
    socket.on('product:updated', fetchProducts);
    socket.on('product:deleted', fetchProducts);
    socket.on('sale:created', fetchSales);
    socket.on('sale:deleted', fetchSales);

    return () => {
      socket.off('product:created', fetchProducts);
      socket.off('product:updated', fetchProducts);
      socket.off('product:deleted', fetchProducts);
      socket.off('sale:created', fetchSales);
      socket.off('sale:deleted', fetchSales);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      unit: formData.unit,
      lowStockThreshold: Number(formData.lowStockThreshold),
    };
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setFormData({ name: '', category: '', price: '', stock: '', unit: '', lowStockThreshold: '' });
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      unit: product.unit,
      lowStockThreshold: product.lowStockThreshold.toString(),
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

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
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Products</h1>
        <div className="flex items-center space-x-3">
          <div className="flex bg-white/50 dark:bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#a8d5e2] dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88]' : 'text-[#6b6b6b] dark:text-white/70'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#a8d5e2] dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88]' : 'text-[#6b6b6b] dark:text-white/70'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', category: '', price: '', stock: '', unit: '', lowStockThreshold: '' });
              setIsFormOpen(!isFormOpen);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {isFormOpen && (
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                />
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white dark:bg-gray-800">
                      {cat}
                    </option>
                  ))}
                </select>
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
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                  placeholder="e.g., kg, pack, sack"
                />
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-2 bg-white/50 dark:bg-white/10 text-[#2d2d2d] dark:text-white rounded-lg hover:bg-white/70 dark:hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isLowStock = product.stock <= product.lowStockThreshold;
            const salesData = salesMap[product.id] || { quantity: 0, total: 0 };
            return (
              <GlassCard key={product.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[#2d2d2d] dark:text-white text-lg">{product.name}</h3>
                    <p className="text-[#6b6b6b] dark:text-white/60 text-sm">{product.category}</p>
                  </div>
                  {isLowStock && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Price:</span>
                    <span className="text-[#2d2d2d] dark:text-white">₱{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Stock:</span>
                    <span className={`${isLowStock ? 'text-red-500' : 'text-[#00cc6f] dark:text-[#00ff88]'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2">
                    <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Sold:</span>
                    <span className="text-[#a8d5e2] dark:text-[#00ff88]">
                      {salesData.quantity} ({product.unit})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Revenue:</span>
                    <span className="text-[#00cc6f] dark:text-[#00ff88]">₱{salesData.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] rounded-lg hover:bg-[#a8d5e2]/30 dark:hover:bg-[#00ff88]/30 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/20 dark:border-white/20">
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Name</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Category</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Price</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Stock</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Sold (Qty)</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Total Revenue</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Status</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLowStock = product.stock <= product.lowStockThreshold;
                  const salesData = salesMap[product.id] || { quantity: 0, total: 0 };
                  return (
                    <tr key={product.id} className="border-b border-black/10 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                      <td className="text-[#2d2d2d] dark:text-white py-3 px-4">{product.name}</td>
                      <td className="text-[#6b6b6b] dark:text-white/70 py-3 px-4">{product.category}</td>
                      <td className="text-[#2d2d2d] dark:text-white py-3 px-4">₱{product.price.toLocaleString()}</td>
                      <td className="text-[#2d2d2d] dark:text-white py-3 px-4">{product.stock} {product.unit}</td>
                      <td className="text-[#a8d5e2] dark:text-[#00ff88] py-3 px-4">{salesData.quantity}</td>
                      <td className="text-[#00cc6f] dark:text-[#00ff88] py-3 px-4">₱{salesData.total.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {isLowStock ? (
                          <span className="flex items-center text-red-500 text-sm">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[#00cc6f] dark:text-[#00ff88] text-sm">In Stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] rounded hover:bg-[#a8d5e2]/30 dark:hover:bg-[#00ff88]/30"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

