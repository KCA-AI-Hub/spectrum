// Global state types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  preferences: {
    itemsPerPage: number;
    defaultView: 'grid' | 'list';
  };
}

export interface ApiState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  timestamp: number | null;
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
