import React from 'react';
import * as THREE from 'three';

// Create a special error boundary for React Three Fiber
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // For React Three Fiber, we need to return a valid Three.js object
      // or null to prevent the "not part of the THREE namespace" error
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
