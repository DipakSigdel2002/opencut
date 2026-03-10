import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, Modal, TextInput, Alert, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types/index';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type TabType = 'home' | 'templates' | 'tutorials' | 'settings';

const { width: SW } = Dimensions.get('window');

const TEMPLATES = [
  { id: '1', label: 'Auto-Sync', sub: 'Beats-to-video', bg: '#ec489922', icon: 'lightning' },
  { id: '2', label: 'Vlog Prep', sub: 'Transitions ready', bg: '#10b98122', icon: 'video' },
  { id: '3', label: 'Cinematic', sub: 'LUT included', bg: '#f59e0b22', icon: 'star' },
  { id: '4', label: 'Reels/Shorts', sub: '9:16 vertical', bg: '#8b5cf622', icon: 'phone' },
];

const TABS: { key: TabType; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'templates', label: 'Templates' },
  { key: 'tutorials', label: 'Tutorials' },
  { key: 'settings', label: 'Settings' },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { projects, createProject, deleteProject, openProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleCreate = () => {
    if (!projectName.trim()) return;
    const project = createProject(projectName.trim());
    setProjectName('');
    setModalVisible(false);
    navigation.navigate('Editor', { projectId: project.id });
  };

  const handleOpen = (project: Project) => {
    openProject(project.id);
    navigation.navigate('Editor', { projectId: project.id });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProject(id) },
    ]);
  };

  const timeAgo = (ms: number) => {
    const diff = Date.now() - ms;
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (h < 1) return 'Just now';
    if (h < 24) return h + 'h ago';
    if (d === 1) return 'Yesterday';
    return d + ' days ago';
  };

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      <TouchableOpacity activeOpacity={0.95} onPress={() => setModalVisible(true)}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.createCard}
        >
          <View style={s.createIconWrap}>
            <Text style={s.createPlus}>+</Text>
          </View>
          <Text style={s.createTitle}>Create New Project</Text>
          <Text style={s.createSub}>Import Photos, Videos, Audio, Pre made projects or Create something creative</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recent Projects</Text>
        <TouchableOpacity><Text style={s.sectionLink}>View All</Text></TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyEmoji}>🎬</Text>
          <Text style={s.emptyTitle}>No projects yet</Text>
          <Text style={s.emptySub}>Create your first project above</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.projectsRow}>
          {projects.map(p => (
            <TouchableOpacity key={p.id} style={s.projectCard} onPress={() => handleOpen(p)}>
              <View style={s.projectThumb}>
                <Text style={s.projectLetter}>{p.name.charAt(0).toUpperCase()}</Text>
                <View style={s.durationBadge}>
                  <Text style={s.durationText}>{(p.duration / 1000).toFixed(0)}s</Text>
                </View>
              </View>
              <View style={s.projectMeta}>
                <Text style={s.projectName} numberOfLines={1}>{p.name}</Text>
                <Text style={s.projectDate}>Modified {timeAgo(p.updatedAt)}</Text>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(p.id)}>
                <Text style={s.deleteX}>x</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Quick Start Templates</Text>
      </View>
      <View style={s.grid}>
        {TEMPLATES.map(t => (
          <TouchableOpacity key={t.id} style={s.templateCard} activeOpacity={0.8}>
            <View style={[s.templateIconBox, { backgroundColor: t.bg }]}>
              <Text style={s.templateEmoji}>{t.icon === 'lightning' ? 'zap' : t.icon === 'video' ? 'cam' : t.icon === 'star' ? 'lut' : 'reel'}</Text>
            </View>
            <Text style={s.templateLabel}>{t.label}</Text>
            <Text style={s.templateSub}>{t.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderPlaceholder = (label: string) => (
    <View style={s.placeholder}>
      <Text style={s.phTitle}>{label}</Text>
      <Text style={s.phSub}>Coming soon</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <View style={s.header}>
        <View>
          <Text style={s.logo}>OpenCut</Text>
          <Text style={s.logoSub}>CREATIVE STUDIO</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn}>
            <Text style={s.iconBtnText}>search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Text style={s.iconBtnText}>bell</Text>
            <View style={s.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'templates' && renderPlaceholder('Templates')}
        {activeTab === 'tutorials' && renderPlaceholder('Tutorials')}
        {activeTab === 'settings' && renderPlaceholder('Settings')}
      </View>

      <View style={s.bottomNav}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={s.navTab} onPress={() => setActiveTab(tab.key)}>
            <Text style={[s.navIcon, activeTab === tab.key && s.navIconActive]}>
              {tab.key === 'home' ? 'home' : tab.key === 'templates' ? 'tmpl' : tab.key === 'tutorials' ? 'play' : 'cfg'}
            </Text>
            <Text style={[s.navLabel, activeTab === tab.key && s.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>New Project</Text>
            <Text style={s.modalSub}>Give your project a name to get started</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. Summer Vlog 2025"
              placeholderTextColor="#444"
              value={projectName}
              onChangeText={setProjectName}
              autoFocus
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.createBtn} onPress={handleCreate}>
                <Text style={s.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scrollContent: { paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  logo: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  logoSub: { fontSize: 9, color: '#555', letterSpacing: 3, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1c1c1c', justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 11, color: '#888' },
  badge: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6', borderWidth: 1.5, borderColor: '#0f0f0f' },
  createCard: { borderRadius: 28, padding: 32, alignItems: 'center', justifyContent: 'center', minHeight: SW * 0.52, marginTop: 8, marginBottom: 8 },
  createIconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: '#ffffff28', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  createPlus: { fontSize: 40, color: '#fff', fontWeight: '200', lineHeight: 44 },
  createTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  createSub: { fontSize: 13, color: '#bfdbfe', textAlign: 'center', lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  sectionLink: { fontSize: 14, color: '#60a5fa', fontWeight: '500' },
  emptyBox: { alignItems: 'center', paddingVertical: 36, backgroundColor: '#161616', borderRadius: 20, borderWidth: 1, borderColor: '#ffffff08' },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptySub: { fontSize: 13, color: '#444', marginTop: 6 },
  projectsRow: { gap: 16, paddingRight: 4 },
  projectCard: { width: 192, backgroundColor: '#161616', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#ffffff08' },
  projectThumb: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#1e1e2e', justifyContent: 'center', alignItems: 'center' },
  projectLetter: { fontSize: 56, color: '#3b82f640', fontWeight: '900' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#00000099', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  projectMeta: { padding: 12, paddingRight: 32 },
  projectName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  projectDate: { fontSize: 11, color: '#555', marginTop: 3 },
  deleteBtn: { position: 'absolute', bottom: 12, right: 12, padding: 4 },
  deleteX: { color: '#444', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 8 },
  templateCard: { width: (SW - 54) / 2, backgroundColor: '#18181b', borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: '#27272a' },
  templateIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  templateEmoji: { fontSize: 13, color: '#fff', fontWeight: '700' },
  templateLabel: { fontSize: 14, fontWeight: '600', color: '#fff' },
  templateSub: { fontSize: 11, color: '#555', marginTop: -6 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  phTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  phSub: { fontSize: 14, color: '#444', marginTop: 8 },
  bottomNav: { flexDirection: 'row', height: 80, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#121212cc', borderTopWidth: 1, borderTopColor: '#ffffff0d' },
  navTab: { flex: 1, alignItems: 'center', gap: 5 },
  navIcon: { fontSize: 11, color: '#555', fontWeight: '700' },
  navIconActive: { color: '#60a5fa' },
  navLabel: { fontSize: 10, color: '#555', fontWeight: '500' },
  navLabelActive: { color: '#60a5fa', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#161616', borderRadius: 24, padding: 24, width: '100%', borderWidth: 1, borderColor: '#2a2a2a' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#555', marginBottom: 20 },
  modalInput: { backgroundColor: '#0f0f0f', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600', fontSize: 15 },
  createBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#3b82f6', alignItems: 'center' },
  createText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
