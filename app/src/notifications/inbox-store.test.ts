import type { InboxItem } from "./inbox";
import { createInboxStore, type InboxStorage } from "./inbox-store";

function memoryStorage(initial?: unknown): InboxStorage & { saved: () => unknown } {
  let value: string | null = initial === undefined ? null : JSON.stringify(initial);
  return {
    getItem: jest.fn(async () => value),
    setItem: jest.fn(async (_key: string, next: string) => {
      value = next;
    }),
    saved: () => (value === null ? null : JSON.parse(value)),
  };
}

function item(id: string, overrides: Partial<InboxItem> = {}): InboxItem {
  return {
    id,
    type: "documento_recebido",
    title: "Documento recebido",
    body: "Seu raio-X está em análise.",
    sentAt: `2026-10-${10 + Number(id)}T12:00:00.000Z`,
    read: false,
    ...overrides,
  };
}

describe("caixa de notificações guardada no aparelho", () => {
  it("começa vazia e lê o que estava guardado", async () => {
    const empty = createInboxStore(memoryStorage());
    await empty.load();
    expect(empty.getSnapshot()).toEqual([]);

    const saved = createInboxStore(memoryStorage([item("1", { read: true })]));
    await saved.load();
    expect(saved.getSnapshot()).toEqual([item("1", { read: true })]);
  });

  it("ignora o que estiver guardado com formato inválido", async () => {
    const store = createInboxStore(memoryStorage([item("1"), { id: "x", type: "outro" }, 42]));
    await store.load();
    expect(store.getSnapshot()).toEqual([item("1")]);

    const broken = createInboxStore({ getItem: async () => "{", setItem: async () => {} });
    await broken.load();
    expect(broken.getSnapshot()).toEqual([]);
  });

  it("acrescenta avisos, guarda e avisa quem está ouvindo", async () => {
    const storage = memoryStorage();
    const store = createInboxStore(storage);
    const listener = jest.fn();
    store.subscribe(listener);

    await store.add([item("1"), item("2")]);

    expect(store.getSnapshot().map((i) => i.id)).toEqual(["2", "1"]);
    expect(storage.saved()).toEqual(store.getSnapshot());
    expect(listener).toHaveBeenCalled();
  });

  it("carrega o que estava guardado antes de acrescentar, sem perder nada", async () => {
    const storage = memoryStorage([item("1", { read: true })]);
    const store = createInboxStore(storage);

    await store.add([item("2")]);

    expect(store.getSnapshot()).toEqual([item("2"), item("1", { read: true })]);
  });

  it("marca como lido e guarda", async () => {
    const storage = memoryStorage([item("1"), item("2")]);
    const store = createInboxStore(storage);

    await store.markRead("1");

    expect(store.getSnapshot().find((i) => i.id === "1")?.read).toBe(true);
    expect(storage.saved()).toEqual(store.getSnapshot());
  });

  it("alterações seguidas não se atropelam", async () => {
    const store = createInboxStore(memoryStorage());

    await Promise.all([store.add([item("1")]), store.add([item("2")]), store.markRead("1")]);

    expect(store.getSnapshot()).toEqual([item("2"), item("1", { read: true })]);
  });

  it("para de avisar depois de cancelar a escuta", async () => {
    const store = createInboxStore(memoryStorage());
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();

    await store.add([item("1")]);

    expect(listener).not.toHaveBeenCalled();
  });
});
