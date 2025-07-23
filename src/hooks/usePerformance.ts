// src/hooks/usePerformance.ts - SIMPLIFIED PERFORMANCE HOOKS
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';


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

    let connection: any = null;
    if ('connection' in navigator) {
      connection = (navigator as any).connection;
      connection?.addEventListener('change', updateConnectionType);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  return { isOnline, connectionType };
}
