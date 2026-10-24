import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadow, type } from '../theme';

const ICONS = {
  alert: require('../../assets/figma/alert.svg'),
  'arrow-right': require('../../assets/figma/arrow-right.svg'),
  bell: require('../../assets/figma/bell.svg'),
  camera: require('../../assets/figma/camera.svg'),
  check: require('../../assets/figma/check.svg'),
  'chevron-left': require('../../assets/figma/chevron-left.svg'),
  'chevron-right': require('../../assets/figma/chevron-right.svg'),
  clock: require('../../assets/figma/clock.svg'),
  file: require('../../assets/figma/file.svg'),
  'file-accent': require('../../assets/figma/file-accent.svg'),
  'file-accent-small': require('../../assets/figma/file-accent-small.svg'),
  'file-large': require('../../assets/figma/file-large.svg'),
  folder: require('../../assets/figma/folder.svg'),
  image: require('../../assets/figma/image.svg'),
  info: require('../../assets/figma/info.svg'),
  'info-strong': require('../../assets/figma/info-strong.svg'),
  lock: require('../../assets/figma/lock.svg'),
  'map-pin': require('../../assets/figma/map-pin.svg'),
  pulse: require('../../assets/figma/pulse.svg'),
  'pulse-accent': require('../../assets/figma/pulse-accent.svg'),
  refresh: require('../../assets/figma/refresh.svg'),
  shield: require('../../assets/figma/shield.svg'),
  upload: require('../../assets/figma/upload.svg'),
  users: require('../../assets/figma/users.svg'),
  'tab-home': require('../../assets/figma/tab-home.svg'),
  'tab-home-active': require('../../assets/figma/tab-home-active.svg'),
  'tab-documents': require('../../assets/figma/tab-documents.svg'),
  'tab-documents-active': require('../../assets/figma/tab-documents-active.svg'),
  'tab-history': require('../../assets/figma/tab-history.svg'),
  'tab-history-active': require('../../assets/figma/tab-history-active.svg'),
  'tab-profile': require('../../assets/figma/tab-profile.svg'),
  'tab-profile-active': require('../../assets/figma/tab-profile-active.svg'),
};

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <Image source={ICONS[name]} style={{ width: size, height: size }} accessible={false} />;
}

/** Scrollable page with the large title layout used by the tab screens. */
export function Screen({
  title,
  eyebrow,
  right,
  nav,
  children,
  footer,
  refreshing,
  onRefresh,
  tabs = true,
}: {
  title?: string;
  eyebrow?: string;
  right?: ReactNode;
  nav?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  tabs?: boolean;
}) {
  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      {nav}
      <ScrollView
        contentContainerStyle={[s.content, tabs && { paddingBottom: 112 }]}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      >
        {title && (
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              {eyebrow && <Text style={[type.subtitle, { color: colors.textSecondary }]}>{eyebrow}</Text>}
              <Text style={type.largeTitle} accessibilityRole="header">
                {title}
              </Text>
            </View>
            {right}
          </View>
        )}
        {children}
      </ScrollView>
      {footer && <View style={s.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

export function Loading() {
  return <ActivityIndicator style={{ marginTop: 48 }} color={colors.accentInk} accessibilityLabel="Carregando" />;
}

/** "Barra de navegação · Voltar" and "· Modal". */
export function NavBar({ title, back, cancel }: { title: string; back?: string; cancel?: boolean }) {
  return (
    <View style={s.nav}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={cancel ? 'Cancelar' : `Voltar para ${back}`}
        hitSlop={8}
        style={s.navLeft}
      >
        {!cancel && <Icon name="chevron-left" size={22} />}
        <Text style={[type.body, { color: colors.accentInk }]}>{cancel ? 'Cancelar' : back}</Text>
      </Pressable>
      <Text style={[type.bodyStrong, s.navTitle]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

export function Card({
  children,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  return (
    <View style={[s.card, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={[type.note, s.section]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Divider() {
  return <View style={s.divider} />;
}

type ChipTone = 'neutral' | 'accent' | 'strong';

export function Chip({ label, tone = 'accent' }: { label: string; tone?: ChipTone }) {
  return (
    <View style={[s.chip, chipBg[tone]]}>
      <Text style={[type.caption, { color: chipInk[tone] }]}>{label}</Text>
    </View>
  );
}

const chipBg = {
  neutral: { backgroundColor: colors.chip },
  accent: { backgroundColor: colors.accentSoft },
  strong: { backgroundColor: colors.surface },
};
const chipInk = { neutral: colors.textMuted, accent: colors.accentInk, strong: colors.accentInkStrong };

/** "Linha de lista": optional icon block, two lines of text, optional chip and chevron. */
export function Row({
  icon,
  title,
  subtitle,
  chip,
  chevron,
  onPress,
  accessibilityHint,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  chip?: { label: string; tone?: ChipTone };
  chevron?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
}) {
  const label = [title, subtitle, chip?.label].filter(Boolean).join('. ');
  const body = (
    <>
      {icon && (
        <View style={s.iconBlock}>
          <Icon name={icon} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.subtitleStrong}>{title}</Text>
        {subtitle && <Text style={[type.note, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {chip && <Chip {...chip} />}
      {chevron && <Icon name="chevron-right" size={18} />}
    </>
  );
  if (!onPress)
    return (
      <View style={s.row} accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && s.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      {body}
    </Pressable>
  );
}

type ButtonKind = 'primary' | 'dark' | 'soft' | 'danger';

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={({ pressed }) => [s.button, buttonBg[kind], (disabled || pressed) && s.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={buttonInk[kind]} />
      ) : (
        <Text style={[type.bodyStrong, { color: buttonInk[kind] }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const buttonBg = {
  primary: { backgroundColor: colors.accentAction },
  dark: { backgroundColor: colors.black },
  soft: { backgroundColor: colors.accentSoft },
  danger: { backgroundColor: colors.dangerSoft },
};
const buttonInk = {
  primary: colors.textPrimary,
  dark: colors.surface,
  soft: colors.textPrimary,
  danger: colors.dangerInk,
};

type NoticeTone = 'soft' | 'success' | 'warning';

/** "Aviso": icon in a white circle, colored title and body. */
export function Notice({ title, text, tone = 'soft' }: { title: string; text: string; tone?: NoticeTone }) {
  const t = notice[tone];
  return (
    <View style={[s.notice, { backgroundColor: t.bg }]} accessibilityRole="alert">
      <View style={s.noticeIcon}>
        <Icon name={t.icon} size={18} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[type.subtitleStrong, { color: t.ink }]}>{title}</Text>
        <Text style={[type.note, { color: colors.textMuted }]}>{text}</Text>
      </View>
    </View>
  );
}

const notice = {
  soft: { bg: colors.accentSoft, ink: colors.accentInk, icon: 'info' as IconName },
  success: { bg: colors.surface, ink: colors.accentInk, icon: 'check' as IconName },
  warning: { bg: colors.surface, ink: colors.accentInkStrong, icon: 'info-strong' as IconName },
};

export type EventTone = 'strong' | 'light' | 'muted';

/** "Evento": colored dot, title, detail and a short date. */
export function Event({
  title,
  detail,
  date,
  tone = 'strong',
  onPress,
}: {
  title: string;
  detail: string;
  date: string;
  tone?: EventTone;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={s.event}
      accessibilityRole={onPress ? 'button' : undefined}
      accessible
      accessibilityLabel={`${title}. ${detail}. ${date}`}
    >
      <View style={[s.dot, { backgroundColor: dotColor[tone] }]} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={type.subtitleStrong}>{title}</Text>
        <Text style={[type.note, { color: colors.textSecondary }]}>{detail}</Text>
      </View>
      <Text style={[type.note, { color: colors.textSecondary }]}>{date}</Text>
    </Wrapper>
  );
}

const dotColor = { strong: colors.accentMedium, light: colors.accentAction, muted: colors.chevron };

/** "Linha pastel": shortcut row with circled icon and arrow. */
export function Shortcut({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.shortcut, pressed && s.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={s.circle}>
        <Icon name={icon} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.bodyStrong}>{title}</Text>
        <Text style={[type.note, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      <View style={s.circle}>
        <Icon name="arrow-right" size={18} />
      </View>
    </Pressable>
  );
}

/** "Estado vazio": used for empty lists and load errors. */
export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName;
  title: string;
  text: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <Card style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={32} />
      </View>
      <Text style={[type.title, s.center]}>{title}</Text>
      <Text style={[type.subtitle, s.center, { color: colors.textSecondary }]}>{text}</Text>
      {action && (
        <View style={{ alignSelf: 'stretch' }}>
          <Button label={action.label} onPress={action.onPress} />
        </View>
      )}
    </Card>
  );
}

export function TextField({ label, error, ...props }: { label: string; error?: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[type.note, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error || undefined}
        placeholderTextColor={colors.textSecondary}
        style={[type.body, s.input, !!error && { borderColor: colors.dangerInk }]}
        {...props}
      />
      {!!error && (
        <Text
          style={[type.note, { color: colors.dangerInk }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 10, paddingBottom: 4 },
  footer: { paddingHorizontal: 16, paddingBottom: 8 },
  nav: { height: 44, justifyContent: 'center' },
  navLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
  },
  navTitle: { textAlign: 'center', marginHorizontal: 96 },
  card: { backgroundColor: colors.surface, borderRadius: 24, ...shadow },
  section: { color: colors.textSecondary, paddingLeft: 20 },
  divider: { height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.divider, marginLeft: 68 },
  chip: { borderRadius: 13, paddingHorizontal: 10, paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  iconBlock: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  button: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  notice: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 20, ...shadow },
  noticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  event: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 5 },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
    ...shadow,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 28 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
});
