import { markRead, mergeInbox, parseNotification, type InboxItem } from "./inbox";

// Caixa de notificações guardada no aparelho. A tela lê com `useSyncExternalStore`.

export type InboxStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

const KEY = "notification_inbox";

export function createInboxStore(storage: InboxStorage) {
  let items: InboxItem[] = [];
  let loaded: Promise<void> | null = null;
  // Fila de alterações: o push, o toque e a tela podem mexer na caixa ao mesmo tempo.
  let queue: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();

  function load() {
    loaded ??= storage.getItem(KEY).then(
      (saved) => {
        items = mergeInbox(items, readSaved(saved));
        notify();
      },
      () => {},
    );
    return loaded;
  }

  function update(change: (current: InboxItem[]) => InboxItem[]) {
    const run = queue.then(async () => {
      await load();
      items = change(items);
      notify();
      await storage.setItem(KEY, JSON.stringify(items));
    });
    queue = run.catch(() => {});
    return run;
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  return {
    load,
    getSnapshot: () => items,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add: (incoming: InboxItem[]) => update((current) => mergeInbox(current, incoming)),
    markRead: (id: string) => update((current) => markRead(current, id)),
    markAllRead: () => update((current) => current.map((item) => ({ ...item, read: true }))),
    clear: () => update(() => []),
  };
}

export type InboxStore = ReturnType<typeof createInboxStore>;

/** Item guardado passa pela mesma validação do push, mantendo o "lido". */
function readSaved(saved: string | null): InboxItem[] {
  let list: unknown;
  try {
    list = saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  return list.flatMap((raw) => {
    const item = parseNotification(raw);
    return item ? [{ ...item, read: (raw as { read?: unknown }).read === true }] : [];
  });
}
