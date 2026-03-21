"use client";

import { useTasks } from "@/hooks/use-tasks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, Medal, Target, User, Crown, 
  ChevronRight, Award, Zap, Star 
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, X as CloseX } from "lucide-react";

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <div className="bg-yellow-400 p-2 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Crown className="h-4 w-4 text-black" /></div>;
  if (rank === 2) return <div className="bg-slate-300 p-2 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Medal className="h-4 w-4 text-black" /></div>;
  if (rank === 3) return <div className="bg-amber-600 p-2 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Medal className="h-4 w-4 text-white" /></div>;
  return <span className="font-black italic text-xl w-8 text-center">{rank}</span>;
};

const BadgeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, any> = {
    TASK_COMPLETED: <Zap className="h-6 w-6 text-yellow-500" />,
    FIRST_TASK: <Star className="h-6 w-6 text-blue-500" />,
    TASKS_STREAK: <Award className="h-6 w-6 text-orange-500" />,
    MENTOR: <User className="h-6 w-6 text-purple-500" />,
    HELPER: <Target className="h-6 w-6 text-red-500" />,
    COMMUNITY_CONTRIBUTOR: <Trophy className="h-6 w-6 text-emerald-500" />,
  };
  return icons[type] || <Award className="h-6 w-6 text-gray-500" />;
};

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const { 
    leaderboard, 
    badges, 
    isLoading, 
    error: gamificationError,
    fetchGamification 
  } = useTasks();

  const [errorVisible, setErrorVisible] = useState(true);

  useEffect(() => {
    // Fetch a larger leaderboard for the dedicated page (up to 50 players)
    fetchGamification(50);
  }, [fetchGamification]);

  const topThree = useMemo(() => {
    return leaderboard?.entries?.slice(0, 3) || [];
  }, [leaderboard]);

  const restOfRanks = useMemo(() => {
    return leaderboard?.entries?.slice(3) || [];
  }, [leaderboard]);

  const myEntry = useMemo(() => {
    return leaderboard?.entries?.find((e: any) => e.userId === currentUserId);
  }, [leaderboard, currentUserId]);

  if (isLoading && !leaderboard) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-10 pb-24 animate-pulse">
        <div className="h-24 w-1/3 bg-gray-200 border-4 border-black mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="h-64 bg-gray-200 border-4 border-black" />
          <div className="h-80 bg-gray-200 border-4 border-black" />
          <div className="h-64 bg-gray-200 border-4 border-black" />
        </div>
        <div className="h-96 bg-gray-200 border-4 border-black rounded-base" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-24 font-base">
      
      {gamificationError && errorVisible && (
        <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-red-400 p-6 rounded-base relative overflow-hidden mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-black uppercase text-xl leading-none mb-1 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Ranking Outage</h3>
              <p className="font-bold uppercase text-xs tracking-widest text-black/80">{gamificationError}</p>
            </div>
            <button onClick={() => setErrorVisible(false)} className="bg-white border-2 border-black p-2 rounded-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                <CloseX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col border-b-4 border-black pb-8">
        <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-white mb-2" style={{ WebkitTextStroke: '2px black' }}>
          LEADERBOARD
        </h1>
        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm flex items-center gap-2">
          <Trophy className="h-5 w-5 text-main" /> Global Rankings & Achievements
        </p>
      </div>

      {/* Podium Section - Only render if there are top players */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4 mt-4">
          
          {/* Rank 2 */}
          {topThree[1] && (
            <div className="order-2 md:order-1 flex flex-col items-center group">
              <div className="relative mb-4">
                <Avatar className="h-28 w-28 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].userId}`} />
                  <AvatarFallback className="bg-slate-300 font-black text-xl">2</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 bg-slate-300 border-2 border-black p-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-110">
                  <Medal className="h-5 w-5" />
                </div>
              </div>
              <div className="w-full bg-white border-4 border-black p-6 rounded-t-base text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-44 flex flex-col justify-center">
                <p className="font-black text-lg uppercase truncate">USER_{topThree[1].userId.substring(0, 8)}</p>
                <p className="text-3xl font-black text-main mt-1" style={{ WebkitTextStroke: '1px black' }}>{topThree[1].totalPoints} XP</p>
                <div className="mt-4 inline-block px-3 py-1 bg-black text-white text-[10px] font-black rounded-full tracking-widest uppercase">{topThree[1].badgeCount} Badges</div>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {topThree[0] && (
            <div className="order-1 md:order-2 flex flex-col items-center group mb-8 md:mb-0">
              <div className="relative mb-6">
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 animate-bounce">
                  <Crown className="h-14 w-14 text-yellow-400 stroke-black stroke-[3px]" />
                </div>
                <Avatar className="h-36 w-36 border-4 border-black shadow-[8px_8px_0px_0px_var(--color-main)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].userId}`} />
                  <AvatarFallback className="bg-main font-black text-2xl">1</AvatarFallback>
                </Avatar>
              </div>
              <div className="w-full bg-main border-4 border-black p-8 rounded-t-base text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] h-64 flex flex-col justify-center">
                <p className="font-black text-2xl uppercase truncate tracking-tighter">USER_{topThree[0].userId.substring(0, 8)}</p>
                <p className="text-6xl font-black text-white mt-3" style={{ WebkitTextStroke: '2.5px black' }}>{topThree[0].totalPoints} XP</p>
                <div className="mt-4 inline-block px-5 py-2 bg-black text-white text-xs font-black rounded-full uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">{topThree[0].badgeCount} Badges</div>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {topThree[2] && (
            <div className="order-3 md:order-3 flex flex-col items-center group">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].userId}`} />
                  <AvatarFallback className="bg-amber-600 text-white font-black text-lg">3</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 bg-amber-600 border-2 border-black p-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-110">
                  <Medal className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="w-full bg-white border-4 border-black p-6 rounded-t-base text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-36 flex flex-col justify-center">
                <p className="font-black text-md uppercase truncate">USER_{topThree[2].userId.substring(0, 8)}</p>
                <p className="text-2xl font-black text-main mt-1" style={{ WebkitTextStroke: '1px black' }}>{topThree[2].totalPoints} XP</p>
                <div className="mt-3 inline-block px-2 py-0.5 bg-black text-white text-[9px] font-black rounded-full tracking-widest uppercase">{topThree[2].badgeCount} Badges</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Leaderboard Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-4 border-black rounded-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-6 border-b-4 border-black bg-main/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Medal className="h-8 w-8 text-black" />
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Rising Stars</h3>
              </div>
              <span className="font-extrabold text-[10px] uppercase tracking-[0.2em] bg-black text-white px-3 py-1 rounded-full">
                {leaderboard?.totalEntries || restOfRanks.length + 3} Players Tracked
              </span>
            </div>
            
            <div className="divide-y-4 divide-black">
              {restOfRanks.length > 0 ? (
                restOfRanks.map((entry: any, index: number) => (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center justify-between px-8 py-5 hover:bg-main/5 transition-colors ${entry.userId === currentUserId ? 'bg-main/20' : ''}`}
                  >
                    <div className="flex items-center gap-8">
                      <span className="font-black italic text-2xl w-12 text-gray-300 group-hover:text-black transition-colors">{index + 4}</span>
                      <Avatar className="h-14 w-14 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`} />
                        <AvatarFallback className="bg-main font-black">U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm uppercase leading-none mb-1">USER_{entry.userId.substring(0, 12)}</p>
                        <p className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Mastered {entry.badgeCount} Skills</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl text-black leading-none">{entry.totalPoints} <span className="text-xs uppercase text-gray-400">XP</span></p>
                      {entry.userId === currentUserId && (
                        <div className="mt-1 flex justify-end">
                           <span className="text-[9px] font-black bg-black text-main px-2 py-0.5 rounded-full uppercase tracking-tighter">Current User</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center flex flex-col items-center">
                  <User className="h-16 w-16 text-gray-200 mb-4" />
                  <p className="font-black uppercase italic text-gray-300 text-3xl">Community is Growing</p>
                  <p className="font-bold text-gray-400 text-xs uppercase mt-2">More players will appear here soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: My Stats & Badges */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* My Card */}
          <div className="bg-black text-white border-4 border-black rounded-base p-8 shadow-[10px_10px_0px_0px_var(--color-main)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
              <Trophy className="h-40 w-40 -mr-10 -mt-10 rotate-12 scale-150" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-6">
                <Avatar className="h-28 w-28 border-4 border-main shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
                  <AvatarImage src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`} />
                  <AvatarFallback className="bg-main text-black font-black text-4xl uppercase">
                    {(session?.user?.name || "YOU").substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                {myEntry && (
                  <div className="absolute -top-4 -right-4 scale-125">
                    <RankBadge rank={myEntry.rank} />
                  </div>
                )}
              </div>
              
              <h4 className="font-black text-3xl uppercase tracking-tighter text-main mb-1 truncate max-w-full italic">{session?.user?.name || 'Vanguard'}</h4>
              <div className="flex items-center gap-2 mb-8 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                <span className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.3em]">RANK POSITION:</span>
                <span className="font-black text-main uppercase">#{myEntry?.rank || '--'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-white/[0.03] border-2 border-white/10 p-5 rounded-base flex flex-col items-center justify-center hover:bg-white/[0.07] transition-all">
                  <Zap className="h-5 w-5 text-main mb-2" />
                  <p className="font-black text-3xl tracking-tighter italic">{myEntry?.totalPoints || 0}</p>
                  <p className="font-black text-[9px] text-gray-500 uppercase tracking-widest font-heading">Accumulated XP</p>
                </div>
                <div className="bg-white/[0.03] border-2 border-white/10 p-5 rounded-base flex flex-col items-center justify-center hover:bg-white/[0.07] transition-all">
                  <Award className="h-5 w-5 text-main mb-2" />
                  <p className="font-black text-3xl tracking-tighter italic">{badges?.length || 0}</p>
                  <p className="font-black text-[9px] text-gray-500 uppercase tracking-widest font-heading">Total Badges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="bg-white border-4 border-black rounded-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
            <div className="p-6 border-b-4 border-black bg-gray-100 flex items-center gap-4">
              <Award className="h-7 w-7 text-black" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Your Collection</h3>
            </div>
            
            <div className="p-10">
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-6">
                  {badges.map((badge: any) => (
                    <div 
                      key={badge.id} 
                      className="group relative aspect-square bg-main/5 border-2 border-black rounded-base flex flex-col items-center justify-center hover:bg-main hover:-translate-y-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-help"
                      title={`${badge.name}: ${badge.description}`}
                    >
                      <BadgeIcon type={badge.type} />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all font-black text-[8px] uppercase bg-black text-white px-1.5 py-0.5 whitespace-nowrap z-20">
                        {badge.name}
                      </div>
                    </div>
                  ))}
                  {[...Array(Math.max(0, 6 - (badges?.length || 0)))].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square border-2 border-dashed border-gray-200 rounded-base flex items-center justify-center bg-gray-50/50">
                      <Target className="h-6 w-6 text-gray-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-4 border-dashed border-gray-100 mb-6">
                    <Star className="h-10 w-10 text-gray-200" />
                  </div>
                  <p className="text-center font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                    Collection is empty.<br />Complete tasks to begin<br />your journey.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-5 bg-main border-t-4 border-black text-center mt-auto">
              <div className="flex items-center justify-center gap-3">
                 <div className="h-1.5 flex-1 bg-black/10 rounded-full overflow-hidden p-0.5 border border-black/20">
                    <div className="bg-black h-full rounded-full" style={{ width: `${(myEntry?.totalPoints % 1000) / 10}%` }}></div>
                 </div>
                 <span className="font-black text-[10px] uppercase tracking-tighter whitespace-nowrap">
                   {1000 - (myEntry?.totalPoints % 1000)} XP TO NEXT LEVEL
                 </span>
              </div>
            </div>
          </div>

          {/* Hall of History snippet if any */}
          <div className="p-6 border-4 border-black border-dashed rounded-base flex flex-col items-center justify-center bg-white/50 space-y-3">
             <Crown className="h-6 w-6 text-gray-300" />
             <p className="font-black text-[9px] text-gray-400 uppercase tracking-widest text-center">
               Leaderboard resets every month.<br />Top 3 users gain permanent badges.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
