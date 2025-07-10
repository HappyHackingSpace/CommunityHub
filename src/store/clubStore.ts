import { create } from 'zustand';
import { Club } from '@/types';

interface ClubStore {
  clubs: Club[];
  currentClub: Club | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setClubs: (clubs: Club[]) => void;
  setCurrentClub: (club: Club | null) => void;
  addClub: (club: Club) => void;
  updateClub: (id: string, updates: Partial<Club>) => void;
  deleteClub: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchClubs: () => Promise<void>;
  fetchClubById: (id: string) => Promise<void>;
}

export const useClubStore = create<ClubStore>((set, get) => ({
  clubs: [],
  currentClub: null,
  isLoading: false,
  error: null,

  setClubs: (clubs) => set({ clubs }),
  setCurrentClub: (club) => set({ currentClub: club }),
  
  addClub: (club) => set((state) => ({ 
    clubs: [...state.clubs, club] 
  })),
  
  updateClub: (id, updates) => set((state) => ({
    clubs: state.clubs.map(club => 
      club.id === id ? { ...club, ...updates } : club
    ),
    currentClub: state.currentClub?.id === id 
      ? { ...state.currentClub, ...updates }
      : state.currentClub
  })),
  
  deleteClub: (id) => set((state) => ({
    clubs: state.clubs.filter(club => club.id !== id),
    currentClub: state.currentClub?.id === id ? null : state.currentClub
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchClubs: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/clubs');
      const result = await response.json();
      
      if (result.success) {
        set({ clubs: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Kulüpler yüklenemedi', isLoading: false });
    }
  },

  fetchClubById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/clubs/${id}`);
      const result = await response.json();
      
      if (result.success) {
        set({ currentClub: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Kulüp bilgileri yüklenemedi', isLoading: false });
    }
  },
}));