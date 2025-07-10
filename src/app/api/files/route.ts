import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { CloudinaryService } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const folderId = searchParams.get('folderId');
    
    if (!clubId) {
      return NextResponse.json(
        { success: false, error: 'Club ID gerekli' },
        { status: 400 }
      );
    }

    const { data, error } = await DatabaseService.getFiles({
      clubId,
      folderId: folderId || undefined,
    });
    
    if (error) {
      console.error('Files fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Dosyalar yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Files API error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosyalar yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clubId = formData.get('clubId') as string;
    const folderId = formData.get('folderId') as string;
    const description = formData.get('description') as string;
    
    if (!file || !clubId) {
      return NextResponse.json(
        { success: false, error: 'Dosya ve kulüp ID gerekli' },
        { status: 400 }
      );
    }

    // Validate file size (check club settings)
    const { data: club } = await DatabaseService.getClub(clubId);
    const maxFileSize = club?.settings?.maxFileSize || 10485760; // 10MB default
    
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { success: false, error: `Dosya boyutu çok büyük (max ${Math.round(maxFileSize / 1024 / 1024)}MB)` },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    const uploadResult = await CloudinaryService.uploadFile(base64, {
      folder: `community-platform/clubs/${clubId}`,
      resource_type: 'auto',
    });

    // Determine file type
    const getFileType = (mimeType: string) => {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
      return 'other';
    };

    // Save to database
    const { data, error } = await DatabaseService.createFile({
      name: file.name,
      original_name: file.name,
      file_url: uploadResult.secure_url,
      club_id: clubId,
      folder_id: folderId || null,
      uploaded_by: 'current-user-id', // TODO: Get from auth
      file_type: getFileType(file.type),
      mime_type: file.type,
      file_size: file.size,
      description: description || null,
      cloudinary_public_id: uploadResult.public_id,
    });

    if (error) {
      console.error('File creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Dosya kaydedilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Dosya başarıyla yüklendi'
    });
  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yüklenemedi' },
      { status: 500 }
    );
  }
}