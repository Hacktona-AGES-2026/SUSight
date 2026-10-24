import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { saveAndroidSnapshot } from "./android/store";
import { renderAndroidWidget } from "./android/widgets";
import type { WidgetTargets } from "./refresh";
import { createWidgetStorage } from "./storage";

/** Widgets do sistema em que o app está rodando. */
export function widgetTargets(): WidgetTargets {
  return {
    ios: createWidgetStorage(),
    android:
      Platform.OS === "android"
        ? {
            save: saveAndroidSnapshot,
            update: (widgetName, snapshot) =>
              requestWidgetUpdate({
                widgetName,
                renderWidget: () => renderAndroidWidget(widgetName, snapshot),
              }),
          }
        : null,
  };
}
