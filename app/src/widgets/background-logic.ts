import { parseWidgetPayload, toWidgetInput, type WidgetPreferences } from "./remote";
import { buildWidgetSnapshot, type WidgetSnapshot } from "./snapshot";

// Atualização dos widgets com o app fechado (spec 004, item 4). Sem dependência nativa, para os testes.

export type BackgroundDeps = {
  getPreferences(): Promise<WidgetPreferences>;
  /** Token da sessão do paciente, ou `null` sem login. */
  getToken(): Promise<string | null>;
  /** `GET /me/widget`. */
  fetchWidget(token: string): Promise<unknown>;
  refresh(snapshot: WidgetSnapshot): Promise<void>;
};

/**
 * Encontra o campo `widget` do push nos formatos de cada sistema:
 * Android (`data.dataString`), iPhone (`data` ou `data.body`) e toque no aviso.
 */
export function extractWidgetPayload(taskData: unknown): unknown {
  const root = asObject(taskData);
  const data = asObject(root?.data);
  const candidates = [
    asObject(parseJson(data?.dataString)),
    asObject(data?.body),
    data,
    asObject(asObject(asObject(asObject(root?.notification)?.request)?.content)?.data),
  ];
  for (const candidate of candidates) {
    if (candidate?.widget !== undefined) return candidate.widget;
  }
  return null;
}

/** Atualiza com os dados do push; sem dados válidos no push, busca na API. */
export async function updateWidgetsFromPush(taskData: unknown, deps: BackgroundDeps) {
  const payload = extractWidgetPayload(taskData);
  if (payload !== null) return applyPayload(payload, deps);
  return updateWidgetsFromApi(deps);
}

/** Atualização periódica: busca `GET /me/widget` com o token guardado. */
export async function updateWidgetsFromApi(deps: BackgroundDeps) {
  const token = await deps.getToken();
  if (!token) return false;
  try {
    return await applyPayload(await deps.fetchWidget(token), deps);
  } catch (error) {
    console.warn("Não foi possível buscar os dados do widget.", error);
    return false;
  }
}

/** Dados inválidos mantêm o último widget: melhor do que mostrar uma posição errada. */
async function applyPayload(payload: unknown, deps: BackgroundDeps) {
  const remote = parseWidgetPayload(payload);
  if (!remote) return false;
  const input = toWidgetInput(remote, await deps.getPreferences());
  await deps.refresh(buildWidgetSnapshot(input));
  return true;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
