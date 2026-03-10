import { create } from 'zustand';
interface EditorStore {
  playheadPosition: number;
  isPlaying: boolean;
  zoom: number;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  activePanel: 'effects' | 'color' | 'audio' | 'transform' | null;
  setPlayhead: (ms: number) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  selectClip: (trackId: string | null, clipId: string | null) => void;
  setActivePanel: (panel: EditorStore['activePanel']) => void;
}
export const useEditorStore = create<EditorStore>((set) => ({
  playheadPosition: 0,
  isPlaying: false,
  zoom: 1,
  selectedClipId: null,
  selectedTrackId: null,
  activePanel: null,
  setPlayhead: (ms) => set({ playheadPosition: ms }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoom }),
  selectClip: (trackId, clipId) => set({ selectedTrackId: trackId, selectedClipId: clipId }),
  setActivePanel: (panel) => set({ activePanel: panel }),
}));