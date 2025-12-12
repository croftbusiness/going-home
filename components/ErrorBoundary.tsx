'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-red-200 p-6 sm:p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
                  Something went wrong
                </h2>
                <p className="text-[#2C2A29] opacity-70 mb-4">
                  An error occurred while loading this page. Please try refreshing or contact support if the problem persists.
                </p>
                {this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Error details:</p>
                    <p className="text-xs text-red-700 font-mono break-all">
                      {this.state.error.toString()}
                    </p>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                          Show stack trace
                        </summary>
                        <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={this.resetError}
                    className="px-4 py-2 bg-[#93B0C8] text-white rounded-lg hover:bg-[#A5B99A] transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-200 text-[#2C2A29] rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

