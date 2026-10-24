import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Text } from 'react-native';
import { api } from '../../api';
import { Button, Card, Divider, Loading, NavBar, Row, Screen } from '../../components/ui';
import { fullDate, maskPhone } from '../../format';
import { colors, type } from '../../theme';
import { useLoad } from '../../useLoad';

/** "6.2 Contato autorizado" (86-1960). */
export default function ContactDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLoad(() => api.getContacts());
  const contact = data?.find((c) => c.id === id);
  const firstName = contact?.name.split(' ')[0];

  const remove = () =>
    Alert.alert('Remover contato?', `${firstName} deixa de receber avisos sobre a sua solicitação.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await api.removeContact(id);
          router.back();
        },
      },
    ]);

  return (
    <Screen nav={<NavBar title="Contato" back="Contatos" />} tabs={false}>
      {!contact ? (
        <Loading />
      ) : (
        <>
          <Card style={{ paddingVertical: 4 }}>
            <Row title={contact.name} subtitle="Nome" />
            <Divider />
            <Row title={contact.relation} subtitle="Parentesco" />
            <Divider />
            <Row title={maskPhone(contact.phone)} subtitle="Telefone" />
          </Card>
          <Text style={[type.note, { color: colors.textSecondary }]}>
            {firstName} acompanha a situação da sua solicitação desde {fullDate(contact.since)}. Recebe avisos por SMS.
          </Text>
          <Button label="Remover contato" kind="danger" onPress={remove} />
        </>
      )}
    </Screen>
  );
}
