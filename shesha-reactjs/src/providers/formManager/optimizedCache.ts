import { FormConfigurationDto } from '@/apis/formConfiguration';
import { IFlatComponentsStructure, IFormSettings } from '@/interfaces';
import { UpToDateForm } from './interfaces';

interface OptimizedFormCache {
  rawForm: FormConfigurationDto;
  processedForm: UpToDateForm;
  lastAccessed: number;
  accessCount: number;
  size: number;
  compressionEnabled?: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  averageAccessTime: number;
}

export class FormCacheManager {
  private cache = new Map<string, OptimizedFormCache>();
  private maxSize: number;
  private maxMemoryMB: number;
  private compressionEnabled: boolean;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    averageAccessTime: 0
  };

  constructor(config: {
    maxSize?: number;
    maxMemoryMB?: number;
    compressionEnabled?: boolean;
  } = {}) {
    this.maxSize = config.maxSize || 50;
    this.maxMemoryMB = config.maxMemoryMB || 100;
    this.compressionEnabled = config.compressionEnabled || false;
  }

  async getForm(key: string): Promise<UpToDateForm | null> {
    const startTime = performance.now();
    
    const cached = this.cache.get(key);
    if (cached) {
      cached.lastAccessed = Date.now();
      cached.accessCount++;
      this.metrics.hits++;
      
      const accessTime = performance.now() - startTime;
      this.updateAverageAccessTime(accessTime);
      
      return cached.processedForm;
    }
    
    this.metrics.misses++;
    return null;
  }

  async setForm(key: string, rawForm: FormConfigurationDto, processedForm: UpToDateForm): Promise<void> {
    const size = this.estimateSize(rawForm, processedForm);
    
    // Check if we need to evict before adding
    if (this.shouldEvict(size)) {
      await this.evictLeastUsed();
    }

    const cacheEntry: OptimizedFormCache = {
      rawForm,
      processedForm,
      lastAccessed: Date.now(),
      accessCount: 1,
      size,
      compressionEnabled: this.compressionEnabled
    };

    // Apply compression if enabled
    if (this.compressionEnabled) {
      cacheEntry.rawForm = await this.compressForm(rawForm);
    }

    this.cache.set(key, cacheEntry);
    this.metrics.totalSize += size;
  }

  private shouldEvict(newItemSize: number): boolean {
    return (
      this.cache.size >= this.maxSize ||
      (this.metrics.totalSize + newItemSize) > (this.maxMemoryMB * 1024 * 1024)
    );
  }

  private async evictLeastUsed(): Promise<void> {
    if (this.cache.size === 0) return;

    // Calculate score based on access frequency and recency
    const entries = Array.from(this.cache.entries())
      .map(([key, value]) => ({
        key,
        value,
        score: this.calculateEvictionScore(value)
      }))
      .sort((a, b) => a.score - b.score);

    // Evict 20% of least used items
    const evictCount = Math.max(1, Math.floor(this.cache.size * 0.2));
    const toEvict = entries.slice(0, evictCount);

    for (const { key, value } of toEvict) {
      this.cache.delete(key);
      this.metrics.totalSize -= value.size;
      this.metrics.evictions++;
    }
  }

  private calculateEvictionScore(cacheEntry: OptimizedFormCache): number {
    const now = Date.now();
    const timeSinceAccess = now - cacheEntry.lastAccessed;
    const hoursSinceAccess = timeSinceAccess / (1000 * 60 * 60);
    
    // Score = time decay / access frequency (lower is better for eviction)
    return hoursSinceAccess / (cacheEntry.accessCount + 1);
  }

  private estimateSize(rawForm: FormConfigurationDto, processedForm: UpToDateForm): number {
    // Rough estimation of memory usage in bytes
    const rawSize = JSON.stringify(rawForm).length * 2; // UTF-16
    const processedSize = JSON.stringify(processedForm).length * 2;
    return rawSize + processedSize;
  }

  private async compressForm(form: FormConfigurationDto): Promise<FormConfigurationDto> {
    // Simple compression strategy - can be enhanced with actual compression library
    if (form.markup) {
      try {
        // Minify JSON if possible
        const parsed = JSON.parse(form.markup);
        form.markup = JSON.stringify(parsed);
      } catch {
        // If parsing fails, keep original
      }
    }
    return form;
  }

  private updateAverageAccessTime(accessTime: number): void {
    const totalAccesses = this.metrics.hits + this.metrics.misses;
    this.metrics.averageAccessTime = 
      (this.metrics.averageAccessTime * (totalAccesses - 1) + accessTime) / totalAccesses;
  }

  // Prefetch forms during idle time
  prefetchForms(formKeys: string[], loadForm: (key: string) => Promise<{ raw: FormConfigurationDto, processed: UpToDateForm }>): void {
    if ('requestIdleCallback' in window) {
      const prefetchNext = (index: number) => {
        if (index >= formKeys.length) return;
        
        requestIdleCallback(async () => {
          const key = formKeys[index];
          if (!this.cache.has(key)) {
            try {
              const { raw, processed } = await loadForm(key);
              await this.setForm(key, raw, processed);
            } catch (error) {
              console.warn(`Failed to prefetch form ${key}:`, error);
            }
          }
          prefetchNext(index + 1);
        });
      };
      
      prefetchNext(0);
    }
  }

  // Warm up cache with commonly used forms
  async warmupCache(commonForms: Array<{ key: string, loader: () => Promise<{ raw: FormConfigurationDto, processed: UpToDateForm }> }>): Promise<void> {
    const promises = commonForms.map(async ({ key, loader }) => {
      try {
        const { raw, processed } = await loader();
        await this.setForm(key, raw, processed);
      } catch (error) {
        console.warn(`Failed to warm up cache for form ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Get cache statistics
  getMetrics(): CacheMetrics & { hitRate: number; cacheSize: number } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? this.metrics.hits / total : 0;
    
    return {
      ...this.metrics,
      hitRate,
      cacheSize: this.cache.size
    };
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      averageAccessTime: 0
    };
  }

  // Remove specific form from cache
  remove(key: string): boolean {
    const cached = this.cache.get(key);
    if (cached) {
      this.cache.delete(key);
      this.metrics.totalSize -= cached.size;
      return true;
    }
    return false;
  }
}