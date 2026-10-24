import { userEvent } from '@testing-library/react-native';
import { screen } from 'expo-router/testing-library';
import { api } from '../api';
import { openSignedIn } from '../../test/utils';

afterEach(() => jest.restoreAllMocks());

it('mostra a posição na fila oficial sem prometer data', async () => {
  await openSignedIn();
  expect(await screen.findByText('42ª')).toBeOnTheScreen();
  expect(screen.getByText('de 118 pessoas')).toBeOnTheScreen();
  expect(screen.getByText('em Ortopedia · Niterói')).toBeOnTheScreen();
  expect(screen.getByText(/Atualizada em 24 de outubro\..*Não é uma previsão de data de cirurgia\./)).toBeOnTheScreen();
  expect(screen.getByText('Artroplastia total de joelho')).toBeOnTheScreen();
  expect(screen.getByText('Encaminhado em 14 de março de 2026')).toBeOnTheScreen();
});

it('mostra a situação atual e não oferece relato de dor', async () => {
  await openSignedIn();
  expect(
    await screen.findByLabelText(/Prioridade validada pela regulação\. Validada em 12 de setembro de 2026\. Moderada/),
  ).toBeOnTheScreen();
  expect(screen.getByLabelText(/Último passo: exame pedido pela equipe.*Pendente/)).toBeOnTheScreen();
  expect(screen.getByLabelText(/Tempo de espera acumulado\. \d+ (mês|meses)/)).toBeOnTheScreen();
  expect(screen.getByLabelText(/Última atualização clínica em 8 de setembro\. Há \d+ dias/)).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: /Atualizar minha situação|dor|mobilidade/i })).not.toBeOnTheScreen();
});

it('não repete o histórico nem o envio de documento, que têm aba própria', async () => {
  await openSignedIn();
  await screen.findByText('Situação atual');
  expect(screen.queryByText('Acontecimentos recentes')).not.toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Ver histórico completo' })).not.toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: /Enviar exame ou laudo/ })).not.toBeOnTheScreen();
});

it('mostra o ponto de aviso no sino e abre as notificações', async () => {
  const user = userEvent.setup();
  await openSignedIn();
  await user.press(await screen.findByRole('button', { name: 'Notificações, 2 novas' }));
  expect(screen).toHavePathname('/notifications');
  expect(await screen.findByText('Falta um exame')).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: /Falta um exame/ }));
  expect(screen).toHavePathname('/documents');
});

it('mantém a última posição e avisa quando está sem conexão', async () => {
  const user = userEvent.setup();
  await openSignedIn();
  expect(await screen.findByText('42ª')).toBeOnTheScreen();
  jest.spyOn(api, 'getHome').mockRejectedValue(new Error('offline'));
  await user.press(screen.getByRole('tab', { name: 'Documentos' }));
  await user.press(await screen.findByRole('tab', { name: 'Início' }));
  expect(await screen.findByText('Sem conexão com a internet')).toBeOnTheScreen();
  expect(screen.getByText('42ª')).toBeOnTheScreen();
});

it('mostra erro com nova tentativa quando não há dado nenhum', async () => {
  const spy = jest.spyOn(api, 'getHome').mockRejectedValueOnce(new Error('offline'));
  await openSignedIn();
  expect(await screen.findByText('Não foi possível carregar sua jornada')).toBeOnTheScreen();
  spy.mockRestore();
  await userEvent.setup().press(screen.getByRole('button', { name: 'Tentar de novo' }));
  expect(await screen.findByText('42ª')).toBeOnTheScreen();
});

it('navega pelas quatro abas e destaca a ativa', async () => {
  const user = userEvent.setup();
  await openSignedIn();
  expect(await screen.findByRole('tab', { name: 'Início', selected: true })).toBeOnTheScreen();
  for (const [name, path] of [
    ['Documentos', '/documents'],
    ['Histórico', '/history'],
    ['Perfil', '/profile'],
  ]) {
    await user.press(screen.getByRole('tab', { name }));
    expect(screen).toHavePathname(path);
    expect(await screen.findByRole('tab', { name, selected: true })).toBeOnTheScreen();
  }
});
