'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import FileManager from './FileManager';

export default function FilesPageContent() {
  const { user } = useAuth();
  const { clubs } = useClubStore();
  const [selectedClubId, setSelectedClubId] = useState<string>('');

  const userClubs = clubs.filter(club => 
    club.memberIds.includes(user?.id || '') || club.leaderId === user?.id
  );

  // Auto-select first club if only one available
  if (userClubs.length === 1 && !selectedClubId) {
    setSelectedClubId(userClubs[0].id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dosyalar</h1>
          <p className="text-gray-600">Kulüp dosyalarını görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Club Selection */}
      {userClubs.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kulüp Seçin</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClubId} onValueChange={setSelectedClubId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Kulüp seçin" />
              </SelectTrigger>
              <SelectContent>
                {userClubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* File Manager */}
      {selectedClubId ? (
        <FileManager clubId={selectedClubId} />
      ) : userClubs.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Hiçbir kulübe üye değilsiniz
              </h3>
              <p className="text-gray-500">
                Dosyalara erişmek için önce bir kulübe katılmanız gerekiyor
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Kulüp seçin
              </h3>
              <p className="text-gray-500">
                Dosyaları görüntülemek için yukarıdan bir kulüp seçin
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}