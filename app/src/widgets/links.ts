// Links que os widgets abrem (spec 004). Tocar só abre o app; nenhum link executa ação.

export type WidgetTab = "inicio" | "documentos";

export const WIDGET_LINKS: Record<WidgetTab, string> = {
  inicio: "pulse://inicio",
  documentos: "pulse://documentos",
};

/** Aba que um link do widget deve abrir, ou `null` se o link não é de um widget. */
export function tabFromUrl(url: string | null | undefined): WidgetTab | null {
  const match = url?.match(/^pulse:\/\/([a-z]+)\/?$/);
  const tab = match?.[1];
  return tab === "inicio" || tab === "documentos" ? tab : null;
}
