import { GlassCard } from '../components/GlassCard';
import { Link } from 'react-router';
import { BarChart3, DollarSign, Package, FileText, ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-[#2d2d2d] dark:text-white text-5xl mb-4">Welcome to BorelaSari-Sari Tracker</h1>
        <p className="text-[#6b6b6b] dark:text-white/70 text-xl max-w-2xl mx-auto">
          Manage your Philippine retail store with ease. Track sales, expenses, inventory, and generate reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/dashboard">
          <GlassCard className="hover:scale-105 transition-transform cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-full">
                <BarChart3 className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" />
              </div>
              <h3 className="text-[#2d2d2d] dark:text-white text-xl">Dashboard</h3>
              <p className="text-[#6b6b6b] dark:text-white/60 text-sm">
                View KPIs, add sales, and analyze trends in one place
              </p>
              <ArrowRight className="w-5 h-5 text-[#a8d5e2] dark:text-[#00ff88]" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/expenses">
          <GlassCard className="hover:scale-105 transition-transform cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-full">
                <DollarSign className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" />
              </div>
              <h3 className="text-[#2d2d2d] dark:text-white text-xl">Expenses</h3>
              <p className="text-[#6b6b6b] dark:text-white/60 text-sm">
                Track and categorize all business expenses
              </p>
              <ArrowRight className="w-5 h-5 text-[#a8d5e2] dark:text-[#00ff88]" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/products">
          <GlassCard className="hover:scale-105 transition-transform cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-full">
                <Package className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" />
              </div>
              <h3 className="text-[#2d2d2d] dark:text-white text-xl">Products</h3>
              <p className="text-[#6b6b6b] dark:text-white/60 text-sm">
                Manage inventory with sales summaries and alerts
              </p>
              <ArrowRight className="w-5 h-5 text-[#a8d5e2] dark:text-[#00ff88]" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/reports">
          <GlassCard className="hover:scale-105 transition-transform cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#a8d5e2]/20 dark:bg-[#00ff88]/20 rounded-full">
                <FileText className="w-8 h-8 text-[#a8d5e2] dark:text-[#00ff88]" />
              </div>
              <h3 className="text-[#2d2d2d] dark:text-white text-xl">Reports</h3>
              <p className="text-[#6b6b6b] dark:text-white/60 text-sm">
                Export data and import from Excel
              </p>
              <ArrowRight className="w-5 h-5 text-[#a8d5e2] dark:text-[#00ff88]" />
            </div>
          </GlassCard>
        </Link>
      </div>

      <GlassCard className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#2d2d2d] dark:text-white text-2xl mb-2">Quick Start Guide</h2>
            <p className="text-[#6b6b6b] dark:text-white/70">
              1. Go to <span className="text-[#a8d5e2] dark:text-[#00ff88]">Dashboard</span> to view KPIs and add sales
              <br />
              2. Manage your <span className="text-[#a8d5e2] dark:text-[#00ff88]">Products</span> inventory with low-stock alerts
              <br />
              3. Track <span className="text-[#a8d5e2] dark:text-[#00ff88]">Expenses</span> by category
              <br />
              4. Generate and export <span className="text-[#a8d5e2] dark:text-[#00ff88]">Reports</span> in Excel format
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
