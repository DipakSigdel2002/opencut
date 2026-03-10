export type MediaType = 'video' | 'audio' | 'image';
export interface MediaAsset {
  id: string; uri: string; type: MediaType; name: string;
  duration: number; width?: number; height?: number;
}
export interface Keyframe { time: number; value: number; }
export interface ClipTransform {
  x: number; y: number; scaleX: number; scaleY: number;
  rotation: number; opacity: number;
}
export interface Clip {
  id: string; assetId: string; trackId: string;
  startTime: number; duration: number;
  trimStart: number; trimEnd: number;
  transform: ClipTransform; volume: number; speed: number;
  keyframes: {
    opacity?: Keyframe[]; volume?: Keyframe[];
    x?: Keyframe[]; y?: Keyframe[];
    scaleX?: Keyframe[]; scaleY?: Keyframe[];
  };
}
export type TrackType = 'video' | 'audio' | 'overlay';
export interface Track {
  id: string; type: TrackType; name: string;
  clips: Clip[]; muted: boolean; locked: boolean; volume: number;
}
export interface Project {
  id: string; name: string; createdAt: number; updatedAt: number;
  duration: number; fps: number; width: number; height: number;
  tracks: Track[]; assets: MediaAsset[];
}
export interface ExportSettings {
  resolution: '480p' | '720p' | '1080p' | '4K';
  fps: 24 | 30 | 60;
  format: 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high';
}