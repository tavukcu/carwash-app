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
      <View style={styles.content}>
        <Text style={styles.logo}>🚗💦</Text>
        <Text style={styles.title}>Self-Servis{'\n'}Arac Yikama</Text>
        <Text style={styles.subtitle}>Zamanli Self-Servis Yikama Sistemi</Text>

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    paddingTop: 60,
  },
  logo: {
    fontSize: K.iconSizeLg,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: K.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: K.fontMd,
    color: K.accent,
    marginBottom: 48,
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
    gap: 18,
    marginBottom: 48,
  },
  btn: {
    backgroundColor: K.bgCard,
    borderRadius: K.radius,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: K.border,
    minHeight: K.btnHeight,
  },
  btnIcon: {
    fontSize: K.iconSize,
    marginRight: 20,
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
    fontSize: 32,
    color: K.accent,
    fontWeight: '300',
  },
  footer: {
    fontSize: K.fontSm,
    color: K.textMuted,
    textAlign: 'center',
  },
});
