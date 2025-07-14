import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    initialized,
    validateToken,
    logout
  } = useAuthStore();
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run validation once per session
    if (!hasInitialized.current && !initialized && !isLoading) {
      hasInitialized.current = true;
      validateToken();
    }
  }, [initialized, isLoading]);

  // Memoize derived values to prevent unnecessary re-renders
  const derivedValues = useMemo(() => ({
    isAdmin: user?.role === 'admin',
    isLeader: user?.role === 'club_leader',
    isMember: user?.role === 'member',
  }), [user?.role]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    initialized,
    ...derivedValues,
    logout
  };
};