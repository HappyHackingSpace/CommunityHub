// src/lib/cache-manager.ts - GLOBAL CACHE MANAGEMENT SYSTEM
import { useTaskStore } from '@/store/taskStore';
import { useClubStore } from '@/store/clubStore';
import { useMeetingStore } from '@/store/meetingStore';

export interface CacheManagerConfig {
  autoRefreshInterval: number;
  staleRefreshDelay: number;
  maxRetries: number;
  retryDelay: number;
}

export class GlobalCacheManager {
  private static instance: GlobalCacheManager;
  private config: CacheManagerConfig;
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private isOnline: boolean = true;

  private constructor(config: Partial<CacheManagerConfig> = {}) {
    this.config = {
      autoRefreshInterval: 5 * 60 * 1000, // 5 minutes
      staleRefreshDelay: 2000, // 2 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      ...config
    };

    this.setupNetworkMonitoring();
    this.setupVisibilityHandling();
  }

  static getInstance(config?: Partial<CacheManagerConfig>): GlobalCacheManager {
    if (!GlobalCacheManager.instance) {
      GlobalCacheManager.instance = new GlobalCacheManager(config);
    }
    return GlobalCacheManager.instance;
  }

  // 🚀 NETWORK MONITORING: Track online/offline status
  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        console.log('🌐 GlobalCacheManager: Network reconnected');
        this.isOnline = true;
        this.refreshAllStaleData();
      });

      window.addEventListener('offline', () => {
        console.log('📴 GlobalCacheManager: Network disconnected');
        this.isOnline = false;
        this.stopAllAutoRefresh();
      });
    }
  }

  // 🚀 VISIBILITY HANDLING: Refresh when tab becomes visible
  private setupVisibilityHandling(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isOnline) {
          console.log('👁️ GlobalCacheManager: Tab became visible, checking stale data');
          this.refreshAllStaleData();
        }
      });
    }
  }

  // 🚀 REFRESH ALL STALE DATA: Check and refresh all stores
  async refreshAllStaleData(): Promise<void> {
    if (!this.isOnline) {
      console.log('📴 GlobalCacheManager: Offline, skipping refresh');
      return;
    }

    console.log('🔄 GlobalCacheManager: Starting global stale data refresh');

    const promises: Promise<void>[] = [];

    // Task store refresh
    const taskStore = useTaskStore.getState();
    if (taskStore.cacheStatus === 'stale' && !taskStore.isLoading) {
      promises.push(this.retryWithBackoff('tasks', async () => {
        await taskStore.backgroundSync();
      }));
    }

    // Club store refresh  
    const clubStore = useClubStore.getState();
    if (clubStore.cacheStatus === 'stale' && !clubStore.isLoading) {
      promises.push(this.retryWithBackoff('clubs', async () => {
        await clubStore.backgroundSync();
      }));
    }

    // Meeting store refresh
    const meetingStore = useMeetingStore.getState();
    if (meetingStore.cacheStatus === 'stale' && !meetingStore.isLoading) {
      promises.push(this.retryWithBackoff('meetings', async () => {
        await meetingStore.backgroundSync();
      }));
    }

    // Execute all refreshes in parallel
    await Promise.allSettled(promises);
    console.log('✅ GlobalCacheManager: Global refresh completed');
  }

  // 🚀 RETRY WITH BACKOFF: Retry failed requests with exponential backoff
  private async retryWithBackoff(key: string, operation: () => Promise<void>): Promise<void> {
    const attempts = this.retryAttempts.get(key) || 0;
    
    if (attempts >= this.config.maxRetries) {
      console.warn(`⚠️ GlobalCacheManager: Max retries reached for ${key}`);
      this.retryAttempts.delete(key);
      return;
    }

    try {
      await operation();
      this.retryAttempts.delete(key); // Reset on success
      console.log(`✅ GlobalCacheManager: ${key} refreshed successfully`);
    } catch (error) {
      const newAttempts = attempts + 1;
      this.retryAttempts.set(key, newAttempts);
      
      const delay = this.config.retryDelay * Math.pow(2, newAttempts - 1); // Exponential backoff
      console.warn(`🔄 GlobalCacheManager: ${key} refresh failed, retry ${newAttempts}/${this.config.maxRetries} in ${delay}ms`);
      
      setTimeout(() => {
        this.retryWithBackoff(key, operation);
      }, delay);
    }
  }

  // 🚀 AUTO REFRESH: Start automatic background refresh for a store
  startAutoRefresh(storeKey: string, refreshFn: () => Promise<void>): void {
    if (this.refreshIntervals.has(storeKey)) {
      console.log(`⚠️ GlobalCacheManager: Auto refresh already running for ${storeKey}`);
      return;
    }

    const interval = setInterval(async () => {
      if (this.isOnline) {
        try {
          await refreshFn();
        } catch (error) {
          console.warn(`⚠️ GlobalCacheManager: Auto refresh failed for ${storeKey}:`, error);
        }
      }
    }, this.config.autoRefreshInterval);

    this.refreshIntervals.set(storeKey, interval);
    console.log(`🔄 GlobalCacheManager: Auto refresh started for ${storeKey}`);
  }

  // 🚀 STOP AUTO REFRESH: Stop automatic refresh for a store
  stopAutoRefresh(storeKey: string): void {
    const interval = this.refreshIntervals.get(storeKey);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(storeKey);
      console.log(`⏹️ GlobalCacheManager: Auto refresh stopped for ${storeKey}`);
    }
  }

  // 🚀 STOP ALL AUTO REFRESH: Stop all automatic refreshes
  stopAllAutoRefresh(): void {
    this.refreshIntervals.forEach((interval, key) => {
      clearInterval(interval);
      console.log(`⏹️ GlobalCacheManager: Auto refresh stopped for ${key}`);
    });
    this.refreshIntervals.clear();
  }

  // 🚀 FORCE REFRESH ALL: Force refresh all stores
  async forceRefreshAll(): Promise<void> {
    console.log('🔄 GlobalCacheManager: Force refreshing all stores');

    const promises = [
      useTaskStore.getState().fetchTasks(undefined, true),
      useClubStore.getState().fetchClubs(true),
      useMeetingStore.getState().fetchMeetings(undefined, undefined, true)
    ];

    await Promise.allSettled(promises);
    console.log('✅ GlobalCacheManager: Force refresh completed');
  }

  // 🚀 INVALIDATE ALL: Invalidate all caches
  invalidateAllCaches(): void {
    console.log('🗑️ GlobalCacheManager: Invalidating all caches');
    
    useTaskStore.getState().invalidateCache();
    useClubStore.getState().invalidateCache();
    useMeetingStore.getState().invalidateCache();
  }

  // 🚀 GET CACHE STATUS: Get overall cache status
  getCacheStatus(): Record<string, any> {
    return {
      task: {
        status: useTaskStore.getState().cacheStatus,
        isLoading: useTaskStore.getState().isLoading,
        error: useTaskStore.getState().error,
        lastFetched: useTaskStore.getState().lastFetched
      },
      club: {
        status: useClubStore.getState().cacheStatus,
        isLoading: useClubStore.getState().isLoading,
        error: useClubStore.getState().error,
        lastFetched: useClubStore.getState().lastFetched
      },
      meeting: {
        status: useMeetingStore.getState().cacheStatus,
        isLoading: useMeetingStore.getState().isLoading,
        error: useMeetingStore.getState().error,
        lastFetched: useMeetingStore.getState().lastFetched
      },
      network: {
        isOnline: this.isOnline,
        activeRefreshes: Array.from(this.refreshIntervals.keys()),
        retryAttempts: Object.fromEntries(this.retryAttempts)
      }
    };
  }

  // 🚀 CLEANUP: Clean up resources
  cleanup(): void {
    this.stopAllAutoRefresh();
    this.retryAttempts.clear();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.refreshAllStaleData);
      window.removeEventListener('offline', this.stopAllAutoRefresh);
    }
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.refreshAllStaleData);
    }
  }
}

// 🚀 GLOBAL INSTANCE: Export singleton instance
export const globalCacheManager = GlobalCacheManager.getInstance({
  autoRefreshInterval: 5 * 60 * 1000, // 5 minutes
  staleRefreshDelay: 2000, // 2 seconds  
  maxRetries: 3,
  retryDelay: 5000 // 5 seconds
});

// 🚀 UTILITY HOOKS: React hooks for easier integration
export function useGlobalCacheManager() {
  return {
    refreshAllStaleData: () => globalCacheManager.refreshAllStaleData(),
    forceRefreshAll: () => globalCacheManager.forceRefreshAll(),
    invalidateAllCaches: () => globalCacheManager.invalidateAllCaches(),
    getCacheStatus: () => globalCacheManager.getCacheStatus(),
    startAutoRefresh: (key: string, fn: () => Promise<void>) => 
      globalCacheManager.startAutoRefresh(key, fn),
    stopAutoRefresh: (key: string) => globalCacheManager.stopAutoRefresh(key)
  };
}

// 🚀 AUTO INITIALIZATION: Start global cache management
if (typeof window !== 'undefined') {
  // Start auto refresh for all stores
  globalCacheManager.startAutoRefresh('tasks', async () => {
    const store = useTaskStore.getState();
    if (store.cacheStatus === 'stale') {
      await store.backgroundSync();
    }
  });

  globalCacheManager.startAutoRefresh('clubs', async () => {
    const store = useClubStore.getState();
    if (store.cacheStatus === 'stale') {
      await store.backgroundSync();
    }
  });

  globalCacheManager.startAutoRefresh('meetings', async () => {
    const store = useMeetingStore.getState();
    if (store.cacheStatus === 'stale') {
      await store.backgroundSync();
    }
  });

  console.log('🚀 GlobalCacheManager: Auto-initialization completed');
}
