'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Shield, Users } from 'lucide-react';
import { getUserPermissions, grantPermission, revokePermission, UserPermission } from '@/lib/permissions';
import PermissionTransfer from './PermissionTransfer';
import { AVAILABLE_PERMISSIONS } from '@/lib/permissions';


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function PermissionManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPermission, setShowAddPermission] = useState(false);

  // Kullanıcıları yükle
  useEffect(() => {
    fetchUsers();
    // Use AVAILABLE_PERMISSIONS from the library instead of fetching
    setPermissions(AVAILABLE_PERMISSIONS.map((perm, index) => ({
      id: index.toString(),
      ...perm
    })));
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Users fetch error:', error);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    setIsLoading(true);
    try {
      const permissions = await getUserPermissions(userId);
      setUserPermissions(permissions);
    } catch (error) {
      console.error('User permissions fetch error:', error);
    }
    setIsLoading(false);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchUserPermissions(user.id);
  };

  const handleGrantPermission = async (permissionName: string) => {
    if (!selectedUser || !currentUser) return;

    try {
      const success = await grantPermission(
        selectedUser.id, 
        permissionName, 
        currentUser.id
      );
      
      if (success) {
        fetchUserPermissions(selectedUser.id);
        setShowAddPermission(false);
      }
    } catch (error) {
      console.error('Grant permission error:', error);
    }
  };

  const handleRevokePermission = async (permissionName: string) => {
    if (!selectedUser) return;

    try {
      const success = await revokePermission(selectedUser.id, permissionName);
      if (success) {
        fetchUserPermissions(selectedUser.id);
      }
    } catch (error) {
      console.error('Revoke permission error:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionsByCategory = () => {
    const categories = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    return categories;
  };

  const getCategoryDisplayName = (category: string) => {
    const names = {
      'user_management': '👥 Kullanıcı Yönetimi',
      'club_management': '🏢 Kulüp Yönetimi',
      'task_management': '📝 Görev Yönetimi',
      'file_management': '📁 Dosya Yönetimi',
      'system': '⚙️ Sistem'
    };
    return names[category as keyof typeof names] || category;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'club_leader': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const userHasPermission = (permissionName: string) => {
    return userPermissions.some(up => up.name === permissionName);
  };

  const availablePermissions = permissions.filter(p => 
    !userHasPermission(p.name)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kullanıcı Listesi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Kullanıcılar ({filteredUsers.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Yetkileri */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              {selectedUser ? `${selectedUser.name} - Yetkiler` : 'Kullanıcı Seçin'}
            </CardTitle>
            {selectedUser && (
              <Dialog open={showAddPermission} onOpenChange={setShowAddPermission}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Yetki Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yetki Ekle - {selectedUser.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {Object.entries(getPermissionsByCategory()).map(([category, perms]) => {
                      const availablePerms = perms.filter(p => !userHasPermission(p.name));
                      if (availablePerms.length === 0) return null;

                      return (
                        <div key={category}>
                          <h4 className="font-medium mb-2">{getCategoryDisplayName(category)}</h4>
                          <div className="space-y-2">
                            {availablePerms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div>
                                  <p className="font-medium text-sm">{permission.name}</p>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleGrantPermission(permission.name)}
                                >
                                  Ekle
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {availablePermissions.length === 0 && (
                      <p className="text-center text-gray-500">Eklenebilecek yetki yok</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
       

<CardContent>
  {!selectedUser ? (
    <div className="text-center py-12">
      <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500">Yetkilerini görmek için bir kullanıcı seçin</p>
    </div>
  ) : isLoading ? (
    <div className="text-center py-12">
      <p className="text-gray-500">Yetkiler yükleniyor...</p>
    </div>
  ) : (
    <PermissionTransfer 
      user={selectedUser}
      userPermissions={userPermissions}
      allPermissions={permissions}
      onGrantPermission={handleGrantPermission}
      onRevokePermission={handleRevokePermission}
    />
  )}
</CardContent>
      </Card>
    </div>
  );
}