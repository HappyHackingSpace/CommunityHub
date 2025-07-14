import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { user, token } = await AuthService.login(email, password);

    return NextResponse.json({
      success: true,
      data: { user, token },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    
    const message = error instanceof Error ? error.message : 'Login failed';
    const status = message.includes('Invalid') ? 401 : 500;
    
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}