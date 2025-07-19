// src/components/auth/AuthRedirect.tsx - FIXED: No More Loops!
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface AuthRedirectProps {
  children: React.ReactNode
  redirectTo?: string
  redirectType?: 'authenticated' | 'unauthenticated'
  fallbackComponent?: React.ReactNode
}

export default function AuthRedirect({ 
  children, 
  redirectTo = '/dashboard',
  redirectType = 'authenticated',
  fallbackComponent 
}: AuthRedirectProps) {
  const { isAuthenticated, initialized, isLoading, error, user, restoreSession } = useAuth()
  const router = useRouter()
  const redirectedRef = useRef(false)
  const [forceReady, setForceReady] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  // 🔍 DEBUG: Session check on mount
  useEffect(() => {
    const checkSession = async () => {
      if (typeof window !== 'undefined') {
        const { createClient } = await import('@/lib/supabase-client')
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('🔍 AuthRedirect: Direct session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          authHookState: {
            isAuthenticated,
            initialized,
            isLoading,
            hasUser: !!user,
            userEmail: user?.email
          },
          error
        })
      }
    }
    
    checkSession()
  }, [isAuthenticated, initialized, isLoading, user])

  // 🔥 NEW: Manual session restore handler
  const handleRestoreSession = async () => {
    setIsRestoring(true)
    try {
      const success = await restoreSession?.()
      if (!success) {
        // If restore fails, redirect to login
        router.replace('/login')
      }
    } catch (error) {
      console.error('Session restore failed:', error)
      router.replace('/login')
    } finally {
      setIsRestoring(false)
    }
  }

  // Force ready state after timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!initialized && !forceReady) {
        console.warn('⚠️ AuthRedirect: Forcing ready state after timeout')
        setForceReady(true)
      }
    }, 8000) // 8 second timeout

    return () => clearTimeout(timeout)
  }, [initialized, forceReady])

  useEffect(() => {
    if ((!initialized && !forceReady) || redirectedRef.current) return

    console.log('🔄 AuthRedirect:', { redirectType, isAuthenticated, initialized, forceReady })

    // Giriş yapmış kullanıcıyı login sayfasından yönlendir
    if (redirectType === 'authenticated' && isAuthenticated) {
      console.log('🔄 AuthRedirect: Authenticated user accessing login page, redirecting to:', redirectTo)
      redirectedRef.current = true
      router.replace(redirectTo)
      return
    }

    // Giriş yapmamış kullanıcıyı protected sayfalardan yönlendir
    if (redirectType === 'unauthenticated' && !isAuthenticated) {
      console.log('🔄 AuthRedirect: Unauthenticated user accessing protected page, redirecting to login')
      redirectedRef.current = true
      router.replace('/login')
      return
    }
  }, [isAuthenticated, initialized, forceReady, redirectTo, redirectType, router])

  // Reset redirect flag when auth state changes
  useEffect(() => {
    redirectedRef.current = false
  }, [isAuthenticated])

  // İlk yüklenme sırasında loading göster
  if (!initialized && !forceReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sistem başlatılıyor...</p>
          
          {/* Session restore button for cookie/session mismatch */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 space-y-2">
              <button
                onClick={handleRestoreSession}
                disabled={isRestoring}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
              >
                {isRestoring ? 'Oturum Geri Yükleniyor...' : 'Oturumu Geri Yükle'}
              </button>
              <p className="text-xs text-gray-500">
                Cookie var ama session yok ise bu butonu deneyin
              </p>
            </div>
          )}
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-400">
              Debug: init={String(initialized)}, loading={String(isLoading)}, auth={String(isAuthenticated)}, error={error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show error state if auth failed
  if (error && (initialized || forceReady)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Giriş sistemi hatası: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // Show fallback during redirects
  if (redirectedRef.current) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  // Only render children if the user should be on this page
  const shouldRenderChildren = 
    (redirectType === 'authenticated' && !isAuthenticated) ||
    (redirectType === 'unauthenticated' && isAuthenticated)

  if (!shouldRenderChildren) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
