import { demoNotifications, parseNotificationList, syncInbox } from "./remote";

const valid = {
  id: "n1",
  type: "documento_recebido",
  title: "Documento recebido",
  body: "Seu raio-X está em análise.",
  sentAt: "2026-10-20T12:00:00.000Z",
};

describe("parseNotificationList", () => {
  it("aceita a lista de GET /me/notifications e descarta os itens inválidos", () => {
    const list = parseNotificationList([valid, { ...valid, id: "n2", type: "proposta_rejeitada" }, "x"]);

    expect(list).toEqual([{ ...valid, read: false }]);
  });

  it("resposta que não é lista vira lista vazia", () => {
    expect(parseNotificationList({ items: [valid] })).toEqual([]);
    expect(parseNotificationList(null)).toEqual([]);
  });
});

describe("syncInbox", () => {
  it("com backend e sessão, busca a lista na API e guarda", async () => {
    const add = jest.fn(async () => {});
    const fetchList = jest.fn(async () => [valid]);

    await syncInbox({ apiConfigured: true, getToken: async () => "t", fetchList, add, now: new Date() });

    expect(fetchList).toHaveBeenCalledWith("t");
    expect(add).toHaveBeenCalledWith([{ ...valid, read: false }]);
  });

  it("com backend e sem sessão, não busca nada", async () => {
    const add = jest.fn(async () => {});
    const fetchList = jest.fn(async () => [valid]);

    await syncInbox({ apiConfigured: true, getToken: async () => null, fetchList, add, now: new Date() });

    expect(fetchList).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
  });

  it("falha na API mantém a lista guardada", async () => {
    const add = jest.fn(async () => {});
    const fetchList = jest.fn(async () => {
      throw new Error("sem rede");
    });
    jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      syncInbox({ apiConfigured: true, getToken: async () => "t", fetchList, add, now: new Date() }),
    ).resolves.toBe(false);
    expect(add).not.toHaveBeenCalled();
  });

  it("sem backend, usa a demonstração", async () => {
    const add = jest.fn(async () => {});
    const now = new Date("2026-10-24T12:00:00.000Z");

    await syncInbox({ apiConfigured: false, getToken: async () => null, fetchList: jest.fn(), add, now });

    expect(add).toHaveBeenCalledWith(demoNotifications(now));
  });
});

describe("demonstração", () => {
  const items = demoNotifications(new Date("2026-10-24T12:00:00.000Z"));

  it("traz os avisos da spec 002, com o exame pedido e um aviso novo", () => {
    expect(items.map((i) => i.type)).toEqual(
      expect.arrayContaining(["documento_recebido", "exame_pendente", "posicao_mudou", "analise_concluida"]),
    );
    expect(items.some((i) => !i.read)).toBe(true);
    expect(parseNotificationList(items)).toHaveLength(items.length);
  });

  it("textos sem alarme e sem prometer data de cirurgia", () => {
    for (const { title, body } of items) {
      expect(`${title} ${body}`).not.toMatch(/!|urgente|sua cirurgia será|data da sua cirurgia é/i);
    }
  });

  it("a mudança de posição traz a nova posição e o motivo", () => {
    const moved = items.find((i) => i.type === "posicao_mudou");
    expect(moved?.body).toMatch(/42ª/);
    expect(moved?.body).toMatch(/porque/);
  });
});
