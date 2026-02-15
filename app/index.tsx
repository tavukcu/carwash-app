import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { playClick } from '../lib/sounds';
import { K } from '../lib/theme';

export default function HomeScreen() {
  const router = useRouter();

  const buttons = [
    { label: 'Kasa', icon: '💰', desc: 'Bilet olustur', route: '/cashier' as const },
    { label: 'Kiosk', icon: '📱', desc: 'QR oku ve yika', route: '/kiosk' as const },
    { label: 'Yonetim', icon: '⚙️', desc: 'Admin paneli', route: '/admin' as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <Text style={styles.logo}>🚗💦</Text>
        <Text style={styles.title}>Self-Servis{'\n'}Arac Yikama</Text>
        <Text style={styles.subtitle}>Zamanli Self-Servis Yikama Sistemi</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.buttons}>
          {buttons.map((b) => (
            <TouchableOpacity
              key={b.label}
              style={styles.btn}
              onPress={() => { playClick(); router.push(b.route); }}
              activeOpacity={0.7}
            >
              <Text style={styles.btnIcon}>{b.icon}</Text>
              <View style={styles.btnTextWrap}>
                <Text style={styles.btnLabel}>{b.label}</Text>
                <Text style={styles.btnDesc}>{b.desc}</Text>
              </View>
              <Text style={styles.btnArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>5 Istasyon • Nakit / Kart • Aninda Yikama</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: K.bg,
  },
  heroSection: {
    backgroundColor: K.bgHeader,
    paddingTop: 60,
    paddingBottom: 36,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    fontSize: K.iconSizeLg,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: K.fontMd,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  buttons: {
    width: '100%',
    gap: 18,
    marginBottom: 48,
  },
  btn: {
    backgroundColor: K.bgCard,
    borderRadius: K.radius,
    padding: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: K.border,
    minHeight: K.btnHeight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  btnIcon: {
    fontSize: K.iconSize,
    marginRight: 24,
  },
  btnTextWrap: {
    flex: 1,
  },
  btnLabel: {
    fontSize: K.fontLg,
    fontWeight: '800',
    color: K.text,
  },
  btnDesc: {
    fontSize: K.fontSm,
    color: K.textSecondary,
    marginTop: 2,
  },
  btnArrow: {
    fontSize: 38,
    color: K.accent,
    fontWeight: '300',
  },
  footer: {
    fontSize: K.fontSm,
    color: K.textMuted,
    textAlign: 'center',
  },
});
