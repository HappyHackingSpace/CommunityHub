import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { response, userId } = await request.json();
    const meetingId = params.id;
    
    if (!response || !userId) {
      return NextResponse.json(
        { success: false, error: 'Yanıt ve kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    if (!['accepted', 'declined'].includes(response)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz yanıt' },
        { status: 400 }
      );
    }

    const { data, error } = await DatabaseService.updateMeetingResponse(
      meetingId, 
      userId, 
      response
    );

    if (error) {
      console.error('Meeting response update error:', error);
      return NextResponse.json(
        { success: false, error: 'Yanıt güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { userId, response },
      message: `Toplantı ${response === 'accepted' ? 'kabul edildi' : 'reddedildi'}`
    });
  } catch (error) {
    console.error('Meeting response API error:', error);
    return NextResponse.json(
      { success: false, error: 'Yanıt güncellenemedi' },
      { status: 500 }
    );
  }
}