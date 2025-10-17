import { create } from 'zustand';
import { ApiState, ApiStatus } from './types';

interface ApiStoreState {
  requests: Map<string, ApiState>;

  // Actions
  setLoading: (key: string) => void;
  setSuccess: <T>(key: string, data: T) => void;
  setError: (key: string, error: string) => void;
  reset: (key: string) => void;
  clearAll: () => void;

  // Getters
  getState: (key: string) => ApiState;
  getStatus: (key: string) => ApiStatus;
}

const initialApiState: ApiState = {
  data: null,
  loading: false,
  error: null,
  timestamp: null,
};

export const useApiStore = create<ApiStoreState>((set, get) => ({
  requests: new Map(),

  setLoading: (key: string) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      newRequests.set(key, {
        data: null,
        loading: true,
        error: null,
        timestamp: Date.now(),
      });
      return { requests: newRequests };
    });
  },

  setSuccess: <T,>(key: string, data: T) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      newRequests.set(key, {
        data,
        loading: false,
        error: null,
        timestamp: Date.now(),
      });
      return { requests: newRequests };
    });
  },

  setError: (key: string, error: string) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      newRequests.set(key, {
        data: null,
        loading: false,
        error,
        timestamp: Date.now(),
      });
      return { requests: newRequests };
    });
  },

  reset: (key: string) => {
    set((state) => {
      const newRequests = new Map(state.requests);
      newRequests.set(key, initialApiState);
      return { requests: newRequests };
    });
  },

  clearAll: () => {
    set({ requests: new Map() });
  },

  getState: (key: string) => {
    return get().requests.get(key) || initialApiState;
  },

  getStatus: (key: string) => {
    const state = get().requests.get(key) || initialApiState;
    if (state.loading) return 'loading';
    if (state.error) return 'error';
    if (state.data !== null) return 'success';
    return 'idle';
  },
}));
