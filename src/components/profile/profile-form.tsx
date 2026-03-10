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
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input 
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John" 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input 
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Bio / About Me</label>
        <textarea 
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="I'm a software engineer building cool stuff with NestJS and Next.js!"
        />
        <p className="text-xs text-muted-foreground">
          This will be displayed on your public profile within the community.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSaving} className="w-32">
          {isSaving ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            "Save Changes"
          )}
        </Button>
        {success && (
          <span className="text-sm text-green-600 font-medium pb-1">Profile updated successfully!</span>
        )}
      </div>
    </form>
  );
}
