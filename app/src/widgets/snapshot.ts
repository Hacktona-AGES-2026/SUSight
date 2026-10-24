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
    /** Posição um mês atrás, se houver histórico. */
    positionMonthAgo?: number;
  } | null;
  exams: { name: string; status: ExamStatus }[];
  faceIdEnabled: boolean;
  variant: WidgetVariant;
  updatedAt: Date;
};

export type WidgetExam = { name: string; statusText: string; pending: boolean };

export type SignedOutSnapshot = {
  version: 1;
  signedIn: false;
  signedOutText: string;
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
    return {
      version: 1,
      signedIn: false,
      signedOutText: "Abra o SUSight para ver sua posição",
      variant: input.variant,
    };
  }

  const { queue } = input;
  const pendingCount = input.exams.filter(
    (e) => e.status === "pendente",
  ).length;

  return {
    version: 1,
    signedIn: true,
    positionText: queue ? `${queue.position}ª` : null,
    ringProgress: queue ? (queue.total - queue.position + 1) / queue.total : 0,
    pendingText: pendingText(pendingCount),
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
    riseText: queue ? riseText(queue.position, queue.positionMonthAgo) : null,
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
