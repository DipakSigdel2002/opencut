import { create } from 'zustand';
import { Project, Track, Clip, MediaAsset } from '../types/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Project;
  openProject: (id: string) => void;
  saveCurrentProject: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addAsset: (asset: MediaAsset) => void;
  addTrack: (type: Track['type']) => void;
  addClip: (trackId: string, clip: Clip) => void;
  updateClip: (trackId: string, clipId: string, changes: Partial<Clip>) => void;
  deleteClip: (trackId: string, clipId: string) => void;
  splitClip: (trackId: string, clipId: string, atTime: number) => void;
}
const generateId = () => Math.random().toString(36).substr(2, 9);
const defaultProject = (name: string): Project => ({
  id: generateId(), name,
  createdAt: Date.now(), updatedAt: Date.now(),
  duration: 0, fps: 30, width: 1920, height: 1080,
  tracks: [], assets: [],
});
export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loadProjects: async () => {
    const raw = await AsyncStorage.getItem('opencut_projects');
    if (raw) set({ projects: JSON.parse(raw) });
  },
  createProject: (name: string) => {
    const project = defaultProject(name);
    const updated = [...get().projects, project];
    set({ projects: updated, currentProject: project });
    AsyncStorage.setItem('opencut_projects', JSON.stringify(updated));
    return project;
  },
  openProject: (id: string) => {
    const project = get().projects.find(p => p.id === id) || null;
    set({ currentProject: project });
  },
  saveCurrentProject: async () => {
    const { currentProject, projects } = get();
    if (!currentProject) return;
    const updated = projects.map(p => p.id === currentProject.id ? { ...currentProject, updatedAt: Date.now() } : p);
    set({ projects: updated });
    await AsyncStorage.setItem('opencut_projects', JSON.stringify(updated));
  },
  deleteProject: async (id: string) => {
    const updated = get().projects.filter(p => p.id !== id);
    set({ projects: updated });
    await AsyncStorage.setItem('opencut_projects', JSON.stringify(updated));
  },
  addAsset: (asset: MediaAsset) => {
    const { currentProject } = get();
    if (!currentProject) return;
    set({ currentProject: { ...currentProject, assets: [...currentProject.assets, asset] } });
  },
  addTrack: (type: Track['type']) => {
    const { currentProject } = get();
    if (!currentProject) return;
    const track: Track = { id: generateId(), type, name: type + ' track', clips: [], muted: false, locked: false, volume: 1 };
    set({ currentProject: { ...currentProject, tracks: [...currentProject.tracks, track] } });
  },
  addClip: (trackId: string, clip: Clip) => {
    const { currentProject } = get();
    if (!currentProject) return;
    set({ currentProject: { ...currentProject, tracks: currentProject.tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t) } });
  },
  updateClip: (trackId, clipId, changes) => {
    const { currentProject } = get();
    if (!currentProject) return;
    set({ currentProject: { ...currentProject, tracks: currentProject.tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, ...changes } : c) } : t) } });
  },
  deleteClip: (trackId, clipId) => {
    const { currentProject } = get();
    if (!currentProject) return;
    set({ currentProject: { ...currentProject, tracks: currentProject.tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.filter(c => c.id !== clipId) } : t) } });
  },
  splitClip: (trackId, clipId, atTime) => {
    const { currentProject, updateClip, addClip } = get();
    if (!currentProject) return;
    const track = currentProject.tracks.find(t => t.id === trackId);
    const clip = track?.clips.find(c => c.id === clipId);
    if (!clip) return;
    const splitPoint = atTime - clip.startTime;
    updateClip(trackId, clipId, { duration: splitPoint });
    const newClip: Clip = { ...clip, id: generateId(), startTime: atTime, duration: clip.duration - splitPoint, trimStart: clip.trimStart + splitPoint };
    addClip(trackId, newClip);
  },
}));