"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { useCurrentCommunity } from "@/hooks/use-current-community";

import { useUserProfile } from "@/hooks/use-user-profile";

const NAV_LINKS = [
  { href: "/dashboard", label: "Community" },
  { href: "/dashboard/tasks", label: "Classroom" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
  { href: "/dashboard/members", label: "Members" },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { community } = useCurrentCommunity();
  const { profile } = useUserProfile();

  const displayName = profile?.displayName || session?.user?.name || "User";
  const avatarUrl = profile?.avatarUrl || session?.user?.image || "";

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b-4 border-border px-6 py-4">
      <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto">
        
        {/* Left: Logo & Community Switcher */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-main rounded-base border-2 border-border flex items-center justify-center font-heading font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              C
            </div>
            <span className="font-heading font-black text-2xl tracking-tight hidden lg:block">
              CommunityHub
            </span>
          </Link>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex flex-row gap-8 font-medium">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-black font-semibold tracking-tight transition-colors hover:bg-main hover:text-black hover:border-border hover:border-2 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 rounded-base ${
                      isActive
                        ? "bg-main border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "border-2 border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-48 xl:w-64 rounded-full bg-muted pl-9 text-sm focus-visible:ring-1"
            />
          </div>
          
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            {/* Notification Badge Mock */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border-2 border-background"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:outline-none">
              <Avatar className="h-10 w-10 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-main text-black font-bold">
                  {displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 font-base border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-base bg-white">
              <div className="flex items-center justify-start gap-2 p-3">
                <div className="flex flex-col space-y-1.5 leading-none text-black">
                  <p className="font-black text-lg">{displayName}</p>
                  
                  {profile?.bio && (
                    <p className="w-[210px] text-xs font-medium text-gray-600 line-clamp-2 leading-tight">
                      {profile.bio}
                    </p>
                  )}
                  
                  {session?.user?.email && (
                    <p className="w-[210px] truncate text-[11px] font-bold text-gray-400 mt-1">
                      {session.user.email}
                    </p>
                  )}
                  
                  <div className="mt-2 text-[10px] font-black uppercase bg-yellow-200 border-2 border-border px-2 py-0.5 w-max">
                    {session?.user?.id && community?.founderId === session?.user?.id 
                            ? 'Founder' 
                            : (session?.user?.roles?.[0]?.toLowerCase() === 'guest' ? 'Member' : session?.user?.roles?.[0]?.toLowerCase() || 'Member')}
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="font-bold focus:bg-main focus:text-black hover:bg-main cursor-pointer">
                <Link href="/settings" className="block w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="font-bold cursor-pointer text-red-600 focus:bg-red-100 hover:bg-red-100 focus:text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-muted-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
      </div>
    </header>
  );
}
