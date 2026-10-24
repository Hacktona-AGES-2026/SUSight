import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { demoWidgetInput } from './src/widgets/demo';
import { buildWidgetSnapshot } from './src/widgets/snapshot';
import { createWidgetStorage } from './src/widgets/storage';
import { syncWidgets } from './src/widgets/sync';

export default function App() {
  // Enquanto o app não tem as telas e o backend, os widgets mostram os dados de demonstração.
  useEffect(() => {
    const storage = createWidgetStorage();
    if (storage) {
      syncWidgets(buildWidgetSnapshot(demoWidgetInput(new Date())), storage);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
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
