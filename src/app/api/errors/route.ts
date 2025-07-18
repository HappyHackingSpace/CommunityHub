import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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

    // Store error in Supabase for tracking and analysis
    try {
      const supabase = await createClient()
      
      const { error: dbError } = await supabase.from('error_logs').insert({
        error_id: errorData.errorId,
        message: errorData.message,
        stack: errorData.stack,
        component_stack: errorData.componentStack,
        timestamp: new Date(errorData.timestamp).toISOString(),
        url: errorData.url,
        user_agent: errorData.userAgent,
        user_id: errorData.userId,
        retry_count: errorData.retryCount,
        created_at: new Date().toISOString()
      })

      if (dbError) {
        console.error('Failed to store error in database:', dbError)
      }
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      // Continue processing even if database storage fails
    }

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
