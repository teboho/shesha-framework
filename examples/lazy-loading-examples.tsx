/**
 * Lazy Loading Examples for Shesha Framework Components
 * Demonstrates how to implement code splitting for better performance
 */

import React from 'react';
import { createLazyRoute, createLazyWidget, createViewportLazyComponent, preloadComponent } from '../utils/lazyComponent';

// ========================================
// 1. ROUTE-LEVEL LAZY LOADING
// ========================================

// Heavy admin pages that should be lazy loaded
export const LazyFormDesigner = createLazyRoute(
  () => import('../src/components/formDesigner'),
  'Form Designer'
);

export const LazyConfigurationFramework = createLazyRoute(
  () => import('../src/components/configurationFramework'),
  'Configuration Framework'
);

export const LazyModelConfigurator = createLazyRoute(
  () => import('../src/components/modelConfigurator'),
  'Model Configurator'
);

export const LazyDataTable = createLazyRoute(
  () => import('../src/components/dataTable'),
  'Data Table'
);

// ========================================
// 2. HEAVY WIDGET LAZY LOADING
// ========================================

// Rich text editor - heavy component with lots of dependencies
export const LazyRichTextEditor = createLazyWidget(
  () => import('../src/designer-components/richTextEditor'),
  'Rich Text Editor'
);

// Code editor - heavy Monaco editor
export const LazyCodeEditor = createLazyWidget(
  () => import('../src/designer-components/codeEditor'),
  'Code Editor'
);

// Query builder - complex component with many dependencies
export const LazyQueryBuilder = createLazyWidget(
  () => import('../src/designer-components/queryBuilder'),
  'Query Builder'
);

// Charts component - heavy charting libraries
export const LazyCharts = createLazyWidget(
  () => import('../src/designer-components/charts'),
  'Charts'
);

// Kanban board - complex drag-and-drop component
export const LazyKanban = createLazyWidget(
  () => import('../src/designer-components/kanban'),
  'Kanban Board'
);

// ========================================
// 3. VIEWPORT-BASED LAZY LOADING
// ========================================

// Components that should only load when visible
export const LazyImageAnnotation = createViewportLazyComponent(
  () => import('../src/designer-components/imageAnnotation'),
  {
    rootMargin: '100px', // Load when 100px before entering viewport
    loadingProps: { tip: 'Loading image annotation...', minHeight: 200 }
  }
);

export const LazyFileUpload = createViewportLazyComponent(
  () => import('../src/designer-components/fileUpload'),
  {
    rootMargin: '50px',
    loadingProps: { tip: 'Loading file upload...', minHeight: 100 }
  }
);

// ========================================
// 4. DYNAMIC IMPORT EXAMPLES
// ========================================

// Dynamic loading based on user permissions
export const createConditionalLazyComponent = (userHasPermission: boolean, componentName: string) => {
  if (!userHasPermission) {
    return () => React.createElement('div', null, 'Access Denied');
  }

  switch (componentName) {
    case 'permissions':
      return createLazyWidget(
        () => import('../src/designer-components/permissions'),
        'Permissions Manager'
      );
    case 'settingsEditor':
      return createLazyWidget(
        () => import('../src/designer-components/settingsEditor'),
        'Settings Editor'
      );
    default:
      return () => React.createElement('div', null, 'Component not found');
  }
};

// Dynamic loading based on feature flags
export const createFeatureFlagLazyComponent = (featureEnabled: boolean, fallback?: React.ComponentType) => {
  if (!featureEnabled) {
    return fallback || (() => null);
  }

  return createLazyWidget(
    () => import('../src/designer-components/dynamicView'),
    'Dynamic View'
  );
};

// ========================================
// 5. PRELOADING STRATEGIES
// ========================================

// Preload commonly used components on idle
export const preloadCommonComponents = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload likely-to-be-used components
      preloadComponent(() => import('../src/designer-components/button'));
      preloadComponent(() => import('../src/designer-components/text'));
      preloadComponent(() => import('../src/designer-components/textField'));
    });
  }
};

// Preload on user interaction
export const preloadOnHover = (componentImport: () => Promise<any>) => {
  return {
    onMouseEnter: () => {
      preloadComponent(componentImport);
    }
  };
};

// ========================================
// 6. USAGE EXAMPLES IN COMPONENTS
// ========================================

// Example: Lazy loaded form with preloading
const LazyFormExample: React.FC = () => {
  React.useEffect(() => {
    // Preload form components likely to be used
    preloadCommonComponents();
  }, []);

  return (
    <div>
      <h2>Dynamic Form Builder</h2>
      <div {...preloadOnHover(() => import('../src/components/formDesigner'))}>
        <button>Open Form Designer</button>
      </div>
      
      {/* Form designer loads only when needed */}
      <React.Suspense fallback={<div>Loading form designer...</div>}>
        <LazyFormDesigner />
      </React.Suspense>
    </div>
  );
};

// Example: Conditional lazy loading
const ConditionalComponentExample: React.FC<{ userRole: string }> = ({ userRole }) => {
  const isAdmin = userRole === 'admin';
  const hasAdvancedFeatures = userRole === 'admin' || userRole === 'poweruser';

  const AdminPanel = createConditionalLazyComponent(isAdmin, 'permissions');
  const AdvancedEditor = createFeatureFlagLazyComponent(hasAdvancedFeatures);

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {hasAdvancedFeatures && <AdvancedEditor />}
    </div>
  );
};

// Example: Progressive component loading
const ProgressiveLoadingExample: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div>
      {/* Basic components load immediately */}
      <div>Basic Form Fields</div>
      
      <button onClick={() => setShowAdvanced(true)}>
        Show Advanced Features
      </button>
      
      {/* Advanced components load only when requested */}
      {showAdvanced && (
        <React.Suspense fallback={<div>Loading advanced features...</div>}>
          <LazyQueryBuilder />
          <LazyCodeEditor />
          <LazyCharts />
        </React.Suspense>
      )}
    </div>
  );
};

// ========================================
// 7. PERFORMANCE MONITORING
// ========================================

// Utility to measure lazy loading performance
export const measureLazyLoadPerformance = (componentName: string) => {
  return async (importFunc: () => Promise<any>) => {
    const startTime = performance.now();
    
    try {
      const module = await importFunc();
      const loadTime = performance.now() - startTime;
      
      console.log(`[Lazy Load] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lazy_component_load', {
          component_name: componentName,
          load_time: Math.round(loadTime)
        });
      }
      
      return module;
    } catch (error) {
      console.error(`[Lazy Load] Failed to load ${componentName}:`, error);
      throw error;
    }
  };
};

// Enhanced lazy component with performance monitoring
export const createMonitoredLazyComponent = (
  importFunc: () => Promise<any>,
  componentName: string
) => {
  const monitoredImport = measureLazyLoadPerformance(componentName)(importFunc);
  return createLazyWidget(() => monitoredImport, componentName);
};

export default {
  LazyFormDesigner,
  LazyConfigurationFramework,
  LazyModelConfigurator,
  LazyDataTable,
  LazyRichTextEditor,
  LazyCodeEditor,
  LazyQueryBuilder,
  LazyCharts,
  LazyKanban,
  LazyImageAnnotation,
  LazyFileUpload,
  createConditionalLazyComponent,
  createFeatureFlagLazyComponent,
  preloadCommonComponents,
  preloadOnHover,
  measureLazyLoadPerformance,
  createMonitoredLazyComponent
};