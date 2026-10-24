import * as SecureStore from 'expo-secure-store';
import {
  type Api,
  ApiError,
  type AppNotification,
  type Doc,
  type DocStatus,
  type Home,
  type NotificationKind,
  type Priority,
  type TimelineEvent,
} from './apiTypes';

// Backend shapes (SUSight-Backend docs/backend-api.md). Only the fields the app uses.
type Row = {
  solicitacao_id: string;
  cid: string;
  dias_em_fila: number;
  posicao: number;
  justificativa?: string;
  prioridade_regulacao?: string | null;
};
type Queue = { total: number; pacientes: Row[] };
type BackendEvent = { tipo: string; texto: string; data_hora: string };
type ExamRequest = { pedido_id: string; exame: string; situacao: string; data_hora: string };
type Notice = { id: number; tipo: string; titulo: string; texto: string; lida: boolean; data_hora: string };

const LOCK = 'Muitas tentativas. Tente de novo em alguns minutos.';
const OFFLINE = 'Não foi possível conectar. Verifique sua conexão e tente de novo.';

// The backend queue has no procedure name or specialty; they come from the CID.
const BY_CID: Record<string, { procedure: string; specialty: string }> = {
  K40: { procedure: 'Hérnia inguinal', specialty: 'Cirurgia geral' },
  K80: { procedure: 'Colecistectomia', specialty: 'Cirurgia geral' },
  H25: { procedure: 'Cirurgia de catarata', specialty: 'Oftalmologia' },
  M17: { procedure: 'Artroplastia total de joelho', specialty: 'Ortopedia' },
};
const PRIORITY: Record<string, Priority> = { Alta: 'Alta', Moderada: 'Moderada', Média: 'Moderada', Baixa: 'Baixa' };
const EVENT_TITLES: Record<string, string> = {
  entrada_na_fila: 'Entrada na fila de cirurgia eletiva',
  documento_recebido: 'Documento enviado',
  posicao_alterada: 'Sua posição mudou',
  informacao_solicitada: 'Pedido de exame',
  proposta_rejeitada: 'Reavaliação concluída',
  contestacao: 'Reavaliação em andamento',
  reavaliacao_concluida: 'Reavaliação concluída',
};
const NOTICE_KINDS: Record<string, NotificationKind> = {
  exame_pedido: 'exam_requested',
  documento_recebido: 'document_received',
  posicao_alterada: 'position_changed',
  analise_concluida: 'analysis_done',
  prioridade_validada: 'position_changed',
};
const DOC_STATUS: Record<string, DocStatus> = {
  pendente: 'pending',
  recebido: 'received',
  em_analise: 'received',
  atendido: 'received',
};

const digits = (text: string) => text.replace(/\D/g, '');
const day = (iso: string) => iso.slice(0, 10);
const daysBefore = (n: number, now = new Date()) => new Date(now.getTime() - n * 86_400_000).toISOString().slice(0, 10);
const RECENT_DAYS = 7;

export function toTimeline(events: BackendEvent[], now = new Date()): TimelineEvent[] {
  return events.map((e) => ({
    id: `${e.tipo}-${e.data_hora}`,
    title: EVENT_TITLES[e.tipo] ?? 'Atualização do seu caso',
    detail: e.texto,
    date: day(e.data_hora),
    tone:
      e.tipo === 'informacao_solicitada'
        ? 'light'
        : now.getTime() - new Date(e.data_hora).getTime() < RECENT_DAYS * 86_400_000
          ? 'strong'
          : 'muted',
  }));
}

export function toDocs(requests: ExamRequest[]): Doc[] {
  return requests.map((r) => ({
    id: r.pedido_id,
    name: r.exame,
    type: 'Exame',
    date: day(r.data_hora),
    status: DOC_STATUS[r.situacao] ?? 'received',
  }));
}

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

/** Plain base64 of the file bytes; no native module needed. */
export function toBase64(bytes: Uint8Array) {
  const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b, c] = [bytes[i], bytes[i + 1], bytes[i + 2]];
    out += table[a >> 2] + table[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? '=' : table[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? '=' : table[c & 63];
  }
  return out;
}

/** The app's API on top of the SUSight-Backend. The backend has no name, city or birth date for patients. */
export function createRealApi(baseUrl: string, fetchImpl: typeof fetch = fetch): Api {
  const sessionToken = async () => {
    const raw = await SecureStore.getItemAsync('session');
    return raw ? (JSON.parse(raw) as { token: string }).token : null;
  };

  async function send(method: string, path: string, body?: unknown, auth = true) {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (auth) {
      const token = await sessionToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(OFFLINE);
    }
    if (response.status === 401 && auth) {
      // Expired session: the next app open signs the patient out.
      await SecureStore.deleteItemAsync('session');
      throw new ApiError('Sua sessão expirou. Entre de novo.');
    }
    return response;
  }

  async function json<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await send(method, path, body);
    if (!response.ok) throw new ApiError('Algo deu errado. Tente de novo.');
    return (await response.json()) as T;
  }

  const queue = () => json<Queue>('GET', '/fila');
  async function myRow() {
    const q = await queue();
    const row = q.pacientes[0];
    if (!row) throw new ApiError('Não encontramos sua solicitação. Procure a sua UBS.');
    return { row, total: q.total };
  }
  const events = async (sid: string) => {
    const response = await send('GET', `/solicitacoes/${encodeURIComponent(sid)}/historico`);
    if (response.status === 404) return [] as BackendEvent[];
    if (!response.ok) throw new ApiError('Algo deu errado. Tente de novo.');
    return ((await response.json()) as { eventos: BackendEvent[] }).eventos;
  };
  const requests = async (sid: string) =>
    (await json<{ pedidos: ExamRequest[] }>('GET', `/solicitacoes/${encodeURIComponent(sid)}/exames-pedidos`)).pedidos;

  // Files sent in this session without a request; the backend has no list of the patient's uploads.
  const uploaded: Doc[] = [];

  return {
    // The backend has no SMS step: the 6-digit code is the account's provisional password.
    async requestCode() {
      return {};
    },

    async verifyCode(cpf, code) {
      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}/sessoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identificador: digits(cpf), senha: code }),
        });
      } catch {
        throw new ApiError(OFFLINE);
      }
      if (response.status === 429) throw new ApiError(LOCK);
      if (!response.ok) throw new ApiError('Código incorreto ou expirado. Confira e tente de novo.');
      return { token: ((await response.json()) as { token: string }).token };
    },

    async getHome(): Promise<Home> {
      const { row, total } = await myRow();
      const [history, pending] = await Promise.all([events(row.solicitacao_id), requests(row.solicitacao_id)]);
      const timeline = toTimeline(history);
      const open = pending.filter((p) => p.situacao === 'pendente');
      const known = BY_CID[row.cid.slice(0, 3)];
      const entered = history.find((e) => e.tipo === 'entrada_na_fila');
      const enteredAt = daysBefore(row.dias_em_fila);
      const last = timeline[0];
      return {
        firstName: '',
        request: {
          number: row.solicitacao_id,
          procedure: known?.procedure ?? `Cirurgia (CID ${row.cid})`,
          detail: known?.specialty ?? 'Cirurgia eletiva',
          specialty: known?.specialty ?? '',
          city: '',
          position: row.posicao,
          total,
          updatedAt: daysBefore(0),
          referral: { date: entered ? day(entered.data_hora) : enteredAt, place: '' },
          reason: row.justificativa || 'Posição definida pela pontuação clínica e pela classe de risco.',
          // The backend does not say when the regulation validated the priority.
          priority: { level: PRIORITY[row.prioridade_regulacao ?? ''] ?? 'Moderada' },
          lastStep: open.length
            ? {
                title: 'Último passo: exame pedido pela equipe',
                detail: `Envie ${open.map((p) => p.exame.toLowerCase()).join(' e ')} na aba Documentos.`,
                pending: true,
              }
            : { title: last?.title ?? 'Sua solicitação está na fila', detail: last?.detail ?? '', pending: false },
          enteredAt,
          lastClinicalUpdate: last?.date ?? enteredAt,
        },
        recent: timeline.slice(0, 4),
      };
    },

    async getHistory() {
      const { row } = await myRow();
      return toTimeline(await events(row.solicitacao_id));
    },

    async getNotifications(): Promise<AppNotification[]> {
      const { notificacoes } = await json<{ notificacoes: Notice[] }>('GET', '/notificacoes');
      return notificacoes.map((n) => ({
        id: String(n.id),
        kind: NOTICE_KINDS[n.tipo] ?? 'analysis_done',
        title: n.titulo,
        body: n.texto,
        date: day(n.data_hora),
        read: n.lida,
      }));
    },

    async markNotificationsRead() {
      const { notificacoes } = await json<{ notificacoes: Notice[] }>('GET', '/notificacoes');
      await Promise.all(notificacoes.filter((n) => !n.lida).map((n) => send('POST', `/notificacoes/${n.id}/lida`)));
    },

    async getDocuments() {
      const { row } = await myRow();
      const docs = [...toDocs(await requests(row.solicitacao_id)), ...uploaded];
      return docs.sort((a, b) => b.date.localeCompare(a.date));
    },

    async getTerm() {
      const term = await json<{ versao: string; texto: string }>('GET', '/termos/upload');
      return { version: term.versao, text: term.texto };
    },

    async uploadDocument({ file, type, requestedId, termVersion }) {
      if (!termVersion) throw new ApiError('Aceite o termo antes de enviar o documento.');
      if (!file.uri) throw new ApiError('Não foi possível ler o arquivo.');
      const { row } = await myRow();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const mime = file.mimeType ?? MIME_BY_EXT[ext] ?? 'application/octet-stream';
      let bytes: Uint8Array;
      try {
        bytes = new Uint8Array(await (await fetchImpl(file.uri)).arrayBuffer());
      } catch {
        throw new ApiError('Não foi possível ler o arquivo.');
      }
      const response = await send('POST', '/documentos/arquivo', {
        solicitacao_id: row.solicitacao_id,
        tipo_mime: mime,
        conteudo_base64: toBase64(bytes),
        termo_versao: termVersion,
        aceite_termo: true,
        pedido_id: requestedId,
      });
      if (!response.ok) {
        const detail = (await response.json().catch(() => null)) as { detail?: unknown } | null;
        throw new ApiError(typeof detail?.detail === 'string' ? detail.detail : 'Não foi possível enviar o documento.');
      }
      const result = (await response.json()) as { documento_id: string };
      const doc: Doc = { id: result.documento_id, name: file.name, type, date: daysBefore(0), status: 'received' };
      if (!requestedId) uploaded.push(doc);
      return doc;
    },

    // The backend keeps no name, birth date, phone or city for patients.
    async getProfile() {
      return { name: 'Paciente', initials: 'P', cnsLast4: '', birthDate: '', phone: '', city: '' };
    },

    async getContacts() {
      const { contatos } = await json<{
        contatos: { contato_id: number; nome: string; parentesco: string; telefone: string }[];
      }>('GET', '/contatos');
      return contatos.map((c) => ({
        id: String(c.contato_id),
        name: c.nome,
        relation: c.parentesco as never,
        phone: c.telefone,
        since: daysBefore(0),
      }));
    },

    async addContact({ name, relation, phone }) {
      const response = await send('POST', '/contatos', { nome: name, parentesco: relation, telefone: phone });
      if (!response.ok) throw new ApiError('Não foi possível salvar o contato. Confira os dados.');
    },

    async removeContact(id) {
      const response = await send('DELETE', `/contatos/${encodeURIComponent(id)}`);
      if (!response.ok) throw new ApiError('Não foi possível remover o contato.');
    },

    // ponytail: no data-copy route in the backend yet; the screen shows its confirmation anyway.
    async requestDataCopy() {},
  };
}
