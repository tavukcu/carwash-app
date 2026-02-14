import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ProgramGrid from '../components/ProgramGrid';
import { Program, getPrograms, createTicket, CreateTicketResponse } from '../lib/api';
import { playClick, playSuccess, playError } from '../lib/sounds';

type Step = 'program' | 'payment' | 'ticket';

export default function CashierScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('program');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [ticketData, setTicketData] = useState<CreateTicketResponse | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getPrograms()
      .then(setPrograms)
      .catch(() => Alert.alert('Hata', 'Programlar yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  const handleProgramSelect = (p: Program) => {
    setSelectedProgram(p);
    setStep('payment');
  };

  const handlePayment = async (method: 'cash' | 'card') => {
    if (!selectedProgram) return;
    playClick();
    setCreating(true);
    try {
      const data = await createTicket(selectedProgram.id, method);
      setTicketData(data);
      setStep('ticket');
      playSuccess();
    } catch (e: any) {
      playError();
      Alert.alert('Hata', e.message || 'Bilet oluşturulamadı');
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    playClick();
    setStep('program');
    setSelectedProgram(null);
    setTicketData(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Steps indicator */}
      <View style={styles.steps}>
        {['Program', 'Ödeme', 'Bilet'].map((label, i) => {
          const stepIndex = ['program', 'payment', 'ticket'].indexOf(step);
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

      {step === 'program' && (
        <View>
          <Text style={styles.heading}>Program Seçin</Text>
          <ProgramGrid
            programs={programs}
            selectedId={null}
            onSelect={handleProgramSelect}
          />
        </View>
      )}

      {step === 'payment' && selectedProgram && (
        <View>
          <Text style={styles.heading}>Ödeme Yöntemi</Text>
          <View style={styles.selectedCard}>
            <Text style={styles.selectedIcon}>{selectedProgram.icon}</Text>
            <View>
              <Text style={styles.selectedName}>{selectedProgram.name}</Text>
              <Text style={styles.selectedPrice}>{selectedProgram.price} TL</Text>
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

          {creating && <ActivityIndicator style={{ marginTop: 16 }} color="#2563eb" />}

          <TouchableOpacity style={styles.backBtn} onPress={() => { playClick(); setStep('program'); }}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'ticket' && ticketData && (
        <View style={styles.ticketContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>Bilet Oluşturuldu!</Text>

          <View style={styles.qrCard}>
            <QRCode value={ticketData.ticket.qr_code} size={200} />
          </View>

          <Text style={styles.ticketId}>Bilet #{ticketData.ticket.id}</Text>
          <Text style={styles.ticketInfo}>
            {ticketData.program.icon} {ticketData.program.name} - {ticketData.program.price} TL
          </Text>
          <Text style={styles.ticketHint}>QR kodu kiosk ekraninda okutun</Text>

          <TouchableOpacity style={styles.newTicketBtn} onPress={reset}>
            <Text style={styles.newTicketText}>Yeni Bilet</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center',
  },
  stepActive: { backgroundColor: '#2563eb' },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 12, color: '#94a3b8', marginLeft: 4 },
  stepLabelActive: { color: '#2563eb', fontWeight: '600' },
  stepLine: { width: 24, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#2563eb' },
  heading: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  selectedCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 2, borderColor: '#2563eb',
  },
  selectedIcon: { fontSize: 36, marginRight: 16 },
  selectedName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  selectedPrice: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  paymentButtons: { flexDirection: 'row', gap: 12 },
  payBtn: {
    flex: 1, borderRadius: 16, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cashBtn: { backgroundColor: '#16a34a' },
  cardBtn: { backgroundColor: '#2563eb' },
  payIcon: { fontSize: 36, marginBottom: 8 },
  payLabel: { fontSize: 18, fontWeight: '700', color: '#fff' },
  backBtn: { marginTop: 20, alignSelf: 'center' },
  backText: { fontSize: 16, color: '#64748b' },
  ticketContainer: { alignItems: 'center', paddingTop: 8 },
  successIcon: { fontSize: 48, marginBottom: 8 },
  successText: { fontSize: 22, fontWeight: '700', color: '#16a34a', marginBottom: 20 },
  qrCard: {
    backgroundColor: '#fff', padding: 24, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, marginBottom: 16,
  },
  ticketId: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  ticketInfo: { fontSize: 15, color: '#64748b', marginBottom: 4 },
  ticketHint: { fontSize: 13, color: '#94a3b8', marginBottom: 24 },
  newTicketBtn: {
    backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 12,
  },
  newTicketText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
