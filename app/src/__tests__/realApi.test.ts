import * as SecureStore from 'expo-secure-store';
import { ApiError } from '../apiTypes';
import { createRealApi, toBase64, toDocs, toTimeline } from '../realApi';

type Handler = (init: RequestInit) => { status?: number; body?: unknown } | Promise<ArrayBuffer>;

/** A fetch fake that answers by "METHOD /path" and records the calls. */
function backend(routes: Record<string, Handler | { status?: number; body?: unknown }>) {
  const calls: { key: string; init: RequestInit }[] = [];
  const impl = (async (url: string, init: RequestInit = {}) => {
    const key = `${init.method ?? 'GET'} ${url.replace('http://api', '')}`;
    calls.push({ key, init });
    const route = routes[key];
    if (!route) return { ok: false, status: 404, json: async () => ({}) };
    const out = typeof route === 'function' ? route(init) : route;
    if (out instanceof Promise) return { ok: true, status: 200, arrayBuffer: () => out };
    const status = out.status ?? 200;
    return { ok: status < 400, status, json: async () => out.body };
  }) as unknown as typeof fetch;
  return { api: createRealApi('http://api', impl), calls };
}

const row = {
  solicitacao_id: 'SOL-1008',
  cid: 'K409',
  dias_em_fila: 324,
  posicao: 8,
  justificativa: 'Posicao definida pela pontuacao.',
  prioridade_regulacao: 'Média',
};

beforeEach(() => SecureStore.setItemAsync('session', JSON.stringify({ token: 'tok', lastActive: Date.now() })));

test('toBase64 matches the standard encoding for every padding length', () => {
  for (const text of ['', 'a', 'ab', 'abc', 'abcd', '%PDF-1.4']) {
    expect(toBase64(new TextEncoder().encode(text))).toBe(btoa(text));
  }
});

test('login sends the CPF digits and the code, and maps errors', async () => {
  const ok = backend({ 'POST /sessoes': { body: { token: 'abc' } } });
  await expect(ok.api.verifyCode('529.982.247-25', '123456')).resolves.toEqual({ token: 'abc' });
  expect(JSON.parse(ok.calls[0].init.body as string)).toEqual({ identificador: '52998224725', senha: '123456' });

  await expect(backend({ 'POST /sessoes': { status: 401 } }).api.verifyCode('52998224725', '000000')).rejects.toThrow(
    'Código incorreto',
  );
  await expect(backend({ 'POST /sessoes': { status: 429 } }).api.verifyCode('52998224725', '000000')).rejects.toThrow(
    'Muitas tentativas',
  );
});

test('home shows position out of the whole queue and the pending exam as the last step', async () => {
  const { api, calls } = backend({
    'GET /fila': { body: { total: 20, pacientes: [row] } },
    'GET /solicitacoes/SOL-1008/historico': {
      body: {
        eventos: [{ tipo: 'entrada_na_fila', texto: 'Entrou na fila.', data_hora: '2026-03-10T10:00:00+00:00' }],
      },
    },
    'GET /solicitacoes/SOL-1008/exames-pedidos': {
      body: {
        pedidos: [
          { pedido_id: 'p1', exame: 'Risco cirurgico', situacao: 'pendente', data_hora: '2026-10-24T10:00:00+00:00' },
        ],
      },
    },
  });

  const home = await api.getHome();

  expect(home.request).toMatchObject({
    number: 'SOL-1008',
    procedure: 'Hérnia inguinal',
    position: 8,
    total: 20,
    priority: { level: 'Moderada' },
    lastStep: { pending: true },
  });
  expect(home.request.lastStep.detail).toContain('risco cirurgico');
  expect(calls[0].init.headers).toMatchObject({ Authorization: 'Bearer tok' });
});

test('an expired session clears the saved session', async () => {
  const { api } = backend({ 'GET /fila': { status: 401 } });
  await expect(api.getHistory()).rejects.toBeInstanceOf(ApiError);
  expect(await SecureStore.getItemAsync('session')).toBeNull();
});

test('upload needs the accepted term and sends the file as base64 linked to the request', async () => {
  const bytes = new TextEncoder().encode('%PDF-1.4').buffer;
  const { api, calls } = backend({
    'GET /fila': { body: { total: 20, pacientes: [row] } },
    'GET /file.pdf': () => Promise.resolve(bytes as ArrayBuffer),
    'POST /documentos/arquivo': { status: 201, body: { documento_id: 'doc1' } },
  });
  const file = { uri: 'http://api/file.pdf', name: 'risco.pdf', mimeType: 'application/pdf' };

  await expect(api.uploadDocument({ file, type: 'Exame' })).rejects.toThrow('Aceite o termo');
  await api.uploadDocument({ file, type: 'Exame', requestedId: 'p1', termVersion: 'v1' });

  const post = calls.find((c) => c.key === 'POST /documentos/arquivo')!;
  expect(JSON.parse(post.init.body as string)).toMatchObject({
    solicitacao_id: 'SOL-1008',
    tipo_mime: 'application/pdf',
    conteudo_base64: btoa('%PDF-1.4'),
    termo_versao: 'v1',
    aceite_termo: true,
    pedido_id: 'p1',
  });
});

test('timeline and documents translate backend events and requests', () => {
  const now = new Date('2026-10-24T12:00:00Z');
  const timeline = toTimeline(
    [
      { tipo: 'informacao_solicitada', texto: 'Pedido.', data_hora: '2026-10-24T10:00:00Z' },
      { tipo: 'documento_recebido', texto: 'Recebido.', data_hora: '2026-10-23T10:00:00Z' },
      { tipo: 'entrada_na_fila', texto: 'Entrou.', data_hora: '2026-03-10T10:00:00Z' },
    ],
    now,
  );
  expect(timeline.map((t) => t.tone)).toEqual(['light', 'strong', 'muted']);
  expect(
    toDocs([{ pedido_id: 'a', exame: 'ECG', situacao: 'em_analise', data_hora: '2026-10-20T00:00:00Z' }])[0],
  ).toMatchObject({
    status: 'received',
    name: 'ECG',
  });
});
