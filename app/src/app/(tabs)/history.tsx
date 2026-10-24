import { Text } from 'react-native';
import { api } from '../../api';
import { Card, EmptyState, Event, Loading, Screen } from '../../components/ui';
import { shortDate } from '../../format';
import { colors, type } from '../../theme';
import { useLoad } from '../../useLoad';

/** "4 Histórico" (42-713). Only facts already registered; no pending proposal shows as a position change. */
export default function History() {
  const { data, loading, error, reload } = useLoad(() => api.getHistory());
  return (
    <Screen title="Histórico" refreshing={loading && !!data} onRefresh={reload}>
      <Text style={[type.subtitle, { color: colors.textSecondary, paddingHorizontal: 4 }]}>
        Tudo o que aconteceu na sua solicitação, do mais recente ao mais antigo.
      </Text>
      {!data && loading && <Loading />}
      {!data && error && (
        <EmptyState
          icon="alert"
          title="Não foi possível carregar o histórico"
          text="Verifique sua conexão e tente de novo."
          action={{ label: 'Tentar de novo', onPress: reload }}
        />
      )}
      {data?.length === 0 && (
        <EmptyState
          icon="clock"
          title="Nada por aqui ainda"
          text="Quando algo acontecer na sua solicitação, como um documento recebido ou uma reavaliação, aparece aqui."
        />
      )}
      {!!data?.length && (
        <Card style={{ paddingVertical: 4 }} accessibilityLabel="Linha do tempo da solicitação">
          {data.map((e) => (
            <Event key={e.id} title={e.title} detail={e.detail} date={shortDate(e.date)} tone={e.tone} />
          ))}
        </Card>
      )}
    </Screen>
  );
}
