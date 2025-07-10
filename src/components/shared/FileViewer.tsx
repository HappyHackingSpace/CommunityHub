'use client';

import { useState } from 'react';
import { UploadedFile } from './FileUpload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, File, Image, Video, FileText } from 'lucide-react';

interface FileViewerProps {
  files: UploadedFile[];
  showDownload?: boolean;
  showPreview?: boolean;
}

export default function FileViewer({ 
  files, 
  showDownload = true, 
  showPreview = true 
}: FileViewerProps) {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileCategory = (type: string) => {
    if (type.startsWith('image/')) return 'Resim';
    if (type.startsWith('video/')) return 'Video';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('document') || type.includes('text')) return 'Döküman';
    return 'Dosya';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (file: UploadedFile) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const handleDownload = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Henüz dosya eklenmemiş</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file.type)}
              <div>
                <p className="font-medium">{file.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getFileCategory(file.type)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(file.uploadedAt).toLocaleDateString('tr')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {showPreview && (file.type.startsWith('image/') || file.type.includes('pdf')) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(file)}
                >
                  Önizle
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(file.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Aç
              </Button>
              
              {showDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  İndir
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="mt-4">
              {selectedFile.type.startsWith('image/') ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : selectedFile.type.includes('pdf') ? (
                <iframe
                  src={selectedFile.url}
                  className="w-full h-96 rounded-lg"
                  title={selectedFile.name}
                />
              ) : (
                <div className="text-center py-8">
                  <File className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Bu dosya türü için önizleme desteklenmiyor
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => window.open(selectedFile.url, '_blank')}
                  >
                    Dosyayı Aç
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}