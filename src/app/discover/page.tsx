"use client";

import { useCommunities } from "@/hooks/use-communities";
import { TopNav } from "@/components/dashboard/top-nav";
import { GlobalHeader } from "@/components/global-header";
import { CommunityCard } from "@/components/communities/community-card";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function DiscoverPage() {
  const { communities, isLoading, error, applyToJoin } = useCommunities();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const filteredCommunities = communities?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleApply = (id: string) => {
    if (!session) {
      sessionStorage.setItem("authRedirect", "/discover");
      window.location.href = process.env.NEXT_PUBLIC_BACKEND_URL
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
        : "http://localhost:3000/auth/google";
      return;
    }
    applyToJoin(id);
  };

  const handleCreate = () => {
    if (!session) {
      sessionStorage.setItem("authRedirect", "/create-community");
      window.location.href = process.env.NEXT_PUBLIC_BACKEND_URL
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
        : "http://localhost:3000/auth/google";
      return;
    }
    window.location.href = "/create-community";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-base selection:bg-main selection:text-main-foreground">
      <div className="sticky top-0 z-50 w-full">
        <GlobalHeader />
      </div>
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">

        <div className="mb-10 max-w-3xl mx-auto text-center mt-6">
          <h1 className="text-4xl md:text-5xl font-black font-heading text-black mb-4">
            Discover Communities
          </h1>
          <p className="text-lg md:text-xl text-black/80 font-medium mb-8">
            Find and join clubs, learning groups, and mastermind networks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search keywords, topics..."
                className="pl-12 h-14 rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg bg-white font-medium focus-visible:ring-0 focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-y-0.5 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              size="lg"
              className="h-14 px-6 border-4 border-border bg-chart-4 hover:bg-chart-4/90 text-black font-black whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
              onClick={handleCreate}
            >
              <Plus className="h-6 w-6 stroke-[3]" />
              Create
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <span className="loading loading-spinner loading-lg text-main"></span>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-lg mx-auto">
            <p className="font-bold text-xl text-red-600 mb-2">Failed to load directories.</p>
            <p className="font-medium text-black/70">Please ensure the backend is running.</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-black mb-2">No communities found</h3>
            <p className="text-black/70 font-medium">
              {searchQuery ? "Try adjusting your search terms." : "The directory is currently empty."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onApply={handleApply}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
