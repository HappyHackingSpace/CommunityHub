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
  const { isAuthenticated, initialized, isLoading, error } = useAuth()
  const router = useRouter()
  const redirectedRef = useRef(false)
  const [forceReady, setForceReady] = useState(false)

  // Force ready after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!initialized && !forceReady) {
        setForceReady(true)
      }
    }, 8000)

    return () => clearTimeout(timeout)
  }, [initialized, forceReady])

  // Handle redirects
  useEffect(() => {
    if ((!initialized && !forceReady) || redirectedRef.current) return

    console.log('🔄 AuthRedirect:', { redirectType, isAuthenticated, initialized, forceReady })

    if (redirectType === 'authenticated' && isAuthenticated) {
      console.log('🔄 AuthRedirect: Authenticated user on login page, redirecting to:', redirectTo)
      redirectedRef.current = true
      router.replace(redirectTo)
      return
    }

    if (redirectType === 'unauthenticated' && !isAuthenticated) {
      console.log('🔄 AuthRedirect: Unauthenticated user on protected page, redirecting to login')
      redirectedRef.current = true
      router.replace('/login')
      return
    }
  }, [isAuthenticated, initialized, forceReady, redirectTo, redirectType, router])

  // Reset redirect flag when auth state changes
  useEffect(() => {
    redirectedRef.current = false
  }, [isAuthenticated])

  // Show loading during initialization
  if (!initialized && !forceReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cookie-based auth initializing...</p>
          
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

  // Show error state
  if (error && (initialized || forceReady)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Auth error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
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
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Determine if children should render
  const shouldRenderChildren = 
    (redirectType === 'authenticated' && !isAuthenticated) ||
    (redirectType === 'unauthenticated' && isAuthenticated)

  if (!shouldRenderChildren) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}