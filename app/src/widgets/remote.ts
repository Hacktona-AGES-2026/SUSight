import type { ExamStatus, WidgetInput, WidgetVariant } from "./snapshot";

// Dados do widget vindos do backend: `GET /me/widget` ou o campo `widget` do push (spec 004, plano).

export type RemoteWidgetData = Pick<WidgetInput, "queue" | "exams"> & {
  updatedAt: Date;
};

export type WidgetPreferences = {
  faceIdEnabled: boolean;
  variant: WidgetVariant;
};

const EXAM_STATUSES: ExamStatus[] = ["pendente", "recebido", "em_analise"];

/**
 * Valida o payload e devolve só os campos usados pelo widget.
 * Qualquer dado inválido devolve `null`: melhor manter o último retrato do que mostrar uma posição errada.
 */
export function parseWidgetPayload(raw: unknown): RemoteWidgetData | null {
  const data = typeof raw === "string" ? parseJson(raw) : raw;
  if (!isObject(data)) return null;

  const updatedAt = parseDate(data.updatedAt);
  if (!updatedAt || !Array.isArray(data.exams)) return null;

  const queue = data.queue === null ? null : parseQueue(data.queue);
  if (queue === undefined) return null;

  const exams: WidgetInput["exams"] = [];
  for (const item of data.exams) {
    if (!isObject(item) || typeof item.name !== "string") return null;
    if (!EXAM_STATUSES.includes(item.status as ExamStatus)) return null;
    const exam: WidgetInput["exams"][number] = {
      name: item.name,
      status: item.status as ExamStatus,
    };
    if (item.dueDate !== undefined) {
      const dueDate = parseDate(item.dueDate);
      if (!dueDate) return null;
      exam.dueDate = dueDate;
    }
    exams.push(exam);
  }

  return { queue, exams, updatedAt };
}

export function toWidgetInput(
  remote: RemoteWidgetData,
  preferences: WidgetPreferences,
): WidgetInput {
  return { signedIn: true, ...remote, ...preferences };
}

/** `undefined` quando a fila é inválida. */
function parseQueue(raw: unknown): WidgetInput["queue"] | undefined {
  if (!isObject(raw)) return undefined;
  const { position, total } = raw;
  if (!isPositiveInt(position) || !isPositiveInt(total) || position > total) {
    return undefined;
  }
  const queue: NonNullable<WidgetInput["queue"]> = { position, total };
  for (const key of ["positionWeekAgo", "positionMonthAgo"] as const) {
    const value = raw[key];
    if (value === undefined) continue;
    if (!isPositiveInt(value)) return undefined;
    queue[key] = value;
  }
  return queue;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
