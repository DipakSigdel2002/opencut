import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useProjectStore } from '../store/projectStore';
import { useEditorStore } from '../store/editorStore';
import { Clip, Track } from '../types/index';
type EditorNav = NativeStackNavigationProp<RootStackParamList, 'Editor'>;
type EditorRoute = RouteProp<RootStackParamList, 'Editor'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_HEIGHT = 60;
const PIXELS_PER_SECOND = 80;
export default function EditorScreen() {
  const navigation = useNavigation<EditorNav>();
  useRoute<EditorRoute>();
  const { currentProject, addTrack, deleteClip, splitClip, saveCurrentProject } = useProjectStore();
  const { playheadPosition, isPlaying, zoom, selectedClipId, selectedTrackId, setPlaying, setZoom, selectClip } = useEditorStore();
  const timelineRef = useRef<ScrollView>(null);
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const msToPixels = (ms: number) => (ms / 1000) * PIXELS_PER_SECOND * zoom;
  const totalDurationMs = currentProject?.duration || 10000;
  const totalWidth = msToPixels(totalDurationMs) + SCREEN_WIDTH;
  const handleSplit = () => {
    if (!selectedTrackId || !selectedClipId) { Alert.alert('Select a clip first'); return; }
    splitClip(selectedTrackId, selectedClipId, playheadPosition);
  };
  const handleDelete = () => {
    if (!selectedTrackId || !selectedClipId) { Alert.alert('Select a clip first'); return; }
    deleteClip(selectedTrackId, selectedClipId);
    selectClip(null, null);
  };
  const handleSave = async () => { await saveCurrentProject(); Alert.alert('Saved!'); };
  const renderClip = (track: Track, clip: Clip) => {
    const isSelected = selectedClipId === clip.id && selectedTrackId === track.id;
    const left = msToPixels(clip.startTime);
    const width = Math.max(msToPixels(clip.duration), 40);
    return (
      <TouchableOpacity key={clip.id}
        style={[s.clip, track.type === 'video' && s.clipVideo, track.type === 'audio' && s.clipAudio, track.type === 'overlay' && s.clipOverlay, isSelected && s.clipSelected, { left, width }]}
        onPress={() => selectClip(track.id, clip.id)}>
        <Text style={s.clipLabel} numberOfLines={1}>{clip.id.slice(0, 6)}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.topBtn}>
          <Text style={s.topBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.projectTitle} numberOfLines={1}>{currentProject?.name || 'OpenCut'}</Text>
        <View style={s.topRight}>
          <TouchableOpacity onPress={handleSave} style={s.topBtn}><Text style={s.topBtnText}>Save</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Export')} style={s.exportBtn}>
            <Text style={s.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.preview}>
        <Text style={s.previewText}>{currentProject ? currentProject.width + ' x ' + currentProject.height + ' · ' + currentProject.fps + 'fps' : 'No project loaded'}</Text>
        <Text style={s.previewTimecode}>{new Date(playheadPosition).toISOString().substr(11, 11)}</Text>
      </View>
      <View style={s.toolbar}>
        <TouchableOpacity style={s.toolBtn} onPress={() => setPlaying(!isPlaying)}><Text style={s.toolBtnText}>{isPlaying ? '⏸' : '▶'}</Text></TouchableOpacity>
        <TouchableOpacity style={s.toolBtn} onPress={handleSplit}><Text style={s.toolBtnText}>✂</Text></TouchableOpacity>
        <TouchableOpacity style={s.toolBtn} onPress={handleDelete}><Text style={s.toolBtnText}>🗑</Text></TouchableOpacity>
        <TouchableOpacity style={s.toolBtn} onPress={() => setZoom(Math.min(zoom + 0.5, 5))}><Text style={s.toolBtnText}>+</Text></TouchableOpacity>
        <TouchableOpacity style={s.toolBtn} onPress={() => setZoom(Math.max(zoom - 0.5, 0.5))}><Text style={s.toolBtnText}>−</Text></TouchableOpacity>
        <TouchableOpacity style={s.toolBtn} onPress={() => setShowTrackMenu(!showTrackMenu)}><Text style={s.toolBtnText}>+ Track</Text></TouchableOpacity>
      </View>
      {showTrackMenu && (
        <View style={s.trackMenu}>
          {(['video', 'audio', 'overlay'] as Track['type'][]).map(type => (
            <TouchableOpacity key={type} style={s.trackMenuBtn} onPress={() => { addTrack(type); setShowTrackMenu(false); }}>
              <Text style={s.trackMenuText}>+ {type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={s.timeline}>
        {currentProject?.tracks.length === 0 && (
          <View style={s.emptyTimeline}>
            <Text style={s.emptyTimelineText}>Tap + Track to add your first track</Text>
          </View>
        )}
        {currentProject?.tracks.map(track => (
          <View key={track.id} style={s.trackRow}>
            <View style={s.trackLabel}>
              <Text style={s.trackLabelText} numberOfLines={1}>{track.name}</Text>
            </View>
            <ScrollView ref={timelineRef} horizontal showsHorizontalScrollIndicator={false} style={s.trackClips}>
              <View style={{ width: totalWidth, height: TIMELINE_HEIGHT }}>
                <View style={[s.playhead, { left: msToPixels(playheadPosition) }]} />
                {track.clips.map(clip => renderClip(track, clip))}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, paddingHorizontal: 12, paddingBottom: 10, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#222' },
  topBtn: { padding: 8 },
  topBtnText: { color: '#aaa', fontSize: 14 },
  projectTitle: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exportBtn: { backgroundColor: '#ff4d4d', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  preview: { height: 200, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  previewText: { color: '#555', fontSize: 13 },
  previewTimecode: { color: '#ff4d4d', fontSize: 22, fontWeight: '800', marginTop: 8 },
  toolbar: { flexDirection: 'row', backgroundColor: '#111', paddingVertical: 8, paddingHorizontal: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  toolBtn: { backgroundColor: '#1e1e1e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  toolBtnText: { color: '#fff', fontSize: 16 },
  trackMenu: { backgroundColor: '#161616', borderBottomWidth: 1, borderBottomColor: '#222', paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', gap: 8 },
  trackMenuBtn: { backgroundColor: '#1e1e1e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  trackMenuText: { color: '#aaa', fontSize: 13 },
  timeline: { flex: 1, backgroundColor: '#0d0d0d' },
  emptyTimeline: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTimelineText: { color: '#333', fontSize: 14, textAlign: 'center' },
  trackRow: { flexDirection: 'row', height: TIMELINE_HEIGHT + 2, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  trackLabel: { width: 70, backgroundColor: '#111', justifyContent: 'center', paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: '#222' },
  trackLabelText: { color: '#666', fontSize: 11 },
  trackClips: { flex: 1 },
  clip: { position: 'absolute', height: TIMELINE_HEIGHT - 8, top: 4, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 6, borderWidth: 1 },
  clipVideo: { backgroundColor: '#1a3a5c', borderColor: '#2a6aaa' },
  clipAudio: { backgroundColor: '#1a3a1a', borderColor: '#2a8a2a' },
  clipOverlay: { backgroundColor: '#3a1a3a', borderColor: '#8a2a8a' },
  clipSelected: { borderColor: '#ff4d4d', borderWidth: 2 },
  clipLabel: { color: '#fff', fontSize: 10 },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#ff4d4d', zIndex: 10 },
});