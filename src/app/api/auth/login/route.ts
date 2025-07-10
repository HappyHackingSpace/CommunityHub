import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const { data: userData, error: userError } = await DatabaseService.getUser(authData.user.id);

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı profili bulunamadı' },
        { status: 404 }
      );
    }

    if (!userData.is_active) {
      return NextResponse.json(
        { success: false, error: 'Hesap pasif durumda' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { 
        user: userData, 
        token: authData.session?.access_token 
      },
      message: 'Giriş başarılı'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Giriş yapılamadı' },
      { status: 500 }
    );
  }
}