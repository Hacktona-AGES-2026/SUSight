import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { loadAndroidSnapshot } from "./store";
import { renderAndroidWidget } from "./widgets";

/** Chamado pelo Android ao adicionar, atualizar ou redimensionar um widget, mesmo com o app fechado. */
export async function widgetTaskHandler({ widgetInfo, widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      renderWidget(renderAndroidWidget(widgetInfo.widgetName, await loadAndroidSnapshot()));
      break;
    default:
      // Toques usam OPEN_URI e são tratados pelo próprio Android.
      break;
  }
}
