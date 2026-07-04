"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useTenantContext } from "@/components/providers/tenant-provider";
import { useSession } from "next-auth/react";

import { useUserProfile } from "@/hooks/use-user-profile";

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
}

export function useActivityFeed() {
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const { tenantId } = useTenantContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const currentUserId = profile?.id || session?.user?.id;

  const fetchFeed = useCallback(async () => {
    // Stop if tenant isn't ready or user isn't auth'd to prevent useless requests
    if (!tenantId) return;

    try {
      setIsLoading(true);
      const response = await apiClient.get<any>("/activity-feed/posts");
      const feedItems = response.data?.items || [];
      
      const mappedPosts: Post[] = feedItems.map((item: any) => {
        const isMe = currentUserId === item.authorId;
        return {
          id: item.id,
          content: item.content,
          createdAt: item.createdAt,
          author: {
            id: item.authorId,
            name: isMe ? (profile?.displayName || session?.user?.name || "Me") : "Community Member",
            image: isMe ? (profile?.avatarUrl || session?.user?.image) : undefined,
          },
          likesCount: item.likesCount || 0,
          commentsCount: item.commentsCount || 0,
          isLikedByMe: Array.isArray(item.likedBy) && currentUserId ? item.likedBy.includes(currentUserId) : false,
        };
      });

      setPosts(mappedPosts);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch activity feed:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
    // We only want to re-instantiate if userId or tenantId changes. 
    // Profile/Session details for display name/image don't need fetchFeed to re-trigger if they change independently.
  }, [currentUserId, tenantId, profile?.displayName, profile?.avatarUrl, session?.user?.name, session?.user?.image]);

  const createPost = async (content: string) => {
    try {
      const response = await apiClient.post<{ postId: string }>("/activity-feed/posts", { content });
      // Backend returns the ID, fetch the full feed to show the real newly created post
      await fetchFeed();
      return response.data;
    } catch (err) {
      console.error("Failed to create post", err);
      throw err;
    }
  };

  const toggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLikedByMe: !isCurrentlyLiked,
            likesCount: p.likesCount + (isCurrentlyLiked ? -1 : 1),
          };
        }
        return p;
      })
    );

    try {
      if (isCurrentlyLiked) {
        await apiClient.post(`/activity-feed/posts/${postId}/unlike`);
      } else {
        await apiClient.post(`/activity-feed/posts/${postId}/like`);
      }
    } catch (err) {
      // Revert optimism on failure
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isLikedByMe: isCurrentlyLiked,
              likesCount: p.likesCount + (!isCurrentlyLiked ? -1 : 1),
            };
          }
          return p;
        })
      );
    }
  };

  const deletePost = async (postId: string) => {
    // Optimistically remove from state
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await apiClient.delete(`/activity-feed/posts/${postId}`);
    } catch (err) {
      console.error("Failed to delete post", err);
      // Re-fetch to synchronize state since optimistic delete failed
      fetchFeed();
      throw err;
    }
  };

  const editPost = async (postId: string, newContent: string) => {
    try {
      await apiClient.patch(`/activity-feed/posts/${postId}`, { content: newContent });
      // Optimistically update
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent } : p));
    } catch (err) {
      console.error("Failed to edit post", err);
      throw err;
    }
  };

  // Only fetch when tenantId or currentUserId is settled.
  // We don't include fetchFeed in dependencies to avoid circular triggers,
  // instead we rely on these key stable IDs to drive the initial fetch.
  useEffect(() => {
    if (tenantId && currentUserId) {
      fetchFeed();
    }
  }, [tenantId, currentUserId]); // fetchFeed removed from here to prevent loops

  return {
    posts,
    isLoading,
    error,
    refetch: fetchFeed,
    createPost,
    toggleLike,
    deletePost,
    editPost,
  };
}
