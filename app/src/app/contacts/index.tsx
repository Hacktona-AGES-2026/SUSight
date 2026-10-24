import { router } from 'expo-router';
import { Fragment } from 'react';
import { Text } from 'react-native';
import { api } from '../../api';
import { Button, Card, Divider, Loading, NavBar, Notice, Row, Screen } from '../../components/ui';
import { maskPhone } from '../../format';
import { colors, type } from '../../theme';
import { useLoad } from '../../useLoad';

/** "6.1 Contatos autorizados" (86-1882). */
export default function Contacts() {
  const { data } = useLoad(() => api.getContacts());
  return (
    <Screen nav={<NavBar title="Contatos autorizados" back="Perfil" />} tabs={false}>
      <Text style={[type.subtitle, { color: colors.textSecondary }]}>
        Pessoas que podem acompanhar a situação da sua solicitação.
      </Text>
      {!data && <Loading />}
      {!!data?.length && (
        <Card style={{ paddingVertical: 4 }}>
          {data.map((c, i) => (
            <Fragment key={c.id}>
              {i > 0 && <Divider />}
              <Row
                icon="users"
                title={c.name}
                subtitle={`${c.relation} · ${maskPhone(c.phone)}`}
                chevron
                onPress={() => router.push({ pathname: '/contacts/[id]', params: { id: c.id } })}
              />
            </Fragment>
          ))}
        </Card>
      )}
      <Notice
        title="O que eles recebem"
        text="Avisos curtos por SMS sobre a situação da solicitação. Eles não veem seus exames, laudos nem documentos."
      />
      <Button label="Adicionar contato" onPress={() => router.push('/contacts/new')} />
    </Screen>
  );
}
