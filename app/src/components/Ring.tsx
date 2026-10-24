import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

const SIZE = 138;
const STROKE = 11.73;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/** "Anel de progresso": how far ahead in the queue the patient is (full ring = first). */
export function Ring({ position, total }: { position: number; total: number }) {
  const ahead = total > 0 ? (total - position) / total : 0;
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.surface} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.accentInk}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${C * ahead} ${C}`}
        />
      </Svg>
      <Text style={{ fontSize: 40, lineHeight: 41, fontWeight: '700', color: colors.textPrimary }}>{position}ª</Text>
    </View>
  );
}
