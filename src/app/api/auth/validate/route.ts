import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Supabase token'ını doğrula
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Kullanıcı profilini getir
    const { data: userData, error: userError } = await DatabaseService.getUser(user.id);

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
