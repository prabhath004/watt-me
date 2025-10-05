import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  err?: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { err: undefined as any };

  static getDerivedStateFromError(err: any) {
    return { err };
  }

  componentDidCatch(err: any, info: any) {
    console.error('[ErrorBoundary]', err, info);
  }

  render() {
    if (this.state.err) {
      return this.props.fallback ?? (
        <div style={{
          padding: 16,
          border: '1px solid #ef4444',
          borderRadius: 12,
          background: '#fff1f2',
          margin: '8px 0'
        }}>
          <strong>Something broke in this section.</strong>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            Check console for details. UI kept alive by ErrorBoundary.
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}
