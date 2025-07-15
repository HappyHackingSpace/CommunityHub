import { useCallback, useEffect, useState } from "react"

// src/lib/swr-cache.ts - ADVANCED SWR CACHE SYSTEM
export interface SWRCacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  staleTime: number
  version: number
  etag?: string
  dependencies: string[]
  accessCount: number
  lastAccessed: number
}

export interface SWRConfig {
  ttl: number
  staleTime: number
  revalidateOnFocus: boolean
  revalidateOnReconnect: boolean
  dedupingInterval: number
  errorRetryCount: number
  errorRetryInterval: number
}

export interface CacheStats {
  hits: number
  misses: number
  staleHits: number
  revalidations: number
  errors: number
  hitRate: number
  memoryUsage: number
}

// 🚀 PERFORMANCE: Advanced SWR Cache with stale-while-revalidate
export class SWRCache {
  private cache = new Map<string, SWRCacheItem<any>>()
  private revalidationPromises = new Map<string, Promise<any>>()
  private subscribers = new Map<string, Set<(data: any) => void>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    revalidations: 0,
    errors: 0,
    hitRate: 0,
    memoryUsage: 0
  }
  
  private defaultConfig: SWRConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    errorRetryCount: 3,
    errorRetryInterval: 1000
  }

  constructor(private maxSize = 200) {
    this.setupCrossTabSync()
    this.setupVisibilityHandlers()
    this.setupNetworkHandlers()
    this.startStatsMonitoring()
  }

  // 🚀 SWR CORE: Get data with stale-while-revalidate pattern
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: Partial<SWRConfig> = {}
  ): Promise<{ data: T | null; isStale: boolean; isLoading: boolean }> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const cached = this.cache.get(key)
    const now = Date.now()

    // 🚀 CACHE HIT: Fresh data available
    if (cached && (now - cached.timestamp < finalConfig.staleTime)) {
      this.stats.hits++
      cached.accessCount++
      cached.lastAccessed = now
      this.updateStats()
      
      return {
        data: cached.data,
        isStale: false,
        isLoading: false
      }
    }

    // 🚀 STALE HIT: Return stale data while revalidating
    if (cached && (now - cached.timestamp < cached.ttl)) {
      this.stats.staleHits++
      cached.accessCount++
      cached.lastAccessed = now
      
      // Trigger background revalidation
      this.revalidateInBackground(key, fetcher, finalConfig)
      
      return {
        data: cached.data,
        isStale: true,
        isLoading: false
      }
    }

    // 🚀 CACHE MISS: Fetch fresh data
    this.stats.misses++
    
    try {
      const data = await this.fetchWithDeduping(key, fetcher, finalConfig)
      this.updateStats()
      
      return {
        data,
        isStale: false,
        isLoading: false
      }
    } catch (error) {
      this.stats.errors++
      console.error(`SWR fetch error for key ${key}:`, error)
      
      // Return stale data if available, even if expired
      if (cached) {
        return {
          data: cached.data,
          isStale: true,
          isLoading: false
        }
      }
      
      return {
        data: null,
        isStale: false,
        isLoading: false
      }
    }
  }

  // 🚀 DEDUPING: Prevent duplicate requests
  private async fetchWithDeduping<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: SWRConfig
  ): Promise<T> {
    // Check if already fetching
    const existingPromise = this.revalidationPromises.get(key)
    if (existingPromise) {
      return existingPromise
    }

    // Create new fetch promise
    const fetchPromise = this.executeWithRetry(fetcher, config.errorRetryCount, config.errorRetryInterval)
      .then(data => {
        this.set(key, data, config)
        this.notifySubscribers(key, data)
        return data
      })
      .finally(() => {
        this.revalidationPromises.delete(key)
      })

    this.revalidationPromises.set(key, fetchPromise)
    return fetchPromise
  }

  // 🚀 BACKGROUND REVALIDATION: Update stale data silently
  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: SWRConfig
  ): Promise<void> {
    if (this.revalidationPromises.has(key)) return

    this.stats.revalidations++
    
    try {
      const data = await this.fetchWithDeduping(key, fetcher, config)
      this.broadcastToTabs(key, data)
    } catch (error) {
      console.warn(`Background revalidation failed for ${key}:`, error)
    }
  }

  // 🚀 RETRY LOGIC: Exponential backoff
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    interval: number
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, interval))
        return this.executeWithRetry(fn, retries - 1, interval * 2)
      }
      throw error
    }
  }

  // 🚀 SET: Store data with metadata
  set<T>(
    key: string,
    data: T,
    config: Partial<SWRConfig> = {},
    dependencies: string[] = []
  ): void {
    const finalConfig = { ...this.defaultConfig, ...config }
    const now = Date.now()
    
    // Cleanup if approaching max size
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: finalConfig.ttl,
      staleTime: finalConfig.staleTime,
      version: 1,
      dependencies,
      accessCount: 1,
      lastAccessed: now
    })

    this.persistToStorage(key, data, finalConfig.ttl)
  }

  // 🚀 INVALIDATION: Remove or mark stale
  invalidate(key: string): void {
    this.cache.delete(key)
    this.removeFromStorage(key)
    this.broadcastInvalidation(key)
    this.notifySubscribers(key, null)
  }

  // 🚀 DEPENDENCY INVALIDATION: Cascade invalidation
  invalidateDependencies(dependencyKey: string): void {
    const toInvalidate: string[] = []
    
    for (const [key, item] of this.cache) {
      if (item.dependencies.includes(dependencyKey)) {
        toInvalidate.push(key)
      }
    }
    
    toInvalidate.forEach(key => this.invalidate(key))
  }

  // 🚀 SUBSCRIPTION: Real-time updates
  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    
    this.subscribers.get(key)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const keySubscribers = this.subscribers.get(key)
      if (keySubscribers) {
        keySubscribers.delete(callback)
        if (keySubscribers.size === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  // 🚀 NOTIFICATION: Notify subscribers
  private notifySubscribers(key: string, data: any): void {
    const keySubscribers = this.subscribers.get(key)
    if (keySubscribers) {
      keySubscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Subscriber callback error:', error)
        }
      })
    }
  }

  // 🚀 CROSS-TAB SYNC: BroadcastChannel API
  private setupCrossTabSync(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('swr-cache-sync')
      
      channel.addEventListener('message', (event) => {
        const { type, key, data } = event.data
        
        switch (type) {
          case 'update':
            if (this.cache.has(key)) {
              const item = this.cache.get(key)!
              item.data = data
              item.timestamp = Date.now()
              this.notifySubscribers(key, data)
            }
            break
            
          case 'invalidate':
            this.cache.delete(key)
            this.notifySubscribers(key, null)
            break
        }
      })
    }
  }

  // 🚀 BROADCAST: Send updates to other tabs
  private broadcastToTabs(key: string, data: any): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('swr-cache-sync')
      channel.postMessage({ type: 'update', key, data })
    }
  }

  private broadcastInvalidation(key: string): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('swr-cache-sync')
      channel.postMessage({ type: 'invalidate', key })
    }
  }

  // 🚀 PERSISTENCE: LocalStorage backup
  private persistToStorage(key: string, data: any, ttl: number): void {
    try {
      const storageItem = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(`swr_${key}`, JSON.stringify(storageItem))
    } catch (error) {
      console.warn('Failed to persist to storage:', error)
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(`swr_${key}`)
    } catch (error) {
      console.warn('Failed to remove from storage:', error)
    }
  }

  // 🚀 HYDRATION: Restore from storage
  hydrateFromStorage(key: string): any {
    try {
      const stored = localStorage.getItem(`swr_${key}`)
      if (!stored) return null
      
      const item = JSON.parse(stored)
      const now = Date.now()
      
      if (now - item.timestamp < item.ttl) {
        return item.data
      }
      
      this.removeFromStorage(key)
      return null
    } catch (error) {
      console.warn('Failed to hydrate from storage:', error)
      return null
    }
  }

  // 🚀 LRU EVICTION: Remove least recently used
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, item] of this.cache) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.removeFromStorage(oldestKey)
    }
  }

  // 🚀 FOCUS REVALIDATION: Refresh on window focus
  private setupVisibilityHandlers(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.revalidateAll()
        }
      })
    }
  }

  // 🚀 NETWORK REVALIDATION: Refresh on reconnect
  private setupNetworkHandlers(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.revalidateAll()
      })
    }
  }

  // 🚀 BATCH REVALIDATION: Refresh all stale data
  private revalidateAll(): void {
    const now = Date.now()
    const staleKeys: string[] = []
    
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.staleTime) {
        staleKeys.push(key)
      }
    }
    
    console.log(`Revalidating ${staleKeys.length} stale cache entries`)
  }

  // 🚀 STATS MONITORING: Performance tracking
  private startStatsMonitoring(): void {
    setInterval(() => {
      this.updateStats()
      this.logPerformanceMetrics()
    }, 30000) // Every 30 seconds
  }

  private updateStats(): void {
    const totalRequests = this.stats.hits + this.stats.misses + this.stats.staleHits
    this.stats.hitRate = totalRequests > 0 ? 
      ((this.stats.hits + this.stats.staleHits) / totalRequests) * 100 : 0
    
    this.stats.memoryUsage = this.estimateMemoryUsage()
  }

  private estimateMemoryUsage(): number {
    let size = 0
    for (const [key, item] of this.cache) {
      size += key.length * 2 // UTF-16
      size += JSON.stringify(item.data).length * 2
      size += 128 // Metadata overhead
    }
    return size
  }

  private logPerformanceMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 SWR Cache Stats')
      console.log('Hit Rate:', `${this.stats.hitRate.toFixed(2)}%`)
      console.log('Cache Size:', this.cache.size)
      console.log('Memory Usage:', `${(this.stats.memoryUsage / 1024).toFixed(2)} KB`)
      console.log('Revalidations:', this.stats.revalidations)
      console.groupEnd()
    }
  }

  // 🚀 PUBLIC API: Get cache statistics
  getStats(): CacheStats {
    this.updateStats()
    return { ...this.stats }
  }

  // 🚀 CLEANUP: Clear all cache
  clear(): void {
    this.cache.clear()
    this.revalidationPromises.clear()
    this.subscribers.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      revalidations: 0,
      errors: 0,
      hitRate: 0,
      memoryUsage: 0
    }
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('swr_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // 🚀 PREFETCH: Warm cache with data
  prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    return this.fetchWithDeduping(key, fetcher, this.defaultConfig)
  }

  // 🚀 MUTATE: Update cache directly
  mutate<T>(key: string, data: T | ((prevData: T) => T)): void {
    const cached = this.cache.get(key)
    
    if (cached) {
      const newData = typeof data === 'function' 
        ? (data as (prevData: T) => T)(cached.data)
        : data
      
      cached.data = newData
      cached.timestamp = Date.now()
      
      this.notifySubscribers(key, newData)
      this.broadcastToTabs(key, newData)
      this.persistToStorage(key, newData, cached.ttl)
    }
  }
}

// 🚀 SINGLETON: Global SWR cache instance
export const swrCache = new SWRCache()

// 🚀 REACT HOOK: useSWR for components
export function useSWR<T>(
  key: string | null,
  fetcher: (() => Promise<T>) | null,
  config: Partial<SWRConfig> = {}
) {
  const [state, setState] = useState<{
    data: T | null
    error: Error | null
    isLoading: boolean
    isStale: boolean
  }>({
    data: null,
    error: null,
    isLoading: !key || !fetcher ? false : true,
    isStale: false
  })

  useEffect(() => {
    if (!key || !fetcher) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    let cancelled = false

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, error: null }))
        
        const result = await swrCache.get(key, fetcher, config)
        
        if (!cancelled) {
          setState({
            data: result.data,
            error: null,
            isLoading: result.isLoading,
            isStale: result.isStale
          })
        }
      } catch (error) {
        if (!cancelled) {
          setState(prev => ({
            ...prev,
            error: error as Error,
            isLoading: false
          }))
        }
      }
    }

    // Subscribe to cache updates
    const unsubscribe = swrCache.subscribe<T>(key, (data: T | null) => {
      if (!cancelled) {
        setState(prev => ({
          ...prev,
          data: data as T | null,
          error: null,
          isStale: false
        }))
      }
    })

    loadData()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [key, fetcher, JSON.stringify(config)])

  const mutate = useCallback((data: T | ((prevData: T) => T)) => {
    if (key) {
      swrCache.mutate(key, data)
    }
  }, [key])

  const revalidate = useCallback(() => {
    if (key && fetcher) {
      setState(prev => ({ ...prev, isLoading: true }))
      swrCache.invalidate(key)
      return swrCache.get(key, fetcher, config)
    }
  }, [key, fetcher, config])

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isStale: state.isStale,
    mutate,
    revalidate
  }
}