import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const { data, error } = await DatabaseService.getTasks({
      clubId: clubId || undefined,
      userId: userId || undefined,
      status: status || undefined,
    });
    
    if (error) {
      console.error('Tasks fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Görevler yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json(
      { success: false, error: 'Görevler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await DatabaseService.createTask(body);

    if (error) {
      console.error('Task creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Görev oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Görev oluşturuldu'
    });
  } catch (error) {
    console.error('Task creation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Görev oluşturulamadı' },
      { status: 500 }
    );
  }
}