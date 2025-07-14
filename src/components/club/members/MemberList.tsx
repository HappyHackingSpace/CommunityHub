"use client";

import React, { useState, useEffect } from 'react';
import MemberCard from './MemberCard';
import MemberSearch from './MemberSearch';

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'leader' | 'member';
  joinDate: string;
  taskCount: number;
  avatar: string;
}

// Mock data - will come from API in real project
const mockMembers : Member[] = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    phone: "+90 532 123 4567",
    role: "admin",
    joinDate: "2024-01-15",
    taskCount: 25,
    avatar: "https://via.placeholder.com/150/0066CC/FFFFFF?text=AY"
  },
  {
    id: 2,
    name: "Fatma Kaya",
    email: "fatma@example.com",
    phone: "+90 533 987 6543",
    role: "leader",
    joinDate: "2024-02-20",
    taskCount: 18,
    avatar: "https://via.placeholder.com/150/FF6B6B/FFFFFF?text=FK"
  },
  {
    id: 3,
    name: "Mehmet Öz",
    email: "mehmet@example.com",
    phone: "+90 534 555 7890",
    role: "member",
    joinDate: "2024-03-10",
    taskCount: 12,
    avatar: "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=MÖ"
  },
  {
    id: 4,
    name: "Ayşe Demir",
    email: "ayse@example.com",
    phone: "+90 535 111 2233",
    role: "member",
    joinDate: "2024-04-05",
    taskCount: 8,
    avatar: "https://via.placeholder.com/150/45B7D1/FFFFFF?text=AD"
  },
  {
    id: 5,
    name: "Can Şahin",
    email: "can@example.com",
    phone: "+90 536 444 5566",
    role: "leader",
    joinDate: "2024-01-30",
    taskCount: 22,
    avatar: "https://via.placeholder.com/150/96CEB4/FFFFFF?text=CŞ"
  },
  {
    id: 6,
    name: "Zeynep Arslan",
    email: "zeynep@example.com",
    phone: "+90 537 777 8899",
    role: "member",
    joinDate: "2024-05-12",
    taskCount: 5,
    avatar: "https://via.placeholder.com/150/FFEAA7/000000?text=ZA"
  }
];

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'leader' | 'member';
  joinDate: string;
  taskCount: number;
  avatar: string;
}

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(mockMembers);
  const [loading, setLoading] = useState(false);

  // Fetch data from API in real project
  useEffect(() => {
    // fetchMembers();
  }, []);

  // Mock API call - will use club API in real project
  const fetchMembers = async () => {
    setLoading(true);
    try {
      // const response = await fetch('/api/club/members');
      // const data = await response.json();
      // setMembers(data);
      // setFilteredMembers(data);
      
      // Mock delay
      setTimeout(() => {
        setMembers(mockMembers);
        setFilteredMembers(mockMembers);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string, roleFilter: string) => {
    let filtered = members;

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'leader': return 'Lider';
      case 'member': return 'Üye';
      default: return role;
    }
  };

  // Simple statistics
  const stats = {
    total: members.length,
    admins: members.filter(m => m.role === 'admin').length,
    leaders: members.filter(m => m.role === 'leader').length,
    members: members.filter(m => m.role === 'member').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Title and Statistics */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Kulüp Üyeleri</h1>
        
        {/* Statistic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Üye</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Yönetici</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.admins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lider</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.leaders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Üye</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.members}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filtering */}
      <MemberSearch onSearch={handleSearch} />

      {/* Result Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          <span className="font-semibold">{filteredMembers.length}</span> üye bulundu
        </p>
      </div>

      {/* Member List */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Üye bulunamadı</h3>
          <p className="mt-1 text-gray-500">Arama kriterlerinizi değiştirip tekrar deneyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberList;