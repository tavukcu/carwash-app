import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1e3a5f',
    paddingTop: Platform.OS === 'web' ? 16 : 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
