'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, CheckSquare, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ClubList() {
  const { user, isAdmin, isLeader } = useAuth();
  const { clubs, isLoading, fetchClubs } = useClubStore();

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const userClubs = clubs.filter(club => 
    club.memberIds.includes(user?.id || '') || club.leaderId === user?.id
  );

  const getClubTypeColor = (type: string) => {
    switch (type) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClubTypeName = (type: string) => {
    switch (type) {
      case 'education': return 'Eğitim';
      case 'social': return 'Sosyal';
      case 'project': return 'Proje';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kulüpler</h1>
          <p className="text-gray-600">Katıldığınız kulüpleri yönetin</p>
        </div>
        {(isAdmin || isLeader) && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kulüp
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userClubs.map((club) => (
          <Link key={club.id} href={`/clubs/${club.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{club.name}</CardTitle>
                  <Badge className={getClubTypeColor(club.type)}>
                    {getClubTypeName(club.type)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {club.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Lider</span>
                    <span className="font-medium">{club.leaderName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {club.memberCount} üye
                    </div>
                    <div className="flex items-center">
                      <CheckSquare className="mr-1 h-4 w-4" />
                      8 görev
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      2 toplantı
                    </div>
                  </div>
                  
                  {club.leaderId === user?.id && (
                    <Badge variant="outline" className="w-fit">
                      Kulüp Liderisiniz
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {userClubs.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz hiçbir kulübe katılmadınız
          </h3>
          <p className="text-gray-500 mb-4">
            Kulüplere katılarak topluluk aktivitelerine dahil olun
          </p>
          <Button variant="outline">Kulüpleri Keşfet</Button>
        </div>
      )}
    </div>
  );
}