import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { playClick } from '../lib/sounds';

export default function HomeScreen() {
  const router = useRouter();

  const buttons = [
    { label: 'Kasa', icon: '💰', desc: 'Bilet oluştur', route: '/cashier' as const },
    { label: 'Kiosk', icon: '📱', desc: 'QR oku ve yıka', route: '/kiosk' as const },
    { label: 'Yonetim', icon: '⚙️', desc: 'Admin paneli', route: '/admin' as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.logo}>🚗💦</Text>
          <Text style={styles.title}>Self-Servis{'\n'}Arac Yikama</Text>
          <Text style={styles.subtitle}>QR Kodlu Dijital Odeme Sistemi</Text>

          <View style={styles.buttons}>
            {buttons.map((b) => (
              <TouchableOpacity
                key={b.label}
                style={styles.btn}
                onPress={() => { playClick(); router.push(b.route); }}
                activeOpacity={0.8}
              >
                <Text style={styles.btnIcon}>{b.icon}</Text>
                <Text style={styles.btnLabel}>{b.label}</Text>
                <Text style={styles.btnDesc}>{b.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.footer}>5 Istasyon • Nakit / Kart • Aninda Yikama</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#1e3a5f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  logo: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 40,
  },
  buttons: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  btn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  btnLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  btnDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  footer: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
