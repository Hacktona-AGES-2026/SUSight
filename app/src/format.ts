const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

// Dates in the API are ISO days ("2026-10-24"); parse them as local days.
const parse = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const shortDate = (iso: string) => {
  const d = parse(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
};

export const longDate = (iso: string) => {
  const d = parse(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};

export const fullDate = (iso: string) => `${longDate(iso)} de ${parse(iso).getFullYear()}`;

export const daysAgo = (iso: string, now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - parse(iso).getTime()) / 86_400_000);
};

export const waitingTime = (iso: string, now = new Date()) => {
  const start = parse(iso);
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months--;
  const anchor = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
  const days = daysAgo(`${anchor.getFullYear()}-${anchor.getMonth() + 1}-${anchor.getDate()}`, now);
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  if (months === 0) return plural(days, 'dia', 'dias');
  return `${plural(months, 'mês', 'meses')} e ${plural(days, 'dia', 'dias')}`;
};

const digits = (text: string) => text.replace(/\D/g, '');

export const maskPhone = (phone: string) => {
  const d = digits(phone);
  return `(${d.slice(0, 2)}) ${d[2]}•••• -${d.slice(-4)}`;
};

export const formatCpf = (text: string) => {
  const d = digits(text).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
};

export const isValidCpf = (text: string) => {
  const d = digits(text);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    return ((sum * 10) % 11) % 10;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
};

export type PickedFile = {
  uri?: string;
  name: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
};

const ACCEPTED = /\.(pdf|jpe?g|png)$/i;
const MAX_BYTES = 20 * 1024 * 1024;

export const checkFile = (file: PickedFile) => {
  const typeOk = file.mimeType
    ? ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimeType)
    : ACCEPTED.test(file.name);
  if (!typeOk) return 'Esse formato não é aceito. Envie um arquivo PDF, JPG ou PNG.';
  // Unknown size passes; the server checks again.
  if (file.size && file.size > MAX_BYTES) return 'O arquivo tem mais de 20 MB. Escolha um arquivo menor.';
  return null;
};

// ponytail: resolution heuristic only warns, never blocks; swap for OCR confidence when the backend exposes it.
export const isLegible = (file: PickedFile) =>
  file.mimeType === 'application/pdf' || !file.width || Math.min(file.width, file.height ?? 0) >= 800;

export const fileSize = (bytes?: number) =>
  bytes ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : 'Tamanho desconhecido';
