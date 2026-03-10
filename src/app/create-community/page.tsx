"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlobalHeader } from "@/components/global-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

export default function CreateCommunityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "PUBLIC",
    websiteUrl: "",
    logoUrl: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = process.env.NEXT_PUBLIC_BACKEND_URL 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google` 
        : "http://localhost:3000/auth/google";
    }
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/communities", formData);
      // Wait for backend response, usually returns { id: communityId, ... }
      // Then re-route user to discover page or dashboard
      router.push("/discover");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex flex-col font-base selection:bg-main selection:text-main-foreground items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-main" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-base selection:bg-main selection:text-main-foreground">
      <GlobalHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto p-6 lg:p-10 mb-20">
        
        <div className="mb-10 text-center mt-6">
          <h1 className="text-4xl md:text-5xl font-black font-heading text-black mb-4">
            Create a Community
          </h1>
          <p className="text-lg md:text-xl text-black/80 font-medium">
            Set up the perfect space for your people.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-base border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
          
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-base font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-bold text-lg">Community Name <span className="text-red-500">*</span></label>
            <Input 
              id="name"
              name="name"
              required 
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Neo Builders Club" 
              className="h-14 rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg bg-white font-medium focus-visible:ring-0 focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-y-0.5 transition-all w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="font-bold text-lg">Description <span className="text-red-500">*</span></label>
            <textarea 
              id="description"
              name="description"
              required 
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this community about?" 
              className="resize-none p-4 rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg bg-white font-medium focus-visible:outline-none focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-y-0.5 transition-all w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="visibility" className="font-bold text-lg">Visibility</label>
              <select 
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="h-14 px-4 rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg bg-white font-medium focus-visible:outline-none focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-y-0.5 transition-all w-full appearance-none"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="websiteUrl" className="font-bold text-lg">Website URL (Optional)</label>
              <Input 
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://yourwebsite.com" 
                className="h-14 rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg bg-white font-medium focus-visible:ring-0 focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-y-0.5 transition-all w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="logoUrl" className="font-bold text-lg">Logo URL (Optional)</label>
            <Input 
              id="logoUrl"
              name="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://example.com/logo.png" 
              className="h-14 rounded-base border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg bg-white font-medium focus-visible:ring-0 focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-y-0.5 transition-all w-full"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            size="lg" 
            className="mt-4 h-14 border-4 border-border bg-chart-4 hover:bg-chart-4/90 text-black font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:shadow-none disabled:translate-y-1 disabled:opacity-70 transition-all w-full"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Creating...
              </span>
            ) : "Create Community"}
          </Button>

        </form>

      </main>
    </div>
  );
}
