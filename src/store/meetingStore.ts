import { create } from 'zustand';
import { Meeting } from '@/types';

interface MeetingStore {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API calls
  fetchMeetings: (clubId?: string, userId?: string) => Promise<void>;
  fetchMeetingById: (id: string) => Promise<void>;
  updateMeetingResponse: (meetingId: string, response: 'accepted' | 'declined') => Promise<void>;
}

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  meetings: [],
  isLoading: false,
  error: null,

  setMeetings: (meetings) => set({ meetings }),
  
  addMeeting: (meeting) => set((state) => ({ 
    meetings: [...state.meetings, meeting] 
  })),
  
  updateMeeting: (id, updates) => set((state) => ({
    meetings: state.meetings.map(meeting => 
      meeting.id === id ? { ...meeting, ...updates } : meeting
    )
  })),
  
  deleteMeeting: (id) => set((state) => ({
    meetings: state.meetings.filter(meeting => meeting.id !== id)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchMeetings: async (clubId?: string, userId?: string) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (clubId) params.append('clubId', clubId);
      if (userId) params.append('userId', userId);
      
      const response = await fetch(`/api/meetings?${params}`);
      const result = await response.json();
      
      if (result.success) {
        set({ meetings: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Toplantılar yüklenemedi', isLoading: false });
    }
  },

  fetchMeetingById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/meetings/${id}`);
      const result = await response.json();
      
      if (result.success) {
        set((state) => ({
          meetings: state.meetings.map(m => 
            m.id === id ? result.data : m
          ),
          isLoading: false
        }));
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Toplantı bilgileri yüklenemedi', isLoading: false });
    }
  },

  updateMeetingResponse: async (meetingId: string, response: 'accepted' | 'declined') => {
    try {
      const apiResponse = await fetch(`/api/meetings/${meetingId}/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        // Update local state
        set((state) => ({
          meetings: state.meetings.map(meeting => {
            if (meeting.id === meetingId) {
              return {
                ...meeting,
                participants: meeting.participants.map(p => 
                  p.userId === result.data.userId 
                    ? { ...p, response } 
                    : p
                )
              };
            }
            return meeting;
          })
        }));
      } else {
        set({ error: result.error });
      }
    } catch (error) {
      set({ error: 'Yanıt güncellenemedi' });
    }
  },
}));