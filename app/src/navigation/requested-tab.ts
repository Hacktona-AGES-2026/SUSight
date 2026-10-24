import { useEffect, useState } from "react";
import { Linking } from "react-native";
import { listenNotificationTaps } from "../notifications/setup";
import { tabFromUrl, type WidgetTab } from "../widgets/links";

/** Aba pedida. `seq` muda a cada pedido, para abrir de novo a mesma aba. */
export type TabRequest = { tab: WidgetTab; seq: number };

/**
 * Aba pedida por um widget (link `pulse://`) ou pelo toque num aviso.
 * O `AppShell` usa este valor para abrir a tela certa.
 */
export function useRequestedTab(): TabRequest | null {
  const [request, setRequest] = useState<TabRequest | null>(null);

  useEffect(() => {
    const open = (tab: WidgetTab) => setRequest((last) => ({ tab, seq: (last?.seq ?? 0) + 1 }));
    const openUrl = (url: string | null | undefined) => {
      const requested = tabFromUrl(url);
      if (requested) open(requested);
    };
    Linking.getInitialURL().then(openUrl);
    const linkSubscription = Linking.addEventListener("url", ({ url }) => openUrl(url));
    const stopTaps = listenNotificationTaps(open);
    return () => {
      linkSubscription.remove();
      stopTaps();
    };
  }, []);

  return request;
}
