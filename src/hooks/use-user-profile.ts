"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useSession } from "next-auth/react";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}

export function useUserProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch if we have an authenticated session
    if (!session?.accessToken) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Assuming the IAM module exposes /users/me
        const response = await apiClient.get<UserProfile>("/users/me");
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session?.accessToken]);

  return {
    profile,
    isLoading,
  };
}
