import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Oups ! Quelque chose s'est mal passé</h2>
              <p className="text-zinc-500 text-sm">Une erreur est survenue dans l'application.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-xl transition-colors"
            >
              <RefreshCw size={18} />
              <span>Recharger la page</span>
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
