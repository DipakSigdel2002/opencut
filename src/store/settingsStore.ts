import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExportSettings } from '../types/index';
interface SettingsStore {
  theme: 'dark' | 'light';
  defaultExportSettings: ExportSettings;
  loadSettings: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => void;
  setExportSettings: (settings: ExportSettings) => void;
}
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  theme: 'dark',
  defaultExportSettings: { resolution: '1080p', fps: 30, format: 'mp4', quality: 'high' },
  loadSettings: async () => {
    const raw = await AsyncStorage.getItem('opencut_settings');
    if (raw) set(JSON.parse(raw));
  },
  setTheme: (theme) => {
    set({ theme });
    AsyncStorage.setItem('opencut_settings', JSON.stringify(get()));
  },
  setExportSettings: (settings) => {
    set({ defaultExportSettings: settings });
    AsyncStorage.setItem('opencut_settings', JSON.stringify(get()));
  },
}));