import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // TODO: Admin kontrolü ekle
    
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Yetkiler yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Permissions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Yetkiler yüklenemedi' },
      { status: 500 }
    );
  }
}