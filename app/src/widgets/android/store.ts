import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildWidgetSnapshot, type WidgetSnapshot } from "../snapshot";

// Último retrato, lido pelos widgets do Android mesmo com o app fechado.
const KEY = "widget_snapshot";

export async function saveAndroidSnapshot(snapshot: WidgetSnapshot) {
  await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
}

/** Último retrato salvo; sem nenhum, o de "sem sessão". */
export async function loadAndroidSnapshot(): Promise<WidgetSnapshot> {
  const saved = await AsyncStorage.getItem(KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as WidgetSnapshot;
    } catch {
      // Retrato corrompido: cai no "sem sessão" abaixo.
    }
  }
  return buildWidgetSnapshot({
    signedIn: false,
    queue: null,
    exams: [],
    faceIdEnabled: false,
    variant: "padrao",
    updatedAt: new Date(),
  });
}
