import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetPreferences } from "./remote";

// Preferências que afetam os widgets: Face ID (spec 003) e variante de cor.
const KEY = "widget_preferences";
const DEFAULTS: WidgetPreferences = { faceIdEnabled: false, variant: "padrao" };

export async function getWidgetPreferences(): Promise<WidgetPreferences> {
  try {
    const saved = await AsyncStorage.getItem(KEY);
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function setWidgetPreferences(preferences: Partial<WidgetPreferences>) {
  const current = await getWidgetPreferences();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...preferences }));
}
