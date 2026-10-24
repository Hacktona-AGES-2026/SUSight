import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import type { WidgetTab } from "../widgets/links";
import { sendPushToken } from "./backend";
import {
  ANDROID_CHANNEL,
  ensurePushPermission,
  registerPushToken,
  tabFromNotification,
  type PermissionStatus,
  type PERMISSION_EXPLANATION,
} from "./push";

// Avisos com o app aberto aparecem como banner, sem som (sem alarme, constituição item 7).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Canal do Android, permissão com explicação e registro do token no backend. */
export async function setupPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL.id, {
      name: ANDROID_CHANNEL.name,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const hasPermission = await ensurePushPermission(
    {
      getStatus: async () =>
        (await Notifications.getPermissionsAsync()).status as PermissionStatus,
      request: async () =>
        (await Notifications.requestPermissionsAsync()).status as PermissionStatus,
    },
    explainWithAlert,
  );
  return registerPushToken({
    isDevice: Device.isDevice,
    hasPermission,
    getToken: async () => (await Notifications.getExpoPushTokenAsync()).data,
    send: sendPushToken,
  });
}

/** Chama `onTab` quando o paciente toca num aviso, inclusive o que abriu o app. */
export function listenNotificationTaps(onTab: (tab: WidgetTab) => void) {
  const open = (response: Notifications.NotificationResponse | null) => {
    if (response) onTab(tabFromNotification(response.notification.request.content.data));
  };
  Notifications.getLastNotificationResponseAsync().then(open);
  const subscription = Notifications.addNotificationResponseReceivedListener(open);
  return () => subscription.remove();
}

function explainWithAlert(text: typeof PERMISSION_EXPLANATION): Promise<boolean> {
  return new Promise((resolve) =>
    Alert.alert(text.title, text.message, [
      { text: text.decline, style: "cancel", onPress: () => resolve(false) },
      { text: text.accept, onPress: () => resolve(true) },
    ]),
  );
}
