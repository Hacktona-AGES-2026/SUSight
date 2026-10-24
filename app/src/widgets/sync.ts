import { buildWidgetSnapshot, type WidgetSnapshot } from "./snapshot";

// Mesmo App Group de app.json e de targets/widgets/expo-target.config.js.
export const APP_GROUP = "group.com.hacktonaages2026.pulse";
// Mesma chave lida por targets/widgets/Snapshot.swift.
export const SNAPSHOT_KEY = "widget_snapshot";

/** Onde o retrato fica guardado. No iPhone, é o App Group compartilhado com a extensão. */
export type WidgetStorage = {
  set(key: string, value: string): void;
  reload(): void;
};

/** Grava o retrato e pede para os widgets se redesenharem. Falhas não derrubam o app. */
export function syncWidgets(snapshot: WidgetSnapshot, storage: WidgetStorage) {
  try {
    storage.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
    storage.reload();
  } catch (error) {
    console.warn("Não foi possível atualizar os widgets.", error);
  }
}

/** Ao sair, os widgets passam a mostrar só o convite para abrir o app. */
export function clearWidgets(storage: WidgetStorage) {
  syncWidgets(
    buildWidgetSnapshot({
      signedIn: false,
      queue: null,
      exams: [],
      faceIdEnabled: false,
      variant: "padrao",
      updatedAt: new Date(),
    }),
    storage,
  );
}
