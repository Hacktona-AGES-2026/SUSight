import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  formatShortDate,
  formatSpokenDate,
  markerFor,
  type InboxItem,
  type Marker,
} from "../notifications/inbox";
import { BackIcon } from "../ui/icons";
import { TAB_BAR_SPACE } from "../ui/tab-bar";
import { colors, shadows, text } from "../ui/theme";

type Props = {
  items: InboxItem[];
  onBack(): void;
  onOpen(item: InboxItem): void;
};

const MARKER_COLOR: Record<Marker, string> = {
  novo: colors.markerNew,
  acao: colors.action,
  lido: colors.markerRead,
};

// A cor do ponto nunca é a única pista: o leitor de tela diz se é novo ou pede ação.
const MARKER_SPOKEN: Record<Marker, string> = {
  novo: "Novo. ",
  acao: "Novo, pede ação. ",
  lido: "",
};

/** Lista aberta pelo sino (spec 002, tela 42-816). */
export function NotificationsScreen({ items, onBack, onOpen }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para o Início"
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <BackIcon color={colors.tint} />
          <Text style={[text.body, styles.tint]}>Início</Text>
        </Pressable>
        <Text accessibilityRole="header" style={[text.bodyStrong, styles.primary, styles.title]}>
          Notificações
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={[styles.card, styles.empty]}>
            <Text style={[text.subtitleStrong, styles.primary]}>Nenhuma notificação por enquanto</Text>
            <Text style={[text.note, styles.secondary]}>
              Avisamos aqui quando sua posição mudar, quando um exame for pedido e quando seu documento
              for recebido.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {items.map((item) => (
              <NotificationRow key={item.id} item={item} onPress={() => onOpen(item)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function NotificationRow({ item, onPress }: { item: InboxItem; onPress(): void }) {
  const marker = markerFor(item);
  const label = `${MARKER_SPOKEN[marker]}${item.title}. ${item.body} ${formatSpokenDate(item.sentAt)}.`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.row}>
      <View style={styles.markerColumn}>
        <View
          testID={`marcador-${item.id}`}
          style={[styles.marker, { backgroundColor: MARKER_COLOR[marker] }]}
        />
      </View>
      <View style={styles.texts}>
        <Text style={[text.subtitleStrong, styles.primary]}>{item.title}</Text>
        <Text style={[text.note, styles.secondary]}>{item.body}</Text>
      </View>
      <Text style={[text.note, styles.secondary]}>{formatShortDate(item.sentAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  navBar: { minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  back: { flexDirection: "row", alignItems: "center", gap: 2, zIndex: 1 },
  title: { position: "absolute", left: 0, right: 0, textAlign: "center" },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: TAB_BAR_SPACE },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 4,
    boxShadow: shadows.soft,
  },
  empty: { paddingHorizontal: 16, paddingVertical: 16, gap: 3 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  markerColumn: { paddingTop: 5 },
  marker: { width: 12, height: 12, borderRadius: 6 },
  texts: { flex: 1, gap: 3 },
  primary: { color: colors.textPrimary },
  secondary: { color: colors.textSecondary },
  tint: { color: colors.tint },
});
