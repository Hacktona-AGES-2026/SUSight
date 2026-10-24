import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DocumentIcon, HistoryIcon, HomeIcon, ProfileIcon } from "./icons";
import { colors, shadows, text } from "./theme";

export type Tab = "inicio" | "documentos" | "historico" | "perfil";

const TABS: { tab: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { tab: "inicio", label: "Início", Icon: HomeIcon },
  { tab: "documentos", label: "Documentos", Icon: DocumentIcon },
  { tab: "historico", label: "Histórico", Icon: HistoryIcon },
  { tab: "perfil", label: "Perfil", Icon: ProfileIcon },
];

/** Espaço que o conteúdo deixa embaixo para não ficar atrás da barra. */
export const TAB_BAR_SPACE = 100;

/** Barra de abas flutuante do Figma (componente 36-8), com a aba ativa em destaque (spec 002, item 14). */
export function TabBar({ active, onSelect }: { active: Tab; onSelect(tab: Tab): void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { bottom: Math.max(16, insets.bottom - 18) }]}
    >
      {TABS.map(({ tab, label, Icon }) => {
        const selected = tab === active;
        const color = selected ? colors.textPrimary : colors.textSecondary;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => onSelect(tab)}
            style={[styles.tab, selected && styles.selected]}
          >
            <Icon color={color} />
            <Text style={[text.tab, { color }]} numberOfLines={1} maxFontSizeMultiplier={1.4}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6.75,
    paddingVertical: 8,
    borderRadius: 34,
    backgroundColor: colors.surface,
    boxShadow: shadows.tabBar,
  },
  tab: {
    width: 76,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 26,
  },
  selected: { backgroundColor: colors.action },
});
