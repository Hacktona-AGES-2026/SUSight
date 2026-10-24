import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type } from '../theme';

export const FOOTNOTE = 'Um apoio ao cuidado. Toda decisão sobre a sua fila é validada por um profissional de saúde.';

/** "Splash · SUSight Paciente" (41-4). */
export function Splash({ children }: { children?: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[colors.splashTop, colors.surface, colors.surface]}
      locations={[0, 0.6, 1]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={st.fill}>
        <View style={st.center}>
          <View style={st.mark}>
            <Image source={require('../../assets/figma/blobs.svg')} style={st.blobs} accessible={false} />
            <Image source={require('../../assets/logo.png')} style={st.logo} accessible={false} />
          </View>
          <Text style={[type.largeTitle, st.name]} accessibilityRole="header">
            SUSight
          </Text>
          <Text style={[type.body, { color: colors.textMuted }]}>Sua jornada no SUS, com clareza.</Text>
          {children}
        </View>
        <Text style={[type.note, st.foot]}>{FOOTNOTE}</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  mark: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  blobs: { position: 'absolute', width: 298, height: 298 },
  logo: { width: 88, height: 88, borderRadius: 30 },
  name: { fontSize: 44, lineHeight: 52 },
  foot: { color: colors.textSecondary, textAlign: 'center', width: 290, marginBottom: 24 },
});
