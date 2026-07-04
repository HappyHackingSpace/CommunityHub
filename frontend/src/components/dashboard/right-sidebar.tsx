"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentCommunity } from "@/hooks/use-current-community";
import { useSession } from "next-auth/react";

export function RightSidebar() {
  const { community, members, stats, isLoading } = useCurrentCommunity();
  const { data: session } = useSession();

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

  const activeMembersCount = stats?.membersCount ?? members.filter((m) => m.status === "ACTIVE").length ?? 1;

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
          <div className="grid grid-cols-3 gap-2 text-sm border-t border-gray-50 pt-4">
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">{activeMembersCount}</span>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Members</span>
            </div>
            <div className="flex flex-col items-center border-x border-gray-100">
              <span className="font-bold text-lg text-chart-2">{stats?.activeTasksCount ?? 0}</span>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Tasks</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg text-chart-5">{stats?.upcomingMeetingsCount ?? 0}</span>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Meetups</span>
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
              members.slice(0, 3).map((member) => {
                const isMe = session?.user?.id === member.userId;
                const displayName = isMe ? (session.user.name || "Me") : `User ${member.userId.substring(0, 4)}`;
                const avatarImg = isMe ? session.user.image : undefined;
                const initials = isMe 
                  ? (session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U") 
                  : member.userId.substring(0, 2).toUpperCase();

                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-full">
                      {avatarImg && <AvatarImage src={avatarImg} />}
                      <AvatarFallback className="bg-gray-100 text-xs text-gray-700 mb-0">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                      {displayName} {isMe && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                    </span>
                  </div>
                );
              })
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
