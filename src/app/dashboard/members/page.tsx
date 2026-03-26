"use client";

import { useCurrentCommunity, CommunityMember } from "@/hooks/use-current-community";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, UserPlus, Search, X, Check, 
  UserMinus, MoreVertical, Calendar, 
  Activity, ShieldCheck, Mail 
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { AlertTriangle, X as CloseX } from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { formatUserHandle } from "@/lib/formatters";

export default function MembersPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const { 
    community, 
    members, 
    stats, 
    isLoading,
    error,
    fetchPendingMembers, 
    approveMember, 
    rejectMember 
  } = useCurrentCommunity();

  const [errorVisible, setErrorVisible] = useState(true);

  const isFounder = community?.founderId === currentUserId;

  const [searchTerm, setSearchTerm] = useState("");
  const [pendingMembers, setPendingMembers] = useState<CommunityMember[]>([]);
  const [isRefreshingPending, setIsRefreshingPending] = useState(false);

  const loadPending = useCallback(async () => {
    if (isFounder) {
      setIsRefreshingPending(true);
      const res = await fetchPendingMembers();
      if (res) setPendingMembers(res);
      setIsRefreshingPending(false);
    }
  }, [fetchPendingMembers, isFounder]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatUserHandle(m.userId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const filteredPending = useMemo(() => {
    return pendingMembers.filter(m => 
      m.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatUserHandle(m.userId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pendingMembers, searchTerm]);

  const handleApprove = useCallback(async (memberId: string) => {
    await approveMember(memberId);
    await loadPending();
  }, [approveMember, loadPending]);

  const handleReject = useCallback(async (memberId: string) => {
    await rejectMember(memberId);
    await loadPending();
  }, [rejectMember, loadPending]);



  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-24 font-base">
      
      {error && errorVisible && (
        <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-red-400 p-6 rounded-base relative overflow-hidden mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-black uppercase text-xl leading-none mb-1 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Network Disturbance</h3>
              <p className="font-bold uppercase text-xs tracking-widest text-black/80">{error.message || "Failed to sync community data"}</p>
            </div>
            <button onClick={() => setErrorVisible(false)} className="bg-white border-2 border-black p-2 rounded-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                <CloseX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
        <div className="flex-1">
          <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-white mb-2" style={{ WebkitTextStroke: '2px black' }}>
            MEMBERS
          </h1>
          <p className="font-bold text-gray-400 uppercase tracking-widest text-sm flex items-center gap-2">
            <Users className="h-5 w-5 text-main stroke-black stroke-2" /> 
            {community?.name || "Community"} Network
          </p>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-white border-2 border-black px-4 py-2 rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-w-[120px]">
            {isLoading && members.length === 0 ? (
              <Skeleton className="h-8 w-12 border-2 border-black mb-1" />
            ) : (
              <span className="font-black text-2xl tracking-tighter leading-none">{stats?.membersCount || members.length}</span>
            )}
            <span className="font-bold text-[10px] uppercase text-gray-500 tracking-wider">Total Pulse</span>
          </div>
          <div className="bg-main border-2 border-black px-4 py-2 rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center min-w-[120px]">
            {isLoading && members.length === 0 ? (
              <Skeleton className="h-8 w-12 border-2 border-black border-dashed bg-black/5 mb-1" />
            ) : (
              <span className="font-black text-2xl tracking-tighter leading-none">{members.filter(m => m.status === 'ACTIVE').length}</span>
            )}
            <span className="font-bold text-[10px] uppercase text-black/60 tracking-wider">Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        
        {/* Search Bar */}
        <div className="relative group w-full max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
          <input 
            className="w-full pl-12 pr-12 py-4 bg-white border-4 border-black rounded-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-bold placeholder:text-gray-400 focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none"
            placeholder="Search by ID, handle or explorer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <TabsList className="bg-transparent h-auto p-0 flex gap-4 flex-wrap border-none">
              <TabsTrigger 
                value="all"
                className="bg-white border-4 border-black px-6 py-2.5 font-black uppercase text-xs rounded-base data-[state=active]:bg-main shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:translate-x-0.5 data-[state=active]:translate-y-0.5 data-[state=active]:shadow-none transition-all"
              >
                All Members
              </TabsTrigger>
              {isFounder && (
                <TabsTrigger 
                  value="pending"
                  className="bg-white border-4 border-black px-6 py-2.5 font-black uppercase text-xs rounded-base data-[state=active]:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:translate-x-0.5 data-[state=active]:translate-y-0.5 data-[state=active]:shadow-none transition-all relative"
                >
                  Pending {pendingMembers.length > 0 && (
                    <span className="absolute -top-3 -right-3 bg-red-600 border-2 border-black text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                      {pendingMembers.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 px-3 py-1.5 bg-gray-50 border-2 border-black border-dashed rounded-base">
               <Activity className="h-3 w-3 animate-pulse" /> Live Network Feed
            </div>
          </div>

          {/* Members List */}
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading && members.length === 0 ? (
                [...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 border-4 border-black rounded-base" />)
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <MemberCard key={member.id} member={member} isFounderView={false} isMe={member.userId === currentUserId} isCreator={community?.founderId === member.userId} />
                ))
              ) : (
                <EmptyState icon={<Users className="h-12 w-12" />} title="No Members Found" description="Try broadening your search or check again later." />
              )}
            </div>
          </TabsContent>

          {/* Pending Submissions */}
          {isFounder && (
            <TabsContent value="pending" className="mt-0">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isRefreshingPending || (isLoading && members.length === 0) ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 border-4 border-black rounded-base" />)
                ) : filteredPending.length > 0 ? (
                  filteredPending.map(member => (
                    <MemberCard 
                      key={member.id} 
                      member={member} 
                      isFounderView={true} 
                      onApprove={handleApprove} 
                      onReject={handleReject} 
                    />
                  ))
                ) : (
                  <EmptyState icon={<UserPlus className="h-12 w-12" />} title="Queue Clear" description="No new membership applications at this time." />
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

const MemberCard = memo(function MemberCard({ 
  member, 
  isFounderView, 
  onApprove, 
  onReject, 
  isMe, 
  isCreator 
}: { 
  member: CommunityMember; 
  isFounderView?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isMe?: boolean;
  isCreator?: boolean;
}) {
  return (
    <div className={`bg-white border-4 border-black rounded-base p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all ${isMe ? 'ring-4 ring-inset ring-main/20' : ''}`}>
      
      {/* Role Badge */}
      <div className="absolute top-4 right-4 flex gap-2">
         {isCreator && (
           <div className="bg-yellow-400 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full" title="Founder">
             <ShieldCheck className="h-4 w-4" />
           </div>
         )}
         {isMe && (
           <div className="bg-black text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border border-black self-center">
             YOU
           </div>
         )}
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <Avatar className="h-20 w-20 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} />
            <AvatarFallback className="bg-main font-black">U</AvatarFallback>
          </Avatar>
        </div>
        <h4 className="font-black text-lg uppercase truncate max-w-full italic px-2">{formatUserHandle(member.userId)}</h4>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          {member.status === 'ACTIVE' ? 'Verified Member' : 'Pending Request'}
        </p>
      </div>

      <div className="space-y-4 mt-auto">
        <div className="flex items-center gap-3 bg-gray-50 border-2 border-black p-3 rounded-base">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Joined Sequence</span>
            <span className="text-xs font-black">{format(new Date(member.appliedAt), "MMM dd, yyyy")}</span>
          </div>
        </div>

        {isFounderView ? (
          <div className="grid grid-cols-2 gap-3">
            <Button size="sm" onClick={() => onApprove?.(member.id)} className="bg-emerald-400 font-black uppercase text-[10px] h-10 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Check className="h-3 w-3 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="reverse" onClick={() => onReject?.(member.id)} className="bg-red-400 text-white font-black uppercase text-[10px] h-10 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <UserMinus className="h-3 w-3 mr-1 font-black" /> Reject
            </Button>
          </div>
        ) : (
          <Button variant="neutral" size="sm" className="w-full font-black uppercase text-[10px] h-10 group-hover:bg-main transition-colors border-2 border-black">
             <Mail className="h-3.5 w-3.5 mr-2" /> Message Explorer
          </Button>
        )}
      </div>
    </div>
  );
});

const EmptyState = memo(function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string, description: string }) {
  return (
    <div className="col-span-full py-20 bg-white border-4 border-black border-dashed rounded-base flex flex-col items-center justify-center text-center px-10">
      <div className="bg-main/20 border-2 border-black p-6 rounded-full mb-6">
        {icon}
      </div>
      <h3 className="text-3xl font-black uppercase italic italic">{title}</h3>
      <p className="font-bold text-gray-400 text-sm mt-2 max-w-sm uppercase leading-relaxed tracking-wider">
        {description}
      </p>
    </div>
  );
});
