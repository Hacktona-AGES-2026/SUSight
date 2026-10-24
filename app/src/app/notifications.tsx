import { router } from 'expo-router';
import { useEffect } from 'react';
import { notificationTarget, visibleNotifications } from '../api';
import { Card, EmptyState, Event, Loading, NavBar, Screen } from '../components/ui';
import { shortDate } from '../format';
import { useSession } from '../session';
import { markPatientNotificationsRead, usePatientNotifications } from '../notifications/patient-notifications';

/** "5 Notificações" (42-816). Opening the list marks everything as read. */
export default function Notifications() {
  const { data, loading, error, reload } = usePatientNotifications();
  const { prefs } = useSession();
  const list = visibleNotifications(data ?? [], prefs.notifications);

  useEffect(() => {
    if (data?.some((item) => !item.read)) markPatientNotificationsRead().catch(() => {});
  }, [data]);

  return (
    <Screen nav={<NavBar title="Notificações" back="Início" />} tabs={false}>
      {!data && loading && <Loading />}
      {!data && error && (
        <EmptyState
          icon="alert"
          title="Não foi possível carregar as notificações"
          text="Verifique sua conexão e tente de novo."
          action={{ label: 'Tentar de novo', onPress: reload }}
        />
      )}
      {data && list.length === 0 && (
        <EmptyState
          icon="bell"
          title="Nenhuma notificação"
          text="Quando algo mudar na sua solicitação, avisamos por aqui."
        />
      )}
      {list.length > 0 && (
        <Card style={{ paddingVertical: 4 }}>
          {list.map((n) => (
            <Event
              key={n.id}
              title={n.title}
              detail={n.body}
              date={shortDate(n.date)}
              tone={n.read ? 'muted' : n.kind === 'exam_requested' ? 'light' : 'strong'}
              onPress={() => router.navigate(notificationTarget[n.kind])}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}
