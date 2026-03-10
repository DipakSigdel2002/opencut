import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, StatusBar, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types/index';
type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { projects, createProject, deleteProject, openProject } = useProjectStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const handleCreate = () => {
    if (!projectName.trim()) return;
    const project = createProject(projectName.trim());
    setProjectName(''); setModalVisible(false);
    navigation.navigate('Editor', { projectId: project.id });
  };
  const handleOpen = (project: Project) => {
    openProject(project.id);
    navigation.navigate('Editor', { projectId: project.id });
  };
  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProject(id) },
    ]);
  };
  const formatDate = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <View style={s.container}>
      <StatusBar barStyle='light-content' backgroundColor='#0a0a0a' />
      <View style={s.header}>
        <Text style={s.logo}>OpenCut</Text>
        <Text style={s.tagline}>Free. Open. Professional.</Text>
      </View>
      {projects.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🎬</Text>
          <Text style={s.emptyText}>No projects yet</Text>
          <Text style={s.emptySubText}>Tap the button below to create your first project</Text>
        </View>
      ) : (
        <FlatList data={projects} keyExtractor={item => item.id} contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.projectCard} onPress={() => handleOpen(item)}>
              <View style={s.projectThumb}>
                <Text style={s.projectThumbText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={s.projectInfo}>
                <Text style={s.projectName}>{item.name}</Text>
                <Text style={s.projectDate}>{item.width}x{item.height} · {item.fps}fps · {formatDate(item.updatedAt)}</Text>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={s.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )} />
      )}
      <TouchableOpacity style={s.createBtn} onPress={() => setModalVisible(true)}>
        <Text style={s.createBtnText}>+ New Project</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType='fade' onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>New Project</Text>
            <TextInput style={s.modalInput} placeholder='Project name...' placeholderTextColor='#555'
              value={projectName} onChangeText={setProjectName} autoFocus />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalConfirm} onPress={handleCreate}>
                <Text style={s.modalConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
  logo: { fontSize: 32, fontWeight: '800', color: '#ff4d4d', letterSpacing: 1 },
  tagline: { fontSize: 13, color: '#555', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, color: '#fff', fontWeight: '700' },
  emptySubText: { fontSize: 14, color: '#555', textAlign: 'center', marginTop: 8 },
  list: { padding: 16 },
  projectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  projectThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#ff4d4d22', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  projectThumbText: { fontSize: 22, color: '#ff4d4d', fontWeight: '800' },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 16, color: '#fff', fontWeight: '600' },
  projectDate: { fontSize: 12, color: '#555', marginTop: 3 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: '#555', fontSize: 16 },
  createBtn: { margin: 20, backgroundColor: '#ff4d4d', borderRadius: 12, padding: 16, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#161616', borderRadius: 16, padding: 24, width: '80%', borderWidth: 1, borderColor: '#333' },
  modalTitle: { fontSize: 18, color: '#fff', fontWeight: '700', marginBottom: 16 },
  modalInput: { backgroundColor: '#0a0a0a', borderRadius: 8, padding: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  modalCancelText: { color: '#888', fontWeight: '600' },
  modalConfirm: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#ff4d4d', alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: '700' },
});