import { FormIdentifier } from '@/interfaces';
import { ConfigurationItemsViewMode } from '../appConfigurator/models';

interface PrefetchConfig {
  maxConcurrentRequests: number;
  prefetchDelay: number;
  enableRouteBasedPrefetch: boolean;
  enableIdleTimePrefetch: boolean;
}

interface RouteFormMapping {
  [route: string]: string[];
}

interface PrefetchMetrics {
  prefetchedCount: number;
  successfulPrefetches: number;
  failedPrefetches: number;
  cacheHitsFromPrefetch: number;
}

export class FormPrefetcher {
  private prefetchQueue = new Set<string>();
  private activePrefetches = new Map<string, Promise<void>>();
  private metrics: PrefetchMetrics = {
    prefetchedCount: 0,
    successfulPrefetches: 0,
    failedPrefetches: 0,
    cacheHitsFromPrefetch: 0
  };
  
  private config: PrefetchConfig;
  private routeFormMapping: RouteFormMapping = {};
  private userNavigationHistory: string[] = [];
  private isIdle = false;

  constructor(
    config: Partial<PrefetchConfig> = {},
    private formLoader: (formId: FormIdentifier, mode?: ConfigurationItemsViewMode) => Promise<void>
  ) {
    this.config = {
      maxConcurrentRequests: 3,
      prefetchDelay: 100,
      enableRouteBasedPrefetch: true,
      enableIdleTimePrefetch: true,
      ...config
    };

    this.setupIdleDetection();
    this.loadRouteFormMapping();
  }

  // Prefetch based on current route
  prefetchByRoute(currentRoute: string): void {
    if (!this.config.enableRouteBasedPrefetch) return;

    const likelyForms = this.predictNextForms(currentRoute);
    likelyForms.forEach(formId => this.queuePrefetch(formId));
    
    this.processQueue();
  }

  // Prefetch forms based on user navigation patterns
  prefetchByNavigationPattern(currentRoute: string): void {
    this.userNavigationHistory.push(currentRoute);
    
    // Keep only last 10 routes for pattern analysis
    if (this.userNavigationHistory.length > 10) {
      this.userNavigationHistory.shift();
    }

    const predictedRoutes = this.analyzeNavigationPattern();
    predictedRoutes.forEach(route => {
      const forms = this.routeFormMapping[route] || [];
      forms.forEach(formId => this.queuePrefetch(formId));
    });

    this.processQueue();
  }

  // Queue a form for prefetching
  private queuePrefetch(formId: string): void {
    if (this.activePrefetches.has(formId)) return;
    this.prefetchQueue.add(formId);
  }

  // Process the prefetch queue
  private async processQueue(): Promise<void> {
    if (this.activePrefetches.size >= this.config.maxConcurrentRequests) {
      return;
    }

    const formId = this.getNextFromQueue();
    if (!formId) return;

    this.prefetchQueue.delete(formId);
    await this.prefetchForm(formId);
    
    // Continue processing queue
    if (this.prefetchQueue.size > 0) {
      setTimeout(() => this.processQueue(), this.config.prefetchDelay);
    }
  }

  // Get next form ID from queue (with priority logic)
  private getNextFromQueue(): string | null {
    if (this.prefetchQueue.size === 0) return null;
    
    // Simple FIFO for now, can be enhanced with priority logic
    const iterator = this.prefetchQueue.values();
    const next = iterator.next();
    return next.done ? null : next.value;
  }

  // Actually prefetch a single form
  private async prefetchForm(formId: string): Promise<void> {
    const prefetchPromise = this.performPrefetch(formId);
    this.activePrefetches.set(formId, prefetchPromise);
    
    try {
      await prefetchPromise;
      this.metrics.successfulPrefetches++;
    } catch (error) {
      this.metrics.failedPrefetches++;
      console.warn(`Failed to prefetch form ${formId}:`, error);
    } finally {
      this.activePrefetches.delete(formId);
      this.metrics.prefetchedCount++;
    }
  }

  // Perform the actual prefetch operation
  private async performPrefetch(formId: string): Promise<void> {
    // Parse form ID - this is simplified, real implementation would be more robust
    const parsedFormId: FormIdentifier = this.parseFormId(formId);
    await this.formLoader(parsedFormId, 'live');
  }

  // Parse string form ID to FormIdentifier
  private parseFormId(formId: string): FormIdentifier {
    if (formId.includes('/')) {
      const [module, name] = formId.split('/');
      return { module, name };
    }
    return formId as any; // Assume it's a raw ID
  }

  // Predict next forms based on current route
  private predictNextForms(route: string): string[] {
    // Get forms mapped to this route
    const routeForms = this.routeFormMapping[route] || [];
    
    // Add forms from similar routes (simple pattern matching)
    const similarRoutes = Object.keys(this.routeFormMapping)
      .filter(r => this.calculateRouteSimilarity(route, r) > 0.7);
    
    const similarForms = similarRoutes.flatMap(r => this.routeFormMapping[r] || []);
    
    return [...new Set([...routeForms, ...similarForms])];
  }

  // Calculate similarity between two routes
  private calculateRouteSimilarity(route1: string, route2: string): number {
    const parts1 = route1.split('/').filter(Boolean);
    const parts2 = route2.split('/').filter(Boolean);
    
    const maxLength = Math.max(parts1.length, parts2.length);
    if (maxLength === 0) return 1;
    
    let matches = 0;
    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
      if (parts1[i] === parts2[i]) matches++;
    }
    
    return matches / maxLength;
  }

  // Analyze navigation pattern to predict next routes
  private analyzeNavigationPattern(): string[] {
    if (this.userNavigationHistory.length < 3) return [];
    
    const patterns: { [key: string]: number } = {};
    
    // Look for sequence patterns in navigation history
    for (let i = 0; i < this.userNavigationHistory.length - 2; i++) {
      const sequence = this.userNavigationHistory.slice(i, i + 2).join('->');
      const nextRoute = this.userNavigationHistory[i + 2];
      
      const pattern = `${sequence}->${nextRoute}`;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
    
    // Find most common patterns and predict next routes
    const currentSequence = this.userNavigationHistory.slice(-2).join('->');
    const predictions = Object.keys(patterns)
      .filter(pattern => pattern.startsWith(currentSequence))
      .sort((a, b) => patterns[b] - patterns[a])
      .slice(0, 3) // Top 3 predictions
      .map(pattern => pattern.split('->')[2]);
    
    return predictions;
  }

  // Setup idle detection for background prefetching
  private setupIdleDetection(): void {
    if (!this.config.enableIdleTimePrefetch || !('requestIdleCallback' in window)) {
      return;
    }

    let idleTimeout: NodeJS.Timeout;
    const resetIdleTimer = () => {
      this.isIdle = false;
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        this.isIdle = true;
        this.prefetchDuringIdle();
      }, 2000); // Consider idle after 2 seconds
    };

    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();
  }

  // Prefetch during idle time
  private prefetchDuringIdle(): void {
    if (!this.isIdle || this.prefetchQueue.size === 0) return;

    requestIdleCallback(() => {
      if (this.isIdle && this.prefetchQueue.size > 0) {
        this.processQueue();
      }
    });
  }

  // Load route-to-form mappings (would typically come from configuration)
  private loadRouteFormMapping(): void {
    // This would typically be loaded from a configuration file or API
    // For now, using some example mappings
    this.routeFormMapping = {
      '/dashboard': ['dashboard-form', 'widget-form'],
      '/users': ['user-list-form', 'user-details-form'],
      '/settings': ['settings-form', 'preferences-form'],
      '/reports': ['report-list-form', 'report-viewer-form'],
      // Add more mappings based on your application
    };
  }

  // Update route-to-form mapping
  updateRouteFormMapping(mapping: RouteFormMapping): void {
    this.routeFormMapping = { ...this.routeFormMapping, ...mapping };
  }

  // Add a single route mapping
  addRouteMapping(route: string, formIds: string[]): void {
    this.routeFormMapping[route] = [...(this.routeFormMapping[route] || []), ...formIds];
  }

  // Clear prefetch queue
  clearQueue(): void {
    this.prefetchQueue.clear();
  }

  // Get prefetch metrics
  getMetrics(): PrefetchMetrics & { queueSize: number; activePrefetches: number } {
    return {
      ...this.metrics,
      queueSize: this.prefetchQueue.size,
      activePrefetches: this.activePrefetches.size
    };
  }

  // Enable/disable prefetching
  setEnabled(enabled: boolean): void {
    this.config.enableRouteBasedPrefetch = enabled;
    this.config.enableIdleTimePrefetch = enabled;
    
    if (!enabled) {
      this.clearQueue();
    }
  }

  // Record cache hit from prefetch (to track effectiveness)
  recordCacheHitFromPrefetch(): void {
    this.metrics.cacheHitsFromPrefetch++;
  }
}