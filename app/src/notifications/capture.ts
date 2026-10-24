import * as Notifications from "expo-notifications";
import { getSessionToken } from "../auth/token";
import { appInbox } from "./app-inbox";
import { fromExpoNotification, type ExpoNotificationLike } from "./capture-logic";
import type { InboxItem } from "./inbox";
import { loadPatientNotifications } from './patient-notifications';

// Todo aviso que chega ao aparelho entra na lista do sino (spec 002, itens 2 e 10).
// O aviso que chega com o app fechado entra pela tarefa em segundo plano (widgets/background.ts).

/**
 * Guarda os avisos com o app aberto, os tocados e os que ainda estão na central do sistema,
 * e completa a lista com a API (ou a demonstração, sem backend).
 */
export function startInboxCapture() {
  let active = true;
  const add = async (notifications: ExpoNotificationLike[]) => {
    const token = await getSessionToken();
    if (!active || !token) return;
    const items = notifications
      .map(fromExpoNotification)
      .filter((item): item is InboxItem => item !== null);
    if (active && items.length > 0 && await getSessionToken() === token) await appInbox.add(items);
  };

  loadPatientNotifications().catch(warn);
  Notifications.getPresentedNotificationsAsync().then(add).catch(warn);
  Notifications.getLastNotificationResponseAsync().then(
    (response) => response && add([response.notification]),
  ).catch(warn);
  const received = Notifications.addNotificationReceivedListener((n) => { add([n]).catch(warn); });
  const tapped = Notifications.addNotificationResponseReceivedListener((r) => { add([r.notification]).catch(warn); });
  return () => {
    active = false;
    received.remove();
    tapped.remove();
  };
}

export async function clearInboxCaptureHistory() {
  await Promise.allSettled([
    Notifications.dismissAllNotificationsAsync(),
    Notifications.clearLastNotificationResponseAsync(),
  ]);
}

function warn(error: unknown) {
  console.warn("Não foi possível guardar o aviso na lista de notificações.", error);
}
