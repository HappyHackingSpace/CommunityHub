"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    likesCount: number;
    commentsCount: number;
    isLikedByMe?: boolean;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="p-4 mb-4 bg-white hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.image} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="noShadow" size="icon" className="h-8 w-8 text-muted-foreground border-none">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 text-sm text-gray-800 whitespace-pre-wrap">
        {post.content}
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <Button
          variant="noShadow"
          size="sm"
          className={`gap-1.5 px-2 hover:text-red-500 hover:bg-red-50 border-none ${
            post.isLikedByMe ? "text-red-500 font-medium" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${post.isLikedByMe ? "fill-current" : ""}`} />
          <span>{post.likesCount}</span>
        </Button>
        <Button variant="noShadow" size="sm" className="gap-1.5 px-2 hover:text-blue-500 hover:bg-blue-50 border-none">
          <MessageSquare className="h-4 w-4" />
          <span>{post.commentsCount}</span>
        </Button>
      </div>
    </Card>
  );
}
