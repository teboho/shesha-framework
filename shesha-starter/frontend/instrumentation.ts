// Next.js 15 Instrumentation API
// This file is automatically loaded when instrumentationHook is enabled

export async function register() {
  // Only run instrumentation in the appropriate environment
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Next.js 15 Instrumentation initialized');
    
    // Initialize performance monitoring
    await initializePerformanceMonitoring();
    
    // Setup error tracking
    await initializeErrorTracking();
    
    // Initialize telemetry collection
    await initializeTelemetry();
  }
}

async function initializePerformanceMonitoring() {
  try {
    // Enhanced performance monitoring for Next.js 15
    const { performance } = await import('perf_hooks');
    
    // Monitor Server Components performance
    performance.mark('server-components-init');
    
    // Track render performance
    const originalCreateElement = require('react').createElement;
    let renderCount = 0;
    
    require('react').createElement = function(...args: any[]) {
      const start = performance.now();
      const result = originalCreateElement.apply(this, args);
      const end = performance.now();
      
      renderCount++;
      if (renderCount % 100 === 0) {
        console.log(`🎭 React 19 render performance: ${(end - start).toFixed(2)}ms (${renderCount} renders)`);
      }
      
      return result;
    };
    
    console.log('✅ Performance monitoring initialized');
  } catch (error) {
    console.warn('⚠️ Performance monitoring setup failed:', error);
  }
}

async function initializeErrorTracking() {
  try {
    // Enhanced error boundary tracking for React 19
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception in Next.js 15:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        nextjsVersion: '15.x'
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Promise Rejection in Next.js 15:', {
        reason,
        promise,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        nextjsVersion: '15.x'
      });
    });

    console.log('✅ Error tracking initialized');
  } catch (error) {
    console.warn('⚠️ Error tracking setup failed:', error);
  }
}

async function initializeTelemetry() {
  try {
    // Next.js 15 telemetry collection
    const telemetryData = {
      nextjsVersion: '15.x',
      reactVersion: '19.x',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      features: {
        reactCompiler: true,
        turbopack: true,
        partialPrerendering: true,
        serverComponents: true,
        concurrentFeatures: true
      },
      timestamp: new Date().toISOString()
    };

    // Log telemetry (in production, you'd send this to your analytics service)
    console.log('📊 Next.js 15 Telemetry:', telemetryData);

    // Monitor bundle size and performance
    if (process.env.NODE_ENV === 'production') {
      const bundleAnalytics = await collectBundleAnalytics();
      console.log('📦 Bundle Analytics:', bundleAnalytics);
    }

    console.log('✅ Telemetry initialized');
  } catch (error) {
    console.warn('⚠️ Telemetry setup failed:', error);
  }
}

async function collectBundleAnalytics() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const buildDir = path.join(process.cwd(), '.next');
    
    if (fs.existsSync(buildDir)) {
      const buildManifest = path.join(buildDir, 'build-manifest.json');
      
      if (fs.existsSync(buildManifest)) {
        const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
        
        return {
          pageCount: Object.keys(manifest.pages || {}).length,
          staticFiles: Object.keys(manifest.pages || {}).filter(page => 
            page.startsWith('/_next/static/')
          ).length,
          buildTime: new Date().toISOString(),
          features: {
            turbopack: process.env.TURBOPACK === '1',
            ppr: true,
            reactCompiler: true
          }
        };
      }
    }
    
    return {
      status: 'build-manifest-not-found',
      buildDir: buildDir
    };
  } catch (error) {
    return {
      error: 'bundle-analytics-failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Enhanced Web Vitals reporting for Next.js 15
export function onRequestStart() {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (duration > 1000) {
      console.warn(`⚠️ Slow request detected: ${duration.toFixed(2)}ms`);
    }
  };
}

// Next.js 15 specific performance markers
export function markFeatureUsage(feature: string, metadata?: Record<string, any>) {
  try {
    console.log(`🎯 Feature usage: ${feature}`, metadata);
    
    // Track feature adoption for Next.js 15 features
    const nextjs15Features = [
      'react-compiler',
      'turbopack',
      'partial-prerendering',
      'server-components',
      'concurrent-features',
      'enhanced-image-optimization'
    ];
    
    if (nextjs15Features.includes(feature)) {
      console.log(`✨ Next.js 15 feature used: ${feature}`);
    }
  } catch (error) {
    console.warn('Failed to mark feature usage:', error);
  }
}

// Export utilities for use in components
export const instrumentation = {
  markFeatureUsage,
  onRequestStart,
  
  // Helper to check if running in Next.js 15
  isNextJS15: () => {
    try {
      const nextPackage = require('next/package.json');
      return nextPackage.version.startsWith('15.');
    } catch {
      return false;
    }
  },
  
  // Helper to check React 19 features
  hasReact19Features: () => {
    try {
      const reactPackage = require('react/package.json');
      return reactPackage.version.startsWith('19.') || reactPackage.version.startsWith('18.3.');
    } catch {
      return false;
    }
  }
};