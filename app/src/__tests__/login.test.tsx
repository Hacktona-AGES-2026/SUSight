import * as SecureStore from 'expo-secure-store';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { DEMO, resetDemo } from '../api';
import { IDLE_LIMIT_MS } from '../session';

const open = () => renderRouter('./src/app', { initialUrl: '/' });

const signIn = async (user = userEvent.setup()) => {
  await open();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  await user.type(screen.getByLabelText('Código de acesso'), DEMO.code);
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

it('não entra com CPF inválido', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), '52998224724');
  await user.type(screen.getByLabelText('Código de acesso'), DEMO.code);
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Confira o CPF digitado.')).toBeOnTheScreen();
});

it('exige os 6 dígitos do código', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  await user.type(screen.getByLabelText('Código de acesso'), '123');
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Digite os 6 dígitos do código.')).toBeOnTheScreen();
});

it('não revela se um CPF válido está cadastrado', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), '11144477735');
  await user.type(screen.getByLabelText('Código de acesso'), DEMO.code);
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Código incorreto ou expirado. Confira e tente de novo.')).toBeOnTheScreen();
});

it('entra com o código certo', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  await user.type(screen.getByLabelText('Código de acesso'), '000000');
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Código incorreto ou expirado. Confira e tente de novo.')).toBeOnTheScreen();

  await user.clear(screen.getByLabelText('Código de acesso'));
  await user.type(screen.getByLabelText('Código de acesso'), DEMO.code);
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Olá, Marina')).toBeOnTheScreen();
});

it('bloqueia por 5 minutos depois de cinco códigos errados', async () => {
  const user = userEvent.setup();
  await open();
  await user.type(await screen.findByLabelText('CPF'), DEMO.cpf);
  const field = screen.getByLabelText('Código de acesso');
  for (let i = 0; i < 5; i++) {
    await user.clear(field);
    await user.type(field, '000000');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByText(/Código incorreto|Muitas tentativas/);
  }
  expect(screen.getByText('Muitas tentativas. Tente de novo em 5 minutos.')).toBeOnTheScreen();
});

it('não oferece gov.br nem envio de código', async () => {
  await open();
  await screen.findByText('Entrar no SUSight');
  expect(screen.queryByText(/gov\.br/)).not.toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Enviar código' })).not.toBeOnTheScreen();
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
