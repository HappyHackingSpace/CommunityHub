// src/components/error/ErrorBoundary.tsx - PRODUCTION ERROR BOUNDARIES
'use client'

import React, { Component, ReactNode, ErrorInfo, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  AlertTriangle, 
  Home, 
  Bug, 
  Copy,
  ExternalLink
} from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  level?: 'page' | 'component' | 'critical'
}

// 🚀 ERROR LOGGING: Advanced error reporting
class ErrorLogger {
  private static instance: ErrorLogger
  private errors: Array<{
    id: string
    error: Error
    errorInfo: ErrorInfo
    timestamp: number
    userAgent: string
    url: string
    userId?: string
    retryCount: number
  }> = []

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  logError(
    error: Error,
    errorInfo: ErrorInfo,
    retryCount: number = 0,
    userId?: string
  ): string {
    const errorId = this.generateErrorId()
    
    const errorRecord = {
      id: errorId,
      error,
      errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId,
      retryCount
    }

    this.errors.push(errorRecord)
    
    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorRecord)
    }
    
    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🐛 Error Boundary: ${errorId}`)
      console.error('Error:', error)
      console.error('Component Stack:', errorInfo.componentStack)
      console.error('Props:', errorInfo)
      console.groupEnd()
    }

    return errorId
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendToErrorService(errorRecord: any): Promise<void> {
    try {
      // Example: Send to Sentry, LogRocket, or custom endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId: errorRecord.id,
          message: errorRecord.error.message,
          stack: errorRecord.error.stack,
          componentStack: errorRecord.errorInfo.componentStack,
          timestamp: errorRecord.timestamp,
          url: errorRecord.url,
          userAgent: errorRecord.userAgent,
          userId: errorRecord.userId,
          retryCount: errorRecord.retryCount
        })
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  getRecentErrors(limit = 10) {
    return this.errors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  clearErrors(): void {
    this.errors = []
  }
}

const errorLogger = ErrorLogger.getInstance()

// 🚀 MAIN ERROR BOUNDARY: Production ready with retry logic
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props
    
    // Get user ID from context/auth if available
    const userId = this.getUserId()
    
    const errorId = errorLogger.logError(
      error,
      errorInfo,
      this.state.retryCount,
      userId
    )

    this.setState({
      error,
      errorInfo,
      errorId
    })

    // Call custom error handler
    onError?.(error, errorInfo)

    // Auto-retry for component-level errors
    if (level === 'component' && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry()
    }
  }

  private getUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      // From localStorage
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
      }

      // From sessionStorage
      const sessionUserStr = sessionStorage.getItem('user')
      if (sessionUserStr) {
        const user = JSON.parse(sessionUserStr)
        return user.id
      }

      // From cookies (if using auth cookies)
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(c => c.trim().startsWith('userId='))
      if (userCookie) {
        return userCookie.split('=')[1]
      }
    } catch {
      // Silently fail
    }
    
    return undefined
  }

  private scheduleRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    // Exponential backoff: 1s, 2s, 4s, 8s...
    const delay = Math.pow(2, this.state.retryCount) * 1000

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry()
    }, delay)
  }

  private handleRetry = () => {
    console.log(`🔄 Error Boundary: Retry attempt ${this.state.retryCount + 1}`)
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      errorId: ''
    }))
  }

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private copyErrorInfo = async () => {
    const errorText = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorText)
      alert('Hata bilgileri panoya kopyalandı')
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = errorText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Hata bilgileri panoya kopyalandı')
    }
  }

  private reportIssue = () => {
    const issueUrl = `https://github.com/your-org/your-repo/issues/new?title=Error: ${encodeURIComponent(this.state.error?.message || 'Unknown error')}&body=${encodeURIComponent(`Error ID: ${this.state.errorId}\n\nPlease describe what you were doing when this error occurred.`)}`
    window.open(issueUrl, '_blank')
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    const { hasError, error, retryCount, errorId } = this.state
    const { children, fallback, maxRetries = 3, level = 'component' } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Different UI based on error level
      switch (level) {
        case 'critical':
          return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl text-red-800">
                    Kritik Sistem Hatası
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Sistem kritik bir hatayla karşılaştı. Lütfen sayfayı yenileyin veya teknik destek ile iletişime geçin.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={this.handleReload} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sayfayı Yenile
                      </Button>
                      <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                        <Home className="mr-2 h-4 w-4" />
                        Ana Sayfa
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Hata ID:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{errorId}</code>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={this.copyErrorInfo}>
                          <Copy className="mr-2 h-3 w-3" />
                          Hata Bilgilerini Kopyala
                        </Button>
                        <Button size="sm" variant="outline" onClick={this.reportIssue}>
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Hata Bildir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        case 'page':
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <Card className="max-w-lg mx-auto">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Bug className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Sayfa Yüklenemedi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-center">
                    Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
                  </p>

                  <div className="space-y-3">
                    <Button onClick={this.handleManualRetry} className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tekrar Dene
                    </Button>
                    <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                      <Home className="mr-2 h-4 w-4" />
                      Ana Sayfaya Dön
                    </Button>
                  </div>

                  {process.env.NODE_ENV === 'development' && (
                    <div className="border-t pt-4">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-500 mb-2">
                          Geliştirici Bilgileri
                        </summary>
                        <div className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                          <strong>Error:</strong> {error.message}<br />
                          <strong>Stack:</strong> {error.stack}
                        </div>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )

        default: // component level
          return (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 my-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-1">
                    Bileşen Hatası
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    Bu bileşen yüklenirken bir hata oluştu.
                    {retryCount < maxRetries && ' Otomatik olarak tekrar denenecek...'}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={this.handleManualRetry}
                      disabled={retryCount >= maxRetries}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Tekrar Dene
                    </Button>
                    
                    {process.env.NODE_ENV === 'development' && (
                      <Button size="sm" variant="ghost" onClick={this.copyErrorInfo}>
                        <Copy className="mr-1 h-3 w-3" />
                        Hata Kopyala
                      </Button>
                    )}
                  </div>

                  {retryCount > 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Deneme sayısı: {retryCount}/{maxRetries}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
      }
    }

    return children
  }
}

// 🚀 HOC: withErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// 🚀 ASYNC ERROR BOUNDARY: For async operations
export class AsyncErrorBoundary extends Component<
  ErrorBoundaryProps & { onAsyncError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps & { onAsyncError?: (error: Error) => void }) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = errorLogger.logError(error, errorInfo, this.state.retryCount)
    
    this.setState({
      error,
      errorInfo,
      errorId
    })

    this.props.onError?.(error, errorInfo)
  }

  componentDidMount() {
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = new Error(`Unhandled promise rejection: ${event.reason}`)
    
    this.setState({
      hasError: true,
      error,
      errorInfo: null,
      errorId: errorLogger.logError(error, {} as ErrorInfo, 0)
    })

    this.props.onAsyncError?.(error)
    event.preventDefault()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 my-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                Asenkron İşlem Hatası
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Bir asenkron işlem sırasında hata oluştu.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => this.setState({
                  hasError: false,
                  error: null,
                  errorInfo: null,
                  retryCount: 0,
                  errorId: ''
                })}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Tekrar Dene
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 🚀 HOOK: useErrorHandler for functional components
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  const handleError = useCallback((error: Error) => {
    errorLogger.logError(error, {} as ErrorInfo, 0)
    setError(error)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const throwError = useCallback((error: Error) => {
    throw error
  }, [])

  return {
    error,
    handleError,
    clearError,
    throwError
  }
}

// 🚀 NETWORK ERROR BOUNDARY: Specific for API failures
export function NetworkErrorBoundary({ 
  children, 
  onNetworkError 
}: { 
  children: ReactNode
  onNetworkError?: (error: Error) => void 
}) {
  return (
    <ErrorBoundary
      level="component"
      onError={(error) => {
        if (error.message.includes('fetch') || 
            error.message.includes('network') || 
            error.message.includes('Failed to fetch')) {
          onNetworkError?.(error)
        }
      }}
      fallback={
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 my-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Bağlantı Hatası
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Sunucu ile bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// 🚀 ROUTE ERROR BOUNDARY: For Next.js pages
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      maxRetries={2}
      onError={(error, errorInfo) => {
        // Send route error to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: error.message,
            fatal: true,
            page_location: window.location.href
          })
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// 🚀 ERROR REPORTER: Get error statistics
export function getErrorStats() {
  return {
    recentErrors: errorLogger.getRecentErrors(),
    errorCount: errorLogger.getRecentErrors().length,
    clearErrors: () => errorLogger.clearErrors()
  }
}

export default ErrorBoundary