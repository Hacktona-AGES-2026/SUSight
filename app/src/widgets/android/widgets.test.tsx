import type * as WidgetTreeApi from "react-native-android-widget/lib/typescript/api/build-widget-tree";
import { demoWidgetInput } from "../demo";
import { buildWidgetSnapshot } from "../snapshot";
import { ringSvg } from "./ring";
import { ANDROID_WIDGETS, renderAndroidWidget } from "./widgets";

// A biblioteca não exporta buildWidgetTree pelo índice; usamos o módulo interno só nos testes.
const { buildWidgetTree } =
  require("react-native-android-widget/lib/commonjs/api/build-widget-tree") as typeof WidgetTreeApi;
type WidgetTree = WidgetTreeApi.WidgetTree;

const snapshot = buildWidgetSnapshot(
  demoWidgetInput(new Date("2026-10-24T12:41:00-03:00")),
);
const signedOut = buildWidgetSnapshot({
  ...demoWidgetInput(new Date()),
  signedIn: false,
});

function tree(name: string, data = snapshot): WidgetTree {
  return buildWidgetTree(renderAndroidWidget(name, data));
}

function texts(node: WidgetTree): string[] {
  const own = node.type === "TextWidget" ? [(node.props as { text: string }).text] : [];
  return [...own, ...(node.children ?? []).flatMap(texts)];
}

function find(node: WidgetTree, match: (n: WidgetTree) => boolean): WidgetTree[] {
  return [...(match(node) ? [node] : []), ...(node.children ?? []).flatMap((c) => find(c, match))];
}

const props = (node: WidgetTree) => node.props as Record<string, unknown>;

describe("widgets do Android", () => {
  it("existem o largo, o próximo exame e o esta semana", () => {
    expect(ANDROID_WIDGETS).toEqual(["PositionWidget", "NextExamWidget", "WeekWidget"]);
  });

  it("o largo mostra a posição e os exames como no Figma", () => {
    expect(texts(tree("PositionWidget"))).toEqual([
      "42ª",
      "Sua posição na fila",
      "Ressonância",
      "Pendente",
      "Raio-X",
      "Em análise",
      "Exame de sangue",
      "Recebido",
    ]);
  });

  it("próximo exame e esta semana mostram os textos do retrato", () => {
    expect(texts(tree("NextExamWidget"))).toEqual([
      "Próximo exame",
      "Ressonância",
      "Enviar até sexta",
    ]);
    expect(texts(tree("WeekWidget"))).toEqual(["Esta semana", "↑ 3", "posições"]);
  });

  it("o TalkBack lê cada widget como uma frase completa", () => {
    for (const name of ANDROID_WIDGETS) {
      const label = String(props(tree(name)).accessibilityLabel ?? "");
      expect(label.length).toBeGreaterThan(10);
    }
    const ring = find(tree("PositionWidget"), (n) => props(n).clickAction !== undefined)[0];
    expect(props(ring).accessibilityLabel).toBe(snapshot.signedIn && snapshot.accessibilityText);
  });

  it("tocar só abre o app: o anel no Início e os exames em Documentos", () => {
    const uris = find(tree("PositionWidget"), (n) => props(n).clickAction === "OPEN_URI").map(
      (n) => (props(n).clickActionData as { uri: string }).uri,
    );
    expect(uris).toEqual(["pulse://inicio", "pulse://documentos"]);
  });

  it("os textos acompanham o tamanho de fonte do sistema", () => {
    for (const name of ANDROID_WIDGETS) {
      for (const text of find(tree(name), (n) => n.type === "TextWidget")) {
        expect(props(text).allowFontScaling).toBe(true);
      }
    }
  });

  it("sem sessão, só orienta a abrir o app", () => {
    for (const name of ANDROID_WIDGETS) {
      expect(texts(tree(name, signedOut))).toEqual(["Abra o SUSight para ver sua posição"]);
    }
  });
});

describe("ringSvg", () => {
  it("desenha a trilha e o progresso com as cores do Figma", () => {
    const svg = ringSvg({ progress: 0.5, size: 104, strokeWidth: 11, track: "#F9D6E4", fill: "#A3205B" });
    expect(svg).toContain('stroke="#F9D6E4"');
    expect(svg).toContain('stroke="#A3205B"');
    expect(svg).toContain('width="104"');
  });

  it("o progresso cobre a fração certa do círculo", () => {
    const svg = ringSvg({ progress: 0.25, size: 100, strokeWidth: 10, track: "#000", fill: "#fff" });
    const circumference = 2 * Math.PI * 45;
    expect(svg).toContain(`stroke-dasharray="${(circumference * 0.25).toFixed(2)} ${circumference.toFixed(2)}"`);
  });
});
