'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadDialogProps {
  clubId: string;
  folderId?: string;
  onSuccess?: () => void;
}

export default function FileUploadDialog({ clubId, folderId, onSuccess }: FileUploadDialogProps) {
  const { uploadFile, isLoading } = useFileStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 25 * 1024 * 1024, // 25MB
    disabled: isLoading
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setDescriptions(prev => {
      const newDesc = { ...prev };
      delete newDesc[selectedFiles[index].name];
      return newDesc;
    });
  };

  const updateDescription = (fileName: string, description: string) => {
    setDescriptions(prev => ({ ...prev, [fileName]: description }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setError(null);
    const totalFiles = selectedFiles.length;
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const description = descriptions[file.name];
        
        setUploadProgress((i / totalFiles) * 100);
        
        await uploadFile(file, clubId, folderId, description);
      }
      
      setUploadProgress(100);
      setTimeout(() => {
        onSuccess?.();
      }, 500);
      
    } catch (err) {
      setError('Dosyalar yüklenirken hata oluştu');
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Dosya Yükle</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-blue-400 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400",
            isLoading && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Dosyaları buraya bırakın...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Dosyaları buraya sürükleyin veya seçmek için tıklayın
              </p>
              <p className="text-sm text-gray-500">
                Maksimum dosya boyutu: 25MB
              </p>
            </div>
          )}
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Seçilen Dosyalar ({selectedFiles.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <File className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Textarea
                    placeholder="Dosya açıklaması (isteğe bağlı)"
                    value={descriptions[file.name] || ''}
                    onChange={(e) => updateDescription(file.name, e.target.value)}
                    className="text-sm"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Yükleniyor...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button variant="outline" onClick={onSuccess} disabled={isLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={selectedFiles.length === 0 || isLoading}
          >
            {isLoading ? 'Yükleniyor...' : `${selectedFiles.length} Dosya Yükle`}
          </Button>
        </div>
      </div>
    </>
  );
}