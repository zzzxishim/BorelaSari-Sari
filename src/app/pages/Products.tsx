import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Edit, Trash2, AlertTriangle, Grid, List, Loader2, Search, ShoppingCart } from 'lucide-react';
import { api, type Product } from '../services/api';
import { socket } from '../services/socket';
import { toast } from 'sonner';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesMap, setSalesMap] = useState<Record<number, { quantity: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [recordSaleProduct, setRecordSaleProduct] = useState<Product | null>(null);
  const [saleQuantity, setSaleQuantity] = useState('');
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', stock: '', unit: '', lowStockThreshold: '',
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
    socket.on('sale:created', () => { fetchProducts(); fetchSales(); });
    socket.on('sale:updated', () => { fetchProducts(); fetchSales(); });
    socket.on('sale:deleted', fetchSales);

    return () => {
      socket.off('product:created', fetchProducts);
      socket.off('product:updated', fetchProducts);
      socket.off('product:deleted', fetchProducts);
      socket.off('sale:created');
      socket.off('sale:updated');
      socket.off('sale:deleted', fetchSales);
    };
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product added successfully');
      }
      setFormData({ name: '', category: '', price: '', stock: '', unit: '', lowStockThreshold: '' });
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, category: product.category, price: product.price.toString(),
      stock: product.stock.toString(), unit: product.unit, lowStockThreshold: product.lowStockThreshold.toString(),
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordSaleProduct) return;
    const qty = Number(saleQuantity);
    if (qty <= 0) { toast.error('Quantity must be greater than 0'); return; }
    if (qty > recordSaleProduct.stock) { toast.error(`Only ${recordSaleProduct.stock} ${recordSaleProduct.unit} available`); return; }

    try {
      await api.post('/sales', {
        productId: recordSaleProduct.id,
        productName: recordSaleProduct.name,
        quantity: qty,
        price: recordSaleProduct.price,
        total: qty * recordSaleProduct.price,
        date: new Date().toISOString().split('T')[0],
      });
      toast.success(`Sale recorded: ${qty} ${recordSaleProduct.unit} of ${recordSaleProduct.name}`);
      setRecordSaleProduct(null);
      setSaleQuantity('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record sale');
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Products</h1>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] dark:text-white/50" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88] w-48 md:w-64"
            />
          </div>
          <div className="flex bg-white/50 dark:bg-white/10 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#a8d5e2] dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88]' : 'text-[#6b6b6b] dark:text-white/70'}`}>
              <Grid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#a8d5e2] dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88]' : 'text-[#6b6b6b] dark:text-white/70'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => { setEditingProduct(null); setFormData({ name: '', category: '', price: '', stock: '', unit: '', lowStockThreshold: '' }); setIsFormOpen(!isFormOpen); }}
            className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product Form */}
      {isFormOpen && (
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Product Name', type: 'text', key: 'name', placeholder: '' },
                { label: 'Category', type: 'select', key: 'category' },
                { label: 'Price (₱)', type: 'number', key: 'price', min: '0', step: '0.01' },
                { label: 'Stock', type: 'number', key: 'stock', min: '0' },
                { label: 'Unit', type: 'text', key: 'unit', placeholder: 'e.g., kg, pack, sack' },
                { label: 'Low Stock Threshold', type: 'number', key: 'lowStockThreshold', min: '0' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={(formData as any)[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                      required
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => <option key={cat} value={cat} className="bg-white dark:bg-gray-800">{cat}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={(formData as any)[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                      required
                      {...(field.min ? { min: field.min } : {})}
                      {...(field.step ? { step: field.step } : {})}
                      {...(field.placeholder ? { placeholder: field.placeholder } : {})}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => { setIsFormOpen(false); setEditingProduct(null); }}
                className="px-6 py-2 bg-white/50 dark:bg-white/10 text-[#2d2d2d] dark:text-white rounded-lg hover:bg-white/70 dark:hover:bg-white/20 transition-all">Cancel</button>
              <button type="submit"
                className="px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all">{editingProduct ? 'Update Product' : 'Add Product'}</button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Record Sale Modal */}
      {recordSaleProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md">
            <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-2">Record Sale</h2>
            <p className="text-[#6b6b6b] dark:text-white/60 text-sm mb-4">{recordSaleProduct.name} — ₱{recordSaleProduct.price.toLocaleString()} / {recordSaleProduct.unit}</p>
            <p className="text-sm mb-4">Available stock: <span className="font-semibold text-[#00cc6f] dark:text-[#00ff88]">{recordSaleProduct.stock} {recordSaleProduct.unit}</span></p>
            <form onSubmit={handleRecordSale} className="space-y-4">
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Quantity Sold</label>
                <input
                  type="number"
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required min="1" max={recordSaleProduct.stock}
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => { setRecordSaleProduct(null); setSaleQuantity(''); }}
                  className="px-6 py-2 bg-white/50 dark:bg-white/10 text-[#2d2d2d] dark:text-white rounded-lg hover:bg-white/70 dark:hover:bg-white/20 transition-all">Cancel</button>
                <button type="submit"
                  className="px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all">Record Sale</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.lowStockThreshold;
            const salesData = salesMap[product.id] || { quantity: 0, total: 0 };
            return (
              <GlassCard key={product.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[#2d2d2d] dark:text-white text-lg">{product.name}</h3>
                    <p className="text-[#6b6b6b] dark:text-white/60 text-sm">{product.category}</p>
                  </div>
                  {isLowStock && <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between"><span className="text-[#6b6b6b] dark:text-white/70 text-sm">Price:</span><span className="text-[#2d2d2d] dark:text-white">₱{product.price.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[#6b6b6b] dark:text-white/70 text-sm">Stock:</span><span className={`${isLowStock ? 'text-red-500' : 'text-[#00cc6f] dark:text-[#00ff88]'}`}>{product.stock} {product.unit}</span></div>
                  <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2"><span className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Sold:</span><span className="text-[#a8d5e2] dark:text-[#00ff88]">{salesData.quantity} {product.unit}</span></div>
                  <div className="flex justify-between"><span className="text-[#6b6b6b] dark:text-white/70 text-sm">Revenue:</span><span className="text-[#00cc6f] dark:text-[#00ff88]">₱{salesData.total.toLocaleString()}</span></div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setRecordSaleProduct(product)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[#00cc6f]/20 dark:bg-[#00ff88]/20 text-[#00cc6f] dark:text-[#00ff88] rounded-lg hover:bg-[#00cc6f]/30 dark:hover:bg-[#00ff88]/30 transition-all">
                    <ShoppingCart className="w-4 h-4" /><span>Sell</span>
                  </button>
                  <button onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] rounded-lg hover:bg-[#a8d5e2]/30 dark:hover:bg-[#00ff88]/30 transition-all">
                    <Edit className="w-4 h-4" /><span>Edit</span>
                  </button>
                  <button onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all">
                    <Trash2 className="w-4 h-4" /><span>Delete</span>
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
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Sold</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Revenue</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Status</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
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
                          <span className="flex items-center text-red-500 text-sm"><AlertTriangle className="w-4 h-4 mr-1" />Low Stock</span>
                        ) : (
                          <span className="text-[#00cc6f] dark:text-[#00ff88] text-sm">In Stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <button onClick={() => setRecordSaleProduct(product)} className="p-2 bg-[#00cc6f]/20 dark:bg-[#00ff88]/20 text-[#00cc6f] dark:text-[#00ff88] rounded hover:bg-[#00cc6f]/30 dark:hover:bg-[#00ff88]/30"><ShoppingCart className="w-4 h-4" /></button>
                          <button onClick={() => handleEdit(product)} className="p-2 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] rounded hover:bg-[#a8d5e2]/30 dark:hover:bg-[#00ff88]/30"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"><Trash2 className="w-4 h-4" /></button>
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

