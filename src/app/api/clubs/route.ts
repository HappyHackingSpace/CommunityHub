import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const { data, error } = await DatabaseService.getClubs(userId || undefined);
    
    if (error) {
      console.error('Clubs fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Kulüpler yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Clubs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Kulüpler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, leader_id, type = 'social' } = body;
    
    if (!name || !leader_id) {
      return NextResponse.json(
        { success: false, error: 'Kulüp adı ve lider gerekli' },
        { status: 400 }
      );
    }

    const { data, error } = await DatabaseService.createClub({
      name,
      description,
      leader_id,
      type: type as 'education' | 'social' | 'project',
    });

    if (error) {
      console.error('Club creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Kulüp oluşturulamadı' },
        { status: 500 }
      );
    }

    // Add leader as member
    if (data) {
      await DatabaseService.joinClub(data.id, leader_id);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Kulüp oluşturuldu'
    });
  } catch (error) {
    console.error('Club creation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Kulüp oluşturulamadı' },
      { status: 500 }
    );
  }
}