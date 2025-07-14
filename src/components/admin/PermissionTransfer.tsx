'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import { 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  CheckSquare,
  Square
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermission {
  name: string;
  granted_at: string;
  granted_by: string;
  expires_at?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PermissionTransferProps {
  user: User;
  userPermissions: UserPermission[];
  allPermissions: Permission[];
  onGrantPermission: (permissionName: string) => Promise<void>;
  onRevokePermission: (permissionName: string) => Promise<void>;
}

export default function PermissionTransfer({
  user,
  userPermissions,
  allPermissions,
  onGrantPermission,
  onRevokePermission
}: PermissionTransferProps) {
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [selectedLeft, setSelectedLeft] = useState<Set<string>>(new Set());
  const [selectedRight, setSelectedRight] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Memoized calculations
  const { userPerms, availablePerms } = useMemo(() => {
    const userPermNames = new Set(userPermissions.map(up => up.name));
    
    // Create enhanced user permissions with full permission details
    const userPermsWithDetails = userPermissions
      .map(up => {
        const permission = allPermissions.find(p => p.name === up.name);
        return permission ? { ...up, permission } : null;
      })
      .filter(Boolean)
      .filter(up => 
        up!.permission.name.toLowerCase().includes(searchLeft.toLowerCase())
      );
    
    return {
      userPerms: userPermsWithDetails as (UserPermission & { permission: Permission })[],
      availablePerms: allPermissions.filter(p => 
        !userPermNames.has(p.name) && 
        p.name.toLowerCase().includes(searchRight.toLowerCase())
      )
    };
  }, [userPermissions, allPermissions, searchLeft, searchRight]);

  // Bulk transfer functions
  const transferToUser = async () => {
    if (selectedRight.size === 0) return;
    setLoading(true);
    
    // API calls to grant permissions
    try {
      await Promise.all(
        Array.from(selectedRight).map(permName => onGrantPermission(permName))
      );
    } catch (error) {
      console.error('Transfer error:', error);
    }
    
    setSelectedRight(new Set());
    setLoading(false);
  };

  const transferFromUser = async () => {
    if (selectedLeft.size === 0) return;
    setLoading(true);
    
    try {
      await Promise.all(
        Array.from(selectedLeft).map(permName => onRevokePermission(permName))
      );
    } catch (error) {
      console.error('Transfer error:', error);
    }
    
    setSelectedLeft(new Set());
    setLoading(false);
  };

  // Select all functions
  const selectAllLeft = () => {
    setSelectedLeft(new Set(userPerms.map(up => up.permission.name)));
  };

  const selectAllRight = () => {
    setSelectedRight(new Set(availablePerms.map(p => p.name)));
  };

  const clearLeft = () => setSelectedLeft(new Set());
  const clearRight = () => setSelectedRight(new Set());

  // Toggle selection
  const toggleLeft = (permName: string) => {
    const newSet = new Set(selectedLeft);
    newSet.has(permName) ? newSet.delete(permName) : newSet.add(permName);
    setSelectedLeft(newSet);
  };

  const toggleRight = (permName: string) => {
    const newSet = new Set(selectedRight);
    newSet.has(permName) ? newSet.delete(permName) : newSet.add(permName);
    setSelectedRight(newSet);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{user.name}</span>
          <Badge variant="outline">{user.role}</Badge>
        </div>
        <div className="text-sm text-gray-500">
          {userPermissions.length} / {allPermissions.length} yetki
        </div>
      </div>

      {/* Transfer Grid */}
      <div className="grid grid-cols-7 gap-4 h-96">
        
        {/* Sol: Mevcut Yetkiler */}
        <Card className="col-span-3 p-3">
          <div className="space-y-2 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Mevcut ({userPerms.length})</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={selectAllLeft} disabled={userPerms.length === 0}>
                  Tümü
                </Button>
                <Button size="sm" variant="ghost" onClick={clearLeft} disabled={selectedLeft.size === 0}>
                  Temizle
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Ara..."
                value={searchLeft}
                onChange={(e) => setSearchLeft(e.target.value)}
                className="pl-7 h-7 text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto border rounded">
              {userPerms.map((up) => (
                <div
                  key={up.permission.id}
                  onClick={() => toggleLeft(up.permission.name)}
                  className={`p-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                    selectedLeft.has(up.permission.name) ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      {selectedLeft.has(up.permission.name) ? 
                        <CheckSquare className="h-3 w-3 text-red-600" /> : 
                        <Square className="h-3 w-3 text-gray-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{up.permission.name}</p>
                      <p className="text-xs text-gray-500 truncate">{up.permission.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {userPerms.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-xs">
                  Yetki yok
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Orta: Transfer Butonları */}
        <div className="flex flex-col justify-center items-center space-y-2">
          <Button
            onClick={transferToUser}
            disabled={selectedRight.size === 0 || loading}
            size="sm"
            className="w-full"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Ekle ({selectedRight.size})
          </Button>
          
          <Button
            onClick={transferFromUser}
            disabled={selectedLeft.size === 0 || loading}
            size="sm"
            variant="destructive"
            className="w-full"
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            Kaldır ({selectedLeft.size})
          </Button>
          
          {loading && (
            <div className="text-xs text-gray-500">Aktarılıyor...</div>
          )}
        </div>

        {/* Sağ: Eklenebilir Yetkiler */}
        <Card className="col-span-3 p-3">
          <div className="space-y-2 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Eklenebilir ({availablePerms.length})</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={selectAllRight} disabled={availablePerms.length === 0}>
                  Tümü
                </Button>
                <Button size="sm" variant="ghost" onClick={clearRight} disabled={selectedRight.size === 0}>
                  Temizle
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Ara..."
                value={searchRight}
                onChange={(e) => setSearchRight(e.target.value)}
                className="pl-7 h-7 text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto border rounded">
              {availablePerms.map((perm) => (
                <div
                  key={perm.id}
                  onClick={() => toggleRight(perm.name)}
                  className={`p-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                    selectedRight.has(perm.name) ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      {selectedRight.has(perm.name) ? 
                        <CheckSquare className="h-3 w-3 text-green-600" /> : 
                        <Square className="h-3 w-3 text-gray-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{perm.name}</p>
                      <p className="text-xs text-gray-500 truncate">{perm.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {availablePerms.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-xs">
                  Eklenebilir yetki yok
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}