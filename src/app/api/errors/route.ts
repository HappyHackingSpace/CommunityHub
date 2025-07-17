import { NextRequest, NextResponse } from 'next/server'

interface ErrorReport {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  url: string
  userAgent: string
  userId?: string
  retryCount: number
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorReport = await request.json()

    // Validate required fields
    if (!errorData.errorId || !errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: errorId, message, or timestamp' },
        { status: 400 }
      )
    }

    // Log error to console for development
    console.error('Error Report Received:', {
      id: errorData.errorId,
      message: errorData.message,
      timestamp: new Date(errorData.timestamp).toISOString(),
      url: errorData.url,
      userId: errorData.userId,
      retryCount: errorData.retryCount
    })

    // TODO: Forward to error tracking service
    // Examples of error tracking services you can integrate:
    
    // Option 1: Sentry
    // if (process.env.SENTRY_DSN) {
    //   const Sentry = require('@sentry/nextjs')
    //   Sentry.captureException(new Error(errorData.message), {
    //     tags: {
    //       errorId: errorData.errorId,
    //       userId: errorData.userId,
    //     },
    //     extra: {
    //       stack: errorData.stack,
    //       componentStack: errorData.componentStack,
    //       url: errorData.url,
    //       userAgent: errorData.userAgent,
    //       retryCount: errorData.retryCount,
    //     }
    //   })
    // }

    // Option 2: LogRocket
    // if (process.env.LOGROCKET_APP_ID) {
    //   // LogRocket typically handles errors client-side
    //   // but you can use their API to send server-side data
    // }

    // Option 3: Custom logging service (e.g., database, external API)
    // await saveErrorToDatabase(errorData)
    // await sendToExternalService(errorData)

    // Option 4: Store in Supabase (since the project uses Supabase)
    // const { createClient } = require('@supabase/supabase-js')
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // )
    // 
    // await supabase.from('error_logs').insert({
    //   error_id: errorData.errorId,
    //   message: errorData.message,
    //   stack: errorData.stack,
    //   component_stack: errorData.componentStack,
    //   timestamp: new Date(errorData.timestamp).toISOString(),
    //   url: errorData.url,
    //   user_agent: errorData.userAgent,
    //   user_id: errorData.userId,
    //   retry_count: errorData.retryCount,
    //   created_at: new Date().toISOString()
    // })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Error report received',
        errorId: errorData.errorId 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Failed to process error report:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process error report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Optional: Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit error reports.' },
    { status: 405 }
  )
}
