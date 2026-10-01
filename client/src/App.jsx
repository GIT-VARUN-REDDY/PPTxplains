import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage.jsx';
import { PresentationPage } from './pages/PresentationPage.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#080c14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#0e1524',
            border: '1px solid #2a3a55',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#38bdf8', marginBottom: '12px' }}>
              Unable to Load Presentation
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5' }}>
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="btn btn-primary"
                style={{ padding: '10px 20px' }}
              >
                Return to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Check if current route is a presentation route
  const isPresentationRoute = currentPath.startsWith('/presentation');
  
  // Extract presentation ID from route (e.g. /presentation/ai-video-strategy)
  let presentationId = 'ai-video-strategy';
  if (isPresentationRoute) {
    const segments = currentPath.split('/').filter(Boolean);
    if (segments.length >= 2 && segments[1]) {
      presentationId = segments[1];
    }
  }

  if (isPresentationRoute) {
    return (
      <PresentationPage
        presentationId={presentationId}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  return (
    <LandingPage
      onStartPresentation={() => navigateTo('/presentation/ai-video-strategy')}
    />
  );
}
