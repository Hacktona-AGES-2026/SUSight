import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { TabRequest } from "../navigation/requested-tab";
import { unreadCount, type InboxItem } from "../notifications/inbox";
import { tabFromNotification } from "../notifications/push";
import { TabBar, type Tab } from "../ui/tab-bar";
import { colors } from "../ui/theme";
import { HomeScreen } from "./home-screen";
import { NotificationsScreen } from "./notifications-screen";
import { PlaceholderScreen } from "./placeholder-screen";

type Props = {
  inbox: InboxItem[];
  onMarkRead(id: string): void;
  /** Aba pedida por um widget ou pelo toque num aviso. */
  request: TabRequest | null;
};

const TITLES: Record<Exclude<Tab, "inicio">, string> = {
  documentos: "Documentos",
  historico: "Histórico",
  perfil: "Perfil",
};

/** Abas do app e a tela de notificações aberta pelo sino (spec 002, itens 2, 12 e 14). */
export function AppShell({ inbox, onMarkRead, request }: Props) {
  const [tab, setTab] = useState<Tab>(request?.tab ?? "inicio");
  const [showNotifications, setShowNotifications] = useState(false);
  const [handledSeq, setHandledSeq] = useState(request?.seq);
  if (request && request.seq !== handledSeq) {
    setHandledSeq(request.seq);
    openTab(request.tab);
  }

  function openTab(next: Tab) {
    setTab(next);
    setShowNotifications(false);
  }

  function openNotification(item: InboxItem) {
    onMarkRead(item.id);
    openTab(tabFromNotification({ type: item.type }));
  }

  let content;
  if (showNotifications) {
    content = (
      <NotificationsScreen
        items={inbox}
        onBack={() => openTab("inicio")}
        onOpen={openNotification}
      />
    );
  } else if (tab === "inicio") {
    content = (
      <HomeScreen unread={unreadCount(inbox)} onOpenNotifications={() => setShowNotifications(true)} />
    );
  } else {
    content = <PlaceholderScreen title={TITLES[tab]} />;
  }

  return (
    <View style={styles.app}>
      {content}
      <TabBar active={tab} onSelect={openTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
});
