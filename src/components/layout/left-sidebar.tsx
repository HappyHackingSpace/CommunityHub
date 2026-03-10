"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCommunities } from "@/hooks/use-communities";
import { Compass, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const Tooltip = ({ label }: { label: string }) => (
  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-white text-black font-bold text-sm rounded-base opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-50 pointer-events-none origin-left scale-95 group-hover:scale-100">
    {label}
  </div>
);

export function LeftSidebar() {
  const { data: session } = useSession();
  const { communities } = useCommunities();
  const pathname = usePathname();

  // Determine if we should show the sidebar on this page.
  // Hide on landing page (/)
  const isHidden = pathname === "/" || pathname?.startsWith("/login");

  const myCommunities = communities.filter(
    (c) => c.founderId === session?.user?.id || c.isMember
  );

  useEffect(() => {
    // Add padding to body if sidebar is visible so content doesn't get covered.
    if (session && !isHidden) {
      document.body.style.paddingLeft = "80px"; // 80px is w-20
    } else {
      document.body.style.paddingLeft = "0px";
    }

    return () => {
      document.body.style.paddingLeft = "0px";
    };
  }, [session, isHidden]);

  if (!session || isHidden) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-20 bg-black border-r-4 border-border flex flex-col items-center py-4 gap-4 z-[60] overflow-y-auto custom-scrollbar">
      
      {/* Home / Discover Icon */}
      <Link href="/discover" className="relative group">
        <div className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-white transition-all duration-300 flex items-center justify-center border-2 border-transparent group-hover:border-white shadow-sm overflow-hidden">
          <div className="w-full h-full bg-main flex items-center justify-center">
            <Compass className="w-7 h-7 text-black fill-transparent stroke-[2.5]" />
          </div>
        </div>
        <Tooltip label="Discover Communities" />
      </Link>

      {/* Create Community Icon */}
      <Link href="/create-community" className="relative group mt-2">
        <div className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] bg-zinc-800 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 flex items-center justify-center border-2 border-transparent">
          <Plus className="w-6 h-6 stroke-[3]" />
        </div>
        <Tooltip label="Create Community" />
      </Link>

      <div className="w-8 h-[2px] bg-white/20 rounded-full my-1" />

      {/* Community Icons */}
      {myCommunities.map((community) => (
        <Link 
          key={community.id} 
          href={`/dashboard?tenantId=${community.tenantId || community.id}`} 
          className="relative group"
        >
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-0 group-hover:h-5 bg-white rounded-r-full transition-all duration-300" />
          <Avatar className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-300 border-2 border-transparent group-hover:border-white object-cover bg-white">
            <AvatarImage src={community.logoUrl} alt={community.name} className="object-cover" />
            <AvatarFallback className="font-bold text-lg text-black bg-white">
              {community.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Tooltip label={community.name} />
        </Link>
      ))}

    </aside>
  );
}
