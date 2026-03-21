"use client";

import { useUserProfile } from "@/hooks/use-user-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopNav } from "@/components/dashboard/top-nav";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Trophy, MapPin, CalendarDays, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav />
        <main className="flex-1 w-full flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-main"></span>
        </main>
      </div>
    );
  }

  // Use the actual data from the backend `UserResponseDto` or fallback to session
  const displayName = profile?.displayName || "Authenticated User";
  const avatarImage = profile?.avatarUrl;
  const username = displayName.split(" ")[0].toLowerCase() || "user";
  
  return (
    <div className="min-h-screen bg-background flex flex-col font-base">
      <TopNav />
      {/* 
        The main container is centered, applying neo-brutalism aesthetics
      */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto p-4 md:p-8">
        
        {/* Header Cover & Profile Badge */}
        <div className="mb-12">
          <div className="w-full h-48 md:h-64 bg-main border-4 border-border rounded-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute inset-0 pattern-dots opacity-20"></div>
          </div>
          
          <div className="px-6 md:px-12 mt-[-4rem] md:mt-[-5rem] relative z-10 flex flex-col items-start w-full">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-border rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              <AvatarImage src={avatarImage || ""} alt={displayName} />
              <AvatarFallback className="text-5xl md:text-7xl bg-white text-black font-black font-heading">
                {displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-black">
                {displayName}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 lg:gap-12 mt-16 md:mt-12">
          
          {/* Left Column: Info & Details */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white border-4 border-border rounded-base p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
              <h2 className="text-xl font-heading font-black border-b-4 border-border pb-2">About Me</h2>
              <p className="font-medium text-gray-800 leading-relaxed">
                {profile?.bio || "No biography provided yet. This is your global profile visibility across all communities."}
              </p>
              
              <div className="flex flex-col gap-3 mt-4 text-sm font-bold">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span>{profile?.email || "Email Hidden"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                  <span>Joined {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : "2026"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Right Column: Communities */}
            <div className="bg-white border-4 border-border rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="bg-indigo-300 border-b-4 border-border p-4 flex justify-between items-center">
                <h2 className="text-xl font-heading font-black text-black">Communities</h2>
                <Link href="/dashboard" className="text-sm font-bold bg-white border-2 border-border px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1">
                  Go to Dashboard <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-6">
                <div className="text-center py-6">
                  <h4 className="font-bold text-black border-b border-transparent inline-block mb-1">
                    No communities yet
                  </h4>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    You haven't joined any communities.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
