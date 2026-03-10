"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useTenantContext } from "@/components/providers/tenant-provider";
import { Community } from "./use-communities";

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  status: string;
  appliedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export function useCurrentCommunity() {
  const { tenantId } = useTenantContext();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If there is no tenant selected, we cannot load community Details
    if (!tenantId) {
      setCommunity(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    const fetchCommunityDetails = async () => {
      try {
        setIsLoading(true);
        // Step 1: Find the current community from the list of all communities by tenantId
        // In a real production scenario, the backend should expose GET /communities/by-tenant
        const allCommunitiesRes = await apiClient.get<Community[]>("/communities");
        const matchedCommunity = allCommunitiesRes.data.find(c => c.tenantId === tenantId);

        if (!matchedCommunity) {
          throw new Error("Community not found for the given tenant ID");
        }

        setCommunity(matchedCommunity);

        // Step 2: Fetch members for this specific community
        try {
          const membersRes = await apiClient.get<CommunityMember[]>(`/communities/${matchedCommunity.id}/members`);
          setMembers(membersRes.data);
        } catch (memErr) {
          console.error("Failed to fetch community members", memErr);
          // If we can't fetch members (maybe it's private and user is not approved), just set empty
          setMembers([]);
        }

        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch current community details", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityDetails();
  }, [tenantId]);

  return {
    community,
    members,
    isLoading,
    error,
  };
}
