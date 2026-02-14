import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Program } from '../lib/api';
import { playClick } from '../lib/sounds';

interface Props {
  programs: Program[];
  selectedId: number | null;
  onSelect: (p: Program) => void;
}

export default function ProgramGrid({ programs, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {programs.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={[styles.card, selectedId === p.id && styles.selected]}
          onPress={() => { playClick(); onSelect(p); }}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>{p.icon}</Text>
          <Text style={[styles.name, selectedId === p.id && styles.selectedText]}>{p.name}</Text>
          <Text style={[styles.price, selectedId === p.id && styles.selectedText]}>{p.price} TL</Text>
          <Text style={[styles.duration, selectedId === p.id && styles.selectedDuration]}>
            {Math.floor(p.duration / 60)} dk
          </Text>
        </TouchableOpacity>
      ))}
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
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedText: {
    color: '#fff',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#64748b',
  },
  selectedDuration: {
    color: 'rgba(255,255,255,0.8)',
  },
});
