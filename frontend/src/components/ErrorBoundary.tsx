import { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';

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

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px' }}>
          <Result
            status="error"
            title="Algo salió mal"
            subTitle={this.state.error?.message || 'Ocurrió un error inesperado. Por favor, recarga la página.'}
            extra={<Button type="primary" onClick={this.handleReset}>Recargar</Button>}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
