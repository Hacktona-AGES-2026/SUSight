import { useState } from 'react';
import { Image } from 'expo-image';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api';
import { FOOTNOTE } from '../components/Splash';
import { Button, TextField } from '../components/ui';
import { formatCpf, isValidCpf } from '../format';
import { useSession } from '../session';
import { colors, shadow, type } from '../theme';

/** Entrar: CPF e código de acesso de 6 dígitos, em uma única tela. */
export default function Login() {
  const { signIn } = useSession();
  const [cpf, setCpf] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!isValidCpf(cpf)) return setError('Confira o CPF digitado.');
    if (code.length !== 6) return setError('Digite os 6 dígitos do código.');
    setError('');
    setSending(true);
    try {
      const { token } = await api.verifyCode(cpf, code);
      await signIn(token);
    } catch (e) {
      setError((e as Error).message);
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo.png')} style={st.logo} accessible={false} />
          <Text style={[type.largeTitle, st.center]} accessibilityRole="header">
            Entrar no SUSight
          </Text>
          <Text style={[type.subtitle, st.center, { color: colors.textSecondary }]}>
            Use seu CPF e o código de acesso para acompanhar sua solicitação.
          </Text>
          <View style={{ alignSelf: 'stretch', gap: 12 }}>
            <TextField
              label="CPF"
              value={cpf}
              onChangeText={(t) => setCpf(formatCpf(t))}
              placeholder="000.000.000-00"
              keyboardType="number-pad"
              autoComplete="off"
              textContentType="none"
              maxLength={14}
            />
            <TextField
              label="Código de acesso"
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="number-pad"
              secureTextEntry
              autoComplete="off"
              textContentType="none"
              maxLength={6}
              onSubmitEditing={send}
              error={error}
            />
          </View>
          <View style={{ alignSelf: 'stretch' }}>
            <Button label="Entrar" onPress={send} loading={sending} />
          </View>
          <Text style={[type.note, st.foot]}>{FOOTNOTE}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  content: { flexGrow: 1, padding: 16, paddingTop: 96, gap: 16, alignItems: 'center' },
  logo: { width: 88, height: 88, borderRadius: 30, ...shadow },
  center: { textAlign: 'center' },
  foot: { marginTop: 'auto', paddingTop: 32, width: 290, textAlign: 'center', color: colors.textSecondary },
});
