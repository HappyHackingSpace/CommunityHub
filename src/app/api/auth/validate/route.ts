import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Validate route called');
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Check if supabase is properly initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      return NextResponse.json(
        { success: false, error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }

    // Supabase token'ını doğrula
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token validation error:', error);
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Kullanıcı profilini getir
    const { data: userData, error: userError } = await DatabaseService.getUser(user.id);

    if (userError || !userData) {
      console.error('User profile error:', userError);
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
        user: userData 
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Token doğrulanırken hata oluştu' },
      { status: 500 }
    );
  }
}
