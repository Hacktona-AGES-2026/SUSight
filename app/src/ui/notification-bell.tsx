import { Pressable, StyleSheet, View } from "react-native";
import { BellIcon } from "./icons";
import { colors } from "./theme";

/** Sino do Início com o ponto de aviso novo (spec 002, item 2; tela 41-21). */
export function NotificationBell({ unread, onPress }: { unread: number; onPress(): void }) {
  const label =
    unread === 0 ? "Notificações" : `Notificações, ${unread} ${unread === 1 ? "nova" : "novas"}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.button}
    >
      <BellIcon color={colors.textPrimary} />
      {unread > 0 && <View testID="ponto-de-aviso" style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  dot: {
    position: "absolute",
    left: 28,
    top: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.alertDot,
  },
});
