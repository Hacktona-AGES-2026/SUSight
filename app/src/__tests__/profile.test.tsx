import { fireEvent, userEvent, waitFor, within } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { screen } from 'expo-router/testing-library';
import { Alert } from 'react-native';
import { api } from '../api';
import { openSignedIn } from '../../test/utils';

afterEach(() => jest.restoreAllMocks());

describe('Histórico', () => {
  it('lista os eventos do mais recente ao mais antigo', async () => {
    await openSignedIn('/history');
    const list = await screen.findByLabelText('Linha do tempo da solicitação');
    const labels = within(list)
      .getAllByLabelText(/\d{1,2} \w{3}$/)
      .map((e) => e.props.accessibilityLabel);
    expect(labels[0]).toMatch(/^Pedido de exame\. .*\. 22 out$/);
    expect(labels.at(-1)).toBe('Entrada na fila de cirurgia. Encaminhamento da UBS Icaraí.. 14 mar');
  });

  it('explica quando ainda não há eventos', async () => {
    jest.spyOn(api, 'getHistory').mockResolvedValue([]);
    await openSignedIn('/history');
    expect(await screen.findByText('Nada por aqui ainda')).toBeOnTheScreen();
  });
});

describe('Perfil', () => {
  it('mascara Cartão SUS e telefone e não oferece WhatsApp', async () => {
    await openSignedIn('/profile');
    expect(await screen.findByText('Cartão SUS •••• •••• 4821')).toBeOnTheScreen();
    expect(screen.getByText('(21) 9•••• -3187')).toBeOnTheScreen();
    expect(screen.queryByText(/WhatsApp|Pedidos de informação/)).not.toBeOnTheScreen();
  });

  it('com os avisos desligados, só o aviso de exame pedido aparece', async () => {
    const user = userEvent.setup();
    await openSignedIn('/profile');
    await fireEvent(await screen.findByRole('switch', { name: /Avisos no aplicativo/ }), 'valueChange', false);
    expect(JSON.parse((await SecureStore.getItemAsync('prefs'))!)).toMatchObject({ notifications: false });
    await user.press(screen.getByRole('tab', { name: 'Início' }));
    await user.press(await screen.findByRole('button', { name: /^Notificações/ }));
    expect(await screen.findByText('Falta um exame')).toBeOnTheScreen();
    expect(screen.queryByText('Documento recebido')).not.toBeOnTheScreen();
  });

  it('sai da conta e volta ao login', async () => {
    const alert = jest.spyOn(Alert, 'alert');
    await openSignedIn('/profile');
    await userEvent.setup().press(await screen.findByRole('button', { name: 'Sair da conta' }));
    alert.mock.calls.at(-1)![2]!.find((b) => b.style === 'destructive')!.onPress!();
    expect(await screen.findByText('Entrar no SUSight')).toBeOnTheScreen();
    expect(await SecureStore.getItemAsync('session')).toBeNull();
  });
});

describe('Contatos autorizados', () => {
  it('adiciona e remove contatos, que não veem exames', async () => {
    const user = userEvent.setup();
    const alert = jest.spyOn(Alert, 'alert');
    await openSignedIn('/profile');
    await user.press(await screen.findByRole('button', { name: /^Contatos autorizados/ }));
    expect(await screen.findByText(/Eles não veem seus exames, laudos nem documentos\./)).toBeOnTheScreen();
    expect(await screen.findByLabelText('João Albuquerque. Filho ou filha · (21) 9•••• -5521')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Adicionar contato' }));
    await user.press(await screen.findByRole('button', { name: 'Salvar contato' }));
    expect(await screen.findByText('Digite o nome do contato.')).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Nome'), 'Carlos Albuquerque');
    await user.press(screen.getByRole('radio', { name: 'Cônjuge' }));
    await user.type(screen.getByLabelText('Telefone'), '21999998888');
    await user.press(screen.getByRole('button', { name: 'Salvar contato' }));
    expect(await screen.findByLabelText('Carlos Albuquerque. Cônjuge · (21) 9•••• -8888')).toBeOnTheScreen();

    await user.press(screen.getByLabelText(/^João Albuquerque\./));
    expect(await screen.findByText(/Recebe avisos por SMS/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Remover contato' }));
    const confirm = alert.mock.calls.at(-1)![2]!.find((b) => b.style === 'destructive')!;
    confirm.onPress!(); // resolves while findBy advances the fake timers
    await waitFor(() => expect(screen.queryByLabelText(/^João Albuquerque\./)).not.toBeOnTheScreen());
    expect(screen).toHavePathname('/contacts');
    expect(screen.getByLabelText(/^Ana Albuquerque\./)).toBeOnTheScreen();
  });
});

describe('Privacidade e dados', () => {
  it('lista quem acessa, com o papel da IA, e permite pedir cópia dos dados', async () => {
    const user = userEvent.setup();
    const alert = jest.spyOn(Alert, 'alert');
    await openSignedIn('/privacy');
    expect(await screen.findByText('Regulação do SUS')).toBeOnTheScreen();
    expect(screen.getByText('Profissionais de saúde')).toBeOnTheScreen();
    expect(screen.getByText('Só lê documentos para propor. Quem decide é sempre um profissional.')).toBeOnTheScreen();
    expect(screen.queryByText(/exclusão/)).not.toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /Pedir uma cópia dos meus dados/ }));
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith('Pedido registrado', expect.stringContaining('pelo aplicativo')),
    );
  });
});
