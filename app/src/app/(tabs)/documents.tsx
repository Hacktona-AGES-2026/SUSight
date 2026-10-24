import { useLocalSearchParams } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { api, Doc, DocStatus } from '../../api';
import { SourceSheet } from '../../components/SourceSheet';
import { Button, Card, Divider, EmptyState, Loading, Notice, Row, Screen } from '../../components/ui';
import { shortDate } from '../../format';
import { colors, type } from '../../theme';
import { useLoad } from '../../useLoad';

const STATUS: Record<DocStatus, { label: string; tone: 'neutral' | 'accent' | 'strong' }> = {
  pending: { label: 'Pendente', tone: 'strong' },
  received: { label: 'Recebido', tone: 'neutral' },
  analyzing: { label: 'Em análise', tone: 'accent' },
};

/** "2.1 Documentos" (41-252), "2.4" after upload (41-564) and the empty state (92-2225). */
export default function Documents() {
  const { data, loading, error, reload } = useLoad(() => api.getDocuments());
  const { add, received } = useLocalSearchParams<{ add?: string; received?: string }>();
  const [sheet, setSheet] = useState<{ requested?: Doc } | null>(null);

  // `add` is a fresh token on every "Enviar exame ou laudo" tap from the home screen.
  useEffect(() => {
    if (add) setSheet({});
  }, [add]);

  return (
    <Screen title="Documentos" refreshing={loading && !!data} onRefresh={reload}>
      <Text style={[type.subtitle, { color: colors.textSecondary, paddingHorizontal: 4 }]}>
        Exames, laudos e relatórios médicos recentes ajudam na avaliação.
      </Text>
      {received === '1' && (
        <Notice
          tone="success"
          title="Documento recebido"
          text="Obrigado. Um profissional de saúde vai analisar o documento. Avisaremos você por aqui assim que houver novidades."
        />
      )}
      {!data && loading && <Loading />}
      {!data && error && (
        <EmptyState
          icon="alert"
          title="Não foi possível carregar seus documentos"
          text="Verifique sua conexão e tente de novo."
          action={{ label: 'Tentar de novo', onPress: reload }}
        />
      )}
      {data?.length === 0 && (
        <EmptyState
          icon="file-large"
          title="Nenhum documento enviado"
          text="Quando você enviar um exame, laudo ou relatório, ele aparece aqui com a situação da análise."
          action={{ label: 'Adicionar documento', onPress: () => setSheet({}) }}
        />
      )}
      {!!data?.length && (
        <>
          <Card accessibilityLabel="Documentos enviados">
            {data.map((doc, i) => (
              <Fragment key={doc.id}>
                {i > 0 && <Divider />}
                <Row
                  icon="file"
                  title={doc.name}
                  subtitle={`${doc.type} · ${shortDate(doc.date)}`}
                  chip={STATUS[doc.status]}
                  onPress={doc.status === 'pending' ? () => setSheet({ requested: doc }) : undefined}
                  accessibilityHint={doc.status === 'pending' ? 'Abre o envio deste exame' : undefined}
                />
              </Fragment>
            ))}
          </Card>
          <Button label="Adicionar documento" onPress={() => setSheet({})} />
        </>
      )}
      <SourceSheet visible={!!sheet} requested={sheet?.requested} onClose={() => setSheet(null)} />
    </Screen>
  );
}
