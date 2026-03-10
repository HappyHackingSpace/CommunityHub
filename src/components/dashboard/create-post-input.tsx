"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, LinkIcon, Smile } from "lucide-react";
import { useSession } from "next-auth/react";

export function CreatePostInput() {
  const { data: session } = useSession();

  return (
    <Card className="p-4 mb-6 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <div className="flex gap-3 items-center mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <Input 
          placeholder="Write something..." 
          className="flex-1 border-none bg-gray-50 text-base py-5 placeholder:text-muted-foreground/70"
        />
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="noShadow" size="icon" className="h-8 w-8 hover:text-primary border-none">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="noShadow" size="icon" className="h-8 w-8 hover:text-primary border-none">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant="noShadow" size="icon" className="h-8 w-8 hover:text-primary border-none">
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" className="font-semibold px-6 rounded-full">
          Post
        </Button>
      </div>
    </Card>
  );
}
