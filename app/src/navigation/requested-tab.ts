import { useEffect, useState } from "react";
import { Linking } from "react-native";
import { listenNotificationTaps } from "../notifications/setup";
import { tabFromUrl, type WidgetTab } from "../widgets/links";

/**
 * Aba pedida por um widget (link `pulse://`) ou pelo toque num aviso.
 * A navegação por abas da spec 002 usa este valor para abrir a tela certa.
 */
export function useRequestedTab(): WidgetTab | null {
  const [tab, setTab] = useState<WidgetTab | null>(null);

  useEffect(() => {
    const openUrl = (url: string | null | undefined) => {
      const requested = tabFromUrl(url);
      if (requested) setTab(requested);
    };
    Linking.getInitialURL().then(openUrl);
    const linkSubscription = Linking.addEventListener("url", ({ url }) => openUrl(url));
    const stopTaps = listenNotificationTaps(setTab);
    return () => {
      linkSubscription.remove();
      stopTaps();
    };
  }, []);

  return tab;
}
