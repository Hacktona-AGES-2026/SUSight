import * as SecureStore from 'expo-secure-store';
import { getSessionToken } from './token';

it('usa a sessão gravada pelo login do app', async () => {
  await SecureStore.setItemAsync('session', JSON.stringify({ token: 'paciente', lastActive: Date.now() }));
  expect(await getSessionToken()).toBe('paciente');
});

it('não usa uma sessão expirada nem uma sessão removida', async () => {
  await SecureStore.setItemAsync('session', JSON.stringify({ token: 'antigo', lastActive: Date.now() - 31 * 60_000 }));
  expect(await getSessionToken()).toBeNull();
  await SecureStore.deleteItemAsync('session');
  expect(await getSessionToken()).toBeNull();
});

it('ignora uma sessão corrompida', async () => {
  await SecureStore.setItemAsync('session', 'inválida');
  await expect(getSessionToken()).resolves.toBeNull();
});
