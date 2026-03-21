"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/hooks/use-user-profile";
import { apiClient } from "@/lib/api-client";

interface ProfileFormProps {
  initialData: UserProfile | null;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    displayName: initialData?.displayName || "",
    bio: initialData?.bio || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      // Patch update to IAM user me
      await apiClient.patch("/users/me", formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-base text-black">
      <div className="space-y-2">
        <label className="text-sm font-bold">Display Name</label>
        <Input 
          className="border-2 border-border rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="John Doe" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Bio / About Me</label>
        <textarea 
          className="flex min-h-[120px] w-full border-2 border-border rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="I'm a software engineer building cool stuff with NestJS and Next.js!"
        />
        <p className="text-xs font-bold text-gray-500">
          This will be displayed on your public profile within the community.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t-2 border-dashed border-gray-300">
        <Button type="submit" disabled={isSaving} className="w-32 bg-main text-black font-bold border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
          {isSaving ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            "Save Changes"
          )}
        </Button>
        {success && (
          <span className="text-sm text-green-600 font-bold bg-green-100 border-2 border-green-600 px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,128,0,1)]">
            Profile updated!
          </span>
        )}
      </div>
    </form>
  );
}
