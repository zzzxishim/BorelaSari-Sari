import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-red-500 text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-white/70 text-sm mb-4">The page encountered an error:</p>
            <pre className="bg-black/30 rounded-lg p-3 text-red-300 text-xs overflow-auto max-h-48">
              {this.state.error?.message}
              {'\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-6 py-2 bg-[#a8d5e2] dark:bg-[#00ff88] text-[#2d2d2d] dark:text-[#1a1a1a] rounded-lg hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
      );
    }
    return this.props.children;
  }
}
