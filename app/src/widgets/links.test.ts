import { WIDGET_LINKS, tabFromUrl } from "./links";

describe("links dos widgets", () => {
  it("abrem o Início e a aba Documentos", () => {
    expect(WIDGET_LINKS.inicio).toBe("pulse://inicio");
    expect(WIDGET_LINKS.documentos).toBe("pulse://documentos");
  });

  it("dizem qual aba abrir", () => {
    expect(tabFromUrl("pulse://inicio")).toBe("inicio");
    expect(tabFromUrl("pulse://documentos")).toBe("documentos");
    expect(tabFromUrl("pulse://documentos/")).toBe("documentos");
  });

  it("ignoram links desconhecidos ou de outros apps", () => {
    expect(tabFromUrl("pulse://aprovar")).toBeNull();
    expect(tabFromUrl("https://example.com/inicio")).toBeNull();
    expect(tabFromUrl("")).toBeNull();
    expect(tabFromUrl(null)).toBeNull();
  });
});
