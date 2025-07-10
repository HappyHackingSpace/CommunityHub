import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { meeting_id, user_id } = await request.json();
    
    if (!meeting_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Toplantı ID ve kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    const { data, error } = await DatabaseService.addMeetingParticipant({
      meeting_id,
      user_id,
      response: 'pending'
    });

    if (error) {
      console.error('Meeting participant creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Katılımcı eklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Katılımcı eklendi'
    });
  } catch (error) {
    console.error('Meeting participants API error:', error);
    return NextResponse.json(
      { success: false, error: 'Katılımcı eklenemedi' },
      { status: 500 }
    );
  }
}