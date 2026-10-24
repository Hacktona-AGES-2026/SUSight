import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { api, Relation } from '../../api';
import { Button, NavBar, RadioOption, Screen, SectionTitle, TextField } from '../../components/ui';
import { colors, type } from '../../theme';

const RELATIONS: Relation[] = ['Filho ou filha', 'Cônjuge', 'Pai ou mãe', 'Irmão ou irmã', 'Outro'];

/** "6.3 Novo contato" (86-2027). */
export default function NewContact() {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<Relation>('Filho ou filha');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; save?: string }>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const digits = phone.replace(/\D/g, '');
    const next = {
      name: name.trim() ? undefined : 'Digite o nome do contato.',
      phone: digits.length === 10 || digits.length === 11 ? undefined : 'Digite o telefone com DDD.',
    };
    setErrors(next);
    if (next.name || next.phone) return;
    setSaving(true);
    try {
      await api.addContact({ name: name.trim(), relation, phone: digits });
      router.back();
    } catch {
      setErrors({ save: 'Não foi possível salvar o contato. Tente de novo.' });
      setSaving(false);
    }
  };

  return (
    <Screen
      nav={<NavBar title="Novo contato" cancel />}
      tabs={false}
      footer={<Button label="Salvar contato" onPress={save} loading={saving} />}
    >
      <TextField
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Nome completo"
        autoCapitalize="words"
        error={errors.name}
      />
      <SectionTitle>Parentesco</SectionTitle>
      {RELATIONS.map((r) => (
        <RadioOption key={r} label={r} selected={r === relation} onPress={() => setRelation(r)} />
      ))}
      <TextField
        label="Telefone"
        value={phone}
        onChangeText={setPhone}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        error={errors.phone}
      />
      <Text
        style={[type.note, { color: errors.save ? colors.dangerInk : colors.textSecondary }]}
        accessibilityRole={errors.save ? 'alert' : undefined}
      >
        {errors.save ?? 'Vamos enviar um SMS avisando que você autorizou o acompanhamento.'}
      </Text>
    </Screen>
  );
}
