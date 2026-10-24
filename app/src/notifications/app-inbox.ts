import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { createInboxStore } from "./inbox-store";

// A caixa de notificações do app, compartilhada pelas telas e pela captura dos avisos.
export const appInbox = createInboxStore(AsyncStorage);

export function useInbox() {
  return useSyncExternalStore(appInbox.subscribe, appInbox.getSnapshot);
}
