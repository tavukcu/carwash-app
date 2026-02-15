import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import StationGrid from '../components/StationGrid';
import WebQRScanner from '../components/WebQRScanner';
import WashModeSelector from '../components/WashModeSelector';
import PageHeader from '../components/PageHeader';
import { Station, getStations, verifyTicket, startWash, completeWash, logModeSwitch, VerifyTicketResponse } from '../lib/api';
import { playClick, playBeep, playSuccess, playError, playComplete } from '../lib/sounds';
import { K } from '../lib/theme';

type Screen = 'stations' | 'scan' | 'confirm' | 'washing' | 'done';

export default function KioskScreen() {
  const [screen, setScreen] = useState<Screen>('stations');
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [ticketInfo, setTicketInfo] = useState<VerifyTicketResponse | null>(null);
  const [scannedQR, setScannedQR] = useState('');
  const [manualQR, setManualQR] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLock = useRef(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const data = await getStations();
      setStations(data);
    } catch {
      Alert.alert('Hata', 'Istasyonlar yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleStationSelect = (s: Station) => {
    setSelectedStation(s);
    setScreen('scan');
    scanLock.current = false;
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanLock.current) return;
    scanLock.current = true;
    playBeep();
    await processQR(data);
  };

  const handleManualSubmit = async () => {
    if (!manualQR.trim()) return;
    playClick();
    await processQR(manualQR.trim());
  };

  const processQR = async (qr: string) => {
    setScannedQR(qr);
    setProcessing(true);
    try {
      const info = await verifyTicket(qr);
      setTicketInfo(info);
      setScreen('confirm');
      playSuccess();
    } catch (e: any) {
      playError();
      Alert.alert('Gecersiz Bilet', e.message || 'QR kod dogrulanamadi');
      scanLock.current = false;
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedStation || !scannedQR) return;
    playClick();
    setProcessing(true);
    try {
      const result = await startWash(scannedQR, selectedStation.id);
      setActiveTicketId(result.ticket_id);
      setScreen('washing');
      playSuccess();
    } catch (e: any) {
      playError();
      Alert.alert('Hata', e.message || 'Yikama baslatilamadi');
    } finally {
      setProcessing(false);
    }
  };

  const handleModeSwitch = (mode: 'foam' | 'wash', action: 'on' | 'off') => {
    if (activeTicketId && selectedStation) {
      logModeSwitch(activeTicketId, selectedStation.id, mode, action).catch(() => {});
    }
  };

  const handleWashComplete = async () => {
    if (!selectedStation) return;
    try {
      await completeWash(selectedStation.id);
      playComplete();
    } catch {}
    setScreen('done');
    setTimeout(reset, 5000);
  };

  const reset = () => {
    setScreen('stations');
    setSelectedStation(null);
    setTicketInfo(null);
    setScannedQR('');
    setManualQR('');
    setActiveTicketId(null);
    scanLock.current = false;
    loadStations();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: K.bg }}>
        <PageHeader icon="📱" title="Kiosk" subtitle="QR oku ve yika" />
        <View style={styles.center}><ActivityIndicator size="large" color={K.accent} /></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: K.bg }}>
    <PageHeader icon="📱" title="Kiosk" subtitle="QR oku ve yika" />
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Station Selection */}
      {screen === 'stations' && (
        <View>
          <Text style={styles.heading}>Istasyon Secin</Text>
          <StationGrid stations={stations} selectedId={null} onSelect={handleStationSelect} />
        </View>
      )}

      {/* QR Scan */}
      {screen === 'scan' && (
        <View>
          <Text style={styles.heading}>QR Kod Okutun</Text>
          <Text style={styles.subtext}>{selectedStation?.name} secildi</Text>

          {Platform.OS === 'web' ? (
            <WebQRScanner
              onScan={(data) => {
                if (!scanLock.current) {
                  scanLock.current = true;
                  playBeep();
                  processQR(data);
                }
              }}
              processing={processing}
            />
          ) : permission?.granted ? (
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarCodeScanned}
              />
              {processing && (
                <View style={styles.cameraOverlay}>
                  <ActivityIndicator size="large" color={K.accent} />
                  <Text style={styles.overlayText}>Dogrulaniyor...</Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permText}>Kamera Izni Ver</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.orText}>veya manuel girin</Text>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.input}
              value={manualQR}
              onChangeText={setManualQR}
              placeholder="QR kodu yazin..."
              placeholderTextColor={K.textMuted}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
              <Text style={styles.submitText}>Dogrula</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => { playClick(); setScreen('stations'); }}>
            <Text style={styles.backText}>← Istasyon Secimi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation */}
      {screen === 'confirm' && ticketInfo && (
        <View style={styles.confirmContainer}>
          <Text style={styles.heading}>Yikama Onay</Text>

          <View style={styles.confirmCard}>
            <Text style={styles.confirmIcon}>{ticketInfo.icon}</Text>
            <Text style={styles.confirmProgram}>{ticketInfo.package_name}</Text>
            <Text style={styles.confirmPrice}>{ticketInfo.package_price} TL</Text>
            <Text style={styles.confirmDuration}>Sure: {Math.floor(ticketInfo.duration / 60)} dk</Text>
            <Text style={styles.confirmStation}>📍 {selectedStation?.name}</Text>
            <View style={styles.modeNote}>
              <Text style={styles.modeNoteText}>🧼 Kopuk ve 🚿 Yikama modlari arasinda serbestce gecis yapabilirsiniz</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleConfirm}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startText}>Yikamaya Basla</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => { playClick(); setScreen('scan'); scanLock.current = false; }}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Washing - Mode Selector */}
      {screen === 'washing' && ticketInfo && (
        <WashModeSelector
          totalSeconds={ticketInfo.duration}
          onModeSwitch={handleModeSwitch}
          onComplete={handleWashComplete}
          packageName={ticketInfo.package_name}
        />
      )}

      {/* Done */}
      {screen === 'done' && (
        <View style={styles.doneContainer}>
          <Text style={styles.doneIcon}>✅</Text>
          <Text style={styles.doneText}>Yikama Tamamlandi!</Text>
          <Text style={styles.doneHint}>Aracinizi alabilirsiniz</Text>
          <Text style={styles.autoReset}>5 saniye icinde sifirlanacak...</Text>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: K.bg },
  content: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: K.fontXl, fontWeight: '800', color: K.text, marginBottom: 12 },
  subtext: { fontSize: K.fontMd, color: K.accent, marginBottom: 20, fontWeight: '600' },
  cameraContainer: {
    height: 320, borderRadius: K.radius, overflow: 'hidden',
    marginBottom: 20, position: 'relative', borderWidth: 2, borderColor: K.accentBorder,
  },
  camera: { flex: 1 },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
  },
  overlayText: { color: K.accent, fontSize: K.fontMd, marginTop: 10, fontWeight: '600' },
  permBtn: {
    backgroundColor: K.accent, padding: 24, borderRadius: K.radiusSm,
    alignItems: 'center', marginBottom: 20, minHeight: 76,
  },
  permText: { color: '#fff', fontSize: K.fontMd, fontWeight: '700' },
  orText: { textAlign: 'center', color: K.textMuted, marginVertical: 16, fontSize: K.fontSm },
  manualRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  input: {
    flex: 1, backgroundColor: K.bgInput, borderRadius: K.radiusSm, padding: 18,
    fontSize: K.fontMd, borderWidth: 1, borderColor: K.border, color: K.text,
  },
  submitBtn: {
    backgroundColor: K.accent, borderRadius: K.radiusSm, paddingHorizontal: 28,
    justifyContent: 'center', minHeight: 68,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: K.fontMd },
  backBtn: { marginTop: 16, alignSelf: 'center' },
  backText: { fontSize: K.fontMd, color: K.textSecondary, fontWeight: '600' },
  confirmContainer: { alignItems: 'center' },
  confirmCard: {
    backgroundColor: K.bgCard, borderRadius: K.radius, padding: 28, alignItems: 'center',
    width: '100%', marginVertical: 24,
    borderWidth: 1, borderColor: K.border,
  },
  confirmIcon: { fontSize: 64, marginBottom: 16 },
  confirmProgram: { fontSize: K.fontLg, fontWeight: '800', color: K.text, marginBottom: 6 },
  confirmPrice: { fontSize: K.fontXl, fontWeight: '800', color: K.accent, marginBottom: 6 },
  confirmDuration: { fontSize: K.fontMd, color: K.textSecondary, marginBottom: 10 },
  confirmStation: { fontSize: K.fontMd, fontWeight: '700', color: K.text, marginBottom: 16 },
  modeNote: {
    backgroundColor: K.accentGlow, borderRadius: K.radiusSm, padding: 14, width: '100%',
    borderWidth: 1, borderColor: K.accentBorder,
  },
  modeNoteText: {
    fontSize: K.fontSm, color: K.accent, textAlign: 'center', lineHeight: 22,
  },
  startBtn: {
    backgroundColor: '#0d7a3e', paddingHorizontal: 40, paddingVertical: 24,
    borderRadius: K.radiusSm, width: '100%', alignItems: 'center', minHeight: 76,
  },
  startText: { color: '#fff', fontSize: K.fontLg, fontWeight: '800' },
  doneContainer: { alignItems: 'center', paddingTop: 48 },
  doneIcon: { fontSize: 90, marginBottom: 24 },
  doneText: { fontSize: 36, fontWeight: '800', color: K.green, marginBottom: 12 },
  doneHint: { fontSize: K.fontLg, color: K.textSecondary, marginBottom: 28 },
  autoReset: { fontSize: K.fontSm, color: K.textMuted },
});
