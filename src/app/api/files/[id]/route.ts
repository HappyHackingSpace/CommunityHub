import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { CloudinaryService } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    
    // Get file info first
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('cloudinary_public_id')
      .eq('id', fileId)
      .single();

    if (fetchError || !file) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary if public_id exists
    if (file.cloudinary_public_id) {
      try {
        await CloudinaryService.deleteFile(file.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.warn('Cloudinary deletion failed:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    const { data, error } = await DatabaseService.deleteFile(fileId);

    if (error) {
      console.error('File deletion error:', error);
      return NextResponse.json(
        { success: false, error: 'Dosya silinemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dosya silindi'
    });
  } catch (error) {
    console.error('File delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya silinemedi' },
      { status: 500 }
    );
  }
}