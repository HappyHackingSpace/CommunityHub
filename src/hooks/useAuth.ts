import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { user, isLoading, error, isAuthenticated, setUser, setLoading, logout } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Sayfa yüklendiğinde token kontrolü - sadece bir kez çalışsın
    if (hasFetched.current || typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (token && !user) {
      hasFetched.current = true;
      setLoading(true);
      
      // Token'ı doğrula ve user bilgisini getir
      fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(result => {
        if (result.success && result.data.user) {
          setUser(result.data.user);
        } else {
          // Geçersiz token varsa temizle
          localStorage.removeItem('token');
        }
      })
      .catch(error => {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else if (!token) {
      hasFetched.current = true;
      setLoading(false);
    }
  }, []);

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