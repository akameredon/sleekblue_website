import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
          fontFamily: "'HubotSans',sans-serif", textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a', marginBottom: '10px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', maxWidth: '400px', lineHeight: 1.6 }}>
            An unexpected error occurred. Please refresh the page or go back to the homepage.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '11px 24px', background: '#7B2FBE', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: "'HubotSans',sans-serif" }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => { window.location.href = '/' }}
              style={{ padding: '11px 24px', background: '#fff', color: '#7B2FBE', border: '1.5px solid #7B2FBE', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: "'HubotSans',sans-serif" }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
