import { useAuthStore } from "@/store";
import { isTokenExpired } from "./tokenUtils";

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (token && isTokenExpired(token)) {
    useAuthStore.getState().logout();
    throw new Error('Token expired');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
};