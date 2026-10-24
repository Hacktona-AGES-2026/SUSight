import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Splash } from '../components/Splash';
import { Button } from '../components/ui';
import { SessionProvider, useSession } from '../session';
import { WidgetBridge } from '../widgets/WidgetBridge';

SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_SPLASH_MS = 800;

function Gate() {
  const { status, unlock, signOut, touch } = useSession();
  const [minElapsed, setMinElapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status === 'locked') unlock();
  }, [status, unlock]);

  useEffect(() => {
    if (status === 'signedIn') touch();
  }, [pathname, status, touch]);

  // While loading or locked the app routes stay mounted under the cover, so deep links survive.
  const signedOut = status === 'signedOut';
  // The navigator stays mounted; the opening screen and the Face ID lock cover it.
  const cover = status === 'loading' || !minElapsed || status === 'locked';
  return (
    <>
      <View
        style={{ flex: 1 }}
        accessibilityElementsHidden={cover}
        importantForAccessibility={cover ? 'no-hide-descendants' : 'auto'}
      >
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
          <Stack.Protected guard={signedOut}>
            <Stack.Screen name="login" />
            <Stack.Screen name="code" />
          </Stack.Protected>
          <Stack.Protected guard={!signedOut}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="new-document" options={{ presentation: 'modal' }} />
            <Stack.Screen name="contacts/index" />
            <Stack.Screen name="contacts/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="contacts/[id]" />
            <Stack.Screen name="privacy" />
          </Stack.Protected>
        </Stack>
      </View>
      {cover && (
        <View style={StyleSheet.absoluteFill}>
          <Splash>
            {status === 'locked' && minElapsed && (
              <View style={{ gap: 12, marginTop: 24, width: 358 }}>
                <Button label="Desbloquear com Face ID" onPress={unlock} />
                <Button label="Entrar de outro jeito" kind="soft" onPress={signOut} />
              </View>
            )}
          </Splash>
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SessionProvider>
        <WidgetBridge />
        <Gate />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
