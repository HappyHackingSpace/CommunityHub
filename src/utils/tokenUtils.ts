import { User } from '@/types';

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    // 5 dakika buffer ekle
    return payload.exp < (currentTime + 300);
  } catch {
    return true;
  }
};

export const getBasicUserFromToken = (token: string): Partial<User> | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (!payload.sub || !payload.email) {
      return null;
    }
    
  
    let userRole: 'admin' | 'club_leader' | 'member' = 'member';
    if (payload.email === 'admin@happyhackingspace.com') {
      userRole = 'admin';
    } else if (payload.role === 'club_leader') {
      userRole = 'club_leader';
    }
    
    return {
      id: payload.sub,
      email: payload.email,
      role: userRole  
    };
  } catch {
    return null;
  }
};