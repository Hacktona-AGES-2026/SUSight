import type { PickedFile } from './format';

export type Priority = 'Baixa' | 'Moderada' | 'Alta';
export type DocType = 'Exame' | 'Laudo' | 'Relatório' | 'Outro';
export type DocStatus = 'pending' | 'received' | 'analyzing';

export type Doc = { id: string; name: string; type: DocType; date: string; status: DocStatus };

export type TimelineEvent = {
  id: string;
  title: string;
  detail: string;
  date: string;
  /** Recent facts get the strong dot, information requests the light one, old ones gray. */
  tone: 'strong' | 'light' | 'muted';
};

export type NotificationKind = 'document_received' | 'exam_requested' | 'position_changed' | 'analysis_done' | 'exam_analyzing';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
};

export type Home = {
  firstName: string;
  request: {
    number: string;
    procedure: string;
    detail: string;
    specialty: string;
    city: string;
    /** Position in the official queue approved by a doctor. Never a pending AI proposal. */
    position: number;
    total: number;
    updatedAt: string;
    referral: { date: string; place: string };
    reason: string;
    priority: { level: Priority; validatedAt?: string };
    lastStep: { title: string; detail: string; pending: boolean };
    enteredAt: string;
    lastClinicalUpdate: string;
  };
  recent: TimelineEvent[];
};

export type Profile = {
  name: string;
  initials: string;
  cnsLast4: string;
  birthDate: string;
  phone: string;
  city: string;
};

export type Relation = 'Filho ou filha' | 'Cônjuge' | 'Pai ou mãe' | 'Irmão ou irmã' | 'Outro';
export type Contact = { id: string; name: string; relation: Relation; phone: string; since: string };

export class ApiError extends Error {}

export interface Api {
  requestCode(cpf: string): Promise<{ phone?: string }>;
  verifyCode(cpf: string, code: string, now?: number): Promise<{ token: string }>;
  getHome(): Promise<Home>;
  getHistory(): Promise<TimelineEvent[]>;
  getNotifications(): Promise<AppNotification[]>;
  markNotificationsRead(): Promise<void>;
  getDocuments(): Promise<Doc[]>;
  /** Upload term the patient must accept before sending a file; null when there is none (demo). */
  getTerm(): Promise<{ version: string; text: string } | null>;
  uploadDocument(args: { file: PickedFile; type: DocType; requestedId?: string; termVersion?: string }): Promise<Doc>;
  getProfile(): Promise<Profile>;
  getContacts(): Promise<Contact[]>;
  addContact(contact: Omit<Contact, 'id' | 'since'>): Promise<void>;
  removeContact(id: string): Promise<void>;
  requestDataCopy(): Promise<void>;
}
