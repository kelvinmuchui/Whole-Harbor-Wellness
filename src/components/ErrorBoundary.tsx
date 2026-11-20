import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.'
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let displayMsg = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed?.error) {
          displayMsg = `Data access notice (${parsed.operationType || 'read'} on ${parsed.path || 'database'}): ${parsed.error}`;
        }
      } catch {
        // non-JSON message
      }

      return (
        <div className="min-h-screen bg-[#fffdfb] text-[#111d2b] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#dfd7c7] rounded-3xl p-8 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#f6f4ee] border border-[#c5a059] flex items-center justify-center text-[#c5a059] font-serif text-2xl">
              ⚓
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
              Session Recovery Required
            </h2>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">{displayMsg}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
