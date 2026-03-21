"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, LinkIcon, Smile } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useUserProfile } from "@/hooks/use-user-profile";

interface CreatePostInputProps {
  onPost?: (content: string) => Promise<any>;
}

export function CreatePostInput({ onPost }: CreatePostInputProps) {
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaInputType, setMediaInputType] = useState<"none" | "image" | "link">("none");
  const [mediaUrl, setMediaUrl] = useState("");

  const displayName = profile?.displayName || session?.user?.name || "User";
  const avatarUrl = profile?.avatarUrl || session?.user?.image || "";

  const handleSubmit = async () => {
    if (!content.trim() || !onPost) return;
    
    setIsSubmitting(true);
    try {
      await onPost(content);
      setContent("");
      setMediaInputType("none");
      setMediaUrl("");
    } catch (err) {
      console.error("Failed to post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMedia = () => {
    if (!mediaUrl.trim()) return;
    if (mediaInputType === "image") {
      setContent((prev) => prev + `\n![Image](${mediaUrl})`);
    } else if (mediaInputType === "link") {
      setContent((prev) => prev + ` [Link](${mediaUrl}) `);
    }
    setMediaInputType("none");
    setMediaUrl("");
  };

  return (
    <Card className="p-4 mb-6 bg-white overflow-hidden border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:translate-y-1 focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
      <div className="flex gap-3 items-center mb-3">
        <Avatar className="h-10 w-10 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-main text-black font-black font-heading">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..." 
          className="flex-1 border-2 border-border bg-gray-50 text-base py-5 placeholder:text-muted-foreground/70 font-bold focus-visible:ring-0 shadow-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1 text-muted-foreground relative">
          <Button 
            variant="noShadow" 
            size="icon" 
            className={`h-8 w-8 hover:text-black border-none hover:bg-gray-100 ${mediaInputType === 'image' ? 'bg-main text-black' : ''}`}
            onClick={() => setMediaInputType(prev => prev === 'image' ? 'none' : 'image')}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="noShadow" 
            size="icon" 
            className={`h-8 w-8 hover:text-black border-none hover:bg-gray-100 ${mediaInputType === 'link' ? 'bg-main text-black' : ''}`}
            onClick={() => setMediaInputType(prev => prev === 'link' ? 'none' : 'link')}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="noShadow" 
            size="icon" 
            className="h-8 w-8 hover:text-black border-none hover:bg-gray-100"
            onClick={() => setContent(prev => prev + " 😀")}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          size="sm" 
          className="font-black px-6 rounded-none border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all bg-main text-black hover:bg-main"
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
      {mediaInputType !== "none" && (
        <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 border-2 border-border animate-in fade-in slide-in-from-top-2">
          <Input 
            autoFocus
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder={mediaInputType === "image" ? "Paste image URL here..." : "Paste link URL here..."}
            className="flex-1 h-8 bg-white border-2 border-border text-sm font-bold shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddMedia();
              }
            }}
          />
          <Button 
            size="sm" 
            variant="noShadow"
            className="h-8 px-3 border-2 border-border bg-main text-black font-bold hover:bg-main hover:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            onClick={handleAddMedia}
          >
            Add
          </Button>
          <Button 
            size="sm" 
            variant="neutral"
            className="h-8 px-3 font-bold hover:bg-gray-200 shadow-none border-2 border-transparent hover:border-border"
            onClick={() => {
              setMediaInputType("none");
              setMediaUrl("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
}
