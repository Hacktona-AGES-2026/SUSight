import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { getSessionToken } from "../auth/token";
import { appInbox } from "../notifications/app-inbox";
import { fromBackgroundTask } from "../notifications/capture-logic";
import {
  updateWidgetsFromApi,
  updateWidgetsFromPush,
  type BackgroundDeps,
} from "./background-logic";
import { getWidgetPreferences } from "./preferences";
import { refreshAllWidgets } from "./refresh";
import { widgetTargets } from "./targets";

// Tarefas que atualizam os widgets com o app fechado (spec 004, item 4).
// Precisam ser definidas no escopo do módulo, importado em index.ts.
export const WIDGET_PUSH_TASK = "widget-push-update";
export const WIDGET_REFRESH_TASK = "widget-periodic-refresh";

const deps: BackgroundDeps = {
  getPreferences: getWidgetPreferences,
  getToken: getSessionToken,
  fetchWidget: async (token) => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL não configurada");
    const response = await fetch(`${apiUrl}/me/widget`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`GET /me/widget: ${response.status}`);
    return response.json();
  },
  refresh: (snapshot) => refreshAllWidgets(snapshot, widgetTargets()),
};

TaskManager.defineTask(WIDGET_PUSH_TASK, async ({ data, error }) => {
  if (error) return;
  // O aviso também entra na lista do sino (spec 002).
  const item = fromBackgroundTask(data);
  const token = await getSessionToken();
  if (item && token && await getSessionToken() === token) await appInbox.add([item]).catch(() => {});
  await updateWidgetsFromPush(data, deps);
});

TaskManager.defineTask(WIDGET_REFRESH_TASK, async () => {
  const updated = await updateWidgetsFromApi(deps);
  return updated
    ? BackgroundTask.BackgroundTaskResult.Success
    : BackgroundTask.BackgroundTaskResult.Failed;
});

/** Liga o push em segundo plano e a atualização periódica (mínimo de 15 minutos). */
export async function registerBackgroundWidgetUpdates() {
  try {
    await Notifications.registerTaskAsync(WIDGET_PUSH_TASK);
    await BackgroundTask.registerTaskAsync(WIDGET_REFRESH_TASK, { minimumInterval: 15 });
  } catch (error) {
    console.warn("Não foi possível ligar a atualização dos widgets em segundo plano.", error);
  }
}
