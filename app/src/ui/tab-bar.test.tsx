import { fireEvent, render, screen } from "@testing-library/react-native";
import { TabBar } from "./tab-bar";

describe("barra de abas", () => {
  it("tem as quatro abas, com a ativa marcada para o leitor de tela", async () => {
    await render(<TabBar active="inicio" onSelect={() => {}} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([
      "Início",
      "Documentos",
      "Histórico",
      "Perfil",
    ]);
    expect(screen.getByRole("tab", { name: "Início" })).toBeSelected();
    expect(screen.getByRole("tab", { name: "Perfil" })).not.toBeSelected();
  });

  it("tocar numa aba pede para abri-la", async () => {
    const onSelect = jest.fn();
    await render(<TabBar active="inicio" onSelect={onSelect} />);

    await fireEvent.press(screen.getByRole("tab", { name: "Histórico" }));

    expect(onSelect).toHaveBeenCalledWith("historico");
  });
});
