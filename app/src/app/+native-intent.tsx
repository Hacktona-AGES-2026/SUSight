import { tabFromUrl } from '../widgets/links';

/** Mantém os links já publicados nos widgets e abre as rotas das telas do app. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  const tab = tabFromUrl(path) ?? (path === '/inicio' ? 'inicio' : path === '/documentos' ? 'documentos' : null);
  if (tab === 'inicio') return '/home';
  if (tab === 'documentos') return '/documents';
  return path;
}
