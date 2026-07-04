"use client";

import Link from "next/link";
import { NavLink } from "@/components/ui/nav-link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

export function GlobalHeader() {
  const { data: session, status } = useSession();

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isDiscover = pathname === "/discover";

  return (
    <header className="w-full bg-background border-b-4 border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-main rounded-base border-2 border-border flex items-center justify-center font-heading font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            C
          </div>
          <span className="font-heading font-black text-2xl tracking-tight hidden sm:block">
            CommunityHub
          </span>
        </Link>
      </div>

      <nav className="hidden md:block">
        <ul className="flex flex-row gap-8 font-medium">
          {/* Only show nav menu if NOT authenticated */}
          {!session && (
            <>
              <li>
                <NavLink href={isHome ? "#features" : "/#features"}>Features</NavLink>
              </li>
              <li>
                <NavLink href="/discover">Discover</NavLink>
              </li>
              <li>
                <NavLink href={isHome ? "#pricing" : "/#pricing"}>Pricing</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse border-2 border-border"></div>
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:outline-none">
              <Avatar className="h-10 w-10 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                <AvatarFallback className="bg-main text-black font-bold">
                  {session.user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-base border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-base bg-white">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none text-black">
                  {session.user?.name && <p className="font-bold">{session.user.name}</p>}
                  {session.user?.email && (
                    <p className="w-[200px] truncate text-sm font-medium">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="font-bold focus:bg-main focus:text-black hover:bg-main cursor-pointer">
                <Link href="/profile" className="block w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="font-bold cursor-pointer text-red-600 focus:bg-red-100 hover:bg-red-100 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/" })}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            className="font-bold text-sm h-10 px-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-border hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            onClick={() => {
              sessionStorage.setItem("authRedirect", pathname);
              window.location.href = process.env.NEXT_PUBLIC_BACKEND_URL 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google` 
                : "http://localhost:3000/auth/google";
            }}
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
