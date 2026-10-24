import {
  checkFile,
  daysAgo,
  formatCpf,
  fullDate,
  isLegible,
  isValidCpf,
  longDate,
  maskPhone,
  shortDate,
  waitingTime,
} from '../format';

const MB = 1024 * 1024;

describe('datas', () => {
  it('formata como no Figma', () => {
    expect(shortDate('2026-10-20')).toBe('20 out');
    expect(longDate('2026-10-24')).toBe('24 de outubro');
    expect(fullDate('2026-03-14')).toBe('14 de março de 2026');
  });

  it('conta dias e tempo de espera', () => {
    const now = new Date('2026-10-24T12:00:00');
    expect(daysAgo('2026-09-08', now)).toBe(46);
    expect(waitingTime('2026-03-14', now)).toBe('7 meses e 10 dias');
    expect(waitingTime('2026-09-23', now)).toBe('1 mês e 1 dia');
    expect(waitingTime('2026-10-24', now)).toBe('0 dias');
  });
});

describe('máscaras', () => {
  it('mostra só os 4 últimos dígitos do telefone', () => {
    expect(maskPhone('21987653187')).toBe('(21) 9•••• -3187');
  });

  it('formata o CPF enquanto digita', () => {
    expect(formatCpf('5299822')).toBe('529.982.2');
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
    expect(formatCpf('529.982.247-25999')).toBe('529.982.247-25');
  });
});

describe('isValidCpf', () => {
  it('aceita CPF com dígitos verificadores certos', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('recusa dígitos errados, repetidos ou incompletos', () => {
    expect(isValidCpf('529.982.247-24')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('529.982')).toBe(false);
  });
});

describe('checkFile', () => {
  it('aceita PDF, JPG e PNG até 20 MB', () => {
    expect(checkFile({ name: 'a.pdf', mimeType: 'application/pdf', size: 20 * MB })).toBeNull();
    expect(checkFile({ name: 'a.jpg', mimeType: 'image/jpeg', size: MB })).toBeNull();
    expect(checkFile({ name: 'a.png', mimeType: 'image/png' })).toBeNull();
  });

  it('recusa outros formatos e arquivos grandes com mensagem em português', () => {
    expect(checkFile({ name: 'a.heic', mimeType: 'image/heic', size: MB })).toBe(
      'Esse formato não é aceito. Envie um arquivo PDF, JPG ou PNG.',
    );
    expect(checkFile({ name: 'a.pdf', mimeType: 'application/pdf', size: 21 * MB })).toBe(
      'O arquivo tem mais de 20 MB. Escolha um arquivo menor.',
    );
  });
});

describe('isLegible', () => {
  it('considera legível PDF e imagem com resolução suficiente', () => {
    expect(isLegible({ name: 'a.pdf', mimeType: 'application/pdf' })).toBe(true);
    expect(isLegible({ name: 'a.jpg', mimeType: 'image/jpeg', width: 1200, height: 1600 })).toBe(true);
    expect(isLegible({ name: 'a.jpg', mimeType: 'image/jpeg', width: 400, height: 600 })).toBe(false);
  });
});
