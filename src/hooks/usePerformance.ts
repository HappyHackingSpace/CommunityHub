// src/hooks/usePerformance.ts - REACT HOOKS FOR PERFORMANCE
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { startMeasure } from '@/lib/cache';

// 🚀 PERFORMANCE: React hook for performance monitoring
export function usePerformanceMonitor(name: string, deps: any[] = []) {
  const endMeasure = useRef<(() => number) | null>(null);

  useEffect(() => {
    endMeasure.current = startMeasure(name);
    
    return () => {
      if (endMeasure.current) {
        const duration = endMeasure.current();
        if (process.env.NODE_ENV === 'development' && duration > 100) {
          console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }
      }
    };
  }, deps);
}

// 🚀 PERFORMANCE: Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // SSR fallback
  });
  
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection info if available
    const connection = (navigator as any).connection;
    if (connection) {
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
}

// 🚀 PERFORMANCE: Debounced value hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 🚀 PERFORMANCE: Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastResult = useRef<ReturnType<T> | undefined>(undefined);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      const result = callback(...args);
      lastResult.current = result;
      return result;
    }
    return lastResult.current;
  }, [callback, delay]) as T;
}

// 🚀 PERFORMANCE: Cache-aware data fetching hook
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    refetchOnMount?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const { ttl = 5 * 60 * 1000, enabled = true, refetchOnMount = false } = options;
  
  const fetchData = useCallback(async (force: boolean = false) => {
    if (!enabled && !force) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
      setIsStale(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch error');
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    if (enabled && (refetchOnMount || !data)) {
      fetchData();
    }
  }, [enabled, refetchOnMount, data, fetchData]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: () => fetchData(true)
  };
}

// 🚀 PERFORMANCE: Intersection observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isIntersecting] as const;
}

// 🚀 PERFORMANCE: Memory usage monitoring hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      // Check if performance.memory exists (Chrome-only feature)
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        if (memory && typeof memory.usedJSHeapSize === 'number') {
          setMemoryInfo({
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usagePercentage: memory.jsHeapSizeLimit > 0 
              ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 
              : 0
          });
        }
      } else {
        // Set null if memory API is not available
        setMemoryInfo(null);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// 🚀 PERFORMANCE: Render count tracking hook (development only)
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  
  if (process.env.NODE_ENV === 'development') {
    renderCount.current++;
    console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
  }
  
  return renderCount.current;
}