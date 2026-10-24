import { act, userEvent } from '@testing-library/react-native';
import { screen } from 'expo-router/testing-library';
import { Alert } from 'react-native';
import { openSignedIn } from '../../test/utils';
import { appInbox } from '../notifications/app-inbox';

const received = {
  id: 'push-recebido', type: 'documento_recebido' as const,
  title: 'Laudo novo recebido', body: 'Recebemos seu novo laudo.',
  sentAt: '2026-10-24T18:00:00Z', read: false,
};

it('recebe um aviso no sino existente e abre os Documentos completos', async () => {
  const user = userEvent.setup();
  await openSignedIn();
  await screen.findByRole('button', { name: 'Notificações, 2 novas' });
  await act(async () => { await appInbox.add([received]); });
  await user.press(await screen.findByRole('button', { name: 'Notificações, 3 novas' }));
  await user.press(await screen.findByRole('button', { name: /Laudo novo recebido/ }));
  expect(screen).toHavePathname('/documents');
  expect(await screen.findByText('Risco cirúrgico')).toBeOnTheScreen();
});

it('respeita a preferência de avisos e mantém os pedidos de exame visíveis', async () => {
  await openSignedIn('/home', { notifications: false, faceId: false });
  await screen.findByRole('button', { name: 'Notificações, 1 nova' });
  await act(async () => { await appInbox.add([received]); });
  expect(screen.getByRole('button', { name: 'Notificações, 1 nova' })).toBeOnTheScreen();
});

it('apaga as notificações ao sair pelo Perfil existente', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  await openSignedIn('/profile');
  await act(async () => { await appInbox.add([received]); });
  await userEvent.setup().press(await screen.findByRole('button', { name: 'Sair da conta' }));
  await act(async () => { await alert.mock.calls.at(-1)![2]!.find((button) => button.style === 'destructive')!.onPress!(); });
  expect(await screen.findByText('Entrar no SUSight')).toBeOnTheScreen();
  expect(appInbox.getSnapshot()).toEqual([]);
  alert.mockRestore();
});
