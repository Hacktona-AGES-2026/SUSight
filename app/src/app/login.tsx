import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api';
import { FOOTNOTE } from '../components/Splash';
import { Button, Icon, TextField } from '../components/ui';
import { formatCpf, isValidCpf } from '../format';
import { colors, shadow, type } from '../theme';

/** "0.1 Entrar" (85-1859). */
export default function Login() {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!isValidCpf(cpf)) return setError('Confira o CPF digitado.');
    setError('');
    setSending(true);
    try {
      const { phone } = await api.requestCode(cpf);
      router.push({ pathname: '/code', params: { cpf, phone } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
          <View style={st.logo}>
            <Icon name="pulse" size={44} />
          </View>
          <Text style={[type.largeTitle, st.center]} accessibilityRole="header">
            Entrar no SUSight
          </Text>
          <Text style={[type.subtitle, st.center, { color: colors.textSecondary }]}>
            Use sua conta gov.br ou seu CPF para acompanhar sua solicitação.
          </Text>
          <View style={{ height: 8 }} />
          <Button
            label="Entrar com gov.br"
            kind="dark"
            onPress={() =>
              Alert.alert(
                'gov.br em breve',
                'O acesso pelo gov.br ainda não está disponível. Por enquanto, entre com seu CPF.',
              )
            }
          />
          <Text style={[type.caption, st.center, { color: colors.textSecondary }]}>ou entre com seu CPF</Text>
          <View style={{ alignSelf: 'stretch' }}>
            <TextField
              label="CPF"
              value={cpf}
              onChangeText={(t) => setCpf(formatCpf(t))}
              placeholder="000.000.000-00"
              keyboardType="number-pad"
              autoComplete="off"
              textContentType="none"
              maxLength={14}
              onSubmitEditing={send}
              error={error}
            />
          </View>
          <View style={{ alignSelf: 'stretch' }}>
            <Button label="Enviar código" onPress={send} loading={sending} />
          </View>
          <Text style={[type.note, st.foot]}>{FOOTNOTE}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  content: { flexGrow: 1, padding: 16, paddingTop: 96, gap: 16, alignItems: 'center' },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  center: { textAlign: 'center' },
  foot: { marginTop: 'auto', paddingTop: 32, width: 290, textAlign: 'center', color: colors.textSecondary },
});
