import { ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_SPACE } from "../ui/tab-bar";
import { colors, text } from "../ui/theme";

/** Aba que ainda não tem tela (Documentos, spec 001; Histórico e Perfil, spec 003). */
export function PlaceholderScreen({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]}
      style={styles.screen}
    >
      <Text accessibilityRole="header" style={[text.largeTitle, styles.title]}>
        {title}
      </Text>
      <Text style={[text.subtitle, styles.note]}>Esta tela ainda está em construção.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE, gap: 8 },
  title: { color: colors.textPrimary },
  note: { color: colors.textSecondary },
});
