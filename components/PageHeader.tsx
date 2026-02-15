import { View, Text, StyleSheet, Platform } from 'react-native';
import { K } from '../lib/theme';

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
    backgroundColor: K.bgHeader,
    paddingTop: Platform.OS === 'web' ? 20 : 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: K.accentBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: K.iconSize,
  },
  title: {
    fontSize: K.fontXl,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: K.fontSm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
