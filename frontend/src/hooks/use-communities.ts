"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export interface Community {
  id: string;
  name: string;
  description: string;
  visibility: string; // PUBLIC, PRIVATE, RESTRICTED
  founderId: string;
  logoUrl?: string;
  websiteUrl?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  membersCount?: number; // Might need to fetch separately if not in DTO
  isMember?: boolean;
}

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true);
        // Assuming backend exposes a route to get public/discoverable communities
        const response = await apiClient.get<Community[]>("/communities");
        setCommunities(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch communities", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const applyToJoin = async (communityId: string) => {
    try {
      await apiClient.post(`/communities/${communityId}/apply`);
      
      // Update local state to show as pending or member
      setCommunities((prev) => 
        prev.map(c => 
          c.id === communityId ? { ...c, isMember: true } : c
        )
      );
      return true;
    } catch (err) {
      console.error("Failed to apply to community", err);
      throw err;
    }
  };

  return {
    communities,
    isLoading,
    error,
    applyToJoin,
  };
}
