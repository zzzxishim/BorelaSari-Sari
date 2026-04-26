import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Sun, Moon, Download, Trash2 } from 'lucide-react';

export function Settings() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = document.documentElement.classList.contains('dark');
    setIsDark(darkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDark(!isDark);
  };

  const handleExportAll = () => {
    alert('All data exported successfully! (CSV download would start here)');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      alert('Data cleared successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[#2d2d2d] dark:text-white text-4xl">Settings</h1>

      <GlassCard>
        <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-6">Appearance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/5 rounded-lg">
            <div>
              <h3 className="text-[#2d2d2d] dark:text-white">Theme Mode</h3>
              <p className="text-[#6b6b6b] dark:text-white/60 text-sm">
                Switch between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-16 h-8 rounded-full transition-all ${
                isDark ? 'bg-[#00ff88]' : 'bg-[#a8d5e2]'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform flex items-center justify-center ${
                  isDark ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                {isDark ? (
                  <Moon className="w-4 h-4 text-[#1a1a1a]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#2d2d2d]" />
                )}
              </div>
            </button>
          </div>

          <div className="p-4 bg-white/30 dark:bg-white/5 rounded-lg">
            <h3 className="text-[#2d2d2d] dark:text-white mb-3">Color Palette</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#6b6b6b] dark:text-white/60 text-sm mb-2">Light Mode</p>
                <div className="flex space-x-2">
                  <div className="w-12 h-12 rounded-lg bg-[#f5f2e9] border border-black/20"></div>
                  <div className="w-12 h-12 rounded-lg bg-[#a8d5e2] border border-black/20"></div>
                  <div className="w-12 h-12 rounded-lg bg-white border border-black/20"></div>
                </div>
              </div>
              <div>
                <p className="text-[#6b6b6b] dark:text-white/60 text-sm mb-2">Dark Mode</p>
                <div className="flex space-x-2">
                  <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] border border-white/20"></div>
                  <div className="w-12 h-12 rounded-lg bg-[#00ff88] border border-white/20"></div>
                  <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] border border-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-6">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/5 rounded-lg">
            <div>
              <h3 className="text-[#2d2d2d] dark:text-white">Export All Data</h3>
              <p className="text-[#6b6b6b] dark:text-white/60 text-sm">
                Download all sales, expenses, and product data as CSV
              </p>
            </div>
            <button
              onClick={handleExportAll}
              className="flex items-center space-x-2 px-6 py-3 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/5 rounded-lg border-l-4 border-red-500">
            <div>
              <h3 className="text-[#2d2d2d] dark:text-white">Clear All Data</h3>
              <p className="text-[#6b6b6b] dark:text-white/60 text-sm">
                Permanently delete all sales, expenses, and product records
              </p>
            </div>
            <button
              onClick={handleClearData}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-[#2d2d2d] dark:text-white text-xl mb-6">About</h2>
        <div className="space-y-2">
          <p className="text-[#6b6b6b] dark:text-white/70">
            <span className="text-[#2d2d2d] dark:text-white">Version:</span> 1.0.0
          </p>
          <p className="text-[#6b6b6b] dark:text-white/70">
            <span className="text-[#2d2d2d] dark:text-white">Application:</span> Sari-Sari Profit Tracker
          </p>
          <p className="text-[#6b6b6b] dark:text-white/70">
            <span className="text-[#2d2d2d] dark:text-white">Purpose:</span> Manage Philippine retail store operations
          </p>
          <p className="text-[#6b6b6b] dark:text-white/70 mt-4">
            Built with glassmorphism design, featuring warm beige/teal light mode and charcoal/neon green dark mode.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
