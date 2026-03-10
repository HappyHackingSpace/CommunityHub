"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentCommunity } from "@/hooks/use-current-community";

export function RightSidebar() {
  const { community, members, isLoading } = useCurrentCommunity();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="space-y-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 text-center">No community selected.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMembersCount = members.filter((m) => m.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* About Community */}
      <Card className="bg-white shadow-sm border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">About {community.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {community.description || "A space for builders, creators, and doers to collaborate."}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">{community.membersCount || activeMembersCount || 1}</span>
              <span className="text-muted-foreground text-xs">Members</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg text-green-600">{Math.min(activeMembersCount || 1, 3)}</span>
              <span className="text-muted-foreground text-xs">Online</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admins / Online Members snippet */}
      <Card className="bg-white shadow-sm border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            Online Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 py-2">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No members online.</p>
            ) : (
              members.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarFallback className="bg-gray-100 text-xs text-gray-700">
                      {member.userId.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">User {member.userId.substring(0, 4)}</span>
                </div>
              ))
            )}
          </div>
          {members.length > 3 && (
            <>
              <Separator className="my-4" />
              <button className="text-sm text-primary font-medium hover:underline w-full text-center">
                View all members
              </button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trending Tags (Optional for Skool feel) */}
      <div className="px-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Topics & Tags
        </h4>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium">General</span>
          <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium">Dev</span>
        </div>
      </div>
    </div>
  );
}
