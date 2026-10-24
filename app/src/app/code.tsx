import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api';
import { Button, NavBar, TextField } from '../components/ui';
import { maskPhone } from '../format';
import { useSession } from '../session';
import { colors, type } from '../theme';

const RESEND_SECONDS = 60;

/** "0.2 Código de verificação" (85-1883). */
export default function Code() {
  const { cpf, phone } = useLocalSearchParams<{ cpf: string; phone: string }>();
  const { signIn } = useSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const submit = async () => {
    if (code.length !== 6) return setError('Digite os 6 dígitos do código.');
    setBusy(true);
    setError('');
    try {
      const { token } = await api.verifyCode(cpf, code);
      await signIn(token);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const resend = async () => {
    setLeft(RESEND_SECONDS);
    await api.requestCode(cpf).catch((e: Error) => setError(e.message));
  };

  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <NavBar title="Entrar" back="Voltar" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={st.content}>
          <Text style={type.title} accessibilityRole="header">
            Digite o código
          </Text>
          <Text style={[type.subtitle, { color: colors.textSecondary }]}>
            Enviamos um código de 6 dígitos por SMS para {phone ? maskPhone(phone) : 'o telefone cadastrado'}.
          </Text>
          <TextField
            label="Código de verificação"
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="000 000"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={6}
            error={error}
          />
          <Pressable
            onPress={resend}
            disabled={left > 0}
            accessibilityRole="button"
            accessibilityState={{ disabled: left > 0 }}
            style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
          >
            <Text style={[type.noteStrong, { color: left > 0 ? colors.textSecondary : colors.accentInk }]}>
              {left > 0 ? `Reenviar código em ${clock}` : 'Reenviar código'}
            </Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Button label="Entrar" onPress={submit} loading={busy} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  content: { flex: 1, padding: 16, gap: 12 },
});
