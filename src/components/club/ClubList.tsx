'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClubsApi } from '@/hooks/useSimpleApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, CheckSquare, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ClubList() {
  const { user, isAdmin, isLeader } = useAuth();
  const { clubs, isLoading, error, fetchClubs } = useClubsApi();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []); // Removed fetchClubs from dependency array - only fetch once on mount

  // Loading timeout mechanism
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // Tüm kulüpleri göster
  const displayClubs = clubs;

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

  if (isLoading && !clubs.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kulüpler</h1>
            <p className="text-gray-600">Kulüpler yükleniyor...</p>
          </div>
        </div>

        {loadingTimeout ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Yükleme uzun sürüyor
              </h3>
              <p className="text-yellow-700 mb-4">
                Kulüpler yüklenirken bir sorun oluşmuş olabilir. Sayfayı yeniden deneyin.
              </p>
              <Button 
                onClick={() => {
                  setLoadingTimeout(false);
                  fetchClubs();
                }}
                variant="outline"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Yeniden Dene
              </Button>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  // Show error if there's an error and no clubs loaded
  if (error && !clubs.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kulüpler</h1>
            <p className="text-gray-600">Kulüpler yüklenirken hata oluştu</p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Yükleme Hatası
            </h3>
            <p className="text-red-700 mb-4">
              {error}
            </p>
            <Button 
              onClick={() => fetchClubs()}
              variant="outline"
              className="border-red-300 text-red-800 hover:bg-red-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Yeniden Dene
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kulüpler</h1>
          <p className="text-gray-600">Tüm kulüpleri görüntüleyin</p>
        </div>
        {(isAdmin || isLeader) && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kulüp
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayClubs.map((club) => (
          <Card key={club.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Link href={`/clubs/${club.id}`} className="flex-1">
                  <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">
                    {club.name}
                  </CardTitle>
                </Link>
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
                
                {/* Kullanıcının bu kulüpteki durumu */}
                <div className="flex items-center justify-between">
                  {club.leaderId === user?.id && (
                    <Badge variant="outline" className="w-fit">
                      Kulüp Liderisiniz
                    </Badge>
                  )}
                  {(club.memberIds || []).includes(user?.id || '') && club.leaderId !== user?.id && (
                    <Badge variant="outline" className="w-fit bg-green-50 text-green-700">
                      Üyesiniz
                    </Badge>
                  )}
                  {!(club.memberIds || []).includes(user?.id || '') && club.leaderId !== user?.id && (
                    <Button variant="outline" size="sm">
                      Katıl
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {displayClubs.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz hiçbir kulüp yok
          </h3>
          <p className="text-gray-500 mb-4">
            İlk kulübü oluşturun ve topluluğu başlatın
          </p>
          {(isAdmin || isLeader) && (
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              İlk Kulübü Oluştur
            </Button>
          )}
        </div>
      )}
    </div>
  );
}