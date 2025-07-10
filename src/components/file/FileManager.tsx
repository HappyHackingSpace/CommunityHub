'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFileStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Folder as FolderIcon, 
  File as FileIcon, 
  Upload, 
  Search, 
  Grid, 
  List,
  Plus,
  ArrowLeft,
  MoreVertical,
  Download,
  Trash
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateFolderDialog from './CreateFolderDialog';
import FileUploadDialog from './FileUploadDialog';


interface FileManagerProps {
  clubId: string;
}

export default function FileManager({ clubId }: FileManagerProps) {
  const { user, isAdmin, isLeader } = useAuth();
  const { 
    files, 
    folders, 
    currentFolder, 
    isLoading, 
    error,
    fetchFiles, 
    fetchFolders, 
    setCurrentFolder,
    deleteFile 
  } = useFileStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const canUpload = isAdmin || isLeader;

  useEffect(() => {
    fetchFiles(clubId, currentFolder?.id);
    fetchFolders(clubId, currentFolder?.id);
  }, [clubId, currentFolder, fetchFiles, fetchFolders]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFolderClick = (folder: any) => {
    setCurrentFolder(folder);
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
  };

  const handleFileDownload = (file: any) => {
    window.open(file.fileUrl, '_blank');
  };

  const handleFileDelete = async (fileId: string) => {
    if (confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      try {
        await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
        deleteFile(fileId);
      } catch (error) {
        console.error('File delete error:', error);
      }
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <FileIcon className="mx-auto h-12 w-12 mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentFolder && (
            <Button variant="ghost" onClick={handleBackClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {currentFolder ? currentFolder.name : 'Dosyalar'}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredFolders.length} klasör, {filteredFiles.length} dosya
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Dosya ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          {canUpload && (
            <>
              <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Klasör
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <CreateFolderDialog 
                    clubId={clubId}
                    parentId={currentFolder?.id}
                    onSuccess={() => setShowCreateFolder(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Dosya Yükle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <FileUploadDialog 
                    clubId={clubId}
                    folderId={currentFolder?.id}
                    onSuccess={() => setShowUploadDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Klasörler</h3>
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="group cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => handleFolderClick(folder)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FolderIcon className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="font-medium text-sm">{folder.name}</p>
                              <p className="text-xs text-gray-500">
                                {folder.fileCount || 0} dosya
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Dosyalar</h3>
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="group border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleFileDownload(file)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  İndir
                                </DropdownMenuItem>
                                {(canUpload || file.uploadedBy === user?.id) && (
                                  <DropdownMenuItem 
                                    onClick={() => handleFileDelete(file.id)}
                                    className="text-red-600"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Sil
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">
                            {file.name}
                          </h4>
                          
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {file.fileType}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.fileSize)}
                            </p>
                            {file.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="text-center py-12">
                  <FileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz dosya yok'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Farklı anahtar kelimeler deneyin'
                      : 'İlk dosyayı yüklemek için yukarıdaki butonu kullanın'
                    }
                  </p>
                  {canUpload && !searchTerm && (
                    <Button onClick={() => setShowUploadDialog(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Dosya Yükle
                    </Button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}