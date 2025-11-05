// Profile Page - Kullanıcı profil sayfası

'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

function ProfileContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-100 text-red-800',
      ADMIN: 'bg-orange-100 text-orange-800',
      ORGANIZER: 'bg-blue-100 text-blue-800',
      MENTOR: 'bg-purple-100 text-purple-800',
      MEMBER: 'bg-green-100 text-green-800',
      GUEST: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Süper Admin',
      ADMIN: 'Admin',
      ORGANIZER: 'Organizatör',
      MENTOR: 'Mentor',
      MEMBER: 'Üye',
      GUEST: 'Misafir',
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard'a Dön
        </Button>

        {/* Profile Card */}
        <Card className="p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                <AvatarFallback className="text-3xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.displayName}
              </h1>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Katılım: {user?.createdAt && format(new Date(user.createdAt), 'PPP', { locale: tr })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <div className="flex flex-wrap gap-2">
                    {user?.roles.map((role) => (
                      <Badge
                        key={role}
                        className={getRoleColor(role)}
                        variant="secondary"
                      >
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Durum:</span>
                <Badge
                  className={
                    user?.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                  variant="secondary"
                >
                  {user?.status === 'ACTIVE' ? 'Aktif' :
                   user?.status === 'INACTIVE' ? 'Pasif' :
                   user?.status === 'SUSPENDED' ? 'Askıda' : user?.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hesap Bilgileri</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kullanıcı ID:</span>
                <span className="font-mono text-gray-900">{user?.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oluşturulma:</span>
                <span className="text-gray-900">
                  {user?.createdAt && format(new Date(user.createdAt), 'PP', { locale: tr })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Son Güncelleme:</span>
                <span className="text-gray-900">
                  {user?.updatedAt && format(new Date(user.updatedAt), 'PP', { locale: tr })}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Roller ve Yetkiler</h3>
            <div className="space-y-2">
              {user?.roles.map((role) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{getRoleLabel(role)}</span>
                  <Badge className={getRoleColor(role)} variant="secondary">
                    {role}
                  </Badge>
                </div>
              ))}
            </div>
            {user?.roles.includes('GUEST' as any) && (
              <p className="mt-4 text-sm text-gray-500">
                Daha fazla yetki için bir yöneticiye başvurun.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
