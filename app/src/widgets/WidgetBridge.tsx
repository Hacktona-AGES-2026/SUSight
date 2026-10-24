import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { api } from '../api';
import { getSessionToken } from '../auth/token';
import { listenNotificationTaps, setupPushNotifications } from '../notifications/setup';
import { useSession } from '../session';
import { registerBackgroundWidgetUpdates } from './background';
import type { WidgetTab } from './links';
import { setWidgetPreferences } from './preferences';
import { clearAllWidgets, refreshAllWidgets } from './refresh';
import { buildWidgetSnapshot, type ExamStatus } from './snapshot';
import { widgetTargets } from './targets';

const EXAM_STATUS: Record<'pending' | 'received' | 'analyzing', ExamStatus> = {
  pending: 'pendente', received: 'recebido', analyzing: 'em_analise',
};

/** Liga os widgets à sessão e aos mesmos dados de Início e Documentos. */
export function WidgetBridge() {
  const { status, prefs } = useSession();
  const pathname = usePathname();
  const [requested, setRequested] = useState<{ tab: WidgetTab } | null>(null);

  useEffect(() => listenNotificationTaps((tab) => setRequested({ tab })), []);
  useEffect(() => {
    if (status !== 'signedIn' || !requested) return;
    router.navigate(requested.tab === 'inicio' ? '/home' : '/documents');
    setRequested(null);
  }, [status, requested]);

  useEffect(() => {
    if (status !== 'signedIn') return;
    registerBackgroundWidgetUpdates();
    if (prefs.notifications) setupPushNotifications().catch((error) => {
      console.warn('Não foi possível configurar os avisos.', error);
    });
  }, [status, prefs.notifications]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (status === 'signedOut') {
        await clearAllWidgets(widgetTargets());
        return;
      }
      if (status !== 'signedIn') return;
      await setWidgetPreferences({ faceIdEnabled: prefs.faceId });
      const token = await getSessionToken();
      if (!token) return;
      const [home, documents] = await Promise.all([api.getHome(), api.getDocuments()]);
      if (!active || await getSessionToken() !== token) return;
      await refreshAllWidgets(buildWidgetSnapshot({
        signedIn: true,
        queue: { position: home.request.position, total: home.request.total },
        exams: documents.map((document) => ({ name: document.name, status: EXAM_STATUS[document.status] })),
        faceIdEnabled: prefs.faceId,
        variant: 'padrao',
        updatedAt: new Date(home.request.updatedAt),
      }), widgetTargets());
    };
    const update = () => refresh().catch((error) => console.warn('Não foi possível atualizar os widgets.', error));
    update();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => { active = false; subscription.remove(); };
  }, [status, prefs.faceId, pathname]);

  return null;
}
