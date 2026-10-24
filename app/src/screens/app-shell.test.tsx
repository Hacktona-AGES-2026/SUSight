import { fireEvent, render, screen } from "@testing-library/react-native";
import type { InboxItem } from "../notifications/inbox";
import { AppShell } from "./app-shell";

const inbox: InboxItem[] = [
  {
    id: "a",
    type: "exame_pendente",
    title: "Falta um exame",
    body: "O médico pediu o laudo da ressonância.",
    sentAt: "2026-10-18T12:00:00.000Z",
    read: false,
  },
];

function renderShell(props: Partial<Parameters<typeof AppShell>[0]> = {}) {
  return render(<AppShell inbox={inbox} onMarkRead={() => {}} request={null} {...props} />);
}

describe("navegação do app", () => {
  it("abre no Início e troca de aba pela barra", async () => {
    await renderShell();
    expect(screen.getByRole("tab", { name: "Início" })).toBeSelected();
    expect(screen.getByText("Minha jornada")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("tab", { name: "Documentos" }));

    expect(screen.getByRole("tab", { name: "Documentos" })).toBeSelected();
    expect(screen.getByRole("header", { name: "Documentos" })).toBeOnTheScreen();
  });

  it("aviso ou widget abre a aba pedida, mesmo que seja a mesma de antes", async () => {
    const { rerender } = await renderShell({ request: { tab: "documentos", seq: 1 } });
    expect(screen.getByRole("tab", { name: "Documentos" })).toBeSelected();

    await fireEvent.press(screen.getByRole("tab", { name: "Início" }));
    await rerender(<AppShell inbox={inbox} onMarkRead={() => {}} request={{ tab: "documentos", seq: 2 }} />);

    expect(screen.getByRole("tab", { name: "Documentos" })).toBeSelected();
  });

  it("o sino do Início mostra os avisos novos e abre as notificações", async () => {
    await renderShell();

    await fireEvent.press(screen.getByRole("button", { name: "Notificações, 1 nova" }));

    expect(screen.getByRole("header", { name: "Notificações" })).toBeOnTheScreen();
  });

  it("tocar num aviso marca como lido e abre a tela dele", async () => {
    const onMarkRead = jest.fn();
    await renderShell({ onMarkRead });

    await fireEvent.press(screen.getByRole("button", { name: "Notificações, 1 nova" }));
    await fireEvent.press(screen.getByText("Falta um exame"));

    expect(onMarkRead).toHaveBeenCalledWith("a");
    expect(screen.getByRole("tab", { name: "Documentos" })).toBeSelected();
  });

  it("trocar de aba fecha as notificações", async () => {
    await renderShell();

    await fireEvent.press(screen.getByRole("button", { name: "Notificações, 1 nova" }));
    await fireEvent.press(screen.getByRole("tab", { name: "Perfil" }));

    expect(screen.queryByRole("header", { name: "Notificações" })).toBeNull();
    expect(screen.getByRole("header", { name: "Perfil" })).toBeOnTheScreen();
  });
});
