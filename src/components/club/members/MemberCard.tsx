"use client";

import React from 'react';
import { Member } from './MemberList';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'leader': return 'bg-green-100 text-green-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'leader': return 'Lider';
      case 'member': return 'Üye';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJoinDuration = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} gün önce`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ay önce`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} yıl önce`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Top Section - Avatar and Basic Info */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {member.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
              {getRoleDisplayName(member.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section - Contact Info */}
      <div className="px-6 pb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{member.phone}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Statistics */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{member.taskCount}</div>
            <div className="text-xs text-gray-500">Görev</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{formatDate(member.joinDate)}</div>
            <div className="text-xs text-gray-500">Katılım Tarihi</div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            {getJoinDuration(member.joinDate)} katıldı
          </span>
        </div>
      </div>

      {/* Action Buttons for Hover Effect */}
      <div className="px-6 py-3 bg-white border-t border-gray-200 opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Mesaj Gönder
          </button>
          <button className="flex-1 bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
            Profil Görüntüle
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;