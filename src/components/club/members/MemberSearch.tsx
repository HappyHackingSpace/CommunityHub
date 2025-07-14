"use client";

import React, { useState } from 'react';

interface MemberSearchProps {
  onSearch: (searchTerm: string, roleFilter: string) => void;
}

const MemberSearch: React.FC<MemberSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value, roleFilter);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRoleFilter(value);
    onSearch(searchTerm, value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setRoleFilter('all');
    onSearch('', 'all');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Box */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Üye Ara
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="İsim veya e-posta ile arama yapın..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Rol Filtresi */}
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Rol Filtresi
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={handleRoleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm Roller</option>
            <option value="admin">Yönetici</option>
            <option value="leader">Lider</option>
            <option value="member">Üye</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(searchTerm || roleFilter !== 'all') && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Aktif filtreler:</span>
          
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Arama: "{searchTerm}"
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSearch('', roleFilter);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {roleFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Rol: {roleFilter === 'admin' ? 'Yönetici' : roleFilter === 'leader' ? 'Lider' : 'Üye'}
              <button
                onClick={() => {
                  setRoleFilter('all');
                  onSearch(searchTerm, 'all');
                }}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          <button
            onClick={clearSearch}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Tümünü Temizle
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberSearch;