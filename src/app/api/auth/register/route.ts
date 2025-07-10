import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'member' } = await request.json();
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, şifre ve isim gerekli' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || 'Kayıt oluşturulamadı' },
        { status: 400 }
      );
    }

    // Create user profile
    const { data: userData, error: userError } = await DatabaseService.createUser({
      id: authData.user.id,
      email,
      name,
      role: role as 'admin' | 'club_leader' | 'member',
    });

    if (userError) {
      console.error('User profile creation error:', userError);
      return NextResponse.json(
        { success: false, error: 'Kullanıcı profili oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: userData },
      message: 'Kayıt başarılı. Email doğrulama linkini kontrol edin.'
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Kayıt oluşturulamadı' },
      { status: 500 }
    );
  }
}