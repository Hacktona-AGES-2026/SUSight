import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api, DocType } from '../api';
import { Button, Icon, NavBar, Notice, Row, Screen } from '../components/ui';
import { fileSize, isLegible, PickedFile } from '../format';
import { colors, type } from '../theme';

const TYPES: DocType[] = ['Exame', 'Laudo', 'Relatório', 'Outro'];

/** "2.3 Novo documento" (41-514), without the notes field (spec 001). */
export default function NewDocument() {
  const p = useLocalSearchParams<Record<string, string>>();
  const file: PickedFile = {
    uri: p.uri,
    name: p.name,
    mimeType: p.mimeType,
    size: p.size ? Number(p.size) : undefined,
    width: p.width ? Number(p.width) : undefined,
    height: p.height ? Number(p.height) : undefined,
  };
  const legible = isLegible(file);
  const [docType, setDocType] = useState<DocType>('Exame');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [term, setTerm] = useState<{ version: string; text: string } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    api
      .getTerm()
      .then(setTerm)
      .catch(() => {});
  }, []);

  const send = async () => {
    setSending(true);
    setFailed(false);
    try {
      await api.uploadDocument({
        file,
        type: docType,
        requestedId: p.requestedId,
        termVersion: accepted ? term?.version : undefined,
      });
      router.navigate({ pathname: '/documents', params: { received: '1' } });
    } catch (e) {
      setErrorText((e as Error).message);
      setFailed(true);
      setSending(false);
    }
  };

  return (
    <Screen
      nav={<NavBar title={p.requestedName ?? 'Novo documento'} cancel />}
      tabs={false}
      footer={
        <Button
          label={failed ? 'Tentar de novo' : 'Enviar documento'}
          onPress={send}
          loading={sending}
          disabled={!!term && !accepted}
        />
      }
    >
      <View style={st.preview}>
        {file.mimeType?.startsWith('image/') && file.uri ? (
          <Image
            source={{ uri: file.uri }}
            style={st.thumb}
            contentFit="cover"
            accessibilityLabel="Pré-visualização do documento"
          />
        ) : (
          <View style={st.thumbFallback} accessible accessibilityLabel="Arquivo PDF">
            <Icon name="file-accent" size={48} />
          </View>
        )}
        <Row
          icon="file"
          title={file.name}
          subtitle={`${p.source ?? 'Arquivos'} · ${fileSize(file.size)}`}
          chip={legible ? { label: 'Legível', tone: 'info' } : { label: 'Pouco legível', tone: 'strong' }}
        />
      </View>
      {!legible && (
        <Notice
          tone="warning"
          title="A imagem pode estar difícil de ler"
          text="Se puder, troque por uma foto com boa luz e o documento inteiro aparecendo. Você também pode enviar assim."
        />
      )}
      {!legible && <Button label="Trocar arquivo" kind="soft" onPress={() => router.back()} />}

      <Text style={[type.note, st.label]}>Tipo de documento</Text>
      <View style={st.segmented} accessibilityRole="radiogroup" accessibilityLabel="Tipo de documento">
        {TYPES.map((t) => {
          const selected = t === docType;
          return (
            <Pressable
              key={t}
              onPress={() => setDocType(t)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={t}
              style={[st.segment, selected && st.segmentOn]}
            >
              <Text style={[selected ? type.noteStrong : type.note, !selected && { color: colors.textMuted }]}>
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {term && (
        <View style={st.term}>
          <Text style={type.noteStrong}>Termo de envio de documentos</Text>
          <Text style={[type.note, { color: colors.textSecondary }]}>{term.text}</Text>
          <Pressable
            onPress={() => setAccepted(!accepted)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            accessibilityLabel="Li e aceito o termo"
            style={st.accept}
          >
            <View style={[st.box, accepted && st.boxOn]} />
            <Text style={type.noteStrong}>Li e aceito o termo</Text>
          </Pressable>
        </View>
      )}

      {failed && (
        <Notice
          tone="warning"
          title="Não foi possível enviar o documento"
          text={errorText || 'Verifique sua conexão e tente de novo. O arquivo e o tipo escolhidos continuam aqui.'}
        />
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  term: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 8 },
  accept: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.textMuted },
  boxOn: { backgroundColor: colors.accentInk, borderColor: colors.accentInk },
  preview: { backgroundColor: colors.surface, borderRadius: 24, paddingVertical: 12 },
  thumb: { height: 150, borderRadius: 20, marginHorizontal: 4 },
  thumbFallback: {
    height: 150,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.textSecondary, paddingHorizontal: 4 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.chip,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  segment: { flex: 1, minHeight: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.accentHighlight },
});
