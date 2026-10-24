import { useMemo } from 'react';
import { api, type AppNotification, type NotificationKind } from '../api';
import { getSessionToken } from '../auth/token';
import { useLoad } from '../useLoad';
import { appInbox, useInbox } from './app-inbox';
import type { InboxItem } from './inbox';
import type { PushType } from './push';

const PUSH_TYPE: Record<NotificationKind, PushType> = {
  document_received: 'documento_recebido', exam_requested: 'exame_pendente',
  position_changed: 'posicao_mudou', analysis_done: 'analise_concluida',
  exam_analyzing: 'exame_em_analise',
};
const KIND: Record<PushType, NotificationKind> = {
  documento_recebido: 'document_received', exame_pendente: 'exam_requested',
  posicao_mudou: 'position_changed', analise_concluida: 'analysis_done',
  exame_em_analise: 'exam_analyzing',
};

/** Conserva os dados de demonstração já usados pelas telas da dev. */
export function toInboxItem(item: AppNotification): InboxItem {
  return {
    id: item.id, type: PUSH_TYPE[item.kind], title: item.title, body: item.body,
    sentAt: new Date(/^\d{4}-\d{2}-\d{2}$/.test(item.date) ? `${item.date}T12:00:00-03:00` : item.date).toISOString(),
    read: item.read,
  };
}

export function toAppNotification(item: InboxItem): AppNotification {
  return { id: item.id, kind: KIND[item.type], title: item.title, body: item.body, date: item.sentAt, read: item.read };
}

/** Lista persistente, completada pela API ou pela demonstração existente. */
export async function loadPatientNotifications(): Promise<AppNotification[]> {
  await appInbox.load();
  const token = await getSessionToken();
  if (!token) return [];
  // A camada da dev já seleciona a demonstração ou o backend real (/notificacoes).
  const incoming = (await api.getNotifications()).map(toInboxItem);
  if (await getSessionToken() !== token) return [];
  await appInbox.add(incoming);
  return appInbox.getSnapshot().map(toAppNotification);
}

/** O sino e a rota de notificações reagem imediatamente aos pushes recebidos. */
export function usePatientNotifications() {
  const items = useInbox();
  const query = useLoad(loadPatientNotifications);
  const data = useMemo(() => query.data !== undefined || items.length > 0
    ? items.map(toAppNotification) : undefined, [items, query.data]);
  return { ...query, data };
}

export async function markPatientNotificationsRead() {
  await appInbox.markAllRead();
  await api.markNotificationsRead();
}
