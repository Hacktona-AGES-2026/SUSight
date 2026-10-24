import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { demoWidgetInput } from './src/widgets/demo';
import { refreshAllWidgets } from './src/widgets/refresh';
import { buildWidgetSnapshot } from './src/widgets/snapshot';
import { widgetTargets } from './src/widgets/targets';

export default function App() {
  // Enquanto o app não tem as telas e o backend, os widgets mostram os dados de demonstração.
  useEffect(() => {
    refreshAllWidgets(buildWidgetSnapshot(demoWidgetInput(new Date())), widgetTargets());
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
