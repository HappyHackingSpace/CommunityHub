"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onLike?: () => void;
  onDelete?: () => void;
  onEdit?: (newContent: string) => Promise<void>;
}

export function PostCard({ post, onLike, onDelete, onEdit }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  return (
    <Card className={`relative p-4 mb-4 bg-white border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden ${isDeleting ? 'border-red-500' : 'hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}>
      
      {isDeleting && (
        <div className="absolute inset-0 bg-red-50 z-10 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
          <p className="font-heading font-black text-xl text-red-600 mb-2">Delete Post?</p>
          <p className="font-bold text-gray-700 mb-6 text-center text-sm max-w-sm">
            Are you sure you want to permanently delete this post? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <Button 
              variant="neutral" 
              onClick={() => setIsDeleting(false)} 
              className="bg-white border-2 border-border font-bold hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              variant="noShadow" 
              onClick={() => onDelete?.()} 
              className="bg-red-500 border-2 border-border text-white font-bold hover:bg-red-600 hover:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AvatarImage src={post.author.image || ""} alt={post.author.name} />
            <AvatarFallback className="bg-main text-black font-black font-heading">
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading font-black text-sm">{post.author.name}</p>
            <p className="text-xs font-bold text-gray-500">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Just now"}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="noShadow" size="icon" className="h-8 w-8 text-black border-2 border-transparent hover:border-black hover:bg-gray-100 focus-visible:ring-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-base bg-white w-40">
            <DropdownMenuItem 
              className="font-bold cursor-pointer focus:bg-main focus:text-black hover:bg-main"
              onClick={() => {
                setEditContent(post.content);
                setIsEditing(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="font-bold cursor-pointer text-red-600 focus:bg-red-100 hover:bg-red-100 focus:text-red-600"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isEditing ? (
        <div className="mb-4 animate-in fade-in">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[100px] p-3 text-sm font-medium border-2 border-border bg-gray-50 rounded-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main mb-2 font-bold"
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="neutral"
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="border-2 border-border font-bold shadow-none hover:bg-gray-100"
              disabled={isSubmittingEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="noShadow"
              onClick={async () => {
                if (!onEdit || editContent.trim() === post.content) {
                  setIsEditing(false);
                  return;
                }
                setIsSubmittingEdit(true);
                try {
                  await onEdit(editContent);
                  setIsEditing(false);
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsSubmittingEdit(false);
                }
              }}
              className="bg-main border-2 border-border text-black font-bold hover:bg-main hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              disabled={isSubmittingEdit || !editContent.trim()}
            >
              {isSubmittingEdit ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4 text-sm font-medium text-black whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>
      )}

      <div className="flex items-center gap-4 text-black border-t-2 border-border pt-4">
        <Button
          variant="noShadow"
          size="sm"
          onClick={onLike}
          className={`gap-1.5 px-3 py-1 border-2 border-border font-bold hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ${
            post.isLikedByMe ? "bg-red-500 text-white border-red-600" : "bg-white text-black"
          }`}
        >
          <Heart className={`h-4 w-4 ${post.isLikedByMe ? "fill-white" : ""}`} />
          <span>{post.likesCount}</span>
        </Button>
      </div>
      
      {/* 
        Comments UI commented out for MVP per user request 
        <Button 
          variant="noShadow" ...
      */}
    </Card>
  );
}
