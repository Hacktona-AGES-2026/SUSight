import * as SecureStore from "expo-secure-store";

// Token da sessão do paciente, guardado no Keychain (iPhone) e no Keystore (Android).
// O login (spec 005) grava; as tarefas em segundo plano leem para atualizar os widgets.
const KEY = "session_token";

// Liberado depois do primeiro desbloqueio, para as tarefas em segundo plano conseguirem ler.
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export function getSessionToken() {
  return SecureStore.getItemAsync(KEY, OPTIONS);
}

export function setSessionToken(token: string) {
  return SecureStore.setItemAsync(KEY, token, OPTIONS);
}

export function clearSessionToken() {
  return SecureStore.deleteItemAsync(KEY, OPTIONS);
}
