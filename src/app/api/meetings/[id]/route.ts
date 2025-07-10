import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await DatabaseService.getMeetingById(params.id);
    
    if (error) {
      console.error('Meeting fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Toplantı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Meeting API error:', error);
    return NextResponse.json(
      { success: false, error: 'Toplantı bilgileri yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    const { data, error } = await DatabaseService.updateMeeting(params.id, updates);

    if (error) {
      console.error('Meeting update error:', error);
      return NextResponse.json(
        { success: false, error: 'Toplantı güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Toplantı güncellendi'
    });
  } catch (error) {
    console.error('Meeting update API error:', error);
    return NextResponse.json(
      { success: false, error: 'Toplantı güncellenemedi' },
      { status: 500 }
    );
  }
}