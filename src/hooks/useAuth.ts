import { useEffect } from 'react';
import { useAuthStore } from '@/store';

let initializationPromise: Promise<void> | null = null;

export const useAuth = () => {
  const { 
    user, 
    isLoading, 
    error, 
    isAuthenticated, 
    initialized, 
    setUser, 
    setLoading, 
    setInitialized,
    logout 
  } = useAuthStore();

  useEffect(() => {
    // Sadece bir kez initialize et
    if (initialized || initializationPromise) return;
    
    // Client-side check
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    if (token && !user) {
      setLoading(true);
      
      // Promise'i store et ki tekrar çalışmasın
      initializationPromise = fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        console.log('Validate response status:', response.status);
        console.log('Validate response ok:', response.ok);
        if (!response.ok) {
          throw new Error('Token validation failed');
        }
        return response.json();
      })
      .then(result => {
        console.log('Validate result:', result);
        if (result.success && result.data.user) {
          setUser(result.data.user);
        } else {
          // Geçersiz token varsa temizle
          localStorage.removeItem('token');
          setUser(null);
        }
      })
      .catch(error => {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
        setInitialized(true);
        initializationPromise = null;
      });
    } else if (!token) {
      setInitialized(true);
    } else if (user) {
      setInitialized(true);
    }
  }, []); // Hiç dependency yok

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isLeader: user?.role === 'club_leader',
    isMember: user?.role === 'member',
    logout
  };
};