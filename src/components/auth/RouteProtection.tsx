// src/components/auth/RouteProtection.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface RouteProtectionProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('admin' | 'club_leader' | 'member')[];
  requiredRole?: 'admin' | 'club_leader' | 'member';
}

/**
 * 🔒 Server-side Route Protection Component
 * Bu component tüm authentication ve authorization kontrollerini server-side yapar
 * Client-side bypass edilemez
 */
export default async function RouteProtection({
  children,
  requireAuth = true,
  allowedRoles,
  requiredRole
}: RouteProtectionProps) {
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || error) {
    redirect('/login');
  }

  // Role-based authorization
  if (allowedRoles || requiredRole) {
    const userRole = user.user_metadata?.role || 'member';
    
    let hasAccess = false;

    if (allowedRoles) {
      // Multiple roles allowed
      hasAccess = allowedRoles.includes(userRole);
    } else if (requiredRole) {
      // Single role + admin always has access
      hasAccess = userRole === requiredRole || userRole === 'admin';
    }

    if (!hasAccess) {
      redirect('/dashboard'); // Redirect to safe page instead of showing error
    }
  }

  return <>{children}</>;
}
