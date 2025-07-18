// src/components/layout/MainLayout.tsx - PERFORMANCE OPTIMIZED
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store';
import { useNotificationStore } from '@/store/notificationStore';
import { useEffect, useRef, memo, useCallback } from 'react';
import { usePerformanceMonitor, useNetworkStatus } from '@/hooks/usePerformance';
import { setupCacheCleanup } from '@/lib/cache';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

// 🚀 PERFORMANCE: Memoized layout components
const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);

function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, initialized } = useAuth();
  const { fetchClubs, clubs, cacheStatus } = useClubStore();
  const { fetchNotifications, notifications } = useNotificationStore();
  const { isOnline, connectionType } = useNetworkStatus();
  
  // 🚀 PERFORMANCE: Track component performance
  usePerformanceMonitor('MainLayout.render', [isAuthenticated, initialized, user?.id]);
  
  // 🚀 PERFORMANCE: Prevent multiple data fetches
  const dataFetchedRef = useRef(false);
  const networkStatusRef = useRef({ isOnline: true, connectionType: 'unknown' });

  // 🚀 PERFORMANCE: Setup cache cleanup once
  useEffect(() => {
    setupCacheCleanup();
  }, []);

  // 🚀 PERFORMANCE: Smart data fetching with network awareness
   const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated || !user || dataFetchedRef.current) return;
    console.log('🔄 MainLayout: Starting initial data fetch');
    const startTime = performance.now();
    try {
      // 🚀 PERFORMANCE: Parallel data fetching
      const fetchPromises = [];
      // Fetch clubs only if empty or stale
      if (clubs.length === 0 || cacheStatus === 'empty') {
        console.log('📊 MainLayout: Fetching clubs');
        fetchPromises.push(fetchClubs());
      }
      // Fetch notifications only if empty
      if (notifications.length === 0) {
        console.log('📊 MainLayout: Fetching notifications');
        fetchPromises.push(fetchNotifications(user.id));
      }
      // Execute all fetches in parallel
      if (fetchPromises.length > 0) {
        const results = await Promise.allSettled(fetchPromises);
        
        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ MainLayout: Fetch ${index} failed:`, result.reason);
          }
        });
      }
      dataFetchedRef.current = true;
      const duration = performance.now() - startTime;
      
      console.log(`✅ MainLayout: Initial data fetch completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ MainLayout: Data fetch error:', error);
    }
  }, [isAuthenticated, user, clubs.length, cacheStatus, notifications.length, fetchClubs, fetchNotifications]);

  // 🚀 PERFORMANCE: Main data fetching effect
  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated && user) {
      fetchInitialData();
    } else {
      // Reset flag when user logs out
      dataFetchedRef.current = false;
    }
  }, [isAuthenticated, initialized, user?.id, fetchInitialData]);

  // 🚀 PERFORMANCE: Network status monitoring
  useEffect(() => {
    const prev = networkStatusRef.current;
    networkStatusRef.current = { isOnline, connectionType };

    // React to network changes
    if (!prev.isOnline && isOnline && dataFetchedRef.current) {
      console.log('🌐 MainLayout: Network restored, refreshing data');
      // Background refresh when coming back online
      setTimeout(() => {
        if (isAuthenticated && user) {
          fetchClubs(true); // Force refresh
        }
      }, 1000);
    }

    if (!isOnline) {
      console.log('📴 MainLayout: Offline mode detected');
    }
  }, [isOnline, connectionType, isAuthenticated, user, fetchClubs]);

  // ✅ FIX: Better auth state handling
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sistem hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Let middleware handle redirects, show loading for auth checks
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Giriş kontrol ediliyor...</p>
          <p className="text-xs text-gray-400 mt-2">
            Bu ekran 3 saniyeden fazla kalırsa sayfayı yenileyin
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* 🚀 PERFORMANCE: Memoized sidebar */}
        <MemoizedSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 🚀 PERFORMANCE: Memoized header */}
          <MemoizedHeader />
          
          {/* Main content with error boundary */}
          <main className="flex-1 overflow-y-auto p-6 relative">
            {/* 🚀 PERFORMANCE: Network status indicator */}
            {!isOnline && (
              <div className="fixed top-20 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
                📴 Çevrimdışı mod - Bazı özellikler sınırlı olabilir
              </div>
            )}
            
            {/* 🚀 PERFORMANCE: Slow connection warning */}
            {isOnline && connectionType === 'slow-2g' && (
              <div className="fixed top-20 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
                🐌 Yavaş bağlantı tespit edildi
              </div>
            )}
            
            {children}
          </main>
        </div>
      </div>

      {/* 🚀 PERFORMANCE: Debug panel for development */}
      <CacheDebugPanel />
      
      {/* 🚀 PERFORMANCE: Performance logging in development */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceLogger />
      )}
    </>
  );
}

// 🚀 PERFORMANCE: Development performance logger
function PerformanceLogger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const logInterval = setInterval(() => {
      // Log performance stats every 30 seconds
      import('@/lib/cache').then(({ logPerformanceStats }) => {
        logPerformanceStats();
      });
    }, 30000);

    return () => clearInterval(logInterval);
  }, []);

  return null;
}

// 🚀 PERFORMANCE: Cache debug panel for development
function CacheDebugPanel() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs font-mono z-50 max-w-xs">
      <div className="text-green-400">🚀 Cache Debug</div>
      <div>Memory usage tracking active</div>
    </div>
  );
}

// 🚀 PERFORMANCE: HOC for layout performance monitoring
export function withLayoutPerformance<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    usePerformanceMonitor('Layout.ComponentRender');
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withLayoutPerformance(${Component.displayName || Component.name})`;
  return memo(WrappedComponent);
}

// 🚀 PERFORMANCE: Layout context for sharing common state
import { createContext, useContext, useMemo } from 'react';

interface LayoutContextValue {
  isOnline: boolean;
  connectionType: string;
  cacheStatus: string;
  performanceMode: 'fast' | 'normal' | 'slow';
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within LayoutProvider');
  }
  return context;
}

interface LayoutProviderProps {
  children: React.ReactNode;
  isOnline: boolean;
  connectionType: string;
  cacheStatus: string;
}
function LayoutProvider(
  { children, isOnline, connectionType, cacheStatus }: LayoutProviderProps
) {
  const contextValue = useMemo(() => {
    const performanceMode: 'fast' | 'normal' | 'slow' =
      !isOnline
        ? 'slow'
        : connectionType === 'slow-2g' || connectionType === '2g'
        ? 'slow'
        : connectionType === '3g'
        ? 'normal'
        : 'fast';
    return {
      isOnline,
      connectionType,
      cacheStatus,
      performanceMode,
    };
  }, [isOnline, connectionType, cacheStatus]);
  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
}

// 🚀 PERFORMANCE: Main layout with context
function MainLayoutWithContext({ children }: MainLayoutProps) {
  const { user, isAuthenticated, initialized } = useAuth();
  const { cacheStatus } = useClubStore();
  const { isOnline, connectionType } = useNetworkStatus();

  return (
    <LayoutProvider 
      isOnline={isOnline} 
      connectionType={connectionType} 
      cacheStatus={cacheStatus}
    >
      <MainLayout>{children}</MainLayout>
    </LayoutProvider>
  );
}

export default memo(MainLayoutWithContext);