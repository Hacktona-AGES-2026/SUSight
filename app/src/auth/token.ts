import * as SecureStore from 'expo-secure-store';
import { IDLE_LIMIT_MS } from './session-policy';

/** A mesma sessão usada pelo login, pela restauração e pela saída da conta. */
export async function getSessionToken(): Promise<string | null> {
  const raw = await SecureStore.getItemAsync('session');
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (
      typeof session?.token !== 'string' || !session.token ||
      typeof session.lastActive !== 'number' || !Number.isFinite(session.lastActive) ||
      Date.now() - session.lastActive > IDLE_LIMIT_MS
    ) return null;
    return session.token;
  } catch {
    return null;
  }
}
