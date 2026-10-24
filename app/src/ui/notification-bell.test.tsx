import { fireEvent, render, screen } from "@testing-library/react-native";
import { NotificationBell } from "./notification-bell";

describe("sino de notificações", () => {
  it("mostra o ponto e diz quantos avisos são novos", async () => {
    await render(<NotificationBell unread={2} onPress={() => {}} />);

    expect(screen.getByRole("button", { name: "Notificações, 2 novas" })).toBeOnTheScreen();
    expect(screen.getByTestId("ponto-de-aviso")).toBeOnTheScreen();
  });

  it("um aviso novo fica no singular", async () => {
    await render(<NotificationBell unread={1} onPress={() => {}} />);

    expect(screen.getByRole("button", { name: "Notificações, 1 nova" })).toBeOnTheScreen();
  });

  it("sem avisos novos, não mostra o ponto", async () => {
    await render(<NotificationBell unread={0} onPress={() => {}} />);

    expect(screen.getByRole("button", { name: "Notificações" })).toBeOnTheScreen();
    expect(screen.queryByTestId("ponto-de-aviso")).toBeNull();
  });

  it("tocar abre as notificações", async () => {
    const onPress = jest.fn();
    await render(<NotificationBell unread={0} onPress={onPress} />);

    await fireEvent.press(screen.getByRole("button", { name: "Notificações" }));

    expect(onPress).toHaveBeenCalled();
  });
});
