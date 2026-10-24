import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type } from '../theme';
import { Icon, IconName } from './ui';

const TABS: Record<string, { label: string; icon: string }> = {
  home: { label: 'Início', icon: 'tab-home' },
  documents: { label: 'Documentos', icon: 'tab-documents' },
  history: { label: 'Histórico', icon: 'tab-history' },
  profile: { label: 'Perfil', icon: 'tab-profile' },
};

type Props = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (routeKey: string) => void;
};

/** "Barra de abas": floating pill bar with the active tab highlighted. */
export function TabBar({ state, navigateToTab }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.bar, { bottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigateToTab(route.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={[st.tab, active && st.active]}
          >
            <Icon name={`${tab.icon}${active ? '-active' : ''}` as IconName} size={22} />
            <Text style={[type.tab, { color: active ? colors.textPrimary : colors.textSecondary }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6.75,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  tab: { width: 76, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', gap: 2 },
  active: { backgroundColor: colors.accentAction },
});
