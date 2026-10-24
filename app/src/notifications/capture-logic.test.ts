import { fromExpoNotification, fromBackgroundTask } from "./capture-logic";

const data = { id: "n1", type: "exame_pendente", url: "pulse://documentos", sentAt: "2026-10-18T12:00:00.000Z" };
const expected = {
  id: "n1",
  type: "exame_pendente",
  title: "Falta um exame",
  body: "Envie o laudo da ressonância.",
  sentAt: "2026-10-18T12:00:00.000Z",
  read: false,
};

function expoNotification(overrides: { data?: Record<string, unknown>; identifier?: string } = {}) {
  return {
    date: Date.parse("2026-10-19T08:00:00.000Z"),
    request: {
      identifier: overrides.identifier ?? "sistema-1",
      content: { title: expected.title, body: expected.body, data: overrides.data ?? data },
    },
  };
}

describe("fromExpoNotification", () => {
  it("transforma o aviso do sistema em item da lista", () => {
    expect(fromExpoNotification(expoNotification())).toEqual(expected);
  });

  it("sem id e sem data no push, usa o identificador e a hora do aparelho", () => {
    const item = fromExpoNotification(expoNotification({ data: { type: "exame_pendente" } }));

    expect(item).toEqual({ ...expected, id: "sistema-1", sentAt: "2026-10-19T08:00:00.000Z" });
  });

  it("descarta aviso de tipo desconhecido", () => {
    expect(fromExpoNotification(expoNotification({ data: { ...data, type: "proposta_rejeitada" } }))).toBeNull();
  });
});

describe("fromBackgroundTask", () => {
  it("lê o push do iPhone (data.body e aps.alert)", () => {
    const task = { data: { body: data, aps: { alert: { title: expected.title, body: expected.body } } } };
    expect(fromBackgroundTask(task)).toEqual(expected);
  });

  it("lê o push do Android (dataString, title e message)", () => {
    const task = { data: { dataString: JSON.stringify(data), title: expected.title, message: expected.body } };
    expect(fromBackgroundTask(task)).toEqual(expected);
  });

  it("lê o aviso no formato do expo-notifications", () => {
    expect(fromBackgroundTask({ notification: expoNotification() })).toEqual(expected);
  });

  it("push só com dados, sem título, não entra na lista", () => {
    expect(fromBackgroundTask({ data: { dataString: JSON.stringify(data) } })).toBeNull();
    expect(fromBackgroundTask(undefined)).toBeNull();
  });
});
