// src/lib/api-middleware.ts - Unified API Authentication & Authorization
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'club_leader' | 'member';
  clubId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 🔒 Authentication middleware
export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthenticatedUser | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: 'Authentication required' };
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, is_active, name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // If user profile doesn't exist, create one
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'member',
            is_active: true
          })
          .select('id, email, role, is_active, name')
          .single();

        if (createError || !newProfile) {
          return { user: null, error: 'Failed to create user profile' };
        }

        return {
          user: {
            id: newProfile.id,
            email: newProfile.email,
            role: newProfile.role
          },
          error: null
        };
      }
      return { user: null, error: `Profile error: ${profileError.message}` };
    }

    if (!userProfile) {
      return { user: null, error: 'User profile not found' };
    }

    if (!userProfile.is_active) {
      return { user: null, error: 'User account is disabled' };
    }

    return {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      },
      error: null
    };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

// 🔒 Authorization middleware
export function authorizeUser(
  user: AuthenticatedUser,
  requiredRole?: 'admin' | 'club_leader' | 'member',
  allowedRoles?: ('admin' | 'club_leader' | 'member')[],
  resourceClubId?: string
): { authorized: boolean; error?: string } {
  // Admin has access to everything
  if (user.role === 'admin') {
    return { authorized: true };
  }

  // Check specific role requirement
  if (requiredRole && user.role !== requiredRole) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  // Check club-specific access for club leaders
  if (user.role === 'club_leader' && resourceClubId && user.clubId !== resourceClubId) {
    return { authorized: false, error: 'Access denied for this club' };
  }

  return { authorized: true };
}

// 📄 Pagination utilities
export function parsePagination(request: NextRequest): {
  page: number;
  limit: number;
  offset: number;
} {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// 📊 Response helpers
export class ApiResponse {
  static success<T>(data: T, message?: string, pagination?: any): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
      pagination
    });
  }

  static error(message: string, status = 500): NextResponse {
    return NextResponse.json({
      success: false,
      error: message
    }, { status });
  }

  static unauthorized(message = 'Authentication required'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 401 });
  }

  static forbidden(message = 'Access denied'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 403 });
  }

  static badRequest(message = 'Invalid request'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 400 });
  }
}

// 🚀 Base API handler with authentication
export function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => Promise<NextResponse>,
  options?: {
    requiredRole?: 'admin' | 'club_leader' | 'member';
    allowedRoles?: ('admin' | 'club_leader' | 'member')[];
  }
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Authenticate user
      const { user, error } = await authenticateRequest(request);
      
      if (!user || error) {
        return ApiResponse.unauthorized(error ?? 'Authentication required');
      }

      // Authorize user if roles specified
      if (options?.requiredRole || options?.allowedRoles) {
        const { authorized, error: authError } = authorizeUser(
          user,
          options.requiredRole,
          options.allowedRoles
        );

        if (!authorized) {
          return ApiResponse.forbidden(authError);
        }
      }

      // Call the actual handler
      return await handler(request, user, ...args);
    } catch (error) {
      return ApiResponse.error('Internal server error');
    }
  };
}
