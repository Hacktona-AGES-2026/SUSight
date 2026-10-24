import type { HexColor } from "react-native-android-widget";
import type { WidgetVariant } from "../snapshot";

/** Cores do Figma: Android padrão (102-4561) e invertido, fundo rosa (106-997). */
export type AndroidWidgetTheme = {
  wideBackground: HexColor;
  nextExamBackground: HexColor;
  weekBackground: HexColor;
  primaryText: HexColor;
  softText: HexColor;
  secondaryText: HexColor;
  ringTrack: HexColor;
  ringFill: HexColor;
  pendingDot: HexColor;
  otherDot: HexColor;
};

const padrao: AndroidWidgetTheme = {
  wideBackground: "#FCE6EE",
  nextExamBackground: "#F9D6E4",
  weekBackground: "#FFFFFF",
  primaryText: "#1C1C1E",
  softText: "#3A3A3C",
  secondaryText: "#636366",
  ringTrack: "#F9D6E4",
  ringFill: "#A3205B",
  pendingDot: "#C42C6D",
  otherDot: "#A3205B",
};

const invertido: AndroidWidgetTheme = {
  wideBackground: "#B02A68",
  nextExamBackground: "#A3205B",
  weekBackground: "#B02A68",
  primaryText: "#FFFFFF",
  softText: "#FFFFFFD1",
  secondaryText: "#FFFFFFD1",
  ringTrack: "#FFFFFF4D",
  ringFill: "#FFFFFF",
  pendingDot: "#FFFFFFD9",
  otherDot: "#FFFFFFD9",
};

export function androidTheme(variant: WidgetVariant): AndroidWidgetTheme {
  return variant === "invertido" ? invertido : padrao;
}
