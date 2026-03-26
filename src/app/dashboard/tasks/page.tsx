"use client";

import { useTasks, Task, TaskStatus } from "@/hooks/use-tasks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback, useMemo } from "react";
import { CreateTaskModal } from "@/components/dashboard/create-task-modal";
import { TaskDetailDrawer } from "@/components/dashboard/task-detail-drawer";
import {
  CheckCircle2, Clock, Trophy, PlusCircle, Calendar,
  AlertTriangle, ChevronRight, HandMetal, Medal, Target,
  User, Search, X, Filter
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatUserHandle, formatRelativeTime, formatPoints } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentCommunity } from "@/hooks/use-current-community";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    TODO: "bg-blue-100 text-blue-800 border-blue-800",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-800",
    IN_REVIEW: "bg-purple-100 text-purple-800 border-purple-800",
    DONE: "bg-emerald-100 text-emerald-800 border-emerald-800",
    CANCELED: "bg-gray-100 text-gray-500 border-gray-400",
  };
  return (
    <span className={`px-2 py-0.5 border-2 font-bold text-[9px] uppercase tracking-wider rounded-base whitespace-nowrap ${styles[status] || styles.TODO}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const PriorityDot = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = {
    LOW: "bg-blue-400", MEDIUM: "bg-amber-400", HIGH: "bg-red-500",
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-black flex-shrink-0 ${colors[priority] || colors.MEDIUM}`} title={priority} />;
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

export default function TasksPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const {
    tasks, myTasks, myCreatedTasks, leaderboard, badges, isLoading, error,
    fetchPublicTasks, fetchMyTasks, fetchMyCreatedTasks,
    updateTaskStatus, volunteerForTask, createTask, updateTask, deleteTask,
    fetchTaskDetail, addComment, addSubTask, assignMentor, requestHelp, requestHandover,
  } = useTasks();

  const { community } = useCurrentCommunity();
  const isFounder = community?.founderId === currentUserId;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Search state per tab
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerStatus, setExplorerStatus] = useState('');
  const [mySearch, setMySearch] = useState('');
  const [myStatus, setMyStatus] = useState('');
  const [createdSearch, setCreatedSearch] = useState('');
  const [createdStatus, setCreatedStatus] = useState('');

  // Search handlers
  const handleExplorerSearch = useCallback(() => {
    fetchPublicTasks({ search: explorerSearch || undefined, status: explorerStatus as TaskStatus || undefined });
  }, [explorerSearch, explorerStatus, fetchPublicTasks]);

  const handleMySearch = useCallback(() => {
    fetchMyTasks({ search: mySearch || undefined, status: myStatus as TaskStatus || undefined });
  }, [mySearch, myStatus, fetchMyTasks]);

  const handleCreatedSearch = useCallback(() => {
    fetchMyCreatedTasks({ search: createdSearch || undefined, status: createdStatus as TaskStatus || undefined });
  }, [createdSearch, createdStatus, fetchMyCreatedTasks]);

  const handleCreateTask = async (data: any) => {
    const enrichedData = { ...data, visibility: 'PUBLIC' };
    await createTask(enrichedData);
    setIsModalOpen(false);
  };

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    const progression: Record<string, string> = {
      TODO: 'IN_PROGRESS', IN_PROGRESS: 'IN_REVIEW', IN_REVIEW: 'DONE',
    };
    if (progression[currentStatus]) {
      setLoadingTaskId(taskId);
      try { await updateTaskStatus(taskId, progression[currentStatus] as any); }
      finally { setLoadingTaskId(null); }
    }
  };

  const myXP = useMemo(() => {
    return myTasks.reduce((acc, t) => acc + (t.status === 'DONE' ? (t.points || 0) : 0), 0);
  }, [myTasks]);

  const openTasksCount = useMemo(() => {
    return tasks.filter(t => !t.assigneeId).length;
  }, [tasks]);

  const handleVolunteer = async (taskId: string) => {
    setLoadingTaskId(taskId);
    try { await volunteerForTask(taskId); }
    finally { setLoadingTaskId(null); }
  };

  // ── Search bar shared component ──────────────────────────────────────────────
  const SearchBar = ({
    search, setSearch, status, setStatus, onSearch, placeholder
  }: {
    search: string; setSearch: (v: string) => void;
    status: string; setStatus: (v: string) => void;
    onSearch: () => void; placeholder: string;
  }) => (
    <div className="flex gap-2 mb-4 flex-wrap">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2.5 border-2 border-black rounded-base font-bold text-sm bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all outline-none placeholder:text-gray-400"
          placeholder={placeholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />
        {search && (
          <button onClick={() => { setSearch(''); onSearch(); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-3.5 w-3.5 text-gray-400 hover:text-black" />
          </button>
        )}
      </div>
      <div className="relative">
        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <select
          className="pl-8 pr-3 py-2.5 border-2 border-black rounded-base font-bold text-sm bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer outline-none"
          value={status}
          onChange={e => { setStatus(e.target.value); }}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <Button size="sm" onClick={onSearch} className="font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-xs px-4">
        Search
      </Button>
    </div>
  );

  // ── Task list row ────────────────────────────────────────────────────────────
  const renderTaskRow = (task: Task, mode: 'mine' | 'explore' | 'created') => {
    const isTaken = !!task.assigneeId;
    const isMe = task.assigneeId === currentUserId;
    const busy = loadingTaskId === task.id;

    return (
      <div
        key={task.id}
        className="flex items-center gap-3 px-4 py-3.5 bg-white border-b-2 border-black last:border-b-0 hover:bg-main/5 transition-colors cursor-pointer group"
        onClick={() => setSelectedTaskId(task.id)}
      >
        <PriorityDot priority={task.priority} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm text-black">{task.title}</span>
            <StatusBadge status={task.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-wrap">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(task.dueDate)}
              </span>
            )}
            {task.points ? (
              <span className="flex items-center gap-1 text-amber-600">
                <Trophy className="h-3 w-3" />{formatPoints(task.points)}
              </span>
            ) : null}
            {task.estimatedTime ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{task.estimatedTime}h
              </span>
            ) : null}
          </div>
        </div>

        {/* Action (stop propagation so clicking button doesn't open drawer) */}
        <div className="flex-shrink-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {mode === 'mine' ? (
            task.status !== 'DONE' && task.status !== 'CANCELED' ? (
              <Button variant="reverse" size="sm" className="font-black uppercase text-xs px-3 h-8 border-2 border-black" onClick={() => handleStatusChange(task.id, task.status)} disabled={busy}>
                {task.status === 'TODO' ? 'Start' : task.status === 'IN_PROGRESS' ? 'Review' : 'Done'}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            ) : (
              <span className="text-[9px] font-black text-emerald-700 uppercase flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            )
          ) : mode === 'explore' ? (
            isTaken ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 border-2 border-black rounded-base">
                <Avatar className="h-5 w-5 border border-black">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigneeId}`} />
                  <AvatarFallback className="bg-main text-[7px]"><User className="h-3 w-3" /></AvatarFallback>
                </Avatar>
                <span className="text-[9px] font-black uppercase text-gray-600">{isMe ? 'Mine' : formatUserHandle(task.assigneeId)}</span>
              </div>
            ) : (
              <Button variant="neutral" size="sm" className="font-black uppercase text-xs px-3 h-8 border-2 border-black" onClick={() => handleVolunteer(task.id)} disabled={busy}>
                <HandMetal className="h-3 w-3 mr-1" />{busy ? '...' : 'Take'}
              </Button>
            )
          ) : (
            // created tab: show assignee or "unassigned"
            task.assigneeId ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border-2 border-black rounded-base">
                <User className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase">Assigned</span>
              </div>
            ) : (
              <span className="text-[9px] font-black text-gray-400 uppercase">Open</span>
            )
          )}
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors" />
        </div>
      </div>
    );
  };

  const TaskList = ({ items, mode }: { items: Task[]; mode: 'mine' | 'explore' | 'created' }) => {
    if (isLoading) return (
      <div className="bg-white border-4 border-black rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 mx-4 my-3 rounded-base" />)}
      </div>
    );
    if (items.length === 0) return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-base">
        <div className="bg-main/20 border-2 border-black p-5 rounded-base mb-5">
          {mode === 'mine' ? <CheckCircle2 className="h-9 w-9 text-black" /> : <Clock className="h-9 w-9 text-black" />}
        </div>
        <h3 className="text-xl font-black italic uppercase">
          {mode === 'mine' ? 'Queue Clear' : mode === 'created' ? 'No Missions Posted' : 'No Open Missions'}
        </h3>
        <p className="font-bold text-gray-400 mt-2 uppercase tracking-widest text-[9px] text-center px-12 leading-loose">
          {mode === 'mine' ? 'Join missions in Explorer Hub to begin your training.' : mode === 'created' ? 'Ignite community growth. Use + Create Task to post a mission.' : 'All missions are currently claimed by دیگر explorers.'}
        </p>
      </div>
    );
    return (
      <div className="bg-white border-4 border-black rounded-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {items.map(task => renderTaskRow(task, mode))}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-24 font-base">

      {error && (
        <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-red-50 p-6 rounded-base relative overflow-hidden group">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-500 border-2 border-black rounded-full text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black uppercase italic text-lg leading-none mb-1">System Notice</h3>
              <p className="font-bold uppercase text-[10px] tracking-widest text-red-600">{error}</p>
            </div>
            <button onClick={() => { /* maybe a clear error function */ }} className="ml-auto text-gray-400 hover:text-black">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tighter text-white mb-4" style={{ WebkitTextStroke: '2px black' }}>
            CLASSROOM
          </h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-main border-2 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
              My Queue: {myTasks.length}
            </div>
            <div className="bg-white border-2 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
              XP: {formatPoints(myXP)}
            </div>
            <div className="bg-white border-2 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
              Open: {openTasksCount}
            </div>
          </div>
        </div>
        {isFounder && (
          <Button onClick={() => setIsModalOpen(true)} className="h-14 px-8 text-lg font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <PlusCircle className="h-6 w-6 mr-2" />Create Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left: Tabs */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="bg-transparent mb-0 flex gap-3 h-auto p-0 border-none flex-wrap">
              {[
                { value: 'my-tasks', label: 'My Queue', count: myTasks.length },
                { value: 'available', label: 'Explorer Hub', count: tasks.length },
                { value: 'created', label: 'Created by Me', count: myCreatedTasks.length },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="bg-white border-4 border-black rounded-base font-black px-5 py-2 data-[state=active]:bg-main data-[state=active]:translate-x-0.5 data-[state=active]:translate-y-0.5 data-[state=active]:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase text-xs"
                >
                  {tab.label}
                  <span className="ml-2 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{tab.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-5">
              <TabsContent value="my-tasks" className="mt-0">
                <SearchBar
                  search={mySearch} setSearch={setMySearch}
                  status={myStatus} setStatus={setMyStatus}
                  onSearch={handleMySearch} placeholder="Search your tasks..."
                />
                <TaskList items={myTasks} mode="mine" />
              </TabsContent>

              <TabsContent value="available" className="mt-0">
                <SearchBar
                  search={explorerSearch} setSearch={setExplorerSearch}
                  status={explorerStatus} setStatus={setExplorerStatus}
                  onSearch={handleExplorerSearch} placeholder="Search available missions..."
                />
                <TaskList items={tasks} mode="explore" />
              </TabsContent>

              <TabsContent value="created" className="mt-0">
                <SearchBar
                  search={createdSearch} setSearch={setCreatedSearch}
                  status={createdStatus} setStatus={setCreatedStatus}
                  onSearch={handleCreatedSearch} placeholder="Search tasks you created..."
                />
                <TaskList items={myCreatedTasks} mode="created" />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right: Gamification */}
        <div className="lg:col-span-4 space-y-8">

          <div className="bg-black text-white border-4 border-black rounded-base p-6 shadow-[8px_8px_0px_0px_var(--color-main)] relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-black uppercase tracking-tighter text-main text-xs mb-4">Current Reputation</h4>
              <div className="flex items-center justify-between mb-6">
                <div className="text-5xl font-black italic tracking-tighter">LVL 08</div>
                <Trophy className="h-12 w-12 text-main" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between font-black text-[10px] uppercase">
                  <span>Explorer Progress</span><span>65%</span>
                </div>
                <div className="w-full bg-gray-800 border-2 border-white/20 h-4 rounded-full overflow-hidden p-1">
                  <div className="bg-main h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black rounded-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-5 border-b-4 border-black bg-main/10 flex items-center gap-3">
              <Medal className="h-5 w-5 text-black" />
              <h3 className="text-lg font-black uppercase italic">Hall of Fame</h3>
            </div>
            <div className="p-3 space-y-2">
              {leaderboard?.entries && leaderboard.entries.length > 0 ? (
                leaderboard.entries.map((entry: any, idx: number) => (
                  <div key={entry.userId} className="flex items-center justify-between px-3 py-2.5 border-2 border-black bg-white rounded-base hover:bg-main transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-black italic text-base w-5">{idx + 1}</span>
                      <Avatar className="h-8 w-8 border-2 border-black">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`} />
                        <AvatarFallback className="bg-main font-black text-xs">U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-xs uppercase">{formatUserHandle(entry.userId)}</p>
                        <p className="font-bold text-[9px] text-gray-500">{entry.badgeCount} Mastered Skills</p>
                      </div>
                    </div>
                    <span className="font-black text-sm">{formatPoints(entry.totalPoints)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                  No rankings yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border-4 border-black rounded-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-5 border-b-4 border-black bg-gray-50">
              <h3 className="text-lg font-black uppercase italic">Unlocked Skills</h3>
            </div>
            <div className="p-5">
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {badges.map((badge: any) => (
                    <div key={badge.id} className="aspect-square bg-main/20 border-2 border-black rounded-base flex items-center justify-center hover:bg-main transition-colors cursor-help">
                      <span className="text-2xl">{badge.icon || '🎖️'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <Target className="h-8 w-8 text-black/10 mb-3" />
                  <p className="font-bold text-gray-400 text-[9px] text-center uppercase tracking-widest">Complete missions to earn badges</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <CreateTaskModal onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTask} />
      )}

      <TaskDetailDrawer
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        currentUserId={currentUserId}
        fetchTaskDetail={fetchTaskDetail}
        addComment={addComment}
        addSubTask={addSubTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
        updateTaskStatus={updateTaskStatus}
        requestHelp={requestHelp}
        requestHandover={requestHandover}
        assignMentor={assignMentor}
      />
    </div>
  );
}
