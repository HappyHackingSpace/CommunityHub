// src/app/debug-auth/page.tsx - Auth Debug Page
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const auth = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    // Check current session from browser
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setSessionInfo(data);
      } catch (error: any) {
        console.error('Session check failed:', error);
        setSessionInfo({ error: error?.message || 'Unknown error' });
      }
    };

    if (auth.initialized) {
      checkSession();
    }
  }, [auth.initialized]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Auth Debug Information</h1>
        
        <div className="grid gap-6">
          {/* Auth Hook State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🎣 useAuth Hook State</h2>
            <div className="space-y-2 font-mono text-sm">
              <div><strong>initialized:</strong> {JSON.stringify(auth.initialized)}</div>
              <div><strong>isLoading:</strong> {JSON.stringify(auth.isLoading)}</div>
              <div><strong>isAuthenticated:</strong> {JSON.stringify(auth.isAuthenticated)}</div>
              <div><strong>user:</strong> {JSON.stringify(auth.user, null, 2)}</div>
              <div><strong>error:</strong> {JSON.stringify(auth.error)}</div>
            </div>
          </div>

          {/* Session Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🍪 Session Information</h2>
            <div className="space-y-2 font-mono text-sm">
              {sessionInfo ? (
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              ) : (
                <div>Loading session info...</div>
              )}
            </div>
          </div>

          {/* Browser Storage */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">💾 Browser Storage</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">LocalStorage:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {typeof window !== 'undefined' ? 
                    JSON.stringify(
                      Object.keys(localStorage).reduce((acc: any, key) => {
                        if (key.includes('supabase') || key.includes('auth')) {
                          acc[key] = localStorage.getItem(key);
                        }
                        return acc;
                      }, {}), null, 2
                    ) : 'Not available on server'
                  }
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">Cookies:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {typeof window !== 'undefined' ? document.cookie : 'Not available on server'}
                </pre>
              </div>
            </div>
          </div>

          {/* Test API Call */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🔗 API Test</h2>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/clubs?page=1&limit=5');
                  const data = await response.json();
                  console.log('API Test Result:', response.status, data);
                  alert(`API Response: ${response.status}\n${JSON.stringify(data, null, 2)}`);
                } catch (error: any) {
                  console.error('API Test Failed:', error);
                  alert(`API Test Failed: ${error?.message || 'Unknown error'}`);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test /api/clubs API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
