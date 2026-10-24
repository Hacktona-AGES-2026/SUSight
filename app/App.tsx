import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRequestedTab } from './src/navigation/requested-tab';
import { setupPushNotifications } from './src/notifications/setup';
import { registerBackgroundWidgetUpdates } from './src/widgets/background';
import { demoWidgetInput } from './src/widgets/demo';
import { refreshAllWidgets } from './src/widgets/refresh';
import { buildWidgetSnapshot } from './src/widgets/snapshot';
import { widgetTargets } from './src/widgets/targets';

const TAB_NAMES = { inicio: 'Início', documentos: 'Documentos' };

export default function App() {
  const requestedTab = useRequestedTab();

  useEffect(() => {
    // Enquanto o app não tem as telas e o backend, os widgets mostram os dados de demonstração.
    refreshAllWidgets(buildWidgetSnapshot(demoWidgetInput(new Date())), widgetTargets());
    setupPushNotifications();
    registerBackgroundWidgetUpdates();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      {/* Até a navegação da spec 002 existir, mostra qual aba o widget ou o aviso pediu. */}
      {requestedTab && <Text>Abrir: {TAB_NAMES[requestedTab]}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
