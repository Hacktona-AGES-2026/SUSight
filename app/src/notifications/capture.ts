import * as Notifications from "expo-notifications";
import { getSessionToken } from "../auth/token";
import { appInbox } from "./app-inbox";
import { fromExpoNotification, type ExpoNotificationLike } from "./capture-logic";
import type { InboxItem } from "./inbox";
import { syncInbox } from "./remote";

// Todo aviso que chega ao aparelho entra na lista do sino (spec 002, itens 2 e 10).
// O aviso que chega com o app fechado entra pela tarefa em segundo plano (widgets/background.ts).

/**
 * Guarda os avisos com o app aberto, os tocados e os que ainda estão na central do sistema,
 * e completa a lista com a API (ou a demonstração, sem backend).
 */
export function startInboxCapture() {
  const add = (notifications: ExpoNotificationLike[]) => {
    const items = notifications
      .map(fromExpoNotification)
      .filter((item): item is InboxItem => item !== null);
    if (items.length > 0) appInbox.add(items).catch(warn);
  };

  appInbox.load();
  syncInbox({
    apiConfigured: Boolean(process.env.EXPO_PUBLIC_API_URL),
    getToken: getSessionToken,
    fetchList: fetchNotifications,
    add: appInbox.add,
    now: new Date(),
  }).catch(warn);
  Notifications.getPresentedNotificationsAsync().then(add, warn);
  Notifications.getLastNotificationResponseAsync().then(
    (response) => response && add([response.notification]),
    warn,
  );
  const received = Notifications.addNotificationReceivedListener((n) => add([n]));
  const tapped = Notifications.addNotificationResponseReceivedListener((r) => add([r.notification]));
  return () => {
    received.remove();
    tapped.remove();
  };
}

async function fetchNotifications(token: string) {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/me/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`GET /me/notifications: ${response.status}`);
  return response.json();
}

function warn(error: unknown) {
  console.warn("Não foi possível guardar o aviso na lista de notificações.", error);
}
