"use client";

import { Community } from "@/hooks/use-communities";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe } from "lucide-react";

interface CommunityCardProps {
  community: Community;
  onApply: (id: string) => void;
}

export function CommunityCard({ community, onApply }: CommunityCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div 
        className="h-24 w-full bg-slate-200 relative"
        style={{
          backgroundImage: community.logoUrl ? `url(${community.logoUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          {community.visibility === "PUBLIC" ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {community.visibility}
        </div>
      </div>
      
      <CardContent className="flex-1 pt-0 relative px-4 pb-4">
        <div className="flex justify-between items-end -mt-8 mb-3">
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm bg-white">
            <AvatarImage src={community.logoUrl} alt={community.name} />
            <AvatarFallback className="text-xl font-bold text-primary bg-primary/10">
              {community.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <h3 className="font-bold text-lg mb-1 leading-tight">{community.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {community.description || "No description provided."}
        </p>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-auto">
          <Users className="h-4 w-4" />
          <span className="font-semibold text-slate-700">{community.membersCount}</span> Members
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant={community.isMember ? "neutral" : "default"}
          className="w-full font-semibold" 
          onClick={() => !community.isMember && onApply(community.id)}
          disabled={community.isMember}
        >
          {community.isMember ? "Already a Member" : "Apply to Join"}
        </Button>
      </CardFooter>
    </Card>
  );
}
