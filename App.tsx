import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import ExportScreen from './src/screens/ExportScreen';
import { useProjectStore } from './src/store/projectStore';
import { useSettingsStore } from './src/store/settingsStore';

export type RootStackParamList = {
  Home: undefined;
  Editor: { projectId: string };
  Export: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const loadProjects = useProjectStore(s => s.loadProjects);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  useEffect(() => {
    loadProjects();
    loadSettings();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="Export" component={ExportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}