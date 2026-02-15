import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import PackageGrid from '../components/PackageGrid';
import PageHeader from '../components/PageHeader';
import { TimePackage, getPackages, createTicket, CreateTicketResponse } from '../lib/api';
import { playClick, playSuccess, playError } from '../lib/sounds';
import { K } from '../lib/theme';

type Step = 'package' | 'payment' | 'ticket';

export default function CashierScreen() {
  const [packages, setPackages] = useState<TimePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('package');
  const [selectedPackage, setSelectedPackage] = useState<TimePackage | null>(null);
  const [ticketData, setTicketData] = useState<CreateTicketResponse | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getPackages()
      .then(setPackages)
      .catch(() => Alert.alert('Hata', 'Paketler yuklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  const handlePackageSelect = (p: TimePackage) => {
    setSelectedPackage(p);
    setStep('payment');
  };

  const handlePayment = async (method: 'cash' | 'card') => {
    if (!selectedPackage) return;
    playClick();
    setCreating(true);
    try {
      const data = await createTicket(selectedPackage.id, method);
      setTicketData(data);
      setStep('ticket');
      playSuccess();
    } catch (e: any) {
      playError();
      Alert.alert('Hata', e.message || 'Bilet olusturulamadi');
    } finally {
      setCreating(false);
    }
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    }
  };

  const reset = () => {
    playClick();
    setStep('package');
    setSelectedPackage(null);
    setTicketData(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={K.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: K.bg }}>
    <PageHeader icon="💰" title="Kasa" subtitle="Bilet olustur" />
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Steps indicator */}
      <View style={styles.steps}>
        {['Paket', 'Odeme', 'Bilet'].map((label, i) => {
          const stepIndex = ['package', 'payment', 'ticket'].indexOf(step);
          return (
            <View key={label} style={styles.stepRow}>
              <View style={[styles.stepCircle, i <= stepIndex && styles.stepActive]}>
                <Text style={[styles.stepNum, i <= stepIndex && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, i <= stepIndex && styles.stepLabelActive]}>{label}</Text>
              {i < 2 && <View style={[styles.stepLine, i < stepIndex && styles.stepLineActive]} />}
            </View>
          );
        })}
      </View>

      {step === 'package' && (
        <View>
          <Text style={styles.heading}>Sure Paketi Secin</Text>
          <PackageGrid
            packages={packages}
            selectedId={null}
            onSelect={handlePackageSelect}
          />
        </View>
      )}

      {step === 'payment' && selectedPackage && (
        <View>
          <Text style={styles.heading}>Odeme Yontemi</Text>
          <View style={styles.selectedCard}>
            <Text style={styles.selectedIcon}>{selectedPackage.icon}</Text>
            <View>
              <Text style={styles.selectedName}>{selectedPackage.name}</Text>
              <Text style={styles.selectedPrice}>{selectedPackage.price} TL</Text>
            </View>
          </View>

          <View style={styles.paymentButtons}>
            <TouchableOpacity
              style={[styles.payBtn, styles.cashBtn]}
              onPress={() => handlePayment('cash')}
              disabled={creating}
            >
              <Text style={styles.payIcon}>💵</Text>
              <Text style={styles.payLabel}>Nakit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.payBtn, styles.cardBtn]}
              onPress={() => handlePayment('card')}
              disabled={creating}
            >
              <Text style={styles.payIcon}>💳</Text>
              <Text style={styles.payLabel}>Kart</Text>
            </TouchableOpacity>
          </View>

          {creating && <ActivityIndicator style={{ marginTop: 20 }} color={K.accent} />}

          <TouchableOpacity style={styles.backBtn} onPress={() => { playClick(); setStep('package'); }}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'ticket' && ticketData && (
        <View style={styles.ticketContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>Bilet Olusturuldu!</Text>

          <View style={styles.qrCard}>
            <QRCode value={ticketData.ticket.qr_code} size={220} backgroundColor="#fff" color="#000" />
          </View>

          <Text style={styles.ticketId}>Bilet #{ticketData.ticket.id}</Text>
          <Text style={styles.ticketInfo}>
            {ticketData.package.icon} {ticketData.package.name} - {ticketData.package.price} TL
          </Text>
          <Text style={styles.ticketHint}>QR kodu kiosk ekraninda okutun</Text>

          <View style={styles.ticketActions}>
            {Platform.OS === 'web' && (
              <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
                <Text style={styles.printIcon}>🖨️</Text>
                <Text style={styles.printText}>Fis Yazdir</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.newTicketBtn} onPress={reset}>
              <Text style={styles.newTicketText}>Yeni Bilet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>

    {/* Hidden printable receipt - only visible when printing */}
    {step === 'ticket' && ticketData && Platform.OS === 'web' && (
      <PrintableReceipt ticket={ticketData} />
    )}
    </View>
  );
}

function PrintableReceipt({ ticket }: { ticket: CreateTicketResponse }) {
  const now = new Date().toLocaleString('tr-TR');
  return (
    // @ts-ignore
    <div className="print-only receipt" style={{ display: 'none' }}>
      {/* @ts-ignore */}
      <div className="receipt-center receipt-bold receipt-lg">SELF-SERVIS ARAC YIKAMA</div>
      {/* @ts-ignore */}
      <div className="receipt-center">Zamanli Yikama Sistemi</div>
      {/* @ts-ignore */}
      <div className="receipt-line" />
      {/* @ts-ignore */}
      <div>Bilet No: #{ticket.ticket.id}</div>
      {/* @ts-ignore */}
      <div>Paket: {ticket.package.name}</div>
      {/* @ts-ignore */}
      <div>Sure: {Math.floor(ticket.package.duration / 60)} dk</div>
      {/* @ts-ignore */}
      <div>Tutar: {ticket.package.price} TL</div>
      {/* @ts-ignore */}
      <div>Odeme: {ticket.ticket.payment_method === 'cash' ? 'Nakit' : 'Kart'}</div>
      {/* @ts-ignore */}
      <div>Tarih: {now}</div>
      {/* @ts-ignore */}
      <div className="receipt-line" />
      {/* @ts-ignore */}
      <div className="receipt-qr">
        {/* @ts-ignore */}
        <img
          src={ticket.qrDataUrl}
          alt="QR"
          style={{ width: '50mm', height: '50mm' }}
        />
      </div>
      {/* @ts-ignore */}
      <div className="receipt-center">QR kodu kiosk ekraninda okutunuz</div>
      {/* @ts-ignore */}
      <div className="receipt-line" />
      {/* @ts-ignore */}
      <div className="receipt-center">Iyi yikamalar!</div>
    </div>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: K.bg },
  content: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: K.bg },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: K.bgCard, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: K.border,
  },
  stepActive: { backgroundColor: K.accent, borderColor: K.accent },
  stepNum: { fontSize: K.fontSm, fontWeight: '800', color: K.textMuted },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: K.fontSm, color: K.textMuted, marginLeft: 6, fontWeight: '600' },
  stepLabelActive: { color: K.accent },
  stepLine: { width: 28, height: 3, backgroundColor: K.bgCard, marginHorizontal: 6, borderRadius: 2 },
  stepLineActive: { backgroundColor: K.accent },
  heading: { fontSize: K.fontXl, fontWeight: '800', color: K.text, marginBottom: 20 },
  selectedCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: K.bgCard,
    borderRadius: K.radius, padding: 24, marginBottom: 28,
    borderWidth: 2, borderColor: K.accent,
  },
  selectedIcon: { fontSize: K.iconSize, marginRight: 20 },
  selectedName: { fontSize: K.fontMd, fontWeight: '700', color: K.text },
  selectedPrice: { fontSize: K.fontLg, fontWeight: '800', color: K.accent },
  paymentButtons: { flexDirection: 'row', gap: 16 },
  payBtn: {
    flex: 1, borderRadius: K.radius, padding: 32, alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  cashBtn: { backgroundColor: '#16a34a' },
  cardBtn: { backgroundColor: '#2563eb' },
  payIcon: { fontSize: K.iconSize, marginBottom: 10 },
  payLabel: { fontSize: K.fontLg, fontWeight: '800', color: '#fff' },
  backBtn: { marginTop: 24, alignSelf: 'center' },
  backText: { fontSize: K.fontMd, color: K.textSecondary, fontWeight: '600' },
  ticketContainer: { alignItems: 'center', paddingTop: 12 },
  successIcon: { fontSize: 64, marginBottom: 10 },
  successText: { fontSize: K.fontXl, fontWeight: '800', color: '#16a34a', marginBottom: 24 },
  qrCard: {
    backgroundColor: '#fff', padding: 28, borderRadius: K.radius,
    marginBottom: 20,
  },
  ticketId: { fontSize: K.fontLg, fontWeight: '800', color: K.text, marginBottom: 6 },
  ticketInfo: { fontSize: K.fontMd, color: K.textSecondary, marginBottom: 6 },
  ticketHint: { fontSize: K.fontSm, color: K.textMuted, marginBottom: 28 },
  ticketActions: { gap: 14, width: '100%' },
  printBtn: {
    backgroundColor: K.bgCard, paddingVertical: 22, paddingHorizontal: 36,
    borderRadius: K.radiusSm, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 14, borderWidth: 2, borderColor: K.accentBorder,
    minHeight: 76,
  },
  printIcon: { fontSize: 34 },
  printText: { fontSize: K.fontLg, fontWeight: '700', color: K.accent },
  newTicketBtn: {
    backgroundColor: K.accent, paddingHorizontal: 36, paddingVertical: 22,
    borderRadius: K.radiusSm, alignItems: 'center', minHeight: 76,
    justifyContent: 'center',
  },
  newTicketText: { fontSize: K.fontMd, fontWeight: '800', color: '#ffffff' },
});
