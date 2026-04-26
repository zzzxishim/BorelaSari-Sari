import { GlassCard } from '../components/GlassCard';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sales, expenses, products } from '../data/mockData';

export function Dashboard() {
  const totalIncome = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalIncome - totalExpenses;

  const productSales = sales.reduce((acc, sale) => {
    acc[sale.productName] = (acc[sale.productName] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const topSeller = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];

  const weeklyData = [
    { day: 'Mon', revenue: 4500 },
    { day: 'Tue', revenue: 5200 },
    { day: 'Wed', revenue: 4800 },
    { day: 'Thu', revenue: 6100 },
    { day: 'Fri', revenue: 7200 },
    { day: 'Sat', revenue: 8500 },
    { day: 'Sun', revenue: 7800 },
  ];

  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-4xl">Unified Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Income</p>
              <p className="text-white text-3xl mt-1">₱{totalIncome.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Expenses</p>
              <p className="text-white text-3xl mt-1">₱{totalExpenses.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-red-400 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span>-3.2%</span>
              </div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Net Profit</p>
              <p className="text-white text-3xl mt-1">₱{profit.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-cyan-400 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+18.7%</span>
              </div>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Top Seller</p>
              <p className="text-white text-xl mt-1">{topSeller?.[0] || 'N/A'}</p>
              <div className="flex items-center mt-2 text-purple-400 text-sm">
                <span>₱{topSeller?.[1]?.toLocaleString() || 0}</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Award className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-white text-xl mb-4">Weekly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="text-white text-xl mb-4">Low Stock Alerts</h2>
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-white/50 text-sm">No low stock items</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div>
                    <p className="text-white text-sm">{product.name}</p>
                    <p className="text-white/60 text-xs">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400">{product.stock} {product.unit}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
