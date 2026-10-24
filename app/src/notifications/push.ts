import { tabFromUrl, type WidgetTab } from "../widgets/links";

// Regras das push notifications do paciente (specs 002 e 004). Sem dependência nativa, para os testes.

export type PermissionStatus = "granted" | "denied" | "undetermined";

export type PermissionApi = {
  getStatus(): Promise<PermissionStatus>;
  request(): Promise<PermissionStatus>;
};

export const PERMISSION_EXPLANATION = {
  title: "Avisos do SUSight",
  message:
    "Avisamos quando sua posição na fila mudar, quando um exame for pedido e quando seu documento for recebido. Você pode desligar quando quiser no Perfil.",
  accept: "Permitir avisos",
  decline: "Agora não",
};

export const ANDROID_CHANNEL = { id: "avisos-da-fila", name: "Avisos da fila" };

/**
 * Pede permissão só uma vez, explicando antes para que serve.
 * `explain` mostra a explicação e devolve se o paciente quer continuar.
 */
export async function ensurePushPermission(
  api: PermissionApi,
  explain: (text: typeof PERMISSION_EXPLANATION) => Promise<boolean>,
): Promise<boolean> {
  const status = await api.getStatus();
  if (status !== "undetermined") return status === "granted";
  if (!(await explain(PERMISSION_EXPLANATION))) return false;
  return (await api.request()) === "granted";
}

/** Registra o token no backend (`POST /me/push-token`). Devolve o token ou `null`. */
export async function registerPushToken({
  isDevice,
  hasPermission,
  getToken,
  send,
}: {
  isDevice: boolean;
  hasPermission: boolean;
  getToken(): Promise<string>;
  send(token: string): Promise<void>;
}): Promise<string | null> {
  // Simuladores não recebem push.
  if (!isDevice || !hasPermission) return null;
  try {
    const token = await getToken();
    await send(token);
    return token;
  } catch (error) {
    console.warn("Não foi possível registrar os avisos.", error);
    return null;
  }
}

export type PushType =
  | "posicao_mudou"
  | "exame_em_analise"
  | "exame_pendente"
  | "documento_recebido"
  /** A análise terminou sem mudança de posição (spec 002, item 10). */
  | "analise_concluida";

const TAB_BY_TYPE: Record<PushType, WidgetTab> = {
  posicao_mudou: "inicio",
  exame_em_analise: "documentos",
  exame_pendente: "documentos",
  documento_recebido: "documentos",
  analise_concluida: "inicio",
};

/** Aba que o toque na notificação abre: o link do push ou, sem link, a aba do tipo do aviso. */
export function tabFromNotification(data: Record<string, unknown> | undefined): WidgetTab {
  const fromUrl = tabFromUrl(typeof data?.url === "string" ? data.url : null);
  if (fromUrl) return fromUrl;
  const type = data?.type as PushType | undefined;
  return (type && TAB_BY_TYPE[type]) ?? "inicio";
}
