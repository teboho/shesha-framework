import { useEffect, useState, useCallback } from 'react';

// Enhanced performance metrics interface for Next.js 15
interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  
  // Next.js 15 specific metrics
  hydrationTime?: number;
  renderTime?: number;
  routeChangeTime?: number;
  
  // React 19 specific metrics
  componentRenderTime?: number;
  concurrentRenderTime?: number;
  suspenseResolveTime?: number;
}

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isSupported, setIsSupported] = useState(false);

  // Check if Performance API is supported
  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' && 
      'performance' in window && 
      'PerformanceObserver' in window
    );
  }, []);

  // Core Web Vitals measurement
  const measureWebVitals = useCallback(() => {
    if (!isSupported) return;

    try {
      // Measure First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, FCP: fcpEntry.startTime }));
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Measure Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, LCP: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, FID: entry.processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Measure Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setMetrics(prev => ({ ...prev, CLS: clsValue }));
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Cleanup observers on unmount
      return () => {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }
  }, [isSupported]);

  // Next.js specific performance measurements
  const measureNextJSMetrics = useCallback(() => {
    if (!isSupported) return;

    try {
      // Measure Navigation Timing for TTFB
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        setMetrics(prev => ({ ...prev, TTFB: ttfb }));
      }

      // Measure hydration time (Next.js specific)
      const hydrationMark = performance.getEntriesByName('Next.js-hydration');
      if (hydrationMark.length > 0) {
        setMetrics(prev => ({ 
          ...prev, 
          hydrationTime: hydrationMark[0].duration 
        }));
      }

      // Measure route change performance
      const routeChanges = performance.getEntriesByName('Next.js-route-change-to-render');
      if (routeChanges.length > 0) {
        const latestRouteChange = routeChanges[routeChanges.length - 1];
        setMetrics(prev => ({ 
          ...prev, 
          routeChangeTime: latestRouteChange.duration 
        }));
      }
    } catch (error) {
      console.warn('Next.js metrics collection failed:', error);
    }
  }, [isSupported]);

  // React 19 specific measurements
  const measureReactMetrics = useCallback(() => {
    if (!isSupported) return;

    try {
      // Mark component render start
      performance.mark('react-render-start');
      
      // This would be called after render
      return () => {
        performance.mark('react-render-end');
        performance.measure('react-render-time', 'react-render-start', 'react-render-end');
        
        const renderMeasure = performance.getEntriesByName('react-render-time')[0];
        if (renderMeasure) {
          setMetrics(prev => ({ 
            ...prev, 
            componentRenderTime: renderMeasure.duration 
          }));
        }
      };
    } catch (error) {
      console.warn('React metrics collection failed:', error);
      return () => {};
    }
  }, [isSupported]);

  // Enhanced performance monitoring with custom metrics
  const trackCustomMetric = useCallback((name: string, value: number) => {
    if (!isSupported) return;

    try {
      performance.mark(`custom-${name}`, { detail: { value } });
      setMetrics(prev => ({ ...prev, [name]: value }));
    } catch (error) {
      console.warn(`Failed to track custom metric ${name}:`, error);
    }
  }, [isSupported]);

  // Get performance insights and recommendations
  const getPerformanceInsights = useCallback(() => {
    const insights: string[] = [];

    if (metrics.FCP && metrics.FCP > 2500) {
      insights.push('First Contentful Paint is slow. Consider optimizing initial render.');
    }

    if (metrics.LCP && metrics.LCP > 4000) {
      insights.push('Largest Contentful Paint is slow. Optimize largest element loading.');
    }

    if (metrics.FID && metrics.FID > 300) {
      insights.push('First Input Delay is high. Consider breaking up long tasks.');
    }

    if (metrics.CLS && metrics.CLS > 0.25) {
      insights.push('Cumulative Layout Shift is high. Avoid layout shifts during loading.');
    }

    if (metrics.TTFB && metrics.TTFB > 1800) {
      insights.push('Time to First Byte is slow. Consider server optimization.');
    }

    if (insights.length === 0) {
      insights.push('Performance looks good! All metrics are within recommended ranges.');
    }

    return insights;
  }, [metrics]);

  // Initialize monitoring
  useEffect(() => {
    if (!isSupported) return;

    const cleanupWebVitals = measureWebVitals();
    measureNextJSMetrics();

    // Setup periodic metrics collection
    const interval = setInterval(() => {
      measureNextJSMetrics();
    }, 5000);

    return () => {
      if (cleanupWebVitals) cleanupWebVitals();
      clearInterval(interval);
    };
  }, [isSupported, measureWebVitals, measureNextJSMetrics]);

  return {
    metrics,
    isSupported,
    measureReactMetrics,
    trackCustomMetric,
    getPerformanceInsights,
    
    // Helper functions for formatting metrics
    formatMetric: (value: number | undefined) => 
      value ? `${value.toFixed(2)}ms` : 'N/A',
    
    getMetricStatus: (metric: keyof PerformanceMetrics, value: number | undefined) => {
      if (!value) return 'unknown';
      
      switch (metric) {
        case 'FCP':
          return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
        case 'LCP':
          return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
        case 'FID':
          return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
        case 'CLS':
          return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
        case 'TTFB':
          return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
        default:
          return 'unknown';
      }
    }
  };
}