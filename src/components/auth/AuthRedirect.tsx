// src/components/auth/AuthRedirect.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
  const { isAuthenticated, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return

    // Giriş yapmış kullanıcıyı login sayfasından yönlendir
    if (redirectType === 'authenticated' && isAuthenticated) {
      console.log('🔄 AuthRedirect: Authenticated user accessing login page, redirecting to:', redirectTo)
      router.push(redirectTo)
      return
    }

    // Giriş yapmamış kullanıcıyı protected sayfalardan yönlendir
    if (redirectType === 'unauthenticated' && !isAuthenticated) {
      console.log('🔄 AuthRedirect: Unauthenticated user accessing protected page, redirecting to login')
      router.push('/login')
      return
    }
  }, [isAuthenticated, initialized, redirectTo, redirectType, router])

  // İlk yüklenme sırasında loading göster
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Redirect durumunda fallback component göster veya loading
  if (redirectType === 'authenticated' && isAuthenticated) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  if (redirectType === 'unauthenticated' && !isAuthenticated) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Giriş sayfasına yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
