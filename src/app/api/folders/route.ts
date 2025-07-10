import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const parentId = searchParams.get('parentId');
    
    if (!clubId) {
      return NextResponse.json(
        { success: false, error: 'Club ID gerekli' },
        { status: 400 }
      );
    }

    const { data, error } = await DatabaseService.getFolders({
      clubId,
      parentId: parentId || undefined,
    });
    
    if (error) {
      console.error('Folders fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Klasörler yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Folders API error:', error);
    return NextResponse.json(
      { success: false, error: 'Klasörler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, clubId, parentId } = await request.json();
    
    if (!name || !clubId) {
      return NextResponse.json(
        { success: false, error: 'Klasör adı ve kulüp ID gerekli' },
        { status: 400 }
      );
    }

     const { data, error } = await DatabaseService.createFolder({
      name,
      club_id: clubId,
      parent_id: parentId || null,
      created_by: 'current-user-id', // TODO: Get from auth
    });

    if (error) {
      console.error('Folder creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Klasör oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Klasör oluşturuldu'
    });
  } catch (error) {
    console.error('Folder creation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Klasör oluşturulamadı' },
      { status: 500 }
    );
  }
}