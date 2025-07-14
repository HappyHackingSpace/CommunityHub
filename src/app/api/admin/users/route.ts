import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // TODO: Admin kontrolü ekle
    
    const { data, error } = await DatabaseService.getUsers();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcılar yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Kullanıcılar yüklenemedi' },
      { status: 500 }
    );
  }
}