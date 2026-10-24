import { demoWidgetInput } from "./demo";
import { clearAllWidgets, refreshAllWidgets, type WidgetTargets } from "./refresh";
import { buildWidgetSnapshot } from "./snapshot";
import { SNAPSHOT_KEY } from "./sync";

const snapshot = buildWidgetSnapshot(demoWidgetInput(new Date("2026-10-24T12:41:00-03:00")));

function fakeTargets() {
  const ios = { set: jest.fn(), reload: jest.fn() };
  const android = {
    save: jest.fn(async (_snapshot: unknown) => {}),
    update: jest.fn(async (_name: string, _snapshot: unknown) => {}),
  };
  return { ios, android, targets: { ios, android } satisfies WidgetTargets };
}

describe("refreshAllWidgets", () => {
  it("atualiza o iPhone e os três widgets do Android com o mesmo retrato", async () => {
    const { ios, android, targets } = fakeTargets();

    await refreshAllWidgets(snapshot, targets);

    expect(JSON.parse(ios.set.mock.calls[0][1])).toEqual(snapshot);
    expect(ios.set.mock.calls[0][0]).toBe(SNAPSHOT_KEY);
    expect(ios.reload).toHaveBeenCalled();
    expect(android.save).toHaveBeenCalledWith(snapshot);
    expect(android.update.mock.calls.map((c) => c[0])).toEqual([
      "PositionWidget",
      "NextExamWidget",
      "WeekWidget",
    ]);
  });

  it("funciona com só um dos sistemas", async () => {
    const { android } = fakeTargets();
    await expect(refreshAllWidgets(snapshot, { ios: null, android })).resolves.toBeUndefined();
    expect(android.update).toHaveBeenCalledTimes(3);
  });

  it("não quebra se o Android falhar ao redesenhar", async () => {
    const { ios } = fakeTargets();
    const android = {
      save: jest.fn(async () => {}),
      update: jest.fn(async () => {
        throw new Error("sem widget na tela");
      }),
    };
    await expect(refreshAllWidgets(snapshot, { ios, android })).resolves.toBeUndefined();
    expect(ios.reload).toHaveBeenCalled();
  });

  it("ao sair, os dois sistemas passam a mostrar o convite para abrir o app", async () => {
    const { ios, android, targets } = fakeTargets();

    await clearAllWidgets(targets);

    expect(JSON.parse(ios.set.mock.calls[0][1]).signedIn).toBe(false);
    expect(android.save.mock.calls[0][0]).toMatchObject({ signedIn: false });
  });
});
