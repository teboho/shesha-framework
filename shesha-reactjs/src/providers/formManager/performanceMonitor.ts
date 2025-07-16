import { useState, useEffect, useCallback, useRef } from 'react';

export interface FormPerformanceMetrics {
  // Loading Metrics
  initialLoadTime: number;
  markupProcessingTime: number;
  renderTime: number;
  totalLoadTime: number;
  
  // Cache Metrics
  cacheHitRate: number;
  cacheSize: number;
  
  // Component Metrics
  componentCount: number;
  reRenderCount: number;
  
  // Memory Metrics
  memoryUsage: number;
  memoryPeak: number;
  
  // User Experience Metrics
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

interface PerformanceEntry {
  timestamp: number;
  formId: string;
  metrics: Partial<FormPerformanceMetrics>;
  userAgent: string;
  sessionId: string;
}

interface PerformanceConfig {
  enableWebVitals: boolean;
  enableMemoryTracking: boolean;
  samplingRate: number;
  bufferSize: number;
  reportingInterval: number;
}

export class FormPerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private config: PerformanceConfig;
  private sessionId: string;
  private performanceObserver?: PerformanceObserver;
  private memoryInterval?: NodeJS.Timeout;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableWebVitals: true,
      enableMemoryTracking: true,
      samplingRate: 1.0, // 100% sampling by default
      bufferSize: 100,
      reportingInterval: 30000, // 30 seconds
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupPerformanceObserver();
    this.setupMemoryTracking();
    this.setupPeriodicReporting();
  }

  // Record form loading start
  startFormLoading(formId: string): string {
    const measurementId = `form-load-${formId}-${Date.now()}`;
    performance.mark(`${measurementId}-start`);
    return measurementId;
  }

  // Record form loading end and calculate metrics
  endFormLoading(measurementId: string, formId: string, additionalMetrics: Partial<FormPerformanceMetrics> = {}): void {
    if (Math.random() > this.config.samplingRate) return;

    performance.mark(`${measurementId}-end`);
    performance.measure(measurementId, `${measurementId}-start`, `${measurementId}-end`);

    const measure = performance.getEntriesByName(measurementId)[0] as PerformanceEntry;
    const metrics = this.calculateMetrics(measure, additionalMetrics);

    this.recordEntry(formId, metrics);
    this.cleanup(measurementId);
  }

  // Record specific performance entry
  private recordEntry(formId: string, metrics: Partial<FormPerformanceMetrics>): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      formId,
      metrics,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    };

    this.entries.push(entry);

    // Maintain buffer size
    if (this.entries.length > this.config.bufferSize) {
      this.entries.shift();
    }
  }

  // Calculate comprehensive metrics
  private calculateMetrics(measure: PerformanceEntry, additionalMetrics: Partial<FormPerformanceMetrics>): Partial<FormPerformanceMetrics> {
    const metrics: Partial<FormPerformanceMetrics> = {
      totalLoadTime: measure.duration,
      ...additionalMetrics
    };

    // Add Web Vitals if available
    if (this.config.enableWebVitals) {
      metrics.firstContentfulPaint = this.getWebVital('first-contentful-paint');
      metrics.largestContentfulPaint = this.getWebVital('largest-contentful-paint');
    }

    // Add memory metrics if enabled
    if (this.config.enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize;
      metrics.memoryPeak = memory.totalJSHeapSize;
    }

    return metrics;
  }

  // Get Web Vital metric
  private getWebVital(name: string): number | undefined {
    const entries = performance.getEntriesByName(name);
    return entries.length > 0 ? entries[0].startTime : undefined;
  }

  // Setup performance observer for Web Vitals
  private setupPerformanceObserver(): void {
    if (!this.config.enableWebVitals || !('PerformanceObserver' in window)) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.handlePerformanceEntry(entry);
        });
      });

      // Observe different types of performance entries
      this.performanceObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }
  }

  // Handle performance entry from observer
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    // Store Web Vitals for later use
    if (entry.name === 'first-contentful-paint' || entry.name === 'largest-contentful-paint') {
      // These will be picked up by calculateMetrics
    }
  }

  // Setup memory tracking
  private setupMemoryTracking(): void {
    if (!this.config.enableMemoryTracking || !('memory' in performance)) return;

    this.memoryInterval = setInterval(() => {
      const memory = (performance as any).memory;
      
      // Check for memory leaks (simplified detection)
      if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
        console.warn('High memory usage detected:', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        });
      }
    }, 5000); // Check every 5 seconds
  }

  // Setup periodic reporting
  private setupPeriodicReporting(): void {
    setInterval(() => {
      this.generateReport();
    }, this.config.reportingInterval);
  }

  // Generate performance report
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      totalEntries: this.entries.length,
      metrics: this.aggregateMetrics(),
      trends: this.calculateTrends(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  // Aggregate metrics across all entries
  private aggregateMetrics(): AggregatedMetrics {
    if (this.entries.length === 0) {
      return {} as AggregatedMetrics;
    }

    const totals = this.entries.reduce((acc, entry) => {
      Object.keys(entry.metrics).forEach(key => {
        const value = entry.metrics[key as keyof FormPerformanceMetrics] as number;
        if (typeof value === 'number') {
          acc[key] = (acc[key] || 0) + value;
        }
      });
      return acc;
    }, {} as any);

    const averages: AggregatedMetrics = {} as AggregatedMetrics;
    Object.keys(totals).forEach(key => {
      averages[key as keyof AggregatedMetrics] = totals[key] / this.entries.length;
    });

    return averages;
  }

  // Calculate performance trends
  private calculateTrends(): PerformanceTrends {
    if (this.entries.length < 2) {
      return {} as PerformanceTrends;
    }

    const recent = this.entries.slice(-10); // Last 10 entries
    const older = this.entries.slice(-20, -10); // Previous 10 entries

    const recentAvg = this.averageMetrics(recent);
    const olderAvg = this.averageMetrics(older);

    return {
      loadTimeTrend: this.calculateTrend(olderAvg.totalLoadTime, recentAvg.totalLoadTime),
      memoryTrend: this.calculateTrend(olderAvg.memoryUsage, recentAvg.memoryUsage),
      reRenderTrend: this.calculateTrend(olderAvg.reRenderCount, recentAvg.reRenderCount)
    };
  }

  // Calculate average metrics for a set of entries
  private averageMetrics(entries: PerformanceEntry[]): Partial<FormPerformanceMetrics> {
    if (entries.length === 0) return {};

    const totals = entries.reduce((acc, entry) => {
      Object.keys(entry.metrics).forEach(key => {
        const value = entry.metrics[key as keyof FormPerformanceMetrics] as number;
        if (typeof value === 'number') {
          acc[key] = (acc[key] || 0) + value;
        }
      });
      return acc;
    }, {} as any);

    const averages: Partial<FormPerformanceMetrics> = {};
    Object.keys(totals).forEach(key => {
      averages[key as keyof FormPerformanceMetrics] = totals[key] / entries.length;
    });

    return averages;
  }

  // Calculate trend (positive = improving, negative = degrading)
  private calculateTrend(oldValue?: number, newValue?: number): number {
    if (!oldValue || !newValue) return 0;
    return ((oldValue - newValue) / oldValue) * 100;
  }

  // Generate performance recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.aggregateMetrics();

    if (metrics.totalLoadTime && metrics.totalLoadTime > 2000) {
      recommendations.push('Consider implementing lazy loading for better performance');
    }

    if (metrics.reRenderCount && metrics.reRenderCount > 10) {
      recommendations.push('High re-render count detected. Consider using React.memo or useMemo');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('High memory usage detected. Check for memory leaks');
    }

    if (metrics.cacheHitRate && metrics.cacheHitRate < 0.7) {
      recommendations.push('Low cache hit rate. Consider improving cache strategy');
    }

    return recommendations;
  }

  // Cleanup performance marks and measures
  private cleanup(measurementId: string): void {
    performance.clearMarks(`${measurementId}-start`);
    performance.clearMarks(`${measurementId}-end`);
    performance.clearMeasures(measurementId);
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current performance snapshot
  getSnapshot(): PerformanceSnapshot {
    return {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      recentEntries: this.entries.slice(-5),
      memoryUsage: ('memory' in performance) ? (performance as any).memory : undefined
    };
  }

  // Clear all entries
  clear(): void {
    this.entries = [];
  }

  // Dispose and cleanup
  dispose(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    this.clear();
  }
}

// Interfaces for performance reporting
interface AggregatedMetrics {
  totalLoadTime: number;
  markupProcessingTime: number;
  renderTime: number;
  memoryUsage: number;
  reRenderCount: number;
  cacheHitRate: number;
}

interface PerformanceTrends {
  loadTimeTrend: number;
  memoryTrend: number;
  reRenderTrend: number;
}

interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  totalEntries: number;
  metrics: AggregatedMetrics;
  trends: PerformanceTrends;
  recommendations: string[];
}

interface PerformanceSnapshot {
  timestamp: number;
  sessionId: string;
  recentEntries: PerformanceEntry[];
  memoryUsage?: any;
}

// React hook for form performance monitoring
export const useFormPerformanceMonitor = (formId?: string, config?: Partial<PerformanceConfig>) => {
  const [monitor] = useState(() => new FormPerformanceMonitor(config));
  const measurementRef = useRef<string | null>(null);
  const [metrics, setMetrics] = useState<PerformanceSnapshot | null>(null);

  // Start measurement when form loading begins
  const startMeasurement = useCallback(() => {
    if (formId && !measurementRef.current) {
      measurementRef.current = monitor.startFormLoading(formId);
    }
  }, [formId, monitor]);

  // End measurement when form loading completes
  const endMeasurement = useCallback((additionalMetrics?: Partial<FormPerformanceMetrics>) => {
    if (formId && measurementRef.current) {
      monitor.endFormLoading(measurementRef.current, formId, additionalMetrics);
      measurementRef.current = null;
    }
  }, [formId, monitor]);

  // Get current performance snapshot
  const getSnapshot = useCallback(() => {
    return monitor.getSnapshot();
  }, [monitor]);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(monitor.getSnapshot());
    }, 5000);

    return () => clearInterval(interval);
  }, [monitor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => monitor.dispose();
  }, [monitor]);

  return {
    startMeasurement,
    endMeasurement,
    getSnapshot,
    metrics,
    generateReport: () => monitor.generateReport()
  };
};