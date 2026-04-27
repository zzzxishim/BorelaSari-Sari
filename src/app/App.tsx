import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/ToastProvider';
import { Home } from './pages/Home';
import { UnifiedDashboard } from './pages/UnifiedDashboard';
import { Expenses } from './pages/Expenses';
import { Products } from './pages/Products';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Component, type ReactNode } from 'react';

// Error boundary to catch runtime crashes on Reports page
class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message + '\n' + (err.stack || '') };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-2xl mx-auto">
            <h2 className="text-red-500 text-xl font-bold mb-2">Page Error</h2>
            <pre className="bg-black/30 rounded-lg p-3 text-red-300 text-xs overflow-auto whitespace-pre-wrap max-h-96">{this.state.error}</pre>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="mt-4 px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg">Retry</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<UnifiedDashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={
            <RouteErrorBoundary>
              <Reports />
            </RouteErrorBoundary>
          } />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
