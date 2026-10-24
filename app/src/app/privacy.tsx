import { Alert, Text } from 'react-native';
import { api } from '../api';
import { Card, Divider, NavBar, Row, Screen, SectionTitle } from '../components/ui';
import { colors, type } from '../theme';

/** "6.4 Privacidade e dados" (86-2068). Leaving the queue is handled in Pulse Clinical, not here. */
export default function Privacy() {
  const requestCopy = async () => {
    try {
      await api.requestDataCopy();
      Alert.alert('Pedido registrado', 'Você vai receber a cópia dos seus dados pelo aplicativo.');
    } catch {
      Alert.alert('Não foi possível registrar o pedido', 'Verifique sua conexão e tente de novo.');
    }
  };

  return (
    <Screen nav={<NavBar title="Privacidade e dados" back="Perfil" />} tabs={false}>
      <SectionTitle>Como usamos seus dados</SectionTitle>
      <Card style={{ padding: 16 }}>
        <Text style={[type.subtitle, { color: colors.textMuted }]}>
          Usamos seus dados para organizar a fila de cirurgias de forma justa e manter sua posição atualizada. Eles não
          são vendidos nem compartilhados com empresas.
        </Text>
      </Card>
      <SectionTitle>Quem acessa</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <Row title="Regulação do SUS" subtitle="Valida prioridades e organiza a fila" />
        <Divider />
        <Row title="Profissionais de saúde" subtitle="Revisam seus documentos" />
        <Divider />
        <Row title="Assistente de IA" subtitle="Só lê documentos para propor. Quem decide é sempre um profissional." />
      </Card>
      <SectionTitle>Seus direitos (LGPD)</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <Row
          icon="file"
          title="Pedir uma cópia dos meus dados"
          subtitle="A resposta chega pelo aplicativo"
          chevron
          onPress={requestCopy}
        />
      </Card>
    </Screen>
  );
}
