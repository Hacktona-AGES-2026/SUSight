import { asObject, pushDataCandidates } from "../widgets/background-logic";
import { parseNotification, type InboxItem } from "./inbox";

// Transforma o aviso recebido em item da lista do sino (spec 002). Sem dependência nativa, para os testes.

/** O que importa de um `Notification` do expo-notifications. */
export type ExpoNotificationLike = {
  date: number;
  request: {
    identifier: string;
    content: { title: string | null; body: string | null; data?: Record<string, unknown> | null };
  };
};

/** Sem `id` ou `sentAt` no push, usa o identificador e a hora do aviso no aparelho. */
export function fromExpoNotification(notification: ExpoNotificationLike): InboxItem | null {
  const { request, date } = notification;
  const data = request.content.data ?? {};
  return parseNotification({
    id: data.id ?? request.identifier,
    type: data.type,
    title: request.content.title,
    body: request.content.body,
    sentAt: data.sentAt ?? new Date(date).toISOString(),
  });
}

/**
 * Aviso que chegou com o app fechado, na tarefa em segundo plano.
 * Push só com dados (sem título) não entra: ele não aparece para o paciente.
 */
export function fromBackgroundTask(taskData: unknown): InboxItem | null {
  const root = asObject(taskData);
  const notification = asObject(root?.notification);
  if (notification?.request) return fromExpoNotification(notification as ExpoNotificationLike);

  const data = asObject(root?.data);
  const fields = pushDataCandidates(taskData).find((candidate) => candidate.type !== undefined);
  if (!fields) return null;
  const alert = asObject(asObject(data?.aps)?.alert);
  return parseNotification({
    ...fields,
    title: fields.title ?? alert?.title ?? data?.title,
    body: alert?.body ?? data?.message,
  });
}
