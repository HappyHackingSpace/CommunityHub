// src/lib/cache.ts - PURE TYPESCRIPT CACHE UTILITIES
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
}

// 🚀 PERFORMANCE: Multi-layer cache manager
export class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private stats = { hits: 0, misses: 0 };
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  // 🚀 Get with stale-while-revalidate pattern
  get<T>(key: string): { data: T | null; isStale: boolean; exists: boolean } {
    const item = this.memoryCache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return { data: null, isStale: false, exists: false };
    }

    this.stats.hits++;
    item.accessCount++;
    item.lastAccessed = Date.now();

    const isStale = Date.now() - item.timestamp > item.ttl;
    return { data: item.data, isStale, exists: true };
  }

  // 🚀 Set with automatic cleanup
  set<T>(key: string, data: T, ttl?: number): void {
    const finalTTL = ttl || this.defaultTTL;
    
    // Cleanup if approaching max size
    if (this.memoryCache.size >= this.maxSize) {
      this.cleanup();
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: finalTTL,
      accessCount: 1,
      lastAccessed: Date.now()
    });
  }

  // 🚀 Cleanup least recently used items
  private cleanup(): void {
    if (this.memoryCache.size < this.maxSize) return;

    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by last accessed (LRU)
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest 25%
    const removeCount = Math.floor(entries.length * 0.25);
    for (let i = 0; i < removeCount; i++) {
      this.memoryCache.delete(entries[i][0]);
    }

    console.log(`🧹 Cache cleanup: Removed ${removeCount} items`);
  }

  // 🚀 Get cache statistics
  getStats(): CacheStats {
    const size = this.memoryCache.size;
    const memoryUsage = this.estimateMemoryUsage();
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size,
      memoryUsage,
      hitRate
    };
  }

  // 🚀 Estimate memory usage
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, item] of this.memoryCache) {
      totalSize += key.length * 2; // UTF-16
      totalSize += JSON.stringify(item.data).length * 2;
      totalSize += 64; // metadata overhead
    }
    return totalSize;
  }

  // 🚀 Clear cache
  clear(): void {
    this.memoryCache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  // 🚀 Remove expired items
  removeExpired(): number {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, item] of this.memoryCache) {
      if (now - item.timestamp > item.ttl) {
        expired.push(key);
      }
    }

    expired.forEach(key => this.memoryCache.delete(key));
    return expired.length;
  }

  // 🚀 Check if key exists and is fresh
  has(key: string): boolean {
    const item = this.memoryCache.get(key);
    if (!item) return false;
    return Date.now() - item.timestamp <= item.ttl;
  }

  // 🚀 Get all keys
  keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  // 🚀 Get cache size
  size(): number {
    return this.memoryCache.size;
  }
}

// 🚀 PERFORMANCE: Global cache instances for the app
export const authCache = new CacheManager(50, 5 * 60 * 1000); // 5 min TTL
export const clubCache = new CacheManager(100, 5 * 60 * 1000); // 5 min TTL
export const taskCache = new CacheManager(200, 2 * 60 * 1000); // 2 min TTL
export const meetingCache = new CacheManager(100, 3 * 60 * 1000); // 3 min TTL
export const fileCache = new CacheManager(150, 10 * 60 * 1000); // 10 min TTL

// 🚀 PERFORMANCE: LocalStorage wrapper with TTL
export class PersistentCache {
  private prefix: string;

  constructor(prefix = 'app_cache_') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage write failed:', error);
      // Silently fail - don't break the app
    }
  }

  get<T>(key: string): { data: T | null; isStale: boolean } {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return { data: null, isStale: false };

      const item = JSON.parse(raw);
      const isStale = Date.now() - item.timestamp > item.ttl;
      
      return { data: item.data, isStale };
    } catch (error) {
      console.warn('LocalStorage read failed:', error);
      return { data: null, isStale: false };
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('LocalStorage clear failed:', error);
    }
  }

  has(key: string): boolean {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return false;

      const item = JSON.parse(raw);
      return Date.now() - item.timestamp <= item.ttl;
    } catch {
      return false;
    }
  }
}

// 🚀 PERFORMANCE: Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static startMeasure(name: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.addMeasurement(name, duration);
      return duration;
    };
  }

  static addMeasurement(name: string, duration: number): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    
    const measurements = this.measurements.get(name)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  static getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0 };
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = measurements.length;
    const avg = measurements.reduce((sum, val) => sum + val, 0) / count;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index] || max;

    return { count, avg, min, max, p95 };
  }

  static getAllStats() {
    const result: Record<string, any> = {};
    for (const [name] of this.measurements) {
      result[name] = this.getStats(name);
    }
    return result;
  }

  static logStats(): void {
    const stats = this.getAllStats();
    console.group('📊 Performance Stats');
    Object.entries(stats).forEach(([name, stat]) => {
      console.log(`${name}:`, {
        avg: `${stat.avg.toFixed(2)}ms`,
        p95: `${stat.p95.toFixed(2)}ms`,
        count: stat.count
      });
    });
    console.groupEnd();
  }

  static clear(): void {
    this.measurements.clear();
  }
}

// 🚀 PERFORMANCE: Cache management for different data types
export class AppCacheManager {
  private static instance: AppCacheManager;
  private persistentCache: PersistentCache;

  private constructor() {
    this.persistentCache = new PersistentCache('community_platform_');
  }

  static getInstance(): AppCacheManager {
    if (!AppCacheManager.instance) {
      AppCacheManager.instance = new AppCacheManager();
    }
    return AppCacheManager.instance;
  }

  // 🚀 Auth cache methods
  setAuthUser(userId: string, userData: any, ttl = 5 * 60 * 1000): void {
    authCache.set(`user_${userId}`, userData, ttl);
    this.persistentCache.set(`user_${userId}`, userData, ttl);
  }

  getAuthUser(userId: string): { data: any | null; isStale: boolean } {
    const memory = authCache.get(`user_${userId}`);
    if (memory.exists && !memory.isStale) {
      return { data: memory.data, isStale: false };
    }

    const persistent = this.persistentCache.get(`user_${userId}`);
    if (persistent.data) {
      // Restore to memory cache
      authCache.set(`user_${userId}`, persistent.data);
      return persistent;
    }

    return { data: null, isStale: false };
  }

  // 🚀 Club cache methods
  setClubs(clubs: any[], ttl = 5 * 60 * 1000): void {
    clubCache.set('all_clubs', clubs, ttl);
    this.persistentCache.set('all_clubs', clubs, ttl);
  }

  getClubs(): { data: any[] | null; isStale: boolean } {
    const memory = clubCache.get<any[]>('all_clubs');
    if (memory.exists && !memory.isStale) {
      return { data: memory.data, isStale: false };
    }

    const persistent = this.persistentCache.get<any[]>('all_clubs');
    if (persistent.data) {
      clubCache.set('all_clubs', persistent.data);
      return { data: persistent.data, isStale: persistent.isStale };
    }

    return { data: null, isStale: false };
  }

  // 🚀 Clear all caches
  clearAll(): void {
    authCache.clear();
    clubCache.clear();
    taskCache.clear();
    meetingCache.clear();
    fileCache.clear();
    this.persistentCache.clear();
  }

  // 🚀 Get overall cache stats
  getOverallStats() {
    return {
      auth: authCache.getStats(),
      club: clubCache.getStats(),
      task: taskCache.getStats(),
      meeting: meetingCache.getStats(),
      file: fileCache.getStats(),
      performance: PerformanceMonitor.getAllStats()
    };
  }
}

// 🚀 PERFORMANCE: Automatic cache cleanup on app visibility
export function setupCacheCleanup(): void {
  // Cleanup on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const authExpired = authCache.removeExpired();
      const clubExpired = clubCache.removeExpired();
      const taskExpired = taskCache.removeExpired();
      const meetingExpired = meetingCache.removeExpired();
      const fileExpired = fileCache.removeExpired();
      
      const total = authExpired + clubExpired + taskExpired + meetingExpired + fileExpired;
      if (total > 0) {
        console.log(`🧹 Cache cleanup: Removed ${total} expired items`);
      }
    }
  });

  // Periodic cleanup every 2 minutes
  setInterval(() => {
    authCache.removeExpired();
    clubCache.removeExpired();
    taskCache.removeExpired();
    meetingCache.removeExpired();
    fileCache.removeExpired();
  }, 2 * 60 * 1000);
}

// 🚀 PERFORMANCE: Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 🚀 PERFORMANCE: Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// 🚀 PERFORMANCE: Export singleton instance
export const appCache = AppCacheManager.getInstance();