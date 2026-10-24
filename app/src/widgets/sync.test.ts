import { buildWidgetSnapshot } from "./snapshot";
import {
  APP_GROUP,
  SNAPSHOT_KEY,
  clearWidgets,
  syncWidgets,
  type WidgetStorage,
} from "./sync";

function fakeStorage() {
  const values = new Map<string, string>();
  const storage: WidgetStorage = {
    set: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    reload: jest.fn(),
  };
  return { storage, values };
}

const snapshot = buildWidgetSnapshot({
  signedIn: true,
  queue: { position: 42, total: 118, positionMonthAgo: 53 },
  exams: [{ name: "Ressonância", status: "pendente" }],
  faceIdEnabled: false,
  variant: "padrao",
  updatedAt: new Date("2026-10-24T12:41:00-03:00"),
});

describe("gravação dos widgets", () => {
  it("usa o mesmo App Group da extensão", () => {
    expect(APP_GROUP).toBe("group.com.hacktonaages2026.pulse");
  });

  it("grava o retrato em JSON e recarrega os widgets", () => {
    const { storage, values } = fakeStorage();

    syncWidgets(snapshot, storage);

    expect(JSON.parse(values.get(SNAPSHOT_KEY)!)).toEqual(snapshot);
    expect(storage.reload).toHaveBeenCalledTimes(1);
  });

  it("ao sair, troca o retrato pelo de sem sessão, sem dados do paciente", () => {
    const { storage, values } = fakeStorage();
    syncWidgets(snapshot, storage);

    clearWidgets(storage);

    const saved = JSON.parse(values.get(SNAPSHOT_KEY)!);
    expect(saved.signedIn).toBe(false);
    expect(JSON.stringify(saved)).not.toContain("42ª");
    expect(storage.reload).toHaveBeenCalledTimes(2);
  });

  it("não quebra o app se o armazenamento falhar", () => {
    const storage: WidgetStorage = {
      set: () => {
        throw new Error("sem App Group");
      },
      reload: jest.fn(),
    };

    expect(() => syncWidgets(snapshot, storage)).not.toThrow();
    expect(storage.reload).not.toHaveBeenCalled();
  });
});
