import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, DollarSign, Package, BarChart3, FileText, Sun, Moon, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/expenses', icon: DollarSign, label: 'Expenses' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f5f2e9] dark:bg-[#1a1a1a] transition-colors duration-300 pb-20 md:pb-0">
      {/* DESKTOP TOP NAV */}
      <nav className="hidden md:block backdrop-blur-md bg-white/60 dark:bg-black/40 border-b border-black/10 dark:border-white/10 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-[#2d2d2d] dark:text-[#00ff88]" />
              <h1 className="text-[#2d2d2d] dark:text-white text-xl">Borela Sari-Sari</h1>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm ${active ? 'bg-[#a8d5e2] dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] shadow-lg' : 'text-[#6b6b6b] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/settings"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm ${isActive('/settings') ? 'bg-[#a8d5e2] dark:bg-[#00ff88]/20 text-[#2d2d2d] dark:text-[#00ff88] shadow-lg' : 'text-[#6b6b6b] dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10'}`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => setIsDark(!isDark)}
                className="ml-2 p-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#2d2d2d] dark:text-[#00ff88] transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE TOP HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-white/70 dark:bg-black/60 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-[#2d2d2d] dark:text-[#00ff88]" />
            <h1 className="text-[#2d2d2d] dark:text-white text-lg font-semibold">Borela</h1>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-[#2d2d2d] dark:text-[#00ff88]"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className={isMobile ? 'pt-16 px-3 py-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full space-y-0.5"
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-[#a8d5e2] dark:bg-[#00ff88]/20' : ''}`}>
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#2d2d2d] dark:text-[#00ff88]' : 'text-[#6b6b6b] dark:text-white/50'}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-[#2d2d2d] dark:text-[#00ff88]' : 'text-[#6b6b6b] dark:text-white/50'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
