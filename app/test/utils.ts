import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';
import { resetDemo } from '../src/api';

/** Opens the app at `url` with a saved session, skipping the login. */
export async function openSignedIn(url = '/home', prefs?: { notifications: boolean; faceId: boolean }) {
  resetDemo();
  await SecureStore.setItemAsync('session', JSON.stringify({ token: 't', lastActive: Date.now() }));
  if (prefs) await SecureStore.setItemAsync('prefs', JSON.stringify(prefs));
  return renderRouter('./src/app', { initialUrl: url });
}
