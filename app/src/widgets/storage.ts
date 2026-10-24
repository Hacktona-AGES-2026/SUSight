import { ExtensionStorage } from "@bacons/apple-targets";
import { Platform } from "react-native";
import { APP_GROUP, type WidgetStorage } from "./sync";

/** App Group do iPhone. Fora do iOS não há widgets, então nada é gravado. */
export function createWidgetStorage(): WidgetStorage | null {
  if (Platform.OS !== "ios") return null;
  const storage = new ExtensionStorage(APP_GROUP);
  return {
    set: (key, value) => storage.set(key, value),
    reload: () => ExtensionStorage.reloadWidget(),
  };
}
