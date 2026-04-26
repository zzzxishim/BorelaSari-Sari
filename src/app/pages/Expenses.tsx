import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api, type Expense } from '../services/api';
import { socket } from '../services/socket';

const COLORS = ['#667eea', '#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
  });

  const categories = ['Supplies', 'Rent', 'Utilities', 'Transportation', 'Other'];

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  };

  useEffect(() => {
    fetchExpenses().then(() => setLoading(false));

    socket.on('expense:created', fetchExpenses);
    socket.on('expense:deleted', fetchExpenses);

    return () => {
      socket.off('expense:created', fetchExpenses);
      socket.off('expense:deleted', fetchExpenses);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: new Date().toISOString().split('T')[0],
      });
      setFormData({ category: '', amount: '', description: '' });
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to create expense', err);
    }
  };

  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Expenses</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {isFormOpen && (
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Amount (₱)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
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
                Add Expense
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
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
          <div className="mt-4 text-center">
            <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Expenses</p>
            <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{totalExpenses.toLocaleString()}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Recent Expenses</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
                <div className="flex-1">
                  <p className="text-[#2d2d2d] dark:text-white">{expense.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] rounded">
                      {expense.category}
                    </span>
                    <span className="text-[#6b6b6b] dark:text-white/50 text-xs">{expense.date}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-red-500 text-lg">₱{expense.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

