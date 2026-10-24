import type { TextStyle } from "react-native";

// Tokens do Figma (página "Telas · Estilo Apple"), com o nome original em comentário.
// A SF Pro do Figma é a fonte do sistema no iPhone; no Android vale a fonte do sistema.

export const colors = {
  background: "#FFFFFF", // fundo/agrupado
  surface: "#FFFFFF", // fundo/superficie
  card: "#FFFFFF", // fundo/cartao
  textPrimary: "#1C1C1E", // texto/principal
  textSecondary: "#636366", // texto/secundario
  tint: "#A3205B", // azul/tinta
  markerNew: "#C42C6D", // azul/medio
  action: "#F5A3C4", // amarelo/acao
  markerRead: "#C7C7CC", // linha/seta
  alertDot: "#D6336C", // vermelho/ponto
} as const;

export const text = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: "700" }, // Pulse/Título grande
  subtitle: { fontSize: 15, lineHeight: 20, fontWeight: "400" }, // Pulse/Subtítulo
  body: { fontSize: 17, lineHeight: 22, fontWeight: "400" }, // Pulse/Corpo
  bodyStrong: { fontSize: 17, lineHeight: 22, fontWeight: "600" }, // Pulse/Corpo destaque
  subtitleStrong: { fontSize: 15, lineHeight: 20, fontWeight: "600" }, // Pulse/Subtítulo destaque
  note: { fontSize: 13, lineHeight: 18, fontWeight: "400" }, // Pulse/Nota
  tab: { fontSize: 11, lineHeight: 13, fontWeight: "500" }, // Pulse/Aba
} satisfies Record<string, TextStyle>;

export const shadows = {
  soft: "0px 1px 3px rgba(26, 13, 20, 0.06), 0px 4px 16px rgba(26, 13, 20, 0.08)", // Pulse/Sombra suave
  tabBar: "0px 6px 20px rgba(0, 0, 0, 0.08)",
} as const;
