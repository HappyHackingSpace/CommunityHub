// src/app/api/meetings/route.ts - Secure & Paginated Meetings API
import { NextRequest } from 'next/server';
import { EnhancedDatabaseService } from '@/lib/database-enhanced';
import { withAuth, ApiResponse, parsePagination, authorizeUser } from '@/lib/api-middleware';

// 🔒 GET /api/meetings - Get paginated meetings with authentication
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { page, limit } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    const options = {
      page,
      limit,
      clubId: clubId || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc', // Upcoming meetings first
    };

    // If clubId is specified, check authorization
    if (clubId) {
      const { authorized, error: authError } = authorizeUser(user, undefined, undefined, clubId);
      if (!authorized) {
        return ApiResponse.forbidden(authError);
      }
    }

    const { data, error } = await EnhancedDatabaseService.getMeetings(options, user.id);

    if (error) {
      console.error('Meetings fetch error:', error);
      return ApiResponse.error('Toplantılar yüklenemedi');
    }

    return ApiResponse.success(data?.data || [], undefined, data?.pagination);
  } catch (error) {
    console.error('Meetings API error:', error);
    return ApiResponse.error('Toplantılar yüklenemedi');
  }
});

// 🔒 POST /api/meetings - Create new meeting (admin or club leader only)
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { title, description, start_time, end_time, location, club_id } = body;

   if (!title || !start_time || !club_id) {
      return ApiResponse.badRequest('Toplantı başlığı, başlangıç zamanı ve kulüp ID gerekli');
    }
    // Validate dates
    const startDate = new Date(start_time);
    if (isNaN(startDate.getTime())) {
      return ApiResponse.badRequest('Geçersiz başlangıç zamanı formatı');
    }
    if (startDate < new Date()) {
      return ApiResponse.badRequest('Başlangıç zamanı gelecekte olmalıdır');
    }
    if (end_time) {
      const endDate = new Date(end_time);
      if (isNaN(endDate.getTime())) {
        return ApiResponse.badRequest('Geçersiz bitiş zamanı formatı');
      }
      if (endDate <= startDate) {
        return ApiResponse.badRequest('Bitiş zamanı başlangıç zamanından sonra olmalıdır');
      }
    }

    // Check authorization for the club
    const { authorized, error: authError } = authorizeUser(user, undefined, ['admin', 'club_leader'], club_id);
    if (!authorized) {
      return ApiResponse.forbidden(authError);
    }

    // Prepare meeting data
    const meetingData = {
      title,
      description,
      start_time,
      end_time,
      location,
      club_id,
      organizer_id: user.id,
      status: 'scheduled' as const,
      participants: [],
    };

    const { data, error } = await EnhancedDatabaseService.createMeeting(meetingData);

    if (error) {
      console.error('Meeting creation error:', error);
      return ApiResponse.error('Toplantı oluşturulamadı');
    }

    return ApiResponse.success(data, 'Toplantı başarıyla oluşturuldu');
  } catch (error) {
    console.error('Meeting creation API error:', error);
    return ApiResponse.error('Toplantı oluşturulamadı');
  }
}, { allowedRoles: ['admin', 'club_leader'] });