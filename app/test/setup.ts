// Native modules the app touches, replaced by in-memory fakes.
jest.mock('../src/widgets/WidgetBridge', () => ({ WidgetBridge: () => null }));
jest.mock('../src/notifications/NotificationBridge', () => ({ NotificationBridge: () => null }));
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => { store.set(key, value); },
  };
});
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    getItemAsync: async (k: string) => store.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => void store.set(k, v),
    deleteItemAsync: async (k: string) => void store.delete(k),
  };
});

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

// Defaults are set per test so `jest.restoreAllMocks()` in a suite cannot wipe them.
beforeEach(async () => {
  await require('../src/notifications/app-inbox').appInbox.clear();
  require('expo-secure-store').__store.clear();
  const auth = require('expo-local-authentication');
  auth.hasHardwareAsync.mockResolvedValue(true);
  auth.isEnrolledAsync.mockResolvedValue(true);
  auth.authenticateAsync.mockResolvedValue({ success: true });
  require('expo-image-picker').requestCameraPermissionsAsync.mockResolvedValue({ granted: true });
});

// The demo API answers after a short delay and the opening screen stays up briefly.
require('@testing-library/react-native').configure({ asyncUtilTimeout: 4000 });
jest.setTimeout(20000);
