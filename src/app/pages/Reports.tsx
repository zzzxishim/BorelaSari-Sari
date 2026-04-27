import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Upload, FileText, FileSpreadsheet, Loader2, Calendar, TrendingUp, ShoppingBag, Award } from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';

export function Reports() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchData = async () => {
    try {
      setError(null);
      const [salesRes, expensesRes] = await Promise.all([
        api.get('/sales'),
        api.get('/expenses'),
      ]);
      setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
    } catch (err: any) {
      console.error('Failed to fetch reports data', err);
      setError(err.response?.data?.error || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const events = ['sale:created', 'sale:updated', 'sale:deleted', 'expense:created', 'expense:deleted'];
    events.forEach(e => socket.on(e, fetchData));
    return () => { events.forEach(e => socket.off(e, fetchData)); };
  }, []);

  const getFilteredSales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'custom' && customStartDate && customEndDate) {
      return sales.filter((s: any) => s.date >= customStartDate && s.date <= customEndDate);
    }
    if (filter === 'today') {
      const d = today.toISOString().split('T')[0];
      return sales.filter((s: any) => s.date === d);
    }
    if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sales.filter((s: any) => new Date(s.date) >= weekAgo);
    }
    if (filter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return sales.filter((s: any) => new Date(s.date) >= monthAgo);
    }
    if (filter === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return sales.filter((s: any) => new Date(s.date) >= yearAgo);
    }
    return sales;
  };

  const getFilteredExpenses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'custom' && customStartDate && customEndDate) {
      return expenses.filter((e: any) => e.date >= customStartDate && e.date <= customEndDate);
    }
    if (filter === 'today') {
      const d = today.toISOString().split('T')[0];
      return expenses.filter((e: any) => e.date === d);
    }
    if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expenses.filter((e: any) => new Date(e.date) >= weekAgo);
    }
    if (filter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return expenses.filter((e: any) => new Date(e.date) >= monthAgo);
    }
    if (filter === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return expenses.filter((e: any) => new Date(e.date) >= yearAgo);
    }
    return expenses;
  };

  const filteredSales = getFilteredSales();
  const filteredExpenses = getFilteredExpenses();
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Top products
  const productSalesMap: Record<string, { quantity: number; total: number }> = {};
  filteredSales.forEach((sale: any) => {
    const name = sale.productName || 'Unknown';
    if (!productSalesMap[name]) productSalesMap[name] = { quantity: 0, total: 0 };
    productSalesMap[name].quantity += sale.quantity || 0;
    productSalesMap[name].total += sale.total || 0;
  });

  const topProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  // Monthly summary
  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
  filteredSales.forEach((sale: any) => {
    const month = new Date(sale.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
    monthlyData[month].revenue += sale.total || 0;
  });
  filteredExpenses.forEach((exp: any) => {
    const month = new Date(exp.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
    monthlyData[month].expenses += exp.amount || 0;
  });

  const monthlySummary = Object.entries(monthlyData).map(([month, data]) => ({
    month, revenue: data.revenue, expenses: data.expenses, profit: data.revenue - data.expenses,
  }));

  const handleExportCSV = () => {
    const csvContent = [
      ['Period', 'Revenue', 'Expenses', 'Profit'],
      ...monthlySummary.map(row => [row.month, row.revenue, row.expenses, row.profit])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sari-sari-report-${filter}.csv`;
    a.click();
  };

  const handleExportExcel = () => {
    alert('Excel export functionality - would generate .xlsx file with all data');
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Excel file "${file.name}" uploaded! Data would be parsed and imported into the system.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#a8d5e2] dark:text-[#00ff88]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Reports</h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleImportExcel}
            className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all">
            <Upload className="w-5 h-5" /><span>Import Excel</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
          <button onClick={handleExportCSV}
            className="flex items-center space-x-2 px-6 py-3 bg-[#8cc4d4] dark:bg-[#00cc6f] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all">
            <FileSpreadsheet className="w-5 h-5" /><span>Export CSV</span>
          </button>
          <button onClick={handleExportExcel}
            className="flex items-center space-x-2 px-6 py-3 bg-[#6fb3c7] dark:bg-[#00aa5c] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all">
            <FileText className="w-5 h-5" /><span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <GlassCard>
        <div className="flex flex-wrap items-center gap-4">
          <Calendar className="w-5 h-5 text-[#6b6b6b] dark:text-white/70" />
          <div className="flex gap-2 flex-wrap">
            {(['today', 'week', 'month', 'year', 'custom'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a]'
                    : 'bg-white/50 dark:bg-white/5 text-[#6b6b6b] dark:text-white/70 hover:bg-white/70 dark:hover:bg-white/10'
                }`}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'year' ? 'This Year' : 'Custom'}
              </button>
            ))}
          </div>
          {filter === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]" />
              <span className="text-[#6b6b6b] dark:text-white/50">to</span>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]" />
            </div>
          )}
        </div>
      </GlassCard>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Revenue</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-[#00cc6f]/20 dark:bg-[#00ff88]/20 rounded-xl"><TrendingUp className="w-8 h-8 text-[#00cc6f] dark:text-[#00ff88]" /></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Expenses</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl"><ShoppingBag className="w-8 h-8 text-red-500" /></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Net Profit</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{netProfit.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-xl"><TrendingUp className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" /></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Transactions</p>
              <p className="text-[#2d2d2d] dark:text-white text-3xl">{filteredSales.length}</p>
            </div>
            <div className="p-3 bg-[#8cc4d4]/20 rounded-xl"><Award className="w-8 h-8 text-[#8cc4d4]" /></div>
          </div>
        </GlassCard>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-[#6b6b6b] dark:text-white/50 text-center py-4">No sales in this period</p>
            ) : (
              topProducts.map(([name, data], index) => (
                <div key={name} className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-[#6b6b6b] dark:text-white/50 text-lg font-bold">#{index + 1}</span>
                    <div>
                      <p className="text-[#2d2d2d] dark:text-white">{name}</p>
                      <p className="text-[#6b6b6b] dark:text-white/50 text-xs">{data.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00cc6f] dark:text-[#00ff88]">₱{data.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/30 dark:bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Average Transaction Value</span>
                <span className="text-[#2d2d2d] dark:text-white text-lg">₱{filteredSales.length ? Math.round(totalRevenue / filteredSales.length) : 0}</span>
              </div>
              <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#a8d5e2] dark:bg-[#00ff88] w-2/3"></div>
              </div>
            </div>
            <div className="p-4 bg-white/30 dark:bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Profit Margin</span>
                <span className="text-[#2d2d2d] dark:text-white text-lg">{totalRevenue ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#00cc6f] dark:bg-[#00ff88]" style={{ width: `${totalRevenue ? Math.min((netProfit / totalRevenue) * 100, 100) : 0}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-white/30 dark:bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Products Sold</span>
                <span className="text-[#2d2d2d] dark:text-white text-lg">{filteredSales.reduce((sum, s) => sum + (s.quantity || 0), 0)}</span>
              </div>
              <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#8cc4d4] dark:bg-[#00cc6f] w-3/4"></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Summary Table */}
      <GlassCard>
        <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-6">Period Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/20 dark:border-white/20">
                <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Period</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Revenue</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Expenses</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Profit</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Margin</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((row, index) => {
                const margin = row.revenue ? ((row.profit / row.revenue) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={index} className="border-b border-black/10 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                    <td className="text-[#2d2d2d] dark:text-white py-4 px-4">{row.month}</td>
                    <td className="text-[#00cc6f] dark:text-[#00ff88] py-4 px-4 text-right">₱{row.revenue.toLocaleString()}</td>
                    <td className="text-red-500 py-4 px-4 text-right">₱{row.expenses.toLocaleString()}</td>
                    <td className="text-[#a8d5e2] dark:text-[#00ff88] py-4 px-4 text-right">₱{row.profit.toLocaleString()}</td>
                    <td className="text-[#2d2d2d] dark:text-white py-4 px-4 text-right">{margin}%</td>
                  </tr>
                );
              })}
              {monthlySummary.length === 0 && (
                <tr><td colSpan={5} className="text-[#6b6b6b] dark:text-white/50 py-8 text-center">No data for this period</td></tr>
              )}
              {monthlySummary.length > 0 && (
                <tr className="border-t-2 border-[#a8d5e2] dark:border-[#00ff88]">
                  <td className="text-[#2d2d2d] dark:text-white py-4 px-4 font-semibold">Total</td>
                  <td className="text-[#00cc6f] dark:text-[#00ff88] py-4 px-4 text-right font-semibold">₱{monthlySummary.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}</td>
                  <td className="text-red-500 py-4 px-4 text-right font-semibold">₱{monthlySummary.reduce((sum, r) => sum + r.expenses, 0).toLocaleString()}</td>
                  <td className="text-[#a8d5e2] dark:text-[#00ff88] py-4 px-4 text-right font-semibold">₱{monthlySummary.reduce((sum, r) => sum + r.profit, 0).toLocaleString()}</td>
                  <td className="text-[#2d2d2d] dark:text-white py-4 px-4 text-right font-semibold">
                    {(() => {
                      const totalRev = monthlySummary.reduce((sum, r) => sum + r.revenue, 0);
                      const totalProf = monthlySummary.reduce((sum, r) => sum + r.profit, 0);
                      return totalRev ? ((totalProf / totalRev) * 100).toFixed(1) : '0.0';
                    })()}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

