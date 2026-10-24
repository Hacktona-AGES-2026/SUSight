import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Doc } from '../api';
import { checkFile, PickedFile } from '../format';
import { colors, type } from '../theme';
import { Button, Divider, Row } from './ui';

type Source = 'Câmera' | 'Fotos' | 'Arquivos';

async function pick(source: Source): Promise<PickedFile | null> {
  if (source === 'Arquivos') {
    const r = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });
    if (r.canceled) return null;
    const a = r.assets[0];
    return { uri: a.uri, name: a.name, mimeType: a.mimeType, size: a.size };
  }
  if (source === 'Câmera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Câmera sem permissão',
        'Permita o acesso à câmera nos Ajustes do celular para fotografar o documento.',
      );
      return null;
    }
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
  const r = await (source === 'Câmera'
    ? ImagePicker.launchCameraAsync(options)
    : ImagePicker.launchImageLibraryAsync(options));
  if (r.canceled) return null;
  const a = r.assets[0];
  return {
    uri: a.uri,
    name: a.fileName ?? `foto-${Date.now()}.jpg`,
    mimeType: a.mimeType ?? 'image/jpeg',
    size: a.fileSize,
    width: a.width,
    height: a.height,
  };
}

/** "2.2 Adicionar documento · opções" (53-2207). `requested` ties the upload to a pending exam. */
export function SourceSheet({
  visible,
  onClose,
  requested,
}: {
  visible: boolean;
  onClose: () => void;
  requested?: Doc;
}) {
  const choose = async (source: Source) => {
    onClose();
    const file = await pick(source);
    if (!file) return;
    const problem = checkFile(file);
    if (problem) return Alert.alert('Arquivo não aceito', problem);
    router.push({
      pathname: '/new-document',
      params: {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size?.toString(),
        width: file.width?.toString(),
        height: file.height?.toString(),
        source,
        requestedId: requested?.id,
        requestedName: requested?.name,
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Tapping outside closes; screen readers use "Cancelar". */}
      <Pressable style={st.scrim} onPress={onClose} accessible={false} importantForAccessibility="no" />
      <SafeAreaView edges={['bottom']} style={st.sheetArea}>
        <View style={st.sheet}>
          {requested && (
            <Text style={[type.subtitleStrong, st.heading]} accessibilityRole="header">
              Enviar: {requested.name}
            </Text>
          )}
          <Row icon="camera" title="Tirar foto" subtitle="Use a câmera do celular" onPress={() => choose('Câmera')} />
          <Divider />
          <Row
            icon="image"
            title="Biblioteca de fotos"
            subtitle="Fotos e capturas de tela"
            onPress={() => choose('Fotos')}
          />
          <Divider />
          <Row
            icon="folder"
            title="Escolher em Arquivos"
            subtitle="PDF, JPG ou PNG · até 20 MB"
            onPress={() => choose('Arquivos')}
          />
        </View>
        <Button label="Cancelar" kind="soft" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheetArea: { position: 'absolute', left: 8, right: 8, bottom: 8, gap: 8 },
  sheet: { backgroundColor: colors.surface, borderRadius: 28, paddingHorizontal: 4, paddingVertical: 4 },
  heading: { paddingHorizontal: 12, paddingTop: 12 },
});
