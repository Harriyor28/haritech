import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[boundary]', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/haritech';
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#070a13] flex items-center justify-center px-6 text-white">
          <div className="text-center max-w-md">
            <div className="text-6xl font-black mb-4 gradient-text">Oops</div>
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              An unexpected error interrupted this page. Your saved content is safe —
              reload to try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={this.handleReload} className="btn-primary px-8 py-3">
                Reload Page
              </button>
              <button onClick={this.handleHome} className="btn-secondary px-8 py-3">
                Go Home
              </button>
            </div>
            {this.state.error.message && (
              <p className="text-xs text-slate-600 font-mono mt-8 break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
