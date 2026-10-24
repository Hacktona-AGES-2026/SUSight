import { render, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { api, resetDemo } from '../api';
import { useSession } from '../session';
import { clearAllWidgets, refreshAllWidgets } from './refresh';
import { setWidgetPreferences } from './preferences';
import { WidgetBridge } from './WidgetBridge';

jest.unmock('./WidgetBridge');
jest.mock('../session', () => ({ useSession: jest.fn() }));
jest.mock('expo-router', () => ({ router: { navigate: jest.fn() }, usePathname: () => '/home' }));
jest.mock('../notifications/setup', () => ({
  listenNotificationTaps: () => jest.fn(), setupPushNotifications: jest.fn(async () => null),
}));
jest.mock('./background', () => ({ registerBackgroundWidgetUpdates: jest.fn() }));
jest.mock('./preferences', () => ({ setWidgetPreferences: jest.fn(async () => {}) }));
jest.mock('./targets', () => ({ widgetTargets: () => ({ ios: null, android: null }) }));
jest.mock('./refresh', () => ({
  refreshAllWidgets: jest.fn(async () => {}), clearAllWidgets: jest.fn(async () => {}),
}));

function session(status: 'signedIn' | 'signedOut') {
  jest.mocked(useSession).mockReturnValue({ status, prefs: { notifications: false } } as unknown as ReturnType<typeof useSession>);
}

beforeEach(async () => {
  jest.clearAllMocks();
  resetDemo();
  session('signedIn');
  await SecureStore.setItemAsync('session', JSON.stringify({ token: 'paciente', lastActive: Date.now() }));
});

it('mostra a mesma fila e os mesmos documentos das telas', async () => {
  session('signedIn');
  await render(<WidgetBridge />);
  await waitFor(() => expect(refreshAllWidgets).toHaveBeenCalled());
  expect(jest.mocked(refreshAllWidgets).mock.calls[0][0]).toMatchObject({
    positionText: '42ª', pendingText: '1 exame pendente', hideWhenLocked: false,
    updatedAtText: 'Atualizada em 24 de out',
    nextExam: { name: 'Risco cirúrgico' },
  });
  expect(setWidgetPreferences).toHaveBeenCalledWith({ faceIdEnabled: false });
});

it('limpa os widgets ao sair da conta', async () => {
  session('signedOut');
  await render(<WidgetBridge />);
  await waitFor(() => expect(clearAllWidgets).toHaveBeenCalled());
  expect(refreshAllWidgets).not.toHaveBeenCalled();
});

it('descarta uma atualização iniciada antes de sair da conta', async () => {
  const home = await api.getHome();
  let finish!: (value: typeof home) => void;
  const request = jest.spyOn(api, 'getHome').mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  const view = await render(<WidgetBridge />);
  await waitFor(() => expect(request).toHaveBeenCalled());
  session('signedOut');
  await SecureStore.deleteItemAsync('session');
  await view.rerender(<WidgetBridge />);
  finish(home);
  await waitFor(() => expect(clearAllWidgets).toHaveBeenCalled());
  expect(refreshAllWidgets).not.toHaveBeenCalled();
  request.mockRestore();
});
