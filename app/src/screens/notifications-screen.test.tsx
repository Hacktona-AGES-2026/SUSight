import { fireEvent, render, screen } from "@testing-library/react-native";
import type { InboxItem } from "../notifications/inbox";
import { NotificationsScreen } from "./notifications-screen";

const items: InboxItem[] = [
  {
    id: "a",
    type: "documento_recebido",
    title: "Documento recebido",
    body: "Recebemos seu raio-X do joelho.",
    sentAt: "2026-10-20T12:00:00.000Z",
    read: false,
  },
  {
    id: "b",
    type: "exame_pendente",
    title: "Falta um exame",
    body: "O médico pediu o laudo da ressonância.",
    sentAt: "2026-10-18T12:00:00.000Z",
    read: false,
  },
  {
    id: "c",
    type: "analise_concluida",
    title: "Análise concluída",
    body: "Sua posição continua a mesma.",
    sentAt: "2026-09-12T12:00:00.000Z",
    read: true,
  },
];

describe("tela de notificações", () => {
  it("lista título, texto e data de cada aviso", async () => {
    await render(<NotificationsScreen items={items} onBack={() => {}} onOpen={() => {}} />);

    expect(screen.getByRole("header", { name: "Notificações" })).toBeOnTheScreen();
    expect(screen.getByText("Documento recebido")).toBeOnTheScreen();
    expect(screen.getByText("Recebemos seu raio-X do joelho.")).toBeOnTheScreen();
    expect(screen.getByText("20 out")).toBeOnTheScreen();
    expect(screen.getByText("12 set")).toBeOnTheScreen();
  });

  it("o leitor de tela lê cada aviso como uma frase, dizendo se é novo ou pede ação", async () => {
    await render(<NotificationsScreen items={items} onBack={() => {}} onOpen={() => {}} />);

    const rows = screen.getAllByRole("button").filter((b) => b.props.accessibilityLabel !== "Voltar para o Início");
    expect(rows.map((r) => r.props.accessibilityLabel)).toEqual([
      "Novo. Documento recebido. Recebemos seu raio-X do joelho. 20 de outubro.",
      "Novo, pede ação. Falta um exame. O médico pediu o laudo da ressonância. 18 de outubro.",
      "Análise concluída. Sua posição continua a mesma. 12 de setembro.",
    ]);
  });

  it("o ponto muda de cor: novo, novo que pede ação e lido", async () => {
    await render(<NotificationsScreen items={items} onBack={() => {}} onOpen={() => {}} />);

    expect(screen.getByTestId("marcador-a")).toHaveStyle({ backgroundColor: "#C42C6D" });
    expect(screen.getByTestId("marcador-b")).toHaveStyle({ backgroundColor: "#F5A3C4" });
    expect(screen.getByTestId("marcador-c")).toHaveStyle({ backgroundColor: "#C7C7CC" });
  });

  it("tocar num aviso o abre", async () => {
    const onOpen = jest.fn();
    await render(<NotificationsScreen items={items} onBack={() => {}} onOpen={onOpen} />);

    await fireEvent.press(screen.getByText("Falta um exame"));

    expect(onOpen).toHaveBeenCalledWith(items[1]);
  });

  it("Voltar leva ao Início", async () => {
    const onBack = jest.fn();
    await render(<NotificationsScreen items={items} onBack={onBack} onOpen={() => {}} />);

    await fireEvent.press(screen.getByRole("button", { name: "Voltar para o Início" }));

    expect(onBack).toHaveBeenCalled();
  });

  it("sem avisos, explica o que vai aparecer ali", async () => {
    await render(<NotificationsScreen items={[]} onBack={() => {}} onOpen={() => {}} />);

    expect(screen.getByText("Nenhuma notificação por enquanto")).toBeOnTheScreen();
  });
});
