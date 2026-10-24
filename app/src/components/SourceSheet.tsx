import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import type { Doc } from '../api';
import { checkFile, PickedFile } from '../format';

async function pick(): Promise<PickedFile | null> {
  const r = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    copyToCacheDirectory: true,
  });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { uri: a.uri, name: a.name, mimeType: a.mimeType, size: a.size };
}

/** Adding a document goes straight to the file picker (PDF, JPG or PNG); `requested` ties it to a pending exam. */
export function SourceSheet({
  visible,
  onClose,
  requested,
}: {
  visible: boolean;
  onClose: () => void;
  requested?: Doc;
}) {
  useEffect(() => {
    if (!visible) return;
    onClose();
    (async () => {
      const file = await pick();
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
          source: 'Arquivos',
          requestedId: requested?.id,
          requestedName: requested?.name,
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  return null;
}
