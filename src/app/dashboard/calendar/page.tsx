"use client";

import { useState, useMemo } from "react";
import { useMeetings, Meeting, AgendaItem, MeetingNote } from "@/hooks/use-meetings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentCommunity } from "@/hooks/use-current-community";
import {
  AlertTriangle, PlusCircle, ChevronLeft, ChevronRight, Video, MapPin,
  Users, Clock, CalendarDays, X, Check, Minus, LifeBuoy, LogIn, LogOut,
  FileText, ListChecks, Save, Trash2, CalendarCheck, AlertCircle, Globe, Lock
} from "lucide-react";
import { formatUserHandle, formatTime12h } from "@/lib/formatters";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  isSameDay, isToday, isBefore, isPast, addMonths, subMonths,
  parseISO, addMinutes
} from "date-fns";

// ── Types ────────────────────────────────────────────────────────────────────

const LOCATION_ICONS: Record<string, React.ReactNode> = {
  ONLINE: <Video className="h-3.5 w-3.5" />,
  IN_PERSON: <MapPin className="h-3.5 w-3.5" />,
  HYBRID: <Globe className="h-3.5 w-3.5" />,
};

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-800",
  CANCELED: "bg-gray-100 text-gray-500 border-gray-400",
};

// ── Create Meeting Modal ─────────────────────────────────────────────────────

interface CreateMeetingModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  defaultDate?: Date;
}

function CreateMeetingModal({ onClose, onSubmit, defaultDate }: CreateMeetingModalProps) {
  const defaultStart = useMemo(() => {
    const base = defaultDate ? new Date(defaultDate) : new Date();
    if (defaultDate) {
      base.setHours(9, 0, 0, 0);
      if (base <= new Date()) {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 30, 0, 0);
        return d;
      }
      return base;
    }
    base.setMinutes(base.getMinutes() + 30, 0, 0);
    return base;
  }, [defaultDate]);

  const toLocalISO = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const minDateTime = useMemo(() => { 
    const d = new Date(); d.setMinutes(d.getMinutes() + 3, 0, 0); return toLocalISO(d); 
  }, []);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: toLocalISO(defaultStart),
    duration: 60,
    meetingUrl: '',
    location: '',
  });
  const [locType, setLocType] = useState<"ONLINE" | "IN_PERSON">("ONLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls = "w-full p-3 text-sm md:text-base border-2 border-black rounded-base font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all outline-none";
  const labelCls = "block text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 mb-2";

  const handleNext = () => {
    if (step === 1 && !form.title.trim()) {
      setError("Event Title is required.");
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    
    // Auto-clear fields based on locType
    const submitUrl = locType === "ONLINE" ? form.meetingUrl : "";
    const submitLoc = locType === "IN_PERSON" ? form.location : "";

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: form.title,
        description: form.description || undefined,
        startTime: new Date(form.startTime).toISOString(),
        duration: Number(form.duration),
        meetingUrl: submitUrl || undefined,
        location: submitLoc || undefined,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create meeting";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const STEPS_COUNT = 3;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black rounded-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg flex flex-col max-h-[90vh]">
          
          <div className="flex items-center justify-between p-5 border-b-4 border-black bg-main/20 flex-shrink-0">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Create Event</h2>
              <div className="flex gap-1.5 mt-2">
                {Array.from({ length: STEPS_COUNT }).map((_, i) => (
                  <div key={i} className={`h-1.5 w-8 border border-black rounded-full transition-colors ${step >= i + 1 ? 'bg-black' : 'bg-white'}`} />
                ))}
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-black/10 rounded-base border-2 border-transparent hover:border-black transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-white">
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-base p-3 text-sm font-bold text-red-700 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> 
                <p>{error}</p>
              </div>
            )}

            <form id="create-event-form" onSubmit={e => { e.preventDefault(); step < STEPS_COUNT ? handleNext() : handleSubmit(); }}>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>Event Name *</label>
                    <input autoFocus className={`${inputCls} text-lg py-4`} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="E.g., Design Sync, Hackathon..." />
                  </div>
                  <div>
                    <label className={labelCls}>Event Description</label>
                    <textarea className={inputCls + " resize-none"} rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this event about? (Optional)" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>Start Time *</label>
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={form.startTime}
                      min={minDateTime}
                      onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Duration</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[15, 30, 45, 60, 90, 120].map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, duration: dur }))}
                          className={`py-2 border-2 border-black rounded-base font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${form.duration === dur ? 'bg-main translate-x-[1px] translate-y-[1px] shadow-none' : 'bg-white hover:bg-main/20'}`}
                        >
                          {dur}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>Location Type</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setLocType("ONLINE")}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 border-black rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs uppercase ${
                          locType === "ONLINE" ? 'bg-main translate-x-[1px] translate-y-[1px] shadow-none' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <Video className="h-6 w-6" />
                        Virtual
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocType("IN_PERSON")}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 border-black rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs uppercase ${
                          locType === "IN_PERSON" ? 'bg-main translate-x-[1px] translate-y-[1px] shadow-none' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <MapPin className="h-6 w-6" />
                        In-Person
                      </button>
                    </div>
                  </div>

                  {locType === "ONLINE" && (
                    <div>
                      <label className={labelCls}>Meeting Link</label>
                      <input autoFocus className={inputCls} placeholder="https://zoom.us/j/123..." value={form.meetingUrl} onChange={e => setForm(f => ({ ...f, meetingUrl: e.target.value }))} />
                    </div>
                  )}

                  {locType === "IN_PERSON" && (
                    <div>
                      <label className={labelCls}>Physical Location</label>
                      <input autoFocus className={inputCls} placeholder="Room A, Building 3..." value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="p-5 border-t-4 border-black bg-gray-50 flex gap-3 flex-shrink-0">
            {step > 1 && (
              <Button type="button" variant="neutral" onClick={() => setStep(s => s - 1)} className="font-black text-sm uppercase px-6 border-2 border-black">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            
            {step < STEPS_COUNT ? (
              <Button type="submit" form="create-event-form" className="flex-1 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" form="create-event-form" className="flex-1 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" disabled={loading}>
                {loading ? 'Creating...' : (
                  <>
                    <CalendarCheck className="h-4 w-4 mr-2" /> Create Event
                  </>
                )}
              </Button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

// ── Meeting Detail Panel ─────────────────────────────────────────────────────

interface MeetingDetailPanelProps {
  meeting: Meeting | null;
  onClose: () => void;
  currentUserId?: string;
  hooks: ReturnType<typeof useMeetings>;
}

function MeetingDetailPanel({ meeting, onClose, currentUserId, hooks }: MeetingDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'agenda' | 'notes'>('info');
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isActionItem, setIsActionItem] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);

  const isOrganizer = meeting?.organizerId === currentUserId;
  const startDate = meeting ? parseISO(meeting.startTime) : null;
  const endDate = startDate && meeting ? addMinutes(startDate, meeting.duration || 60) : null;
  const isUpcoming = startDate ? !isPast(startDate) : false;
  const isLive = meeting?.status === 'IN_PROGRESS';

  const loadTabData = async (tab: 'agenda' | 'notes') => {
    if (!meeting) return;
    setLoadingData(true);
    try {
      if (tab === 'agenda') {
        const items = await hooks.getAgendaItems(meeting.id);
        setAgendaItems(items);
      } else {
        const n = await hooks.getMeetingNotes(meeting.id);
        setNotes(n);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (tab: 'info' | 'agenda' | 'notes') => {
    setActiveTab(tab);
    if (tab !== 'info') loadTabData(tab);
  };

  const handleAddAgenda = async () => {
    if (!meeting || !newAgendaTitle.trim()) return;
    const item = await hooks.addAgendaItem(meeting.id, { title: newAgendaTitle.trim() });
    setAgendaItems(prev => [...prev, item]);
    setNewAgendaTitle('');
  };

  const handleAddNote = async () => {
    if (!meeting || !newNoteContent.trim()) return;
    const note = await hooks.addMeetingNote(meeting.id, newNoteContent.trim(), isActionItem);
    setNotes(prev => [...prev, note]);
    setNewNoteContent('');
    setIsActionItem(false);
  };

  const handleRsvp = async (status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE') => {
    if (!meeting) return;
    await hooks.submitRsvp(meeting.id, status);
    setRsvpStatus(status);
  };

  if (!meeting) return null;

  const inputCls = "w-full p-2 border-2 border-black rounded-base font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all outline-none text-sm";

  const TabBtn = ({ tab, label }: { tab: 'info' | 'agenda' | 'notes'; label: string }) => (
    <button onClick={() => handleTabChange(tab)} className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-b-2 transition-all ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
      {label}
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-lg bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.1)] flex flex-col">

        {/* Header */}
        <div className={`border-b-4 border-black p-5 flex-shrink-0 ${isLive ? 'bg-amber-100' : 'bg-main/10'}`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              {isLive && <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full mb-2">● LIVE NOW</span>}
              <h2 className="text-xl font-black leading-tight">{meeting.title}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded flex-shrink-0"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-0.5 border-2 font-bold text-[9px] uppercase rounded-base ${STATUS_STYLES[meeting.status]}`}>
              {meeting.status}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-600">
              {LOCATION_ICONS[meeting.locationType]} {meeting.locationType}
            </span>
            {meeting.privacy === 'PRIVATE' && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-600">
                <Lock className="h-3 w-3" /> Private
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black flex-shrink-0 bg-white">
          <TabBtn tab="info" label="Info" />
          <TabBtn tab="agenda" label="Agenda" />
          <TabBtn tab="notes" label="Notes" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── INFO ── */}
          {activeTab === 'info' && (
            <div className="p-5 space-y-5">
              {/* Time */}
              <div className="flex items-start gap-3 p-4 bg-white border-2 border-black rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <CalendarDays className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-black text-sm">{startDate ? format(startDate, "EEEE, MMMM d, yyyy") : '—'}</p>
                  <p className="font-bold text-xs text-gray-500 mt-0.5">
                    {startDate ? formatTime12h(startDate) : ''} — {endDate ? formatTime12h(endDate) : ''} · {meeting.duration} min
                  </p>
                </div>
              </div>

              {/* Location / URL */}
              {(meeting.meetingUrl || meeting.location) && (
                <div className="p-4 bg-white border-2 border-black rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {meeting.meetingUrl && (
                    <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-black text-blue-700 underline hover:text-blue-900">
                      <Video className="h-4 w-4 flex-shrink-0" /> {meeting.meetingUrl}
                    </a>
                  )}
                  {meeting.location && (
                    <p className="flex items-center gap-2 text-sm font-bold mt-1">
                      <MapPin className="h-4 w-4" /> {meeting.location}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              {meeting.description && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">About</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">{meeting.description}</p>
                </div>
              )}

              {/* Participants */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Participants ({meeting.participants?.length || 0})
                </p>
                <div className="space-y-1.5">
                  {meeting.participants?.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-white border-2 border-black rounded-base text-xs font-bold">
                      <span className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {formatUserHandle(p.userId)}
                        {p.userId === meeting.organizerId && <span className="bg-main text-black text-[8px] font-black px-1.5 rounded">HOST</span>}
                      </span>
                      <span className="text-gray-400 uppercase text-[9px]">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RSVP */}
              {isUpcoming && meeting.status !== 'CANCELED' && !isOrganizer && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your RSVP</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRsvp('ATTENDING')} className={`flex-1 font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rsvpStatus === 'ATTENDING' ? 'bg-emerald-400' : ''}`}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Going
                    </Button>
                    <Button size="sm" onClick={() => handleRsvp('MAYBE')} variant="neutral" className={`flex-1 font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rsvpStatus === 'MAYBE' ? 'bg-amber-200' : ''}`}>
                      <Minus className="h-3.5 w-3.5 mr-1" /> Maybe
                    </Button>
                    <Button size="sm" onClick={() => handleRsvp('NOT_ATTENDING')} variant="neutral" className={`flex-1 font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rsvpStatus === 'NOT_ATTENDING' ? 'bg-red-100' : ''}`}>
                      <X className="h-3.5 w-3.5 mr-1" /> Can't go
                    </Button>
                  </div>
                </div>
              )}

              {/* Attendance */}
              {(isLive || meeting.status === 'IN_PROGRESS') && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => hooks.checkIn(meeting.id)} className="flex-1 font-black text-xs border-2 border-black bg-emerald-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <LogIn className="h-3.5 w-3.5 mr-1" /> Check In
                  </Button>
                  <Button size="sm" onClick={() => hooks.checkOut(meeting.id)} variant="neutral" className="flex-1 font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <LogOut className="h-3.5 w-3.5 mr-1" /> Check Out
                  </Button>
                </div>
              )}

              {/* Join Link */}
              {meeting.meetingUrl && isUpcoming && (
                <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Video className="h-4 w-4 mr-2" /> Join Meeting
                  </Button>
                </a>
              )}

              {/* Cancel (organizer) */}
              {isOrganizer && meeting.status === 'SCHEDULED' && (
                <Button variant="neutral" size="sm" onClick={() => hooks.cancelMeeting(meeting.id).then(onClose)} className="w-full font-black text-xs border-2 border-red-500 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancel Meeting
                </Button>
              )}
            </div>
          )}

          {/* ── AGENDA ── */}
          {activeTab === 'agenda' && (
            <div className="p-5 space-y-4">
              {isOrganizer && (
                <div className="flex gap-2">
                  <input className="flex-1 p-2 border-2 border-black rounded-base font-bold text-sm bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none" placeholder="Add agenda item..." value={newAgendaTitle} onChange={e => setNewAgendaTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddAgenda()} />
                  <Button size="sm" onClick={handleAddAgenda} className="font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {loadingData ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded-base" />)}</div>
              ) : agendaItems.length === 0 ? (
                <div className="text-center py-10 font-bold text-gray-400 text-xs uppercase tracking-widest">
                  No agenda items yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {agendaItems.map((item, idx) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-white border-2 border-black rounded-base">
                      <span className="w-6 h-6 bg-main border-2 border-black rounded-base flex items-center justify-center font-black text-xs flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1">
                        <p className="font-black text-sm">{item.title}</p>
                        {item.description && <p className="text-xs font-bold text-gray-500 mt-0.5">{item.description}</p>}
                        {item.duration && <p className="text-[9px] font-black text-gray-400 mt-1 uppercase">{item.duration} min</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── NOTES ── */}
          {activeTab === 'notes' && (
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <textarea className="w-full p-2.5 border-2 border-black rounded-base font-bold text-sm bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none resize-none" rows={3} placeholder="Write a note or action item..." value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isActionItem} onChange={e => setIsActionItem(e.target.checked)} className="w-4 h-4 border-2 border-black rounded" />
                    <span className="text-xs font-black uppercase tracking-wider">Action Item</span>
                  </label>
                  <Button size="sm" onClick={handleAddNote} disabled={!newNoteContent.trim()} className="font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                    <Save className="h-3.5 w-3.5 mr-1" /> Save Note
                  </Button>
                </div>
              </div>
              {loadingData ? (
                <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16 rounded-base" />)}</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-10 font-bold text-gray-400 text-xs uppercase tracking-widest">No notes yet.</div>
              ) : (
                <div className="space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className={`p-3 border-2 border-black rounded-base ${note.isActionItem ? 'bg-amber-50' : 'bg-white'}`}>
                      {note.isActionItem && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-amber-400 text-black px-1.5 py-0.5 rounded mb-1">
                          <ListChecks className="h-2.5 w-2.5" /> Action Item
                        </span>
                      )}
                      <p className="text-sm font-bold text-gray-700">{note.content}</p>
                      <p className="text-[9px] text-gray-400 font-bold mt-1">Written by {formatUserHandle(note.authorId)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Calendar Page ───────────────────────────────────────────────────────

export default function CalendarPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const hooks = useMeetings();
  const { meetings, upcomingMeetings, isLoading, error } = hooks;

  const { community } = useCurrentCommunity();
  const isFounder = community?.founderId === currentUserId;
  // Organizers can also create meetings in a community context
  const canManageMeetings = isFounder; 

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [view, setView] = useState<'month' | 'list'>('month');

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun

  // Group meetings by date string.
  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    meetings.forEach(m => {
      const key = format(parseISO(m.startTime), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [meetings]);

  // Meetings on selected date
  const selectedDayMeetings = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return meetingsByDate[key] || [];
  }, [selectedDate, meetingsByDate]);

  const handleCreateMeeting = async (data: any) => {
    await hooks.createMeeting(data);
    setIsCreateOpen(false);
  };

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const MeetingChip = ({ meeting }: { meeting: Meeting }) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-500 text-white',
      IN_PROGRESS: 'bg-amber-500 text-black',
      COMPLETED: 'bg-emerald-600 text-white',
      CANCELED: 'bg-gray-400 text-white',
    };
    return (
      <div
        onClick={(e) => { e.stopPropagation(); setSelectedMeeting(meeting); }}
        className={`text-[9px] font-black truncate px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${colors[meeting.status]}`}
      >
        {formatTime12h(parseISO(meeting.startTime))} {meeting.title}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-24 font-base">

      {error && (
        <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-red-400 p-6 rounded-base relative overflow-hidden mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-black uppercase text-xl leading-none mb-1 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Calendar Incident</h3>
              <p className="font-bold uppercase text-xs tracking-widest text-black/80">{error}</p>
            </div>
            <button onClick={() => hooks.fetchMyMeetings()} className="bg-white border-2 border-black p-2 rounded-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tighter text-white mb-4" style={{ WebkitTextStroke: '2px black' }}>
            CALENDAR
          </h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-main border-2 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
              Total: {meetings.length} Meetings
            </div>
            <div className="bg-white border-2 border-black px-4 py-2 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
              Upcoming: {upcomingMeetings.length}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex border-2 border-black rounded-base overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <button onClick={() => setView('month')} className={`px-4 py-2 font-black text-xs uppercase tracking-wider transition-all ${view === 'month' ? 'bg-main' : 'bg-white hover:bg-gray-50'}`}>
              Month
            </button>
            <button onClick={() => setView('list')} className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-l-2 border-black transition-all ${view === 'list' ? 'bg-main' : 'bg-white hover:bg-gray-50'}`}>
              List
            </button>
          </div>
          {canManageMeetings && (
            <Button onClick={() => setIsCreateOpen(true)} className="h-10 px-6 font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <PlusCircle className="h-5 w-5 mr-2" /> New Meeting
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Calendar / List */}
        <div className="lg:col-span-8">

          {view === 'month' ? (
            /* ── MONTH VIEW ── */
            <div className="bg-white border-4 border-black rounded-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              {/* Nav */}
              <div className="flex items-center justify-between p-4 border-b-4 border-black bg-main/10">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-black/10 rounded-base border-2 border-black transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="font-black uppercase text-lg tracking-tighter">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-black/10 rounded-base border-2 border-black transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 border-b-2 border-black">
                {DAY_LABELS.map(d => (
                  <div key={d} className="p-2 text-center font-black text-[10px] uppercase tracking-widest border-r-2 border-black last:border-r-0 bg-gray-50">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7">
                {/* Empty leading cells */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] border-r-2 border-b-2 border-black bg-gray-50/50" />
                ))}

                {calendarDays.map(day => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayMeetings = meetingsByDate[key] || [];
                  const isSel = selectedDate && isSameDay(day, selectedDate);
                  const isTod = isToday(day);
                  const isPast_ = isBefore(day, new Date()) && !isToday(day);

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[90px] p-1.5 border-r-2 border-b-2 border-black cursor-pointer transition-colors last:border-r-0 ${isSel ? 'bg-main/30' : 'hover:bg-main/10'} ${isPast_ ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full font-black text-sm mb-1 ${isTod ? 'bg-black text-white' : 'text-black'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {dayMeetings.slice(0, 3).map(m => (
                          <MeetingChip key={m.id} meeting={m} />
                        ))}
                        {dayMeetings.length > 3 && (
                          <div className="text-[8px] font-black text-gray-500 pl-1">+{dayMeetings.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="bg-white border-4 border-black rounded-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 border-b-4 border-black bg-main/10">
                <h2 className="font-black uppercase tracking-tighter">All Meetings</h2>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-base" />)}</div>
              ) : meetings.length === 0 ? (
                <div className="flex flex-col items-center py-16">
                  <CalendarDays className="h-10 w-10 text-black/10 mb-4" />
                  <p className="font-black text-gray-400 uppercase text-xs tracking-widest">No meetings scheduled</p>
                </div>
              ) : (
                [...meetings]
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map(meeting => {
                    const start = parseISO(meeting.startTime);
                    const end = addMinutes(start, meeting.duration || 60);
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => setSelectedMeeting(meeting)}
                        className="flex items-center gap-4 px-5 py-4 border-b-2 border-black last:border-b-0 hover:bg-main/10 cursor-pointer transition-colors group"
                      >
                        <div className="w-12 text-center flex-shrink-0">
                          <p className="font-black text-lg leading-none">{format(start, 'd')}</p>
                          <p className="font-bold text-[10px] text-gray-400 uppercase">{format(start, 'MMM')}</p>
                        </div>
                        <div className="w-px h-10 bg-black/20 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm">{meeting.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatTime12h(start)} – {formatTime12h(end)} · {meeting.duration}min
                            {LOCATION_ICONS[meeting.locationType]}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 border-2 font-bold text-[9px] uppercase rounded-base flex-shrink-0 ${STATUS_STYLES[meeting.status]}`}>
                          {meeting.status}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-black" />
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">

          {/* Selected Day Meetings */}
          {view === 'month' && selectedDate && (
            <div className="bg-white border-4 border-black rounded-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-4 border-b-4 border-black bg-main/10 flex items-center justify-between">
                <h3 className="font-black uppercase text-sm">
                  {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
                </h3>
                <button
                  onClick={() => { setIsCreateOpen(true); }}
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title="New meeting on this day"
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>
              <div className="divide-y-2 divide-black">
                {selectedDayMeetings.length === 0 ? (
                  <div className="p-6 text-center font-bold text-gray-400 text-xs uppercase tracking-widest">
                    No meetings on this day.
                  </div>
                ) : (
                  selectedDayMeetings
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map(m => {
                      const start = parseISO(m.startTime);
                      const end = addMinutes(start, m.duration || 60);
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMeeting(m)}
                          className="p-4 hover:bg-main/10 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm">{m.title}</p>
                              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                {formatTime12h(start)} – {formatTime12h(end)}
                              </p>
                            </div>
                            <span className={`px-1.5 py-0.5 border-2 font-bold text-[8px] uppercase rounded-base flex-shrink-0 ${STATUS_STYLES[m.status]}`}>
                              {m.status}
                            </span>
                          </div>
                          {m.participants && m.participants.length > 0 && (
                            <p className="text-[9px] font-black text-gray-400 mt-1 flex items-center gap-1">
                              <Users className="h-2.5 w-2.5" /> {m.participants.length} participants
                            </p>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* Upcoming Meetings */}
          <div className="bg-white border-4 border-black rounded-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-4 border-b-4 border-black bg-gray-50 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              <h3 className="font-black uppercase text-sm">Upcoming</h3>
            </div>
            <div className="p-3 space-y-2">
              {isLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-base" />)
              ) : upcomingMeetings.length === 0 ? (
                <div className="py-8 text-center font-bold text-gray-400 text-xs uppercase tracking-widest">
                  No upcoming meetings
                </div>
              ) : (
                upcomingMeetings.slice(0, 5).map(m => {
                  const start = parseISO(m.startTime);
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      className="flex items-center gap-3 p-3 border-2 border-black rounded-base hover:bg-main/10 cursor-pointer transition-colors"
                    >
                      <div className="w-9 h-9 bg-main border-2 border-black rounded-base flex flex-col items-center justify-center flex-shrink-0">
                        <span className="font-black text-xs leading-none">{format(start, 'd')}</span>
                        <span className="font-bold text-[8px] uppercase">{format(start, 'MMM')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs truncate">{m.title}</p>
                        <p className="text-[9px] font-bold text-gray-400">{formatTime12h(start)} · {m.duration}min</p>
                      </div>
                      {m.meetingUrl && <Video className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateOpen && (
        <CreateMeetingModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateMeeting}
          defaultDate={selectedDate || undefined}
        />
      )}

      {selectedMeeting && (
        <MeetingDetailPanel
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          currentUserId={currentUserId}
          hooks={hooks}
        />
      )}
    </div>
  );
}
