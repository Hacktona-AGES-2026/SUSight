import { parseWidgetPayload, toWidgetInput } from "./remote";

const payload = {
  queue: { position: 42, total: 118, positionWeekAgo: 45, positionMonthAgo: 53 },
  exams: [
    { name: "Ressonância", status: "pendente", dueDate: "2026-10-30T12:00:00-03:00" },
    { name: "Raio-X", status: "em_analise" },
  ],
  updatedAt: "2026-10-24T12:41:00-03:00",
};

describe("parseWidgetPayload", () => {
  it("aceita o formato de GET /me/widget e do push", () => {
    expect(parseWidgetPayload(payload)).toEqual({
      queue: { position: 42, total: 118, positionWeekAgo: 45, positionMonthAgo: 53 },
      exams: [
        {
          name: "Ressonância",
          status: "pendente",
          dueDate: new Date("2026-10-30T12:00:00-03:00"),
        },
        { name: "Raio-X", status: "em_analise" },
      ],
      updatedAt: new Date("2026-10-24T12:41:00-03:00"),
    });
  });

  it("aceita o payload em texto, como alguns pushes chegam", () => {
    expect(parseWidgetPayload(JSON.stringify(payload))).not.toBeNull();
  });

  it("aceita paciente ainda sem posição na fila", () => {
    expect(parseWidgetPayload({ ...payload, queue: null })?.queue).toBeNull();
  });

  it("recusa dados inválidos em vez de mostrar uma posição errada", () => {
    for (const bad of [
      null,
      "não é json",
      {},
      { ...payload, queue: { position: 0, total: 118 } },
      { ...payload, queue: { position: 200, total: 118 } },
      { ...payload, exams: [{ name: "Raio-X", status: "enviado" }] },
      { ...payload, updatedAt: "ontem" },
    ]) {
      expect(parseWidgetPayload(bad)).toBeNull();
    }
  });

  it("ignora campos extras, como CNS, sem repassá-los ao widget", () => {
    const parsed = parseWidgetPayload({ ...payload, cns: "123456789012345" });
    expect(JSON.stringify(parsed)).not.toContain("123456789012345");
  });
});

describe("toWidgetInput", () => {
  it("junta os dados remotos com as preferências do paciente", () => {
    const remote = parseWidgetPayload(payload)!;
    expect(
      toWidgetInput(remote, { faceIdEnabled: true, variant: "invertido" }),
    ).toEqual({
      signedIn: true,
      queue: remote.queue,
      exams: remote.exams,
      faceIdEnabled: true,
      variant: "invertido",
      updatedAt: remote.updatedAt,
    });
  });
});
