"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X, MessageSquare, CheckSquare, Clock, Trash2, Edit3, Save,
  HandMetal, LifeBuoy, RefreshCw, Trophy, Calendar,
  AlertTriangle, ChevronRight, Plus, User, Activity
} from "lucide-react";
import { format } from "date-fns";
import { TaskDetail, Comment, SubTask, ActivityLog } from "@/hooks/use-tasks";

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
  currentUserId?: string;
  fetchTaskDetail: (id: string) => Promise<TaskDetail | null>;
  addComment: (taskId: string, content: string) => Promise<Comment>;
  addSubTask: (taskId: string, title: string) => Promise<SubTask>;
  updateTask: (id: string, dto: any) => Promise<any>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: any) => Promise<void>;
  requestHelp: (taskId: string, message: string) => Promise<void>;
  requestHandover: (taskId: string, reason: string) => Promise<void>;
  assignMentor: (taskId: string, mentorId: string) => Promise<void>;
}

type DrawerTab = 'details' | 'comments' | 'subtasks' | 'activity';

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-blue-100 text-blue-800 border-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-800",
  IN_REVIEW: "bg-purple-100 text-purple-800 border-purple-800",
  DONE: "bg-emerald-100 text-emerald-800 border-emerald-800",
  CANCELED: "bg-gray-100 text-gray-500 border-gray-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-800",
  MEDIUM: "bg-amber-50 text-amber-800",
  HIGH: "bg-red-50 text-red-800",
};

const ACTION_LABELS: Record<string, string> = {
  CREATED: "Task created",
  UPDATED: "Task updated",
  STATUS_UPDATED: "Status changed",
  COMMENT_ADDED: "Comment added",
  ASSIGNED: "Task assigned",
  VOLUNTEER: "Volunteered",
  HELP_REQUESTED: "Help requested",
  HANDOVER_REQUESTED: "Handover requested",
  MENTOR_ASSIGNED: "Mentor assigned",
};

export function TaskDetailDrawer({
  taskId,
  onClose,
  currentUserId,
  fetchTaskDetail,
  addComment,
  addSubTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  requestHelp,
  requestHandover,
  assignMentor,
}: TaskDetailDrawerProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DrawerTab>('details');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Subtask input
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [submittingSubtask, setSubmittingSubtask] = useState(false);

  // Help / Handover
  const [helpMessage, setHelpMessage] = useState('');
  const [handoverReason, setHandoverReason] = useState('');
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [mentorId, setMentorId] = useState('');

  const loadTask = async () => {
    if (!taskId) return;
    setLoading(true);
    const data = await fetchTaskDetail(taskId);
    setTask(data);
    if (data) {
      setEditTitle(data.title);
      setEditDescription(data.description || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (taskId) {
      loadTask();
      setActiveTab('details');
      setIsEditing(false);
      setShowHelpForm(false);
      setShowHandoverForm(false);
      setShowMentorForm(false);
    }
  }, [taskId]);

  if (!taskId) return null;

  const isOwner = task?.assignerId === currentUserId || task?.creatorId === currentUserId;
  const isAssignee = task?.assigneeId === currentUserId;

  const handleSaveEdit = async () => {
    if (!task) return;
    await updateTask(task.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
    await loadTask();
  };

  const handleDelete = async () => {
    if (!task || !confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task.id);
    onClose();
  };

  const handleStatusAdvance = async () => {
    if (!task) return;
    const progression: Record<string, string> = {
      TODO: 'IN_PROGRESS', IN_PROGRESS: 'IN_REVIEW', IN_REVIEW: 'DONE'
    };
    if (progression[task.status]) {
      await updateTaskStatus(task.id, progression[task.status] as any);
      await loadTask();
    }
  };

  const handleAddComment = async () => {
    if (!task || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await addComment(task.id, commentText.trim());
      setTask(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev);
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddSubTask = async () => {
    if (!task || !subtaskTitle.trim()) return;
    setSubmittingSubtask(true);
    try {
      const newSub = await addSubTask(task.id, subtaskTitle.trim());
      setTask(prev => prev ? { ...prev, subTasks: [...(prev.subTasks || []), newSub] } : prev);
      setSubtaskTitle('');
    } finally {
      setSubmittingSubtask(false);
    }
  };

  const handleRequestHelp = async () => {
    if (!task || !helpMessage.trim()) return;
    await requestHelp(task.id, helpMessage.trim());
    setShowHelpForm(false);
    setHelpMessage('');
    alert('Help request sent!');
  };

  const handleRequestHandover = async () => {
    if (!task || !handoverReason.trim()) return;
    await requestHandover(task.id, handoverReason.trim());
    setShowHandoverForm(false);
    setHandoverReason('');
    alert('Handover request sent!');
  };

  const handleAssignMentor = async () => {
    if (!task || !mentorId.trim()) return;
    await assignMentor(task.id, mentorId.trim());
    setShowMentorForm(false);
    setMentorId('');
    await loadTask();
  };

  const inputCls = "w-full p-2.5 border-2 border-black rounded-base font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all outline-none text-sm";

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TabButton = ({ tab, label, count }: { tab: DrawerTab; label: string; count?: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-1.5 px-4 py-2 font-black text-xs uppercase tracking-wider border-b-2 transition-all ${
        activeTab === tab
          ? 'border-black text-black'
          : 'border-transparent text-gray-400 hover:text-black'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="bg-black text-white text-[9px] px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-xl bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="border-b-4 border-black p-5 flex items-start justify-between gap-4 bg-main/10 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="h-6 w-48 bg-black/10 animate-pulse rounded" />
            ) : isEditing ? (
              <input
                className={inputCls + " text-lg font-black"}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                autoFocus
              />
            ) : (
              <h2 className="text-xl font-black leading-tight text-black">{task?.title}</h2>
            )}
            {task && !isEditing && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-0.5 border-2 font-bold text-[9px] uppercase tracking-wider rounded-base ${STATUS_COLORS[task.status]}`}>
                  {task.status.replace(/_/g, ' ')}
                </span>
                <span className={`px-2 py-0.5 border-2 border-black font-bold text-[9px] uppercase tracking-wider rounded-base flex items-center gap-1 ${PRIORITY_COLORS[task.priority]}`}>
                  <AlertTriangle className="h-2.5 w-2.5" /> {task.priority}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSaveEdit} className="h-8 px-3 font-black text-xs bg-main border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
                <Button size="sm" variant="neutral" onClick={() => setIsEditing(false)} className="h-8 px-3 font-black text-xs border-2 border-black">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {isOwner && task?.status !== 'DONE' && (
                  <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-black/5 rounded transition-colors" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
                {isOwner && (
                  <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-500" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded transition-colors ml-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black flex-shrink-0 bg-white overflow-x-auto">
          <TabButton tab="details" label="Details" />
          <TabButton tab="comments" label="Comments" count={task?.comments?.length} />
          <TabButton tab="subtasks" label="Subtasks" count={task?.subTasks?.length} />
          <TabButton tab="activity" label="Activity" count={task?.activityLogs?.length} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-black/5 animate-pulse rounded" />)}
            </div>
          ) : !task ? (
            <div className="p-8 text-center font-bold text-gray-400">Failed to load task.</div>
          ) : (

            <>
              {/* ── DETAILS TAB ─────────────────────────────────────────────── */}
              {activeTab === 'details' && (
                <div className="p-5 space-y-5">
                  {/* Description */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description</p>
                    {isEditing ? (
                      <textarea
                        className={inputCls + " resize-none"}
                        rows={4}
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        placeholder="Add a description..."
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-700 leading-relaxed">
                        {task.description || <span className="text-gray-400 italic">No description.</span>}
                      </p>
                    )}
                  </div>

                  {/* Meta chips */}
                  <div className="grid grid-cols-2 gap-3">
                    {task.points && (
                      <div className="flex items-center gap-2 p-3 bg-main/20 border-2 border-black rounded-base">
                        <Trophy className="h-4 w-4 text-black" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-gray-500">XP Reward</p>
                          <p className="font-black text-sm">{task.points} XP</p>
                        </div>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-base">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-gray-500">Due Date</p>
                          <p className="font-black text-sm">{format(new Date(task.dueDate), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                    )}
                    {task.estimatedTime && (
                      <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-base">
                        <Clock className="h-4 w-4" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-gray-500">Est. Hours</p>
                          <p className="font-black text-sm">{task.estimatedTime}h</p>
                        </div>
                      </div>
                    )}
                    {task.assigneeId && (
                      <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-base">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-gray-500">Assignee</p>
                          <p className="font-black text-sm truncate">...{task.assigneeId.slice(-8)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status advancement */}
                  {isAssignee && task.status !== 'DONE' && task.status !== 'CANCELED' && (
                    <Button
                      onClick={handleStatusAdvance}
                      className="w-full font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {task.status === 'TODO' ? '▶ Start Mission' : task.status === 'IN_PROGRESS' ? '🔍 Submit for Review' : '✓ Mark as Done'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}

                  {/* Assignee actions */}
                  {isAssignee && task.status !== 'DONE' && task.status !== 'CANCELED' && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assignee Actions</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="neutral" className="text-xs font-black border-2 border-black" onClick={() => setShowHelpForm(v => !v)}>
                          <LifeBuoy className="h-3.5 w-3.5 mr-1" /> Request Help
                        </Button>
                        <Button size="sm" variant="neutral" className="text-xs font-black border-2 border-black" onClick={() => setShowHandoverForm(v => !v)}>
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Handover
                        </Button>
                      </div>
                      {showHelpForm && (
                        <div className="space-y-2">
                          <textarea className={inputCls + " resize-none"} rows={2} placeholder="Describe what you need help with..." value={helpMessage} onChange={e => setHelpMessage(e.target.value)} />
                          <Button size="sm" onClick={handleRequestHelp} className="font-black border-2 border-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Send Help Request</Button>
                        </div>
                      )}
                      {showHandoverForm && (
                        <div className="space-y-2">
                          <textarea className={inputCls + " resize-none"} rows={2} placeholder="Reason for handover..." value={handoverReason} onChange={e => setHandoverReason(e.target.value)} />
                          <Button size="sm" onClick={handleRequestHandover} className="font-black border-2 border-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Send Handover Request</Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Owner actions */}
                  {isOwner && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Owner Actions</p>
                      <Button size="sm" variant="neutral" className="text-xs font-black border-2 border-black" onClick={() => setShowMentorForm(v => !v)}>
                        <HandMetal className="h-3.5 w-3.5 mr-1" /> Assign Mentor
                      </Button>
                      {showMentorForm && (
                        <div className="space-y-2">
                          <input className={inputCls} placeholder="Mentor User ID..." value={mentorId} onChange={e => setMentorId(e.target.value)} />
                          <Button size="sm" onClick={handleAssignMentor} className="font-black border-2 border-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Assign</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── COMMENTS TAB ────────────────────────────────────────────── */}
              {activeTab === 'comments' && (
                <div className="p-5 space-y-4">
                  {/* New comment */}
                  <div className="space-y-2">
                    <textarea
                      className={inputCls + " resize-none"}
                      rows={3}
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={submittingComment || !commentText.trim()} className="font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <MessageSquare className="h-3 w-3 mr-1" /> {submittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>

                  {/* Comment list */}
                  <div className="space-y-3">
                    {!task.comments || task.comments.length === 0 ? (
                      <div className="text-center py-8 font-bold text-gray-400 text-xs uppercase tracking-widest">No comments yet. Be the first!</div>
                    ) : (
                      [...task.comments].reverse().map(c => (
                        <div key={c.id} className="p-4 bg-white border-2 border-black rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                              User ...{c.userId?.slice(-6)}
                              {c.userId === currentUserId && <span className="ml-2 bg-main text-black px-1.5 rounded text-[8px]">YOU</span>}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold">{format(new Date(c.createdAt), "MMM d, HH:mm")}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-700 leading-relaxed">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── SUBTASKS TAB ─────────────────────────────────────────────── */}
              {activeTab === 'subtasks' && (
                <div className="p-5 space-y-4">
                  {/* Progress */}
                  {task.subTasks && task.subTasks.length > 0 && (
                    <div>
                      <div className="flex justify-between font-black text-[10px] uppercase mb-1">
                        <span>Progress</span>
                        <span>{task.subTasks.filter(s => s.isCompleted).length}/{task.subTasks.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 border-2 border-black h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-main h-full transition-all"
                          style={{ width: `${(task.subTasks.filter(s => s.isCompleted).length / task.subTasks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Add subtask */}
                  <div className="flex gap-2">
                    <input
                      className={inputCls + " flex-1"}
                      placeholder="Add a checklist item..."
                      value={subtaskTitle}
                      onChange={e => setSubtaskTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSubTask(); }}
                    />
                    <Button size="sm" onClick={handleAddSubTask} disabled={submittingSubtask || !subtaskTitle.trim()} className="font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Subtask list */}
                  <div className="space-y-2">
                    {!task.subTasks || task.subTasks.length === 0 ? (
                      <div className="text-center py-8 font-bold text-gray-400 text-xs uppercase tracking-widest">No subtasks yet.</div>
                    ) : (
                      task.subTasks.map(sub => (
                        <div key={sub.id} className={`flex items-center gap-3 p-3 border-2 border-black rounded-base ${sub.isCompleted ? 'bg-emerald-50' : 'bg-white'}`}>
                          <CheckSquare className={`h-5 w-5 flex-shrink-0 ${sub.isCompleted ? 'text-emerald-600' : 'text-gray-300'}`} />
                          <span className={`text-sm font-bold flex-1 ${sub.isCompleted ? 'line-through text-gray-400' : 'text-black'}`}>
                            {sub.title}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── ACTIVITY TAB ─────────────────────────────────────────────── */}
              {activeTab === 'activity' && (
                <div className="p-5 space-y-3">
                  {!task.activityLogs || task.activityLogs.length === 0 ? (
                    <div className="text-center py-8 font-bold text-gray-400 text-xs uppercase tracking-widest">No activity recorded yet.</div>
                  ) : (
                    [...task.activityLogs].reverse().map(log => (
                      <div key={log.id} className="flex gap-3 items-start">
                        <div className="w-7 h-7 bg-main border-2 border-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity className="h-3.5 w-3.5 text-black" />
                        </div>
                        <div className="flex-1 pb-3 border-b border-black/10 last:border-0">
                          <p className="font-black text-sm">{ACTION_LABELS[log.action] || log.action}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                            by ...{log.userId?.slice(-6)} · {format(new Date(log.createdAt), "MMM d, HH:mm")}
                          </p>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <pre className="text-[9px] bg-gray-50 border border-gray-200 rounded p-1.5 mt-1 overflow-auto font-mono">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
