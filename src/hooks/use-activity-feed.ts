"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      // Backend expects /activity-feed/feed
      const response = await apiClient.get<Post[]>("/activity-feed/feed");
      setPosts(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch activity feed:", err);
      // We don't block the UI here, just log or set a minor error state
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = async (content: string) => {
    try {
      const response = await apiClient.post<Post>("/activity-feed/posts", { content });
      // Prepend the new post to the feed
      setPosts((prev) => [response.data, ...prev]);
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

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    posts,
    isLoading,
    error,
    refetch: fetchFeed,
    createPost,
    toggleLike,
  };
}
