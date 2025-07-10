import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const userId = searchParams.get('userId');
    
    const { data, error } = await DatabaseService.getMeetings({
      clubId: clubId || undefined,
      userId: userId || undefined,
    });
    
    if (error) {
      console.error('Meetings fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Toplantılar yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Meetings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Toplantılar yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await DatabaseService.createMeeting(body);

    if (error) {
      console.error('Meeting creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Toplantı oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Toplantı oluşturuldu'
    });
  } catch (error) {
    console.error('Meeting creation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Toplantı oluşturulamadı' },
      { status: 500 }
    );
  }
}