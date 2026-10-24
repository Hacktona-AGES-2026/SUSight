import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import { Button, Card, Divider, EmptyState, Loading, Row, Screen, SectionTitle, Toggle } from '../../components/ui';
import { maskPhone } from '../../format';
import { useSession } from '../../session';
import { colors, type } from '../../theme';
import { useLoad } from '../../useLoad';

/** "6 Perfil e preferências" (42-887), without WhatsApp and "Pedidos de informação" (spec 003). */
export default function Profile() {
  const { data, loading, error, reload } = useLoad(() => Promise.all([api.getProfile(), api.getContacts()]));
  const { prefs, setPref, signOut } = useSession();

  const toggleFaceId = async (on: boolean) => {
    if (!on) return setPref('faceId', false);
    if (!(await LocalAuthentication.hasHardwareAsync()) || !(await LocalAuthentication.isEnrolledAsync())) {
      return Alert.alert('Face ID indisponível', 'Cadastre o Face ID nos Ajustes do celular para usar o bloqueio.');
    }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Ativar bloqueio com Face ID' });
    if (result.success) await setPref('faceId', true);
  };

  if (!data) {
    return (
      <Screen title="Perfil">
        {loading ? (
          <Loading />
        ) : (
          error && (
            <EmptyState
              icon="alert"
              title="Não foi possível carregar seu perfil"
              text="Verifique sua conexão e tente de novo."
              action={{ label: 'Tentar de novo', onPress: reload }}
            />
          )
        )}
      </Screen>
    );
  }

  const [profile, contacts] = data;
  const first = contacts[0];

  return (
    <Screen title="Perfil">
      <Card style={st.identity}>
        <View style={st.avatar} accessible={false}>
          <Text style={[type.title, { color: colors.accentInk }]}>{profile.initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.bodyStrong}>{profile.name}</Text>
          <Text style={[type.note, { color: colors.textSecondary }]}>Cartão SUS •••• •••• {profile.cnsLast4}</Text>
        </View>
      </Card>

      <SectionTitle>Dados básicos</SectionTitle>
      <Card>
        <Row title={profile.birthDate} subtitle="Nascimento" />
        <Divider />
        <Row title={maskPhone(profile.phone)} subtitle="Telefone" />
        <Divider />
        <Row title={profile.city} subtitle="Município" />
      </Card>
      <Text style={[type.note, { color: colors.textSecondary, paddingHorizontal: 4 }]}>
        Para corrigir algum dado, procure a sua UBS.
      </Text>

      <SectionTitle>Notificações e acompanhamento</SectionTitle>
      <Card>
        <Toggle
          title="Avisos no aplicativo"
          subtitle="Documento recebido, análise concluída, prioridade validada. O aviso de exame pedido sempre chega."
          value={prefs.notifications}
          onChange={(v) => setPref('notifications', v)}
        />
      </Card>

      <SectionTitle>Privacidade e contatos</SectionTitle>
      <Card>
        <Row
          icon="users"
          title="Contatos autorizados"
          subtitle={
            first
              ? `${first.name} (${first.relation.toLowerCase()}) · pode acompanhar a situação`
              : 'Ninguém acompanha sua solicitação'
          }
          chevron
          onPress={() => router.push('/contacts')}
        />
        <Divider />
        <Row
          icon="lock"
          title="Privacidade e dados"
          subtitle="Quem acessa suas informações (LGPD)"
          chevron
          onPress={() => router.push('/privacy')}
        />
        <Divider />
        <Toggle
          title="Bloqueio com Face ID"
          subtitle="Pede o Face ID ao abrir o aplicativo."
          value={prefs.faceId}
          onChange={toggleFaceId}
        />
      </Card>

      <Button
        label="Sair da conta"
        kind="danger"
        onPress={() =>
          Alert.alert('Sair da conta?', 'Para voltar, você vai precisar entrar com seu CPF de novo.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: signOut },
          ])
        }
      />
    </Screen>
  );
}

const st = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
