import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_SPACE } from "../ui/tab-bar";
import { colors, text } from "../ui/theme";

/** Topo do Início (tela 41-21). Os cartões de posição e situação vêm no próximo plano da spec 002. */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]}
      style={styles.screen}
    >
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={[text.subtitle, styles.secondary]}>Minha jornada</Text>
          <Text accessibilityRole="header" style={[text.largeTitle, styles.primary]}>
            Olá
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  greeting: { flexShrink: 1 },
  primary: { color: colors.textPrimary },
  secondary: { color: colors.textSecondary },
});
