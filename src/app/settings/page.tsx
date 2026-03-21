"use client";

import { useState } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { ProfileForm } from "@/components/profile/profile-form";
import { useUserProfile } from "@/hooks/use-user-profile";
import { User, Shield } from "lucide-react";

export default function SettingsPage() {
  const { profile, isLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
  ];

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

  return (
    <div className="min-h-screen bg-background flex flex-col font-base">
      <TopNav />

      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight text-white mb-2" style={{ WebkitTextStroke: '1px black' }}>
            Settings
          </h1>
          <p className="text-black font-bold text-sm bg-white inline-block px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Manage your personal preferences and integrations
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 font-bold border-2 transition-all ${
                    isActive 
                      ? "bg-main border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1" 
                      : "bg-white border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-gray-700 hover:text-black"
                  } rounded-base text-left`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 w-full">
            <div className="bg-white border-4 border-border rounded-base p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              
              {activeTab === "profile" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b-4 border-border pb-4 mb-8">
                    <h2 className="text-2xl font-black font-heading text-black">Public Profile</h2>
                    <p className="font-bold text-gray-500 text-sm mt-1">This information will be displayed to other community members.</p>
                  </div>
                  <ProfileForm initialData={profile} />
                </div>
              )}

              {activeTab === "account" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b-4 border-border pb-4 mb-8">
                    <h2 className="text-2xl font-black font-heading text-black">Account Security</h2>
                    <p className="font-bold text-gray-500 text-sm mt-1">Manage your account credentials and security settings.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-2 border-border bg-gray-50 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div>
                        <h4 className="font-bold text-black">Connected Provider</h4>
                        <p className="text-sm font-medium text-gray-600 mt-1">You are logging in via Google</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 border-2 border-blue-800 font-bold px-3 py-1 text-xs">
                        Google
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-2 border-border bg-gray-50 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-60">
                      <div>
                        <h4 className="font-bold text-black">Email Address</h4>
                        <p className="text-sm font-medium text-gray-600 mt-1">{profile?.email || 'Hidden'}</p>
                      </div>
                      <button className="bg-gray-200 text-gray-500 font-bold border-2 border-gray-300 px-4 py-2 cursor-not-allowed">
                        Change
                      </button>
                    </div>

                    <div className="pt-4 border-t-2 border-dashed border-gray-300">
                      <button className="bg-red-100 text-red-600 font-bold border-2 border-red-600 hover:bg-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] transition-all px-4 py-2">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
