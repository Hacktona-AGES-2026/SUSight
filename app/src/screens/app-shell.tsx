import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { TabRequest } from "../navigation/requested-tab";
import type { InboxItem } from "../notifications/inbox";
import { TabBar, type Tab } from "../ui/tab-bar";
import { colors } from "../ui/theme";
import { HomeScreen } from "./home-screen";
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

/** Abas do app (spec 002, item 14). */
export function AppShell({ request }: Props) {
  const [tab, setTab] = useState<Tab>(request?.tab ?? "inicio");
  const [handledSeq, setHandledSeq] = useState(request?.seq);
  if (request && request.seq !== handledSeq) {
    setHandledSeq(request.seq);
    setTab(request.tab);
  }

  return (
    <View style={styles.app}>
      {tab === "inicio" ? <HomeScreen /> : <PlaceholderScreen title={TITLES[tab]} />}
      <TabBar active={tab} onSelect={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
});
