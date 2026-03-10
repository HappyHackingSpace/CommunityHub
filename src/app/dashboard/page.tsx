"use client";

import { CreatePostInput } from "@/components/dashboard/create-post-input";
import { PostCard } from "@/components/dashboard/post-card";
import { RightSidebar } from "@/components/dashboard/right-sidebar";

import { useActivityFeed } from "@/hooks/use-activity-feed";
import { useCommunities } from "@/hooks/use-communities";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { communities, isLoading: communitiesLoading } = useCommunities();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  
  const { posts, isLoading, error } = useActivityFeed();

  useEffect(() => {
    if (!communitiesLoading && communities.length > 0 && !tenantId) {
      const myCommunity = communities.find(
        (c) => c.founderId === session?.user?.id || c.isMember
      );
      
      if (myCommunity) {
        router.replace(`/dashboard?tenantId=${myCommunity.tenantId || myCommunity.id}`);
      }
    }
  }, [communities, communitiesLoading, tenantId, router, session]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      
      {/* Main Feed Column */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
        <CreatePostInput />
        
        {/* Posts List */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
              <span className="loading loading-spinner loading-sm"></span> Loading feed...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load activity feed.
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts yet. Be the first to write something!
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {/* End of feed message */}
              <div className="text-center text-muted-foreground text-sm py-8">
                You've caught up with all the latest activity!
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar Column */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="sticky top-[88px]">
          <RightSidebar />
        </div>
      </div>
      
    </div>
  );
}
