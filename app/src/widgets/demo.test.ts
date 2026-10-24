import { demoWidgetInput } from "./demo";
import { buildWidgetSnapshot } from "./snapshot";

describe("dados de demonstração dos widgets", () => {
  it("reproduzem o exemplo do Figma", () => {
    const snapshot = buildWidgetSnapshot(
      demoWidgetInput(new Date("2026-10-24T12:41:00-03:00")),
    );
    if (!snapshot.signedIn) throw new Error("esperava um retrato com sessão");

    expect(snapshot.positionText).toBe("42ª");
    expect(snapshot.pendingText).toBe("1 exame pendente");
    expect(snapshot.exams.map((e) => e.name)).toEqual([
      "Ressonância",
      "Raio-X",
      "Exame de sangue",
    ]);
    expect(snapshot.riseText).toBe("Subiu 11 posições este mês");
    expect(snapshot.week).toEqual({ valueText: "↑ 3", captionText: "posições" });
    expect(snapshot.nextExam).toEqual({
      name: "Ressonância",
      dueText: "Enviar até sexta",
    });
    expect(snapshot.variant).toBe("padrao");
  });
});
