import { useRef, useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Download, FileText, FileSpreadsheet, Upload, Loader2 } from 'lucide-react';
import { api, type Product, type Sale, type Expense } from '../services/api';

export function Reports() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/sales'),
      api.get('/expenses'),
    ]).then(([productsRes, salesRes, expensesRes]) => {
      setProducts(productsRes.data);
      setSales(salesRes.data);
      setExpenses(expensesRes.data);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to fetch reports data', err);
      setLoading(false);
    });
  }, []);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
  sales.forEach((sale) => {
    const month = new Date(sale.date).toLocaleString('default', { month: 'long' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
    monthlyData[month].revenue += sale.total;
  });
  expenses.forEach((exp) => {
    const month = new Date(exp.date).toLocaleString('default', { month: 'long' });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
    monthlyData[month].expenses += exp.amount;
  });

  const monthlySummary = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    expenses: data.expenses,
    profit: data.revenue - data.expenses,
  }));

  const handleExportCSV = () => {
    const csvContent = [
      ['Month', 'Revenue', 'Expenses', 'Profit'],
      ...monthlySummary.map(row => [row.month, row.revenue, row.expenses, row.profit])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sari-sari-report.csv';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Reports</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleImportExcel}
            className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all"
          >
            <Upload className="w-5 h-5" />
            <span>Import Excel</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-6 py-3 bg-[#8cc4d4] dark:bg-[#00cc6f] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-6 py-3 bg-[#6fb3c7] dark:bg-[#00aa5c] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all"
          >
            <FileText className="w-5 h-5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <h3 className="text-[#6b6b6b] dark:text-white/70 text-sm mb-2">Total Revenue (YTD)</h3>
          <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{totalRevenue.toLocaleString()}</p>
          <div className="mt-4 h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#00cc6f] dark:bg-[#00ff88] w-3/4"></div>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-[#6b6b6b] dark:text-white/70 text-sm mb-2">Total Expenses (YTD)</h3>
          <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{totalExpenses.toLocaleString()}</p>
          <div className="mt-4 h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-1/2"></div>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-[#6b6b6b] dark:text-white/70 text-sm mb-2">Net Profit (YTD)</h3>
          <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{netProfit.toLocaleString()}</p>
          <div className="mt-4 h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#a8d5e2] dark:bg-[#00ff88] w-4/5"></div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-6">Yearly Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/20 dark:border-white/20">
                <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-4">Month</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Revenue</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Expenses</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Profit</th>
                <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-4">Margin</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((row, index) => {
                const margin = ((row.profit / row.revenue) * 100).toFixed(1);
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
              <tr className="border-t-2 border-[#a8d5e2] dark:border-[#00ff88]">
                <td className="text-[#2d2d2d] dark:text-white py-4 px-4">Total</td>
                {['revenue', 'expenses', 'profit'].map((key) => (
                  <td key={key} className={`text-${key === 'expenses' ? 'red-500' : key === 'profit' ? '[#a8d5e2] dark:text-[#00ff88]' : '[#00cc6f] dark:text-[#00ff88]'} py-4 px-4 text-right`}>
                    ₱{monthlySummary.reduce((sum, row) => sum + (row as any)[key], 0).toLocaleString()}
                  </td>
                ))}
                <td className="text-[#2d2d2d] dark:text-white py-4 px-4 text-right">
                  {((monthlySummary.reduce((sum, row) => sum + row.profit, 0) /
                     monthlySummary.reduce((sum, row) => sum + row.revenue, 0)) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-white/30 dark:bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-[#6b6b6b] dark:text-white/50 text-lg">#{index + 1}</span>
                  <div>
                    <p className="text-[#2d2d2d] dark:text-white">{product.name}</p>
                    <p className="text-[#6b6b6b] dark:text-white/50 text-xs">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00cc6f] dark:text-[#00ff88]">₱{(product.price * 50).toLocaleString()}</p>
                  <p className="text-[#6b6b6b] dark:text-white/50 text-xs">50 units sold</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/30 dark:bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Average Transaction Value</span>
                <span className="text-[#2d2d2d] dark:text-white text-lg">
                  ₱{sales.length ? Math.round(totalRevenue / sales.length) : 0}
                </span>
              </div>
              <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#a8d5e2] dark:bg-[#00ff88] w-2/3"></div>
              </div>
            </div>
            <div className="p-4 bg-white/30 dark:bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Transactions</span>
                <span className="text-[#2d2d2d] dark:text-white text-lg">{sales.length}</span>
              </div>
              <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#00cc6f] dark:bg-[#00ff88] w-[87%]"></div>
              </div>
            </div>
            <div className="p-4 bg-white/30 dark:bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6b6b6b] dark:text-white/70 text-sm">Inventory Turnover</span>
                <span className="text-[#2d2d2d] dark:text-white text-lg">6.2x</span>
              </div>
              <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#8cc4d4] dark:bg-[#00cc6f] w-3/4"></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

