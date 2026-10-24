import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api, visibleNotifications } from '../../api';
import { Ring } from '../../components/Ring';
import {
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  Event,
  Icon,
  Loading,
  Notice,
  Row,
  Screen,
  SectionTitle,
  Shortcut,
} from '../../components/ui';
import { daysAgo, fullDate, longDate, shortDate, waitingTime } from '../../format';
import { useSession } from '../../session';
import { colors, shadow, type } from '../../theme';
import { useLoad } from '../../useLoad';

/** "Início · Minha jornada" (41-21 and 41-111), with the offline (92-2265) and error (92-2332) states. */
export default function Home() {
  const { data, error, loading, loadedAt, reload } = useLoad(() => api.getHome());
  const { data: notifications } = useLoad(() => api.getNotifications());
  const { prefs } = useSession();
  const unread = visibleNotifications(notifications ?? [], prefs.notifications).filter((n) => !n.read).length;

  const bell = (
    <Pressable
      onPress={() => router.push('/notifications')}
      accessibilityRole="button"
      accessibilityLabel={unread ? `Notificações, ${unread} ${unread === 1 ? 'nova' : 'novas'}` : 'Notificações'}
      style={st.bell}
    >
      <Icon name="bell" size={22} />
      {unread > 0 && <View style={st.badge} />}
    </Pressable>
  );

  return (
    <Screen
      eyebrow="Minha jornada"
      title={data?.firstName ? `Olá, ${data.firstName}` : 'Olá'}
      right={bell}
      refreshing={loading && !!data}
      onRefresh={reload}
    >
      {!data && loading && <Loading />}
      {!data && error && (
        <EmptyState
          icon="alert"
          title="Não foi possível carregar sua jornada"
          text="Verifique sua conexão e tente de novo. Se continuar, fale com a sua UBS."
          action={{ label: 'Tentar de novo', onPress: reload }}
        />
      )}
      {data && (
        <>
          {error && loadedAt && (
            <Notice
              tone="warning"
              title="Sem conexão com a internet"
              text={`Mostrando os dados de ${longDate(loadedAt.toISOString())}, às ${loadedAt.getHours()}h${String(
                loadedAt.getMinutes(),
              ).padStart(2, '0')}. Puxe a tela para atualizar quando a conexão voltar.`}
            />
          )}
          <PositionCard request={data.request} />

          <Card style={{ padding: 16, gap: 6 }}>
            <View style={st.between}>
              <Chip label="Aguardando cirurgia" />
              <Text style={[type.note, { color: colors.textSecondary }]}>Nº {data.request.number}</Text>
            </View>
            <Text style={type.title3}>{data.request.procedure}</Text>
            <Text style={[type.subtitle, { color: colors.textSecondary }]}>{data.request.detail}</Text>
          </Card>

          <SectionTitle>Por que estou na fila</SectionTitle>
          <Card>
            <Row
              icon="map-pin"
              title={`Encaminhado em ${fullDate(data.request.referral.date)}`}
              subtitle={data.request.referral.place}
            />
          </Card>
          <Card>
            <Row icon="file" title="Motivo registrado" subtitle={data.request.reason} />
          </Card>
          <Text style={[type.note, { color: colors.textSecondary }]}>
            Um especialista indicou cirurgia e a regulação do SUS incluiu você na fila. Algo não está certo? Fale com a
            UBS ou envie um exame ou laudo.
          </Text>

          <SectionTitle>Situação atual</SectionTitle>
          <Card>
            <Row
              icon="shield"
              title="Prioridade validada pela regulação"
              subtitle={
                data.request.priority.validatedAt
                  ? `Validada em ${fullDate(data.request.priority.validatedAt)}`
                  : undefined
              }
              chip={{ label: data.request.priority.level, tone: 'strong' }}
            />
            <Divider />
            <Row
              icon="file"
              title={data.request.lastStep.title}
              subtitle={data.request.lastStep.detail}
              chip={data.request.lastStep.pending ? { label: 'Pendente', tone: 'strong' } : undefined}
            />
            <Divider />
            <Row icon="clock" title="Tempo de espera acumulado" subtitle={waitingTime(data.request.enteredAt)} />
            <Divider />
            <Row
              icon="refresh"
              title={`Última atualização clínica em ${longDate(data.request.lastClinicalUpdate)}`}
              subtitle={`Há ${daysAgo(data.request.lastClinicalUpdate)} dias`}
            />
          </Card>

          <Shortcut
            icon="upload"
            title="Enviar exame ou laudo"
            subtitle="Foto, galeria ou arquivo PDF"
            onPress={() => router.navigate({ pathname: '/documents', params: { add: String(Date.now()) } })}
          />

          <SectionTitle>Acontecimentos recentes</SectionTitle>
          <Card accessibilityLabel="Acontecimentos recentes">
            {data.recent.map((e) => (
              <Event key={e.id} title={e.title} detail={e.detail} date={shortDate(e.date)} tone={e.tone} />
            ))}
          </Card>
          <Button label="Ver histórico completo" kind="soft" onPress={() => router.navigate('/history')} />
        </>
      )}
    </Screen>
  );
}

function PositionCard({
  request,
}: {
  request: { position: number; total: number; specialty: string; city: string; updatedAt: string };
}) {
  return (
    <View style={st.position}>
      <View
        style={st.positionTop}
        accessible
        accessibilityLabel={`Sua posição atual na fila do SUS: ${request.position}ª de ${request.total} pessoas${place(request) ? `, em ${place(request)}` : ''}`}
      >
        <Ring position={request.position} total={request.total} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[type.note, { color: colors.textMuted }]}>Sua posição atual na fila do SUS</Text>
          <Text style={type.title}>de {request.total} pessoas</Text>
          <Text style={[type.subtitle, { color: colors.textMuted }]}>
            {place(request) ? `em ${place(request)}` : ' '}
          </Text>
        </View>
      </View>
      <View style={st.whiteLine} />
      <Text style={[type.note, { color: colors.textMuted }]}>
        Atualizada em {longDate(request.updatedAt)}. A posição pode subir ou descer quando outros pacientes são
        reavaliados. Não é uma previsão de data de cirurgia.
      </Text>
    </View>
  );
}

/** Specialty and city, skipping what the backend does not know. */
const place = (r: { specialty: string; city: string }) => [r.specialty, r.city].filter(Boolean).join(' · ');

const st = StyleSheet.create({
  bell: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 9, left: 28, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.dot },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  position: { backgroundColor: colors.accentHighlight, borderRadius: 32, padding: 22, gap: 14, ...shadow },
  positionTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  whiteLine: { height: 1, backgroundColor: colors.surface },
});
