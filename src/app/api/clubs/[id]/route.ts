import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await DatabaseService.getClub(params.id);
    
    if (error) {
      console.error('Club fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Kulüp bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Club API error:', error);
    return NextResponse.json(
      { success: false, error: 'Kulüp bilgileri yüklenemedi' },
      { status: 500 }
    );
  }
}