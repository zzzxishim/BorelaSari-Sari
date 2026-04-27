import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Edit, Trash2, Loader2, Calendar, Filter, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api, type Expense, getLocalDateStr } from '../services/api';
import { socket } from '../services/socket';
import { toast } from 'sonner';

const COLORS = ['#667eea', '#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

const categories = ['Supplies', 'Rent', 'Utilities', 'Transportation', 'Other'];

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to fetch expenses', err);
      toast.error(err.response?.data?.error || 'Failed to load expenses');
    }
  };

  useEffect(() => {
    fetchExpenses().then(() => setLoading(false));

    const events = ['expense:created', 'expense:updated', 'expense:deleted'];
    events.forEach(e => socket.on(e, fetchExpenses));
    return () => { events.forEach(e => socket.off(e, fetchExpenses)); };
  }, []);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(formData.amount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Title / Description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        description: formData.description.trim(),
        category: formData.category,
        amount,
        date: formData.date,
      };
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
        toast.success('Expense updated');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense added');
      }
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete expense');
    }
  };

  const getFilteredExpenses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'custom' && customStartDate && customEndDate) {
      return expenses.filter(e => e.date >= customStartDate && e.date <= customEndDate);
    }
    if (filter === 'today') {
      const d = getLocalDateStr(today);
      return expenses.filter(e => e.date === d);
    }
    if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expenses.filter(e => new Date(e.date) >= weekAgo);
    }
    if (filter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return expenses.filter(e => new Date(e.date) >= monthAgo);
    }
    if (filter === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return expenses.filter(e => new Date(e.date) >= yearAgo);
    }
    return expenses;
  };

  const filteredExpenses = getFilteredExpenses();

  const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

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
        <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Expenses</h1>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-xl hover:shadow-lg transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter Bar */}
      <GlassCard>
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-[#6b6b6b] dark:text-white/70" />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'today', 'week', 'month', 'year', 'custom'] as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a]'
                    : 'bg-white/50 dark:bg-white/5 text-[#6b6b6b] dark:text-white/70 hover:bg-white/70 dark:hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'year' ? 'This Year' : 'Custom'}
              </button>
            ))}
          </div>
          {filter === 'custom' && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6b6b6b] dark:text-white/50" />
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
              />
              <span className="text-[#6b6b6b] dark:text-white/50 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
              />
            </div>
          )}
        </div>
      </GlassCard>

      {/* Summary + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Expense Breakdown</h2>
          {chartData.length === 0 ? (
            <p className="text-[#6b6b6b] dark:text-white/50 text-center py-8">No expenses in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
          )}
          <div className="mt-4 text-center">
            <p className="text-[#6b6b6b] dark:text-white/70 text-sm">Total Expenses</p>
            <p className="text-[#2d2d2d] dark:text-white text-3xl">₱{totalExpenses.toLocaleString()}</p>
            <p className="text-[#6b6b6b] dark:text-white/50 text-xs mt-1">{filteredExpenses.length} transactions</p>
          </div>
        </GlassCard>

        {/* Expenses Table */}
        <GlassCard>
          <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-4">Recent Expenses</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/20 dark:border-white/20">
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-3 text-sm">Title</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-3 text-sm">Category</th>
                  <th className="text-right text-[#6b6b6b] dark:text-white/80 py-3 px-3 text-sm">Amount</th>
                  <th className="text-left text-[#6b6b6b] dark:text-white/80 py-3 px-3 text-sm">Date</th>
                  <th className="text-center text-[#6b6b6b] dark:text-white/80 py-3 px-3 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-black/10 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/5 transition-colors group">
                    <td className="text-[#2d2d2d] dark:text-white py-3 px-3 text-sm">{expense.description}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-1 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] rounded">
                        {expense.category}
                      </span>
                    </td>
                    <td className="text-red-500 py-3 px-3 text-sm text-right font-medium">₱{expense.amount.toLocaleString()}</td>
                    <td className="text-[#6b6b6b] dark:text-white/70 py-3 px-3 text-sm">{expense.date}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-1.5 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded hover:bg-[#a8d5e2]/40 dark:hover:bg-[#00ff88]/40 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-[#2d2d2d] dark:text-[#00ff88]" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 bg-red-500/10 rounded hover:bg-red-500/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-[#6b6b6b] dark:text-white/50 py-8 text-center text-sm">
                      No expenses found for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
              <h2 className="text-[#2d2d2d] dark:text-white text-xl">
                {editingExpense ? 'Edit Expense' : 'New Expense'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6b6b6b] dark:text-white/70" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Title / Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                  placeholder="e.g., Monthly Rent, Electricity Bill"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#6b6b6b] dark:text-white/80 text-sm block mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg text-[#2d2d2d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a8d5e2] dark:focus:ring-[#00ff88]"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-white/50 dark:bg-white/10 text-[#2d2d2d] dark:text-white rounded-lg hover:bg-white/70 dark:hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

