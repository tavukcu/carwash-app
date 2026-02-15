import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimePackage } from '../lib/api';
import { playClick } from '../lib/sounds';
import { K } from '../lib/theme';

interface Props {
  packages: TimePackage[];
  selectedId: number | null;
  onSelect: (p: TimePackage) => void;
}

export default function PackageGrid({ packages, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {packages.map((p) => {
        const selected = selectedId === p.id;
        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.card, selected && styles.selected]}
            onPress={() => { playClick(); onSelect(p); }}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{p.icon}</Text>
            <Text style={[styles.name, selected && styles.selectedText]}>{p.name}</Text>
            <Text style={[styles.price, selected && styles.selectedText]}>{p.price} TL</Text>
            <Text style={[styles.duration, selected && styles.selectedDuration]}>
              {Math.floor(p.duration / 60)} dk
            </Text>
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
    width: '47%',
    backgroundColor: K.bgCard,
    borderRadius: K.radius,
    padding: 26,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: K.border,
    minHeight: K.btnHeight,
  },
  selected: {
    borderColor: K.accent,
    backgroundColor: K.accentGlow,
  },
  icon: {
    fontSize: K.iconSize,
    marginBottom: 10,
  },
  name: {
    fontSize: K.fontMd,
    fontWeight: '700',
    color: K.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  selectedText: {
    color: K.accent,
  },
  price: {
    fontSize: 36,
    fontWeight: '900',
    color: K.accent,
    marginBottom: 6,
  },
  duration: {
    fontSize: K.fontSm,
    color: K.textSecondary,
  },
  selectedDuration: {
    color: K.accent,
  },
});
