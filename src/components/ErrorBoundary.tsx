import { Component, type ReactNode } from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Erreur applicative capturée :', error);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    try {
      window.location.hash = '';
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-[#1f140d] p-6">
          <div className="w-full max-w-sm rounded-2xl border-2 border-[var(--color-brass,#c99a52)] bg-[#2b1b13] p-7 text-center shadow-2xl">
            <h2 className="mb-2 font-serif text-2xl font-bold text-[#f3ead4]">
              Un problème est survenu
            </h2>
            <p className="mb-6 text-sm text-[#f3ead4]/60">
              Une erreur inattendue a interrompu la partie. Vous pouvez recharger la page sans perdre votre progression sauvegardée.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c99a52] py-3 font-bold text-[#1f140d] transition-colors hover:bg-[#e2a868]"
              >
                <RotateCcw className="h-5 w-5" />
                Recharger la page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#6b4529] bg-[#46301f] py-3 font-bold text-[#f3ead4] transition-colors hover:bg-[#4a2e1b]"
              >
                <Home className="h-5 w-5" />
                Retour au menu
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
