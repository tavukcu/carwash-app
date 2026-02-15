import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Station } from '../lib/api';
import { playClick } from '../lib/sounds';
import { K } from '../lib/theme';

interface Props {
  stations: Station[];
  selectedId: number | null;
  onSelect: (s: Station) => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  idle: { bg: K.greenBg, border: K.greenBorder, text: K.green, label: 'Bos' },
  active: { bg: K.yellowBg, border: K.yellowBorder, text: K.yellow, label: 'Aktif' },
  maintenance: { bg: K.redBg, border: K.redBorder, text: K.red, label: 'Bakimda' },
};

export default function StationGrid({ stations, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {stations.map((s) => {
        const status = STATUS_COLORS[s.status] || STATUS_COLORS.idle;
        const disabled = s.status !== 'idle';
        const selected = selectedId === s.id;
        return (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.card,
              disabled && styles.disabled,
              selected && styles.selected,
            ]}
            onPress={() => { if (!disabled) { playClick(); onSelect(s); } }}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <Text style={styles.icon}>🚿</Text>
            <Text style={[styles.name, selected && styles.selectedText]}>{s.name}</Text>
            <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
              <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: '30%',
    backgroundColor: K.bgCard,
    borderRadius: K.radius,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: K.border,
    minHeight: K.btnHeight,
  },
  disabled: {
    opacity: 0.4,
  },
  selected: {
    borderColor: K.accent,
    backgroundColor: K.accentGlow,
  },
  selectedText: {
    color: K.accent,
  },
  icon: {
    fontSize: K.iconSize,
    marginBottom: 8,
  },
  name: {
    fontSize: K.fontMd,
    fontWeight: '700',
    color: K.text,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: K.fontXs,
    fontWeight: '700',
  },
});
