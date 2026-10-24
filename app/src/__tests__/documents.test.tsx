import { userEvent, within } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import { screen } from 'expo-router/testing-library';
import { Alert } from 'react-native';
import { api } from '../api';
import { openSignedIn } from '../../test/utils';

const MB = 1024 * 1024;

const pickFile = (asset: Partial<DocumentPicker.DocumentPickerAsset>) =>
  jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri: 'file:///x', name: 'x.pdf', mimeType: 'application/pdf', size: MB, lastModified: 0, ...asset }],
  } as DocumentPicker.DocumentPickerResult);

const openNewDocument = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.press(await screen.findByRole('button', { name: 'Adicionar documento' }));
};

afterEach(() => jest.restoreAllMocks());

it('lista documentos do mais recente ao mais antigo com tipo, data e situação', async () => {
  await openSignedIn('/documents');
  const list = await screen.findByLabelText('Documentos enviados');
  const rows = within(list)
    .getAllByLabelText(/·/)
    .map((r) => r.props.accessibilityLabel);
  expect(rows).toEqual([
    'Risco cirúrgico. Exame · 22 out. Pendente',
    'Eletrocardiograma pré-operatório. Exame · 21 out. Recebido',
    'Raio-X do joelho direito. Exame · 20 out. Recebido',
    'Ressonância do joelho direito. Laudo · 22 ago. Recebido',
  ]);
});

it('mostra um estado explicativo sem documentos', async () => {
  jest.spyOn(api, 'getDocuments').mockResolvedValue([]);
  await openSignedIn('/documents');
  expect(await screen.findByText('Nenhum documento enviado')).toBeOnTheScreen();
});

it('vai direto para os arquivos, sem câmera nem biblioteca de fotos', async () => {
  const user = userEvent.setup();
  pickFile({});
  await openSignedIn('/documents');
  await user.press(await screen.findByRole('button', { name: 'Adicionar documento' }));
  expect(await screen.findByText('Arquivos · 1,0 MB')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: /Tirar foto/ })).not.toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: /Biblioteca de fotos/ })).not.toBeOnTheScreen();
});

it('recusa formatos não aceitos com mensagem em português', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  const user = userEvent.setup();
  await openSignedIn('/documents');
  pickFile({ name: 'foto.heic', mimeType: 'image/heic' });
  await openNewDocument(user);
  expect(alert).toHaveBeenCalledWith(
    'Arquivo não aceito',
    'Esse formato não é aceito. Envie um arquivo PDF, JPG ou PNG.',
  );
  expect(screen).toHavePathname('/documents');
});

it('mostra o arquivo antes do envio, com tipo Exame e sem observações', async () => {
  const user = userEvent.setup();
  await openSignedIn('/documents');
  pickFile({ name: 'Raio-X_joelho_direito.pdf', size: 1.8 * MB });
  await openNewDocument(user);
  expect(await screen.findByText('Raio-X_joelho_direito.pdf')).toBeOnTheScreen();
  expect(screen.getByText('Arquivos · 1,8 MB')).toBeOnTheScreen();
  expect(screen.getByText('Legível')).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Exame', checked: true })).toBeOnTheScreen();
  for (const t of ['Laudo', 'Relatório', 'Outro']) expect(screen.getByRole('radio', { name: t })).toBeOnTheScreen();
  expect(screen.queryByText(/Observações/)).not.toBeOnTheScreen();
});

it('envia e volta com o aviso de documento recebido', async () => {
  const user = userEvent.setup();
  await openSignedIn('/documents');
  pickFile({ name: 'Hemograma.pdf' });
  await openNewDocument(user);
  await user.press(await screen.findByRole('button', { name: 'Enviar documento' }));
  expect(await screen.findByText('Documento recebido')).toBeOnTheScreen();
  expect(screen).toHavePathname('/documents');
  expect(await screen.findByLabelText(/^Hemograma\. Exame · .*\. Recebido$/)).toBeOnTheScreen();
});

it('permite tentar de novo sem perder o arquivo e o tipo', async () => {
  const user = userEvent.setup();
  await openSignedIn('/documents');
  pickFile({ name: 'Laudo.pdf' });
  await openNewDocument(user);
  await user.press(await screen.findByRole('radio', { name: 'Laudo' }));
  const upload = jest.spyOn(api, 'uploadDocument').mockRejectedValueOnce(new Error('offline'));
  await user.press(screen.getByRole('button', { name: 'Enviar documento' }));
  expect(await screen.findByText(/Não foi possível enviar o documento/)).toBeOnTheScreen();
  expect(screen.getByText('Laudo.pdf')).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Laudo', checked: true })).toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));
  expect(await screen.findByText('Documento recebido')).toBeOnTheScreen();
  expect(upload).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'Laudo' }));
});

it('atende um exame pendente escolhendo o arquivo', async () => {
  const user = userEvent.setup();
  await openSignedIn('/documents');
  pickFile({ uri: 'file:///f.jpg', name: 'risco.jpg', mimeType: 'image/jpeg', width: 400, height: 600 } as never);
  await user.press(await screen.findByRole('button', { name: /^Risco cirúrgico.*Pendente/ }));
  await user.press(screen.getByRole('button', { name: 'Enviar documento' }));
  expect(await screen.findByLabelText(/^Risco cirúrgico\. Exame · .*\. Recebido$/)).toBeOnTheScreen();
});
