import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  componentStack?: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
    errorInfo: undefined,
    componentStack: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Aggiorna lo stato in modo che il prossimo render mostri l'interfaccia di fallback.
    return { 
      hasError: true,
      error: error, // Salva l'errore per poterlo visualizzare
      errorInfo: undefined, // Resetta errorInfo, sarà impostato da componentDidCatch
      componentStack: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Puoi anche loggare l'errore a un servizio di reporting errori
    console.error("--- ERRORE CATTURATO DA ERROR BOUNDARY ---");
    console.error("Messaggio Errore:", error.message);
    console.error("Nome Errore:", error.name);
    if (error.stack) {
      console.error("Stack Errore:", error.stack);
    }
    console.error("Stack Componente:", errorInfo.componentStack);
    console.error("--- FINE ERRORE ERROR BOUNDARY ---");
    this.setState({ 
      error: error,
      errorInfo: errorInfo,
      componentStack: errorInfo.componentStack 
    });
  }

  public render() {
    if (this.state.hasError) {
      // Puoi renderizzare qualsiasi interfaccia di fallback personalizzata
      return (
        <div style={{ padding: '20px', border: '1px solid red', margin: '20px' }}>
          <h1>Qualcosa è andato storto durante il rendering.</h1>
          <p>L'applicazione ha incontrato un problema.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Dettagli Errore (per sviluppatori)</summary>
            {this.state.error && (
              <div>
                <strong>Messaggio:</strong> {this.state.error.toString()}
              </div>
            )}
            {this.state.componentStack && (
              <div style={{ marginTop: '10px' }}>
                <strong>Stack del Componente:</strong>
                <pre>{this.state.componentStack}</pre>
              </div>
            )}
             {this.state.error && this.state.error.stack && (
              <div style={{ marginTop: '10px' }}>
                <strong>Stack Trace dell'Errore:</strong>
                <pre>{this.state.error.stack}</pre>
              </div>
            )}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 