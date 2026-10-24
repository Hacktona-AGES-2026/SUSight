import {
  INBOX_LIMIT,
  formatShortDate,
  markRead,
  markerFor,
  mergeInbox,
  parseNotification,
  unreadCount,
  type InboxItem,
} from "./inbox";

function item(overrides: Partial<InboxItem> = {}): InboxItem {
  return {
    id: "1",
    type: "documento_recebido",
    title: "Documento recebido",
    body: "Seu raio-X está em análise.",
    sentAt: "2026-10-20T12:00:00.000Z",
    read: false,
    ...overrides,
  };
}

describe("parseNotification", () => {
  const valid = {
    id: "n1",
    type: "posicao_mudou",
    title: "Sua posição mudou",
    body: "Você agora é a 31ª de 118.",
    sentAt: "2026-10-20T12:00:00.000Z",
  };

  it("aceita os avisos da spec 002 e da 004 e começa como não lido", () => {
    for (const type of [
      "posicao_mudou",
      "exame_pendente",
      "documento_recebido",
      "exame_em_analise",
      "analise_concluida",
    ]) {
      expect(parseNotification({ ...valid, type })).toEqual({ ...valid, type, read: false });
    }
  });

  it("descarta rejeição pelo médico, reavaliação da IA e qualquer tipo desconhecido", () => {
    expect(parseNotification({ ...valid, type: "proposta_rejeitada" })).toBeNull();
    expect(parseNotification({ ...valid, type: "reavaliacao_ia" })).toBeNull();
    expect(parseNotification({ ...valid, type: undefined })).toBeNull();
  });

  it("descarta aviso sem id, sem título, sem texto ou com data inválida", () => {
    expect(parseNotification({ ...valid, id: "" })).toBeNull();
    expect(parseNotification({ ...valid, title: "  " })).toBeNull();
    expect(parseNotification({ ...valid, body: null })).toBeNull();
    expect(parseNotification({ ...valid, sentAt: "ontem" })).toBeNull();
    expect(parseNotification(null)).toBeNull();
  });

  it("guarda a data em formato ISO", () => {
    const parsed = parseNotification({ ...valid, sentAt: "2026-10-20T09:00:00-03:00" });
    expect(parsed?.sentAt).toBe("2026-10-20T12:00:00.000Z");
  });
});

describe("mergeInbox", () => {
  it("ordena do mais novo para o mais velho", () => {
    const old = item({ id: "a", sentAt: "2026-09-01T00:00:00.000Z" });
    const recent = item({ id: "b", sentAt: "2026-10-01T00:00:00.000Z" });

    expect(mergeInbox([old], [recent]).map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("não repete o mesmo aviso e mantém o que já foi lido", () => {
    const read = item({ id: "a", read: true });

    expect(mergeInbox([read], [item({ id: "a", read: false })])).toEqual([read]);
  });

  it(`guarda no máximo ${INBOX_LIMIT} avisos`, () => {
    const many = Array.from({ length: INBOX_LIMIT + 5 }, (_, i) =>
      item({ id: String(i), sentAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString() }),
    );

    const merged = mergeInbox([], many);

    expect(merged).toHaveLength(INBOX_LIMIT);
    expect(merged[0].id).toBe(String(INBOX_LIMIT + 4));
  });
});

describe("lidos e não lidos", () => {
  it("conta os avisos novos para o ponto do sino", () => {
    expect(unreadCount([item({ id: "a" }), item({ id: "b", read: true }), item({ id: "c" })])).toBe(2);
    expect(unreadCount([])).toBe(0);
  });

  it("marca um aviso como lido sem mexer nos outros", () => {
    const inbox = [item({ id: "a" }), item({ id: "b" })];

    expect(markRead(inbox, "a")).toEqual([item({ id: "a", read: true }), item({ id: "b" })]);
    expect(inbox[0].read).toBe(false);
  });
});

describe("markerFor", () => {
  it("ponto cinza para aviso lido", () => {
    expect(markerFor(item({ read: true }))).toBe("lido");
    expect(markerFor(item({ type: "exame_pendente", read: true }))).toBe("lido");
  });

  it("ponto de ação para exame pedido ainda não lido", () => {
    expect(markerFor(item({ type: "exame_pendente" }))).toBe("acao");
  });

  it("ponto de novo para os outros avisos não lidos", () => {
    expect(markerFor(item({ type: "posicao_mudou" }))).toBe("novo");
  });
});

describe("formatShortDate", () => {
  it("mostra dia e mês abreviado em português, no fuso de Brasília", () => {
    expect(formatShortDate("2026-10-20T12:00:00.000Z")).toBe("20 out");
    expect(formatShortDate("2026-09-09T12:00:00.000Z")).toBe("9 set");
    expect(formatShortDate("2026-05-01T01:00:00.000Z")).toBe("30 abr");
  });
});
