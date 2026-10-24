import {
  buildWidgetSnapshot as buildAny,
  type SignedInSnapshot,
  type WidgetInput,
} from "./snapshot";

const now = new Date("2026-10-24T12:41:00-03:00");

const base: WidgetInput = {
  signedIn: true,
  queue: { position: 42, total: 118, positionMonthAgo: 53 },
  exams: [
    { name: "Exame de sangue", status: "recebido" },
    { name: "Raio-X", status: "em_analise" },
    { name: "Ressonância", status: "pendente" },
  ],
  faceIdEnabled: false,
  variant: "padrao",
  updatedAt: now,
};

/** Retrato de quem tem sessão; falha o teste se vier o de "sem sessão". */
function buildWidgetSnapshot(input: WidgetInput): SignedInSnapshot {
  const snapshot = buildAny(input);
  if (!snapshot.signedIn) throw new Error("esperava um retrato com sessão");
  return snapshot;
}

describe("buildWidgetSnapshot", () => {
  it("mostra a posição com o ordinal", () => {
    expect(buildWidgetSnapshot(base).positionText).toBe("42ª");
  });

  it("enche o anel conforme o paciente se aproxima da frente da fila", () => {
    expect(buildWidgetSnapshot(base).ringProgress).toBeCloseTo(77 / 118);
    const first = buildWidgetSnapshot({
      ...base,
      queue: { position: 1, total: 118 },
    });
    expect(first.ringProgress).toBe(1);
  });

  it("conta os exames pendentes no singular e no plural", () => {
    expect(buildWidgetSnapshot(base).pendingText).toBe("1 exame pendente");
    const two = buildWidgetSnapshot({
      ...base,
      exams: [
        { name: "Ressonância", status: "pendente" },
        { name: "Raio-X", status: "pendente" },
      ],
    });
    expect(two.pendingText).toBe("2 exames pendentes");
    const none = buildWidgetSnapshot({ ...base, exams: [] });
    expect(none.pendingText).toBe("Nenhum exame pendente");
  });

  it("lista até 3 exames com os pendentes primeiro e as situações da spec 001", () => {
    const snapshot = buildWidgetSnapshot({
      ...base,
      exams: [...base.exams, { name: "Eletrocardiograma", status: "recebido" }],
    });
    expect(snapshot.exams).toEqual([
      { name: "Ressonância", statusText: "Pendente", pending: true },
      { name: "Raio-X", statusText: "Em análise", pending: false },
      { name: "Exame de sangue", statusText: "Recebido", pending: false },
    ]);
  });

  it("mostra 'subiu X posições' só quando a posição subiu", () => {
    expect(buildWidgetSnapshot(base).riseText).toBe(
      "Subiu 11 posições este mês",
    );
    const one = buildWidgetSnapshot({
      ...base,
      queue: { position: 42, total: 118, positionMonthAgo: 43 },
    });
    expect(one.riseText).toBe("Subiu 1 posição este mês");

    const down = buildWidgetSnapshot({
      ...base,
      queue: { position: 42, total: 118, positionMonthAgo: 40 },
    });
    const same = buildWidgetSnapshot({
      ...base,
      queue: { position: 42, total: 118, positionMonthAgo: 42 },
    });
    const noHistory = buildWidgetSnapshot({
      ...base,
      queue: { position: 42, total: 118 },
    });
    expect(down.riseText).toBeNull();
    expect(same.riseText).toBeNull();
    expect(noHistory.riseText).toBeNull();
  });

  it("pede para esconder a posição com o aparelho bloqueado quando o Face ID está ativo", () => {
    expect(buildWidgetSnapshot(base).hideWhenLocked).toBe(false);
    expect(
      buildWidgetSnapshot({ ...base, faceIdEnabled: true }).hideWhenLocked,
    ).toBe(true);
  });

  it("leva a variante de cor escolhida", () => {
    expect(buildWidgetSnapshot(base).variant).toBe("padrao");
    expect(
      buildWidgetSnapshot({ ...base, variant: "invertido" }).variant,
    ).toBe("invertido");
  });

  it("guarda a data da informação para mostrar quando estiver sem conexão", () => {
    const snapshot = buildWidgetSnapshot(base);
    expect(snapshot.updatedAtText).toBe("Atualizada em 24 de out");
    expect(snapshot.updatedAt).toBe("2026-10-24T15:41:00Z");
  });

  it("sem sessão, não leva nenhum dado do paciente", () => {
    const snapshot = buildAny({ ...base, signedIn: false });
    expect(snapshot).toEqual({
      version: 1,
      signedIn: false,
      signedOutText: "Abra o SUSight para ver sua posição",
      accessibilityText: "Abra o SUSight para ver sua posição",
      variant: "padrao",
    });
  });

  it("sem posição na fila, orienta a abrir o app", () => {
    const snapshot = buildWidgetSnapshot({ ...base, queue: null });
    expect(snapshot.signedIn).toBe(true);
    expect(snapshot.positionText).toBeNull();
    expect(snapshot.ringProgress).toBe(0);
    expect(snapshot.riseText).toBeNull();
  });

  it("não usa palavras de alarme nem promete data de cirurgia", () => {
    const snapshot = buildWidgetSnapshot(base);
    const texts = JSON.stringify(snapshot).toLowerCase();
    for (const word of ["urgente", "atenção", "cirurgia em", "previsão"]) {
      expect(texts).not.toContain(word);
    }
  });

  describe("próximo exame (Android)", () => {
    it("mostra o exame pendente com o prazo mais próximo", () => {
      const snapshot = buildWidgetSnapshot({
        ...base,
        exams: [
          { name: "Raio-X", status: "pendente", dueDate: new Date("2026-11-10T12:00:00-03:00") },
          { name: "Ressonância", status: "pendente", dueDate: new Date("2026-10-30T12:00:00-03:00") },
        ],
      });
      expect(snapshot.nextExam).toEqual({
        name: "Ressonância",
        dueText: "Enviar até sexta",
      });
    });

    it("usa a data quando o prazo passa de uma semana", () => {
      const snapshot = buildWidgetSnapshot({
        ...base,
        exams: [
          { name: "Raio-X", status: "pendente", dueDate: new Date("2026-11-10T12:00:00-03:00") },
        ],
      });
      expect(snapshot.nextExam?.dueText).toBe("Enviar até 10 de nov");
    });

    it("sem prazo ou com prazo vencido, só orienta a enviar, sem alarme", () => {
      const noDue = buildWidgetSnapshot(base);
      expect(noDue.nextExam).toEqual({ name: "Ressonância", dueText: "Envie pelo app" });
      const late = buildWidgetSnapshot({
        ...base,
        exams: [
          { name: "Raio-X", status: "pendente", dueDate: new Date("2026-10-20T12:00:00-03:00") },
        ],
      });
      expect(late.nextExam?.dueText).toBe("Envie assim que puder");
    });

    it("sem exame pendente, não há próximo exame", () => {
      const snapshot = buildWidgetSnapshot({
        ...base,
        exams: [{ name: "Raio-X", status: "recebido" }],
      });
      expect(snapshot.nextExam).toBeNull();
    });
  });

  describe("esta semana (Android)", () => {
    it("mostra quantas posições subiu na semana", () => {
      const snapshot = buildWidgetSnapshot({
        ...base,
        queue: { position: 42, total: 118, positionWeekAgo: 45 },
      });
      expect(snapshot.week).toEqual({ valueText: "↑ 3", captionText: "posições" });
      const one = buildWidgetSnapshot({
        ...base,
        queue: { position: 42, total: 118, positionWeekAgo: 43 },
      });
      expect(one.week).toEqual({ valueText: "↑ 1", captionText: "posição" });
    });

    it("quando não subiu, mostra só a posição atual", () => {
      const down = buildWidgetSnapshot({
        ...base,
        queue: { position: 42, total: 118, positionWeekAgo: 40 },
      });
      expect(down.week).toEqual({ valueText: "42ª", captionText: "sua posição" });
      const noQueue = buildWidgetSnapshot({ ...base, queue: null });
      expect(noQueue.week).toEqual({ valueText: "–", captionText: "sua posição" });
    });
  });

  describe("leitor de tela (VoiceOver e TalkBack)", () => {
    it("lê o widget como uma frase completa", () => {
      expect(buildWidgetSnapshot(base).accessibilityText).toBe(
        "Sua posição na fila: 42ª de 118. 1 exame pendente. Subiu 11 posições este mês.",
      );
    });

    it("não lê a variação quando a posição não subiu", () => {
      const snapshot = buildWidgetSnapshot({
        ...base,
        queue: { position: 42, total: 118, positionMonthAgo: 40 },
        exams: [],
      });
      expect(snapshot.accessibilityText).toBe(
        "Sua posição na fila: 42ª de 118. Nenhum exame pendente.",
      );
    });

    it("sem posição, orienta a abrir o app", () => {
      const snapshot = buildWidgetSnapshot({ ...base, queue: null, exams: [] });
      expect(snapshot.accessibilityText).toBe(
        "Posição ainda indisponível. Abra o SUSight para ver. Nenhum exame pendente.",
      );
    });
  });
});
