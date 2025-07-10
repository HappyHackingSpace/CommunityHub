import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'general';
    const taskId = formData.get('taskId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dosya seçilmedi' },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB per file)
    const maxSize = 25 * 1024 * 1024; // 25MB
    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `${file.name} dosyası çok büyük (max 25MB)` },
          { status: 400 }
        );
      }
    }

    // Upload files to Cloudinary
    const uploadResults = [];
    
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convert buffer to base64 data URL
      const fileType = file.type;
      const base64 = `data:${fileType};base64,${buffer.toString('base64')}`;
      
      const result = await CloudinaryService.uploadFile(base64, {
        folder: `community-platform/${folder}`,
        resource_type: 'auto',
        public_id: taskId ? `${taskId}_${Date.now()}` : undefined,
      });

      uploadResults.push({
        id: result.public_id,
        name: file.name,
        url: result.secure_url,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadResults,
      message: `${uploadResults.length} dosya başarıyla yüklendi`
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Dosya ID gerekli' },
        { status: 400 }
      );
    }

    await CloudinaryService.deleteFile(publicId);

    return NextResponse.json({
      success: true,
      message: 'Dosya silindi'
    });

  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya silinemedi' },
      { status: 500 }
    );
  }
}