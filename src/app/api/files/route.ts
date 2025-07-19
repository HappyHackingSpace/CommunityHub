// src/app/api/files/route.ts - Secure & Paginated Files API
import { NextRequest } from 'next/server';
import { EnhancedDatabaseService } from '@/lib/database-enhanced';
import { withAuth, ApiResponse, parsePagination, authorizeUser } from '@/lib/api-middleware';
import { CloudinaryService } from '@/lib/cloudinary';

// 🔧 Helper function to determine file type from MIME type
function getFileType(mimeType: string): 'document' | 'image' | 'video' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf') || 
      mimeType.includes('document') || 
      mimeType.includes('text') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation')) return 'document';
  return 'other';
}

// 🔒 GET /api/files - Get paginated files with authentication
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { page, limit } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const folderId = searchParams.get('folderId');

    if (!clubId) {
      return ApiResponse.badRequest('Club ID gerekli');
    }

    // Check authorization for the club
    const { authorized, error: authError } = authorizeUser(user, undefined, undefined, clubId);
    if (!authorized) {
      return ApiResponse.forbidden(authError);
    }

    const options = {
      page,
      limit,
      clubId,
      folderId: folderId || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const { data, error } = await EnhancedDatabaseService.getFiles(options, user.id);

    if (error) {
      console.error('Files fetch error:', error);
      return ApiResponse.error('Dosyalar yüklenemedi');
    }

    return ApiResponse.success(data?.data || [], undefined, data?.pagination);
  } catch (error) {
    console.error('Files API error:', error);
    return ApiResponse.error('Dosyalar yüklenemedi');
  }
});

// 🔒 POST /api/files - Upload file with authentication
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clubId = formData.get('clubId') as string;
    const folderId = formData.get('folderId') as string;
    const description = formData.get('description') as string;

    if (!file || !clubId) {
      return ApiResponse.badRequest('Dosya ve kulüp ID gerekli');
    }

    // Check authorization for the club
    const { authorized, error: authError } = authorizeUser(user, undefined, undefined, clubId);
    if (!authorized) {
      return ApiResponse.forbidden(authError);
    }

    // File size validation (10MB default)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      return ApiResponse.badRequest(`Dosya boyutu çok büyük (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`);
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await CloudinaryService.uploadFile(buffer, {
      resource_type: 'auto',
      folder: `clubs/${clubId}`,
      public_id: `${Date.now()}-${file.name}`,
    });

    if (!uploadResult) {
      return ApiResponse.error('Dosya yüklenemedi');
    }

    // Save to database
    const fileData = {
      name: file.name,
      original_name: file.name,
      file_url: uploadResult.secure_url,
      file_type: getFileType(file.type),
      mime_type: file.type,
      file_size: file.size,
      club_id: clubId,
      folder_id: folderId || null,
      uploaded_by: user.id,
      description: description || null,
      cloudinary_public_id: uploadResult.public_id,
      is_public: false,
      tags: [],
      download_count: 0,
      version: 1,
      created_at: new Date().toISOString(),
    };

    const { data: savedFile, error: saveError } = await EnhancedDatabaseService.createFile(fileData);

    if (saveError) {
      // Clean up uploaded file
      await CloudinaryService.deleteFile(uploadResult.public_id);
      return ApiResponse.error('Dosya veritabanına kaydedilemedi');
    }

    return ApiResponse.success(savedFile, 'Dosya başarıyla yüklendi');
  } catch (error) {
    console.error('File upload error:', error);
    return ApiResponse.error('Dosya yüklenemedi');
  }
}, { allowedRoles: ['admin', 'club_leader', 'member'] });