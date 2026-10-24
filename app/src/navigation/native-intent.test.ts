import { redirectSystemPath } from '../app/+native-intent';

it.each([
  ['pulse://inicio', '/home'],
  ['pulse://documentos', '/documents'],
  ['/documentos', '/documents'],
  ['susight://history', 'susight://history'],
])('preserva o destino de %s', (path, expected) => {
  expect(redirectSystemPath({ path, initial: true })).toBe(expected);
});
