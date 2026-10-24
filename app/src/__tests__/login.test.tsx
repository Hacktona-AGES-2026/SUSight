import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Alert } from 'react-native';
import { DEMO, resetDemo } from '../api';
import { IDLE_LIMIT_MS } from '../session';

const open = () => renderRouter('./src/app', { initialUrl: '/' });

const signIn = async (user = userEvent.setup()) => {
  await open();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  await user.press(screen.getByRole('button', { name: 'Enviar código' }));
  await user.type(await screen.findByLabelText('Código de verificação'), DEMO.code);
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  return user;
};

beforeEach(resetDemo);

it('mostra a abertura e, sem sessão, o login', async () => {
  await open();
  expect(screen.getByText('SUSight')).toBeOnTheScreen();
  expect(screen.getByText('Sua jornada no SUS, com clareza.')).toBeOnTheScreen();
  expect(screen.getByText(/Toda decisão sobre a sua fila é validada por um profissional de saúde/)).toBeOnTheScreen();
  expect(await screen.findByText('Entrar no SUSight')).toBeOnTheScreen();
});

it('não envia código para CPF inválido', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), '52998224724');
  await user.press(screen.getByRole('button', { name: 'Enviar código' }));
  expect(await screen.findByText('Confira o CPF digitado.')).toBeOnTheScreen();
  expect(screen.queryByText('Digite o código')).not.toBeOnTheScreen();
});

it('não revela se um CPF válido está cadastrado', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), '11144477735');
  await user.press(screen.getByRole('button', { name: 'Enviar código' }));
  expect(
    await screen.findByText('Não foi possível enviar o código. Confira o CPF ou procure a sua UBS.'),
  ).toBeOnTheScreen();
});

it('entra com o código certo e mostra o telefone mascarado', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  await user.press(screen.getByRole('button', { name: 'Enviar código' }));
  expect(await screen.findByText(/\(21\) 9•••• -3187/)).toBeOnTheScreen();
  expect(screen.queryByText(new RegExp(DEMO.phone))).not.toBeOnTheScreen();

  await user.type(screen.getByLabelText('Código de verificação'), '000000');
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Código incorreto ou expirado. Confira e tente de novo.')).toBeOnTheScreen();

  await user.clear(screen.getByLabelText('Código de verificação'));
  await user.type(screen.getByLabelText('Código de verificação'), DEMO.code);
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Olá, Marina')).toBeOnTheScreen();
});

it('bloqueia por 5 minutos depois de cinco códigos errados', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  await user.press(screen.getByRole('button', { name: 'Enviar código' }));
  const field = await screen.findByLabelText('Código de verificação');
  for (let i = 0; i < 5; i++) {
    await user.clear(field);
    await user.type(field, '000000');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByText(/Código incorreto|Muitas tentativas/);
  }
  expect(screen.getByText('Muitas tentativas. Tente de novo em 5 minutos.')).toBeOnTheScreen();
});

it('só libera o reenvio depois da contagem', async () => {
  await open();
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  await user.press(screen.getByRole('button', { name: 'Enviar código' }));
  expect(
    await screen.findByRole('button', { name: /Reenviar código em 1:00|Reenviar código em 0:5\d/ }),
  ).toBeDisabled();
});

it('mantém a sessão entre aberturas', async () => {
  await signIn();
  expect(await screen.findByText('Olá, Marina')).toBeOnTheScreen();
  expect(await SecureStore.getItemAsync('session')).toContain('demo-session');
});

it('abre direto no Início com sessão salva', async () => {
  await SecureStore.setItemAsync('session', JSON.stringify({ token: 't', lastActive: Date.now() }));
  await open();
  expect(await screen.findByText('Olá, Marina')).toBeOnTheScreen();
});

it('encerra a sessão depois de 30 minutos sem uso', async () => {
  await SecureStore.setItemAsync(
    'session',
    JSON.stringify({ token: 't', lastActive: Date.now() - IDLE_LIMIT_MS - 1000 }),
  );
  await open();
  expect(await screen.findByText('Entrar no SUSight')).toBeOnTheScreen();
});

it('pede Face ID ao abrir quando a chave está ligada', async () => {
  await SecureStore.setItemAsync('session', JSON.stringify({ token: 't', lastActive: Date.now() }));
  await SecureStore.setItemAsync('prefs', JSON.stringify({ notifications: true, faceId: true }));
  jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValueOnce({ success: false, error: 'user_cancel' });
  await open();
  expect(await screen.findByRole('button', { name: 'Desbloquear com Face ID' })).toBeOnTheScreen();
  expect(screen.queryByText('Olá, Marina')).not.toBeOnTheScreen();

  await userEvent.setup().press(screen.getByRole('button', { name: 'Desbloquear com Face ID' }));
  expect(await screen.findByText('Olá, Marina')).toBeOnTheScreen();
});

it('orienta a usar o CPF ao tocar em gov.br', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  await open();
  await userEvent.setup().press(await screen.findByRole('button', { name: 'Entrar com gov.br' }));
  expect(alert).toHaveBeenCalledWith('gov.br em breve', expect.stringContaining('entre com seu CPF'));
});
