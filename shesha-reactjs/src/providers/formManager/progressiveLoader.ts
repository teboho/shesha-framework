import React, { useState, useEffect, useCallback } from 'react';
import { IFlatComponentsStructure, IFormSettings } from '@/interfaces';

export interface FormSection {
  id: string;
  priority: number;
  components: string[];
  dependencies?: string[];
  isVisible: boolean;
  isLoaded: boolean;
}

interface ProgressiveLoadingConfig {
  chunkSize: number;
  loadDelay: number;
  enableIntersectionObserver: boolean;
  priorityThreshold: number;
}

interface LoadingState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  progress: number;
  error?: Error;
}

export class ProgressiveFormLoader {
  private sections: Map<string, FormSection> = new Map();
  private loadedSections = new Set<string>();
  private intersectionObserver?: IntersectionObserver;
  private config: ProgressiveLoadingConfig;

  constructor(config: Partial<ProgressiveLoadingConfig> = {}) {
    this.config = {
      chunkSize: 5,
      loadDelay: 50,
      enableIntersectionObserver: true,
      priorityThreshold: 1,
      ...config
    };

    this.setupIntersectionObserver();
  }

  // Analyze form structure and create sections
  analyzeFormStructure(flatStructure: IFlatComponentsStructure): FormSection[] {
    const sections: FormSection[] = [];
    const components = flatStructure.allComponents;
    
    // Group components by containers/sections
    const containers = Object.values(components).filter(c => 
      c.componentType === 'container' || 
      c.componentType === 'section' ||
      c.componentType === 'tabs'
    );

    if (containers.length === 0) {
      // If no containers, create sections based on component chunks
      return this.createChunkBasedSections(flatStructure);
    }

    // Create sections based on containers
    containers.forEach((container, index) => {
      const childComponents = this.getChildComponents(container.id, flatStructure);
      const section: FormSection = {
        id: container.id,
        priority: this.calculatePriority(container, index),
        components: childComponents,
        dependencies: this.findDependencies(container, flatStructure),
        isVisible: index === 0, // First section is visible by default
        isLoaded: false
      };
      sections.push(section);
    });

    return sections.sort((a, b) => b.priority - a.priority);
  }

  // Create sections based on component chunks when no containers exist
  private createChunkBasedSections(flatStructure: IFlatComponentsStructure): FormSection[] {
    const allComponentIds = Object.keys(flatStructure.allComponents);
    const sections: FormSection[] = [];
    
    for (let i = 0; i < allComponentIds.length; i += this.config.chunkSize) {
      const chunk = allComponentIds.slice(i, i + this.config.chunkSize);
      const section: FormSection = {
        id: `chunk-${i / this.config.chunkSize}`,
        priority: allComponentIds.length - i, // Higher priority for earlier chunks
        components: chunk,
        isVisible: i === 0,
        isLoaded: false
      };
      sections.push(section);
    }

    return sections;
  }

  // Get child components of a container
  private getChildComponents(containerId: string, flatStructure: IFlatComponentsStructure): string[] {
    const children: string[] = [];
    const addChildren = (parentId: string) => {
      Object.values(flatStructure.allComponents).forEach(component => {
        if (component.parentId === parentId) {
          children.push(component.id);
          addChildren(component.id); // Recursively add nested children
        }
      });
    };
    
    addChildren(containerId);
    return children;
  }

  // Calculate priority for a component/section
  private calculatePriority(component: any, index: number): number {
    let priority = 10 - index; // Base priority decreases with position
    
    // Increase priority for certain component types
    if (component.componentType === 'textField' || 
        component.componentType === 'numberField' ||
        component.componentType === 'button') {
      priority += 5;
    }
    
    // Increase priority for required fields
    if (component.required) {
      priority += 3;
    }
    
    // Increase priority for components with validation
    if (component.validationRules?.length > 0) {
      priority += 2;
    }

    return priority;
  }

  // Find dependencies between components
  private findDependencies(component: any, flatStructure: IFlatComponentsStructure): string[] {
    const dependencies: string[] = [];
    
    // Look for references to other components in expressions
    if (component.customVisibility) {
      const matches = component.customVisibility.match(/\{([^}]+)\}/g);
      if (matches) {
        matches.forEach((match: string) => {
          const fieldName = match.slice(1, -1);
          const dependentComponent = Object.values(flatStructure.allComponents)
            .find(c => c.name === fieldName);
          if (dependentComponent) {
            dependencies.push(dependentComponent.id);
          }
        });
      }
    }

    return dependencies;
  }

  // Setup intersection observer for lazy loading
  private setupIntersectionObserver(): void {
    if (!this.config.enableIntersectionObserver || typeof window === 'undefined') {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              this.loadSection(sectionId);
            }
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before the section becomes visible
        threshold: 0.1
      }
    );
  }

  // Load a specific section
  async loadSection(sectionId: string): Promise<void> {
    const section = this.sections.get(sectionId);
    if (!section || section.isLoaded || this.loadedSections.has(sectionId)) {
      return;
    }

    // Load dependencies first
    if (section.dependencies) {
      await Promise.all(
        section.dependencies.map(depId => this.loadSection(depId))
      );
    }

    section.isLoaded = true;
    this.loadedSections.add(sectionId);
    
    // Simulate loading delay for smooth UX
    if (this.config.loadDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.loadDelay));
    }
  }

  // Load high-priority sections immediately
  async loadPrioritySections(sections: FormSection[]): Promise<void> {
    const prioritySections = sections.filter(s => s.priority >= this.config.priorityThreshold);
    
    await Promise.all(
      prioritySections.map(section => this.loadSection(section.id))
    );
  }

  // Start progressive loading
  startProgressiveLoading(sections: FormSection[]): void {
    this.sections.clear();
    this.loadedSections.clear();
    
    sections.forEach(section => {
      this.sections.set(section.id, section);
    });

    // Load priority sections immediately
    this.loadPrioritySections(sections);

    // Load remaining sections with delay
    const remainingSections = sections.filter(s => s.priority < this.config.priorityThreshold);
    this.loadRemainingSecitons(remainingSections);
  }

  // Load remaining sections progressively
  private async loadRemainingSecitons(sections: FormSection[]): Promise<void> {
    for (const section of sections) {
      if (!section.isLoaded) {
        await this.loadSection(section.id);
        // Small delay between sections to avoid blocking UI
        await new Promise(resolve => setTimeout(resolve, this.config.loadDelay));
      }
    }
  }

  // Observe a section element for intersection
  observeSection(element: HTMLElement, sectionId: string): void {
    if (this.intersectionObserver) {
      element.setAttribute('data-section-id', sectionId);
      this.intersectionObserver.observe(element);
    }
  }

  // Stop observing a section element
  unobserveSection(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  // Check if a section is loaded
  isSectionLoaded(sectionId: string): boolean {
    return this.loadedSections.has(sectionId);
  }

  // Get loading progress (0-100)
  getProgress(): number {
    if (this.sections.size === 0) return 100;
    return (this.loadedSections.size / this.sections.size) * 100;
  }

  // Cleanup
  dispose(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.sections.clear();
    this.loadedSections.clear();
  }
}

// React hook for progressive form loading
export const useProgressiveFormLoading = (
  flatStructure?: IFlatComponentsStructure,
  config?: Partial<ProgressiveLoadingConfig>
) => {
  const [loader] = useState(() => new ProgressiveFormLoader(config));
  const [sections, setSections] = useState<FormSection[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: 'idle',
    progress: 0
  });

  // Analyze form structure when it changes
  useEffect(() => {
    if (flatStructure) {
      const analyzedSections = loader.analyzeFormStructure(flatStructure);
      setSections(analyzedSections);
      setLoadingState({ status: 'loading', progress: 0 });
      
      loader.startProgressiveLoading(analyzedSections);
    }
  }, [flatStructure, loader]);

  // Update progress
  useEffect(() => {
    const interval = setInterval(() => {
      const progress = loader.getProgress();
      setLoadingState(prev => ({ 
        ...prev, 
        progress,
        status: progress === 100 ? 'loaded' : 'loading'
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [loader]);

  // Cleanup on unmount
  useEffect(() => {
    return () => loader.dispose();
  }, [loader]);

  const loadSection = useCallback((sectionId: string) => {
    return loader.loadSection(sectionId);
  }, [loader]);

  const isSectionLoaded = useCallback((sectionId: string) => {
    return loader.isSectionLoaded(sectionId);
  }, [loader]);

  const observeSection = useCallback((element: HTMLElement, sectionId: string) => {
    loader.observeSection(element, sectionId);
  }, [loader]);

  const unobserveSection = useCallback((element: HTMLElement) => {
    loader.unobserveSection(element);
  }, [loader]);

  return {
    sections,
    loadingState,
    loadSection,
    isSectionLoaded,
    observeSection,
    unobserveSection
  };
};