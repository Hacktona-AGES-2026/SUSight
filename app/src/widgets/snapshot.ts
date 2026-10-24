// Retrato pronto para os widgets de iPhone (spec 004).
// Toda regra e todo texto ficam aqui; a extensão em Swift só desenha.

export type ExamStatus = "pendente" | "recebido" | "em_analise";
export type WidgetVariant = "padrao" | "invertido";

export type WidgetInput = {
  signedIn: boolean;
  /** Fila oficial aprovada; `null` quando ainda não há posição. */
  queue: {
    position: number;
    total: number;
    /** Posição uma semana atrás, se houver histórico. */
    positionWeekAgo?: number;
    /** Posição um mês atrás, se houver histórico. */
    positionMonthAgo?: number;
  } | null;
  exams: { name: string; status: ExamStatus; dueDate?: Date }[];
  faceIdEnabled: boolean;
  variant: WidgetVariant;
  updatedAt: Date;
};

export type WidgetExam = { name: string; statusText: string; pending: boolean };

export type SignedOutSnapshot = {
  version: 1;
  signedIn: false;
  signedOutText: string;
  accessibilityText: string;
  variant: WidgetVariant;
};

export type SignedInSnapshot = {
  version: 1;
  signedIn: true;
  positionText: string | null;
  ringProgress: number;
  pendingText: string;
  exams: WidgetExam[];
  riseText: string | null;
  /** Widget "Próximo exame" (Android). */
  nextExam: { name: string; dueText: string } | null;
  /** Widget "Esta semana" (Android). */
  week: { valueText: string; captionText: string };
  /** Frase lida pelo VoiceOver e pelo TalkBack. */
  accessibilityText: string;
  hideWhenLocked: boolean;
  variant: WidgetVariant;
  updatedAtText: string;
  updatedAt: string;
};

export type WidgetSnapshot = SignedOutSnapshot | SignedInSnapshot;

const MAX_EXAMS = 3;

// Situações da spec 001, na ordem em que aparecem no widget.
const STATUS_TEXT: Record<ExamStatus, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  recebido: "Recebido",
};
const STATUS_ORDER: ExamStatus[] = ["pendente", "em_analise", "recebido"];

export function buildWidgetSnapshot(input: WidgetInput): WidgetSnapshot {
  if (!input.signedIn) {
    const text = "Abra o SUSight para ver sua posição";
    return {
      version: 1,
      signedIn: false,
      signedOutText: text,
      accessibilityText: text,
      variant: input.variant,
    };
  }

  const { queue } = input;
  const pendingCount = input.exams.filter(
    (e) => e.status === "pendente",
  ).length;
  const positionText = queue ? `${queue.position}ª` : null;
  const pending = pendingText(pendingCount);
  const rise = queue ? riseText(queue.position, queue.positionMonthAgo) : null;

  return {
    version: 1,
    signedIn: true,
    positionText,
    ringProgress: queue ? (queue.total - queue.position + 1) / queue.total : 0,
    pendingText: pending,
    exams: [...input.exams]
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      )
      .slice(0, MAX_EXAMS)
      .map((e) => ({
        name: e.name,
        statusText: STATUS_TEXT[e.status],
        pending: e.status === "pendente",
      })),
    riseText: rise,
    nextExam: nextExam(input.exams, input.updatedAt),
    week: weekSummary(queue, positionText),
    accessibilityText: [
      queue
        ? `Sua posição na fila: ${positionText} de ${queue.total}.`
        : "Posição ainda indisponível. Abra o SUSight para ver.",
      `${pending}.`,
      rise ? `${rise}.` : null,
    ]
      .filter(Boolean)
      .join(" "),
    hideWhenLocked: input.faceIdEnabled,
    variant: input.variant,
    updatedAtText: `Atualizada em ${shortDate(input.updatedAt)}`,
    updatedAt: input.updatedAt.toISOString().replace(/\.\d{3}Z$/, "Z"),
  };
}

function pendingText(count: number): string {
  if (count === 0) return "Nenhum exame pendente";
  return count === 1 ? "1 exame pendente" : `${count} exames pendentes`;
}

function riseText(position: number, positionMonthAgo?: number): string | null {
  if (positionMonthAgo === undefined) return null;
  const rise = positionMonthAgo - position;
  if (rise <= 0) return null;
  return rise === 1
    ? "Subiu 1 posição este mês"
    : `Subiu ${rise} posições este mês`;
}

function nextExam(
  exams: WidgetInput["exams"],
  now: Date,
): SignedInSnapshot["nextExam"] {
  const pending = exams
    .filter((e) => e.status === "pendente")
    .sort(
      (a, b) =>
        (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity),
    );
  const exam = pending[0];
  if (!exam) return null;
  return { name: exam.name, dueText: dueText(exam.dueDate, now) };
}

const DAY = 24 * 60 * 60 * 1000;

function dueText(dueDate: Date | undefined, now: Date): string {
  if (!dueDate) return "Envie pelo app";
  const days = (dueDate.getTime() - now.getTime()) / DAY;
  // Prazo vencido: orienta sem alarme (constituição, item 7).
  if (days < 0) return "Envie assim que puder";
  if (days < 7) return `Enviar até ${weekday(dueDate)}`;
  return `Enviar até ${shortDate(dueDate)}`;
}

function weekSummary(
  queue: WidgetInput["queue"],
  positionText: string | null,
): SignedInSnapshot["week"] {
  const rise =
    queue?.positionWeekAgo !== undefined
      ? queue.positionWeekAgo - queue.position
      : 0;
  if (rise > 0) {
    return {
      valueText: `↑ ${rise}`,
      captionText: rise === 1 ? "posição" : "posições",
    };
  }
  return { valueText: positionText ?? "–", captionText: "sua posição" };
}

/** "sexta", no fuso de Brasília. */
function weekday(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    timeZone: "America/Sao_Paulo",
  })
    .format(date)
    .replace("-feira", "");
}

/** "24 de out", no fuso de Brasília. */
function shortDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value.replace(".", "");
  return `${day} de ${month}`;
}
