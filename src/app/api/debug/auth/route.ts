// src/app/api/debug/auth/route.ts - Debug authentication
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({
        success: false,
        error: 'Auth error',
        details: authError.message,
        hasUser: false,
        hasProfile: false
      });
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user',
        hasUser: false,
        hasProfile: false
      });
    }
    
    // Check if user profile exists
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, is_active, name')
      .eq('id', user.id)
      .single();
    
    return NextResponse.json({
      success: true,
      authUser: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at ? true : false
      },
      profile: userProfile,
      profileError: profileError?.message || null,
      hasUser: !!user,
      hasProfile: !!userProfile
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
