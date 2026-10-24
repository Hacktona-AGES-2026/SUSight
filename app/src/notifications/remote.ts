import { parseNotification, type InboxItem } from "./inbox";

// Lista de notificações vinda do backend (`GET /me/notifications`) ou da demonstração.

export type SyncDeps = {
  /** `EXPO_PUBLIC_API_URL` configurada. */
  apiConfigured: boolean;
  getToken(): Promise<string | null>;
  /** `GET /me/notifications`. */
  fetchList(token: string): Promise<unknown>;
  add(items: InboxItem[]): Promise<void>;
  now: Date;
};

export function parseNotificationList(raw: unknown): InboxItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const parsed = parseNotification(item);
    return parsed ? [parsed] : [];
  });
}

/** Completa a lista guardada. Sem rede, a lista guardada continua valendo. */
export async function syncInbox(deps: SyncDeps): Promise<boolean> {
  if (!deps.apiConfigured) {
    await deps.add(demoNotifications(deps.now));
    return true;
  }
  const token = await deps.getToken();
  if (!token) return false;
  try {
    await deps.add(parseNotificationList(await deps.fetchList(token)));
    return true;
  } catch (error) {
    console.warn("Não foi possível buscar as notificações.", error);
    return false;
  }
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Avisos de demonstração, com o visual da tela 42-816 e os avisos da spec 002.
 * Usados até o backend existir.
 */
export function demoNotifications(now: Date): InboxItem[] {
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY).toISOString();
  return [
    {
      id: "demo-documento",
      type: "documento_recebido",
      title: "Documento recebido",
      body: "Recebemos seu raio-X do joelho. Ele já está na fila de análise e você não precisa fazer mais nada agora.",
      sentAt: daysAgo(1),
      read: false,
    },
    {
      id: "demo-exame",
      type: "exame_pendente",
      title: "Falta um exame",
      body: "O médico pediu o laudo da ressonância do joelho. Envie pela aba Documentos quando puder.",
      sentAt: daysAgo(3),
      read: false,
    },
    {
      id: "demo-posicao",
      type: "posicao_mudou",
      title: "Sua posição mudou",
      body: "Você agora é a 42ª de 118 porque outros pacientes foram reavaliados pela equipe médica. Isso não é uma previsão de data.",
      sentAt: daysAgo(40),
      read: true,
    },
    {
      id: "demo-analise",
      type: "analise_concluida",
      title: "Análise concluída",
      body: "A equipe analisou seu caso e sua posição continua a mesma.",
      sentAt: daysAgo(41),
      read: true,
    },
  ];
}
