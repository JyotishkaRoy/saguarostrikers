import { create } from 'zustand';
import type { Competition, SubEvent } from '@/types';
import { api } from '@/lib/api';

interface CompetitionState {
  competitions: Competition[];
  currentCompetition: Competition | null;
  subEvents: SubEvent[];
  isLoading: boolean;
  
  // Actions
  fetchCompetitions: () => Promise<void>;
  fetchPublicCompetitions: () => Promise<void>;
  fetchUpcomingCompetitions: () => Promise<void>;
  fetchCompetitionById: (id: string) => Promise<void>;
  fetchCompetitionBySlug: (slug: string) => Promise<void>;
  fetchSubEvents: (competitionId: string) => Promise<void>;
  clearCurrentCompetition: () => void;
}

export const useCompetitionStore = create<CompetitionState>((set) => ({
  competitions: [],
  currentCompetition: null,
  subEvents: [],
  isLoading: false,

  fetchCompetitions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Competition[]>('/admin/competitions');
      if (response.success && response.data) {
        set({ competitions: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPublicCompetitions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Competition[]>('/public/competitions');
      if (response.success && response.data) {
        set({ competitions: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUpcomingCompetitions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Competition[]>('/public/competitions/upcoming');
      if (response.success && response.data) {
        set({ competitions: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchCompetitionById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get<{
        competition: Competition;
        subEvents: SubEvent[];
      }>(`/public/competitions/${id}`);
      
      if (response.success && response.data) {
        set({
          currentCompetition: response.data.competition,
          subEvents: response.data.subEvents,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchCompetitionBySlug: async (slug: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get<Competition>(`/public/competitions/slug/${slug}`);
      if (response.success && response.data) {
        set({ currentCompetition: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchSubEvents: async (competitionId: string) => {
    try {
      const response = await api.get<SubEvent[]>(`/competitions/${competitionId}/sub-events`);
      if (response.success && response.data) {
        set({ subEvents: response.data });
      }
    } catch (error) {
      throw error;
    }
  },

  clearCurrentCompetition: () => {
    set({ currentCompetition: null, subEvents: [] });
  },
}));
