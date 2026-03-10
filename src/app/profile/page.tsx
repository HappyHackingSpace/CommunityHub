"use client";

import { useUserProfile } from "@/hooks/use-user-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TopNav } from "@/components/dashboard/top-nav";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Trophy } from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";

export default function ProfilePage() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopNav />
        <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </main>
      </div>
    );
  }

  // Fallback data if profile fails rendering but session exists
  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : "Authenticated User";
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav />
      {/* 
        The main container is centered, with max-width imitating a clean feed aesthetic.
        Padding is provided for breathing room.
      */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Card & Gamification */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="bg-white overflow-hidden">
              <div className="h-32 bg-primary/20 relative">
                <Button variant="noShadow" size="sm" className="absolute top-4 right-4 bg-white/50 hover:bg-white border-none">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Banner
                </Button>
              </div>
              <CardContent className="pt-0 relative px-6 pb-6 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-4 -mt-12 mb-4">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-sm bg-white">
                    <AvatarImage src={profile?.avatar || ""} alt={displayName} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-2">
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    <p className="text-muted-foreground text-sm">{profile?.email || "user@example.com"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    <Shield className="h-3 w-3" />
                    Member
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    <Trophy className="h-3 w-3" />
                    Level 2
                  </span>
                </div>

                <Separator className="my-4" />
                
                <div className="text-sm text-gray-600 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p>{profile?.bio || "No bio provided yet. Update your profile to tell the community about yourself!"}</p>
                  
                  <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
                    <span>Joined</span>
                    <span>March 2026</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges / Gamification (Placeholder) */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>My Badges</span>
                  <span className="text-xs font-normal text-muted-foreground">3 Earned</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {/* Mock Badges */}
                  <div className="h-12 w-12 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center" title="Early Adopter">🌱</div>
                  <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 bg-blue-500/5 flex items-center justify-center" title="1st Post">📝</div>
                  <div className="h-12 w-12 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400" title="Locked">🔒</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Edit Profile & Activity */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm initialData={profile} />
              </CardContent>
            </Card>
          </div>

        </div>

      </main>
    </div>
  );
}
