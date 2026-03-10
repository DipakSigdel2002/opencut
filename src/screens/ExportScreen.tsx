import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore } from '../store/settingsStore';
import { ExportSettings } from '../types/index';
export default function ExportScreen() {
  const navigation = useNavigation();
  const { currentProject } = useProjectStore();
  const { defaultExportSettings, setExportSettings } = useSettingsStore();
  const [settings, setSettings] = useState<ExportSettings>(defaultExportSettings);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleExport = async () => {
    if (!currentProject) { Alert.alert('No project loaded'); return; }
    setExporting(true); setProgress(0);
    setExportSettings(settings);
    const outputPath = '/storage/emulated/0/Movies/OpenCut_' + Date.now() + '.mp4';
    const { exportProject } = await import('../engine/exporter');
    const result = await exportProject(currentProject, settings, outputPath, ({ percentage }) => setProgress(percentage));
    setExporting(false);
    if (result.success) { Alert.alert('Export Complete', 'Video saved to:\n' + outputPath); }
    else { Alert.alert('Export Failed', result.error || 'Unknown error'); }
  };
  const Option = ({ label, options, value, onSelect }: { label: string; options: string[]; value: string; onSelect: (v: string) => void }) => (
    <View style={s.optionRow}>
      <Text style={s.optionLabel}>{label}</Text>
      <View style={s.optionBtns}>
        {options.map(opt => (
          <TouchableOpacity key={opt} style={[s.optionBtn, value === opt && s.optionBtnActive]} onPress={() => onSelect(opt)}>
            <Text style={[s.optionBtnText, value === opt && s.optionBtnTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Export</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Export Settings</Text>
        <Option label='Resolution' options={['480p','720p','1080p','4K']} value={settings.resolution} onSelect={v => setSettings({ ...settings, resolution: v as ExportSettings['resolution'] })} />
        <Option label='Frame Rate' options={['24','30','60']} value={String(settings.fps)} onSelect={v => setSettings({ ...settings, fps: parseInt(v) as ExportSettings['fps'] })} />
        <Option label='Format' options={['mp4','webm']} value={settings.format} onSelect={v => setSettings({ ...settings, format: v as ExportSettings['format'] })} />
        <Option label='Quality' options={['low','medium','high']} value={settings.quality} onSelect={v => setSettings({ ...settings, quality: v as ExportSettings['quality'] })} />
      </View>
      {currentProject && (
        <View style={s.infoBox}>
          <Text style={s.infoText}>Project: {currentProject.name}</Text>
          <Text style={s.infoText}>Duration: {(currentProject.duration / 1000).toFixed(1)}s</Text>
          <Text style={s.infoText}>Canvas: {currentProject.width}x{currentProject.height}</Text>
        </View>
      )}
      {exporting && (
        <View style={s.progressBox}>
          <ActivityIndicator color='#ff4d4d' size='small' />
          <Text style={s.progressText}>Exporting... {progress}%</Text>
          <View style={s.progressBar}><View style={[s.progressFill, { width: (progress as any) }]} /></View>
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtn: { color: '#aaa', fontSize: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  section: { margin: 16, backgroundColor: '#111', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  sectionTitle: { color: '#ff4d4d', fontSize: 13, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  optionRow: { marginBottom: 16 },
  optionLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  optionBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#1a1a1a' },
  optionBtnActive: { borderColor: '#ff4d4d', backgroundColor: '#ff4d4d22' },
  optionBtnText: { color: '#666', fontSize: 13 },
  optionBtnTextActive: { color: '#ff4d4d', fontWeight: '700' },
  infoBox: { marginHorizontal: 16, backgroundColor: '#111', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222', gap: 4 },
  infoText: { color: '#555', fontSize: 13 },
  progressBox: { margin: 16, backgroundColor: '#111', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222', alignItems: 'center', gap: 8 },
  progressText: { color: '#fff', fontSize: 14 },
  progressBar: { width: '100%', height: 4, backgroundColor: '#222', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ff4d4d', borderRadius: 2 },
  exportBtn: { margin: 16, backgroundColor: '#ff4d4d', borderRadius: 12, padding: 18, alignItems: 'center' },
  exportBtnDisabled: { opacity: 0.5 },
  exportBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});