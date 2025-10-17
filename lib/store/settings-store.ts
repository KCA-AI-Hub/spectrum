import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from './types';

interface SettingsStoreState extends UserSettings {
  // Actions
  setTheme: (theme: UserSettings['theme']) => void;
  setLanguage: (language: UserSettings['language']) => void;
  updateNotifications: (notifications: Partial<UserSettings['notifications']>) => void;
  updatePreferences: (preferences: Partial<UserSettings['preferences']>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'ko',
  notifications: {
    email: true,
    push: true,
    sound: false,
  },
  preferences: {
    itemsPerPage: 20,
    defaultView: 'list',
  },
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      updateNotifications: (notifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifications },
        })),

      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'user-settings-storage',
    }
  )
);
