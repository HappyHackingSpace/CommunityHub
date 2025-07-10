'use client';

import { useState } from 'react';
import { useFileStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Folder } from 'lucide-react';

interface CreateFolderDialogProps {
  clubId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export default function CreateFolderDialog({ clubId, parentId, onSuccess }: CreateFolderDialogProps) {
  const { createFolder } = useFileStore();
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('Klasör adı gerekli');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createFolder(folderName.trim(), clubId, parentId);
      onSuccess?.();
    } catch (err) {
      setError('Klasör oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Folder className="mr-2 h-5 w-5" />
          Yeni Klasör Oluştur
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="folderName" className="block text-sm font-medium mb-2">
            Klasör Adı
          </label>
          <Input
            id="folderName"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Klasör adını girin"
            disabled={isSubmitting}
            autoFocus
          />
        </div>
        
        <div className="flex items-center justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
            İptal
          </Button>
          <Button type="submit" disabled={isSubmitting || !folderName.trim()}>
            {isSubmitting ? 'Oluşturuluyor...' : 'Klasör Oluştur'}
          </Button>
        </div>
      </form>
    </>
  );
}