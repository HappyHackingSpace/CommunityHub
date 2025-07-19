// src/app/api/clubs/route.ts - Secure & Paginated API
import { NextRequest } from 'next/server';
import { EnhancedDatabaseService } from '@/lib/database-enhanced';
import { withAuth, ApiResponse, parsePagination } from '@/lib/api-middleware';

// 🔒 GET /api/clubs - Get paginated clubs with authentication
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { page, limit } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    
    const options = {
      page,
      limit,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const { data, error } = await EnhancedDatabaseService.getClubs(options, user.id);
    
    if (error) {
      console.error('Clubs fetch error:', error);
      return ApiResponse.error('Kulüpler yüklenemedi');
    }

    return ApiResponse.success(data?.data || [], undefined, data?.pagination);
  } catch (error) {
    console.error('Clubs API error:', error);
    return ApiResponse.error('Kulüpler yüklenemedi');
  }
});

// 🔒 POST /api/clubs - Create new club (admin or club leader only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { name, description, type = 'social' } = body;

    // Validation
    if (!name || !description) {
      return ApiResponse.badRequest('Kulüp adı ve açıklama gerekli');
    }

    // Prepare club data
    const clubData = {
      name,
      description,
      type,
      leader_id: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await EnhancedDatabaseService.createClub(clubData);
    
    if (error) {
      console.error('Club creation error:', error);
      return ApiResponse.error('Kulüp oluşturulamadı');
    }

    return ApiResponse.success(data, 'Kulüp başarıyla oluşturuldu');
  } catch (error) {
    console.error('Club creation API error:', error);
    return ApiResponse.error('Kulüp oluşturulamadı');
  }
}, { allowedRoles: ['admin', 'club_leader'] });