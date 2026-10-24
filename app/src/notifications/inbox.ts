import type { PushType } from "./push";

// Lista de notificações aberta pelo sino (spec 002, tela 42-816). Sem dependência nativa, para os testes.

export type InboxItem = {
  id: string;
  type: PushType;
  title: string;
  body: string;
  /** Data de envio em ISO. */
  sentAt: string;
  read: boolean;
};

/** Cor do ponto: novo, novo que pede ação (exame pedido) ou lido. */
export type Marker = "novo" | "acao" | "lido";

export const INBOX_LIMIT = 50;

// Só estes avisos existem para o paciente. Rejeição pelo médico e reavaliação da IA não geram aviso (item 11).
const KNOWN_TYPES: PushType[] = [
  "posicao_mudou",
  "exame_pendente",
  "documento_recebido",
  "exame_em_analise",
  "analise_concluida",
];

/**
 * Valida um aviso no formato `{ id, type, title, body, sentAt }`, vindo do push ou da adaptação de `api.getNotifications()`.
 * Qualquer campo inválido ou tipo desconhecido devolve `null`.
 */
export function parseNotification(raw: unknown): InboxItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { id, type, title, body, sentAt } = raw as Record<string, unknown>;
  if (!isText(id) || !isText(title) || !isText(body)) return null;
  if (!KNOWN_TYPES.includes(type as PushType)) return null;
  const time = typeof sentAt === "string" ? Date.parse(sentAt) : NaN;
  if (Number.isNaN(time)) return null;
  return {
    id,
    type: type as PushType,
    title,
    body,
    sentAt: new Date(time).toISOString(),
    read: false,
  };
}

/** Junta pelo `id` (o que já está guardado vence), do mais novo para o mais velho, até `INBOX_LIMIT`. */
export function mergeInbox(current: InboxItem[], incoming: InboxItem[]): InboxItem[] {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return [...byId.values()]
    .sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))
    .slice(0, INBOX_LIMIT);
}

export function markRead(inbox: InboxItem[], id: string): InboxItem[] {
  return inbox.map((item) => (item.id === id ? { ...item, read: true } : item));
}

export function unreadCount(inbox: InboxItem[]): number {
  return inbox.filter((item) => !item.read).length;
}

export function markerFor(item: InboxItem): Marker {
  if (item.read) return "lido";
  return item.type === "exame_pendente" ? "acao" : "novo";
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
// Horário de Brasília, sem horário de verão desde 2019.
const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;

/** "20 out", como no Figma. */
export function formatShortDate(iso: string): string {
  const local = new Date(Date.parse(iso) + BRASILIA_OFFSET_MS);
  return `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]}`;
}

const SPOKEN_MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "20 de outubro", para o VoiceOver e o TalkBack. */
export function formatSpokenDate(iso: string): string {
  const local = new Date(Date.parse(iso) + BRASILIA_OFFSET_MS);
  return `${local.getUTCDate()} de ${SPOKEN_MONTHS[local.getUTCMonth()]}`;
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}
