import {
  type Api,
  ApiError,
  type AppNotification,
  type Contact,
  type Doc,
  type DocType,
  type Home,
  type Profile,
  type TimelineEvent,
} from './apiTypes';
import { createRealApi } from './realApi';

export * from './apiTypes';

// Demo patient while the backend has no patient routes. Fictitious data only.
export const DEMO = { cpf: '52998224725', code: '123456', phone: '21987653187' };

const today = () => new Date().toISOString().slice(0, 10);
const wait = () => new Promise((r) => setTimeout(r, 150));

const seed = () => ({
  documents: [
    { id: 'd4', name: 'Risco cirúrgico', type: 'Exame', date: '2026-10-22', status: 'pending' },
    { id: 'd3', name: 'Eletrocardiograma pré-operatório', type: 'Exame', date: '2026-10-21', status: 'received' },
    { id: 'd2', name: 'Raio-X do joelho direito', type: 'Exame', date: '2026-10-20', status: 'analyzing' },
    { id: 'd1', name: 'Ressonância do joelho direito', type: 'Laudo', date: '2026-08-22', status: 'analyzing' },
  ] as Doc[],
  contacts: [
    { id: 'c1', name: 'João Albuquerque', relation: 'Filho ou filha', phone: '21987655521', since: '2026-09-02' },
    { id: 'c2', name: 'Ana Albuquerque', relation: 'Irmão ou irmã', phone: '21987650874', since: '2026-09-15' },
  ] as Contact[],
  notifications: [
    {
      id: 'n4',
      kind: 'exam_requested',
      title: 'Falta um exame',
      body: 'A equipe pediu o exame de risco cirúrgico. Envie na aba Documentos quando puder.',
      date: '2026-10-22',
      read: false,
    },
    {
      id: 'n3',
      kind: 'document_received',
      title: 'Documento recebido',
      body: 'Recebemos seu raio-X do joelho. Ele já está na fila de análise e você não precisa fazer mais nada agora.',
      date: '2026-10-20',
      read: false,
    },
    {
      id: 'n2',
      kind: 'position_changed',
      title: 'Sua posição mudou',
      body: 'Agora você é a 42ª de 118 pessoas. Um profissional reavaliou a fila com base nos exames enviados.',
      date: '2026-09-12',
      read: true,
    },
    {
      id: 'n1',
      kind: 'analysis_done',
      title: 'Análise concluída',
      body: 'Um profissional de saúde analisou seus documentos. Sua posição continua a mesma.',
      date: '2026-09-11',
      read: true,
    },
  ] as AppNotification[],
  attempts: 0,
  lockedUntil: 0,
});

let db = seed();

/** Restores the demo data. Tests call it between cases. */
export const resetDemo = () => {
  db = seed();
};

export const LOCK_MINUTES = 5;
const MAX_ATTEMPTS = 5;

const demoApi: Api = {
  async requestCode(cpf: string) {
    await wait();
    // Same message for unknown CPF so the app never reveals who is registered.
    if (cpf.replace(/\D/g, '') !== DEMO.cpf) {
      throw new ApiError('Não foi possível enviar o código. Confira o CPF ou procure a sua UBS.');
    }
    return { phone: DEMO.phone };
  },

  async verifyCode(cpf: string, code: string, now = Date.now()) {
    await wait();
    if (db.lockedUntil > now) {
      throw new ApiError(`Muitas tentativas. Tente de novo em ${LOCK_MINUTES} minutos.`);
    }
    if (cpf.replace(/\D/g, '') !== DEMO.cpf || code !== DEMO.code) {
      db.attempts++;
      if (db.attempts >= MAX_ATTEMPTS) {
        db.attempts = 0;
        db.lockedUntil = now + LOCK_MINUTES * 60_000;
        throw new ApiError(`Muitas tentativas. Tente de novo em ${LOCK_MINUTES} minutos.`);
      }
      throw new ApiError('Código incorreto ou expirado. Confira e tente de novo.');
    }
    db.attempts = 0;
    return { token: 'demo-session' };
  },

  async getHome(): Promise<Home> {
    await wait();
    return {
      firstName: 'Marina',
      request: {
        number: '2026-48213',
        procedure: 'Artroplastia total de joelho',
        detail: 'Ortopedia · joelho direito',
        specialty: 'Ortopedia',
        city: 'Niterói',
        position: 42,
        total: 118,
        updatedAt: '2026-10-24',
        referral: { date: '2026-03-14', place: 'UBS Icaraí · médica de família' },
        reason:
          'Desgaste avançado da articulação do joelho direito (osteoartrose), com dor frequente e dificuldade para caminhar, sem melhora com fisioterapia e medicação.',
        priority: { level: 'Moderada', validatedAt: '2026-09-12' },
        lastStep: {
          title: 'Último passo: exame pedido pela equipe',
          detail: 'Envie o exame de risco cirúrgico na aba Documentos.',
          pending: db.documents.some((d) => d.status === 'pending'),
        },
        enteredAt: '2026-03-14',
        lastClinicalUpdate: '2026-09-08',
      },
      recent: (await demoApi.getHistory()).slice(0, 4),
    };
  },

  async getHistory(): Promise<TimelineEvent[]> {
    await wait();
    const uploads = db.documents
      .filter((d) => d.status !== 'pending' && d.date >= '2026-10-21')
      .map((d) => ({
        id: `h-${d.id}`,
        title: `Documento enviado: ${d.name.toLowerCase()}`,
        detail: 'Recebido e aguardando análise.',
        date: d.date,
        tone: 'strong' as const,
      }));
    return [
      ...uploads,
      {
        id: 'h6',
        title: 'Pedido de exame',
        detail: 'A equipe pediu o exame de risco cirúrgico.',
        date: '2026-10-22',
        tone: 'light' as const,
      },
      {
        id: 'h5',
        title: 'Documento enviado: raio-X do joelho',
        detail: 'Em análise pela equipe.',
        date: '2026-10-20',
        tone: 'strong' as const,
      },
      {
        id: 'h4',
        title: 'Prioridade atualizada e validada',
        detail: 'Prioridade moderada validada pela regulação.',
        date: '2026-09-12',
        tone: 'strong' as const,
      },
      {
        id: 'h3',
        title: 'Reavaliação concluída',
        detail: 'Um profissional de saúde concluiu a reavaliação do seu caso.',
        date: '2026-09-11',
        tone: 'muted' as const,
      },
      {
        id: 'h2',
        title: 'Documento enviado: ressonância do joelho',
        detail: 'Laudo recebido e em análise.',
        date: '2026-08-22',
        tone: 'muted' as const,
      },
      {
        id: 'h1',
        title: 'Entrada na fila de cirurgia eletiva',
        detail: 'Encaminhamento da UBS Icaraí.',
        date: '2026-03-14',
        tone: 'muted' as const,
      },
    ].sort((a, b) => b.date.localeCompare(a.date));
  },

  async getNotifications() {
    await wait();
    return db.notifications.map((n) => ({ ...n }));
  },

  async markNotificationsRead() {
    db.notifications.forEach((n) => (n.read = true));
  },

  async getDocuments() {
    await wait();
    return [...db.documents].sort((a, b) => b.date.localeCompare(a.date));
  },

  async uploadDocument({ file, type, requestedId }) {
    await wait();
    const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    const pending = requestedId && db.documents.find((d) => d.id === requestedId);
    if (pending) {
      Object.assign(pending, { status: 'received', date: today(), type });
      return pending;
    }
    const doc: Doc = { id: `d${Date.now()}`, name, type, date: today(), status: 'received' };
    db.documents.push(doc);
    return doc;
  },

  async getTerm() {
    return null;
  },

  async getProfile(): Promise<Profile> {
    await wait();
    return {
      name: 'Marina Albuquerque',
      initials: 'MA',
      cnsLast4: '4821',
      birthDate: '17/05/1964',
      phone: DEMO.phone,
      city: 'Niterói, RJ',
    };
  },

  async getContacts() {
    await wait();
    return [...db.contacts];
  },

  async addContact(contact: Omit<Contact, 'id' | 'since'>) {
    await wait();
    // The backend sends the SMS telling the contact they were authorized.
    db.contacts.push({ ...contact, id: `c${Date.now()}`, since: today() });
  },

  async removeContact(id: string) {
    await wait();
    db.contacts = db.contacts.filter((c) => c.id !== id);
  },

  async requestDataCopy() {
    await wait();
  },
};

/** Uses the SUSight-Backend when EXPO_PUBLIC_API_URL is set; otherwise the demo data above. */
const backend = process.env.EXPO_PUBLIC_API_URL;
export const api = backend ? createRealApi(backend) : demoApi;

/** With in-app notices turned off, only the requested-exam notice still shows (spec 003). */
export const visibleNotifications = (list: AppNotification[], noticesOn: boolean) =>
  noticesOn ? list : list.filter((n) => n.kind === 'exam_requested');

export const notificationTarget = {
  exam_requested: '/documents',
  document_received: '/documents',
  position_changed: '/home',
  analysis_done: '/history',
  exam_analyzing: '/documents',
} as const;
