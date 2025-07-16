import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { Spin, Result } from 'antd';

// Loading component with customizable spinner
interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  minHeight?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  tip = 'Loading component...', 
  minHeight = 200 
}) => (
  <div 
    style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight,
      width: '100%'
    }}
  >
    <Spin size={size} tip={tip} />
  </div>
);

// Error boundary for lazy loaded components
interface LazyErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  LazyErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Component Failed to Load"
          subTitle="There was an error loading this component. Please try refreshing the page."
          extra={
            <button 
              onClick={() => window.location.reload()}
              className="ant-btn ant-btn-primary"
            >
              Refresh Page
            </button>
          }
        />
      );
    }

    return this.props.children;
  }
}

// Enhanced lazy component wrapper with loading states and error handling
interface LazyComponentOptions {
  fallback?: React.ComponentType<any>;
  minLoadTime?: number; // Minimum time to show loading state (prevents flash)
  loadingProps?: LoadingSpinnerProps;
  retryCount?: number;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> {
  const {
    fallback,
    minLoadTime = 200,
    loadingProps = {},
    retryCount = 3
  } = options;

  // Enhanced import function with retry logic
  const enhancedImport = async (): Promise<{ default: T }> => {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const module = await importFunc();
        
        // Ensure minimum loading time to prevent UI flash
        const loadTime = Date.now() - startTime;
        if (loadTime < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - loadTime));
        }
        
        return module;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt + 1} failed to load component:`, error);
        
        // Wait before retrying (exponential backoff)
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to load component after multiple attempts');
  };

  return React.lazy(enhancedImport);
}

// Higher-order component for wrapping lazy components
export function withLazyWrapper<P extends object>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
  loadingProps?: LoadingSpinnerProps
) {
  return React.forwardRef<any, P>((props, ref) => (
    <LazyErrorBoundary>
      <Suspense fallback={<LoadingSpinner {...loadingProps} />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </LazyErrorBoundary>
  ));
}

// Utility for creating route-level lazy components
export function createLazyRoute<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  routeName?: string
) {
  const LazyComponent = createLazyComponent(importFunc, {
    minLoadTime: 300,
    loadingProps: {
      size: 'large',
      tip: routeName ? `Loading ${routeName}...` : 'Loading page...',
      minHeight: 300
    }
  });

  return withLazyWrapper(LazyComponent, {
    size: 'large',
    tip: routeName ? `Loading ${routeName}...` : 'Loading page...',
    minHeight: 300
  });
}

// Utility for creating component-level lazy loading
export function createLazyWidget<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  widgetName?: string
) {
  const LazyComponent = createLazyComponent(importFunc, {
    minLoadTime: 100,
    loadingProps: {
      size: 'default',
      tip: widgetName ? `Loading ${widgetName}...` : 'Loading...',
      minHeight: 100
    }
  });

  return withLazyWrapper(LazyComponent);
}

// Preload utilities for strategic preloading
export function preloadComponent<T>(
  importFunc: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFunc().catch(error => {
    console.warn('Failed to preload component:', error);
    throw error;
  });
}

// Intersection Observer based lazy loading for viewport optimization
export function createViewportLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyComponentOptions & { rootMargin?: string } = {}
) {
  const { rootMargin = '50px', ...lazyOptions } = options;
  
  return React.forwardRef<any, any>((props, ref) => {
    const [shouldLoad, setShouldLoad] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { rootMargin }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [rootMargin]);

    if (!shouldLoad) {
      return (
        <div ref={containerRef} style={{ minHeight: lazyOptions.loadingProps?.minHeight || 100 }}>
          <LoadingSpinner {...lazyOptions.loadingProps} />
        </div>
      );
    }

    const LazyComponent = createLazyComponent(importFunc, lazyOptions);
    return withLazyWrapper(LazyComponent)(props);
  });
}

export default {
  createLazyComponent,
  withLazyWrapper,
  createLazyRoute,
  createLazyWidget,
  createViewportLazyComponent,
  preloadComponent,
  LoadingSpinner,
  LazyErrorBoundary
};