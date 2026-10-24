import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { IDLE_LIMIT_MS } from './auth/session-policy';

export { IDLE_LIMIT_MS } from './auth/session-policy';

export type Prefs = { notifications: boolean; faceId: boolean };
type Status = 'loading' | 'signedOut' | 'locked' | 'signedIn';

type Session = {
  status: Status;
  prefs: Prefs;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  unlock: () => Promise<boolean>;
  touch: () => void;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

const read = async <T,>(key: string): Promise<T | null> => {
  const raw = await SecureStore.getItemAsync(key);
  return raw ? (JSON.parse(raw) as T) : null;
};
const write = (key: string, value: unknown) => SecureStore.setItemAsync(key, JSON.stringify(value));

type Stored = { token: string; lastActive: number };

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [prefs, setPrefs] = useState<Prefs>({ notifications: true, faceId: false });

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync('session');
    setStatus('signedOut');
  }, []);

  // Restore on open: expired sessions sign out, Face ID locks until the patient authenticates.
  const restore = useCallback(async () => {
    const [session, saved] = await Promise.all([read<Stored>('session'), read<Prefs>('prefs')]);
    const p = saved ?? { notifications: true, faceId: false };
    setPrefs(p);
    if (!session || Date.now() - session.lastActive > IDLE_LIMIT_MS) return signOut();
    setStatus(p.faceId ? 'locked' : 'signedIn');
  }, [signOut]);

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      const session = await read<Stored>('session');
      if (session && Date.now() - session.lastActive > IDLE_LIMIT_MS) signOut();
    });
    return () => sub.remove();
  }, [signOut]);

  const value = useMemo<Session>(
    () => ({
      status,
      prefs,
      signOut,
      async signIn(token) {
        await write('session', { token, lastActive: Date.now() });
        setStatus('signedIn');
      },
      async unlock() {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Desbloqueie o SUSight',
          cancelLabel: 'Cancelar',
        });
        if (result.success) setStatus('signedIn');
        return result.success;
      },
      touch() {
        read<Stored>('session').then((s) => s && write('session', { ...s, lastActive: Date.now() }));
      },
      async setPref(key, v) {
        const next = { ...prefs, [key]: v };
        setPrefs(next);
        await write('prefs', next);
      },
    }),
    [status, prefs, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}
