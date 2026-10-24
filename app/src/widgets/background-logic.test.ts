import {
  extractWidgetPayload,
  updateWidgetsFromApi,
  updateWidgetsFromPush,
  type BackgroundDeps,
} from "./background-logic";

const widget = {
  queue: { position: 31, total: 118, positionWeekAgo: 42, positionMonthAgo: 53 },
  exams: [{ name: "Ressonância", status: "pendente" }],
  updatedAt: "2026-10-24T12:41:00-03:00",
};

function deps(overrides: Partial<BackgroundDeps> = {}) {
  const refresh = jest.fn(async (_snapshot: unknown) => {});
  const fetchWidget = jest.fn(async (_token: string) => widget as unknown);
  const all: BackgroundDeps = {
    getPreferences: async () => ({ faceIdEnabled: false, variant: "padrao" }),
    getToken: async () => "token-do-paciente",
    fetchWidget,
    refresh,
    ...overrides,
  };
  return { all, refresh, fetchWidget };
}

describe("extractWidgetPayload", () => {
  it("lê o push do Android, que chega como texto em dataString", () => {
    expect(
      extractWidgetPayload({ data: { dataString: JSON.stringify({ type: "posicao_mudou", widget }) } }),
    ).toEqual(widget);
  });

  it("lê o push do iPhone, com os dados no próprio data ou em body", () => {
    expect(extractWidgetPayload({ data: { widget } })).toEqual(widget);
    expect(extractWidgetPayload({ data: { body: { widget } } })).toEqual(widget);
  });

  it("lê a resposta de um toque no aviso", () => {
    expect(
      extractWidgetPayload({ notification: { request: { content: { data: { widget } } } } }),
    ).toEqual(widget);
  });

  it("devolve null quando o push não traz dados de widget", () => {
    expect(extractWidgetPayload({ data: { type: "documento_recebido" } })).toBeNull();
    expect(extractWidgetPayload(undefined)).toBeNull();
    expect(extractWidgetPayload({ data: { dataString: "não é json" } })).toBeNull();
  });
});

describe("updateWidgetsFromPush", () => {
  it("atualiza os widgets com os dados do push, sem buscar na API", async () => {
    const { all, refresh, fetchWidget } = deps();

    await expect(updateWidgetsFromPush({ data: { widget } }, all)).resolves.toBe(true);

    expect(fetchWidget).not.toHaveBeenCalled();
    expect(refresh.mock.calls[0][0]).toMatchObject({ signedIn: true, positionText: "31ª" });
  });

  it("sem dados no push, busca na API", async () => {
    const { all, refresh, fetchWidget } = deps();

    await updateWidgetsFromPush({ data: { type: "documento_recebido" } }, all);

    expect(fetchWidget).toHaveBeenCalledWith("token-do-paciente");
    expect(refresh).toHaveBeenCalled();
  });

  it("usa as preferências do paciente (Face ID e variante)", async () => {
    const { all, refresh } = deps({
      getPreferences: async () => ({ faceIdEnabled: true, variant: "invertido" }),
    });

    await updateWidgetsFromPush({ data: { widget } }, all);

    expect(refresh.mock.calls[0][0]).toMatchObject({ hideWhenLocked: true, variant: "invertido" });
  });

  it("dados inválidos no push não trocam o widget por uma posição errada", async () => {
    const { all, refresh } = deps({ fetchWidget: async () => ({ invalido: true }) });

    await expect(
      updateWidgetsFromPush({ data: { widget: { ...widget, queue: { position: -1, total: 1 } } } }, all),
    ).resolves.toBe(false);

    expect(refresh).not.toHaveBeenCalled();
  });
});

describe("updateWidgetsFromApi", () => {
  it("busca com o token guardado e atualiza", async () => {
    const { all, refresh } = deps();
    await expect(updateWidgetsFromApi(all)).resolves.toBe(true);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("sem login, não busca nada", async () => {
    const { all, refresh, fetchWidget } = deps({ getToken: async () => null });
    await expect(updateWidgetsFromApi(all)).resolves.toBe(false);
    expect(fetchWidget).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("falha de rede mantém o último widget", async () => {
    const { all, refresh } = deps({
      fetchWidget: async () => {
        throw new Error("sem rede");
      },
    });
    await expect(updateWidgetsFromApi(all)).resolves.toBe(false);
    expect(refresh).not.toHaveBeenCalled();
  });
});
