import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Station } from '../lib/api';
import { playClick } from '../lib/sounds';

interface Props {
  stations: Station[];
  selectedId: number | null;
  onSelect: (s: Station) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  idle: { bg: '#dcfce7', text: '#16a34a', label: 'Boş' },
  active: { bg: '#fef3c7', text: '#f59e0b', label: 'Aktif' },
  maintenance: { bg: '#fee2e2', text: '#dc2626', label: 'Bakımda' },
};

export default function StationGrid({ stations, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {stations.map((s) => {
        const status = STATUS_COLORS[s.status] || STATUS_COLORS.idle;
        const disabled = s.status !== 'idle';
        return (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.card,
              disabled && styles.disabled,
              selectedId === s.id && styles.selected,
            ]}
            onPress={() => { if (!disabled) { playClick(); onSelect(s); } }}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <Text style={styles.icon}>🚿</Text>
            <Text style={[styles.name, selectedId === s.id && styles.selectedText]}>{s.name}</Text>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
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
    gap: 12,
  },
  card: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  selected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  selectedText: {
    color: '#2563eb',
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
