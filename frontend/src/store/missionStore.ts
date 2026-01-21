import { create } from 'zustand';
import type { Mission, SubEvent } from '@/types';
import { api } from '@/lib/api';

interface MissionState {
  missions: Mission[];
  currentMission: Mission | null;
  subEvents: SubEvent[];
  isLoading: boolean;
  
  // Actions
  fetchMissions: () => Promise<void>;
  fetchPublicMissions: () => Promise<void>;
  fetchUpcomingMissions: () => Promise<void>;
  fetchMissionById: (id: string) => Promise<void>;
  fetchMissionBySlug: (slug: string) => Promise<void>;
  fetchSubEvents: (missionId: string) => Promise<void>;
  clearCurrentMission: () => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  currentMission: null,
  subEvents: [],
  isLoading: false,

  fetchMissions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Mission[]>('/admin/missions');
      if (response.success && response.data) {
        set({ missions: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPublicMissions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Mission[]>('/public/missions');
      if (response.success && response.data) {
        set({ missions: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUpcomingMissions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Mission[]>('/public/missions/upcoming');
      if (response.success && response.data) {
        set({ missions: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMissionById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get<{
        mission: Mission;
        subEvents: SubEvent[];
      }>(`/public/missions/${id}`);
      
      if (response.success && response.data) {
        set({
          currentMission: response.data.mission,
          subEvents: response.data.subEvents,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMissionBySlug: async (slug: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get<Mission>(`/public/missions/slug/${slug}`);
      if (response.success && response.data) {
        set({ currentMission: response.data, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchSubEvents: async (missionId: string) => {
    try {
      const response = await api.get<SubEvent[]>(`/missions/${missionId}/sub-events`);
      if (response.success && response.data) {
        set({ subEvents: response.data });
      }
    } catch (error) {
      throw error;
    }
  },

  clearCurrentMission: () => {
    set({ currentMission: null, subEvents: [] });
  },
}));
