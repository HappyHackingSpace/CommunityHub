
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function usePerformanceMonitor(name: string, deps: any[] = []) {
  const startTimeRef = useRef<number | null>(null);
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      if (startTimeRef.current !== null) {
        const duration = performance.now() - startTimeRef.current;
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
    };
  }, deps);
  const measure = useCallback(() => {
    if (startTimeRef.current !== null) {
      return performance.now() - startTimeRef.current;
    }
    return 0;
  }, []);
  return { measure };
}

// 🌐 Simple network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setConnectionType(connection?.effectiveType || 'unknown');
      }
    };

    updateOnlineStatus();
    updateConnectionType();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { isOnline, connectionType };
}
