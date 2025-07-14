import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Basic password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const { user } = await AuthService.register(email, password, name);

    return NextResponse.json({
      success: true,
      data: { user },
      message: 'Registration successful. Please check your email for verification.'
    });

  } catch (error) {
    console.error('Register error:', error);
    
    const message = error instanceof Error ? error.message : 'Registration failed';
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}