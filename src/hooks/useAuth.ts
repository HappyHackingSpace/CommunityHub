import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { getBasicUserFromToken, isTokenExpired } from '@/utils/tokenUtils';
import { User } from '@/types';

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

      if (isTokenExpired(token)) {
        console.log('Token expired, clearing storage');
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      const basicUser = getBasicUserFromToken(token);
      if (basicUser && basicUser.id && basicUser.email) {
        console.log('Basic user from token:', basicUser);
        
        // Temporary full user oluştur (hızlı yükleme için)
        const tempUser: User = {
          id: basicUser.id,
          email: basicUser.email,
          name: basicUser.email.split('@')[0] || 'User',
          role: basicUser.role || 'member',
         
          clubId: undefined,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        setUser(tempUser);
        setLoading(false);
        setInitialized(true);
        
        // Background'da full user bilgilerini al
        validateTokenInBackground(token);
      } else {
        // Token parse edilemedi, normal validation
        validateTokenOnce(token);
      }
    } else {
      // Token yoksa veya user zaten varsa
      setInitialized(true);
    }
  }, []); 

  const validateTokenInBackground = (token: string) => {
    console.log('Background validation starting...');
    fetch('/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Background validation failed');
      return response.json();
    })
    .then(result => {
      if (result?.success && result.data?.user) {
        console.log('Background validation - updating full user:', result.data.user);
        setUser(result.data.user); // Full user ile güncelle
      }
    })
    .catch(error => {
      console.log('Background validation failed (keeping basic user):', error);
      // Hata durumunda basic user'ı korur, logout yapmaz
    });
  };

  const validateTokenOnce = (token: string) => {
    console.log('Full validation starting...');
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
      if (result.success && result.data?.user) {
        console.log('Setting user from validation:', result.data.user);
        setUser(result.data.user);
      } else {
        console.log('Token validation failed, clearing storage');
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
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    initialized,
    isAdmin: user?.role === 'admin',
    isLeader: user?.role === 'club_leader',
    isMember: user?.role === 'member',
    logout
  };
};